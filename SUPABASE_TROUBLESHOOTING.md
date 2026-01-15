# Supabase Connection Troubleshooting

## Current Issue
- ✅ Connection string format is correct
- ✅ Prisma schema is valid  
- ❌ Can't reach Supabase server at `db.jbbrcymgfeixfnetndez.supabase.co:5432`

## Common Causes & Solutions

### 1. Firewall/Network Blocking

**Check if:**
- Your ISP blocks port 5432
- Corporate firewall blocks database connections
- VPN is blocking Supabase region

**Solutions:**
```bash
# Test DNS resolution
nslookup db.jbbrcymgfeixfnetndez.supabase.co

# Try different DNS
# Use Cloudflare: 1.1.1.1
# Or Google: 8.8.8.8
```

### 2. Password URL Encoding

If password has special characters, they may need encoding:
- `-` (hyphen) → `%2D`
- `!` → `%21`
- `@` → `%40`

**Try URL-encoded version:**
```env
DATABASE_URL="postgresql://postgres:data%2Danalytics%2Dapp@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require"
```

### 3. Verify Supabase Project Status

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your `data-analytics-app` project
3. Check if project status is "Running" (not paused)
4. Verify database is active

### 4. Check Connection String Format

Your current connection string:
```
postgresql://postgres:data-analytics-app@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require
```

**Verify:**
- ✅ Starts with `postgresql://`
- ✅ Has `postgres` user
- ✅ Has password `data-analytics-app`
- ✅ Has correct host `db.jbbrcymgfeixfnetndez.supabase.co`
- ✅ Has port `5432`
- ✅ Has `sslmode=require`

### 5. Try Alternative Connection Methods

**Option A: Use IPv4 instead of hostname**
- Get IP address of Supabase server
- Use IP in connection string

**Option B: Try without sslmode parameter**
```env
DATABASE_URL="postgresql://postgres:data-analytics-app@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres"
```

**Option C: Check Supabase Status Page**
- Visit [status.supabase.com](https://status.supabase.com)
- Check if there are service issues

### 6. Password Reset

If connection still fails:
1. Go to Supabase → Settings → Database
2. Click "Reset password"
3. Create new password
4. Copy new connection string
5. Update `.env` and `.env.local`

## Next Steps

Try the following in order:

**Step 1:** Verify Supabase project is running
- Dashboard should show "Running" status

**Step 2:** Test with URL-encoded password
```env
DATABASE_URL="postgresql://postgres:data%2Danalytics%2Dapp@db.jbbrcymgfeixfnetndez.supabase.co:5432/postgres?sslmode=require"
```

**Step 3:** Check if it's a network issue
- Try from different network (mobile hotspot, different WiFi)
- Contact your ISP if consistently blocked

**Step 4:** Reset password and try again
- New password might work better

**Step 5:** Contact Supabase Support
- If nothing works, Supabase has excellent support
- Share your project ID and error message

## Commands to Run

Once connection is working:

```bash
# Create tables
npx prisma db push

# View database
npx prisma studio

# Test app
npm run dev
```

---

**Current Status:**
- Database: Configured ✅
- Connection String: Valid ✅
- Network Issue: Investigating 🔍
