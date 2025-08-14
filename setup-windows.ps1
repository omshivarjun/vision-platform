# Vision Platform - Windows Setup Script
# This script sets up the Vision Platform on Windows

Write-Host "🚀 Setting up Vision Platform on Windows..." -ForegroundColor Green

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
    Copy-Item "env.example" ".env" -ErrorAction SilentlyContinue
    Write-Host "✅ Environment file created. Please edit .env with your configuration." -ForegroundColor Green
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Cyan
npm install

# Shared package dependencies
Write-Host "Installing shared package dependencies..." -ForegroundColor Cyan
Set-Location "packages/shared"
npm install
Set-Location "../.."

# Web app dependencies
Write-Host "Installing web app dependencies..." -ForegroundColor Cyan
Set-Location "apps/web"
npm install
Set-Location "../.."

# Mobile app dependencies
Write-Host "Installing mobile app dependencies..." -ForegroundColor Cyan
Set-Location "apps/mobile"
npm install
Set-Location "../.."

# API service dependencies
Write-Host "Installing API service dependencies..." -ForegroundColor Cyan
Set-Location "services/api"
npm install
Set-Location "../.."

# AI service dependencies
Write-Host "Installing AI service dependencies..." -ForegroundColor Cyan
Set-Location "services/ai"
pip install -r requirements.txt
Set-Location "../.."

Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green

# Build shared package
Write-Host "Building shared package..." -ForegroundColor Yellow
Set-Location "packages/shared"
npm run build
Set-Location "../.."

Write-Host "🎉 Setup complete! Run 'npm run start' to start the platform." -ForegroundColor Green
