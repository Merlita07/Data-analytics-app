<#
.SYNOPSIS
Import `sample-data.csv` into a local MySQL (XAMPP) database using the `mysql` client.

# USAGE
# 1) Ensure XAMPP MySQL is running and you have a database created.
# 2) Set `DATABASE_URL` in your environment or pass `-DbConn` in the form `mysql://user:pass@host:3306/db`.
# 3) Run:
#    powershell -ExecutionPolicy Bypass -File .\scripts\import_to_xampp.ps1 -CsvPath .\sample-data.csv
#>

param(
    [string]$CsvPath = "./sample-data.csv",
    [string]$DbConn = $env:DATABASE_URL
)

Write-Host "Import to XAMPP/MySQL helper"

if (-not (Test-Path $CsvPath)) {
    Write-Error "CSV file not found: $CsvPath"
    exit 1
}

if (-not $DbConn) {
    Write-Host "No connection string provided via -DbConn; checking env var DATABASE_URL..."
    if (-not $env:DATABASE_URL) {
        Write-Error "Please set the environment variable DATABASE_URL or pass -DbConn with your MySQL connection string. Example: mysql://root:password@127.0.0.1:3306/your_db"
        exit 1
    }
    $DbConn = $env:DATABASE_URL
}

# Parse connection string mysql://user:pass@host:port/db
# Allow empty password (user: @host) and optional matching
if ($DbConn -match '^mysql://([^:]+):?([^@]*)@([^:]+):(\d+)/(.+)$') {
    $user = $matches[1]
    $pass = $matches[2]
    $dbHost = $matches[3]
    $port = $matches[4]
    $db = $matches[5]
} else {
    Write-Error "Invalid MySQL connection string format. Expected: mysql://user:pass@host:port/db"
    exit 1
}

# Locate mysql client: prefer PATH, else try common XAMPP location
$mysqlCmd = $null
try { $mysqlCmd = (Get-Command mysql -ErrorAction SilentlyContinue).Source } catch { }
if (-not $mysqlCmd) {
    $xamppPath = 'C:\\xampp\\mysql\\bin\\mysql.exe'
    if (Test-Path $xamppPath) { $mysqlCmd = $xamppPath }
}
if (-not $mysqlCmd) {
    Write-Warning "mysql client not found. Install MySQL client or use phpMyAdmin in XAMPP."
    exit 1
}

Write-Host ("Using DB: {0}@{1}:{2}/{3} (password hidden)" -f $user, $dbHost, $port, $db)

Write-Host "Creating table if not exists..."
$createSql = @"
CREATE TABLE IF NOT EXISTS DataEntry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME,
  value DOUBLE,
  category VARCHAR(255),
  source VARCHAR(255)
);
"@

$createFile = [IO.Path]::GetTempFileName()
Set-Content -Path $createFile -Value $createSql -Encoding UTF8

# Execute create table via -e to avoid shell redirection issues
$createCmd = Get-Content -Path $createFile -Raw
if ($pass -ne '') {
    & "$mysqlCmd" -u $user -p$pass -h $dbHost -P $port $db -e $createCmd
} else {
    & "$mysqlCmd" -u $user -h $dbHost -P $port $db -e $createCmd
}

Write-Host "Importing CSV using LOAD DATA LOCAL INFILE..."
$fullCsvPath = (Resolve-Path $CsvPath).Path

try {
    # Build SQL command using single-quoted PowerShell strings to avoid escaping issues
    $loadCmd = 'LOAD DATA LOCAL INFILE ''' + $fullCsvPath + ''' INTO TABLE DataEntry FIELDS TERMINATED BY '','' ENCLOSED BY ''"'' LINES TERMINATED BY ''\n'' IGNORE 1 LINES (timestamp, value, category, source);'
    if ($pass -ne '') {
        & "$mysqlCmd" --local-infile=1 -u $user -p$pass -h $dbHost -P $port $db -e $loadCmd
    } else {
        & "$mysqlCmd" --local-infile=1 -u $user -h $dbHost -P $port $db -e $loadCmd
    }
    Write-Host "Import completed successfully."
} catch {
    Write-Error "Import failed: $_"
    exit 1
} finally {
    Remove-Item $createFile -ErrorAction SilentlyContinue
    # no temporary load file to remove
}

Write-Host "Done. Verify with: SELECT COUNT(*) FROM DataEntry;"
