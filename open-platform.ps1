# Vision Platform - Open Everything Script
# Just run this to open your entire platform in the browser!

Write-Host "Starting Vision Platform..." -ForegroundColor Green

# Open main platform (this routes to everything)
Start-Process "http://localhost:80"

# Open AI service docs (FastAPI has /docs)
Start-Process "http://localhost:8000/docs"

# Open monitoring
Start-Process "http://localhost:3002"

# Open API service (no /docs, but has / and /health)
Start-Process "http://localhost:3001/"

# Open web frontend directly
Start-Process "http://localhost:3000/"

# Open dashboard
Start-Process "http://localhost:3000/dashboard"

# Open analytics
Start-Process "http://localhost:3000/analytics"

Write-Host "All services opened in your browser!" -ForegroundColor Green
Write-Host "Main platform: http://localhost:80" -ForegroundColor Cyan
Write-Host "Use localhost:80 as your main entry point!" -ForegroundColor Yellow
Write-Host "Dashboard: http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host "Analytics: http://localhost:3000/analytics" -ForegroundColor Cyan
