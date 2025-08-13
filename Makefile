# Vision Platform Makefile
# Common development and deployment tasks

.PHONY: help install dev build test lint format clean docker-up docker-down docker-logs seed release

# Default target
help:
	@echo "Vision Platform - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  install     Install all dependencies"
	@echo "  dev         Start development environment"
	@echo "  build       Build all packages for production"
	@echo "  test        Run all tests"
	@echo "  test:unit   Run unit tests only"
	@echo "  test:integration Run integration tests only"
	@echo "  test:e2e    Run end-to-end tests only"
	@echo "  test:coverage Run tests with coverage report"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint        Run linting checks"
	@echo "  lint:fix    Fix linting issues automatically"
	@echo "  format      Format code with Prettier"
	@echo "  format:check Check code formatting"
	@echo "  type-check  Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up   Start all Docker services"
	@echo "  docker-down Stop all Docker services"
	@echo "  docker-logs View Docker service logs"
	@echo "  docker-build Build all Docker images"
	@echo ""
	@echo "Database:"
	@echo "  seed        Seed database with demo data"
	@echo "  db:reset    Reset database (WARNING: destructive)"
	@echo ""
	@echo "Deployment:"
	@echo "  release     Create production release package"
	@echo "  deploy      Deploy to production"
	@echo "  deploy:staging Deploy to staging"
	@echo ""
	@echo "Utilities:"
	@echo "  clean       Clean build artifacts and dependencies"
	@echo "  status      Show service status"
	@echo "  logs        View application logs"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🐍 Installing Python dependencies..."
	cd services/ai && pip install -r requirements.txt
	@echo "✅ Dependencies installed successfully"

# Start development environment
dev:
	@echo "🚀 Starting development environment..."
	./scripts/dev.sh

# Build all packages
build:
	@echo "🔨 Building all packages..."
	./scripts/build.sh

# Run all tests
test:
	@echo "🧪 Running all tests..."
	./scripts/test.sh

# Run unit tests only
test:unit:
	@echo "🧪 Running unit tests..."
	npm run test:unit

# Run integration tests only
test:integration:
	@echo "🧪 Running integration tests..."
	npm run test:integration

# Run end-to-end tests only
test:e2e:
	@echo "🧪 Running end-to-end tests..."
	npm run test:e2e

# Run tests with coverage
test:coverage:
	@echo "🧪 Running tests with coverage..."
	./scripts/test.sh --coverage

# Run linting
lint:
	@echo "🔍 Running linting checks..."
	npm run lint

# Fix linting issues
lint:fix:
	@echo "🔧 Fixing linting issues..."
	npm run lint:fix

# Format code
format:
	@echo "✨ Formatting code..."
	npm run format

# Check code formatting
format:check:
	@echo "🔍 Checking code formatting..."
	npm run format:check

# Type checking
type-check:
	@echo "🔍 Running TypeScript type checking..."
	npm run type-check

# Start Docker services
docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

# Stop Docker services
docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down

# View Docker logs
docker-logs:
	@echo "📋 Viewing Docker logs..."
	docker-compose logs -f

# Build Docker images
docker-build:
	@echo "🔨 Building Docker images..."
	docker-compose build

# Seed database
seed:
	@echo "🌱 Seeding database with demo data..."
	node scripts/seed.js

# Reset database (WARNING: destructive)
db:reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@read -p "Are you sure? Type 'yes' to continue: " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		echo "🗑️  Resetting database..."; \
		docker-compose exec mongodb mongosh vision --eval "db.dropDatabase()"; \
		echo "✅ Database reset complete"; \
	else \
		echo "❌ Database reset cancelled"; \
	fi

# Create release package
release:
	@echo "📦 Creating production release package..."
	./scripts/zip_release.sh

# Deploy to production
deploy:
	@echo "🚀 Deploying to production..."
	./scripts/deploy.sh

# Deploy to staging
deploy:staging:
	@echo "🚀 Deploying to staging..."
	./scripts/deploy.sh --staging

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf */node_modules
	rm -rf */dist
	rm -rf */build
	rm -rf */coverage
	rm -rf */uploads
	rm -rf release-*
	rm -f vision-monorepo-*.zip
	@echo "✅ Cleanup complete"

# Show service status
status:
	@echo "📊 Service Status:"
	@echo "Docker services:"
	docker-compose ps
	@echo ""
	@echo "Port usage:"
	netstat -tulpn 2>/dev/null | grep -E ':(3000|3001|8000|27017|6379|9000)' || echo "No services running on expected ports"

# View application logs
logs:
	@echo "📋 Application logs:"
	@echo "API Service:"
	docker-compose logs -f api --tail=50
	@echo ""
	@echo "AI Service:"
	docker-compose logs -f ai-service --tail=50
	@echo ""
	@echo "Web App:"
	docker-compose logs -f web --tail=50

# Health check
health:
	@echo "🏥 Health Check:"
	@echo "API Health:"
	curl -f http://localhost:3001/health || echo "❌ API service not responding"
	@echo ""
	@echo "AI Service Health:"
	curl -f http://localhost:8000/health || echo "❌ AI service not responding"
	@echo ""
	@echo "Web App:"
	curl -f http://localhost:3000 || echo "❌ Web app not responding"

# Quick setup for new developers
setup: install docker-up seed
	@echo "🎉 Development environment setup complete!"
	@echo "Access your applications at:"
	@echo "  Web App: http://localhost:3000"
	@echo "  API: http://localhost:3001"
	@echo "  API Docs: http://localhost:3001/api-docs"
	@echo "  AI Service: http://localhost:8000"

# Production deployment checklist
deploy:checklist:
	@echo "📋 Production Deployment Checklist:"
	@echo "1. ✅ All tests passing"
	@echo "2. ✅ Security scan completed"
	@echo "3. ✅ Docker images built and tested"
	@echo "4. ✅ Environment variables configured"
	@echo "5. ✅ Database migrations applied"
	@echo "6. ✅ SSL certificates installed"
	@echo "7. ✅ Monitoring configured"
	@echo "8. ✅ Backup strategy in place"
	@echo "9. ✅ Rollback plan ready"
	@echo "10. ✅ Team notified of deployment"

# Development shortcuts
dev:short: docker-up
	@echo "🚀 Starting development services..."
	npm run dev

# Stop development
dev:stop: docker-down
	@echo "🛑 Development environment stopped"

# Restart development
dev:restart: dev:stop dev:short
	@echo "🔄 Development environment restarted"
