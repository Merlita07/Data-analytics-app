# Deploy to Vercel - Complete Guide

Since local DNS is blocking Supabase, we'll deploy to Vercel instead. Vercel has no DNS issues and can reach Supabase perfectly.

## Step-by-Step Deployment

### Step 1: Create Database Table on Supabase (5 mins)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select **data-analytics-app** project
3. Click **SQL Editor** (left sidebar)
4. Click **New query**
5. Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS "DataEntry" (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  value FLOAT NOT NULL,
  category VARCHAR(100) NOT NULL,
  source VARCHAR(100) NOT NULL
);
```

6. Click **Run**
7. Wait for success message

✅ Table is now created on Supabase!

---

### Step 2: Push Code to GitHub (2 mins)

```bash
cd c:\Users\admin\Tajedar_fullstack_web_app-2

# Stage all changes
git add .

# Commit
git commit -m "Configure Supabase PostgreSQL database and prepare for Vercel deployment"

# Push to GitHub
git push
```

Wait for push to complete.

---

### Step 3: Import Project to Vercel (3 mins)

1. Go to [vercel.com](https://vercel.com)
2. Sign in (use GitHub login if you have it)
3. Click **Add New** → **Project**
4. Click **Import Git Repository**
5. Find your repository: **Merlita07/Data-analytics-app**
6. Click **Import**

Vercel will detect it's a Next.js project automatically.

---

### Step 4: Configure Environment Variables (3 mins)

Vercel will ask for environment variables before deploying.

Add these variables:

**Variable 1: Database**
- Name: `DATABASE_URL`
- Value: `postgresql://postgres:Data_analytics_app@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require`

**Variable 2: Sentry (Optional)**
- Name: `NEXT_PUBLIC_SENTRY_DSN`
- Value: `https://your-sentry-dsn@sentry.io/project-id`

**Variable 3: Sentry Server**
- Name: `SENTRY_DSN`
- Value: `https://your-sentry-dsn@sentry.io/project-id`

Click **Deploy**

---

### Step 5: Wait for Deployment (2-3 mins)

Vercel will:
1. Clone your repo
2. Install dependencies
3. Build Next.js app
4. Deploy to production

You'll see:
- ✅ Building...
- ✅ Deployments completed
- 🎉 Your URL: `https://your-project.vercel.app`

---

## Step 6: Test Your Live App! 🚀

1. Click the deployment link to open your app
2. You're now on PRODUCTION, not local!
3. Go to Dashboard
4. Try adding a data entry:
   - Value: `100`
   - Category: `Sales`
   - Source: `Vercel Test`
   - Click **Add Entry**

5. ✅ Data appears in the table? **SUCCESS!**
6. ✅ Charts update? **Perfect!**

---

## What Happens During Deployment

```
GitHub → Vercel detects push
  ↓
Vercel clones your code
  ↓
Vercel installs dependencies (npm install)
  ↓
Vercel builds Next.js (npm run build)
  ↓
Vercel starts server with DATABASE_URL env variable
  ↓
App connects to Supabase ✅ (NO DNS ISSUES!)
  ↓
App is LIVE and WORKING!
```

---

## Your Live URLs After Deployment

- **Vercel Production:** `https://your-project.vercel.app`
- **GitHub:** `https://github.com/Merlita07/Data-analytics-app`
- **Supabase:** `https://app.supabase.com` (your data storage)

---

## Troubleshooting Vercel Deployment

### Build Failed
- Check **Deployments** tab → Click failed deployment → View logs
- Common error: Missing environment variable
- Solution: Go to **Settings** → **Environment Variables** → Add missing variable → Redeploy

### App loads but shows 503 error
- Check Vercel logs for Prisma connection error
- Verify `DATABASE_URL` is correct
- Verify table exists on Supabase

### Can't find my GitHub repo
- Make sure you pushed code: `git push`
- Check your GitHub: [github.com/Merlita07/Data-analytics-app](https://github.com/Merlita07/Data-analytics-app)
- Refresh Vercel page

---

## Quick Reference: Vercel Commands

**View deployments:**
- Dashboard → Projects → Your project → Deployments tab

**View logs:**
- Deployments tab → Click deployment → View Logs button

**Redeploy:**
- Deployments tab → Click the 3 dots → Redeploy

**Change environment variables:**
- Settings → Environment Variables → Add/Edit → Redeploy

---

## Success Checklist

- [ ] Created DataEntry table on Supabase
- [ ] Pushed code to GitHub (`git push`)
- [ ] Imported project to Vercel
- [ ] Added DATABASE_URL environment variable
- [ ] Vercel deployment completed (green checkmark)
- [ ] Opened live app link
- [ ] Added test data
- [ ] Data appears in table ✅

---

## You're Done! 🎉

Your app is now:
- ✅ **Live on Vercel**
- ✅ **Connected to Supabase**
- ✅ **Can save data**
- ✅ **Can view analytics**
- ✅ **Production-ready**

Share your Vercel URL with others - they can use your app!

---

## Next Steps (Optional)

1. **Add custom domain:**
   - Settings → Domains → Add domain

2. **Set up CI/CD:**
   - Auto-redeploy on GitHub push (already enabled)

3. **Monitor performance:**
   - Analytics tab → View metrics

4. **View logs:**
   - Logs tab → See real-time logs

---

**No more DNS issues!** Your app is live on Vercel. 🚀
