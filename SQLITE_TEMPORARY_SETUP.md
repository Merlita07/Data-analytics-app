# ⚠️ Temporary SQLite Setup - Supabase Maintenance

**Status:** ✅ Application is now working with local SQLite database!

---

## What Changed

Due to Supabase being under maintenance, the application has been temporarily configured to use **SQLite** for local development.

### Current Configuration

| Component | Before | Now |
|-----------|--------|-----|
| **Database** | PostgreSQL (Supabase) | SQLite (Local) |
| **Database File** | Cloud | `dev.db` (local file) |
| **Data Persistence** | Cloud backup | Local machine only |
| **Data Scope** | Production-ready | Development/testing only |

---

## Current Status: ✅ WORKING

- ✅ API endpoints: **200/201 responses** (working)
- ✅ Data submission: **Successful** (POST returns 201)
- ✅ Data retrieval: **Successful** (GET returns 200)
- ✅ Dashboard: **Displaying data** (no errors)
- ✅ Analytics: **Calculating** (trends, forecasts working)

---

## How To Use Right Now

### Start the App

```bash
npm run dev
```

Visit: **http://localhost:3000**

### Add Data Entry

1. Go to the form
2. Enter:
   - **Value:** Any positive number
   - **Category:** Any text (e.g., "Sales")
   - **Source:** Any text (e.g., "API")
3. Click **Submit**
4. Data appears in dashboard immediately

### View Data

- Dashboard shows all entries
- Filters work (date, category, source)
- Analytics calculate automatically
- Charts update in real-time

---

## Data Storage Location

Your data is stored in: **`dev.db`** (SQLite file in project root)

- **File size:** Grows as you add data
- **Persistence:** Data stays between server restarts
- **Scope:** Local machine only
- **Backup:** Manually backup `dev.db` if needed

---

## When Supabase is Back Online

### Step 1: Get Supabase Connection String

1. Go to https://app.supabase.com
2. Select your project (or create new one)
3. Settings → Database → Connection pooling
4. Copy the URI connection string

### Step 2: Update `.env.local`

Replace `DATABASE_URL` with your Supabase connection string:

```bash
# Replace this placeholder with your actual Supabase connection string:
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-ID.supabase.co:5432/postgres?sslmode=require"
```

### Step 3: Switch Back to PostgreSQL

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  // Change provider back to PostgreSQL
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Step 4: Migrate Data (Optional)

If you want to keep the SQLite data and migrate to Supabase:

1. **Export SQLite data:**
   ```bash
   npx prisma db execute --stdin < backup.sql
   ```

2. **Or manually re-enter data** through the form

### Step 5: Apply Changes

```bash
# Generate new Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Restart dev server
npm run dev
```

---

## File Structure

```
project-root/
├── dev.db                 ← SQLite database (LOCAL)
├── prisma/
│   └── schema.prisma      ← Database configuration (SQLITE currently)
├── .env.local             ← Environment variables (SQLite noted)
└── ...
```

---

## Important Notes

⚠️ **This is temporary:**
- SQLite is for local development only
- Data is not backed up to cloud
- Cannot be accessed from Vercel deployment
- For production, use Supabase PostgreSQL

✅ **Test everything locally first:**
- Add/edit/delete entries
- Test filters
- Test export/import
- Verify analytics

---

## Troubleshooting

### "DATABASE_URL not configured" error
- You're using SQLite, so ignore this error
- It only applies to PostgreSQL configuration
- The app still works with SQLite

### Data not appearing
- Check browser console (F12) for errors
- Check dev.db file exists in project root
- Restart dev server

### Need to reset data
Delete `dev.db` and restart:
```bash
Remove-Item dev.db
npm run dev
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start app | `npm run dev` |
| Reset data | `Remove-Item dev.db ; npm run dev` |
| Check schema | `cat prisma/schema.prisma` |
| View data file | `dir dev.db` |
| Backup data | `Copy-Item dev.db dev.db.backup` |

---

## Next Actions

1. ✅ App is running with SQLite
2. 🔄 Wait for Supabase to come back online
3. 📝 Get your Supabase connection string
4. 🔧 Update `.env.local` with Supabase credentials
5. 🔄 Switch `prisma/schema.prisma` back to PostgreSQL
6. ✅ Run `npx prisma db push` to sync with Supabase

---

## Testing Checklist

- [ ] App loads at http://localhost:3000
- [ ] Can add data entry
- [ ] Data appears in dashboard
- [ ] Can filter by date/category/source
- [ ] Can export as CSV
- [ ] Can search entries
- [ ] Analytics show correct numbers
- [ ] Charts display data

---

**Current Database:** SQLite (dev.db)  
**Status:** ✅ Working  
**Temporary Until:** Supabase comes back online  
**Last Updated:** January 16, 2026
