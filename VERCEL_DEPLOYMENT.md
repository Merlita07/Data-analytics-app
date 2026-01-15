# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Set up Supabase Database
- Go to [app.supabase.com](https://app.supabase.com)
- Create free account and new project (PostgreSQL)
- Copy your connection string from Settings → Database

### 2. Connect to Vercel
- Go to vercel.com → Import Project → Connect your GitHub repository
- Vercel will auto-detect Next.js configuration

### 3. Add Environment Variables
In Vercel Project → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://postgres:[password]@db.[region].supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-token
```

### 4. Deploy
- Push to `main` or deploy manually from Vercel UI
- Vercel will auto-build using `npm run build`

## Supabase + Vercel Integration (Automatic)

For easiest setup:

1. In Supabase dashboard → Settings → Integrations
2. Click "Vercel"
3. Choose your Vercel project
4. Click "Connect"

This automatically adds `DATABASE_URL` to Vercel! ✨

Then just push your code:
```bash
git push
```

## Migrating Data to Supabase

### Option 1: Use Prisma (Recommended)

1. Push schema to Supabase:
   ```bash
   npx prisma db push
   ```

2. Import data from local PostgreSQL:
   ```bash
   # Export from local PostgreSQL
   pg_dump -U postgres -h localhost data_analytics > backup.sql
   
   # Import to Supabase
   psql -U postgres -h db.[region].supabase.co -d postgres < backup.sql
   ```

### Option 2: Import CSV (Easiest)

1. Export your data as CSV
2. In Supabase dashboard → Table Editor
3. Select `DataEntry` table
4. Click "Import" and select your CSV file
5. Map columns and confirm

### Option 3: Manual SQL (Fastest)
1. Open Supabase SQL Editor
2. Create table:
   ```sql
   CREATE TABLE "DataEntry" (
     id SERIAL PRIMARY KEY,
     timestamp TIMESTAMP DEFAULT NOW(),
     value FLOAT NOT NULL,
     category VARCHAR(100) NOT NULL,
     source VARCHAR(100) NOT NULL
   );
   ```
3. Copy data from other sources

If you prefer PostgreSQL:

1. Create account at [supabase.com](https://supabase.com)
2. Get connection string
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Add to Vercel environment variables
5. Run:
   ```bash
   npx prisma migrate deploy
   ```

## Environment Variables

### Required
- `DATABASE_URL` - Database connection string (PostgreSQL)

### Sentry (Optional but Recommended)
- `NEXT_PUBLIC_SENTRY_DSN` - Client-side Sentry DSN
- `SENTRY_DSN` - Server-side Sentry DSN
- `SENTRY_ORG` - For source maps upload
- `SENTRY_PROJECT` - For source maps upload
- `SENTRY_AUTH_TOKEN` - For source maps upload

### Optional
- `NODE_ENV` - Set to `production` automatically by Vercel

## Troubleshooting

### Build fails with DATABASE_URL error
- Verify `DATABASE_URL` is set in Vercel environment variables
- Check connection string format is correct
- Ensure password doesn't contain special characters requiring encoding

### Deployment succeeds but no data appears
- Database tables not created: Run `npx prisma db push` locally first
- Data not migrated: Import CSV or use migration tools
- Connection string incorrect: Test with `npx prisma studio`

### Supabase connection timeout
- Verify connection string is correct
- Check Supabase database is still active
- Ensure `?sslmode=require` is included in connection string

### Sentry not capturing errors
- Verify DSN is set correctly
- Check app is not in development mode
- Visit Sentry dashboard to verify organization/project

## Monitoring After Deploy

1. **Vercel Dashboard:**
   - Check deployment status and logs
   - Monitor function runtime and edge functions

2. **Sentry Dashboard:**
   - View errors and exceptions
   - Monitor performance metrics
   - Check release tracking

3. **Supabase Dashboard:**
   - Monitor query counts
   - Check query insights for slow queries
   - View storage usage in Settings

## Best Practices

1. **Backup your data:**
   - Supabase provides automatic daily backups
   - Access backups in Settings → Backups

2. **Monitor performance:**
   - Use PlanetScale Insights to identify slow queries
   - Set up Sentry alerts for critical errors

3. **Use staging:**
   - Create PlanetScale branch for testing
   - Use Vercel Preview deployments for staging

4. **Keep secrets secure:**
   - Never commit `.env` files
   - Use Vercel environment variables for sensitive data
   - Rotate auth tokens regularly

## Additional Resources

- [PlanetScale Documentation](https://planetscale.com/docs)
- [Prisma + PlanetScale Guide](https://www.prisma.io/docs/guides/database/mysql-planetscale)
- [Vercel Deployment Guide](https://vercel.com/docs/frameworks/nextjs)
- [Sentry Setup](./SENTRY_SETUP.md)
- [PlanetScale Setup](./PLANETSCALE_SETUP.md)
ngrok tcp 3306
# ngrok provides a host:port like 0.tcp.ngrok.io:XXXXX
# set Vercel DATABASE_URL to:
# mysql://root:<password>@0.tcp.ngrok.io:XXXXX/data_analytics
```

## Build-time notes
- The project's `build` script runs `prisma generate` before `next build`; ensure `DATABASE_URL` is set in Vercel Build Environment so Prisma can generate the client if necessary.
- During our local build we saw a Turbopack root warning; if Vercel selects the wrong root because of multiple lockfiles, you can set `turbopack.root` in `next.config.js` to silence it.

## Troubleshooting checklist
- Verify `DATABASE_URL` is present in Vercel (Production) and matches your hosted DB credentials
- Check Vercel deployment logs for Prisma or connection errors (authentication, host unreachable, timeouts)
- If using PlanetScale, follow their recommended `prisma` settings (e.g., use `prisma db push` or follow branch workflow)
- Test API endpoints locally using the same `DATABASE_URL` you plan to use in production

## Post-Deployment
- Run a smoke test: `GET /api/data` (returns JSON) and open Dashboard
- Verify import/export CSV endpoints
- Monitor Vercel function logs for runtime errors

````
# Vercel Deployment Guide

## Quick Deploy Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository

2. **Configure Project:**
   - Vercel will auto-detect Next.js
   - Build settings are pre-configured via `vercel.json`
      - Use a production MySQL connection string (example):
         ```
   DATABASE_URL=mysql://<DB_USER>:<DB_PASSWORD>@host:3306/database_name
         ```
   ```

4. **Deploy:**
   - Push to main branch or deploy manually
   - Vercel will build and deploy automatically

## Production Database Setup

   ## Local development with XAMPP / MySQL

   This repository is configured to work with a local MySQL server (XAMPP) during development. Vercel cannot reach your local XAMPP instance — deployments must use a network-accessible database.
- **PlanetScale** (Vercel-owned, free tier available)
   1. For local development, run XAMPP and create a MySQL database. Set `DATABASE_URL` locally (in `.env`) like:
- **AWS RDS**
   ```bash
   DATABASE_URL="mysql://root:password@127.0.0.1:3306/your_db_name"
   ```
- **Google Cloud SQL**
   2. Run Prisma migrations locally and generate the client:
- **Azure Database for MySQL**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [Vercel Deployment Guide](https://vercel.com/docs/frameworks/nextjs)
- [Sentry Setup](./SENTRY_SETUP.md)
- [Supabase Setup](./SUPABASE_SETUP.md)