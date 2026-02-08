# Cryptex Web App

Next.js App Router frontend for Cryptex Miner.

## Run
```bash
npm run dev
```

## Build
```bash
npm run build
npx serve out
```

## Key routes
- `/` landing + payment checkout
- `/install` gated installer access
- `/app/mining`
- `/app/markets`
- `/app/wallet`
- `/app/settings`

## PayPal integration
Set:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `NEXT_PUBLIC_PAYPAL_GATEWAY_BASE`
- `NEXT_PUBLIC_PAYPAL_PRICE_AMOUNT`
- `NEXT_PUBLIC_PAYPAL_PRICE_CURRENCY`

`NEXT_PUBLIC_PAYPAL_GATEWAY_BASE` must point to the PayPal gateway service that uses server-side credentials.
