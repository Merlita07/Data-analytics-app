# Database Scripts & Data Fetching Summary

## Overview
This document provides a comprehensive scan of all database-related scripts and data fetching mechanisms in the Data Analytics Full-Stack Web Application.

---

## 1. API Routes for Data Operations

### File: [app/api/data/route.ts](app/api/data/route.ts)

#### POST Request - Create Data Entry
**Purpose:** Add new data entry to the database

**Validation:**
- Required fields: `value`, `category`, `source`
- Value must be a positive number (0 < value ≤ 1,000,000)
- Category and source limited to 100 characters
- Duplicate detection: checks for identical entries within the last hour

**Database Operations:**
```typescript
// Check for duplicates
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
const existingEntry = await prisma.dataEntry.findFirst({
  where: {
    value: numValue,
    category,
    source,
    timestamp: { gte: oneHourAgo }
  }
})

// Create entry
const dataEntry = await prisma.dataEntry.create({
  data: {
    value: numValue,
    category: category.trim(),
    source: source.trim(),
  },
})
```

**Error Handling:**
- Missing DATABASE_URL falls back to sample CSV (read-only mode)
- Validation errors return 400 status
- Duplicate entries return 409 Conflict status
- Database errors captured in Sentry

---

#### GET Request - Fetch Data with Analytics
**Purpose:** Retrieve filtered, paginated data with analytics calculations

**URL Parameters:**
- `page` (default: 1) - Pagination page number
- `limit` (default: 50) - Records per page
- `startDate` - Filter by start timestamp
- `endDate` - Filter by end timestamp
- `category` - Filter by category
- `source` - Filter by source
- `search` - Full-text search (searches value, category, source)

**Filtering Logic:**
```typescript
// Build where clause
const where: any = {}
if (startDate && endDate) {
  where.timestamp = {
    gte: new Date(startDate),
    lte: new Date(endDate),
  }
}
if (category) where.category = category
if (source) where.source = source
if (search) {
  const searchNum = parseFloat(search)
  if (!isNaN(searchNum)) {
    where.OR = [
      { value: searchNum },
      { category: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ]
  } else {
    where.OR = [
      { category: { contains: search, mode: 'insensitive' } },
      { source: { contains: search, mode: 'insensitive' } },
    ]
  }
}

// Fetch data
const data = await prisma.dataEntry.findMany({
  where,
  orderBy: { timestamp: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
})
```

**Fallback Mode (No DATABASE_URL):**
- Attempts to fetch `sample-data.csv` from public directory
- Falls back to local file read if public fetch fails
- Applies same filters to CSV data using Papa Parse
- Sorts by timestamp (descending)
- Implements pagination with array slicing

**Analytics Calculations:**
```typescript
// Computed from filtered data:
- totalEntries: count of returned records
- averageValue: mean of all values
- totalValue: sum of all values
- minValue: minimum value
- maxValue: maximum value
- categories: unique categories in result

// Sum by category
const sumByCategory = categories.map(cat => ({
  category: cat,
  sum: data.filter(d => d.category === cat).reduce((sum, d) => sum + d.value, 0),
  count: data.filter(d => d.category === cat).length,
}))

// Trends by date (YYYY-MM-DD)
const trends = data.reduce((acc, entry) => {
  const date = entry.timestamp.toISOString().split('T')[0]
  if (!acc[date]) acc[date] = { date, total: 0, count: 0 }
  acc[date].total += entry.value
  acc[date].count += 1
  return acc
}, {})

// Linear regression for trend analysis
- trendSlope: rate of change
- trendIntercept: baseline value
- 7-day forecast: predicted values based on trend
```

**Response Structure:**
```json
{
  "data": [...entries],
  "pagination": {
    "page": 1,
    "limit": 50,
    "totalPages": N,
    "totalCount": N
  },
  "analytics": {
    "totalEntries": N,
    "averageValue": N,
    "totalValue": N,
    "minValue": N,
    "maxValue": N,
    "categories": [...],
    "sumByCategory": [...],
    "trends": [...],
    "forecast": [...],
    "trendSlope": N,
    "trendIntercept": N,
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD",
    "category": "string",
    "source": "string",
    "search": "string"
  }
}
```

