# Supabase Database Setup Guide

Supabase is an open-source Firebase alternative built on PostgreSQL. It provides:
- **PostgreSQL Database** - Reliable, open-source SQL database
- **Auto-scaling** - Handles traffic without manual intervention
- **Row Level Security (RLS)** - Fine-grained access control
- **Real-time Updates** - Built-in WebSocket support
- **Free tier** - Perfect for development and small projects
- **Backups** - Automatic daily backups
- **Vercel Integration** - One-click deployment integration

## Step 1: Create Supabase Account

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up with GitHub or email
3. Create a new organization (or use default)

## Step 2: Create a Database Project

1. Click **"New project"**
2. Choose a project name (e.g., `tajedar-analytics`)
3. Select a region closest to you
4. Enter a strong database password
5. Click **"Create new project"**

Project creation takes 1-2 minutes.

## Step 3: Get Connection String

### For Local Development

1. Go to your Supabase dashboard
2. Click **"Settings"** in left sidebar
3. Click **"Database"** tab
4. Under **"Connection string"**, select **"URI"** from dropdown
5. Copy the connection string

It looks like:
```
postgresql://postgres:[data-analytics-app]@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres
```

Replace `[PASSWORD]` with your database password.

### For Production (Vercel)

**Option A: Manual Setup**
1. Copy your connection string
2. Go to Vercel project settings
3. Add environment variable `DATABASE_URL` with your connection string

**Option B: Supabase + Vercel Integration**
1. In Supabase dashboard → Settings → Integrations
2. Click **"Vercel"**
3. Select your Vercel project
4. Click **"Connect"**
5. Vercel automatically adds `DATABASE_URL` environment variable!

## Step 4: Update Your Configuration

Update `.env.local`:

```env
# Supabase PostgreSQL Connection String
DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.[REGION].supabase.co:5432/postgres?sslmode=require"

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Environment
NODE_ENV=development
```

**Important:** Replace:
- `[YOUR_PASSWORD]` - Your database password from Supabase
- `[REGION]` - Your region code (e.g., `us-east`, `eu-west`)

## Step 5: Verify Prisma Configuration

Your schema is configured for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ No changes needed!

## Step 6: Push Schema to Supabase

Create the `DataEntry` table:

```bash
npx prisma db push
```

This will:
1. Connect to your Supabase database
2. Create the `DataEntry` table
3. Generate Prisma client

## Step 7: Verify Connection

Open Prisma Studio to view your database:

```bash
npx prisma studio
```

You should see:
- ✅ `DataEntry` table created
- ✅ 5 columns: id, timestamp, value, category, source
- ✅ No data yet (table is empty)

## Step 8: Test the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and:
1. Try adding a data entry
2. Import a CSV file
3. View the analytics dashboard

All data should be stored in Supabase! ✨

## Supabase Features

### Query Editor (SQL)

Execute custom SQL queries:
1. Dashboard → SQL Editor
2. Create new query or use templates
3. Example:
   ```sql
   SELECT 
     category, 
     COUNT(*) as count, 
     AVG(value) as avg_value
   FROM "DataEntry"
   GROUP BY category;
   ```

### Table Editor

View and manage data with UI:
1. Dashboard → Table Editor
2. Select `DataEntry` table
3. Browse, filter, sort records
4. Add/edit/delete records manually

### Database Backups

Supabase automatically backs up your data:
1. Dashboard → Settings → Backups
2. View backup history
3. Restore from specific point in time

### Row Level Security (RLS)

Advanced: Implement access control:
1. Dashboard → Authentication
2. Enable RLS on tables
3. Create security policies

## Migration from Other Databases

### From Local MySQL

**Using Supabase CLI:**

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref [YOUR_PROJECT_ID]

# Pull schema
supabase db pull

# Push migrations
supabase db push
```

**Using pgloader:**

```bash
# Install pgloader
brew install pgloader  # macOS
# or download from https://pgloader.io/

# Migrate data
pgloader mysql://root@localhost/data_analytics \
          postgresql://postgres:password@host/postgres
```

### From PlanetScale

```bash
# Export from PlanetScale
mysqldump -u username -p password \
  -h host \
  data_analytics > backup.sql

# Import to Supabase (convert MySQL to PostgreSQL)
# Use online converter or pgloader
```

## Troubleshooting

### Connection refused

**Error**: `Error: connect ECONNREFUSED`

**Solution:**
- Verify connection string is correct
- Ensure `sslmode=require` is included
- Check password doesn't have special characters (URL encode if needed)
- Verify your region code is correct

### "role postgres does not exist"

**Error**: `error: role "postgres" does not exist`

**Solution:**
- Use correct password
- Reset password in Supabase dashboard: Settings → Database → Reset password

### Prisma migration fails

**Error**: `Error: P3018 A migration failed`

**Solution:**
```bash
# Reset (⚠️ deletes all data!)
npx prisma migrate reset

# Or manually fix in Supabase SQL Editor:
DROP TABLE IF EXISTS "DataEntry" CASCADE;
# Then retry: npx prisma db push
```

### Performance issues

**Check query performance:**
1. Dashboard → SQL Editor
2. Run `EXPLAIN ANALYZE` on your query
3. Look for missing indexes

**Add indexes if needed:**
```sql
CREATE INDEX idx_category ON "DataEntry"(category);
CREATE INDEX idx_timestamp ON "DataEntry"(timestamp);
```

## Deployment to Vercel

### Quick Setup (Auto)

1. In Supabase → Settings → Integrations → Vercel
2. Connect your Vercel project
3. Variables auto-added
4. Done! 🚀

### Manual Setup

1. Copy Supabase connection string
2. Vercel project → Settings → Environment Variables
3. Add:
   ```
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SENTRY_DSN=...
   SENTRY_DSN=...
   ```
4. Deploy

## Database Comparison

| Feature | Supabase | PlanetScale | Local PostgreSQL |
|---------|----------|-------------|------------------|
| **Cost** | Free tier + paid | Free tier + paid | Free (self-hosted) |
| **Database Type** | PostgreSQL | MySQL | PostgreSQL |
| **Scalability** | Auto-scaling | Auto-scaling | Manual |
| **Backups** | Automatic | Automatic | Manual |
| **SQL Editor** | Built-in | No | No |
| **Real-time** | Yes | No | No |
| **RLS** | Yes | Limited | Yes |
| **Best For** | Production | Production | Development |

## Useful SQL Queries

### Analytics Summary
```sql
SELECT 
  category,
  COUNT(*) as total_entries,
  SUM(value) as total_value,
  AVG(value) as avg_value,
  MIN(value) as min_value,
  MAX(value) as max_value,
  MAX(timestamp) as latest_entry
FROM "DataEntry"
GROUP BY category
ORDER BY total_value DESC;
```

### Daily Trends
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(*) as count,
  SUM(value) as total,
  AVG(value) as avg_value
FROM "DataEntry"
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

### Duplicate Detection
```sql
SELECT 
  value, category, source, COUNT(*) as occurrences
FROM "DataEntry"
GROUP BY value, category, source
HAVING COUNT(*) > 1;
```

## Next Steps

1. ✅ Create Supabase account
2. ✅ Create new project
3. ✅ Get connection string
4. ✅ Update `.env.local`
5. ✅ Run `npx prisma db push`
6. ✅ Test with `npm run dev`
7. ✅ Deploy to Vercel

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://www.prisma.io/docs/guides/database/supabase)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Vercel Integration](https://vercel.com/integrations/supabase)

---

Your application is fully configured for Supabase PostgreSQL! 🎉
