# Chrome Extension Recording Prototype

Throwaway prototype to validate that `@just-recordings/recorder` works in a Chrome extension context.

## Setup

```bash
cd explorations/chrome-extension
npm install
npm run build
```

## Load in Chrome

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `dist/` folder

## Usage

1. Click the extension icon in Chrome toolbar
2. Click **Start Recording** and select a screen/window to share
3. Click **Stop** when done - recording downloads automatically

## Development

Watch mode for automatic rebuilds:

```bash
npm run dev
```

After rebuilding, click the refresh icon on the extension card in `chrome://extensions`.

## Key Finding

The `@just-recordings/recorder` package works 100% unchanged in the extension context. No platform-specific conditionals needed.