---

#### PUT Request - Update Data Entry
**Purpose:** Modify existing data entry

**Parameters:**
- `id` (query param, required) - Entry ID
- `value`, `category`, `source` (in body, optional) - Fields to update

**Database Operation:**
```typescript
const updatedEntry = await prisma.dataEntry.update({
  where: { id: parseInt(id) },
  data: updateData,
})
```

**Validation:**
- Validates updated value (same as POST)
- Validates category and source length
- Returns 400 if ID is invalid or missing

---

#### DELETE Request - Remove Data Entry
**Purpose:** Delete single entry or multiple entries in bulk

**Parameters:**
- `id` (query param) - Single entry ID
- `ids` (in body) - Array of entry IDs for bulk delete

**Database Operations:**
```typescript
// Single delete
await prisma.dataEntry.delete({
  where: { id: parseInt(id) },
})

// Bulk delete
await prisma.dataEntry.deleteMany({
  where: { id: { in: ids.map(id => parseInt(id)) } },
})
```

---

### File: [app/api/data/export/route.ts](app/api/data/export/route.ts)

#### GET Request - Export Data
**Purpose:** Export filtered data as CSV or JSON

**URL Parameters:**
- `format` (default: 'csv') - Export format: `csv` or `json`
- `startDate` - Filter by start timestamp
- `endDate` - Filter by end timestamp
- `category` - Filter by category
- `source` - Filter by source

**Filtering Logic:**
Same as GET `/api/data` endpoint, but exports ALL filtered records (no pagination)

**Database Operation:**
```typescript
data = await prisma.dataEntry.findMany({
  where,
  orderBy: { timestamp: 'desc' },
})
```

**Fallback Mode:**
- Uses same CSV fallback as GET `/api/data`
- Applies filters to CSV data using Papa Parse

**Output:**
- **CSV Format:** Returns downloadable CSV file with headers: ID,Timestamp,Value,Category,Source
- **JSON Format:** Returns JSON array of data entries

**Response Headers (CSV):**
```
Content-Type: text/csv
Content-Disposition: attachment; filename=data-export.csv
```

---

### File: [app/api/data/import/route.ts](app/api/data/import/route.ts)

#### POST Request - Import CSV Data
**Purpose:** Bulk import data from CSV file

**Request Format:**
- `Content-Type: multipart/form-data`
- Form field: `file` (CSV file)

**CSV Column Requirements:**
`timestamp, value, category, source`

**Processing Steps:**
1. Validate file type (CSV)
2. Parse CSV using Papa Parse
3. Validate each row:
   - Value must be positive number ≤ 1,000,000
   - Category and source ≤ 100 characters
   - Required fields present
4. Check for duplicates within last hour
5. Batch insert valid entries

**Database Operation:**
```typescript
const entries = await prisma.dataEntry.createMany({
  data: validEntries,
  skipDuplicates: true,
})
```

**Response:**
```json
{
  "imported": N,
  "failed": N,
  "errors": [...]
}
```

---

## 2. Frontend Data Fetching

### File: [components/Dashboard.tsx](components/Dashboard.tsx)

#### Main fetchData Function
**Purpose:** Fetch paginated data with filters from backend API

**Function Signature:**
```typescript
const fetchData = async (page = 1, isAutoRefresh = false) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: '50',
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    ),
  })
  
  const response = await fetch(`/api/data?${params}`)
  if (response.ok) {
    const result = await response.json()
    setData(result.data)
    setAnalytics(result.analytics)
    setTotalPages(result.pagination.totalPages)
    setCurrentPage(result.pagination.page)
  }
}
```

