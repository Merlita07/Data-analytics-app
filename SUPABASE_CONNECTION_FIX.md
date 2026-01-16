# Fix: DATABASE_URL Configuration

If you're seeing **"DATABASE_URL not configured"** error, follow these steps to properly set up your Supabase connection.

## Issue Diagnosis

The error occurs when:
- `.env.local` file doesn't have `DATABASE_URL` set
- `DATABASE_URL` value is incorrect
- Database server cannot be reached
- Connection string format is wrong

---

## Step 1: Get Supabase Connection String

### If you DON'T have a Supabase account:
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **Sign Up** with email or GitHub
3. Create a new project:
   - **Name:** `data-analytics-app`
   - **Database password:** Create a secure password (save it!)
   - **Region:** Choose closest to you
4. Wait 2-3 minutes for project setup

### Get the Connection String:
1. In Supabase dashboard, click your project
2. Go **Settings** → **Database** → **Connection pooling**
3. Under **"Connection string"**, select **URI** from dropdown
4. Copy the entire connection string (it looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxx.supabase.co:6543/postgres?schema=public
   ```

**Important:** Replace `[YOUR-PASSWORD]` with the actual password you created!

---

## Step 2: Update .env.local

Open `.env.local` in your project and update:

```bash
DATABASE_URL="postgresql://postgres:YOUR-ACTUAL-PASSWORD@db.YOUR-PROJECT-ID.supabase.co:6543/postgres?schema=public"
```

Example:
```bash
DATABASE_URL="postgresql://postgres:mySecurePass123@db.abcdefghijklmn.supabase.co:6543/postgres?schema=public"
```

---

## Step 3: Create Database Table

Run this command in your terminal:

```bash
npx prisma db push
```

This will:
- Connect to your Supabase database
- Create the `DataEntry` table automatically
- Generate Prisma client

**Expected output:**
```
✓ Successfully created 1 table
```

If you get an error, check:
- Password is correct
- Project ID is correct
- Supabase project is active (not paused)

---

## Step 4: Create Indexes (Optional but Recommended)

For better query performance, create indexes. In Supabase SQL Editor, run:

```sql
CREATE INDEX IF NOT EXISTS idx_timestamp ON "DataEntry"(timestamp);
CREATE INDEX IF NOT EXISTS idx_category ON "DataEntry"(category);
CREATE INDEX IF NOT EXISTS idx_source ON "DataEntry"(source);
```

---

## Step 5: Restart Development Server

Stop and restart your development server:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Test the Connection

1. Visit http://localhost:3000
2. Try to add a data entry through the form
3. You should see it appear in the dashboard table

If still getting error:
- Check browser console (F12) for detailed error
- Verify `.env.local` is saved
- Check terminal for any error messages

---

## Troubleshooting

### Error: "Can't reach database server"
- Verify password in connection string is correct
- Check Supabase project is active (not paused)
- Verify project ID in connection string matches Supabase

### Error: "relation DataEntry does not exist"
- Run `npx prisma db push` to create tables
- Check Supabase project shows `DataEntry` table in Table Editor

### Server won't start
- Check `.env.local` has no syntax errors
- Make sure DATABASE_URL is on one line
- Restart terminal and run `npm run dev` again

### Data not saving
- Verify error in browser console (F12)
- Check Supabase database shows new rows in Table Editor
- Look for Sentry error logs

---

## Common Connection String Formats

### Supabase Connection Pooling (Recommended):
```
postgresql://postgres:PASSWORD@db.PROJECT-ID.supabase.co:6543/postgres?schema=public
```

### Supabase Direct Connection:
```
postgresql://postgres:PASSWORD@db.PROJECT-ID.supabase.co:5432/postgres
```

### If using `.env` instead of `.env.local`:
Make sure DATABASE_URL is in your `.env` file instead:
```bash
DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT-ID.supabase.co:6543/postgres?schema=public
```

---

## Verify in Supabase Dashboard

1. Go to Supabase → **Table Editor**
2. You should see `DataEntry` table
3. Add data through web form
4. Refresh Table Editor
5. New entries should appear

---

## Still Need Help?

See these guides:
- [SUPABASE_QUICK_START.md](SUPABASE_QUICK_START.md) - Quick setup guide
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed configuration
- [README.md](README.md) - Project overview

---

**Last Updated:** January 16, 2026
