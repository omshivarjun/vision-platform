# =============================================================================
# VISION PLATFORM - COMPREHENSIVE ENVIRONMENT SETUP
# =============================================================================
# This script sets up the comprehensive environment configuration and cleans up duplicates

Write-Host "🚀 Setting up Vision Platform Comprehensive Environment Configuration" -ForegroundColor Cyan
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

# Step 4: Update docker-compose.yml to use root .env
Write-Host "`n🐳 Step 4: Updating docker-compose.yml..." -ForegroundColor Yellow

# Read current docker-compose.yml
$dockerComposeContent = Get-Content "docker-compose.yml" -Raw

# Update environment variable references to use root .env
$dockerComposeContent = $dockerComposeContent -replace 'MONGODB_URI: \$\{MONGODB_URI\}', 'MONGODB_URI: ${MONGODB_URI:-mongodb://admin:password123@localhost:27017/vision_platform?authSource=admin}'
$dockerComposeContent = $dockerComposeContent -replace 'REDIS_URL: \$\{REDIS_URL\}', 'REDIS_URL: ${REDIS_URL:-redis://localhost:6379}'
$dockerComposeContent = $dockerComposeContent -replace 'MINIO_ENDPOINT: \$\{MINIO_ENDPOINT\}', 'MINIO_ENDPOINT: ${MINIO_ENDPOINT:-http://minio:9000}'
$dockerComposeContent = $dockerComposeContent -replace 'MINIO_ACCESS_KEY: \$\{MINIO_ACCESS_KEY\}', 'MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minioadmin}'
$dockerComposeContent = $dockerComposeContent -replace 'MINIO_SECRET_KEY: \$\{MINIO_SECRET_KEY\}', 'MINIO_SECRET_KEY: ${MINIO_SECRET_KEY:-minioadmin123}'

# Write updated docker-compose.yml
Set-Content -Path "docker-compose.yml" -Value $dockerComposeContent -NoNewline
Write-Host "✅ Docker-compose.yml updated with default values!" -ForegroundColor Green

# Step 5: Create environment validation script
Write-Host "`n🔍 Step 5: Creating environment validation script..." -ForegroundColor Yellow

$validationScript = @"
# =============================================================================
# VISION PLATFORM - ENVIRONMENT VALIDATION
# =============================================================================
# This script validates your environment configuration

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
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($value -and $value -ne "your-*" -and $value -ne "path/to/*") {
            Set-Item -Path "env:`$name" -Value $value
        }
    }
}

# Validate critical variables
Write-Host "`n📋 Environment Validation Results:" -ForegroundColor Yellow

$criticalVars = @(
    @{Name="MONGODB_URI"; Description="MongoDB Connection"},
    @{Name="REDIS_URL"; Description="Redis Connection"},
    @{Name="JWT_SECRET"; Description="JWT Secret Key"},
    @{Name="JWT_REFRESH_SECRET"; Description="JWT Refresh Secret"},
    @{Name="GOOGLE_API_KEY"; Description="Google API Key"},
    @{Name="OPENAI_API_KEY"; Description="OpenAI API Key"},
    @{Name="HUGGINGFACE_API_KEY"; Description="Hugging Face API Key"}
)

$allValid = $true

foreach ($var in $criticalVars) {
    $value = Get-Item -Path "env:`$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "✅ $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "❌ $($var.Description): Not configured" -ForegroundColor Red
        $allValid = $false
    }
}

# Check GCP configuration
Write-Host "`n☁️  Google Cloud Platform Configuration:" -ForegroundColor Yellow
$gcpVars = @(
    @{Name="GOOGLE_CLOUD_PROJECT"; Description="GCP Project ID"},
    @{Name="GOOGLE_CLOUD_CREDENTIALS"; Description="GCP Credentials Path"},
    @{Name="GOOGLE_CLOUD_STORAGE_BUCKET"; Description="GCP Storage Bucket"}
)

foreach ($var in $gcpVars) {
    $value = Get-Item -Path "env:`$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "✅ $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($var.Description): Not configured (optional for local development)" -ForegroundColor Yellow
    }
}

# Check test configuration
Write-Host "`n🧪 Test Configuration:" -ForegroundColor Yellow
$testVars = @(
    @{Name="TEST_MONGODB_URI"; Description="Test MongoDB URI"},
    @{Name="TEST_REDIS_URL"; Description="Test Redis URL"}
)

foreach ($var in $testVars) {
    $value = Get-Item -Path "env:`$($var.Name)" -ErrorAction SilentlyContinue
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

# Step 6: Create cleanup summary
Write-Host "`n📋 Step 6: Creating cleanup summary..." -ForegroundColor Yellow

$cleanupSummary = @"
# =============================================================================
# VISION PLATFORM - ENVIRONMENT CLEANUP SUMMARY
# =============================================================================
# This file documents what was cleaned up and consolidated

## Files Removed (Duplicates):
- gcp-config.env - Consolidated into root .env
- gemini-config.env - Consolidated into root .env  
- env.example - Consolidated into root .env
- env.ocr.example - Consolidated into root .env
- env.full - Consolidated into root .env

## Files Updated:
- .env - Comprehensive configuration (NEW)
- backend/env.example - Simplified reference file
- docker-compose.yml - Updated with default values

## Files Created:
- validate-env.ps1 - Environment validation script

## What This Achieves:
✅ Eliminates duplicate environment configurations
✅ Centralizes all configuration in one .env file
✅ Ensures consistency across all services
✅ Provides clear validation and setup guidance
✅ Maintains backward compatibility with docker-compose

## Next Steps:
1. Edit .env file with your actual API keys
2. Run: .\validate-env.ps1
3. Start services: docker-compose up -d
4. Access platform: http://localhost:3000

## Benefits:
- No more confusion about which config file to edit
- Single source of truth for all environment variables
- Easier maintenance and updates
- Consistent configuration across development and production
- Clear separation of concerns

## Backup Files Created:
All original files were backed up before removal with timestamp suffixes.
"@

Set-Content -Path "ENVIRONMENT_CLEANUP_SUMMARY.md" -Value $cleanupSummary
Write-Host "✅ Cleanup summary created: ENVIRONMENT_CLEANUP_SUMMARY.md" -ForegroundColor Green

# Final summary
Write-Host "`n🎉 ENVIRONMENT SETUP COMPLETE!" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host "✅ Comprehensive .env file created" -ForegroundColor Green
Write-Host "✅ Duplicate configuration files cleaned up" -ForegroundColor Green
Write-Host "✅ Backend configuration updated" -ForegroundColor Green
Write-Host "✅ Docker-compose.yml optimized" -ForegroundColor Green
Write-Host "✅ Validation script created" -ForegroundColor Green
Write-Host "✅ Cleanup documentation created" -ForegroundColor Green

Write-Host "`n📚 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Edit .env file with your actual API keys" -ForegroundColor White
Write-Host "   2. Run: .\validate-env.ps1" -ForegroundColor White
Write-Host "   3. Start services: docker-compose up -d" -ForegroundColor White
Write-Host "   4. Access platform: http://localhost:3000" -ForegroundColor White

Write-Host "`n🔍 To validate your environment:" -ForegroundColor Cyan
Write-Host "   .\validate-env.ps1" -ForegroundColor Green

Write-Host "`n📖 For cleanup details:" -ForegroundColor Cyan
Write-Host "   Get-Content ENVIRONMENT_CLEANUP_SUMMARY.md" -ForegroundColor Green
