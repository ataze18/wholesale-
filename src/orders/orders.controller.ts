import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OrderStatus } from './entities/order.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { CurrentUser } from '../auth/current-user.decorator';

@Controller('orders')
// @UseGuards(JwtAuthGuard) // wire up once auth module lands — every route below assumes a logged-in user
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto /*, @CurrentUser() user */) {
    const buyerId = 'REPLACE_WITH_AUTHENTICATED_USER_ID';
    return this.ordersService.createOrder(buyerId, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: OrderStatus; riderId?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.riderId);
  }

  @Post(':id/verify-otp')
  verifyOtp(@Param('id') id: string, @Body() dto: VerifyOtpDto) {
    return this.ordersService.verifyOtpAndRelease(id, dto.otp);
  }
}
