# Cryptex Miner

Installable Next.js PWA with:
- conversion-focused marketing landing page
- simulation-only mining console (no real hashing)
- live Binance markets (real API data only)
- wallet valuation from mined balances and live Binance prices

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Zustand
- React Query
- Custom service worker + Web App Manifest

## Run locally
```bash
npm install
npm run dev
```

Production check:
```bash
npm run build
npm start
```

## Key routes
- `/` marketing landing
- `/install` install launcher (iOS/Android/macOS/Windows)
- `/app/mining` mining simulator
- `/app/markets` markets dashboard
- `/app/wallet` wallet + watch-only addresses
- `/app/settings` preferences and reset

## Installability notes
- Manifest: `public/manifest.webmanifest`
- Service worker: `public/sw.js` (registered in production)
- Start URL: `/app/mining`
- Mining route responds with HTTP 200 in browser tabs

## Safety model
- Mining is a simulation only.
- No private keys or seed phrases are generated.
- Wallet addresses are watch-only and stored locally.
- Market data is Binance public API only; stale/unavailable states are clearly surfaced.


