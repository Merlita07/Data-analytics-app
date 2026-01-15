# PlanetScale Database Setup Guide

PlanetScale is a MySQL-compatible serverless database platform that's perfect for Next.js applications. It offers:
- **Automatic scaling** - Handles traffic spikes without manual intervention
- **Branching** - Git-like branching for database schemas
- **Free tier** - Generous free tier for development
- **Vercel integration** - One-click integration with Vercel

## Step 1: Create PlanetScale Account

1. Go to [planetscale.com](https://planetscale.com)
2. Sign up with GitHub, Google, or email
3. Create an organization (or use default)

## Step 2: Create a Database

1. Click **"Create a database"**
2. Choose a database name (e.g., `tajedar-analytics`)
3. Select region closest to you
4. Choose **MySQL 8.0** version
5. Click **"Create database"**

The database will be created in seconds!

## Step 3: Get Connection String

### For Local Development

1. Go to your PlanetScale dashboard
2. Click on your database
3. Click **"Connect"** button
4. Select **"NodeJS"** from dropdown
5. Choose **"Create password"** (or use existing)
6. Copy the connection string

It looks like:
```
mysql://[username]:[password]@[host]/[database]?sslaccept=strict
```

### For Production (Vercel)

1. Click **"Connect"** → **"Vercel"**
2. Click **"Connect"** (it will integrate automatically)
3. Select your Vercel project
4. Click **"Import variables"**

This automatically adds `DATABASE_URL` to your Vercel environment.

## Step 4: Update Local Configuration

Update your `.env.local` file:

```env
# PlanetScale Database
DATABASE_URL="mysql://[username]:[password]@[host]/[database]?sslaccept=strict"

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Environment
NODE_ENV=development
```

Replace placeholders with your actual PlanetScale credentials.

## Step 5: Verify Prisma Configuration

Your `prisma/schema.prisma` is already configured for MySQL:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

No changes needed! ✅

## Step 6: Initialize the Database

### Option A: Push Schema (Recommended for Initial Setup)

```bash
npx prisma db push
```

This creates the tables defined in your schema.

### Option B: Create Migration

```bash
npx prisma migrate dev --name init
```

This creates a migration file and applies it.

## Step 7: Test Connection

```bash
npx prisma studio
```

This opens an interactive database viewer. You should see your `DataEntry` table.

## Step 8: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and try:
1. Adding a data entry
2. Importing a CSV file
3. Viewing the dashboard

Everything should work with PlanetScale!

## Deployment to Vercel

### If You Used Vercel Integration (Automatic)

1. Just push your code:
   ```bash
   git push
   ```
2. Vercel will automatically deploy with PlanetScale connection

### If You Used Manual Connection String

1. Go to Vercel project settings
2. Add environment variable:
   - Name: `DATABASE_URL`
   - Value: Your PlanetScale connection string
3. Deploy:
   ```bash
   git push
   ```

## Useful PlanetScale Features

### Database Branching

Create a branch for testing schema changes:

```bash
# Create a branch
planetscale database branch create tajedar-analytics dev-branch

# Promote branch to main (after testing)
planetscale database promote-branch tajedar-analytics dev-branch main
```

### Backup & Restore

PlanetScale automatically backs up your data. You can:
- View backups in dashboard
- Restore to any point in time (depending on plan)

### Query Insights

Monitor your queries:
1. Dashboard → Insights
2. See slow queries, most used queries, errors
3. Optimize as needed

## Troubleshooting

### Connection String Invalid

**Error**: `Error connecting to database`

**Solution**: 
- Verify you copied the full connection string
- Check username/password are correct
- Ensure `sslaccept=strict` is included

### "Access Denied" Error

**Error**: `Access denied for user`

**Solution**:
- Regenerate password in PlanetScale dashboard
- Update connection string in `.env.local`
- Clear `.env` files and restart dev server

### Prisma Can't Find Tables

**Error**: `Table not found`

**Solution**:
```bash
# Push schema to create tables
npx prisma db push

# Or create migration
npx prisma migrate dev --name init
```

### PlanetScale Connection Timeout

**Solution**:
- Check your internet connection
- Verify PlanetScale region is accessible from your location
- Try using different PlanetScale region

## Comparing Databases

| Feature | Local MySQL | PlanetScale | Vercel Postgres |
|---------|-----------|-------------|-----------------|
| **Cost** | Free (self-hosted) | Free tier + paid | Free tier + paid |
| **Scalability** | Manual | Automatic | Automatic |
| **Backups** | Manual | Automatic | Automatic |
| **Reliability** | Limited | Enterprise-grade | Enterprise-grade |
| **Git Integration** | No | Yes (branching) | No |
| **MySQL Native** | Yes | Yes | No (PostgreSQL) |
| **Best For** | Development | Production | Production |

## Next Steps

1. ✅ Create PlanetScale database
2. ✅ Copy connection string
3. ✅ Update `.env.local`
4. ✅ Run `npx prisma db push`
5. ✅ Test locally with `npm run dev`
6. ✅ Deploy to Vercel (set DATABASE_URL)

## Additional Resources

- [PlanetScale Documentation](https://planetscale.com/docs)
- [Prisma + PlanetScale Guide](https://www.prisma.io/docs/guides/database/mysql-planetscale)
- [PlanetScale CLI Tool](https://planetscale.com/docs/reference/planetscale-cli)

## Quick Reference: PlanetScale CLI

```bash
# Install
npm install -g @planetscale/cli

# Login
pscale auth login

# List databases
pscale database list

# Create database
pscale database create [db-name]

# Delete database
pscale database delete [db-name]

# Create connection string
pscale database password create [db-name] main

# Get connection info
pscale database connection-string [db-name]
```

---

Your application is ready for PlanetScale! The MySQL schema is compatible, and you just need to connect it.
