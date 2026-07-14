import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany,
  ManyToOne, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Wholesaler } from '../../wholesalers/entities/wholesaler.entity';
import { Rider } from '../../riders/entities/rider.entity';

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',   // STK push sent, awaiting Daraja callback
  ESCROW_PAID = 'escrow_paid',           // M-Pesa confirmed, held in escrow
  PREPARING = 'preparing',               // wholesaler accepted, staging goods
  RIDER_ASSIGNED = 'rider_assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  ARRIVED = 'arrived',                   // rider at drop-off, awaiting OTP
  COMPLETED = 'completed',               // OTP verified, escrow released
  CANCELLED = 'cancelled',
  FAILED_PAYMENT = 'failed_payment',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column('uuid')
  buyerId: string;

  @Column()
  buyerPhone: string; // MSISDN used for the STK push, e.g. 2547XXXXXXXX

  @ManyToOne(() => Wholesaler, { eager: false })
  wholesaler: Wholesaler;

  @Column('uuid')
  wholesalerId: string;

  @ManyToOne(() => Rider, { eager: false, nullable: true })
  rider: Rider | null;

  @Column('uuid', { nullable: true })
  riderId: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column('int') subtotal: number;      // KES, minor-unit-free (Daraja works in whole KES)
  @Column('int') tax: number;           // 16% VAT
  @Column('int') deliveryFee: number;
  @Column('int') platformCommission: number; // 6% of subtotal
  @Column('int') total: number;

  // Escrow release
  @Index()
  @Column({ length: 4 })
  otpCode: string;

  @Column({ type: 'timestamptz', nullable: true })
  otpVerifiedAt: Date | null;

  // M-Pesa / Daraja linkage
  @Index()
  @Column({ nullable: true })
  mpesaCheckoutRequestId: string | null; // returned by STK push, used to match the callback

  @Column({ nullable: true })
  mpesaReceiptNumber: string | null; // e.g. "QTX817077Y", from a successful callback

  @Column({ type: 'jsonb', nullable: true })
  mpesaRawCallback: Record<string, unknown> | null; // audit trail — store what Safaricom sent

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
