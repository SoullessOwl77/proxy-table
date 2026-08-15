# Proxy Table — one-shot deploy
# Double-click deploy.bat, or run:  powershell -ExecutionPolicy Bypass -File .\deploy.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host ""
Write-Host "=== Proxy Table deploy ===" -ForegroundColor Cyan
Write-Host "Folder: $root"
Write-Host ""

# --- Git ---
$msg = Read-Host "Commit message (leave blank for timestamp)"
if ([string]::IsNullOrWhiteSpace($msg)) {
  $msg = "deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host ""
Write-Host "git add / commit / push..." -ForegroundColor Yellow
git add -A
$status = git status --porcelain
if ($status) {
  git commit -m $msg
  git push
  Write-Host "Git push done." -ForegroundColor Green
} else {
  Write-Host "Nothing new to commit — skipping push." -ForegroundColor DarkYellow
}

# --- Worker ---
$worker = Join-Path $root "worker"
if (Test-Path $worker) {
  Write-Host ""
  Write-Host "wrangler deploy..." -ForegroundColor Yellow
  Set-Location $worker
  wrangler deploy
  Write-Host "Worker deploy done." -ForegroundColor Green
} else {
  Write-Host "No worker folder found — skipped wrangler." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "=== All done ===" -ForegroundColor Cyan
Write-Host "Press any key to close..."
[void][System.Console]::ReadKey($true)
