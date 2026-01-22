# Desktop-Web Integration: Load Web App in Electron

## Overview

Pivot the desktop app to load the web app directly in its BrowserWindow, eliminating duplicate UI code while preserving Electron-specific functionality (tray, IPC, screen capture).

## Current State

### Desktop App (`packages/desktop`)
- Electron main process with tray icon, IPC, screen capture handler
- Separate React renderer with its own pages, services, stores
- Preload script exposes `window.api.setRecordingState()`

### Web App (`packages/web`)
- Full React SPA with all features
- Runs on Vite dev server (localhost:5173)
- Builds to static files

### Problem
- Duplicate UI code between desktop and web
- Desktop has limited features compared to web
- Maintaining two separate UIs is inefficient

## Proposed Solution

### Architecture

**Development:**
- Desktop's BrowserWindow loads `http://localhost:5173` (web's Vite dev server)
- Web dev server must be running alongside Electron

**Production:**
- Web app builds to static files (`packages/web/dist/`)
- Desktop copies/bundles these files and loads them via `file://` protocol
- Or: Desktop loads from `index.html` in its own output directory

```
packages/
├── web/
│   ├── src/           # Web app source
│   └── dist/          # Built output (production)
│
└── desktop/
    └── src/
        ├── main/      # KEEP: Electron main process
        ├── preload/   # KEEP: IPC bridge (already has setRecordingState)
        └── renderer/  # REMOVE: No longer needed
```

### Key Changes

#### 1. Web App: Electron Detection & IPC
- Detect if `window.api` exists (indicates Electron environment)
- Call `window.api.setRecordingState(true/false)` when recording starts/stops
- Optionally adjust UI (hide footer, compact header) when in Electron

#### 2. Desktop Main Process Updates
- **Dev mode:** Load `http://localhost:5173` instead of `ELECTRON_RENDERER_URL`
- **Prod mode:** Load web app's built files (bundled into Electron output)
- Keep existing tray, IPC, and screen capture functionality

#### 3. Desktop Renderer Removal
- Delete `packages/desktop/src/renderer/` directory entirely
- Desktop no longer has its own React code
- Update electron-vite config to skip renderer build (or just build web app)

#### 4. Build Process
- Web app: `vite build` produces `dist/`
- Desktop: Copy web's `dist/` into Electron's output, or configure electron-builder to include it

### Electron Detection in Web App

```typescript
// Check if running in Electron
const isElectron = typeof window !== 'undefined' &&
  typeof window.api !== 'undefined'

// Use in recording logic
function onRecordingStart() {
  if (window.api?.setRecordingState) {
    window.api.setRecordingState(true)
  }
}

function onRecordingStop() {
  if (window.api?.setRecordingState) {
    window.api.setRecordingState(false)
  }
}
```

### TypeScript Declaration

Add to web app for type safety:

```typescript
// src/types/electron.d.ts
declare global {
  interface Window {
    api?: {
      setRecordingState: (isRecording: boolean) => void
      getVersions: () => { electron: string; chrome: string; node: string }
    }
  }
}
```

### Desktop Main Process Changes

```typescript
// In createWindow()
if (is.dev) {
  // Load web app dev server
  mainWindow.loadURL('http://localhost:5173')
} else {
  // Load bundled web app
  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}
```

### Build Configuration

Option A: Copy web build into desktop output
- After `npm run build -w @just-recordings/web`
- Copy `packages/web/dist/*` to `packages/desktop/out/renderer/`

Option B: electron-builder extraFiles
- Configure electron-builder to include web's dist folder
- Reference it in loadFile path

### UI Considerations

The web app has Header and Footer designed for full browser. For desktop's 400x500 menu bar form factor:

Option 1: Conditional rendering based on `isElectron`
Option 2: CSS media queries for small viewport
Option 3: Accept that desktop will have scrollable UI initially

## Implementation Tasks

### Phase 1: Web App Electron Support
1. Add TypeScript declarations for `window.api`
2. Add Electron detection utility
3. Wire up `setRecordingState` calls in recording logic

### Phase 2: Desktop Simplification
1. Update main process to load web app URL/files
2. Remove renderer source code
3. Update build configuration

### Phase 3: Polish
1. Adjust window size if needed
2. Optional: Conditional Header/Footer for Electron
3. Test all features

## Out of Scope

- Changes to core web app functionality
- Native desktop features beyond current scope

## Migration Notes

### Obsolete Tasks
Tasks 11 and 12 from `desktop-auth-and-backend-guards/SCOPES.yml` are superseded.

### Development Workflow
Must run both:
- `npm run dev:web` (Vite dev server on :5173)
- `npm run dev:desktop` (Electron app)
