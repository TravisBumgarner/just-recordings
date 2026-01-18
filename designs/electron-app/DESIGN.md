# Electron App Design

## Overview

A desktop Electron application for video/screen recording, built with React, TypeScript, Material UI, and Vite. Connects to the same Express backend API as the web app.

## Tech Stack

### Desktop App
- **Electron** - Desktop application framework
- **React 18** - UI framework (renderer process)
- **TypeScript** - Type safety
- **Vite** - Build tool (via electron-vite)
- **Material UI (MUI) v5** - Component library
- **React Router** - Client-side routing

### Build Tools
- **electron-vite** - Vite-based build tool for Electron
- **electron-builder** - Application packaging (future)

## Project Structure

```
just-recordings/
├── packages/
│   ├── web/                    # Existing React web app
│   ├── api/                    # Existing Express backend
│   │
│   └── desktop/                # New Electron app
│       ├── src/
│       │   ├── main/           # Electron main process
│       │   │   └── index.ts    # Main entry point
│       │   ├── preload/        # Preload scripts
│       │   │   └── index.ts    # IPC bridge
│       │   └── renderer/       # React app (renderer process)
│       │       ├── src/
│       │       │   ├── components/
│       │       │   ├── pages/
│       │       │   ├── services/
│       │       │   ├── types/
│       │       │   ├── App.tsx
│       │       │   └── main.tsx
│       │       └── index.html
│       ├── electron.vite.config.ts
│       ├── tsconfig.json
│       ├── tsconfig.node.json
│       └── package.json
```

## Electron Architecture

### Main Process (`src/main/index.ts`)
- Creates BrowserWindow
- Handles app lifecycle (ready, window-all-closed, activate)
- Manages IPC communication
- Configures window properties (size, preload script)

### Preload Script (`src/preload/index.ts`)
- Exposes safe APIs to renderer via contextBridge
- Provides electron API access (versions, platform info)
- Future: IPC handlers for native features

### Renderer Process (`src/renderer/`)
- React application (similar to web app)
- Material UI components
- API service layer connecting to Express backend

## API Integration

The Electron app connects to the Express backend the same way as the web app:
- Uses fetch API in renderer process
- Base URL configurable via environment variable
- Shares API types with web app (future consideration)

### Environment Configuration
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3001`)

## Development Workflow

### Scripts
- `npm run dev -w @just-recordings/desktop` - Start Electron in dev mode
- `npm run build -w @just-recordings/desktop` - Build Electron app
- `npm run test -w @just-recordings/desktop` - Run tests

### Development Mode
- electron-vite provides hot reload for renderer process
- Main process restarts on changes
- Connects to local Express backend on port 3001

## Initial Features

### Home Page
- Basic landing page with MUI layout
- Health check display (calls backend `/api/health`)
- Shows Electron version info

### Window Configuration
- Default size: 1200x800
- Minimum size: 800x600
- DevTools enabled in development

## Testing Strategy

- **Unit Tests**: Vitest for renderer React components
- **Main Process**: Minimal testing initially (configuration only)

## Future Considerations

1. **Shared Code**: Extract common React components/services to a shared package
2. **Native Features**: Screen recording, system tray, notifications
3. **Packaging**: electron-builder for distributing installers
4. **Auto-updates**: electron-updater for automatic updates
