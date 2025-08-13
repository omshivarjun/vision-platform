#!/bin/bash

# Vision Platform - Production Build Script
# This script builds production containers for all services

set -e

echo "🏗️  Building Vision Platform Production Images..."

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

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your production configuration."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🛑 Build process interrupted..."
    exit 1
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared
npm install
npm run build
cd ../..

# Build all services with production target
echo "🐳 Building production Docker images..."

# Build API service
echo "📦 Building API service..."
docker-compose -f docker-compose.prod.yml build api

# Build AI service
echo "🤖 Building AI service..."
docker-compose -f docker-compose.prod.yml build ai-service

# Build Web frontend
echo "🌐 Building Web frontend..."
docker-compose -f docker-compose.prod.yml build web

# Build Mobile app (if needed for production)
echo "📱 Building Mobile app..."
docker-compose -f docker-compose.prod.yml build mobile

# Build Nginx
echo "🔧 Building Nginx..."
docker-compose -f docker-compose.prod.yml build nginx

echo ""
echo "✅ All production images built successfully!"
echo ""
echo "📋 Built Images:"
docker images | grep vision-platform

echo ""
echo "🚀 To deploy to production:"
echo "   docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "🔍 To check service status:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "📊 To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
