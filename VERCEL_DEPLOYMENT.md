# Vercel Deployment Guide

## Summary of recent updates
- Upgraded Next.js to a patched release (16.1.1) to address a CVE reported by Vercel.
- Switched Prisma to use PostgreSQL for compatibility with Supabase (recommended production DB).

## Quick Deploy Steps
1. **Connect to Vercel:**
   - Go to vercel.com → Import Project → Connect your GitHub repository

2. **Configure Project:**
   - Vercel will auto-detect Next.js and the App Router
   - Build command: `npm run build` (this runs `prisma generate` then `next build`)

3. **Set Environment Variables (Production):**
   - Add `DATABASE_URL` in your Vercel Project → Settings → Environment Variables
   - Use a production Postgres connection string (example for Supabase):
      ```
DATABASE_URL=postgresql://<DB_USER>:<DB_PASSWORD>@db.<region>.supabase.co:5432/postgres?schema=public
      ```

4. **Deploy:**
   - Push to `main` (or the production branch you configured) or deploy manually from the Vercel UI

## Why your deployment shows no data
- The repo's `.env` and `.env.local` use `mysql://root@localhost:3306/data_analytics`. Vercel cannot connect to `localhost` on your development machine.
- Server-side code (Prisma in `lib/prisma.ts` and API routes in `app/api`) requires a remote DB.

## Recommended: Migrate your local data to Supabase (Postgres)

1. Create a Supabase project at https://app.supabase.com and get the Postgres connection string (Settings → Database → Connection string).
2. In Vercel, set `DATABASE_URL` to the Supabase connection string (example shown above).
3. Import data:
   - Option A (recommended for small datasets): Export CSV from your local DB (or use the provided `sample-data.csv`) and use Supabase Table Editor → "Import CSV" to populate the `DataEntry` table.
   - Option B (for larger or automated migrations): use `pgloader` or a migration tool to transfer MySQL -> Postgres data.
4. Apply Prisma migrations on production (after `DATABASE_URL` is set):
```bash
npx prisma migrate deploy
npx prisma generate
```

Notes:
- Supabase provides a Postgres database with an easy UI for importing CSVs and managing tables.
- Prisma is now configured for `postgresql` in `prisma/schema.prisma`.

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