**Filter State Management:**
```typescript
const [filters, setFilters] = useState({
  startDate: '',
  endDate: '',
  category: '',
  source: '',
  search: '',
})

const handleFilterChange = (key: string, value: string) => {
  setFilters(prev => ({ ...prev, [key]: value }))
  setCurrentPage(1) // Reset to first page when filtering
}
```

**Auto-Refresh Feature:**
```typescript
// Auto-refresh every X seconds if enabled
useEffect(() => {
  let intervalId: NodeJS.Timeout
  if (autoRefresh) {
    intervalId = setInterval(() => {
      fetchData(currentPage, true)
    }, refreshInterval)
  }
  return () => clearInterval(intervalId)
}, [autoRefresh, refreshInterval, currentPage, filters])
```

**Pagination:**
- Shows 5 page buttons around current page
- Displays total pages
- Next/Previous buttons with state validation

**State Management:**
```typescript
const [data, setData] = useState<DataEntry[]>([])
const [analytics, setAnalytics] = useState<Analytics | null>(null)
const [currentPage, setCurrentPage] = useState(1)
const [totalPages, setTotalPages] = useState(0)
const [loading, setLoading] = useState(true)
const [autoRefresh, setAutoRefresh] = useState(false)
const [refreshInterval, setRefreshInterval] = useState(5000) // 5 seconds
```

---

### File: [components/DataInput.tsx](components/DataInput.tsx)

#### Manual Data Entry
**Purpose:** Add single data entry via form

**Validation:**
```typescript
- Value: positive number > 0, ≤ 1,000,000
- Category: required, 0-100 characters
- Source: required, 0-100 characters
```

**Submit Handler:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      value: numValue.toString(),
      category: category.trim(),
      source: source.trim()
    }),
  })
}
```

**Error Handling:**
- Display validation errors from server
- Show success/failure messages
- Clear form on success

#### CSV Import
**Purpose:** Bulk import data from CSV file

**File Upload Handler:**
```typescript
const handleImportFile = async (e: React.FormEvent) => {
  const formData = new FormData()
  formData.append('file', importFile)
  
  const response = await fetch('/api/data/import', {
    method: 'POST',
    body: formData,
  })
}
```

**CSV Format Expected:**
```
timestamp,value,category,source
2024-01-15T10:30:00Z,150,Sales,API
```

---

## 3. Database Import Scripts

### File: [scripts/import_to_supabase.ps1](scripts/import_to_supabase.ps1)

**Purpose:** Import sample-data.csv into Supabase PostgreSQL database

**Prerequisites:**
1. PostgreSQL `psql` client installed
2. `DATABASE_URL` environment variable set or `-PgConn` parameter passed
3. `DataEntry` table created in Supabase

**Table Schema (Required):**
```sql
CREATE TABLE IF NOT EXISTS "DataEntry" (
  id serial PRIMARY KEY,
  timestamp timestamptz,
  value numeric,
  category text,
  source text
);
```

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import_to_supabase.ps1 `
  -CsvPath .\sample-data.csv `
  -PgConn $env:DATABASE_URL
```

**Import Method:**
Uses `\copy` command with psql:
```powershell
\copy "DataEntry"(timestamp, value, category, source) 
FROM 'path/to/sample-data.csv' 
WITH (FORMAT csv, HEADER true)
```

**Error Handling:**
- Validates CSV file exists
- Checks for psql availability
- Validates connection string
- Provides clear error messages

**Verification:**
```sql
SELECT count(*) FROM "DataEntry";
```

---

### File: [scripts/import_to_xampp.ps1](scripts/import_to_xampp.ps1)

**Purpose:** Import sample-data.csv into local MySQL (XAMPP) database

**Prerequisites:**
1. MySQL client installed or XAMPP installed at `C:\xampp\mysql\bin\mysql.exe`
2. `DATABASE_URL` environment variable set or `-DbConn` parameter passed
3. MySQL database created
4. `DataEntry` table created

