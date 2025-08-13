# Vision Platform - Makefile
# Common tasks for development, building, testing, and deployment

.PHONY: help dev build test lint clean docker-up docker-down docker-build docker-logs setup install zip-release

# Default target
help:
	@echo "Vision Platform - Available Commands"
	@echo "===================================="
	@echo ""
	@echo "Development:"
	@echo "  dev          - Start development environment"
	@echo "  install      - Install all dependencies"
	@echo "  setup        - Initial setup and configuration"
	@echo ""
	@echo "Building:"
	@echo "  build        - Build all packages and services"
	@echo "  build-web    - Build web frontend"
	@echo "  build-api    - Build API service"
	@echo "  build-ai     - Build AI service"
	@echo "  build-mobile - Build mobile app"
	@echo ""
	@echo "Testing:"
	@echo "  test         - Run all tests"
	@echo "  test-unit    - Run unit tests only"
	@echo "  test-integration - Run integration tests only"
	@echo "  test-e2e     - Run E2E tests only"
	@echo "  coverage     - Generate test coverage report"
	@echo ""
	@echo "Quality:"
	@echo "  lint         - Run linting on all packages"
	@echo "  lint-fix     - Fix linting issues automatically"
	@echo "  type-check   - Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up    - Start all Docker services"
	@echo "  docker-down  - Stop all Docker services"
	@echo "  docker-build - Build all Docker images"
	@echo "  docker-logs  - Show Docker service logs"
	@echo "  docker-clean - Clean up Docker resources"
	@echo ""
	@echo "Deployment:"
	@echo "  deploy-dev   - Deploy to development environment"
	@echo "  deploy-prod  - Deploy to production environment"
	@echo "  zip-release  - Create deployable ZIP package"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean        - Clean all build artifacts and dependencies"
	@echo "  reset        - Reset entire development environment"
	@echo "  update       - Update all dependencies"
	@echo ""
	@echo "Examples:"
	@echo "  make dev           # Start development environment"
	@echo "  make test coverage # Run tests and generate coverage"
	@echo "  make docker-up     # Start Docker services"
	@echo "  make zip-release   # Create deployment package"

# Development commands
dev:
	@echo "🚀 Starting Vision Platform development environment..."
	@chmod +x scripts/dev.sh
	@./scripts/dev.sh

install:
	@echo "📦 Installing dependencies..."
	@npm install
	@cd packages/shared && npm install
	@cd apps/web && npm install
	@cd apps/mobile && npm install
	@cd services/api && npm install
	@cd services/ai && pip install -r requirements.txt

setup:
	@echo "🔧 Setting up Vision Platform..."
	@cp env.example .env
	@echo "✅ Environment file created. Please edit .env with your configuration."
	@make install
	@make docker-up
	@echo "🎉 Setup complete! Run 'make dev' to start development."

# Building commands
build:
	@echo "🏗️  Building Vision Platform..."
	@cd packages/shared && npm run build
	@cd apps/web && npm run build
	@cd services/api && npm run build
	@echo "✅ Build complete!"

build-web:
	@echo "🌐 Building web frontend..."
	@cd apps/web && npm run build

build-api:
	@echo "📦 Building API service..."
	@cd services/api && npm run build

build-ai:
	@echo "🤖 Building AI service..."
	@cd services/ai && python -m pip install -r requirements.txt

build-mobile:
	@echo "📱 Building mobile app..."
	@cd apps/mobile && npm run build

# Testing commands
test:
	@echo "🧪 Running all tests..."
	@chmod +x scripts/test.sh
	@./scripts/test.sh

test-unit:
	@echo "🧪 Running unit tests..."
	@cd packages/shared && npm run test
	@cd apps/web && npm run test
	@cd services/api && npm run test

test-integration:
	@echo "🔗 Running integration tests..."
	@cd services/api && npm run test:integration

test-e2e:
	@echo "🌐 Running E2E tests..."
	@cd apps/web && npm run test:e2e

coverage:
	@echo "📊 Generating coverage report..."
	@cd packages/shared && npm run test -- --coverage
	@cd apps/web && npm run test -- --coverage
	@cd services/api && npm run test -- --coverage

# Quality commands
lint:
	@echo "🔍 Running linting..."
	@cd packages/shared && npm run lint
	@cd apps/web && npm run lint
	@cd services/api && npm run lint

lint-fix:
	@echo "🔧 Fixing linting issues..."
	@cd packages/shared && npm run lint:fix
	@cd apps/web && npm run lint:fix
	@cd services/api && npm run lint:fix

type-check:
	@echo "🔍 Running TypeScript type checking..."
	@cd packages/shared && npm run type-check
	@cd apps/web && npm run type-check
	@cd services/api && npm run type-check

# Docker commands
docker-up:
	@echo "🐳 Starting Docker services..."
	@docker-compose up -d

