# Vision Platform - Windows Start Script
# This script starts the Vision Platform on Windows

Write-Host "🚀 Starting Vision Platform on Windows..." -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from example..." -ForegroundColor Yellow
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Host "✅ .env file created from example" -ForegroundColor Green
    } else {
        Write-Host "❌ env.example not found. Please create .env file manually." -ForegroundColor Red
        exit 1
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

# Start Docker services
Write-Host "Starting Docker services..." -ForegroundColor Yellow
try {
    docker-compose up -d
    Write-Host "✅ Docker services started successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
    Write-Host "Trying with Windows-specific configuration..." -ForegroundColor Yellow
    try {
        docker-compose -f docker-compose.yml -f docker-compose.windows.yml up -d
        Write-Host "✅ Docker services started with Windows configuration" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start Docker services even with Windows configuration" -ForegroundColor Red
        exit 1
    }
}

# Wait a moment for services to start
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service status
Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose ps

# Open platform in browser
Write-Host "Opening platform in browser..." -ForegroundColor Yellow
try {
    & "open-platform.ps1"
    Write-Host "✅ Platform opened in browser" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not open platform automatically. Please open manually:" -ForegroundColor Yellow
    Write-Host "   Main Platform: http://localhost:80" -ForegroundColor Cyan
    Write-Host "   Web Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   API Service: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "   AI Service: http://localhost:8000" -ForegroundColor Cyan
}

Write-Host "🎉 Vision Platform is now running!" -ForegroundColor Green
Write-Host "Use 'npm run status' to check service status" -ForegroundColor Cyan
Write-Host "Use 'npm run logs' to view logs" -ForegroundColor Cyan
Write-Host "Use 'npm run stop' to stop the platform" -ForegroundColor Cyan
