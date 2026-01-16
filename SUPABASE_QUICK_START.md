# Supabase Configuration for Data Entry

This application now requires **Supabase** with a PostgreSQL database. The sample-data.csv fallback has been removed.

## Quick Start Setup (5 minutes)

### 1. Create Supabase Account & Project
1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click **"New project"**
4. Fill in:
   - **Name:** `data-analytics-app`
   - **Password:** Create a secure password
   - **Region:** Choose closest to you (default: US East 1)
5. Click **"Create new project"** - wait 2-3 minutes for setup

### 2. Get Connection String
1. In Supabase dashboard, go to **Settings** → **Database** → **Connection pooling**
2. Copy the **"Connection string"** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password

Example:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:6543/postgres?schema=public
```

### 3. Create DataEntry Table
1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS "DataEntry" (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  value FLOAT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_timestamp ON "DataEntry"(timestamp);
CREATE INDEX idx_category ON "DataEntry"(category);
CREATE INDEX idx_source ON "DataEntry"(source);
```

4. Click **"Run"** button
5. You should see "Success. No rows returned."

### 4. Configure Environment Variable

#### For Local Development:
Create `.env.local` file in project root:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:6543/postgres?schema=public"
```

#### For Vercel Deployment:
1. Go to [vercel.com](https://vercel.com) → Your Project → **Settings**
2. Click **"Environment Variables"**
3. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Supabase connection string
   - **Environments:** Production, Preview, Development
4. Click **"Save"**

### 5. Test Connection
Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) and try:
1. **Add data entry** through the form
2. **View dashboard** - data should appear in the table
3. **Filter data** - use category, date range, search
4. **Export data** - download as CSV/JSON

---

## Verify Database Setup

### Check if data was saved:
In Supabase SQL Editor, run:
```sql
SELECT COUNT(*) as total_entries FROM "DataEntry";
SELECT * FROM "DataEntry" LIMIT 5;
```

### Common Issues

**Error: "DATABASE_URL not configured"**
- Verify `.env.local` is created with correct connection string
- For Vercel: Check environment variables are set
- Restart development server after setting env variables

**Error: "relation DataEntry does not exist"**
- Run the CREATE TABLE SQL query in Supabase SQL Editor
- Make sure indexes are created

**Connection timeout**
- Check DATABASE_URL password is correct
- Verify Supabase project is active
- Check network connectivity to Supabase (whitelist IPs if needed)

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Prisma + Supabase Guide](https://supabase.com/docs/guides/databases/prisma)
- See `SUPABASE_SETUP.md` for advanced features (RLS, backups, migrations)
- See `VERCEL_DEPLOYMENT.md` for production deployment guide

---

## Database Features

✅ **Real-time data entry** - Add data through form  
✅ **Analytics** - Automatic calculations (avg, sum, trends, forecasts)  
✅ **Filtering** - By date, category, source, search  
✅ **Pagination** - 50 records per page  
✅ **Export** - Download as CSV or JSON  
✅ **Import** - Bulk CSV upload  
✅ **Monitoring** - Sentry error tracking  
✅ **Performance** - Indexed queries with indexes  

---

**Status:** Database required - No fallback to sample data  
**Last Updated:** January 16, 2026
