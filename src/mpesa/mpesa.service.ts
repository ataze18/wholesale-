import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Wraps Safaricom's Daraja API. Two things this replaces from the old frontend demo:
 *  1. The fake `setTimeout` STK push in state.tsx → a real POST to Safaricom.
 *  2. The fake "payment confirmed" → a real webhook Safaricom calls back with the result.
 *
 * Env vars required (sandbox first, then production shortcode once you're approved):
 *  MPESA_ENV                = "sandbox" | "production"
 *  MPESA_CONSUMER_KEY
 *  MPESA_CONSUMER_SECRET
 *  MPESA_SHORTCODE          (Paybill/Till number, or sandbox 174379)
 *  MPESA_PASSKEY
 *  MPESA_CALLBACK_URL       (public HTTPS URL Safaricom will POST to — needs ngrok in dev)
 */
@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);

  constructor(private config: ConfigService) {}

  private get baseUrl() {
    return this.config.get('MPESA_ENV') === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /** OAuth token — cache this in Redis for ~55 min in production instead of fetching per request. */
  private async getAccessToken(): Promise<string> {
    const key = this.config.get('MPESA_CONSUMER_KEY');
    const secret = this.config.get('MPESA_CONSUMER_SECRET');
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');

    const { data } = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` } },
    );
    return data.access_token;
  }

  private timestamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  /**
   * Initiates an STK Push ("Lipa na M-Pesa Online"). Returns the CheckoutRequestID —
   * save this on the order so the callback can be matched back to it.
   */
  async initiateStkPush(params: {
    phone: string;      // format: 2547XXXXXXXX (no leading 0 or +)
    amount: number;      // whole KES, no decimals
    orderId: string;     // used as AccountReference so it shows on the customer's statement
  }): Promise<{ checkoutRequestId: string; merchantRequestId: string }> {
    const shortcode = this.config.get('MPESA_SHORTCODE');
    const passkey = this.config.get('MPESA_PASSKEY');
    const ts = this.timestamp();
    const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString('base64');
    const token = await this.getAccessToken();

    const { data } = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: ts,
        TransactionType: 'CustomerPayBillOnline',
        Amount: params.amount,
        PartyA: params.phone,
        PartyB: shortcode,
        PhoneNumber: params.phone,
        CallBackURL: this.config.get('MPESA_CALLBACK_URL'),
        AccountReference: params.orderId,
        TransactionDesc: `BulkFlow order ${params.orderId}`,
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    this.logger.log(`STK push sent for ${params.orderId}: ${data.CheckoutRequestID}`);
    return {
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
    };
  }

  /**
   * Parses Safaricom's callback body into a flat, easy-to-use shape.
   * Raw shape (success case):
   * { Body: { stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode: 0, ResultDesc,
   *   CallbackMetadata: { Item: [ {Name:"Amount",Value}, {Name:"MpesaReceiptNumber",Value}, ... ] } } } }
   * ResultCode !== 0 means the user cancelled or the push timed out — treat as failed payment.
   */
  parseCallback(body: any): {
    checkoutRequestId: string;
    success: boolean;
    resultDesc: string;
    amount?: number;
    mpesaReceiptNumber?: string;
    phoneNumber?: string;
  } {
    const cb = body?.Body?.stkCallback;
    const success = cb?.ResultCode === 0;
    const items: any[] = cb?.CallbackMetadata?.Item ?? [];
    const find = (name: string) => items.find((i) => i.Name === name)?.Value;

    return {
      checkoutRequestId: cb?.CheckoutRequestID,
      success,
      resultDesc: cb?.ResultDesc,
      amount: find('Amount'),
      mpesaReceiptNumber: find('MpesaReceiptNumber'),
      phoneNumber: find('PhoneNumber'),
    };
  }
}
