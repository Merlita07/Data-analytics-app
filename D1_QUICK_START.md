# Cloudflare D1 Quick Start (5 minutes)

Use this if you want to switch from local SQLite to Cloudflare D1 database.

---

## 1️⃣ Create Cloudflare Account

Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and sign up.

---

## 2️⃣ Create D1 Database

1. In Cloudflare dashboard
2. **Workers & Pages** → **D1**
3. **Create database**
4. Name: `data-analytics-app`
5. Click **Create**

---

## 3️⃣ Get Database ID

```bash
npx wrangler d1 list
```

Copy the **Database ID** shown.

---

## 4️⃣ Create Table

```bash
npx wrangler d1 execute data-analytics-app --command "
CREATE TABLE IF NOT EXISTS DataEntry (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  value REAL NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL
);"
```

---

## 5️⃣ Test Connection

```bash
npx wrangler d1 execute data-analytics-app --command "SELECT COUNT(*) FROM DataEntry;"
```

Should return `0` rows.

---

## 6️⃣ Update Environment

No code changes needed! Your app already works with SQLite.

For **Vercel deployment**, add environment variables:
- `CF_API_TOKEN` (from Cloudflare)
- `CF_ACCOUNT_ID` (from Cloudflare)

---

## That's It! 🎉

Your D1 database is ready. Migrate data anytime using:

```bash
sqlite3 dev.db ".dump" | npx wrangler d1 execute data-analytics-app --stdin
```

---

**Keep using local SQLite for development**. D1 is best for production (Vercel).

See [CLOUDFLARE_D1_SETUP.md](CLOUDFLARE_D1_SETUP.md) for detailed setup.
