# Vision Platform Status Check Script
Write-Host "=== Vision Platform Status Check ===" -ForegroundColor Green
Write-Host ""

# Check Docker services
Write-Host "Docker Services:" -ForegroundColor Yellow
docker-compose ps
Write-Host ""

# Check API service
Write-Host "API Service (Port 3001):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 5
    Write-Host "✓ API Service is running" -ForegroundColor Green
} catch {
    Write-Host "✗ API Service is not responding" -ForegroundColor Red
}

# Check AI service
Write-Host "AI Service (Port 8000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 5
    Write-Host "✓ AI Service is running" -ForegroundColor Green
} catch {
    Write-Host "✗ AI Service is not responding" -ForegroundColor Red
}

# Check Web App
Write-Host "Web App (Port 5173):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5
    Write-Host "✓ Web App is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Web App is not responding" -ForegroundColor Red
}

# Check Mobile App
Write-Host "Mobile App (Port 8081):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -TimeoutSec 5
    Write-Host "✓ Mobile App is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Mobile App is not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Access URLs ===" -ForegroundColor Green
Write-Host "Web App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:3001/api-docs" -ForegroundColor Cyan
Write-Host "AI Service Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Mobile App: http://localhost:8081" -ForegroundColor Cyan
Write-Host "MinIO Console: http://localhost:9001" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Demo Accounts ===" -ForegroundColor Green
Write-Host "Admin: admin@demo.local / password123" -ForegroundColor Cyan
Write-Host "User: user@demo.local / password123" -ForegroundColor Cyan
Write-Host "Accessibility: visuallyimpaired@demo.local / password123" -ForegroundColor Cyan
