#!/bin/bash

# =============================================================================
# MULTIMODAL PLATFORM - DEVELOPMENT STARTUP SCRIPT
# =============================================================================
# This script starts the complete development environment
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    ! nc -z localhost $1 2>/dev/null
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local host=$2
    local port=$3
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z $host $port 2>/dev/null; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start within $((max_attempts * 2)) seconds"
    return 1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    # Check Node.js (for local development)
    if ! command_exists node; then
        print_warning "Node.js is not installed. Some features may not work locally."
    fi
    
    # Check Python (for local development)
    if ! command_exists python3; then
        print_warning "Python 3 is not installed. Some features may not work locally."
    fi
    
    print_success "Prerequisites check completed"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data/mongodb
    mkdir -p data/redis
    mkdir -p data/minio
    mkdir -p data/ai-models
    
    print_success "Directories created"
}

# Function to check environment file
check_environment() {
    print_status "Checking environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            print_warning ".env file not found. Creating from env.example..."
            cp env.example .env
            print_warning "Please review and update .env file with your configuration"
        else
            print_error "No .env or env.example file found. Please create .env file first."
            exit 1
        fi
    fi
    
    print_success "Environment configuration ready"
}

# Function to start infrastructure services
start_infrastructure() {
    print_status "Starting infrastructure services..."
    
    # Start only infrastructure services first
    docker-compose up -d mongodb redis minio
    
    # Wait for services to be ready
    wait_for_service "MongoDB" "localhost" "27017" || exit 1
    wait_for_service "Redis" "localhost" "6379" || exit 1
    wait_for_service "MinIO" "localhost" "9000" || exit 1
    
    print_success "Infrastructure services started"
}

# Function to initialize database
initialize_database() {
    print_status "Initializing database..."
    
    # Wait a bit more for MongoDB to be fully ready
    sleep 5
    
    # Check if database is already initialized
    if docker exec multimodal-mongodb mongosh --eval "db.adminCommand('listDatabases')" --quiet | grep -q "multimodal-platform"; then
        print_status "Database already initialized, skipping..."
        return 0
    fi
    
    # Run database initialization
    if [ -f "./scripts/mongo-init.js" ]; then
        docker exec multimodal-mongodb mongosh --eval "source('/docker-entrypoint-initdb.d/mongo-init.js')" --quiet
        print_success "Database initialized"
    else
        print_warning "Database initialization script not found, skipping..."
    fi
}

# Function to start application services
start_application_services() {
    print_status "Starting application services..."
    
    # Start API service
    docker-compose up -d api
    wait_for_service "API Service" "localhost" "3001" || exit 1
    
    # Start AI service
    docker-compose up -d ai-service
    wait_for_service "AI Service" "localhost" "8000" || exit 1
    
    print_success "Application services started"
}

# Function to start frontend services
start_frontend_services() {
    print_status "Starting frontend services..."
    
    # Start web frontend
    docker-compose up -d web
    wait_for_service "Web Frontend" "localhost" "3000" || exit 1
    
    # Start mobile development server
    docker-compose up -d mobile
    wait_for_service "Mobile Dev Server" "localhost" "19000" || exit 1
    
    print_success "Frontend services started"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo ""
    
    # Infrastructure services
    echo "Infrastructure Services:"
    echo "  MongoDB:     $(docker-compose ps -q mongodb >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo "  Redis:       $(docker-compose ps -q redis >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo "  MinIO:       $(docker-compose ps -q minio >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo ""
    
    # Application services
    echo "Application Services:"
    echo "  API:         $(docker-compose ps -q api >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo "  AI Service:  $(docker-compose ps -q ai-service >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo ""
    
    # Frontend services
    echo "Frontend Services:"
    echo "  Web:         $(docker-compose ps -q web >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo "  Mobile:      $(docker-compose ps -q mobile >/dev/null && echo "✅ Running" || echo "❌ Stopped")"
    echo ""
    
    # Service URLs
    echo "Service URLs:"
    echo "  Web Frontend:        http://localhost:3000"
    echo "  API Documentation:   http://localhost:3001/api-docs"
    echo "  API Health Check:    http://localhost:3001/health"
    echo "  MinIO Console:       http://localhost:9001"
    echo "  Mobile Dev Server:   http://localhost:19000"
    echo ""
    
    # Demo accounts
    echo "Demo Accounts:"
    echo "  Admin:       admin@demo.local / Admin123!"
    echo "  User:        user@demo.local / User123!"
    echo "  Accessibility: visuallyimpaired@demo.local / Access123!"
    echo ""
}

# Function to show logs
show_logs() {
    print_status "Showing service logs (Ctrl+C to exit)..."
    docker-compose logs -f
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    docker-compose down -v
    docker system prune -f
    print_success "Cleanup completed"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start all services (default)"
    echo "  stop        Stop all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  logs        Show service logs"
    echo "  clean       Stop and clean up all data"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0           # Start all services"
    echo "  $0 start     # Start all services"
    echo "  $0 status    # Show service status"
    echo "  $0 logs      # Show service logs"
}

# Main script logic
main() {
    local command=${1:-start}
    
    case $command in
        start)
            print_status "Starting Multimodal Platform development environment..."
            check_prerequisites
            create_directories
            check_environment
            start_infrastructure
            initialize_database
            start_application_services
            start_frontend_services
            show_status
            print_success "Development environment started successfully!"
            print_status "You can now access the platform at http://localhost:3000"
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            main start
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        clean)
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Handle script interruption
trap 'print_status "Interrupted. Use \"$0 stop\" to stop services."; exit 1' INT

# Run main function
main "$@"
