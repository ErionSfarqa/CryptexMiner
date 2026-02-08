# Cryptex Monorepo

## Structure
- `apps/web`: Next.js web app (landing, payment gate, install flow, mining, markets, wallet)
- `apps/desktop`: Tauri desktop app (bundles local web assets)
- `services/paypal-gateway`: PayPal REST gateway for secure order create/capture + gated downloads

## Web Commands
- `npm run dev:web`
- `npm run lint:web`
- `npm run build:web`

`apps/web` uses static export (`out/`). Serve exported assets with:
```bash
cd apps/web
npx serve out
```

## PayPal Gateway
Run:
```bash
npm run start:paypal-gateway
```

Required environment variables:
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_GATEWAY_TOKEN_SECRET`

Optional:
- `PAYPAL_API_BASE` (`https://api-m.sandbox.paypal.com` by default)
- `PAYPAL_PRICE_AMOUNT` (default `25.00`)
- `PAYPAL_PRICE_CURRENCY` (default `EUR`)
- `PAYPAL_WINDOWS_INSTALLER_PATH`
- `PAYPAL_MACOS_INSTALLER_PATH`

Frontend environment:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `NEXT_PUBLIC_PAYPAL_GATEWAY_BASE` (for example `http://localhost:8787`)
- `NEXT_PUBLIC_PAYPAL_PRICE_AMOUNT`
- `NEXT_PUBLIC_PAYPAL_PRICE_CURRENCY`

## Desktop Commands
- `npm run dev:desktop`
- `npm run build:desktop`

Windows bundles are generated under:
- `apps/desktop/src-tauri/target/release/bundle/nsis`
- `apps/desktop/src-tauri/target/release/bundle/msi`
