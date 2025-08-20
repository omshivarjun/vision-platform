/**
 * Test Environment Setup
 * Configures environment variables for testing
 */

// Load environment variables
require('dotenv').config();

// Set test environment
process.env.NODE_ENV = 'test';

// Test database configuration
if (!process.env.TEST_MONGODB_URI) {
  process.env.TEST_MONGODB_URI = 'mongodb://admin:password123@localhost:27017/vision_platform_test?authSource=admin';
}

if (!process.env.TEST_REDIS_URL) {
  process.env.TEST_REDIS_URL = 'redis://localhost:6379/1';
}

// Test timeouts
if (!process.env.TEST_TIMEOUT) {
  process.env.TEST_TIMEOUT = '10000';
}

if (!process.env.E2E_TIMEOUT) {
  process.env.E2E_TIMEOUT = '30000';
}

// Disable logging during tests
process.env.LOG_LEVEL = 'error';

// Use test storage
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_ACCESS_KEY = 'minioadmin';
process.env.S3_SECRET_KEY = 'minioadmin123';
process.env.S3_BUCKET = 'multimodal-files-test';

// Disable external services during tests
process.env.ENABLE_EXTERNAL_SERVICES = 'false';

console.log('🧪 Test environment configured');
console.log(`   Test MongoDB: ${process.env.TEST_MONGODB_URI}`);
console.log(`   Test Redis: ${process.env.TEST_REDIS_URL}`);
console.log(`   Test Timeout: ${process.env.TEST_TIMEOUT}ms`);
console.log(`   E2E Timeout: ${process.env.E2E_TIMEOUT}ms`);

