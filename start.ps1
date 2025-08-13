# Vision Platform Startup Script
# This script starts all services for the Vision Platform

Write-Host "🚀 Starting Vision Platform..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "🔍 Checking Docker status..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
Write-Host "🔍 Checking Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Yellow
$directories = @(
    "backend/uploads",
    "backend/logs", 
    "ai_service/models",
    "ai_service/logs",
    "ai_service/uploads",
    "nginx/logs",
    "nginx/ssl"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# Copy environment file if it doesn't exist
if (!(Test-Path ".env")) {
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ Created .env file from env.example" -ForegroundColor Green
        Write-Host "⚠️  Please edit .env file with your configuration" -ForegroundColor Yellow
    }
}

# Start infrastructure services
Write-Host "🐳 Starting infrastructure services..." -ForegroundColor Yellow
docker-compose up -d mongodb redis minio

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Start backend services
Write-Host "🔧 Starting backend services..." -ForegroundColor Yellow
docker-compose up -d backend ai-service

# Wait for backend services
Write-Host "⏳ Waiting for backend services..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start frontend
Write-Host "🌐 Starting frontend..." -ForegroundColor Yellow
docker-compose up -d frontend

# Wait for all services
Write-Host "⏳ Waiting for all services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "🔍 Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "🎉 Vision Platform is starting up!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "🔌 Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "🤖 AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "🗄️  MongoDB: localhost:27017" -ForegroundColor White
Write-Host "⚡ Redis: localhost:6379" -ForegroundColor White
Write-Host "📦 MinIO Console: http://localhost:9001" -ForegroundColor White
Write-Host "📚 API Docs: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "🔍 AI Service Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Services may take a few minutes to fully start up..." -ForegroundColor Yellow
Write-Host "📊 View logs: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "🛑 Stop services: docker-compose down" -ForegroundColor Cyan
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
