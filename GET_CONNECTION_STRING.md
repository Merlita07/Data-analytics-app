# Supabase Connection String - How to Get Yours

## Step 1: Get Your Real Connection String from Supabase

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project `data-analytics-app`
3. Click **Settings** (left sidebar)
4. Click **Database** tab
5. Under **Connection string**, select **URI** from dropdown
6. Copy the entire string

## Step 2: Replace in .env.local

The string should look like:
```
postgresql://postgres:[YOUR_PASSWORD]@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require
```

**Important:** Replace `[YOUR_PASSWORD]` with your actual database password (not the placeholder).

## Step 3: Update .env.local

Replace the entire DATABASE_URL line with your actual connection string from Supabase.

⚠️ **Note:** 
- Do NOT include brackets around the password
- If password has special characters, they must be URL-encoded
- The password is different from your Supabase account password

## Example (This is NOT your real password):
```
DATABASE_URL="postgresql://postgres:Abc123!@xyz@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require"
```

## Getting Help

If you can't find the connection string:
1. In Supabase dashboard → Settings → Database
2. Scroll down to "Connection string"
3. Make sure "URI" tab is selected
4. If you forgot your password, click "Reset password" and create a new one
5. Copy the entire URI including the password

---

Once you update the real connection string, run:
```bash
npx prisma db push
```
