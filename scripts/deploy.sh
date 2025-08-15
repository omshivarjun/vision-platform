#!/bin/bash

# Vision Platform - Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Configuration
PROJECT_NAME="vision-platform"
DOCKER_REGISTRY="ghcr.io"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-your-username/vision-platform}"
VERSION="${VERSION:-$(git describe --tags --always)}"
ENVIRONMENT="${ENVIRONMENT:-production}"
DOMAIN="${DOMAIN:-vision-platform.com}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if kubectl is installed (for Kubernetes deployment)
    if ! command -v kubectl &> /dev/null; then
        log_warning "kubectl is not installed. Kubernetes deployment will be skipped."
        KUBERNETES_DEPLOYMENT=false
    else
        KUBERNETES_DEPLOYMENT=true
    fi
    
    # Check if AWS CLI is installed (for AWS deployment)
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI is not installed. AWS deployment will be skipped."
        AWS_DEPLOYMENT=false
    else
        AWS_DEPLOYMENT=true
    fi
    
    log_success "Prerequisites check completed"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    
    # Build frontend
    log_info "Building frontend image..."
    docker build -t ${PROJECT_NAME}-frontend:${VERSION} -f apps/web/Dockerfile apps/web/
    
    # Build backend
    log_info "Building backend image..."
    docker build -t ${PROJECT_NAME}-backend:${VERSION} -f backend/Dockerfile backend/
    
    # Tag images for registry
    docker tag ${PROJECT_NAME}-frontend:${VERSION} ${DOCKER_REGISTRY}/${GITHUB_REPOSITORY}-frontend:${VERSION}
    docker tag ${PROJECT_NAME}-backend:${VERSION} ${DOCKER_REGISTRY}/${GITHUB_REPOSITORY}-backend:${VERSION}
    
    log_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."
    
    # Login to registry (if using GitHub Container Registry)
    if [[ "${DOCKER_REGISTRY}" == "ghcr.io" ]]; then
        echo "${GITHUB_TOKEN}" | docker login ghcr.io -u ${GITHUB_USERNAME} --password-stdin
    fi
    
    # Push images
    docker push ${DOCKER_REGISTRY}/${GITHUB_REPOSITORY}-frontend:${VERSION}
    docker push ${DOCKER_REGISTRY}/${GITHUB_REPOSITORY}-backend:${VERSION}
    
    log_success "Images pushed to registry successfully"
}

# Deploy using Docker Compose
deploy_docker_compose() {
    log_info "Deploying using Docker Compose..."
    
    # Create production environment file
    if [[ ! -f ".env.production" ]]; then
        log_warning "Production environment file not found. Creating from template..."
        cp env.full .env.production
        log_warning "Please update .env.production with your production values"
        exit 1
    fi
    
    # Stop existing containers
    docker-compose -f docker-compose.full.yml down --remove-orphans
    
    # Pull latest images
    docker-compose -f docker-compose.full.yml pull
    
    # Start services
    docker-compose -f docker-compose.full.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    if curl -f http://localhost/health &> /dev/null; then
        log_success "Services are healthy"
    else
        log_error "Services are not healthy. Check logs with: docker-compose -f docker-compose.full.yml logs"
        exit 1
    fi
    
    log_success "Docker Compose deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    if [[ "${KUBERNETES_DEPLOYMENT}" == "false" ]]; then
        log_warning "Skipping Kubernetes deployment"
        return
    fi
    
    log_info "Deploying to Kubernetes..."
    
    # Check if kubectl context is set
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Kubernetes cluster is not accessible. Please check your kubectl configuration."
        return
    fi
    
    # Create namespace if it doesn't exist
    kubectl create namespace ${PROJECT_NAME} --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/ -n ${PROJECT_NAME}
    
    # Wait for deployment to be ready
    kubectl wait --for=condition=available --timeout=300s deployment/${PROJECT_NAME}-backend -n ${PROJECT_NAME}
    kubectl wait --for=condition=available --timeout=300s deployment/${PROJECT_NAME}-frontend -n ${PROJECT_NAME}
    
    log_success "Kubernetes deployment completed"
}

