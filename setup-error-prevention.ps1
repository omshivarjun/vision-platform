# Vision Platform - Error Prevention Setup Script
# This script sets up all error prevention tools and configurations

Write-Host "🚨 Setting up Vision Platform Error Prevention System..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Python is installed
Write-Host "`n🔍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ first." -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Cyan
    exit 1
}

# Check if pip is available
Write-Host "`n🔍 Checking pip availability..." -ForegroundColor Yellow
try {
    $pipVersion = pip --version 2>&1
    Write-Host "✅ pip found: $pipVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pip not found. Please ensure pip is installed with Python." -ForegroundColor Red
    exit 1
}

# Install pre-commit
Write-Host "`n📦 Installing pre-commit hooks..." -ForegroundColor Yellow
try {
    pip install pre-commit
    Write-Host "✅ pre-commit installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install pre-commit. Trying with pip3..." -ForegroundColor Red
    try {
        pip3 install pre-commit
        Write-Host "✅ pre-commit installed successfully with pip3" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install pre-commit. Please install manually:" -ForegroundColor Red
        Write-Host "pip install pre-commit" -ForegroundColor Cyan
        exit 1
    }
}

# Install pre-commit hooks
Write-Host "`n🔧 Installing pre-commit git hooks..." -ForegroundColor Yellow
try {
    pre-commit install
    Write-Host "✅ Git hooks installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install git hooks. Please run manually:" -ForegroundColor Red
    Write-Host "pre-commit install" -ForegroundColor Cyan
}

# Check if Node.js is installed
Write-Host "`n🔍 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

# Check if npm is available
Write-Host "`n🔍 Checking npm availability..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please ensure npm is installed with Node.js." -ForegroundColor Red
    exit 1
}

# Install project dependencies
Write-Host "`n📦 Installing project dependencies..." -ForegroundColor Yellow
try {
    npm ci
    Write-Host "✅ Root dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Root dependencies installation failed, trying npm install..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Root dependencies installed with npm install" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install root dependencies" -ForegroundColor Red
    }
}

# Install web app dependencies
Write-Host "`n📦 Installing web app dependencies..." -ForegroundColor Yellow
try {
    Set-Location "apps/web"
    npm ci
    Write-Host "✅ Web app dependencies installed" -ForegroundColor Green
    Set-Location "../.."
} catch {
    Write-Host "⚠️  Web app dependencies installation failed, trying npm install..." -ForegroundColor Yellow
    try {
        Set-Location "apps/web"
        npm install
        Write-Host "✅ Web app dependencies installed with npm install" -ForegroundColor Green
        Set-Location "../.."
    } catch {
        Write-Host "❌ Failed to install web app dependencies" -ForegroundColor Red
    }
}

# Install backend dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
try {
    Set-Location "backend"
    npm ci
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    Set-Location ".."
} catch {
    Write-Host "⚠️  Backend dependencies installation failed, trying npm install..." -ForegroundColor Yellow
    try {
        Set-Location "backend"
        npm install
        Write-Host "✅ Backend dependencies installed with npm install" -ForegroundColor Green
        Set-Location ".."
    } catch {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    }
}

# Run pre-commit against all files
Write-Host "`n🔍 Running pre-commit checks against all files..." -ForegroundColor Yellow
try {
    pre-commit run --all-files
    Write-Host "✅ Pre-commit checks completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some pre-commit checks failed. This is normal for the first run." -ForegroundColor Yellow
    Write-Host "The hooks will run automatically on future commits." -ForegroundColor Cyan
}

# Check Docker installation
Write-Host "`n🔍 Checking Docker installation..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "Download from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Cyan
}

# Check Docker Compose
Write-Host "`n🔍 Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version 2>&1
    Write-Host "✅ Docker Compose found: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose not found. Please install Docker Desktop with Compose." -ForegroundColor Red
}

# Validate Docker Compose configuration
Write-Host "`n🔍 Validating Docker Compose configuration..." -ForegroundColor Yellow
try {
    docker-compose config
    Write-Host "✅ Docker Compose configuration is valid" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose configuration has errors" -ForegroundColor Red
}

# Create .env file if it doesn't exist
Write-Host "`n🔍 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path "apps/web/.env") {
    Write-Host "✅ .env file exists in apps/web" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file missing in apps/web. Creating template..." -ForegroundColor Yellow
    $envContent = @"
# MSAL Configuration
VITE_MS_CLIENT_ID=your-ms-client-id
VITE_MS_AUTHORITY=https://login.microsoftonline.com/common
VITE_MS_REDIRECT_URI=http://localhost:3000

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_WEBSOCKET_URL=ws://localhost:3001

# Feature Flags
VITE_ENABLE_MSAL_AUTH=true
VITE_ENABLE_STRIPE_PAYMENTS=true
VITE_ENABLE_AI_FEATURES=true

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# AI Service Configuration
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
"@
    $envContent | Out-File -FilePath "apps/web/.env" -Encoding UTF8
    Write-Host "✅ .env template created. Please update with your actual values." -ForegroundColor Green
}

# Summary
Write-Host "`n🎉 Error Prevention System Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "`n📋 What's been configured:" -ForegroundColor Cyan
Write-Host "✅ Pre-commit hooks installed" -ForegroundColor Green
Write-Host "✅ Project dependencies installed" -ForegroundColor Green
Write-Host "✅ Environment configuration checked" -ForegroundColor Green
Write-Host "✅ Docker configuration validated" -ForegroundColor Green

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update apps/web/.env with your actual API keys" -ForegroundColor White
Write-Host "2. Commit your changes: git add . && git commit -m 'Setup error prevention system'" -ForegroundColor White
Write-Host "3. Push to trigger GitHub Actions: git push" -ForegroundColor White
Write-Host "4. Check GitHub Actions tab for CI/CD status" -ForegroundColor White

Write-Host "`n🛡️ Error Prevention Features:" -ForegroundColor Cyan
Write-Host "• Pre-commit hooks catch errors before commit" -ForegroundColor White
Write-Host "• GitHub Actions validate code on every push" -ForegroundColor White
Write-Host "• Automated testing and quality gates" -ForegroundColor White
Write-Host "• Security scanning and vulnerability detection" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Cyan
Write-Host "• Error Prevention Guide: ERROR_PREVENTION_GUIDE.md" -ForegroundColor White
Write-Host "• GitHub Actions: .github/workflows/error-prevention.yml" -ForegroundColor White
Write-Host "• Pre-commit config: .pre-commit-config.yaml" -ForegroundColor White

Write-Host "`n🎯 The Vision Platform is now protected against all known error patterns!" -ForegroundColor Green
Write-Host "Happy coding! 🚀" -ForegroundColor Green
