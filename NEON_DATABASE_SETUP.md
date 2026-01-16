# Neon Database Setup Guide

Neon is a serverless PostgreSQL database perfect for Next.js applications. Follow these steps to configure it.

## Step 1: Create a Neon Project

1. Go to [https://console.neon.tech](https://console.neon.tech)
2. Sign up or log in with your GitHub account (recommended)
3. Click **Create a new project**
4. Fill in the project details:
   - **Project Name**: `tajedar-analytics` (or your preferred name)
   - **Database Name**: `analytics_db` (default is fine)
   - **Region**: Choose closest to your location
5. Click **Create project**

## Step 2: Get Your Connection String

1. In the Neon dashboard, you'll see your project
2. Click on **Connection string** or **Connection details**
3. Select **Pooled connection** (recommended for serverless)
4. Copy the connection string that looks like:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

## Step 3: Update Prisma Configuration

Your `prisma/schema.prisma` is already configured for PostgreSQL. Verify it looks like this:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 4: Update Environment Variables

1. Open or create `.env.local` in your project root
2. Add the Neon connection string:
   ```
   DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
   ```

Replace the bracketed values with your actual Neon credentials from Step 2.

**Example:**
```
DATABASE_URL="postgresql://neondb_owner:abcdef123@ep-cool-lake-12345.us-east-1.neon.tech/neondb?sslmode=require"
```

## Step 5: Apply Database Schema

Run this command to create all tables:

```bash
npx prisma db push --skip-generate
```

You should see output like:
```
✓ Prisma schema has been applied to the database

✓ Generated Prisma Client to ./node_modules/@prisma/client
```

## Step 6: Verify the Connection

Run the dev server to ensure everything works:

```bash
npm run dev
```

Visit:
- http://localhost:3000/signup - Create an account
- http://localhost:3000/login - Test login

If you see any errors, check:
1. Your connection string is correct (no typos)
2. The Neon project is active
3. Your firewall allows outbound connections to Neon servers

## Step 7: View Your Data in Neon

1. In the Neon dashboard, go to **SQL Editor**
2. Run queries to verify your tables:
   ```sql
   SELECT * FROM "User";
   SELECT * FROM "DataEntry";
   ```

## Troubleshooting

### "Connection refused"
- Verify your DATABASE_URL is correct
- Check that you copied the entire connection string
- Ensure you're using **Pooled connection** (not direct connection)

### "ENOTFOUND" or DNS errors
- This means the hostname can't be resolved
- Verify the host part is correct from your Neon dashboard
- Check your internet connection

### "Authentication failed"
- Double-check your username and password in the connection string
- Regenerate credentials in Neon dashboard if needed

### Tables don't exist after migration
- Run `npx prisma db push` again
- Check for error messages in the output
- Verify the database exists in Neon dashboard

## Useful Neon Commands

View all databases:
```bash
npx prisma studio
```

This opens Prisma Studio to browse and edit data in your Neon database.

## Next Steps

After Neon is configured:

1. **Update DataEntry to link to Users**: Already configured with `userId` field
2. **Test authentication**: Sign up and create data entries
3. **Deploy to Vercel**: Add DATABASE_URL to Vercel environment variables
4. **Monitor database**: Use Neon's built-in monitoring and metrics

## Database Connection String Format

```
postgresql://[role]:[password]@[host]/[database]?sslmode=require
```

- **role**: Database user (default: neondb_owner)
- **password**: Your Neon project password
- **host**: Your Neon project hostname
- **database**: Your database name (default: neondb)
- **sslmode**: Always use `require` for security
