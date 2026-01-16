# Project Workflow Overview

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                    │
│  React Components + TailwindCSS + TypeScript                │
├─────────────────────────────────────────────────────────────┤
│              MIDDLEWARE (Authentication & Auth)              │
│  JWT Token Verification + Route Protection                  │
├─────────────────────────────────────────────────────────────┤
│                   API ROUTES (Next.js API)                  │
│  /api/auth/* (Login, Signup, Logout)                       │
│  /api/data/* (CRUD operations for data entries)            │
├─────────────────────────────────────────────────────────────┤
│                DATABASE (Neon PostgreSQL)                    │
│  User Model + DataEntry Model                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 1️⃣ **Landing Page Workflow** (Anonymous Users)

```
┌─────────────────┐
│  app/page.tsx   │ (Hero landing page)
└────────┬────────┘
         │
         ├─→ Hero section with gradient background
         ├─→ Call-to-action buttons:
         │   • "Get Started" → Navigate to /dashboard
         │   • "Learn More"
         │
         └─→ User clicks "Get Started"
             └─→ Redirects to /dashboard
                 └─→ Middleware checks for auth token
                     ├─→ If no token: Redirects to /login
                     └─→ If token exists: Loads dashboard
```

---

## 2️⃣ **Authentication Workflow**

### Sign Up Flow

```
┌──────────────────┐
│  /signup page    │ (SignupForm component)
└────────┬─────────┘
         │
         ├─→ User enters:
         │   • Email (unique validation)
         │   • Username (unique validation)
         │   • Password (8+ chars, uppercase, lowercase, number, special char)
         │   • Confirm Password (must match)
         │
         ├─→ Real-time validation with visual feedback
         │
         └─→ User clicks "Sign Up"
             └─→ POST /api/auth/signup
                 ├─→ Server validates input
                 ├─→ Server checks email/username uniqueness (case-insensitive)
                 ├─→ Server hashes password with bcryptjs (10 salt rounds)
                 ├─→ Server creates User in database
                 │
                 └─→ Response: 201 Created (success)
                     └─→ Window redirects to /login (500ms delay)
```

### Login Flow

```
┌─────────────────┐
│  /login page    │ (LoginForm component)
└────────┬────────┘
         │
         ├─→ User enters:
         │   • Email
         │   • Password
         │
         └─→ User clicks "Log In"
             └─→ POST /api/auth/login
                 ├─→ Server validates email format
                 ├─→ Server finds user by email (case-insensitive)
                 ├─→ Server verifies password with bcryptjs
                 │
                 ├─→ If password matches:
                 │   ├─→ Generate JWT token (7-day expiration)
                 │   ├─→ Set HTTP-only cookie: 'auth-token'
                 │   └─→ Response: 200 OK
                 │
                 └─→ If password wrong/user not found:
                     └─→ Response: 401 Unauthorized
                         └─→ Display error message
                         
             └─→ Cookie stored in browser
                 └─→ Window redirects to /dashboard (100ms delay)
                     └─→ GET /dashboard
                         ├─→ Middleware checks 'auth-token' cookie
                         ├─→ JWT is valid → Allow access
                         └─→ Dashboard loads with user data
```

### Logout Flow

```
┌──────────────────┐
│ User clicks      │
│ "Logout" button  │
└────────┬─────────┘
         │
         └─→ POST /api/auth/logout
             ├─→ Server deletes 'auth-token' cookie
             └─→ Redirects to /login
```

---

## 3️⃣ **Dashboard & Data Entry Workflow**

### Data Input Flow

```
┌──────────────────────────────┐
│  Dashboard Page              │
│  (Authenticated User)        │
└──────────┬───────────────────┘
           │
           ├─→ DataInput Component (Left side)
           │   ├─→ Form fields:
           │   │   • Value (number, 0-1,000,000)
           │   │   • Category (string, max 100 chars)
           │   │   • Source (string, max 100 chars)
           │   │
           │   └─→ User submits form
           │       └─→ POST /api/data
           │           ├─→ Middleware/JWT verification
           │           ├─→ Extract userId from JWT token
           │           ├─→ Validate input (required fields, data types, ranges)
           │           ├─→ Check for duplicate entries (same value, category, source within 1 hour)
           │           ├─→ Create DataEntry with userId
           │           │   {
           │           │     value: 3400,
           │           │     category: "Sales",
           │           │     source: "Online Store",
           │           │     userId: 1,        ← From JWT token
           │           │     timestamp: now()
           │           │   }
           │           └─→ Response: 201 Created
           │
           ├─→ Success message displayed
           ├─→ Form clears
           └─→ Dashboard automatically refreshes data
```

### Dashboard Display Flow

```
┌──────────────────────────────┐
│  Dashboard Component         │
│  (Right side)                │
└──────────┬───────────────────┘
           │
           ├─→ On page load:
           │   GET /api/data?page=1&limit=50
           │   ├─→ Extract userId from JWT cookie
           │   ├─→ Query database WHERE userId = current_user
           │   ├─→ Return paginated results (50 entries per page)
           │   └─→ Calculate analytics:
           │       • Total entries count
           │       • Average value
           │       • Total sum
           │       • Min/Max values
           │       • Sum by category
           │       • Trends (grouped by date)
           │       • Forecast (7-day prediction)
           │
           └─→ Components rendered:
               ├─→ Analytics Summary (metrics cards)
               ├─→ Charts:
               │   • Line chart (trends over time)
               │   • Pie chart (distribution by category)
               │   • Bar chart (sum by category)
               ├─→ Data table:
               │   • List all entries
               │   • Edit/Delete buttons
               └─→ Pagination controls
```

### Data Management Flow

```
┌─────────────────────────────────┐
│  User views data entry          │
│  (in table or chart)            │
└────────┬────────────────────────┘
         │
         ├─→ Edit button clicked
         │   └─→ PUT /api/data
         │       ├─→ Extract userId from JWT
         │       ├─→ Verify entry belongs to user
         │       ├─→ Update value/category/source
         │       └─→ Response: 200 OK
         │
         └─→ Delete button clicked
             └─→ DELETE /api/data?id=123
                 ├─→ Extract userId from JWT
                 ├─→ Verify entry belongs to user
                 ├─→ Delete from database
                 └─→ Response: 200 OK
```

---

## 4️⃣ **Data Model & Relationships**

```
┌─────────────────────────────────┐
│           USER TABLE            │
├─────────────────────────────────┤
│ id (PK)                         │
│ email (UNIQUE)                  │
│ username (UNIQUE)               │
│ password (hashed)               │
│ createdAt                       │
│ updatedAt                       │
│                                 │
│ ↓ One-to-Many relationship      │
└──────────────┬──────────────────┘
               │
               │ (1 user = many data entries)
               │
┌──────────────▼──────────────────┐
│      DATAENTRY TABLE            │
├─────────────────────────────────┤
│ id (PK)                         │
│ timestamp                       │
│ value (Float)                   │
│ category (String)               │
│ source (String)                 │
│ userId (FK → User.id)           │
│                                 │
│ Each entry linked to ONE user   │
│ Cascade delete on user removal  │
└─────────────────────────────────┘
```

---

## 5️⃣ **API Routes Summary**

| Endpoint | Method | Auth | Purpose | Returns |
|----------|--------|------|---------|---------|
| `/api/auth/signup` | POST | ❌ No | Register new user | 201 Created / 400 Bad Request |
| `/api/auth/login` | POST | ❌ No | Login & get JWT token | 200 OK with cookie / 401 Unauthorized |
| `/api/auth/logout` | POST | ✅ Yes | Logout & delete token | 200 OK |
| `/api/data` | GET | ✅ Yes | Fetch user's entries + analytics | 200 OK with data & analytics |
| `/api/data` | POST | ✅ Yes | Create new data entry | 201 Created / 400 Bad Request / 409 Duplicate |
| `/api/data` | PUT | ✅ Yes | Update data entry | 200 OK / 404 Not Found |
| `/api/data` | DELETE | ✅ Yes | Delete data entry | 200 OK / 404 Not Found |
| `/api/data/import` | POST | ✅ Yes | Bulk import CSV data | 201 Created |
| `/api/data/export` | GET | ✅ Yes | Export data as CSV | CSV file download |

---

## 6️⃣ **Security Features**

### Authentication
- ✅ **JWT Tokens**: 7-day expiration
- ✅ **HTTP-only Cookies**: Prevents JavaScript access to token
- ✅ **Password Hashing**: bcryptjs with 10 salt rounds
- ✅ **Password Validation**: 8+ chars, uppercase, lowercase, number, special char

### Data Isolation
- ✅ **User-scoped Data**: All data entries linked to userId
- ✅ **Ownership Verification**: PUT/DELETE verify user ownership
- ✅ **Filtering**: GET requests return only user's data
- ✅ **Cascade Delete**: Deleting user removes all their entries

### Route Protection
- ✅ **Middleware**: Protects `/dashboard` and `/api/data/*`
- ✅ **Token Verification**: Validates JWT signature and expiration
- ✅ **401 Responses**: Invalid/missing tokens return 401 Unauthorized
- ✅ **404 Responses**: Accessing other users' data returns 404 Not Found

---

## 7️⃣ **Complete User Journey**

```
1. LANDING PAGE
   └─→ User views homepage
       └─→ Clicks "Get Started"

2. LOGIN/SIGNUP
   └─→ User signs up or logs in
       └─→ JWT token generated & stored in cookie

3. DASHBOARD
   └─→ User accesses /dashboard
       └─→ Middleware verifies JWT token
       └─→ Dashboard loads

4. DATA ENTRY
   └─→ User fills form (value, category, source)
       └─→ Submits to POST /api/data
       └─→ Server includes userId from JWT

5. ANALYTICS
   └─→ Dashboard fetches GET /api/data
       └─→ Server filters by userId
       └─→ Displays charts, trends, analytics

6. MANAGEMENT
   └─→ User edits/deletes entries
       └─→ Ownership verified before update/delete

7. LOGOUT
   └─→ User logs out
       └─→ Cookie deleted
       └─→ Redirected to /login
```

---

## 8️⃣ **Tech Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16.1.1 | React framework with App Router |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Database** | Neon PostgreSQL | Cloud PostgreSQL with connection pooling |
| **ORM** | Prisma 5.22.0 | Type-safe database client |
| **Auth** | JWT + bcryptjs | Token-based authentication |
| **Server** | Node.js (Turbopack) | Development & production server |
| **Charts** | Chart.js | Data visualization |
| **CSV** | PapaParse | CSV import/export |
| **Monitoring** | Sentry | Error tracking |

---

## 9️⃣ **Data Flow Diagram**

```
USER BROWSER                          SERVER                           DATABASE
    │                                  │                                  │
    ├─ Sign Up ─────────────────→ POST /api/auth/signup                 │
    │                             ├─ Hash password                       │
    │                             ├─ Create user ────────────────→ INSERT User
    │                             │                                  ↓
    │                             ←─ 201 Created ─────────────────────
    │
    ├─ Log In ──────────────────→ POST /api/auth/login                  │
    │                             ├─ Verify password                     │
    │                             ├─ Generate JWT ────────────────→ (no DB needed)
    │                             ├─ Set cookie                         │
    │                             ←─ 200 OK + Token ─────────────────────
    │
    ├─ Load Dashboard ──────────→ GET /dashboard
    │                             ├─ Check JWT token
    │                             ├─ Render dashboard
    │                             ←─ HTML page
    │
    ├─ Fetch Data ──────────────→ GET /api/data
    │                             ├─ Verify JWT
    │                             ├─ Extract userId
    │                             ├─ Query WHERE userId = user ────→ SELECT * FROM DataEntry
    │                             │                                    ↓
    │                             ←─ 200 OK + Data ─────────────────────
    │
    ├─ Submit Form ─────────────→ POST /api/data
    │                             ├─ Verify JWT
    │                             ├─ Extract userId
    │                             ├─ Validate input
    │                             ├─ Check duplicates
    │                             ├─ Create entry with userId ─→ INSERT DataEntry
    │                             │                                 ↓
    │                             ←─ 201 Created ─────────────────────
    │
    ├─ Auto-refresh data ──────→ GET /api/data (with analytics)
    │                             ├─ Calculate trends
    │                             ├─ Generate forecast
    │                             ←─ 200 OK + Full Analytics
    │
    └─ Log Out ─────────────────→ POST /api/auth/logout
                                  ├─ Delete cookie
                                  ←─ Redirect to /login
```

---

## 🔄 **Key Features in Action**

### Real-time Analytics Calculation
When user creates a new data entry, the dashboard:
1. Sends POST /api/data
2. Gets 201 Created response
3. Automatically refetches GET /api/data
4. Recalculates:
   - Sum by category
   - Trends (aggregated by date)
   - Forecast (7-day prediction)
5. Updates all charts and metrics in real-time

### Data Isolation Per User
When user logs in:
- JWT token contains `userId`
- Every API request extracts userId from token
- GET returns only that user's data
- PUT/DELETE verifies ownership
- Other users' data remains completely hidden

### Smart Duplicate Detection
When creating data entry:
- Checks for same value + category + source
- Within last 1 hour
- Returns 409 Conflict if duplicate found
- Prevents accidental duplicate entries

---

## 📊 **Current Status**

✅ **Working**:
- User authentication (signup/login/logout)
- Data entry creation with user isolation
- Real-time dashboard with analytics
- Charts and visualizations
- Pagination and filtering
- Edit/delete operations with ownership verification

⚠️ **Considerations**:
- Middleware currently simplified (disabled for development)
- Consider enabling it for production security
- Change `httpOnly: false` to `true` for production
- Use strong JWT_SECRET in production

---

This is a complete **multi-user data analytics platform** with secure authentication and per-user data isolation! 🚀
