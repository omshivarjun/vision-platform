#!/bin/bash

# =============================================================================
# MULTIMODAL PLATFORM - PRODUCTION BUILD SCRIPT
# =============================================================================
# This script builds production-ready containers and artifacts
# =============================================================================

set -e  # Exit on any error

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

# Configuration
BUILD_DIR="./build"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-registry.com"}
VERSION=${VERSION:-$(git describe --tags --always --dirty 2>/dev/null || echo "dev")}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking build prerequisites..."
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    # Check Node.js for frontend builds
    if ! command -v node >/dev/null 2>&1; then
        print_warning "Node.js is not installed. Frontend builds may fail."
    fi
    
    # Check Python for AI service builds
    if ! command -v python3 >/dev/null 2>&1; then
        print_warning "Python 3 is not installed. AI service builds may fail."
    fi
    
    print_success "Prerequisites check completed"
}

# Function to create build directory
create_build_directory() {
    print_status "Creating build directory..."
    
    rm -rf "$BUILD_DIR"
    mkdir -p "$BUILD_DIR"
    mkdir -p "$BUILD_DIR/docker"
    mkdir -p "$BUILD_DIR/artifacts"
    mkdir -p "$BUILD_DIR/configs"
    
    print_success "Build directory created: $BUILD_DIR"
}

