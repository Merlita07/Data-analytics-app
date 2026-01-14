param(
  [string]$Message,
  [switch]$Push
)

$ErrorActionPreference = 'Stop'

# Resolve repository root (parent of scripts folder)
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git is not installed or not in PATH."
  exit 1
}

if (-not $Message) {
  $Message = Read-Host "Enter commit message"
}

if (-not $Message) {
  Write-Error "Aborting: commit message required."
  exit 1
}

Write-Host "Staging all changes..."
git add -A

Write-Host "Committing..."
git commit -m "$Message"

if ($LASTEXITCODE -ne 0) {
  Write-Warning "git commit returned exit code $LASTEXITCODE. No changes may have been staged."
}
else {
  Write-Host "Commit successful."
}

if ($Push.IsPresent) {
  $branch = (git rev-parse --abbrev-ref HEAD).Trim()
  if (-not $branch) {
    Write-Error "Failed to determine current branch."
    exit 1
  }
  Write-Host "Pushing to origin/$branch..."
  git push origin $branch
  if ($LASTEXITCODE -ne 0) {
    Write-Error "git push failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
  }
}

Write-Host "Done."
