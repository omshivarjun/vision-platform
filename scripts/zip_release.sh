#!/bin/bash

# ZIP Release Script for Vision Monorepo
# Creates a production-ready, deployable ZIP archive

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="vision-monorepo"
VERSION=$(date +"%Y%m%d-%H%M%S")
RELEASE_DIR="release-${VERSION}"
ZIP_NAME="${REPO_NAME}-${VERSION}.zip"
BUILD_DIR="build"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v zip &> /dev/null; then
        error "zip command not found. Please install zip utility."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        error "Docker not found. Please install Docker."
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js not found. Please install Node.js."
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        error "Python3 not found. Please install Python3."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Clean previous releases
cleanup() {
    log "Cleaning up previous releases..."
    
    if [ -d "$RELEASE_DIR" ]; then
        rm -rf "$RELEASE_DIR"
    fi
    
    if [ -f "$ZIP_NAME" ]; then
        rm -f "$ZIP_NAME"
    fi
    
    success "Cleanup completed"
}

# Create release directory structure
create_structure() {
    log "Creating release directory structure..."
    
    mkdir -p "$RELEASE_DIR"
    mkdir -p "$RELEASE_DIR/apps"
    mkdir -p "$RELEASE_DIR/services"
    mkdir -p "$RELEASE_DIR/packages"
    mkdir -p "$RELEASE_DIR/infrastructure"
    mkdir -p "$RELEASE_DIR/scripts"
    mkdir -p "$RELEASE_DIR/tests"
    mkdir -p "$RELEASE_DIR/docs"
    mkdir -p "$RELEASE_DIR/samples"
    
    success "Directory structure created"
}

