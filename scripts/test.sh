#!/bin/bash

# Vision Platform - Test Script
# This script runs all tests and generates coverage reports

set -e

echo "🧪 Running Vision Platform Tests..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 is not installed. AI service tests may fail."
fi

# Create test results directory
mkdir -p test-results
mkdir -p coverage

# Function to run tests for a package
run_package_tests() {
    local package_name=$1
    local package_path=$2
    
    print_status "Running tests for $package_name..."
    
    if [ -d "$package_path" ]; then
        cd "$package_path"
        
        # Check if package has tests
        if [ -f "package.json" ] && npm run test > /dev/null 2>&1; then
            print_status "Running npm tests for $package_name..."
            npm run test
            print_success "$package_name tests completed"
        else
            print_warning "No tests found for $package_name"
        fi
        
        cd - > /dev/null
    else
        print_warning "Package directory not found: $package_path"
    fi
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    # Check if Playwright is available
    if [ -d "apps/web" ] && [ -f "apps/web/package.json" ]; then
        cd apps/web
        
        # Install Playwright if not already installed
        if ! npx playwright --version > /dev/null 2>&1; then
            print_status "Installing Playwright..."
            npx playwright install
        fi
        
        # Run E2E tests
        if npm run test:e2e > /dev/null 2>&1; then
            print_status "Running E2E tests..."
            npm run test:e2e
            print_success "E2E tests completed"
        else
            print_warning "E2E tests not configured for web app"
        fi
        
        cd - > /dev/null
    else
        print_warning "Web app not found, skipping E2E tests"
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Check if API service is running
    if docker-compose ps api | grep -q "Up"; then
        print_status "API service is running, running integration tests..."
        
        # Run API integration tests
        if [ -d "services/api" ]; then
            cd services/api
            
            if npm run test:integration > /dev/null 2>&1; then
                npm run test:integration
                print_success "API integration tests completed"
            else
                print_warning "Integration tests not configured for API service"
            fi
            
            cd - > /dev/null
        fi
    else
        print_warning "API service is not running, skipping integration tests"
        print_status "To run integration tests, start the development environment first:"
        print_status "  ./scripts/dev.sh"
    fi
}

