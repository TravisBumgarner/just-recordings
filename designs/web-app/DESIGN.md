# Web App Design

## Overview

A React web application for video/screen recording, built with TypeScript, Material UI, and Vite. Connected to an Express backend API.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material UI (MUI) v5** - Component library
- **React Router** - Client-side routing

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type safety
- **Node.js** - Runtime

## Project Structure

```
just-recordings/
├── packages/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   ├── pages/       # Page components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── services/    # API client services
│   │   │   ├── types/       # TypeScript types
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── routes/      # API route handlers
│       │   ├── middleware/  # Express middleware
│       │   ├── types/       # TypeScript types
│       │   └── index.ts     # Entry point
│       ├── tsconfig.json
│       └── package.json
│
├── package.json             # Root package.json (workspace)
└── tsconfig.base.json       # Shared TypeScript config
```

## Monorepo Setup

Using npm workspaces for managing packages:
- `packages/web` - Frontend React app
- `packages/api` - Backend Express server

## Frontend Details

### Entry Point
- `main.tsx` - React DOM render with MUI ThemeProvider
- `App.tsx` - Root component with routing

### Theme
- Use MUI's default theme initially
- Set up ThemeProvider for future customization

### Initial Pages
- Home page (`/`) - Landing page with basic layout

### API Integration
- Create an API service module using fetch
- Base URL configurable via environment variables

## Backend Details

### API Structure
- RESTful API design
- JSON request/response format
- CORS enabled for frontend development

### Initial Endpoints
- `GET /api/health` - Health check endpoint

### Development
- Use `tsx` for TypeScript execution in development
- Nodemon or tsx watch mode for auto-reload

## Development Workflow

### Scripts
- `npm run dev` - Start both frontend and backend in development
- `npm run dev:web` - Start frontend only
- `npm run dev:api` - Start backend only
- `npm run build` - Build both packages
- `npm run test` - Run all tests

### Environment Variables
- Frontend: `VITE_API_URL` - Backend API URL
- Backend: `PORT` - Server port (default: 3001)

## Future Considerations

This web app will eventually:
1. Import and use a shared video/screen recorder module
2. Share components/logic with an Electron app

The architecture should support easy extraction of shared code.
