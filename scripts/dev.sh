#!/bin/bash

# Vision Platform - Development Script
# This script starts the full local development stack

set -e

echo "🚀 Starting Vision Platform Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping development environment..."
    docker-compose down
    echo "✅ Development environment stopped."
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p infrastructure/mongodb/init
mkdir -p infrastructure/nginx
mkdir -p infrastructure/monitoring
mkdir -p logs

# Check if .env file exists, if not create from example
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📋 Creating .env file from .env.example..."
        cp .env.example .env
    else
        echo "⚠️  No .env file found. Please create one with your configuration."
        exit 1
    fi
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
fi

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared
npm install
npm run build
cd ../..

# Build and start services
echo "🐳 Building and starting Docker services..."
docker-compose build

echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is ready"
else
    echo "❌ MongoDB is not ready"
fi

# Check Redis
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "❌ Redis is not ready"
fi

# Check MinIO
if curl -s http://localhost:9000/minio/health/live > /dev/null; then
    echo "✅ MinIO is ready"
else
    echo "❌ MinIO is not ready"
fi

# Check API service
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ API service is ready"
else
    echo "❌ API service is not ready"
fi

# Check AI service
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ AI service is ready"
else
    echo "❌ AI service is not ready"
fi

# Check Web frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Web frontend is ready"
else
    echo "❌ Web frontend is not ready"
fi

echo ""
echo "🎉 Vision Platform Development Environment is running!"
echo ""
echo "📱 Services:"
echo "   • Web Frontend: http://localhost:3000"
echo "   • API Service: http://localhost:3001"
echo "   • AI Service: http://localhost:8000"
echo "   • Mobile Dev: http://localhost:19000"
echo "   • MinIO Console: http://localhost:9001"
echo "   • Grafana: http://localhost:3002"
echo "   • Prometheus: http://localhost:9090"
echo ""
echo "🔧 Useful commands:"
echo "   • View logs: docker-compose logs -f [service]"
echo "   • Stop services: docker-compose down"
echo "   • Restart service: docker-compose restart [service]"
echo "   • Rebuild service: docker-compose up -d --build [service]"
echo ""
echo "📊 Monitoring:"
echo "   • View all logs: docker-compose logs -f"
echo "   • Check service status: docker-compose ps"
echo ""
echo "Press Ctrl+C to stop all services"

# Keep script running and show logs
docker-compose logs -f