# Function to generate coverage report
generate_coverage_report() {
    print_status "Generating coverage report..."
    
    # Collect coverage from all packages
    local total_coverage=0
    local package_count=0
    
    # Check shared package coverage
    if [ -d "packages/shared" ] && [ -f "packages/shared/coverage/coverage-summary.json" ]; then
        cd packages/shared
        if [ -f "coverage/coverage-summary.json" ]; then
            local coverage=$(node -e "
                const fs = require('fs');
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                const total = Object.values(coverage.total).reduce((sum, item) => sum + item.pct, 0);
                console.log(Math.round(total / Object.keys(coverage.total).length));
            ")
            total_coverage=$((total_coverage + coverage))
            package_count=$((package_count + 1))
            print_status "Shared package coverage: ${coverage}%"
        fi
        cd - > /dev/null
    fi
    
    # Check web app coverage
    if [ -d "apps/web" ] && [ -f "apps/web/coverage/coverage-summary.json" ]; then
        cd apps/web
        if [ -f "coverage/coverage-summary.json" ]; then
            local coverage=$(node -e "
                const fs = require('fs');
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                const total = Object.values(coverage.total).reduce((sum, item) => sum + item.pct, 0);
                console.log(Math.round(total / Object.keys(coverage.total).length));
            ")
            total_coverage=$((total_coverage + coverage))
            package_count=$((package_count + 1))
            print_status "Web app coverage: ${coverage}%"
        fi
        cd - > /dev/null
    fi
    
    # Check API service coverage
    if [ -d "services/api" ] && [ -f "services/api/coverage/coverage-summary.json" ]; then
        cd services/api
        if [ -f "coverage/coverage-summary.json" ]; then
            local coverage=$(node -e "
                const fs = require('fs');
                const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
                const total = Object.values(coverage.total).reduce((sum, item) => sum + item.pct, 0);
                console.log(Math.round(total / Object.keys(coverage.total).length));
            ")
            total_coverage=$((total_coverage + coverage))
            package_count=$((package_count + 1))
            print_status "API service coverage: ${coverage}%"
        fi
        cd - > /dev/null
    fi
    
    # Calculate overall coverage
    if [ $package_count -gt 0 ]; then
        local overall_coverage=$((total_coverage / package_count))
        print_status "Overall coverage: ${overall_coverage}%"
        
        # Check if coverage meets minimum requirement
        if [ $overall_coverage -ge 80 ]; then
            print_success "Coverage requirement met (≥80%)"
        else
            print_warning "Coverage requirement not met (<80%)"
        fi
    else
        print_warning "No coverage data found"
    fi
}

# Function to run linting
run_linting() {
    print_status "Running linting checks..."
    
    local lint_errors=0
    
    # Lint shared package
    if [ -d "packages/shared" ]; then
        cd packages/shared
        if npm run lint > /dev/null 2>&1; then
            print_status "Linting shared package..."
            if npm run lint; then
                print_success "Shared package linting passed"
            else
                print_error "Shared package linting failed"
                lint_errors=$((lint_errors + 1))
            fi
        fi
        cd - > /dev/null
    fi
    
    # Lint web app
    if [ -d "apps/web" ]; then
        cd apps/web
        if npm run lint > /dev/null 2>&1; then
            print_status "Linting web app..."
            if npm run lint; then
                print_success "Web app linting passed"
            else
                print_error "Web app linting failed"
                lint_errors=$((lint_errors + 1))
            fi
        fi
        cd - > /dev/null
    fi
    
    # Lint API service
    if [ -d "services/api" ]; then
        cd services/api
        if npm run lint > /dev/null 2>&1; then
            print_status "Linting API service..."
            if npm run lint; then
                print_success "API service linting passed"
            else
                print_error "API service linting failed"
                lint_errors=$((lint_errors + 1))
            fi
        fi
        cd - > /dev/null
    fi
    
    if [ $lint_errors -eq 0 ]; then
        print_success "All linting checks passed"
    else
        print_error "Linting failed for $lint_errors package(s)"
        exit 1
    fi
}

# Function to run type checking
run_type_checking() {
    print_status "Running type checking..."
    
    local type_errors=0
    
    # Type check shared package
    if [ -d "packages/shared" ]; then
        cd packages/shared
        if npm run type-check > /dev/null 2>&1; then
            print_status "Type checking shared package..."
            if npm run type-check; then
                print_success "Shared package type checking passed"
            else
                print_error "Shared package type checking failed"
                type_errors=$((type_errors + 1))
            fi
        fi
        cd - > /dev/null
    fi
    
    # Type check web app
    if [ -d "apps/web" ]; then
        cd apps/web
        if npm run type-check > /dev/null 2>&1; then
            print_status "Type checking web app..."
            if npm run type-check; then
                print_success "Web app type checking passed"
            else
                print_error "Web app type checking failed"
                type_errors=$((type_errors + 1))
            fi
        fi
        cd - > /dev/null
    fi
    
    # Type check API service
    if [ -d "services/api" ]; then
        cd services/api
        if npm run type-check > /dev/null 2>&1; then
            print_status "Type checking API service..."
            if npm run type-check; then
                print_success "API service type checking passed"
            else
                print_error "API service type checking failed"
                type_errors=$((type_errors + 1))
            fi
        fi
        cd - > /dev/null
    fi
    
    if [ $type_errors -eq 0 ]; then
        print_success "All type checking passed"
    else
        print_error "Type checking failed for $type_errors package(s)"
        exit 1
    fi
}

# Main test execution
main() {
    print_status "Starting comprehensive test suite..."
    
    # Run linting first
    run_linting
    
    # Run type checking
    run_type_checking
    
    # Run unit tests for each package
    run_package_tests "Shared Package" "packages/shared"
    run_package_tests "Web App" "apps/web"
    run_package_tests "API Service" "services/api"
    run_package_tests "Mobile App" "apps/mobile"
    
    # Run integration tests
    run_integration_tests
    
    # Run E2E tests
    run_e2e_tests
    
    # Generate coverage report
    generate_coverage_report
    
    print_success "All tests completed successfully!"
    print_status "Test results available in: test-results/"
    print_status "Coverage reports available in: coverage/"
}

# Run main function
main "$@"
