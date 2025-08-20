# =============================================================================
# Vision Platform - Monitoring Setup Script
# =============================================================================
# This script helps you set up monitoring with Grafana and Prometheus
# =============================================================================

Write-Host "📊 Setting up Vision Platform Monitoring..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Check if monitoring services are running
Write-Host "🔍 Step 1: Checking monitoring services..." -ForegroundColor Yellow

$prometheusStatus = $false
$grafanaStatus = $false

try {
    $prometheusResponse = Invoke-WebRequest -Uri "http://localhost:9090" -TimeoutSec 5 -ErrorAction Stop
    if ($prometheusResponse.StatusCode -eq 200) {
        $prometheusStatus = $true
        Write-Host "✅ Prometheus: Running at http://localhost:9090" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Prometheus: Not accessible" -ForegroundColor Red
}

try {
    $grafanaResponse = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 5 -ErrorAction Stop
    if ($grafanaResponse.StatusCode -eq 200) {
        $grafanaStatus = $true
        Write-Host "✅ Grafana: Running at http://localhost:3002" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Grafana: Not accessible" -ForegroundColor Red
}

if (-not $prometheusStatus -or -not $grafanaStatus) {
    Write-Host "⚠️  Some monitoring services are not accessible. Please check Docker status." -ForegroundColor Yellow
    Write-Host "   Run: docker ps | Select-String -Pattern 'prometheus|grafana'" -ForegroundColor Gray
    exit 1
}

# Step 2: Provide setup instructions
Write-Host "`n📋 Step 2: Grafana Setup Instructions" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "1. Open Grafana in your browser:" -ForegroundColor White
Write-Host "   http://localhost:3002" -ForegroundColor Cyan

Write-Host "`n2. Login with default credentials:" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor Cyan
Write-Host "   Password: admin" -ForegroundColor Cyan

Write-Host "`n3. Change the default password when prompted" -ForegroundColor White

Write-Host "`n4. Add Prometheus as a data source:" -ForegroundColor White
Write-Host "   - Go to Configuration > Data Sources" -ForegroundColor Gray
Write-Host "   - Click 'Add data source'" -ForegroundColor Gray
Write-Host "   - Select 'Prometheus'" -ForegroundColor Gray
Write-Host "   - Set URL to: http://prometheus:9090" -ForegroundColor Gray
Write-Host "   - Click 'Save & Test'" -ForegroundColor Gray

Write-Host "`n5. Import sample dashboards:" -ForegroundColor White
Write-Host "   - Go to Dashboards > Import" -ForegroundColor Gray
Write-Host "   - Import dashboard ID: 1860 (Node Exporter Full)" -ForegroundColor Gray
Write-Host "   - Import dashboard ID: 315 (Docker and system monitoring)" -ForegroundColor Gray

# Step 3: Create basic monitoring configuration
Write-Host "`n🔧 Step 3: Creating monitoring configuration..." -ForegroundColor Yellow

$monitoringConfig = @"
# Vision Platform Monitoring Configuration
# Add this to your .env file for enhanced monitoring

# =============================================================================
# MONITORING & OBSERVABILITY
# =============================================================================
ENABLE_METRICS=true
METRICS_PORT=9090
GRAFANA_PORT=3002

# Prometheus Configuration
PROMETHEUS_RETENTION_DAYS=15
PROMETHEUS_STORAGE_PATH=/prometheus

# Grafana Configuration
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
GRAFANA_SECURITY_ADMIN_PASSWORD=your-secure-password

# Application Metrics
ENABLE_APP_METRICS=true
METRICS_COLLECTION_INTERVAL=15s
ENABLE_HEALTH_CHECKS=true
ENABLE_PERFORMANCE_MONITORING=true

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_STRUCTURED_LOGGING=true
"@

$monitoringConfig | Out-File -FilePath "monitoring-config.env" -Encoding UTF8
Write-Host "✅ Created monitoring-config.env with sample configuration" -ForegroundColor Green

# Step 4: Provide monitoring commands
Write-Host "`n📚 Step 4: Useful Monitoring Commands" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow

Write-Host "View all running services:" -ForegroundColor White
Write-Host "   docker ps" -ForegroundColor Gray

Write-Host "`nCheck service logs:" -ForegroundColor White
Write-Host "   docker logs vision-backend" -ForegroundColor Gray
Write-Host "   docker logs vision-ai-service" -ForegroundColor Gray
Write-Host "   docker logs vision-web" -ForegroundColor Gray

Write-Host "`nMonitor service health:" -ForegroundColor White
Write-Host "   curl http://localhost:3001/api/health" -ForegroundColor Gray
Write-Host "   curl http://localhost:8000/health" -ForegroundColor Gray

Write-Host "`nCheck resource usage:" -ForegroundColor White
Write-Host "   docker stats" -ForegroundColor Gray

# Step 5: Create monitoring dashboard template
Write-Host "`n📊 Step 5: Creating sample dashboard configuration..." -ForegroundColor Yellow

$dashboardConfig = @"
# Vision Platform - Sample Grafana Dashboard Configuration
# Save this as 'vision-platform-dashboard.json' and import to Grafana

{
  "dashboard": {
    "title": "Vision Platform Overview",
    "panels": [
      {
        "title": "Service Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"vision-backend\"}",
            "legendFormat": "Backend Health"
          },
          {
            "expr": "up{job=\"vision-ai-service\"}",
            "legendFormat": "AI Service Health"
          }
        ]
      },
      {
        "title": "Translation Requests",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(translation_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "OpenAI API Usage",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(openai_api_calls_total[5m])",
            "legendFormat": "API Calls/sec"
          }
        ]
      }
    ]
  }
}
"@

$dashboardConfig | Out-File -FilePath "vision-platform-dashboard.json" -Encoding UTF8
Write-Host "✅ Created sample dashboard configuration" -ForegroundColor Green

# Final summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "🎉 Monitoring Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`n📋 Next Steps:" -ForegroundColor White
Write-Host "1. Open Grafana: http://localhost:3002" -ForegroundColor Cyan
Write-Host "2. Login with admin/admin" -ForegroundColor Cyan
Write-Host "3. Add Prometheus data source" -ForegroundColor Cyan
Write-Host "4. Import sample dashboards" -ForegroundColor Cyan
Write-Host "5. Customize monitoring for your needs" -ForegroundColor Cyan

Write-Host "`n🔗 Useful Links:" -ForegroundColor White
Write-Host "   Grafana: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Prometheus: http://localhost:9090" -ForegroundColor Cyan
Write-Host "   Web App: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API: http://localhost:3001" -ForegroundColor Cyan

Write-Host "`n📚 Documentation:" -ForegroundColor White
Write-Host "   Grafana: https://grafana.com/docs/" -ForegroundColor Gray
Write-Host "   Prometheus: https://prometheus.io/docs/" -ForegroundColor Gray
