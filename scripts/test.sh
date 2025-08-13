#!/bin/bash

# =============================================================================
# MULTIMODAL PLATFORM - TESTING SCRIPT
# =============================================================================
# This script runs all tests (unit, integration, E2E) with coverage reporting
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
TEST_RESULTS_DIR="./test-results"
COVERAGE_DIR="./coverage"
TEST_TIMEOUT=30000
E2E_TIMEOUT=60000

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking test prerequisites..."
    
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 >/dev/null 2>&1; then
        print_error "Python 3 is not installed. Please install Python 3 first."
        exit 1
    fi
    
    # Check Docker (for integration tests)
    if ! command -v docker >/dev/null 2>&1; then
        print_warning "Docker is not installed. Integration tests may fail."
    fi
    
    print_success "Prerequisites check completed"
}

# Function to create test directories
create_test_directories() {
    print_status "Creating test directories..."
    
    mkdir -p "$TEST_RESULTS_DIR"
    mkdir -p "$COVERAGE_DIR"
    mkdir -p "$TEST_RESULTS_DIR/unit"
    mkdir -p "$TEST_RESULTS_DIR/integration"
    mkdir -p "$TEST_RESULTS_DIR/e2e"
    
    print_success "Test directories created"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm ci
    
    # Install shared package dependencies
    cd packages/shared
    npm ci
    cd ../..
    
    # Install API service dependencies
    cd services/api
    npm ci
    cd ../..
    
    # Install web frontend dependencies
    cd apps/web
    npm ci
    cd ../..
    
    # Install mobile app dependencies
    cd apps/mobile
    npm ci
    cd ../..
    
    print_success "Dependencies installed"
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    local exit_code=0
    
    # Test shared package
    print_status "Testing shared package..."
    cd packages/shared
    if npm run test -- --coverage --reporter=verbose > "$TEST_RESULTS_DIR/unit/shared.log" 2>&1; then
        print_success "Shared package tests passed"
        cp -r coverage/* "$COVERAGE_DIR/shared/"
    else
        print_error "Shared package tests failed"
        exit_code=1
    fi
    cd ../..
    
    # Test API service
    print_status "Testing API service..."
    cd services/api
    if npm run test -- --coverage --reporter=verbose > "$TEST_RESULTS_DIR/unit/api.log" 2>&1; then
        print_success "API service tests passed"
        cp -r coverage/* "$COVERAGE_DIR/api/"
    else
        print_error "API service tests failed"
        exit_code=1
    fi
    cd ../..
    
    # Test web frontend
    print_status "Testing web frontend..."
    cd apps/web
    if npm run test -- --coverage --reporter=verbose > "$TEST_RESULTS_DIR/unit/web.log" 2>&1; then
        print_success "Web frontend tests passed"
        cp -r coverage/* "$COVERAGE_DIR/web/"
    else
        print_error "Web frontend tests failed"
        exit_code=1
    fi
    cd ../..
    
    # Test mobile app
    print_status "Testing mobile app..."
    cd apps/mobile
    if npm run test -- --coverage --reporter=verbose > "$TEST_RESULTS_DIR/unit/mobile.log" 2>&1; then
        print_success "Mobile app tests passed"
        cp -r coverage/* "$COVERAGE_DIR/mobile/"
    else
        print_error "Mobile app tests failed"
        exit_code=1
    fi
    cd ../..
    
    return $exit_code
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    local exit_code=0
    
    # Test API service integration
    print_status "Testing API service integration..."
    cd services/api
    if npm run test:integration -- --coverage --reporter=verbose > "$TEST_RESULTS_DIR/integration/api.log" 2>&1; then
        print_success "API service integration tests passed"
    else
        print_error "API service integration tests failed"
        exit_code=1
    fi
    cd ../..
    
    # Test AI service integration
    print_status "Testing AI service integration..."
    cd services/ai
    if python -m pytest tests/integration/ -v --cov=. --cov-report=html --cov-report=term > "$TEST_RESULTS_DIR/integration/ai.log" 2>&1; then
        print_success "AI service integration tests passed"
        cp -r htmlcov/* "$COVERAGE_DIR/ai/"
    else
        print_error "AI service integration tests failed"
        exit_code=1
    fi
    cd ../..
    
    return $exit_code
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    local exit_code=0
    
    # Test web frontend E2E
    print_status "Testing web frontend E2E..."
    cd apps/web
    if npm run test:e2e -- --reporter=verbose > "$TEST_RESULTS_DIR/e2e/web.log" 2>&1; then
        print_success "Web frontend E2E tests passed"
    else
        print_error "Web frontend E2E tests failed"
        exit_code=1
    fi
    cd ../..
    
    return $exit_code
}

# Function to run AI service tests
run_ai_tests() {
    print_status "Running AI service tests..."
    
    local exit_code=0
    
    cd services/ai
    
    # Install Python dependencies
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    pip install pytest pytest-cov pytest-mock
    
    # Run unit tests
    print_status "Running AI service unit tests..."
    if python -m pytest tests/unit/ -v --cov=. --cov-report=html --cov-report=term > "$TEST_RESULTS_DIR/unit/ai.log" 2>&1; then
        print_success "AI service unit tests passed"
        cp -r htmlcov/* "$COVERAGE_DIR/ai/"
    else
        print_error "AI service unit tests failed"
        exit_code=1
    fi
    
    deactivate
    cd ../..
    
    return $exit_code
}

# Function to generate coverage report
generate_coverage_report() {
    print_status "Generating coverage report..."
    
    # Create coverage summary
    cat > "$COVERAGE_DIR/coverage-summary.txt" << EOF
MULTIMODAL PLATFORM TEST COVERAGE SUMMARY
==========================================

Generated: $(date)

COVERAGE BY PACKAGE:
===================

Shared Package:
- Coverage: $(find "$COVERAGE_DIR/shared" -name "coverage-summary.json" -exec cat {} \; | jq -r '.total.lines.pct' 2>/dev/null || echo "N/A")%
- Files: $(find "$COVERAGE_DIR/shared" -name "*.js" | wc -l)

API Service:
- Coverage: $(find "$COVERAGE_DIR/api" -name "coverage-summary.json" -exec cat {} \; | jq -r '.total.lines.pct' 2>/dev/null || echo "N/A")%
- Files: $(find "$COVERAGE_DIR/api" -name "*.js" | wc -l)

Web Frontend:
- Coverage: $(find "$COVERAGE_DIR/web" -name "coverage-summary.json" -exec cat {} \; | jq -r '.total.lines.pct' 2>/dev/null || echo "N/A")%
- Files: $(find "$COVERAGE_DIR/web" -name "*.js" | wc -l)

Mobile App:
- Coverage: $(find "$COVERAGE_DIR/mobile" -name "coverage-summary.json" -exec cat {} \; | jq -r '.total.lines.pct' 2>/dev/null || echo "N/A")%
- Files: $(find "$COVERAGE_DIR/mobile" -name "*.js" | wc -l)

AI Service:
- Coverage: $(find "$COVERAGE_DIR/ai" -name "coverage.xml" -exec cat {} \; | grep -o 'line-rate="[^"]*"' | cut -d'"' -f2 | awk '{printf "%.1f", $1 * 100}' 2>/dev/null || echo "N/A")%
- Files: $(find "$COVERAGE_DIR/ai" -name "*.py" | wc -l)

OVERALL COVERAGE: $(calculate_overall_coverage)%

TEST RESULTS:
============

Unit Tests: $(grep -r "tests passed\|tests failed" "$TEST_RESULTS_DIR/unit" | wc -l) packages tested
Integration Tests: $(grep -r "tests passed\|tests failed" "$TEST_RESULTS_DIR/integration" | wc -l) services tested
E2E Tests: $(grep -r "tests passed\|tests failed" "$TEST_RESULTS_DIR/e2e" | wc -l) applications tested

EOF
    
    print_success "Coverage report generated: $COVERAGE_DIR/coverage-summary.txt"
}

# Function to calculate overall coverage
calculate_overall_coverage() {
    # This is a simplified calculation - in practice you'd want more sophisticated aggregation
    local total_coverage=0
    local package_count=0
    
    # Add coverage percentages and count packages
    for coverage_file in "$COVERAGE_DIR"/*/coverage-summary.json; do
        if [ -f "$coverage_file" ]; then
            local coverage=$(cat "$coverage_file" | jq -r '.total.lines.pct' 2>/dev/null || echo "0")
            total_coverage=$(echo "$total_coverage + $coverage" | bc -l 2>/dev/null || echo "$total_coverage")
            package_count=$((package_count + 1))
        fi
    done
    
    if [ $package_count -gt 0 ]; then
        echo "scale=1; $total_coverage / $package_count" | bc -l 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Function to show test results
show_test_results() {
    print_status "Test Results Summary:"
    echo ""
    
    # Unit tests
    echo "Unit Tests:"
    for log_file in "$TEST_RESULTS_DIR/unit"/*.log; do
        if [ -f "$log_file" ]; then
            local package=$(basename "$log_file" .log)
            local status=$(grep -q "tests passed\|✓" "$log_file" && echo "✅ PASSED" || echo "❌ FAILED")
            echo "  $package: $status"
        fi
    done
    echo ""
    
    # Integration tests
    echo "Integration Tests:"
    for log_file in "$TEST_RESULTS_DIR/integration"/*.log; do
        if [ -f "$log_file" ]; then
            local service=$(basename "$log_file" .log)
            local status=$(grep -q "tests passed\|✓" "$log_file" && echo "✅ PASSED" || echo "❌ FAILED")
            echo "  $service: $status"
        fi
    done
    echo ""
    
    # E2E tests
    echo "E2E Tests:"
    for log_file in "$TEST_RESULTS_DIR/e2e"/*.log; do
        if [ -f "$log_file" ]; then
            local app=$(basename "$log_file" .log)
            local status=$(grep -q "tests passed\|✓" "$log_file" && echo "✅ PASSED" || echo "❌ FAILED")
            echo "  $app: $status"
        fi
    done
    echo ""
    
    # Coverage
    echo "Coverage Reports:"
    echo "  Overall: $COVERAGE_DIR/coverage-summary.txt"
    echo "  Shared: $COVERAGE_DIR/shared/"
    echo "  API: $COVERAGE_DIR/api/"
    echo "  Web: $COVERAGE_DIR/web/"
    echo "  Mobile: $COVERAGE_DIR/mobile/"
    echo "  AI: $COVERAGE_DIR/ai/"
}

# Function to show test help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --unit-only        Run only unit tests"
    echo "  --integration-only Run only integration tests"
    echo "  --e2e-only         Run only E2E tests"
    echo "  --ai-only          Run only AI service tests"
    echo "  --skip-e2e         Skip E2E tests"
    echo "  --coverage         Generate coverage report (default)"
    echo "  --no-coverage      Skip coverage report generation"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                 # Run all tests with coverage"
    echo "  $0 --unit-only     # Run only unit tests"
    echo "  $0 --skip-e2e      # Run unit and integration tests, skip E2E"
}

# Parse command line arguments
RUN_UNIT=true
RUN_INTEGRATION=true
RUN_E2E=true
RUN_AI=true
GENERATE_COVERAGE=true

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit-only)
            RUN_UNIT=true
            RUN_INTEGRATION=false
            RUN_E2E=false
            RUN_AI=false
            shift
            ;;
        --integration-only)
            RUN_UNIT=false
            RUN_INTEGRATION=true
            RUN_E2E=false
            RUN_AI=false
            shift
            ;;
        --e2e-only)
            RUN_UNIT=false
            RUN_INTEGRATION=false
            RUN_E2E=true
            RUN_AI=false
            shift
            ;;
        --ai-only)
            RUN_UNIT=false
            RUN_INTEGRATION=false
            RUN_E2E=false
            RUN_AI=true
            shift
            ;;
        --skip-e2e)
            RUN_E2E=false
            shift
            ;;
        --coverage)
            GENERATE_COVERAGE=true
            shift
            ;;
        --no-coverage)
            GENERATE_COVERAGE=false
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

# Main test process
main() {
    print_status "Starting Multimodal Platform test suite..."
    
    # Check prerequisites
    check_prerequisites
    
    # Create test directories
    create_test_directories
    
    # Install dependencies
    install_dependencies
    
    local overall_exit_code=0
    
    # Run unit tests
    if [ "$RUN_UNIT" = true ]; then
        if run_unit_tests; then
            print_success "Unit tests completed successfully"
        else
            print_error "Unit tests failed"
            overall_exit_code=1
        fi
    fi
    
    # Run AI service tests
    if [ "$RUN_AI" = true ]; then
        if run_ai_tests; then
            print_success "AI service tests completed successfully"
        else
            print_error "AI service tests failed"
            overall_exit_code=1
        fi
    fi
    
    # Run integration tests
    if [ "$RUN_INTEGRATION" = true ]; then
        if run_integration_tests; then
            print_success "Integration tests completed successfully"
        else
            print_error "Integration tests failed"
            overall_exit_code=1
        fi
    fi
    
    # Run E2E tests
    if [ "$RUN_E2E" = true ]; then
        if run_e2e_tests; then
            print_success "E2E tests completed successfully"
        else
            print_error "E2E tests failed"
            overall_exit_code=1
        fi
    fi
    
    # Generate coverage report
    if [ "$GENERATE_COVERAGE" = true ]; then
        generate_coverage_report
    fi
    
    # Show test results
    show_test_results
    
    # Final status
    if [ $overall_exit_code -eq 0 ]; then
        print_success "All tests completed successfully!"
        print_status "Test results available in: $TEST_RESULTS_DIR"
        print_status "Coverage reports available in: $COVERAGE_DIR"
    else
        print_error "Some tests failed. Check logs in: $TEST_RESULTS_DIR"
        exit $overall_exit_code
    fi
}

# Run main function
main "$@"
