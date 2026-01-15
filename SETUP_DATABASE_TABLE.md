# Supabase Database Configuration - Create Tables

## Quick Setup (2 minutes)

Your database connection string is ready, but the table doesn't exist yet. Let's create it directly on Supabase.

### Step 1: Log into Supabase Dashboard

1. Go to [app.supabase.com](https://app.supabase.com)
2. Sign in with your account
3. Click on your project: **data-analytics-app**

### Step 2: Open SQL Editor

1. Left sidebar → Click **SQL Editor**
2. Click **New query** button
3. A new SQL editor window opens

### Step 3: Create DataEntry Table

Copy and paste this SQL command into the editor:

```sql
CREATE TABLE IF NOT EXISTS "DataEntry" (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  value FLOAT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL
);
```

### Step 4: Run the Query

1. Click **Run** button (or press Ctrl+Enter)
2. Wait for confirmation message
3. You should see: "Success. No rows returned"

### Step 5: Verify Table Created

1. Left sidebar → Click **Table Editor**
2. You should see **DataEntry** in the table list
3. Click on it to view the empty table (0 rows)

## Now Test Your App

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Visit [http://localhost:3000](http://localhost:3000)

3. Go to **Dashboard**

4. Try adding data:
   - Value: `100`
   - Category: `Sales`
   - Source: `Test`
   - Click **Add Entry**

5. Check if it appears in the table below

## If Data Still Doesn't Save

### Check 1: Verify Connection String
- Go to Settings → Database
- Copy the URI again
- Make sure it's in `.env` file:
  ```
  DATABASE_URL="postgresql://postgres:Data_analytics_app@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require"
  ```

### Check 2: Look at Console Errors
- Open browser DevTools (F12)
- Go to **Console** tab
- Look for red error messages
- Take note of the error

### Check 3: Check Server Logs
- Terminal where you ran `npm run dev`
- Look for any error messages
- Common error: "Cannot execute query - no connection"

### Check 4: Verify Table Exists
- Go to Supabase → Table Editor
- Click **DataEntry** table
- See if it shows the table structure

## Expected Result

Once working:
- ✅ Add data through the form
- ✅ Data appears in table below
- ✅ Analytics show on dashboard
- ✅ Charts update with data

## SQL Commands Reference

If you need to:

**Check if table exists:**
```sql
SELECT * FROM "DataEntry" LIMIT 10;
```

**Delete all data (keep table):**
```sql
DELETE FROM "DataEntry";
```

**Delete table completely:**
```sql
DROP TABLE "DataEntry";
```

**Add some test data:**
```sql
INSERT INTO "DataEntry" (value, category, source) VALUES
(100, 'Sales', 'Test'),
(200, 'Revenue', 'Test'),
(150, 'Expenses', 'Test');
```

---

**Quick Checklist:**
- [ ] Logged into Supabase
- [ ] Opened SQL Editor
- [ ] Ran CREATE TABLE query
- [ ] Table appears in Table Editor
- [ ] Started dev server with `npm run dev`
- [ ] Tested adding data in browser
- [ ] Data appears in table
- [ ] Ready to deploy! 🚀
