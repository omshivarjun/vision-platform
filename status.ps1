# Vision Platform Status Check Script
# This script checks the status of all services

Write-Host "🔍 Vision Platform Status Check" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

# Check Docker services
Write-Host "🐳 Docker Services Status:" -ForegroundColor Yellow
try {
    docker-compose ps
} catch {
    Write-Host "❌ Docker Compose not available or no services running" -ForegroundColor Red
}

Write-Host ""

# Check individual service endpoints
Write-Host "🌐 Service Endpoints Status:" -ForegroundColor Yellow

$services = @(
    @{Name="Frontend"; URL="http://localhost:3000"; Port=3000},
    @{Name="Backend API"; URL="http://localhost:3001"; Port=3001},
    @{Name="AI Service"; URL="http://localhost:8000"; Port=8000},
    @{Name="MongoDB"; URL="localhost:27017"; Port=27017},
    @{Name="Redis"; URL="localhost:6379"; Port=6379},
    @{Name="MinIO Console"; URL="http://localhost:9001"; Port=9001}
)

foreach ($service in $services) {
    $status = "❌"
    $color = "Red"
    
    try {
        if ($service.Name -eq "MongoDB" -or $service.Name -eq "Redis") {
            # Check if port is listening
            $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue
            if ($connection.TcpTestSucceeded) {
                $status = "✅"
                $color = "Green"
            }
        } else {
            # Check HTTP endpoints
            $response = Invoke-WebRequest -Uri $service.URL -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $status = "✅"
                $color = "Green"
            }
        }
    } catch {
        # Service not responding
    }
    
    Write-Host "$status $($service.Name): $($service.URL)" -ForegroundColor $color
}

Write-Host ""

# Check environment file
Write-Host "⚙️  Environment Configuration:" -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "❌ .env file missing (copy from env.example)" -ForegroundColor Red
}

# Check Docker images
Write-Host ""
Write-Host "🐳 Docker Images:" -ForegroundColor Yellow
try {
    docker images --filter "reference=vision*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
} catch {
    Write-Host "❌ Could not retrieve Docker images" -ForegroundColor Red
}

# Check disk space
Write-Host ""
Write-Host "💾 Disk Space:" -ForegroundColor Yellow
try {
    Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | ForEach-Object {
        $freeGB = [math]::Round($_.FreeSpace / 1GB, 2)
        $totalGB = [math]::Round($_.Size / 1GB, 2)
        $usedGB = $totalGB - $freeGB
        $percentFree = [math]::Round(($freeGB / $totalGB) * 100, 1)
        
        Write-Host "Drive $($_.DeviceID): $freeGB GB free of $totalGB GB ($percentFree% free)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Could not retrieve disk space information" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Quick Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "   Restart services: docker-compose restart" -ForegroundColor White
Write-Host "   Stop all: docker-compose down" -ForegroundColor White
Write-Host "   Start all: docker-compose up -d" -ForegroundColor White
Write-Host "   Clean up: docker-compose down -v --remove-orphans" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Access URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001" -ForegroundColor White
Write-Host "   AI Service: http://localhost:8000" -ForegroundColor White
Write-Host "   API Docs: http://localhost:3001/api-docs" -ForegroundColor White
Write-Host "   AI Service Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "   MinIO Console: http://localhost:9001" -ForegroundColor White

Write-Host ""
Write-Host "Status check complete! 🚀" -ForegroundColor Green
