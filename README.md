# Cryptex Monorepo

## Structure
- `apps/web`: Next.js web app (marketing, install page, mining simulation, markets, wallet)
- `apps/desktop`: Tauri desktop app (bundles local web assets)

## Web Commands
- `npm run dev:web`
- `npm run lint:web`
- `npm run build:web`

`apps/web` uses static export (`out/`). Serve exported assets with:
```bash
cd apps/web
npx serve out
```

## Desktop Commands
- `npm run dev:desktop`
- `npm run build:desktop`

Windows bundles are generated under:
- `apps/desktop/src-tauri/target/release/bundle/nsis`
- `apps/desktop/src-tauri/target/release/bundle/msi`

## Installer Downloads (web)
Desktop download links are served from:
- `/downloads/Cryptex-Installer-Windows.exe`
- `/downloads/Cryptex-Installer-Windows.msi`
- `/downloads/Cryptex-Installer-macOS.dmg`
