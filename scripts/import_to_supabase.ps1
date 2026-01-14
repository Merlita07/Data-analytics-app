<#
.SYNOPSIS
PowerShell helper to import `sample-data.csv` into a Supabase (Postgres) database.

# USAGE
# 1) Ensure your Supabase/Postgres connection string is available in the env var `DATABASE_URL` or pass it with `-PgConn`.
# 2) Create the `DataEntry` table in Supabase (see `Create table` section below) or adjust the column list.
# 3) Run from repository root:
#    powershell -ExecutionPolicy Bypass -File .\scripts\import_to_supabase.ps1 -CsvPath .\sample-data.csv

This script uses the `psql` client and the `\copy` command to import CSV data quickly.
If you prefer a GUI, you can upload the CSV in the Supabase Table Editor (Import CSV).
#>

param(
    [string]$CsvPath = "./sample-data.csv",
    [string]$PgConn = $env:DATABASE_URL
)

Write-Host "Import to Supabase helper"

if (-not (Test-Path $CsvPath)) {
    Write-Error "CSV file not found: $CsvPath"
    exit 1
}

if (-not $PgConn) {
    Write-Host "No connection string provided via -PgConn; checking env var DATABASE_URL..."
    if (-not $env:DATABASE_URL) {
        Write-Error "Please set the environment variable DATABASE_URL or pass -PgConn with your Supabase Postgres connection string."
        exit 1
    }
    $PgConn = $env:DATABASE_URL
}

# Check for psql
$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
    Write-Warning "psql client not found. Install the PostgreSQL client or use the Supabase UI to import CSV: https://app.supabase.com"
    exit 1
}

Write-Host "Using CSV: $CsvPath"
Write-Host "Using PG conn: (redacted)"

Write-Host "-- Create table reminder --"
Write-Host "If you don't already have the table in Postgres, create it in Supabase SQL Editor (adjust types as needed):"
@"
CREATE TABLE IF NOT EXISTS "DataEntry" (
  id serial PRIMARY KEY,
  timestamp timestamptz,
  value numeric,
  category text,
  source text
);
"@

Write-Host "Attempting to import CSV using psql and \copy..."

$copySql = "\copy \"DataEntry\"(timestamp, value, category, source) FROM '$((Resolve-Path $CsvPath).Path)' WITH (FORMAT csv, HEADER true)"

try {
    & psql $PgConn -c $copySql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Import completed successfully."
    } else {
        Write-Error "psql returned exit code $LASTEXITCODE. Check connection string and table schema."
        exit $LASTEXITCODE
    }
} catch {
    Write-Error "Import failed: $_"
    exit 1
}

Write-Host "Done. If you used Supabase, verify rows in the Table Editor or run: SELECT count(*) FROM \"DataEntry\";"
