# Vision Platform Environment Validation

Write-Host "Validating Vision Platform Environment Configuration" -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please copy env.comprehensive to .env and configure it" -ForegroundColor Yellow
    exit 1
}

Write-Host ".env file found!" -ForegroundColor Green

# Load environment variables
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($value -and $value -ne "your-*" -and $value -ne "path/to/*") {
            Set-Item -Path "env:$name" -Value $value
        }
    }
}

# Validate critical variables
Write-Host "`nEnvironment Validation Results:" -ForegroundColor Yellow

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
    $value = Get-Item -Path "env:$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "OK: $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $($var.Description): Not configured" -ForegroundColor Red
        $allValid = $false
    }
}

# Check GCP configuration
Write-Host "`nGoogle Cloud Platform Configuration:" -ForegroundColor Yellow
$gcpVars = @(
    @{Name="GOOGLE_CLOUD_PROJECT"; Description="GCP Project ID"},
    @{Name="GOOGLE_CLOUD_CREDENTIALS"; Description="GCP Credentials Path"},
    @{Name="GOOGLE_CLOUD_STORAGE_BUCKET"; Description="GCP Storage Bucket"}
)

foreach ($var in $gcpVars) {
    $value = Get-Item -Path "env:$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "OK: $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "OPTIONAL: $($var.Description): Not configured (optional for local development)" -ForegroundColor Yellow
    }
}

# Check test configuration
Write-Host "`nTest Configuration:" -ForegroundColor Yellow
$testVars = @(
    @{Name="TEST_MONGODB_URI"; Description="Test MongoDB URI"},
    @{Name="TEST_REDIS_URL"; Description="Test Redis URL"}
)

foreach ($var in $testVars) {
    $value = Get-Item -Path "env:$($var.Name)" -ErrorAction SilentlyContinue
    if ($value -and $value.Value -and $value.Value -notmatch '^your-.*' -and $value.Value -notmatch '^path/to/.*') {
        Write-Host "OK: $($var.Description): Configured" -ForegroundColor Green
    } else {
        Write-Host "DEFAULT: $($var.Description): Using defaults (OK for development)" -ForegroundColor Yellow
    }
}

# Final validation result
Write-Host "`nFinal Validation Result:" -ForegroundColor Cyan
if ($allValid) {
    Write-Host "SUCCESS: All critical environment variables are configured!" -ForegroundColor Green
    Write-Host "Your Vision Platform is ready to run!" -ForegroundColor Green
} else {
    Write-Host "ERROR: Some critical environment variables are missing!" -ForegroundColor Red
    Write-Host "Please update your .env file with the required values" -ForegroundColor Yellow
}

Write-Host "`nNext Steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your actual API keys and configuration" -ForegroundColor White
Write-Host "2. Run: docker-compose up -d" -ForegroundColor White
Write-Host "3. Access your platform at: http://localhost:3000" -ForegroundColor White
Write-Host "4. Monitor with Grafana at: http://localhost:3002" -ForegroundColor White

