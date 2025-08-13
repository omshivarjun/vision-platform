#!/bin/bash

# Vision Platform - ZIP Release Script
# This script creates a deployable ZIP package of the codebase

set -e

echo "📦 Creating Vision Platform Release Package..."

# Configuration
VERSION=${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo "dev")}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
RELEASE_DIR="./releases"
PACKAGE_NAME="vision-platform-${VERSION}"
PACKAGE_DIR="${RELEASE_DIR}/${PACKAGE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Release process interrupted..."
    if [ -d "$PACKAGE_DIR" ]; then
        rm -rf "$PACKAGE_DIR"
    fi
    exit 1
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if git is available
if ! command -v git &> /dev/null; then
    print_warning "Git is not installed. Version will be set to 'dev'."
fi

# Create release directory
print_status "Creating release directory..."
mkdir -p "$RELEASE_DIR"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Function to copy files with exclusions
copy_files() {
    local source_dir=$1
    local target_dir=$2
    local exclude_patterns=("${@:3}")
    
    if [ -d "$source_dir" ]; then
        mkdir -p "$target_dir"
        
        # Use rsync if available, otherwise use cp
        if command -v rsync &> /dev/null; then
            local exclude_args=""
            for pattern in "${exclude_patterns[@]}"; do
                exclude_args="$exclude_args --exclude=$pattern"
            done
            
            rsync -av --progress "$source_dir/" "$target_dir/" $exclude_args
        else
            # Fallback to cp with basic exclusions
            cp -r "$source_dir"/* "$target_dir/" 2>/dev/null || true
            
            # Remove excluded files manually
            for pattern in "${exclude_patterns[@]}"; do
                find "$target_dir" -name "$pattern" -type f -delete 2>/dev/null || true
                find "$target_dir" -name "$pattern" -type d -exec rm -rf {} + 2>/dev/null || true
            done
        fi
    fi
}

# Copy core application files
print_status "Copying application files..."

# Copy apps
copy_files "apps" "$PACKAGE_DIR/apps" "node_modules" ".next" "dist" "build" "coverage" "*.log"

# Copy services
copy_files "services" "$PACKAGE_DIR/services" "node_modules" "__pycache__" "venv" "*.pyc" "*.pyo" "dist" "build" "coverage" "*.log"

# Copy packages
copy_files "packages" "$PACKAGE_DIR/packages" "node_modules" "dist" "coverage" "*.log"

# Copy infrastructure
copy_files "infrastructure" "$PACKAGE_DIR/infrastructure"

# Copy scripts
copy_files "scripts" "$PACKAGE_DIR/scripts"

# Copy tests
copy_files "tests" "$PACKAGE_DIR/tests" "node_modules" "coverage" "*.log"

# Copy root files
print_status "Copying root configuration files..."
cp package*.json "$PACKAGE_DIR/" 2>/dev/null || true
cp docker-compose*.yml "$PACKAGE_DIR/" 2>/dev/null || true
cp tsconfig*.json "$PACKAGE_DIR/" 2>/dev/null || true
cp .env.example "$PACKAGE_DIR/" 2>/dev/null || true
cp README.md "$PACKAGE_DIR/" 2>/dev/null || true
cp LICENSE "$PACKAGE_DIR/" 2>/dev/null || true

# Create deployment instructions
print_status "Creating deployment instructions..."
cat > "$PACKAGE_DIR/DEPLOYMENT.md" << EOF
# Vision Platform - Deployment Guide

**Version:** $VERSION  
**Build Date:** $BUILD_DATE

## Quick Start

1. **Prerequisites**
   - Docker and Docker Compose installed
   - At least 8GB RAM available
   - 20GB free disk space

2. **Environment Setup**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

3. **Start Development Environment**
   ```bash
   # Make scripts executable
   chmod +x scripts/*.sh
   
   # Start development stack
   ./scripts/dev.sh
   ```

4. **Build Production Images**
   ```bash
   # Build production containers
   ./scripts/build.sh
   
   # Start production stack
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Service URLs

- **Web Frontend:** http://localhost:3000
- **API Service:** http://localhost:3001
- **AI Service:** http://localhost:8000
- **MinIO Console:** http://localhost:9001
- **Grafana:** http://localhost:3002
- **Prometheus:** http://localhost:9090

## Demo Accounts

- **Admin:** admin@demo.local / Admin123!
- **User:** user@demo.local / User123!
- **Accessibility:** visuallyimpaired@demo.local / Access123!

## Configuration

### Environment Variables

Key environment variables to configure:

\`\`\`bash
# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/vision_platform
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key
GOOGLE_CLOUD_CREDENTIALS=your_google_credentials
HUGGINGFACE_API_KEY=your_huggingface_key

# Security
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# External Services
SENTRY_DSN=your_sentry_dsn
\`\`\`

### Feature Flags

Enable/disable features via environment variables:

\`\`\`bash
ENABLE_GPU=false
USE_LOCAL_MODELS=true
ENABLE_OFFLINE_MODE=true
\`\`\`

## Monitoring & Logging

### Health Checks

- API Health: http://localhost:3001/health
- AI Service Health: http://localhost:8000/health

### Logs

View service logs:
\`\`\`bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f ai-service
docker-compose logs -f web
\`\`\`

### Metrics

- Prometheus: http://localhost:9090
- Grafana: http://localhost:3002 (admin/admin123)

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Check if ports 3000, 3001, 8000, 27017, 6379 are available
   - Stop conflicting services or change ports in docker-compose.yml

2. **Memory Issues**
   - Ensure Docker has at least 8GB RAM allocated
   - Reduce service replicas in production compose file

3. **AI Service Failures**
   - Check if required API keys are set in .env
   - Verify internet connectivity for model downloads

### Support

For issues and support:
- Check logs: \`docker-compose logs -f [service]\`
- Restart services: \`docker-compose restart [service]\`
- Rebuild: \`docker-compose up -d --build [service]\`

## Architecture

The Vision Platform consists of:

- **Frontend Apps:** React/Next.js web app, React Native mobile app
- **Backend Services:** Node.js API service, Python AI service
- **Infrastructure:** MongoDB, Redis, MinIO, Nginx, monitoring stack
- **Shared Code:** TypeScript types, utilities, and models

## Security

- JWT-based authentication with refresh tokens
- Role-based access control (user, moderator, admin)
- Input validation and sanitization
- Rate limiting and CORS protection
- Secure headers via Helmet middleware

## Performance

- Redis caching for translations and AI responses
- Connection pooling for database connections
- Horizontal scaling support via Docker Swarm/Kubernetes
- CDN-ready static assets
- Optimized Docker images with multi-stage builds
EOF

# Create quick start script
print_status "Creating quick start script..."
cat > "$PACKAGE_DIR/quick-start.sh" << 'EOF'
#!/bin/bash

# Vision Platform - Quick Start Script

echo "🚀 Starting Vision Platform..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📋 Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your configuration before continuing."
        echo "Press Enter when ready to continue..."
        read
    else
        echo "❌ No .env.example file found. Please create .env file manually."
        exit 1
    fi
fi

# Make scripts executable
chmod +x scripts/*.sh

# Start development environment
echo "🚀 Starting development environment..."
./scripts/dev.sh
EOF

chmod +x "$PACKAGE_DIR/quick-start.sh"

# Create production deployment script
print_status "Creating production deployment script..."
cat > "$PACKAGE_DIR/deploy-prod.sh" << 'EOF'
#!/bin/bash

# Vision Platform - Production Deployment Script

echo "🏭 Deploying Vision Platform to Production..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check .env file
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your production configuration."
    exit 1
fi

# Make scripts executable
chmod +x scripts/*.sh

# Build production images
echo "🏗️  Building production images..."
./scripts/build.sh

# Start production stack
echo "🚀 Starting production stack..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Production deployment completed!"
echo ""
echo "📱 Services:"
echo "   • Web Frontend: http://localhost:3000"
echo "   • API Service: http://localhost:3001"
echo "   • AI Service: http://localhost:8000"
echo "   • MinIO Console: http://localhost:9001"
echo "   • Grafana: http://localhost:3002"
echo "   • Prometheus: http://localhost:9090"
echo ""
echo "🔍 Check status: docker-compose -f docker-compose.prod.yml ps"
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"
EOF

chmod +x "$PACKAGE_DIR/deploy-prod.sh"

# Create package info
print_status "Creating package information..."
cat > "$PACKAGE_DIR/PACKAGE_INFO.txt" << EOF
VISION PLATFORM RELEASE PACKAGE
===============================

Version: $VERSION
Build Date: $BUILD_DATE
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "Unknown")

PACKAGE CONTENTS:
================

Applications:
- Web Frontend (Next.js/React)
- Mobile App (React Native/Expo)

Services:
- API Service (Node.js/Express)
- AI Service (Python/FastAPI)

Infrastructure:
- MongoDB Database
- Redis Cache
- MinIO Object Storage
- Nginx Reverse Proxy
- Prometheus Monitoring
- Grafana Dashboards

Shared Components:
- TypeScript Types
- Utility Functions
- Common Models

Configuration:
- Docker Compose files
- Environment templates
- Nginx configurations
- Monitoring configurations

Scripts:
- Development startup
- Production build
- Testing suite
- Deployment helpers

Total Package Size: $(du -sh "$PACKAGE_DIR" | cut -f1)

QUICK START:
===========

1. Extract this package
2. Run: chmod +x *.sh
3. Run: ./quick-start.sh

For production deployment:
1. Configure .env file
2. Run: ./deploy-prod.sh

SUPPORT:
========

Documentation: See DEPLOYMENT.md
Issues: Check logs with docker-compose logs -f
EOF

# Create ZIP archive
print_status "Creating ZIP archive..."
cd "$RELEASE_DIR"
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME" -x "*.git*" "*.DS_Store" "*.log" "node_modules/*" "*.pyc" "__pycache__/*"

# Clean up package directory
rm -rf "$PACKAGE_NAME"

cd - > /dev/null

# Final summary
print_success "Release package created successfully!"
echo ""
echo "📦 Package Details:"
echo "   • Name: ${PACKAGE_NAME}.zip"
echo "   • Location: ${RELEASE_DIR}/${PACKAGE_NAME}.zip"
echo "   • Size: $(du -sh "${RELEASE_DIR}/${PACKAGE_NAME}.zip" | cut -f1)"
echo "   • Version: $VERSION"
echo "   • Build Date: $BUILD_DATE"
echo ""
echo "🚀 To deploy:"
echo "   1. Extract the ZIP file"
echo "   2. Run: chmod +x *.sh"
echo "   3. Run: ./quick-start.sh"
echo ""
echo "🏭 For production:"
echo "   1. Configure .env file"
echo "   2. Run: ./deploy-prod.sh"
