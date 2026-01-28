# @just-recordings/chrome-extension

Chrome extension for Just Recordings. Built as a **thin shell** that consumes `packages/web/` as its UI source — the same pattern used by `packages/desktop/`.

## Architecture

This package contains only Chrome-extension-specific plumbing:

- `manifest.json` — Manifest V3 config (permissions, popup action, icons)
- `popup.html` — entry HTML loaded by Chrome
- `src/main.tsx` — renders `WrappedApp` from web with `MemoryRouter`
- `vite.config.ts` — builds popup entry, copies manifest + icons to dist/

All UI code lives in `packages/web/src/`. The Vite `@/` alias points to `../web/src/`, so imports like `@/App` resolve to the web package. Chrome-specific pages (`Home.Chrome.tsx`, `LandingPage.Chrome.tsx`) also live in web and are routed via `isChromeExtensionCheck()`.

## Getting Started

1. Run an initial build: `npm run build:chrome`
2. Open `chrome://extensions`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select `packages/chrome-extension/dist/`
6. Click the extension icon in the toolbar to open the popup

## Development

```sh
# From repo root
npm run dev:chrome
```

This runs `vite build --watch`, rebuilding on file changes. After each rebuild, go to `chrome://extensions` and click the reload button on the unpacked extension.

## Production Build

```sh
# From repo root
npm run build:chrome
```

Output goes to `packages/chrome-extension/dist/` containing manifest.json, popup.html, JS bundle, and icons.

## Environment Variables

Create `packages/chrome-extension/.env`:

```
VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
VITE_PUBLIC_ENVIRONMENT=development
VITE_API_URL=http://localhost:3001/api
```

Note: `VITE_API_URL` must be a full URL (not `/api`) since the extension popup doesn't share the web app's origin.