# Deploy to AWS
deploy_aws() {
    if [[ "${AWS_DEPLOYMENT}" == "false" ]]; then
        log_warning "Skipping AWS deployment"
        return
    fi
    
    log_info "Deploying to AWS..."
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Please run 'aws configure' first."
        return
    fi
    
    # Deploy to ECS (if using ECS)
    if [[ -f "aws/ecs-deploy.sh" ]]; then
        log_info "Deploying to ECS..."
        bash aws/ecs-deploy.sh
    fi
    
    # Deploy to EKS (if using EKS)
    if [[ -f "aws/eks-deploy.sh" ]]; then
        log_info "Deploying to EKS..."
        bash aws/eks-deploy.sh
    fi
    
    log_success "AWS deployment completed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Run frontend tests
    cd apps/web
    npm run test:ci
    cd ../..
    
    # Run backend tests
    cd backend
    npm run test:ci
    cd ..
    
    log_success "Tests completed successfully"
}

# Run security scan
security_scan() {
    log_info "Running security scan..."
    
    # Run Trivy vulnerability scanner
    if command -v trivy &> /dev/null; then
        trivy fs --severity HIGH,CRITICAL .
    else
        log_warning "Trivy not installed. Skipping security scan."
    fi
    
    # Run npm audit
    npm audit --audit-level=moderate
    cd apps/web && npm audit --audit-level=moderate && cd ../..
    cd backend && npm audit --audit-level=moderate && cd ..
    
    log_success "Security scan completed"
}

# Performance testing
performance_test() {
    log_info "Running performance tests..."
    
    # Check if k6 is installed
    if command -v k6 &> /dev/null; then
        k6 run tests/performance/load-test.js
    else
        log_warning "k6 not installed. Skipping performance tests."
    fi
    
    log_success "Performance tests completed"
}

# Health check
health_check() {
    log_info "Performing health check..."
    
    # Check if services are responding
    local health_endpoints=(
        "http://localhost/health"
        "http://localhost/api/health"
        "http://localhost:3000"  # Grafana
        "http://localhost:9090"  # Prometheus
    )
    
    for endpoint in "${health_endpoints[@]}"; do
        if curl -f "${endpoint}" &> /dev/null; then
            log_success "${endpoint} is healthy"
        else
            log_error "${endpoint} is not responding"
        fi
    done
    
    log_success "Health check completed"
}

# Backup
create_backup() {
    log_info "Creating backup..."
    
    # Create backup directory
    mkdir -p backups/$(date +%Y%m%d_%H%M%S)
    
    # Backup database
    if docker ps | grep -q postgres; then
        docker exec postgres pg_dump -U postgres vision_platform > backups/$(date +%Y%m%d_%H%M%S)/database.sql
    fi
    
    # Backup uploads
    if [[ -d "uploads" ]]; then
        tar -czf backups/$(date +%Y%m%d_%H%M%S)/uploads.tar.gz uploads/
    fi
    
    log_success "Backup created successfully"
}

# Rollback
rollback() {
    log_warning "Rolling back to previous version..."
    
    # Stop current deployment
    docker-compose -f docker-compose.full.yml down
    
    # Revert to previous version
    git checkout HEAD~1
    
    # Redeploy
    deploy_docker_compose
    
    log_success "Rollback completed"
}

# Main deployment function
main() {
    log_info "Starting Vision Platform deployment..."
    log_info "Version: ${VERSION}"
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Domain: ${DOMAIN}"
    
    # Check prerequisites
    check_prerequisites
    
    # Create backup before deployment
    create_backup
    
    # Run tests
    run_tests
    
    # Security scan
    security_scan
    
    # Build images
    build_images
    
    # Push images (if not local deployment)
    if [[ "${ENVIRONMENT}" != "local" ]]; then
        push_images
    fi
    
    # Deploy based on environment
    case "${ENVIRONMENT}" in
        "local")
            deploy_docker_compose
            ;;
        "staging")
            deploy_docker_compose
            performance_test
            ;;
        "production")
            deploy_docker_compose
            deploy_kubernetes
            deploy_aws
            performance_test
            ;;
        *)
            log_error "Unknown environment: ${ENVIRONMENT}"
            exit 1
            ;;
    esac
    
    # Health check
    health_check
    
    log_success "Deployment completed successfully!"
    
    # Display access information
    log_info "Access your application at:"
    log_info "  Frontend: http://${DOMAIN}"
    log_info "  API: http://${DOMAIN}/api"
    log_info "  Grafana: http://${DOMAIN}:3000"
    log_info "  Prometheus: http://${DOMAIN}:9090"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --version)
            VERSION="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --domain)
            DOMAIN="$2"
            shift 2
            ;;
        --rollback)
            rollback
            exit 0
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --version VERSION     Specify version to deploy"
            echo "  --environment ENV     Specify environment (local|staging|production)"
            echo "  --domain DOMAIN       Specify domain name"
            echo "  --rollback           Rollback to previous version"
            echo "  --help               Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run main deployment
main
