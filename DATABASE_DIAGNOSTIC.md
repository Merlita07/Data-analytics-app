# Database Connection Diagnostic

## Issue Found
❌ **Cannot reach database at either port:**
- Port 5432 (standard PostgreSQL): Connection refused
- Port 6543 (connection pooling): Connection refused
- **DNS Issue:** Hostname `db.jbbrcymgfeixfnetndez.supabase.co` cannot be resolved

## Root Cause Analysis

The hostname cannot be resolved, which means:

1. **Option A:** Supabase project with ID `jbbrcymgfeixfnetndez` doesn't exist yet
2. **Option B:** Wrong project ID in connection string
3. **Option C:** Supabase account doesn't have access to this project
4. **Option D:** Network/firewall blocking access to Supabase

## Solutions

### Solution 1: Create New Supabase Project (RECOMMENDED)

1. **Go to:** https://app.supabase.com
2. **Sign in** with your account
3. **Click "New Project"** (or create if no account)
4. **Fill in:**
   - Project name: `data-analytics-app`
   - Database password: Create a **STRONG password** and save it!
   - Region: Select your region
5. **Click "Create new project"** and wait 3-5 minutes
6. **Once created:**
   - Go to **Settings → Database**
   - Find your **project ID** (first part of hostname, e.g., `abc123def456`)
   - Go to **Connection pooling**
   - Copy the **URI** connection string
7. **Update `.env.local`:**
   ```
   DATABASE_URL="postgresql://postgres:YOUR-NEW-PASSWORD@db.YOUR-NEW-PROJECT-ID.supabase.co:6543/postgres?schema=public"
   ```

### Solution 2: Use Existing Supabase Project

If you have existing Supabase project:

1. **Go to:** https://app.supabase.com
2. **Select your project**
3. **Copy correct connection string:**
   - Settings → Database → Connection pooling
   - Select "URI" format
   - Copy the full string
4. **Update `.env.local`** with the correct string including **real password**

### Solution 3: Test with Port 5432 (Direct Connection)

For direct database connection (not pooling):

```
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-ID.supabase.co:5432/postgres"
```

Note: Port 5432 requires SSL. If connection fails, try:
```
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.YOUR-PROJECT-ID.supabase.co:5432/postgres?sslmode=require"
```

---

## Quick Verification Steps

After updating `.env.local`:

1. **Test connection:**
   ```bash
   npx prisma db push --skip-generate
   ```

2. **Expected success:**
   ```
   ✓ Successfully created 1 table
   ```

3. **If still failing:**
   - Check `.env.local` was saved
   - Verify password is correct
   - Check project exists at https://app.supabase.com
   - Restart dev server: `npm run dev`

---

## Database Configuration Checklist

- [ ] Have Supabase account at https://app.supabase.com
- [ ] Have created a project (or know existing project ID)
- [ ] Can see project in Supabase dashboard
- [ ] Have **correct database password**
- [ ] Copied full connection string from Settings → Database
- [ ] Updated DATABASE_URL in `.env.local`
- [ ] Verified no typos in password/project ID
- [ ] Saved `.env.local` file
- [ ] Can reach `db.YOUR-PROJECT-ID.supabase.co` on port 5432 or 6543

---

## Current Status

**Problem:** Supabase hostname cannot be resolved
- Project ID in use: `jbbrcymgfeixfnetndez`
- Status: **Not reachable** (project may not exist)

**Action Required:** 
1. Create new Supabase project OR
2. Verify existing project ID is correct OR  
3. Update with working project connection string

---

## After Setup

Once DATABASE_URL is correct:

1. **Run schema migration:**
   ```bash
   npx prisma db push
   ```

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Test the app:**
   - Go to http://localhost:3000
   - Add a data entry
   - See it appear in dashboard

---

**Need Help?** See:
- [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md) - Quick setup guide
- [SUPABASE_CONNECTION_FIX.md](SUPABASE_CONNECTION_FIX.md) - Detailed troubleshooting
- [ACTION_SETUP_SUPABASE.md](ACTION_SETUP_SUPABASE.md) - Setup action plan

**Last Updated:** January 16, 2026
