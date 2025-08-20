# =============================================================================
# VISION PLATFORM - SIMPLE ENVIRONMENT SETUP
# =============================================================================

Write-Host "🚀 Setting up Vision Platform Environment Configuration" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# Step 1: Create comprehensive .env file
Write-Host "`n📝 Step 1: Creating comprehensive .env file..." -ForegroundColor Yellow

if (Test-Path ".env") {
    $backupFile = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item ".env" $backupFile
    Write-Host "✅ Existing .env backed up to: $backupFile" -ForegroundColor Green
}

# Copy comprehensive config to .env
Copy-Item "env.comprehensive" ".env"
Write-Host "✅ Comprehensive .env file created!" -ForegroundColor Green

# Step 2: Clean up duplicate configuration files
Write-Host "`n🧹 Step 2: Cleaning up duplicate configuration files..." -ForegroundColor Yellow

$filesToRemove = @(
    "gcp-config.env",
    "gemini-config.env",
    "env.example",
    "env.ocr.example",
    "env.full"
)

foreach ($file in $filesToRemove) {
    if (Test-Path $file) {
        $backupFile = "$file.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item $file $backupFile
        Remove-Item $file
        Write-Host "✅ Removed $file (backed up to $backupFile)" -ForegroundColor Green
    }
}

# Step 3: Update backend env.example
Write-Host "`n📝 Step 3: Updating backend environment configuration..." -ForegroundColor Yellow

if (Test-Path "backend/env.example") {
    $backupFile = "backend/env.example.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Copy-Item "backend/env.example" $backupFile
    Write-Host "✅ Backend env.example backed up to: $backupFile" -ForegroundColor Green
}

# Create updated backend env.example
$backendEnvContent = @"
# Backend Environment Configuration
# This file is now simplified - main configuration is in root .env

# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration (from root .env)
# MONGODB_URI, REDIS_URL, MINIO_ENDPOINT, etc. are inherited from root .env

# JWT Configuration (from root .env)
# JWT_SECRET, JWT_REFRESH_SECRET are inherited from root .env

# AI Service Configuration (from root .env)
# GOOGLE_API_KEY, OPENAI_API_KEY, etc. are inherited from root .env

# Google Cloud Configuration (from root .env)
# GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_CREDENTIALS, etc. are inherited from root .env

# Feature Flags (from root .env)
# ENABLE_REAL_AI, ENABLE_STRIPE_PAYMENTS, etc. are inherited from root .env

# Note: All environment variables are now managed centrally in the root .env file
# This ensures consistency across all services and eliminates duplication
"@

Set-Content -Path "backend/env.example" -Value $backendEnvContent
Write-Host "✅ Backend env.example updated!" -ForegroundColor Green

# Step 4: Create environment validation script
Write-Host "`n🔍 Step 4: Creating environment validation script..." -ForegroundColor Yellow

$validationScript = @"
# =============================================================================
# VISION PLATFORM - ENVIRONMENT VALIDATION
# =============================================================================

Write-Host "🔍 Validating Vision Platform Environment Configuration" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "   Please copy env.comprehensive to .env and configure it" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        `$name = `$matches[1].Trim()
        `$value = `$matches[2].Trim()
        if (`$value -and `$value -ne "your-*" -and `$value -ne "path/to/*") {
            Set-Item -Path "env:`$name" -Value `$value
        }
    }
}

# Validate critical variables
Write-Host "`n📋 Environment Validation Results:" -ForegroundColor Yellow

`$criticalVars = @(
    @{Name="MONGODB_URI"; Description="MongoDB Connection"},
    @{Name="REDIS_URL"; Description="Redis Connection"},
    @{Name="JWT_SECRET"; Description="JWT Secret Key"},
    @{Name="JWT_REFRESH_SECRET"; Description="JWT Refresh Secret"},
    @{Name="GOOGLE_API_KEY"; Description="Google API Key"},
    @{Name="OPENAI_API_KEY"; Description="OpenAI API Key"},
    @{Name="HUGGINGFACE_API_KEY"; Description="Hugging Face API Key"}
)

`$allValid = `$true

foreach ($var in $criticalVars) {
    $value = Get-Item -Path "env:$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "✅ $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "❌ $($var.Description): Not configured" -ForegroundColor Red
        $allValid = $false
    }
}

# Check GCP configuration
Write-Host "`n☁️  Google Cloud Platform Configuration:" -ForegroundColor Yellow
`$gcpVars = @(
    @{Name="GOOGLE_CLOUD_PROJECT"; Description="GCP Project ID"},
    @{Name="GOOGLE_CLOUD_CREDENTIALS"; Description="GCP Credentials Path"},
    @{Name="GOOGLE_CLOUD_STORAGE_BUCKET"; Description="GCP Storage Bucket"}
)

foreach ($var in $gcpVars) {
    $value = Get-Item -Path "env:$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "✅ $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($var.Description): Not configured (optional for local development)" -ForegroundColor Yellow
    }
}

# Check test configuration
Write-Host "`n🧪 Test Configuration:" -ForegroundColor Yellow
`$testVars = @(
    @{Name="TEST_MONGODB_URI"; Description="Test MongoDB URI"},
    @{Name="TEST_REDIS_URL"; Description="Test Redis URL"}
)

foreach ($var in $testVars) {
    $value = Get-Item -Path "env:$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "✅ $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($var.Description): Using defaults (OK for development)" -ForegroundColor Yellow
    }
}

# Final validation result
Write-Host "`n🎯 Final Validation Result:" -ForegroundColor Cyan
if ($allValid) {
    Write-Host "✅ All critical environment variables are configured!" -ForegroundColor Green
    Write-Host "   Your Vision Platform is ready to run!" -ForegroundColor Green
} else {
    Write-Host "❌ Some critical environment variables are missing!" -ForegroundColor Red
    Write-Host "   Please update your .env file with the required values" -ForegroundColor Yellow
}

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env file with your actual API keys and configuration" -ForegroundColor White
Write-Host "   2. Run: docker-compose up -d" -ForegroundColor White
Write-Host "   3. Access your platform at: http://localhost:3000" -ForegroundColor White
Write-Host "   4. Monitor with Grafana at: http://localhost:3002" -ForegroundColor White
"@

Set-Content -Path "validate-env.ps1" -Value $validationScript
Write-Host "✅ Environment validation script created: validate-env.ps1" -ForegroundColor Green

# Final summary
Write-Host "`n🎉 ENVIRONMENT SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "✅ Comprehensive .env file created" -ForegroundColor Green
Write-Host "✅ Duplicate configuration files cleaned up" -ForegroundColor Green
Write-Host "✅ Backend configuration updated" -ForegroundColor Green
Write-Host "✅ Validation script created" -ForegroundColor Green

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env file with your actual API keys" -ForegroundColor White
Write-Host "   2. Run: .\validate-env.ps1" -ForegroundColor White
Write-Host "   3. Start services: docker-compose up -d" -ForegroundColor White
Write-Host "   4. Access platform: http://localhost:3000" -ForegroundColor White

Write-Host "`n🔍 To validate your environment:" -ForegroundColor Cyan
Write-Host "   .\validate-env.ps1" -ForegroundColor Green
