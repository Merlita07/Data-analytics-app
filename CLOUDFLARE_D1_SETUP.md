# Add Cloudflare D1 Database

Cloudflare D1 is a great alternative to Supabase - it's SQLite-based, serverless, and works perfectly with Vercel!

---

## Why Cloudflare D1?

✅ **SQLite-based** (compatible with your current setup)  
✅ **Serverless** (no infrastructure to manage)  
✅ **Works with Vercel** (perfect for Next.js deployments)  
✅ **Free tier available** (with generous limits)  
✅ **Easy migration** (already using SQLite locally)  
✅ **Built for edge** (better performance globally)  

---

## Step 1: Create Cloudflare Account & Project

### Create Account
1. Go to [https://dash.cloudflare.com](https://dash.cloudflare.com)
2. Sign up with email or social account
3. Verify your email

### Create Database
1. In Cloudflare dashboard, go to **Workers & Pages**
2. Click **D1** in the sidebar
3. Click **Create database**
4. **Database name:** `data-analytics-app`
5. Click **Create**
6. Wait for provisioning to complete

---

## Step 2: Install Wrangler CLI

Wrangler is Cloudflare's CLI tool for managing D1 databases.

```bash
npm install -g wrangler
```

Or use with npx (no install needed):
```bash
npx wrangler d1 list
```

---

## Step 3: Authenticate with Cloudflare

```bash
npx wrangler login
```

This opens a browser to authorize access. Grant permission.

---

## Step 4: Create Wrangler Configuration

Create `wrangler.toml` in your project root:

```toml
name = "data-analytics-app"
main = "src/index.js"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "data-analytics-app"
database_id = "YOUR-DATABASE-ID"
```

**Note:** You'll get the `database_id` after creating the database in step 1.

---

## Step 5: Get Database ID

List your databases to find the ID:

```bash
npx wrangler d1 list
```

You'll see output like:
```
┌─────────────────┬──────────────────────┬───────────┐
│ Name            │ Database ID          │ State     │
├─────────────────┼──────────────────────┼───────────┤
│ data-analytics-│ abc123def456ghijk    │ created   │
└─────────────────┴──────────────────────┴───────────┘
```

Copy the **Database ID** and update `wrangler.toml`.

---

## Step 6: Update Prisma Configuration

### Option A: Using D1 with Vercel (RECOMMENDED)

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model DataEntry {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())
  value     Float
  category  String
  source    String
}
```

Create `.env.local`:

```bash
# For local development (still using local SQLite)
DATABASE_URL="file:./dev.db"
```

Create `.env.production.local`:

```bash
# For Vercel/D1 production
DATABASE_URL="D1"
```

### Option B: Using D1 for Local Development

Install D1 proxy:

```bash
npm install --save-dev @cloudflare/workers-sdk
```

Update `.env.local`:

```bash
# Proxy to remote D1
DATABASE_URL="cloudflare://YOUR-DATABASE-ID"
```

---

## Step 7: Create Tables in D1

### Option A: Using Prisma (Recommended)

```bash
npx prisma db push
```

Prisma will create the `DataEntry` table in D1.

### Option B: Manual SQL

In Cloudflare dashboard:
1. Go to **D1 → Your Database**
2. Click **Console**
3. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS DataEntry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  value REAL NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_timestamp ON DataEntry(timestamp);
CREATE INDEX IF NOT EXISTS idx_category ON DataEntry(category);
CREATE INDEX IF NOT EXISTS idx_source ON DataEntry(source);
```

---

## Step 8: Update Application Code

No changes needed! Your current code works with D1 because it's SQLite-based.

---

## Step 9: Deploy to Vercel

### Create `vercel.json`:

```json
{
  "buildCommand": "npm run build && npx prisma db push",
  "env": {
    "DATABASE_URL": {
      "description": "Cloudflare D1 database",
      "value": "D1"
    },
    "CF_API_TOKEN": {
      "description": "Cloudflare API token"
    },
    "CF_ACCOUNT_ID": {
      "description": "Cloudflare account ID"
    }
  }
}
```

### Get Cloudflare Credentials:

