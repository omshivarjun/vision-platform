# 🚀 VISION PLATFORM - DEPLOYMENT GUIDE

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Configuration](#environment-configuration)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Monitoring](#monitoring)
8. [Security](#security)

## 🔧 **Prerequisites**

### **System Requirements**
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: Minimum 20GB free space
- **CPU**: Multi-core processor (2+ cores recommended)

### **Software Requirements**
- **Docker**: Version 20.10+ with Docker Compose
- **Git**: Version 2.30+
- **Node.js**: Version 18+ (for development)
- **Python**: Version 3.9+ (for development)

### **API Keys Required**
- **OpenAI API Key**: For GPT models and DALL-E
- **Google API Key**: For Gemini AI and Google services
- **Hugging Face API Key**: For open-source AI models
- **Optional**: Google Cloud Platform credentials

## 🚀 **Quick Start**

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/vision-platform.git
cd vision-platform
```

### **2. Environment Setup**
```bash
# Copy the comprehensive environment configuration
cp env.comprehensive .env

# Edit .env with your API keys
# Required: OPENAI_API_KEY, GOOGLE_API_KEY, HUGGINGFACE_API_KEY
nano .env  # or use your preferred editor
```

### **3. Start All Services**
```bash
# Start all services with Docker Compose
docker-compose up -d

# Check service status
docker-compose ps
```

### **4. Access Your Platform**
- **Main Platform**: http://localhost
- **Web App**: http://localhost:5173
- **API Backend**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **Monitoring**: http://localhost:3002 (admin/admin123)

## ⚙️ **Environment Configuration**

### **Required Environment Variables**

#### **Database Configuration**
```bash
MONGODB_URI=mongodb://admin:password123@localhost:27017/vision_platform?authSource=admin
REDIS_URL=redis://localhost:6379
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

#### **Authentication**
```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### **AI Service API Keys**
```bash
OPENAI_API_KEY=sk-your-openai-api-key
GOOGLE_API_KEY=your-google-api-key
HUGGINGFACE_API_KEY=hf_your_huggingface_key
```

#### **Google Cloud Platform (Optional)**
```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_CREDENTIALS=path/to/service-account-key.json
GOOGLE_CLOUD_STORAGE_BUCKET=vision-platform-files
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_CLOUD_ZONE=us-central1-a
```

### **Feature Flags**
```bash
ENABLE_REAL_AI=true
ENABLE_OCR=true
ENABLE_TRANSLATION=true
ENABLE_AI_ASSISTANT=true
ENABLE_STRIPE_PAYMENTS=false
ENABLE_EMAIL_NOTIFICATIONS=false
```

## 🐳 **Docker Deployment**

### **Development Environment**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart specific service
docker-compose restart [service-name]
```

### **Service Management**
```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs [service-name]

# Scale services
docker-compose up -d --scale [service-name]=2

# Update services
docker-compose pull
docker-compose up -d
```

### **Data Persistence**
```bash
# View volumes
docker volume ls

# Backup volumes
docker run --rm -v vision-platform_mongodb_data:/data -v $(pwd):/backup alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v vision-platform_mongodb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## 🚀 **Production Deployment**

### **Production Environment Variables**
```bash
# Production-specific settings
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_DEBUG_MODE=false
ENABLE_HOT_RELOAD=false

# Security settings
JWT_SECRET=your-production-super-secret-key
JWT_REFRESH_SECRET=your-production-refresh-secret
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# Database (production)
MONGODB_URI=mongodb://production-user:password@production-mongo:27017/vision_platform
REDIS_URL=redis://production-redis:6379

# Storage (production)
MINIO_ENDPOINT=production-minio:9000
MINIO_ACCESS_KEY=production-access-key
MINIO_SECRET_KEY=production-secret-key
```

### **Production Docker Compose**
```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Or build production images
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### **SSL/HTTPS Configuration**
```bash
# Generate SSL certificates
mkdir -p infrastructure/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/nginx/ssl/privkey.pem \
  -out infrastructure/nginx/ssl/fullchain.pem

# Update nginx configuration for HTTPS
# Edit infrastructure/nginx/nginx.conf
```

### **Load Balancing**
```bash
# Scale services for load balancing
docker-compose up -d --scale web=3 --scale backend=2 --scale ai-service=2

# Use external load balancer (HAProxy, Nginx Plus, AWS ALB)
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Services Not Starting**
```bash
# Check service logs
docker-compose logs [service-name]

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart [service-name]

# Check resource usage
docker stats
```

#### **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Check Redis status
docker-compose logs redis

# Verify connection strings in .env
# Ensure ports are not blocked by firewall
```

#### **Port Conflicts**
```bash
# Check port usage
netstat -ano | findstr :3001  # Windows
netstat -tulpn | grep :3001   # Linux/macOS

# Update ports in docker-compose.yml if needed
ports:
  - "3002:3001"  # Change external port
```

#### **Memory Issues**
```bash
# Check available memory
docker system df

# Clean up unused resources
docker system prune -a

# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory
```

### **Health Checks**
```bash
# Check all health endpoints
curl http://localhost/health
curl http://localhost:3001/health
curl http://localhost:8000/health

# Check nginx status
docker-compose exec nginx nginx -t
```

## 📊 **Monitoring**

### **Grafana Dashboard**
- **URL**: http://localhost:3002
- **Default Credentials**: admin/admin123
- **Features**: Real-time metrics, service health, performance analytics

### **Prometheus Metrics**
- **URL**: http://localhost:9090
- **Features**: Service metrics, custom business metrics, alerting

### **Custom Metrics**
```bash
# Add custom metrics to your application
# Example: API response times, user activity, business metrics

# Backend (Node.js)
const prometheus = require('prom-client');
const responseTime = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds'
});

# AI Service (Python)
from prometheus_client import Histogram
response_time = Histogram('http_request_duration_seconds', 'Duration of HTTP requests')
```

### **Alerting**
```bash
# Configure Prometheus alerts
# Edit infrastructure/monitoring/prometheus.yml

# Example alert rule
groups:
  - name: vision-platform
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is down"
```

## 🔒 **Security**

### **Authentication & Authorization**
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OAuth Configuration
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
OAUTH_CALLBACK_URL=https://yourdomain.com/auth/callback
```

### **API Security**
```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # requests per window

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com

# Security Headers (configured in nginx)
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### **Database Security**
```bash
# MongoDB Security
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=strong-password
MONGO_INITDB_DATABASE=vision_platform

# Redis Security
REDIS_PASSWORD=strong-redis-password
```

### **Network Security**
```bash
# Firewall Configuration
# Allow only necessary ports
# 80 (HTTP), 443 (HTTPS), 22 (SSH)

# VPN Access (recommended for production)
# Use VPN for secure access to production environment
```

## 📈 **Scaling**

### **Horizontal Scaling**
```bash
# Scale services
docker-compose up -d --scale web=3 --scale backend=2 --scale ai-service=2

# Use external load balancer
# Configure nginx upstream with multiple instances
upstream web_frontend {
    server web:5173;
    server web2:5173;
    server web3:5173;
}
```

### **Vertical Scaling**
```bash
# Increase resource limits in docker-compose.yml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### **Database Scaling**
```bash
# MongoDB Replica Set
# Configure MongoDB for high availability

# Redis Cluster
# Use Redis Cluster for distributed caching
```

## 🔄 **Updates & Maintenance**

### **Regular Updates**
```bash
# Update base images
docker-compose pull

# Rebuild services
docker-compose build --no-cache

# Restart services
docker-compose up -d
```

### **Backup Strategy**
```bash
# Database backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# File storage backup
docker-compose exec minio mc mirror /data /backup/minio

# Configuration backup
cp .env .env.backup.$(date +%Y%m%d)
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d)
```

### **Rollback Procedure**
```bash
# Rollback to previous version
git checkout <previous-tag>
cp .env.backup.<date> .env
docker-compose down
docker-compose up -d
```

## 📚 **Additional Resources**

### **Documentation**
- [API Documentation](http://localhost:3001/api-docs)
- [AI Service Docs](http://localhost:8000/docs)
- [Project README](README.md)
- [Project Status](PROJECT_STATUS_FINAL.md)

### **Support**
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share ideas
- **Documentation**: Check inline code comments and docs

### **Community**
- **Contributing**: Follow contributing guidelines
- **Code of Conduct**: Be respectful and inclusive
- **License**: MIT License - see LICENSE file

---

**Happy Deploying! 🚀**

*Last updated: August 2025*