docker-down:
	@echo "🛑 Stopping Docker services..."
	@docker-compose down

docker-build:
	@echo "🏗️  Building Docker images..."
	@docker-compose build

docker-logs:
	@echo "📊 Showing Docker logs..."
	@docker-compose logs -f

docker-clean:
	@echo "🧹 Cleaning Docker resources..."
	@docker-compose down -v --remove-orphans
	@docker system prune -f

# Deployment commands
deploy-dev:
	@echo "🚀 Deploying to development environment..."
	@make docker-up
	@echo "✅ Development deployment complete!"

deploy-prod:
	@echo "🏭 Deploying to production environment..."
	@chmod +x scripts/build.sh
	@./scripts/build.sh
	@docker-compose -f docker-compose.prod.yml up -d
	@echo "✅ Production deployment complete!"

zip-release:
	@echo "📦 Creating release package..."
	@chmod +x scripts/zip_release.sh
	@./scripts/zip_release.sh

# Maintenance commands
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf node_modules
	@cd packages/shared && rm -rf node_modules dist
	@cd apps/web && rm -rf node_modules .next dist
	@cd apps/mobile && rm -rf node_modules
	@cd services/api && rm -rf node_modules dist
	@cd services/ai && rm -rf __pycache__ venv
	@rm -rf coverage test-results logs
	@echo "✅ Clean complete!"

reset:
	@echo "🔄 Resetting development environment..."
	@make docker-clean
	@make clean
	@make setup
	@echo "✅ Reset complete!"

update:
	@echo "🔄 Updating dependencies..."
	@npm update
	@cd packages/shared && npm update
	@cd apps/web && npm update
	@cd apps/mobile && npm update
	@cd services/api && npm update
	@cd services/ai && pip install --upgrade -r requirements.txt
	@echo "✅ Update complete!"

# Utility commands
status:
	@echo "📊 Service Status:"
	@docker-compose ps

logs:
	@echo "📊 Service Logs:"
	@docker-compose logs -f

health:
	@echo "🏥 Health Check:"
	@curl -s http://localhost:3001/health || echo "API service not responding"
	@curl -s http://localhost:8000/health || echo "AI service not responding"
	@curl -s http://localhost:3000 || echo "Web frontend not responding"

# Production commands
prod-up:
	@echo "🏭 Starting production environment..."
	@docker-compose -f docker-compose.prod.yml up -d

prod-down:
	@echo "🛑 Stopping production environment..."
	@docker-compose -f docker-compose.prod.yml down

prod-logs:
	@echo "📊 Production logs..."
	@docker-compose -f docker-compose.prod.yml logs -f

# Monitoring commands
monitor:
	@echo "📊 Opening monitoring dashboards..."
	@echo "Grafana: http://localhost:3002 (admin/admin123)"
	@echo "Prometheus: http://localhost:9090"
	@echo "MinIO Console: http://localhost:9001 (minioadmin/minioadmin123)"

# Database commands
db-backup:
	@echo "💾 Creating database backup..."
	@docker exec vision-mongodb mongodump --out /data/backup
	@docker cp vision-mongodb:/data/backup ./backups/$(shell date +%Y%m%d_%H%M%S)
	@echo "✅ Backup complete!"

db-restore:
	@echo "📥 Restoring database..."
	@docker exec vision-mongodb mongorestore /data/backup
	@echo "✅ Restore complete!"

# AI Service commands
ai-models:
	@echo "🤖 Managing AI models..."
	@cd services/ai && python -m scripts.model_manager

# Quick commands for common workflows
quick-start: install docker-up dev

quick-test: lint type-check test-unit

quick-build: build docker-build

quick-deploy: build docker-build docker-up

# Help for specific areas
help-dev:
	@echo "Development Commands:"
	@echo "  make dev           - Start development environment"
	@echo "  make install       - Install dependencies"
	@echo "  make setup         - Initial setup"
	@echo "  make docker-up     - Start Docker services"
	@echo "  make docker-logs   - View logs"

help-test:
	@echo "Testing Commands:"
	@echo "  make test          - Run all tests"
	@echo "  make test-unit     - Unit tests only"
	@echo "  make test-integration - Integration tests"
	@echo "  make test-e2e      - End-to-end tests"
	@echo "  make coverage      - Generate coverage report"

help-docker:
	@echo "Docker Commands:"
	@echo "  make docker-up     - Start services"
	@echo "  make docker-down   - Stop services"
	@echo "  make docker-build  - Build images"
	@echo "  make docker-logs   - View logs"
	@echo "  make docker-clean  - Clean resources"

help-deploy:
	@echo "Deployment Commands:"
	@echo "  make deploy-dev    - Deploy to development"
	@echo "  make deploy-prod   - Deploy to production"
	@echo "  make zip-release   - Create release package"
	@echo "  make prod-up       - Start production"
	@echo "  make prod-down     - Stop production"
