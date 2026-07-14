import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { MpesaService } from './mpesa.service';
import { OrdersService } from '../orders/orders.service';

/**
 * IMPORTANT: this endpoint is called by Safaricom's servers, not your frontend.
 * It cannot carry a JWT. Lock it down at the infra layer instead:
 *   - Put it behind an IP allowlist for Safaricom's published callback IP ranges, and/or
 *   - Put a long random path segment in MPESA_CALLBACK_URL (e.g. /mpesa/callback/<uuid>)
 *     so it can't be guessed, and/or
 *   - Rate-limit + log every hit to `mpesaRawCallback` on the order for audit purposes
 *     (already wired up in Order entity).
 */
@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(
    private mpesaService: MpesaService,
    private ordersService: OrdersService,
  ) {}

  @Post('callback')
  @HttpCode(200) // Safaricom expects a 200 no matter what, or it will retry the callback
  async handleCallback(@Body() body: any) {
    const parsed = this.mpesaService.parseCallback(body);
    this.logger.log(`Callback for ${parsed.checkoutRequestId}: success=${parsed.success}`);

    await this.ordersService.handlePaymentCallback(parsed, body);

    // Safaricom just wants an acknowledgement — it does not read this payload.
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }
}
