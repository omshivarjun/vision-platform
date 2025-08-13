# Vision Platform Development Script
# This script starts all development services

Write-Host "Starting Vision Platform Development Environment..." -ForegroundColor Green

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start web application
Write-Host "Starting web application..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/web; npm run dev"

# Start mobile application
Write-Host "Starting mobile application..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/mobile; npm run start"

Write-Host "Development environment started!" -ForegroundColor Green
Write-Host "Web App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:3001/api-docs" -ForegroundColor Cyan
Write-Host "AI Service: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Mobile: Use Expo Go app to scan QR code" -ForegroundColor Cyan

