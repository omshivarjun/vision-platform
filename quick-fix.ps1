# Vision Platform - Quick Fix Script
# This script fixes the immediate Docker build issues

Write-Host "🔧 Quick Fix for Vision Platform..." -ForegroundColor Green

# Stop any running containers
Write-Host "Stopping any running containers..." -ForegroundColor Yellow
docker-compose down 2>$null

# Remove any existing images that might have issues
Write-Host "Cleaning up Docker images..." -ForegroundColor Yellow
docker rmi vision-platform-web vision-platform-mobile 2>$null

# Build shared package
Write-Host "Building shared package..." -ForegroundColor Yellow
Set-Location "packages/shared"
npm run build
Set-Location "../.."

# Start only the infrastructure services using the infrastructure-only compose file
Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
docker-compose -f docker-compose.infrastructure.yml up -d

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check status
Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose -f docker-compose.infrastructure.yml ps

Write-Host "✅ Quick fix applied!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Infrastructure services are running:" -ForegroundColor Cyan
Write-Host "   API Service: http://localhost:3001" -ForegroundColor White
Write-Host "   AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "   AI Service Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host "   Grafana: http://localhost:3002" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "To run the web app locally:" -ForegroundColor Cyan
Write-Host "   cd apps/web && npm run dev" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Or use the simple mode:" -ForegroundColor Cyan
Write-Host "   npm run simple" -ForegroundColor White
