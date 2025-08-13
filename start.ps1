# Vision Platform Quick Start Script
Write-Host "🚀 Starting Vision Platform..." -ForegroundColor Green
Write-Host ""

# Start infrastructure services
Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
docker-compose up -d mongodb redis minio

# Wait for services to be ready
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start API service
Write-Host "Starting API service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/api; npm run dev"

# Start AI service
Write-Host "Starting AI service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd services/ai; python main.py"

# Wait a moment
Start-Sleep -Seconds 3

# Start Web app
Write-Host "Starting Web application..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/web; npm run dev"

# Start Mobile app
Write-Host "Starting Mobile application..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd apps/mobile; npm start"

Write-Host ""
Write-Host "🎉 Vision Platform is starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Access your applications:" -ForegroundColor Cyan
Write-Host "   Web App: http://localhost:5173" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "   AI Service: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   Mobile App: http://localhost:8081" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host ""
Write-Host "👤 Demo Accounts:" -ForegroundColor Cyan
Write-Host "   Admin: admin@demo.local / password123" -ForegroundColor White
Write-Host "   User: user@demo.local / password123" -ForegroundColor White
Write-Host "   Accessibility: visuallyimpaired@demo.local / password123" -ForegroundColor White
Write-Host ""
Write-Host "💡 Run .\status.ps1 to check service status" -ForegroundColor Yellow
