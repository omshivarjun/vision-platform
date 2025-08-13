import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { connectDatabase, disconnectDatabase } from '../services/api/src/database/connection';
import { connectRedis, disconnectRedis } from '../services/api/src/database/redis';

// Global test setup
beforeAll(async () => {
  console.log('🚀 Setting up test environment...');
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = 'mongodb://localhost:27017/vision-test';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.JWT_SECRET = 'test-jwt-secret';
  
  try {
    // Connect to test database
    await connectDatabase();
    console.log('✅ Connected to test database');
    
    // Connect to test Redis
    await connectRedis();
    console.log('✅ Connected to test Redis');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    await disconnectRedis();
    await disconnectDatabase();
    console.log('✅ Test cleanup completed');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
  }
});

// Test isolation
beforeEach(async () => {
  // Clear test data before each test
  // This ensures test isolation
});

afterEach(async () => {
  // Clean up after each test if needed
});

// Mock external services
global.fetch = vi.fn();

// Mock console methods in tests to reduce noise
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.info = vi.fn();
  console.warn = vi.fn();
  console.error = originalConsole.error; // Keep error logging
});

afterAll(() => {
  Object.assign(console, originalConsole);
});