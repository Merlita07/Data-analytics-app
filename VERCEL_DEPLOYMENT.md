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