# Copy source code
copy_source() {
    log "Copying source code..."
    
    # Copy apps
    if [ -d "apps" ]; then
        cp -r apps/* "$RELEASE_DIR/apps/"
        success "Apps copied"
    fi
    
    # Copy services
    if [ -d "services" ]; then
        cp -r services/* "$RELEASE_DIR/services/"
        success "Services copied"
    fi
    
    # Copy packages
    if [ -d "packages" ]; then
        cp -r packages/* "$RELEASE_DIR/packages/"
        success "Packages copied"
    fi
    
    # Copy infrastructure
    if [ -d "infrastructure" ]; then
        cp -r infrastructure/* "$RELEASE_DIR/infrastructure/"
        success "Infrastructure copied"
    fi
    
    # Copy scripts
    if [ -d "scripts" ]; then
        cp -r scripts/* "$RELEASE_DIR/scripts/"
        success "Scripts copied"
    fi
    
    # Copy tests
    if [ -d "tests" ]; then
        cp -r tests/* "$RELEASE_DIR/tests/"
        success "Tests copied"
    fi
}

# Copy configuration files
copy_config() {
    log "Copying configuration files..."
    
    # Root level configs
    local config_files=(
        "package.json"
        "tsconfig.json"
        "docker-compose.yml"
        "docker-compose.override.yml"
        "docker-compose.prod.yml"
        "env.example"
        ".gitignore"
        "README.md"
        "LICENSE"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$RELEASE_DIR/"
            success "Copied $file"
        else
            warn "Config file $file not found, skipping"
        fi
    done
}

# Build production assets
build_assets() {
    log "Building production assets..."
    
    # Install dependencies and build shared package
    if [ -d "packages/shared" ]; then
        log "Building shared package..."
        cd packages/shared
        npm install --production
        npm run build
        cd ../..
        success "Shared package built"
    fi
    
    # Build web app
    if [ -d "apps/web" ]; then
        log "Building web app..."
        cd apps/web
        npm install --production
        npm run build
        cd ../..
        success "Web app built"
    fi
    
    # Build API service
    if [ -d "services/api" ]; then
        log "Building API service..."
        cd services/api
        npm install --production
        npm run build
        cd ../..
        success "API service built"
    fi
    
    # Build AI service
    if [ -d "services/ai" ]; then
        log "Building AI service..."
        cd services/ai
        python3 -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        deactivate
        cd ../..
        success "AI service built"
    fi
}

# Create Docker images
build_docker() {
    log "Building Docker images..."
    
    # Build API service
    if [ -d "services/api" ]; then
        log "Building API Docker image..."
        docker build -t vision-api:latest services/api/
        success "API Docker image built"
    fi
    
    # Build AI service
    if [ -d "services/ai" ]; then
        log "Building AI service Docker image..."
        docker build -t vision-ai:latest services/ai/
        success "AI service Docker image built"
    fi
    
    # Build web app
    if [ -d "apps/web" ]; then
        log "Building web app Docker image..."
        docker build -t vision-web:latest apps/web/
        success "Web app Docker image built"
    fi
    
    # Build mobile app
    if [ -d "apps/mobile" ]; then
        log "Building mobile app Docker image..."
        docker build -t vision-mobile:latest apps/mobile/
        success "Mobile app Docker image built"
    fi
}

# Save Docker images
save_docker_images() {
    log "Saving Docker images..."
    
    mkdir -p "$RELEASE_DIR/docker-images"
    
    # Save all images
    local images=("vision-api:latest" "vision-ai:latest" "vision-web:latest" "vision-mobile:latest")
    
    for image in "${images[@]}"; do
        if docker image inspect "$image" &> /dev/null; then
            log "Saving $image..."
            docker save "$image" | gzip > "$RELEASE_DIR/docker-images/${image//:/_}.tar.gz"
            success "Saved $image"
        else
            warn "Image $image not found, skipping"
        fi
    done
}

# Create deployment scripts
create_deployment_scripts() {
    log "Creating deployment scripts..."
    
    # Main deployment script
    cat > "$RELEASE_DIR/deploy.sh" << 'EOF'
#!/bin/bash

# Vision Monorepo Deployment Script
# This script deploys the entire Vision platform

set -e

# Configuration
ENV_FILE=".env"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker not found"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose not found"
        exit 1
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        error "Environment file $ENV_FILE not found"
        error "Please copy env.example to .env and configure your environment"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Load Docker images
load_images() {
    log "Loading Docker images..."
    
    if [ -d "docker-images" ]; then
        for image_file in docker-images/*.tar.gz; do
            if [ -f "$image_file" ]; then
                log "Loading $image_file..."
                docker load < "$image_file"
                success "Loaded $image_file"
            fi
        done
    fi
}

# Deploy services
deploy() {
    log "Deploying services..."
    
    # Start infrastructure services
    log "Starting infrastructure services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d mongodb redis minio
    
    # Wait for infrastructure to be ready
    log "Waiting for infrastructure services to be ready..."
    sleep 30
    
    # Start application services
    log "Starting application services..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d api ai-service web nginx
    
    success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for services to start
    sleep 10
    
    # Check API health
    if curl -f http://localhost:3001/health &> /dev/null; then
        success "API service is healthy"
    else
        error "API service health check failed"
    fi
    
    # Check web app
    if curl -f http://localhost:3000 &> /dev/null; then
        success "Web app is accessible"
    else
        error "Web app health check failed"
    fi
}

# Main execution
main() {
    log "Starting Vision monorepo deployment..."
    
    check_prerequisites
    load_images
    deploy
    health_check
    
    success "Deployment completed successfully!"
    log "Access your application at:"
    log "  Web App: http://localhost:3000"
    log "  API: http://localhost:3001"
    log "  API Docs: http://localhost:3001/api-docs"
}

main "$@"
EOF
    
    chmod +x "$RELEASE_DIR/deploy.sh"
    
    # Quick start script
    cat > "$RELEASE_DIR/quick-start.sh" << 'EOF'
#!/bin/bash

# Quick Start Script for Vision Monorepo
# For development and testing purposes

set -e

log() {
    echo -e "\033[0;34m[$(date +'%Y-%m-%d %H:%M:%S')]\033[0m $1"
}

success() {
    echo -e "\033[0;32m[SUCCESS]\033[0m $1"
}

log "Starting Vision monorepo in development mode..."

# Copy environment file if it doesn't exist
if [ ! -f ".env" ]; then
    cp env.example .env
    log "Created .env file from template"
fi

# Start development stack
./scripts/dev.sh

success "Development stack started!"
log "Access your application at:"
log "  Web App: http://localhost:3000"
log "  Mobile Dev: Expo dev server"
log "  API: http://localhost:3001"
log "  API Docs: http://localhost:3001/api-docs"
EOF
    
    chmod +x "$RELEASE_DIR/quick-start.sh"
    
    success "Deployment scripts created"
}

# Create documentation
create_documentation() {
    log "Creating documentation..."
    
    # Release notes
    cat > "$RELEASE_DIR/RELEASE_NOTES.md" << 'EOF'
# Vision Monorepo Release Notes

## Version: $(date +"%Y-%m-%d %H:%M:%S")

### What's Included

This release contains the complete Vision platform with two main projects:

1. **Cross-language Multimodal Translator**
   - Text-to-text translation with 50+ language support
   - Speech-to-text and text-to-speech capabilities
   - Image-to-text translation via OCR
   - Real-time conversation mode
   - Translation memory and user glossary
   - Offline fallback support

2. **Multimodal Accessibility Companion**
   - Voice-first user experience
   - OCR reader for printed and handwritten text
   - Scene description and object detection
   - Navigation assistance with voice guidance
   - WCAG 2.1 AA compliant interface
   - Privacy mode and on-device processing

### Architecture

- **Frontend**: React (Vite) + TailwindCSS + React Native (Expo)
- **Backend**: Node.js + Express + TypeScript
- **AI Services**: Python FastAPI with ML models
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Storage**: S3-compatible object storage
- **Real-time**: Socket.IO
- **Containerization**: Docker + Docker Compose

### Quick Start

1. **Development Mode**:
   ```bash
   ./quick-start.sh
   ```

2. **Production Deployment**:
   ```bash
   ./deploy.sh
   ```

### Environment Configuration

1. Copy `env.example` to `.env`
2. Configure your environment variables
3. Ensure Docker and Docker Compose are installed

### Support

For issues and questions, please refer to the main README.md file.

### License

MIT License - see LICENSE file for details.
EOF
    
    # Deployment guide
    cat > "$RELEASE_DIR/DEPLOYMENT_GUIDE.md" << 'EOF'
# Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

## Production Deployment

### 1. Environment Setup

```bash
# Copy and configure environment file
cp env.example .env
# Edit .env with your production values
nano .env
```

### 2. Deploy

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 3. Verify Deployment

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Development Setup

### 1. Quick Start

```bash
chmod +x quick-start.sh
./quick-start.sh
```

### 2. Manual Setup

```bash
# Install dependencies
npm install

# Start infrastructure
docker-compose up -d mongodb redis minio

# Start services
npm run dev
```

## Monitoring

- **Health Checks**: http://localhost:3001/health
- **API Documentation**: http://localhost:3001/api-docs
- **Grafana Dashboard**: http://localhost:3000 (if enabled)

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 27017, 6379, 9000 are available
2. **Memory issues**: Increase Docker memory limit to 4GB+
3. **Permission errors**: Ensure Docker daemon is running and user has proper permissions

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f ai-service
```
EOF
    
    success "Documentation created"
}

# Create sample data
create_sample_data() {
    log "Creating sample data..."
    
    mkdir -p "$RELEASE_DIR/samples/images"
    mkdir -p "$RELEASE_DIR/samples/audio"
    mkdir -p "$RELEASE_DIR/samples/text"
    
    # Sample text files
    cat > "$RELEASE_DIR/samples/text/sample_english.txt" << 'EOF'
Hello, welcome to the Vision platform!
This is a sample text file for testing translation features.
The platform supports multiple languages and modalities.
EOF
    
    cat > "$RELEASE_DIR/samples/text/sample_spanish.txt" << 'EOF'
¡Hola, bienvenido a la plataforma Vision!
Este es un archivo de texto de muestra para probar las funciones de traducción.
La plataforma admite múltiples idiomas y modalidades.
EOF
    
    cat > "$RELEASE_DIR/samples/text/sample_french.txt" << 'EOF'
Bonjour, bienvenue sur la plateforme Vision !
Ceci est un fichier texte d'exemple pour tester les fonctionnalités de traduction.
La plateforme prend en charge plusieurs langues et modalités.
EOF
    
    # Sample image descriptions (placeholder for actual images)
    cat > "$RELEASE_DIR/samples/images/README.md" << 'EOF'
# Sample Images

This directory should contain sample images for testing OCR and scene description features.

## Recommended Images

1. **Text Images**: Business cards, signs, documents
2. **Scene Images**: Indoor/outdoor scenes, objects, people
3. **Accessibility Images**: Navigation scenarios, obstacle detection

## Note

Due to size constraints, actual image files are not included in this release.
Please add your own sample images for testing purposes.
EOF
    
    # Sample audio descriptions
    cat > "$RELEASE_DIR/samples/audio/README.md" << 'EOF'
# Sample Audio

This directory should contain sample audio files for testing speech-to-text and text-to-speech features.

## Recommended Audio

1. **Speech Samples**: Clear speech in different languages
2. **Audio Quality**: Various bitrates and formats (MP3, WAV, M4A)
3. **Duration**: 5-30 second clips for testing

## Note

Due to size constraints, actual audio files are not included in this release.
Please add your own sample audio for testing purposes.
EOF
    
    success "Sample data created"
}

# Create ZIP archive
create_zip() {
    log "Creating ZIP archive..."
    
    cd "$RELEASE_DIR"
    zip -r "../$ZIP_NAME" . -x "*.git*" "node_modules/*" "venv/*" "__pycache__/*"
    cd ..
    
    success "ZIP archive created: $ZIP_NAME"
}

# Generate build info
generate_build_info() {
    log "Generating build information..."
    
    cat > "$RELEASE_DIR/BUILD_INFO.txt" << EOF
Vision Monorepo Build Information
=================================

Build Date: $(date)
Build Version: $VERSION
Repository: $REPO_NAME

Contents:
- Apps: Web (React), Mobile (React Native)
- Services: API (Node.js), AI (Python)
- Packages: Shared types and utilities
- Infrastructure: Docker, Docker Compose
- Scripts: Development, build, test, deployment
- Documentation: README, deployment guides
- Sample Data: Text, image descriptions, audio descriptions

Total Size: $(du -sh "$RELEASE_DIR" | cut -f1)

Docker Images:
$(docker images | grep vision || echo "No vision images found")

Requirements:
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+
- Python 3.8+
- 4GB RAM minimum
- 10GB disk space

Quick Start:
1. Extract the ZIP file
2. Run: ./quick-start.sh (development)
3. Run: ./deploy.sh (production)

For detailed instructions, see README.md and DEPLOYMENT_GUIDE.md
EOF
    
    success "Build information generated"
}

# Main execution
main() {
    log "Starting Vision monorepo release creation..."
    
    check_prerequisites
    cleanup
    create_structure
    copy_source
    copy_config
    build_assets
    build_docker
    save_docker_images
    create_deployment_scripts
    create_documentation
    create_sample_data
    generate_build_info
    create_zip
    
    success "Release creation completed successfully!"
    log "Release package: $ZIP_NAME"
    log "Release directory: $RELEASE_DIR"
    log ""
    log "Next steps:"
    log "1. Extract the ZIP file on your target system"
    log "2. Configure environment variables (copy env.example to .env)"
    log "3. Run ./deploy.sh for production deployment"
    log "4. Run ./quick-start.sh for development setup"
}

# Run main function
main "$@"