**Table Schema (Required):**
```sql
CREATE TABLE IF NOT EXISTS DataEntry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME,
  value DOUBLE,
  category VARCHAR(255),
  source VARCHAR(255)
);
```

**Connection String Format:**
```
mysql://user:password@host:port/database
```

**Usage:**
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\import_to_xampp.ps1 `
  -CsvPath .\sample-data.csv `
  -DbConn "mysql://root:password@127.0.0.1:3306/data_analytics"
```

**Import Steps:**
1. Creates temporary SQL file with CREATE TABLE statement
2. Executes table creation via mysql client
3. Uses `LOAD DATA LOCAL INFILE` for bulk import

**Import Command:**
```sql
LOAD DATA LOCAL INFILE 'path/to/sample-data.csv' 
INTO TABLE DataEntry 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n' 
IGNORE 1 LINES (timestamp, value, category, source);
```

**Error Handling:**
- Validates CSV file exists
- Parses connection string
- Checks MySQL client availability
- Validates table creation
- Provides exit codes on failure

**Verification:**
```sql
SELECT COUNT(*) FROM DataEntry;
```

---

## 4. Database Client

### File: [lib/prisma.ts](lib/prisma.ts)

**Purpose:** Singleton Prisma Client initialization

**Features:**
- Global singleton pattern to prevent multiple instances
- Graceful error handling for missing DATABASE_URL
- Returns proxy that throws clear error message if DB unavailable

**Implementation:**
```typescript
const prisma = ((): any => {
  if (!process.env.DATABASE_URL) {
    return createMissingEnvProxy(
      'Environment variable DATABASE_URL is not set. Set DATABASE_URL in your environment or Vercel project settings.'
    )
  }
  
  const client = globalForPrisma.prisma ?? new PrismaClient()
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = client
  }
  return client
})()
```

---

## 5. Prisma Schema

### File: [prisma/schema.prisma](prisma/schema.prisma)

**Data Model:**
```prisma
model DataEntry {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())
  value     Float
  category  String   @db.VarChar(100)
  source    String   @db.VarChar(100)
}
```

**Supported Databases:**
- MySQL
- PostgreSQL (Supabase)
- SQLite (fallback)

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│  DataInput.tsx         │         Dashboard.tsx                   │
│  ├─ Manual Entry       │         ├─ Filter Form                 │
│  └─ CSV Import         │         ├─ Data Table                  │
│                        │         ├─ Analytics Charts            │
│                        │         └─ Pagination                  │
└────────────┬───────────┴─────────────┬─────────────────────────┘
             │                         │
             │ POST/multipart          │ GET + filters
             │                         │
┌────────────▼──────────────────────────▼─────────────────────────┐
│                        API ROUTES                                │
├──────────────────────────────────────────────────────────────────┤
│  /api/data            │  /api/data/import    │  /api/data/export│
│  ├─ POST (Create)     │  ├─ CSV parsing      │  ├─ CSV export   │
│  ├─ GET (Read)        │  ├─ Validation       │  └─ JSON export  │
│  ├─ PUT (Update)      │  └─ Batch insert     │                  │
│  └─ DELETE (Delete)   │                      │                  │
└────────────┬──────────┴──────────────┬────────┴──────────────────┘
             │                         │
             │ Prisma ORM              │ CSV Parsing (Papa Parse)
             │                         │
┌────────────▼─────────────────────────▼──────────────────────────┐
│                     DATA LAYER                                   │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐        ┌────────────────┐                │
│  │ Prisma Client    │        │ CSV Fallback   │                │
│  │ (if DATABASE_URL)│        │ (sample-data)  │                │
│  │                  │        │                │                │
│  │ ├─ findMany()    │        │ Papa.parse()   │                │
│  │ ├─ findFirst()   │        │ Filter & sort  │                │
│  │ ├─ create()      │        │ Pagination     │                │
│  │ ├─ update()      │        │                │                │
│  │ ├─ delete()      │        │                │                │
│  │ └─ count()       │        │                │                │
│  └──────────────────┘        └────────────────┘                │
└────────────┬─────────────────────────┬──────────────────────────┘
             │                         │
┌────────────▼─────────────────────────▼──────────────────────────┐
│                   DATABASE LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐    ┌────────────────┐    ┌───────────────┐ │
│  │   Supabase     │    │  Local MySQL   │    │   SQLite      │ │
│  │  (PostgreSQL)  │    │   (XAMPP)      │    │  (Fallback)   │ │
│  └────────────────┘    └────────────────┘    └───────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Key Features Summary

| Feature | Implementation | Location |
|---------|-----------------|----------|
| **CRUD Operations** | Prisma ORM | `/api/data` |
| **Filtering** | WHERE clauses | `/api/data` GET |
| **Pagination** | Skip/Take pattern | Dashboard.tsx |
| **Analytics** | In-memory calculations | `/api/data` GET |
| **Trends** | Date grouping + linear regression | `/api/data` GET |
| **Forecasting** | 7-day prediction | `/api/data` GET |
| **CSV Import** | Papa Parse + bulk insert | `/api/data/import` |
| **CSV Export** | Dynamic file generation | `/api/data/export` |
| **Data Validation** | Multi-layer validation | DataInput.tsx + `/api/data` |
| **Auto-refresh** | useEffect interval | Dashboard.tsx |
| **Error Handling** | Sentry integration | All API routes |
| **Fallback Mode** | Sample CSV when no DB | `/api/data` + `/api/data/export` |

---

## 8. Error Scenarios & Handling

### Missing DATABASE_URL
- **Symptom:** Prisma throws `PrismaClientInitializationError`
- **Response:** API falls back to `sample-data.csv` (read-only mode)
- **Endpoint:** Affects POST, PUT, DELETE (return 503)

### Invalid CSV Import
- **Validation Errors:** Returns 400 with field-level errors
- **Duplicate Entries:** Returns 409 Conflict status
- **Import Partial Success:** Returns import count and failed entries list

### Network/Fetch Errors
- **Sentry Capture:** All errors logged with tags
- **User Feedback:** Error messages displayed in UI
- **Graceful Degradation:** Sample CSV fallback attempts

---

## 9. Performance Considerations

1. **Pagination:** Default limit of 50 records per page
2. **Indexing (Recommended):**
   ```sql
   CREATE INDEX idx_category ON "DataEntry"(category);
   CREATE INDEX idx_timestamp ON "DataEntry"(timestamp);
   CREATE INDEX idx_source ON "DataEntry"(source);
   ```
3. **Analytics:** Calculated on filtered dataset (memory-efficient)
4. **CSV Parsing:** Papa Parse handles large files with streaming
5. **Duplicate Detection:** Only checks last hour to limit query cost

---

## Sample Data

**File:** [sample-data.csv](sample-data.csv)

**Format:**
```csv
timestamp,value,category,source
2024-01-15T10:30:00Z,150.5,Sales,API
2024-01-15T11:45:00Z,200.0,Marketing,Web
2024-01-16T09:00:00Z,175.25,Support,Mobile
```

---

## Testing Database Scripts

### Test Supabase Import:
```powershell
$env:DATABASE_URL = "postgresql://user:password@host:port/database"
.\scripts\import_to_supabase.ps1 -CsvPath .\sample-data.csv
```

### Test XAMPP Import:
```powershell
$env:DATABASE_URL = "mysql://root:password@127.0.0.1:3306/data_analytics"
.\scripts\import_to_xampp.ps1 -CsvPath .\sample-data.csv
```

### Verify Data:
```bash
# Via API
curl "http://localhost:3000/api/data?limit=10"

# Via direct DB
# Supabase: SELECT COUNT(*) FROM "DataEntry";
# MySQL: SELECT COUNT(*) FROM DataEntry;
```

---

**Last Updated:** January 16, 2026  
**Status:** Complete Documentation
