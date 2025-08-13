# Vision Platform - Start Everything Script
# This script starts the entire platform and opens all services in your browser

Write-Host "🚀 Starting Vision Platform..." -ForegroundColor Green

# Start all services
Write-Host "📦 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services to start
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service status
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
docker-compose ps

# Open main platform in browser
Write-Host "🌐 Opening main platform..." -ForegroundColor Green
Start-Process "http://localhost:80"

# Wait a moment
Start-Sleep -Seconds 3

# Open AI service docs
Write-Host "🤖 Opening AI service..." -ForegroundColor Green
Start-Process "http://localhost:8000/docs"

# Wait a moment
Start-Sleep -Seconds 2

# Open monitoring dashboard
Write-Host "📊 Opening monitoring dashboard..." -ForegroundColor Green
Start-Process "http://localhost:3002"

# Wait a moment
Start-Sleep -Seconds 2

# Open API service
Write-Host "🔧 Opening API service..." -ForegroundColor Green
Start-Process "http://localhost:3001/"

# Wait a moment
Start-Sleep -Seconds 2

# Open web frontend
Write-Host "🌐 Opening web frontend..." -ForegroundColor Green
Start-Process "http://localhost:3000/"

Write-Host "`n🎉 Vision Platform is now running!" -ForegroundColor Green
Write-Host "`n📱 Access your platform at:" -ForegroundColor Cyan
Write-Host "   🌐 Main Platform: http://localhost:80" -ForegroundColor White
Write-Host "   🤖 AI Service: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   📊 Monitoring: http://localhost:3002" -ForegroundColor White
Write-Host "   🔧 API Service: http://localhost:3001/" -ForegroundColor White
Write-Host "   🌐 Web Frontend: http://localhost:3000/" -ForegroundColor White
Write-Host "   📱 Mobile Dev: http://localhost:19000" -ForegroundColor White

Write-Host "`n💡 All services are now accessible in your browser!" -ForegroundColor Green
Write-Host "   Just use the main platform at localhost:80 for everything!" -ForegroundColor Yellow