1. **API Token:**
   - Cloudflare dashboard → Account → API tokens
   - Create token with "D1 Edit" permission
   - Copy the token

2. **Account ID:**
   - Cloudflare dashboard → Account
   - Copy the "Account ID"

### Set Vercel Environment Variables:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = `D1`
   - `CF_API_TOKEN` = Your token
   - `CF_ACCOUNT_ID` = Your account ID
3. Deploy!

---

## Step 10: Test Locally

```bash
# Make sure server is running
npm run dev

# Visit http://localhost:3000
# Try adding a data entry
# Check if it appears in dashboard
```

---

## Comparison: Local SQLite vs D1 vs Supabase

| Feature | Local SQLite | D1 | Supabase |
|---------|--------------|----|----|
| **Cost** | Free | Free tier | Free tier |
| **Type** | SQLite | SQLite | PostgreSQL |
| **Deployment** | Local only | Vercel/Cloudflare | Vercel/Any |
| **Persistence** | Local file | Cloudflare servers | Cloud backup |
| **Setup Difficulty** | Easy | Medium | Hard |
| **Best For** | Development | Vercel deployment | Production |

---

## Migration Path

### Current → D1 (Recommended)

1. **Keep SQLite locally** for development
2. **Use D1 for production** on Vercel
3. **Environment-based config** switches between them

```javascript
// In your app
const dbUrl = process.env.NODE_ENV === 'production' 
  ? 'D1' 
  : 'file:./dev.db'
```

### SQLite → D1 Data Migration

Export from SQLite and import to D1:

```bash
# Export SQLite data
sqlite3 dev.db ".dump" > backup.sql

# Import to D1
npx wrangler d1 execute data-analytics-app --file=backup.sql
```

---

## D1 Management Commands

```bash
# List databases
npx wrangler d1 list

# Create new database
npx wrangler d1 create data-analytics-app

# Execute SQL
npx wrangler d1 execute data-analytics-app --command "SELECT COUNT(*) FROM DataEntry"

# Run SQL file
npx wrangler d1 execute data-analytics-app --file=schema.sql

# Access D1 Console
# Dashboard → D1 → Database → Console
```

---

## Troubleshooting D1

### "Database not found"
- Check `database_id` in `wrangler.toml` is correct
- Verify you're logged in: `npx wrangler whoami`

### "Permission denied"
- Re-authenticate: `npx wrangler logout && npx wrangler login`
- Check API token has D1 permissions

### Data not syncing
- Restart dev server: `npm run dev`
- Check `.env` variables are loaded
- Verify Prisma migrations: `npx prisma db push`

### Vercel deployment fails
- Ensure CF_API_TOKEN and CF_ACCOUNT_ID are set
- Check token has D1 Edit permission
- Check database_id in wrangler.toml matches

---

## Next Steps

### Option 1: Use D1 for Production Only
1. Keep SQLite for local dev (current setup)
2. Use D1 when deploying to Vercel
3. Minimal changes needed

### Option 2: Use D1 for Everything
1. Set up D1 locally
2. Update `.env.local` to point to D1
3. Remove dependency on local `dev.db` file

### Option 3: Keep Supabase When It's Back
1. Use local SQLite now
2. Switch to Supabase when it's online
3. Or use D1 instead (simpler)

---

## D1 Resources

- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [D1 with Prisma](https://developers.cloudflare.com/d1/get-started/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

---

## Quick Summary

| Task | Command |
|------|---------|
| Install Wrangler | `npm install -g wrangler` |
| Login | `npx wrangler login` |
| List databases | `npx wrangler d1 list` |
| Create table | `npx prisma db push` |
| Execute SQL | `npx wrangler d1 execute data-analytics-app --command "SELECT * FROM DataEntry"` |
| Migrate data | `npx wrangler d1 execute data-analytics-app --file=backup.sql` |

---

## Current Status

- ✅ Local SQLite working (`dev.db`)
- ⏳ D1 optional (for Vercel deployment)
- ⏳ Supabase optional (when back online)

**Recommendation:** Use local SQLite for now, add D1 when deploying to Vercel!

---

**Created:** January 16, 2026