# Function to build shared package
build_shared_package() {
    print_status "Building shared package..."
    
    cd packages/shared
    
    # Install dependencies
    npm ci --only=production
    
    # Build package
    npm run build
    
    # Copy built package to build directory
    cp -r dist/* "$BUILD_DIR/artifacts/shared/"
    
    cd ../..
    print_success "Shared package built successfully"
}

# Function to build web frontend
build_web_frontend() {
    print_status "Building web frontend..."
    
    cd apps/web
    
    # Install dependencies
    npm ci --only=production
    
    # Build frontend
    npm run build
    
    # Copy built frontend to build directory
    cp -r dist/* "$BUILD_DIR/artifacts/web/"
    
    cd ../..
    print_success "Web frontend built successfully"
}

# Function to build API service
build_api_service() {
    print_status "Building API service..."
    
    cd services/api
    
    # Install dependencies
    npm ci --only=production
    
    # Build service
    npm run build
    
    # Copy built service to build directory
    cp -r dist/* "$BUILD_DIR/artifacts/api/"
    cp package*.json "$BUILD_DIR/artifacts/api/"
    
    cd ../..
    print_success "API service built successfully"
}

# Function to build AI service
build_ai_service() {
    print_status "Building AI service..."
    
    cd services/ai
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    
    # Copy service files to build directory
    cp -r . "$BUILD_DIR/artifacts/ai/"
    rm -rf "$BUILD_DIR/artifacts/ai/venv"
    rm -rf "$BUILD_DIR/artifacts/ai/__pycache__"
    
    # Deactivate virtual environment
    deactivate
    
    cd ../..
    print_success "AI service built successfully"
}

# Function to build Docker images
build_docker_images() {
    print_status "Building Docker images..."
    
    # Build API service image
    print_status "Building API service Docker image..."
    docker build \
        --build-arg VERSION="$VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --target production \
        -t "$DOCKER_REGISTRY/multimodal-api:$VERSION" \
        -t "$DOCKER_REGISTRY/multimodal-api:latest" \
        ./services/api
    
    # Build AI service image
    print_status "Building AI service Docker image..."
    docker build \
        --build-arg VERSION="$VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --target production \
        -t "$DOCKER_REGISTRY/multimodal-ai:$VERSION" \
        -t "$DOCKER_REGISTRY/multimodal-ai:latest" \
        ./services/ai
    
    # Build web frontend image
    print_status "Building web frontend Docker image..."
    docker build \
        --build-arg VERSION="$VERSION" \
        --build-arg BUILD_DATE="$BUILD_DATE" \
        --target production \
        -t "$DOCKER_REGISTRY/multimodal-web:$VERSION" \
        -t "$DOCKER_REGISTRY/multimodal-web:latest" \
        ./apps/web
    
    print_success "All Docker images built successfully"
}

# Function to save Docker images
save_docker_images() {
    print_status "Saving Docker images..."
    
    # Save images to tar files
    docker save "$DOCKER_REGISTRY/multimodal-api:$VERSION" | gzip > "$BUILD_DIR/docker/multimodal-api-$VERSION.tar.gz"
    docker save "$DOCKER_REGISTRY/multimodal-ai:$VERSION" | gzip > "$BUILD_DIR/docker/multimodal-ai-$VERSION.tar.gz"
    docker save "$DOCKER_REGISTRY/multimodal-web:$VERSION" | gzip > "$BUILD_DIR/docker/multimodal-web-$VERSION.tar.gz"
    
    print_success "Docker images saved to $BUILD_DIR/docker/"
}

# Function to copy configuration files
copy_configuration_files() {
    print_status "Copying configuration files..."
    
    # Copy Docker Compose files
    cp docker-compose.yml "$BUILD_DIR/configs/"
    cp docker-compose.prod.yml "$BUILD_DIR/configs/"
    
    # Copy environment example
    cp env.example "$BUILD_DIR/configs/"
    
    # Copy scripts
    cp -r scripts "$BUILD_DIR/"
    
    # Copy infrastructure configurations
    if [ -d "infrastructure" ]; then
        cp -r infrastructure "$BUILD_DIR/"
    fi
    
    print_success "Configuration files copied"
}

# Function to create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    cd "$BUILD_DIR"
    
    # Create deployment script
    cat > deploy.sh << 'EOF'
#!/bin/bash
# Multimodal Platform Deployment Script

set -e

echo "Deploying Multimodal Platform..."

# Load environment variables
if [ -f ".env" ]; then
    source .env
else
    echo "Error: .env file not found. Please create one from env.example"
    exit 1
fi

# Start services
docker-compose -f configs/docker-compose.yml -f configs/docker-compose.prod.yml up -d

echo "Deployment completed successfully!"
echo "Access the platform at: http://localhost:3000"
EOF
    
    chmod +x deploy.sh
    
    # Create README
    cat > README.md << EOF
# Multimodal Platform - Production Build

**Version:** $VERSION  
**Build Date:** $BUILD_DATE

## Contents

- \`artifacts/\` - Built application files
- \`docker/\` - Docker image archives
- \`configs/\` - Configuration files
- \`scripts/\` - Utility scripts
- \`infrastructure/\` - Infrastructure configurations

## Quick Start

1. Copy \`env.example\` to \`.env\` and configure your environment
2. Run \`./deploy.sh\` to start the platform
3. Access the web interface at http://localhost:3000

## Demo Accounts

- **Admin:** admin@demo.local / Admin123!
- **User:** user@demo.local / User123!
- **Accessibility:** visuallyimpaired@demo.local / Access123!

## Support

For support and documentation, visit: https://github.com/your-org/multimodal-platform
EOF
    
    cd ..
    print_success "Deployment package created"
}

# Function to create build summary
create_build_summary() {
    print_status "Creating build summary..."
    
    cat > "$BUILD_DIR/BUILD_INFO.txt" << EOF
MULTIMODAL PLATFORM BUILD INFORMATION
=====================================

Build Date: $BUILD_DATE
Version: $VERSION
Git Commit: $(git rev-parse HEAD 2>/dev/null || echo "Unknown")
Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "Unknown")

BUILD CONTENTS:
==============

Artifacts:
- Shared Package: $(du -sh "$BUILD_DIR/artifacts/shared" 2>/dev/null | cut -f1 || echo "N/A")
- Web Frontend: $(du -sh "$BUILD_DIR/artifacts/web" 2>/dev/null | cut -f1 || echo "N/A")
- API Service: $(du -sh "$BUILD_DIR/artifacts/api" 2>/dev/null | cut -f1 || echo "N/A")
- AI Service: $(du -sh "$BUILD_DIR/artifacts/ai" 2>/dev/null | cut -f1 || echo "N/A")

Docker Images:
- API Service: $DOCKER_REGISTRY/multimodal-api:$VERSION
- AI Service: $DOCKER_REGISTRY/multimodal-ai:$VERSION
- Web Frontend: $DOCKER_REGISTRY/multimodal-web:$VERSION

Total Build Size: $(du -sh "$BUILD_DIR" | cut -f1)

BUILD COMPLETED SUCCESSFULLY!
EOF
    
    print_success "Build summary created"
}

# Function to show build help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --version VERSION     Set build version (default: git tag or 'dev')"
    echo "  --registry REGISTRY   Set Docker registry (default: your-registry.com)"
    echo "  --skip-docker         Skip Docker image building"
    echo "  --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build with default settings"
    echo "  $0 --version 1.0.0    # Build version 1.0.0"
    echo "  $0 --skip-docker      # Build without Docker images"
}

# Parse command line arguments
SKIP_DOCKER=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main build process
main() {
    print_status "Starting Multimodal Platform production build..."
    print_status "Version: $VERSION"
    print_status "Docker Registry: $DOCKER_REGISTRY"
    print_status "Build Directory: $BUILD_DIR"
    
    # Check prerequisites
    check_prerequisites
    
    # Create build directory
    create_build_directory
    
    # Build packages
    build_shared_package
    build_web_frontend
    build_api_service
    build_ai_service
    
    # Build Docker images (if not skipped)
    if [ "$SKIP_DOCKER" = false ]; then
        build_docker_images
        save_docker_images
    else
        print_warning "Docker image building skipped"
    fi
    
    # Copy configuration files
    copy_configuration_files
    
    # Create deployment package
    create_deployment_package
    
    # Create build summary
    create_build_summary
    
    print_success "Production build completed successfully!"
    print_status "Build artifacts available in: $BUILD_DIR"
    print_status "To deploy, run: cd $BUILD_DIR && ./deploy.sh"
}

# Run main function
main "$@"
