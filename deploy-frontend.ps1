$ErrorActionPreference = "Stop"

param(
  [string]$ServerHost = "13.233.145.91",
  [string]$ServerUser = "ubuntu",
  [string]$PemPath = "D:\eximinq-crmpanel-frontend.pem",
  [string]$RemoteDir = "/home/ubuntu/crmpanel-frontend",
  [string]$ArchiveName = "dist-fix.tar.gz"
)

Set-Location $PSScriptRoot

Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  throw "Frontend build failed."
}

Write-Host "Packaging dist..." -ForegroundColor Cyan
if (Test-Path $ArchiveName) {
  Remove-Item $ArchiveName -Force
}
tar -czf $ArchiveName dist
if ($LASTEXITCODE -ne 0) {
  throw "Frontend archive creation failed."
}

Write-Host "Uploading frontend archive..." -ForegroundColor Cyan
scp -i $PemPath $ArchiveName "${ServerUser}@${ServerHost}:${RemoteDir}/"
if ($LASTEXITCODE -ne 0) {
  throw "Frontend archive upload failed."
}

$remoteCommand = @"
set -e
cd $RemoteDir
mv dist dist_old_\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
tar -xzf $ArchiveName
sudo nginx -t
sudo systemctl reload nginx
"@

Write-Host "Deploying frontend on server..." -ForegroundColor Cyan
ssh -i $PemPath "${ServerUser}@${ServerHost}" $remoteCommand
if ($LASTEXITCODE -ne 0) {
  throw "Remote frontend deploy failed."
}

Write-Host "Frontend deploy completed." -ForegroundColor Green
