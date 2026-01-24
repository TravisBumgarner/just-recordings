# Just Recordings

A screen recording application with web and desktop clients.

## Prerequisites

- Node.js 22.x
- Docker (for local PostgreSQL database)
- Heroku CLI (for deployment)

## Project Structure

```
packages/
  api/        # Express API server
  desktop/    # Electron desktop app
  recorder/   # Recording and upload library
  shared/     # Shared types and utilities
  web/        # React web frontend
```

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env` files in the required packages:

**packages/api/.env**
```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/just_recordings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
```

**packages/web/.env**
```
VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
VITE_PUBLIC_ENVIRONMENT=development
```

### 3. Start the database

```bash
npm run db:up
```

### 4. Push the database schema

```bash
npm run db:push
```

### 5. Start development

```bash
# Web app + API
npm run dev:web

# Desktop app + API
npm run dev:desktop

# All apps
npm run dev:all
```

## Scripts

### Development

| Script | Description |
|--------|-------------|
| `npm run dev:web` | Start API and web app |
| `npm run dev:desktop` | Start API and desktop app |
| `npm run dev:all` | Start API, web, and desktop apps |

### Database

| Script | Description |
|--------|-------------|
| `npm run db:up` | Start local PostgreSQL via Docker |
| `npm run db:down` | Stop local PostgreSQL |
| `npm run db:push` | Push schema changes to database |

### Build

| Script | Description |
|--------|-------------|
| `npm run build` | Build all packages |
| `npm run build:desktop` | Build web and desktop for Electron |
| `npm run build:heroku` | Build for Heroku deployment |

### Testing

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |

### Linting & Formatting

| Script | Description |
|--------|-------------|
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Fix lint issues |
| `npm run format` | Check formatting |
| `npm run format:fix` | Fix formatting issues |

### Deployment

| Script | Description |
|--------|-------------|
| `npm run deploy:heroku:main` | Deploy main branch to Heroku |
| `npm run deploy:heroku:branch` | Deploy current branch to Heroku |

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Heroku deployment instructions.
