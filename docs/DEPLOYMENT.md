# Heroku Deployment Guide

This guide covers deploying Just Recordings to Heroku.

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- A Heroku account
- A Supabase project (for authentication)

## Initial Setup

### 1. Create the Heroku App

```bash
heroku create just-recordings
```

### 2. Add PostgreSQL Addon

The app requires PostgreSQL for data storage. Add the Heroku Postgres addon:

```bash
heroku addons:create heroku-postgresql:essential-0
```

This automatically sets the `DATABASE_URL` environment variable.

### 3. Add Cloudinary Addon

The app uses Cloudinary for video storage. Add the Cloudinary addon:

```bash
heroku addons:create cloudinary:starter
```

This automatically sets the `CLOUDINARY_URL` environment variable, which includes the cloud name, API key, and API secret.

### 4. Connect Your Repository

If using GitHub deployment:

```bash
# In the Heroku dashboard, connect to your GitHub repository
# Or use the Heroku Git remote:
heroku git:remote -a just-recordings
```

## Environment Variables

### Auto-configured by Heroku Addons

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (set by Heroku Postgres addon) |
| `CLOUDINARY_URL` | Cloudinary connection URL (set by Cloudinary addon) |
| `PORT` | Port for the web dyno (set by Heroku) |

### Required - Must Be Set Manually

#### API (Server-side)

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NODE_ENV` | Set to `production` | Set manually |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side) | Supabase Dashboard > Settings > API |

#### Frontend (Build-time)

These are embedded in the frontend bundle during build, so you must set them before deploying.

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `VITE_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `VITE_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Settings > API |
| `VITE_PUBLIC_ENVIRONMENT` | Set to `production` | Set manually |

### Setting Environment Variables

Via CLI:

```bash
# API variables
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Frontend build-time variables
heroku config:set VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
heroku config:set VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
heroku config:set VITE_PUBLIC_ENVIRONMENT=production
```

Via Dashboard:

1. Go to your app in Heroku Dashboard
2. Navigate to Settings > Config Vars
3. Click "Reveal Config Vars"
4. Add each variable

## Database Migrations

After deploying, run database migrations locally against the Heroku database:

```bash
DATABASE_URL="$(heroku config:get DATABASE_URL)?sslmode=no-verify" npm run db:push -w @just-recordings/api
```

This uses Drizzle Kit to push the schema to your Heroku Postgres database. The migration runs locally because `drizzle-kit` is a dev dependency not installed on Heroku. The `sslmode=no-verify` is required because Heroku Postgres uses self-signed SSL certificates.

## Deployment

### Deploy from GitHub

1. In Heroku Dashboard, go to Deploy tab
2. Connect to your GitHub repository
3. Enable automatic deploys from your main branch, or click "Deploy Branch" for manual deployment

### Deploy via Git

```bash
git push heroku main
```

### What Happens During Deployment

1. Heroku detects the Node.js app and installs dependencies
2. The `heroku-postbuild` script runs, which:
   - Builds the shared package
   - Builds the web frontend
   - Builds the API server
3. The web dyno starts using the command in `Procfile`: `node packages/api/dist/index.js`

## Cloudinary Configuration

### Cloudinary Addon

Cloudinary is provisioned as a Heroku addon (see Initial Setup step 3). The addon automatically sets `CLOUDINARY_URL` which the API parses for credentials.

To view your Cloudinary dashboard:

```bash
heroku addons:open cloudinary
```

### Cloudinary Usage

- Videos are uploaded directly from the browser to Cloudinary
- The API generates signed upload URLs for security
- Thumbnails are generated using Cloudinary transformations
- Videos are tagged with `env:production` or `env:development` for organization

## Troubleshooting

### App Crashes on Startup

Check the logs:

```bash
heroku logs --tail
```

Common issues:
- Missing environment variables - ensure all required vars are set
- Database connection issues - verify `DATABASE_URL` is set correctly

### Database Connection Errors

```bash
# Verify DATABASE_URL is set
heroku config:get DATABASE_URL

# Test database connection
heroku pg:psql
```

### Build Failures

```bash
# View build logs
heroku builds:info

# Rebuild
heroku builds:cancel  # if stuck
git commit --allow-empty -m "Trigger rebuild"
git push heroku main
```

### Cloudinary Upload Failures

```bash
# Verify CLOUDINARY_URL is set
heroku config:get CLOUDINARY_URL

# Open Cloudinary dashboard
heroku addons:open cloudinary
```

- Verify `CLOUDINARY_URL` is set (should be auto-configured by addon)
- Check Cloudinary dashboard for API usage limits
- Verify the addon is properly attached to your app

## Monitoring

### View Logs

```bash
# Real-time logs
heroku logs --tail

# Recent logs
heroku logs -n 100
```

### Check App Status

```bash
heroku ps
```

### Database Info

```bash
heroku pg:info
```

## Scaling

The default configuration uses 1 basic dyno. To scale:

```bash
# Scale to 2 dynos
heroku ps:scale web=2

# Use a larger dyno type
heroku ps:resize web=standard-1x
```

## Rollback

If a deployment causes issues:

```bash
# List releases
heroku releases

# Rollback to previous release
heroku rollback
```
