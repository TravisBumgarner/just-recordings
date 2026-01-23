# Heroku Deployment Guide

This guide covers deploying Just Recordings to Heroku.

## Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- A Heroku account
- A Supabase project (for authentication)
- A Cloudinary account (for video storage)

## Initial Setup

### 1. Create the Heroku App

```bash
heroku create your-app-name
```

### 2. Add PostgreSQL Addon

The app requires PostgreSQL for data storage. Add the Heroku Postgres addon:

```bash
heroku addons:create heroku-postgresql:essential-0
```

This automatically sets the `DATABASE_URL` environment variable.

### 3. Connect Your Repository

If using GitHub deployment:

```bash
# In the Heroku dashboard, connect to your GitHub repository
# Or use the Heroku Git remote:
heroku git:remote -a your-app-name
```

## Environment Variables

### Auto-configured by Heroku

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (set by Heroku Postgres addon) |
| `PORT` | Port for the web dyno (set by Heroku) |

### Required - Must Be Set Manually

| Variable | Description | Where to Get It |
|----------|-------------|-----------------|
| `NODE_ENV` | Set to `production` | Set manually |
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard > Settings > API |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary Dashboard > Settings |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Cloudinary Dashboard > Settings |

### Setting Environment Variables

Via CLI:

```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://your-project.supabase.co
heroku config:set SUPABASE_ANON_KEY=your-anon-key
heroku config:set CLOUDINARY_CLOUD_NAME=your-cloud-name
heroku config:set CLOUDINARY_API_KEY=your-api-key
heroku config:set CLOUDINARY_API_SECRET=your-api-secret
```

Via Dashboard:

1. Go to your app in Heroku Dashboard
2. Navigate to Settings > Config Vars
3. Click "Reveal Config Vars"
4. Add each variable

## Database Migrations

After deploying, run database migrations to set up the schema:

```bash
heroku run npm run db:push -w @just-recordings/api
```

This uses Drizzle Kit to push the schema to your Heroku Postgres database.

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

### Setting Up Cloudinary

1. Create a free Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. From your Cloudinary Dashboard, note your:
   - Cloud Name
   - API Key
   - API Secret
3. Set these as environment variables (see above)

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

- Verify all three Cloudinary environment variables are set
- Check Cloudinary dashboard for API usage limits
- Ensure the API key/secret are correct (not rotated)

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
