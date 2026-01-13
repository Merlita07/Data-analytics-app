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
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2 (Bar, Line, Pie, Scatter)
- **TypeScript**: For type safety
- **Deployment**: Vercel (planned)

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

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
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
8. 🔄 Monitor errors and performance using Sentry (pending)

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

This application is configured for deployment on Vercel with the following setup:

### Prerequisites

- Vercel account
- MySQL database (PlanetScale, AWS RDS, or similar)

### Environment Variables

Set the following environment variables in your Vercel project:

```bash
DATABASE_URL=mysql://username:password@host:port/database_name
```

### Deployment Steps

1. **Connect Repository:**
   - Import your GitHub repository to Vercel
   - Vercel will automatically detect Next.js

2. **Configure Build Settings:**
   - **Build Command:** `npm run build` (automatically includes Prisma generation)
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. **Set Environment Variables:**
   - Add `DATABASE_URL` with your production MySQL connection string

4. **Database Setup:**
   - Run Prisma migrations in production:
   ```bash
   npx prisma migrate deploy
   ```

5. **Deploy:**
   - Vercel will automatically build and deploy on git push

### Vercel Configuration

The `vercel.json` file includes:
- API function timeout settings (10 seconds)
- CORS headers for API routes
- Proper routing for Next.js App Router

### Production Database

For production, switch from SQLite to MySQL:
1. Update `DATABASE_URL` in environment variables
2. Run migrations: `npx prisma migrate deploy`
3. Generate Prisma client: `npx prisma generate`

### Additional Resources

- See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions
- Check `.env.example` for required environment variables

## Future Enhancements

- Switch to MySQL for production (partially done - configured for production)
- Add more advanced analytics (correlation, forecasting)
- Implement user authentication
- Add more export formats (PDF, Excel)
- Integrate Sentry for error monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.