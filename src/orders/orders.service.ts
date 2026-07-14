import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Wholesaler } from '../wholesalers/entities/wholesaler.entity';
import { Rider, RiderStatus } from '../riders/entities/rider.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { MpesaService } from '../mpesa/mpesa.service';
import { OrdersGateway } from './orders.gateway';

const VAT_RATE = 0.16;
const DELIVERY_FEE = 350;
const COMMISSION_RATE = 0.06;

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    private dataSource: DataSource,
    private mpesaService: MpesaService,
    private ordersGateway: OrdersGateway,
  ) {}

  async createOrder(buyerId: string, dto: CreateOrderDto): Promise<Order> {
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.productRepo.findByIds(productIds);
    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products no longer exist.');
    }

    const items = dto.items.map((i) => {
      const product = products.find((p) => p.id === i.productId)!;
      if (product.stock < i.quantity) {
        throw new BadRequestException(`${product.name} only has ${product.stock} in stock.`);
      }
      return { product, productId: product.id, quantity: i.quantity, unitPriceAtOrder: product.price };
    });

    const subtotal = items.reduce((sum, i) => sum + i.unitPriceAtOrder * i.quantity, 0);
    const tax = Math.round(subtotal * VAT_RATE);
    const platformCommission = Math.round(subtotal * COMMISSION_RATE);
    const total = subtotal + tax + DELIVERY_FEE;
    const otpCode = String(Math.floor(1000 + Math.random() * 9000));

    let order = this.orderRepo.create({
      status: OrderStatus.PENDING_PAYMENT,
      buyerId,
      buyerPhone: dto.buyerPhone,
      wholesalerId: dto.wholesalerId,
      items: items as any,
      subtotal,
      tax,
      deliveryFee: DELIVERY_FEE,
      platformCommission,
      total,
      otpCode,
    });
    order = await this.orderRepo.save(order);

    // Kick off the real STK push. If Safaricom itself rejects the request (bad number,
    // shortcode misconfigured), fail the order immediately rather than leaving it stuck.
    try {
      const stk = await this.mpesaService.initiateStkPush({
        phone: dto.buyerPhone.replace('+', ''),
        amount: total,
        orderId: order.id,
      });
      order.mpesaCheckoutRequestId = stk.checkoutRequestId;
      await this.orderRepo.save(order);
    } catch (err) {
      order.status = OrderStatus.FAILED_PAYMENT;
      await this.orderRepo.save(order);
      throw new BadRequestException('Could not reach M-Pesa. Please try again.');
    }

    this.ordersGateway.emitToWholesaler(order.wholesalerId, 'order:pending', order);
    return order;
  }

  /** Called by MpesaController once Safaricom posts the callback. */
  async handlePaymentCallback(
    parsed: { checkoutRequestId: string; success: boolean; mpesaReceiptNumber?: string },
    rawBody: unknown,
  ) {
    const order = await this.orderRepo.findOne({
      where: { mpesaCheckoutRequestId: parsed.checkoutRequestId },
    });
    if (!order) return; // unknown checkout id — log and ignore, don't throw at Safaricom

    order.mpesaRawCallback = rawBody as Record<string, unknown>;

    if (!parsed.success) {
      order.status = OrderStatus.FAILED_PAYMENT;
      await this.orderRepo.save(order);
      this.ordersGateway.emitToBuyer(order.buyerId, 'order:payment_failed', order);
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      order.status = OrderStatus.ESCROW_PAID;
      order.mpesaReceiptNumber = parsed.mpesaReceiptNumber ?? null;
      await manager.save(order);

      await manager.increment(
        Wholesaler,
        { id: order.wholesalerId },
        'balanceEscrow',
        order.total - order.platformCommission,
      );
    });

    this.ordersGateway.emitToWholesaler(order.wholesalerId, 'order:escrow_paid', order);
    this.ordersGateway.emitToBuyer(order.buyerId, 'order:escrow_paid', order);
  }

  async updateStatus(orderId: string, status: OrderStatus, riderId?: string): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found.');

    if (status === OrderStatus.RIDER_ASSIGNED && riderId) {
      order.riderId = riderId;
    }
    order.status = status;
    await this.orderRepo.save(order);

    const room = `order:${order.id}`;
    this.ordersGateway.emitToRoom(room, 'order:status', { orderId, status, riderId });
    this.ordersGateway.emitToBuyer(order.buyerId, 'order:status', { orderId, status });
    return order;
  }

  /** The money-moving step. Everything here happens in one DB transaction, or none of it does. */
  async verifyOtpAndRelease(orderId: string, otp: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const order = await manager.findOne(Order, { where: { id: orderId }, lock: { mode: 'pessimistic_write' } });
      if (!order) throw new NotFoundException('Order not found.');
      if (order.status === OrderStatus.COMPLETED) {
        throw new BadRequestException('Order already completed.');
      }
      if (order.otpCode !== otp) {
        throw new BadRequestException('Incorrect release code.');
      }

      const payout = order.total - order.platformCommission;
      order.status = OrderStatus.COMPLETED;
      order.otpVerifiedAt = new Date();
      await manager.save(order);

      await manager.decrement(Wholesaler, { id: order.wholesalerId }, 'balanceEscrow', payout);
      await manager.increment(Wholesaler, { id: order.wholesalerId }, 'balanceReleased', payout);

      if (order.riderId) {
        await manager.increment(Rider, { id: order.riderId }, 'earningsToday', order.deliveryFee);
        await manager.increment(Rider, { id: order.riderId }, 'completedTrips', 1);
        await manager.update(Rider, { id: order.riderId }, { status: RiderStatus.AVAILABLE });
      }

      this.ordersGateway.emitToWholesaler(order.wholesalerId, 'order:completed', order);
      this.ordersGateway.emitToBuyer(order.buyerId, 'order:completed', order);
      return order;
    });
  }
}
