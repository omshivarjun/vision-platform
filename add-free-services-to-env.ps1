# Add FREE Services to .env File
# This script adds all FREE service configurations to your existing .env file

Write-Host "🔧 Adding FREE Services to .env file..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found! Please create it first." -ForegroundColor Red
    exit 1
}

# Create backup
$backupFile = ".env.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item ".env" $backupFile
Write-Host "✅ Backup created: $backupFile" -ForegroundColor Green

# FREE Services configuration to add
$freeServicesConfig = @"

# =============================================================================
# FREE SERVICES CONFIGURATION - ADDED $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# =============================================================================

# JWT (FREE - Generate locally)
JWT_SECRET=vision_platform_jwt_secret_key_2024_super_secure
JWT_REFRESH_SECRET=vision_platform_refresh_secret_key_2024_super_secure

# Microsoft Azure AD (FREE - 50K users/month)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Hugging Face (FREE - 30K requests/month)
HUGGINGFACE_API_KEY=hf_your_huggingface_key
DEFAULT_TRANSLATION_PROVIDER=huggingface
DEFAULT_OCR_PROVIDER=huggingface

# Google AI (FREE - 1.5K requests/day)
GOOGLE_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash

# OpenAI (FREE - $5 credits)
OPENAI_API_KEY=sk-your-openai-api-key

# Azure Cognitive (FREE - 5K transactions/month)
AZURE_TRANSLATOR_KEY=your-azure-translator-key
AZURE_TRANSLATOR_REGION=your-azure-region

# Stripe (FREE - No monthly fees)
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key

# Gmail SMTP (FREE - 500 emails/day)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# MinIO (FREE - Local storage)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123

# MongoDB Atlas (FREE - 512MB)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vision_platform

# Redis Cloud (FREE - 30MB)
REDIS_URL=redis://username:password@host:port

# Sentry (FREE - 5K errors/month)
SENTRY_DSN=your_sentry_dsn

# GitHub (FREE - Unlimited repos)
GITHUB_TOKEN=your_github_token

"@

# Add to .env file
Add-Content -Path ".env" -Value $freeServicesConfig

Write-Host "✅ FREE Services configuration added to .env file!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Edit .env file and replace placeholder values with real API keys" -ForegroundColor White
Write-Host "   2. Start your services: docker-compose up -d" -ForegroundColor White
Write-Host "   3. Test: node test-gemini.js" -ForegroundColor White

Write-Host "`n🔍 To view your updated .env file:" -ForegroundColor Cyan
Write-Host "   Get-Content .env | Select-Object -Last 20" -ForegroundColor Green

