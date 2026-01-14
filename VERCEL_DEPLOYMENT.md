# Vercel Deployment Guide

## Summary of recent updates
- Upgraded Next.js to a patched release (16.1.1) to address a CVE reported by Vercel.
- Ensure your project on Vercel uses a network-accessible MySQL instance — local XAMPP (`localhost`) is not reachable from Vercel.

## Quick Deploy Steps
1. **Connect to Vercel:**
   - Go to vercel.com → Import Project → Connect your GitHub repository

2. **Configure Project:**
   - Vercel will auto-detect Next.js and the App Router
   - Build command: `npm run build` (this runs `prisma generate` then `next build`)

3. **Set Environment Variables (Production):**
    - Add `DATABASE_URL` in your Vercel Project → Settings → Environment Variables
    - Use a production MySQL connection string (example):
       ```
   DATABASE_URL=mysql://username:password@host:3306/database_name
   ```

4. **Deploy:**
   - Push to `main` (or the production branch you configured) or deploy manually from the Vercel UI

## Why your deployment shows no data
- The repo's `.env` and `.env.local` use `mysql://root@localhost:3306/data_analytics`. Vercel cannot connect to `localhost` on your development machine.
- Server-side code (Prisma in `lib/prisma.ts` and API routes in `app/api`) requires a remote DB.

## Recommended: Migrate your local DB to a hosted MySQL (production-ready)
1. Export local data (on your machine with XAMPP):
```powershell
mysqldump -u root -p data_analytics > dump.sql
2. Create a hosted MySQL (PlanetScale, RDS, DigitalOcean, ClearDB, etc.)
3. Import the dump into the hosted DB:
```bash
mysql -h <HOST> -P <PORT> -u <USER> -p <NEW_DB_NAME> < dump.sql
```
4. Set `DATABASE_URL` on Vercel to the hosted connection string
5. On Vercel (or locally before deploy) run migrations and generate Prisma client:
```bash
npx prisma migrate deploy
npx prisma generate
```

Notes:
- PlanetScale has a Git-friendly workflow and a free tier; if you use it with Prisma, follow PlanetScale's guide for branching and `prisma migrate` compatibility.

## Temporary test (not for production): expose local MySQL to Vercel
- Only use for short tests. Exposing your DB publicly is insecure.
- Using ngrok TCP (example):
```powershell
# start ngrok and expose local MySQL
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

3. **Set Environment Variables:**
   ```
   DATABASE_URL=mysql://username:password@host:port/database_name
   ```

4. **Deploy:**
   - Push to main branch or deploy manually
   - Vercel will build and deploy automatically

## Production Database Setup

For production, you'll need a MySQL database. Recommended options:

- **PlanetScale** (Vercel-owned, free tier available)
- **AWS RDS**
- **Google Cloud SQL**
- **Azure Database for MySQL**

### Database Migration Steps:

1. Set up your production database
2. Update `DATABASE_URL` in Vercel environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Generate client: `npx prisma generate`

## Troubleshooting

- **Build fails:** Check that `DATABASE_URL` is set
- **API timeouts:** Increase timeout in `vercel.json` if needed
- **Database connection:** Ensure database allows connections from Vercel's IP ranges

## Post-Deployment

- Test all API endpoints
- Verify CSV import/export functionality
- Check chart rendering on dashboard
- Monitor for any runtime errors