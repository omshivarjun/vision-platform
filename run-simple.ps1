# Vision Platform - Simple Run Script (No Docker Build Issues)
# This script runs the platform using a simpler approach

Write-Host "🚀 Starting Vision Platform (Simple Mode)..." -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ .env file created from example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  env.example not found. Creating basic .env file..." -ForegroundColor Yellow
        @"
# Vision Platform Environment Variables
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
GOOGLE_CLOUD_CREDENTIALS=your-google-credentials-here
HUGGINGFACE_API_KEY=your-huggingface-api-key-here
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Basic .env file created" -ForegroundColor Green
    }
}

# Build shared package first
Write-Host "Building shared package..." -ForegroundColor Yellow
Set-Location "packages/shared"
try {
    npm run build
    Write-Host "✅ Shared package built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build shared package" -ForegroundColor Red
    exit 1
}
Set-Location "../.."

# Start only the infrastructure services (no web/mobile apps)
Write-Host "Starting infrastructure services..." -ForegroundColor Yellow
try {
    # Start only the backend services
    docker-compose up -d mongodb redis minio api ai-service nginx prometheus grafana
    Write-Host "✅ Infrastructure services started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start infrastructure services" -ForegroundColor Red
    exit 1
}

# Wait for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check service status
Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose ps

# Start web app locally (not in Docker)
Write-Host "Starting web app locally..." -ForegroundColor Yellow
Set-Location "apps/web"
try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    Write-Host "✅ Web app started locally" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not start web app automatically. Please run manually:" -ForegroundColor Yellow
    Write-Host "   cd apps/web && npm run dev" -ForegroundColor Cyan
}
Set-Location "../.."

# Open platform in browser
Write-Host "Opening platform in browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    Start-Process "http://localhost:3000"
    Start-Process "http://localhost:3001"
    Start-Process "http://localhost:8000/docs"
    Write-Host "✅ Platform opened in browser" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not open platform automatically. Please open manually:" -ForegroundColor Yellow
    Write-Host "   Web Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   API Service: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "   AI Service Docs: http://localhost:8000/docs" -ForegroundColor Cyan
}

Write-Host "🎉 Vision Platform is now running in Simple Mode!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "Access Points:" -ForegroundColor Cyan
Write-Host "   Web Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   API Service: http://localhost:3001" -ForegroundColor White
Write-Host "   AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "   AI Service Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host "   Grafana: http://localhost:3002" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Useful Commands:" -ForegroundColor Cyan
Write-Host "   npm run status    # Check service status" -ForegroundColor White
Write-Host "   npm run logs      # View logs" -ForegroundColor White
Write-Host "   npm run stop      # Stop all services" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "Note: Web app is running locally, not in Docker, to avoid build issues." -ForegroundColor Yellow
