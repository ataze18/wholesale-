# BulkFlow — Orders & M-Pesa Scaffold

This is the backend slice that turns the live demo (`bulkflow-live-demo.html`) into
something running on real infrastructure. Drop these files into your existing NestJS
project under `src/`, matching the folder names.

## What's here

```
src/
  orders/
    entities/order.entity.ts       — the order + escrow state machine
    entities/order-item.entity.ts
    dto/create-order.dto.ts
    dto/verify-otp.dto.ts
    orders.service.ts              — createOrder, handlePaymentCallback, updateStatus, verifyOtpAndRelease
    orders.controller.ts           — POST /orders, PATCH /orders/:id/status, POST /orders/:id/verify-otp
    orders.gateway.ts              — Socket.IO rooms per buyer/wholesaler/rider + per-order
    orders.module.ts
  products/entities/product.entity.ts
  wholesalers/entities/wholesaler.entity.ts
  riders/entities/rider.entity.ts
  mpesa/
    mpesa.service.ts               — Daraja OAuth, STK push, callback parsing
    mpesa.controller.ts            — POST /mpesa/callback (Safaricom's webhook)
    mpesa.module.ts
```

Not included yet, intentionally, so this stays reviewable: the **auth module**
(JWT login per role) and the **users entity**. `OrdersController` has a placeholder
(`REPLACE_WITH_AUTHENTICATED_USER_ID`) marking exactly where that plugs in.

## Install

```bash
npm install @nestjs/typeorm typeorm pg @nestjs/websockets @nestjs/platform-socket.io socket.io class-validator class-transformer axios @nestjs/config
```

## Environment variables (`.env`)

```
DATABASE_URL=postgres://user:pass@localhost:5432/bulkflow

MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379          # Daraja sandbox till number — swap for your real Paybill later
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://<your-ngrok-or-prod-domain>/mpesa/callback
```

Get sandbox credentials at https://developer.safaricom.co.ke — register an app, request
the "Lipa na M-Pesa Sandbox" product, and you'll get a consumer key/secret and passkey
immediately. Going live later means swapping `MPESA_ENV` to `production` and using your
real Paybill/Till shortcode once Safaricom approves your go-live application.

**Local testing note:** Safaricom's servers must be able to reach `MPESA_CALLBACK_URL`
over the public internet — `localhost` won't work. Use `ngrok http 3000` while developing
and put the ngrok HTTPS URL in `.env`.

## How this maps to the frontend demo

| Demo action | Real endpoint |
|---|---|
| Buyer clicks "Pay with M-Pesa" | `POST /orders` → `OrdersService.createOrder` → `MpesaService.initiateStkPush` |
| "STK push confirmed" | Safaricom calls `POST /mpesa/callback` → `OrdersService.handlePaymentCallback` → escrow credited, Socket.IO event fired |
| Wholesaler "Accept order" / "Assign rider" | `PATCH /orders/:id/status` |
| Rider "Accept job" → "Picked up" → "In transit" → "Arrived" | same `PATCH /orders/:id/status`, different `status` values |
| Rider enters OTP, "Verify & release escrow" | `POST /orders/:id/verify-otp` → `OrdersService.verifyOtpAndRelease` (one DB transaction: escrow debited, wholesaler released balance credited, rider earnings credited) |

## Wiring the frontend

Replace the `useState`-based `state.tsx` context with:
1. REST calls (`fetch`/axios) to the endpoints above for actions.
2. A Socket.IO client connected to the `orders` namespace:
   ```ts
   const socket = io(`${API_URL}/orders`, { query: { role: 'buyer', id: buyerId } });
   socket.on('order:escrow_paid', (order) => { /* update UI */ });
   socket.on('order:status', ({ status }) => { /* update UI */ });
   ```

## Next module to build after this

`auth` — JWT login/register per role (buyer/wholesaler/rider/admin), so
`REPLACE_WITH_AUTHENTICATED_USER_ID` becomes a real guarded `@CurrentUser()`.
Happy to scaffold that next if useful.
