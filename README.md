# Data Analytics Full-Stack Web Application

A comprehensive full-stack web application built with Next.js 16 for collecting, storing, analyzing, and visualizing data. This application provides basic data analytics features including summaries, trends, and interactive charts.

## Features

- **Data Collection**: Form-based data entry with validation
- **CSV Import**: Bulk data import from CSV files with validation
- **Data Storage**: Relational database using Prisma ORM (SQLite for development, MySQL for production)
- **Advanced Data Analysis**: Comprehensive statistical analysis with trend analysis
  - Total/average/min/max calculations
  - Category-based aggregations
  - Daily trend analysis with linear regression
  - Real-time trend indicators (increasing/decreasing/stable)
- **Advanced Filtering**: Date range, category, source, and text search filters
- **Data Visualization**: Multiple interactive charts
  - Bar charts for category sums
  - Line charts for daily trends
  - Pie charts for category distribution
  - Scatter plots for value distribution over time
- **Pagination**: Server-side pagination for large datasets
- **Data Export**: CSV and JSON export with applied filters
- **Bulk Operations**: Select and bulk delete multiple entries
- **CRUD Operations**: Create, Read, Update, Delete with inline editing
- **Responsive UI**: Built with Tailwind CSS

## Technologies Used

- **Frontend & Backend**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Supabase (scalable, open-source database)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2 (Bar, Line, Pie, Scatter)
- **TypeScript**: For type safety
- **Error Monitoring**: Sentry (error tracking & performance monitoring)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. **Set up the database:**
   
   **For Supabase (Recommended):**
   - Create free account at [app.supabase.com](https://app.supabase.com)
   - Create a new project (PostgreSQL)
   - Copy connection string from Settings → Database
   - Update `DATABASE_URL` in `.env.local`
   - See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup
   
   **For Local PostgreSQL:**
   - Ensure local PostgreSQL is running
   - Update `DATABASE_URL` in `.env.local`

   Then push schema:
   ```bash
   npx prisma db push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/data/          # API routes for data operations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── DataInput.tsx      # Data entry form
│   └── Dashboard.tsx      # Analytics dashboard
├── lib/
│   └── prisma.ts          # Database client
├── prisma/
│   └── schema.prisma      # Database schema
└── public/                # Static assets
```

## API Endpoints

- `POST /api/data` - Add new data entry
- `GET /api/data` - Retrieve all data with analytics

## Data Model

```prisma
model DataEntry {
  id        Int      @id @default(autoincrement())
  timestamp DateTime @default(now())
  value     Float
  category  String
  source    String
}
```

## Learning Objectives Achieved

1. ✅ Built a full-stack application using Next.js 16
2. ✅ Designed and managed a relational database
3. ✅ Used an ORM (Prisma) to interact with the database
4. ✅ Collected and analyzed application data
5. ✅ Displayed analytics using charts and dashboards
6. 🔄 Apply version control using Git and GitHub (pending)
7. 🔄 Deploy a web application to a cloud platform (pending)
8. ✅ Monitor errors and performance using Sentry

## CSV Import

The application supports bulk data import via CSV files. This feature allows you to upload multiple data entries at once.

### CSV Format

Your CSV file should contain the following columns (case-insensitive):

- `value` (required): Numeric value (e.g., 123.45)
- `category` (required): Category name (max 100 characters)
- `source` (required): Data source (max 100 characters)
- `timestamp` (optional): ISO 8601 date string (e.g., 2026-01-13T10:00:00Z). If not provided, current timestamp is used.

### Example CSV

```csv
timestamp,value,category,source
2026-01-13T10:00:00Z,123.45,Sales,API
2026-01-13T11:00:00Z,234.56,Revenue,Manual
2026-01-13T12:00:00Z,345.67,Expenses,Import
```

### How to Import

1. Navigate to the main page
2. Click on the "CSV Import" tab in the Data Entry section
3. Select your CSV file
4. Click "Import CSV"
5. Review the import results (successful imports and any errors)

### Validation Rules

- Values must be positive numbers (≤ 1,000,000)
- Category and source are required and limited to 100 characters
- Timestamps must be valid ISO 8601 format
- Duplicate entries (same value, category, source within 1 hour) are rejected
- Files must be valid CSV format

## Deployment to Vercel

This app is production-ready and designed for Vercel deployment.

### Database for Production

**Supabase (Recommended)**
- PostgreSQL database with auto-scaling
- Free tier for development
- Automatic backups and RLS
- Easy Vercel integration

### Deployment Steps

1. **Set up Supabase:**
   - Create account at [app.supabase.com](https://app.supabase.com)
   - Create new project
   - Get connection string

2. **Deploy to Vercel:**
   - Connect your GitHub repo to Vercel
   - Vercel auto-detects Next.js
   - Add `DATABASE_URL` environment variable:
     - Value: Your Supabase connection string
   - Deploy

3. **Alternative: Vercel Integration**
   - In Supabase: Settings → Integrations → Vercel
   - Automatically adds `DATABASE_URL` to your Vercel project
   - Just push your code!

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.

### Environment Variables for Vercel

Set in Vercel Project Settings → Environment Variables:

```
DATABASE_URL=postgresql://postgres:[password]@db.[region].supabase.co:5432/postgres?sslmode=require
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NODE_ENV=production
```

For source maps upload (optional):
```
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project  
SENTRY_AUTH_TOKEN=your-token
```

```bash
npx prisma migrate deploy
npx prisma generate
```

**Important:** You must set `DATABASE_URL` for the application to work. The application requires a Supabase (PostgreSQL) database connection. See `SUPABASE_SETUP.md` and `VERCEL_DEPLOYMENT.md` for detailed configuration instructions.

## Sentry Error Monitoring & Performance Tracking

This project is fully integrated with **Sentry** for comprehensive error monitoring and performance tracking.

### Features
- ✅ Automatic error capture (frontend & backend)
- ✅ Performance monitoring & RUM (Real User Monitoring)
- ✅ Session replay for debugging
- ✅ Release tracking

### Setup
See [SENTRY_SETUP.md](SENTRY_SETUP.md) for detailed setup instructions.

Quick start:
1. Create a free account at [sentry.io](https://sentry.io)
2. Create a project and get your DSN
3. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your-key@sentry.io/your-project-id
   SENTRY_DSN=https://your-key@sentry.io/your-project-id
   ```
4. Restart dev server or deploy - errors will be reported automatically!

## Future Enhancements

- Add more advanced analytics (correlation, forecasting)
- Implement user authentication
- Add more export formats (PDF, Excel)
- Advanced Sentry alerting rules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License."# Project-1" 
"# Project-1" 
#   f i r s t - w e b - a p p 
 
 #   f i r s t - w e b - a p p 
 
 "# first-web-app" 
"# first-web-app" 
