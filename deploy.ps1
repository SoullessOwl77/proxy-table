# Proxy Table deploy script
$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }
Set-Location $root

Write-Host ""
Write-Host "=== Proxy Table deploy ===" -ForegroundColor Cyan
Write-Host "Folder: $root"
Write-Host ""

$msg = Read-Host "Commit message (leave blank for timestamp)"
if (-not $msg) {
  $msg = "deploy " + (Get-Date -Format "yyyy-MM-dd HH:mm")
}

Write-Host ""
Write-Host "Running git..." -ForegroundColor Yellow
git add -A
$changes = git status --porcelain
if ($changes) {
  git commit -m $msg
  git push
  Write-Host "Git done." -ForegroundColor Green
} else {
  Write-Host "No file changes to commit." -ForegroundColor DarkYellow
}

Write-Host ""
$worker = Join-Path $root "worker"
Write-Host "Looking for worker at: $worker"

if (Test-Path $worker) {
  Set-Location $worker
  Write-Host "Running wrangler deploy..." -ForegroundColor Yellow
  wrangler deploy
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Worker done." -ForegroundColor Green
  } else {
    Write-Host "Wrangler exited with code $LASTEXITCODE" -ForegroundColor Red
  }
} else {
  Write-Host "Worker folder not found." -ForegroundColor Red
}

Set-Location $root
Write-Host ""
Write-Host "=== All done ===" -ForegroundColor Cyan
