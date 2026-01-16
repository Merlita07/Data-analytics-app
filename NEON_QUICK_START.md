# Quick Neon Setup - 5 Minute Guide

## 1. Create Neon Project (2 min)
- Go to [https://console.neon.tech](https://console.neon.tech)
- Sign up/login with GitHub
- Click **Create project**
- Name it: `tajedar-analytics`
- Copy your connection string

## 2. Update Environment (1 min)
Edit `.env.local` - replace this line:
```
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
```

With your actual Neon connection string from Step 1:
```
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxxxx.us-east-1.neon.tech/neondb?sslmode=require"
```

## 3. Apply Schema (1 min)
```bash
npx prisma db push --skip-generate
```

Wait for success message:
```
✓ Prisma schema has been applied to the database
```

## 4. Restart Server (1 min)
```bash
npm run dev
```

## 5. Test It!
- Sign up: http://localhost:3000/signup
- Login: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard

✅ Done! Your app now uses Neon database.

## Need Help?
See [NEON_DATABASE_SETUP.md](./NEON_DATABASE_SETUP.md) for detailed instructions and troubleshooting.

## What Changed?
- Prisma now uses PostgreSQL instead of SQLite
- Data is stored in Neon cloud database
- All user accounts and data entries sync to Neon
- Ready for production deployment
