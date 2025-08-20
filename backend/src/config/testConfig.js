/**
 * Test Configuration Service
 * Handles test database connections and test-specific settings
 */

class TestConfig {
  constructor() {
    this.isTestMode = process.env.NODE_ENV === 'test';
    this.testMongoUri = process.env.TEST_MONGODB_URI;
    this.testRedisUrl = process.env.TEST_REDIS_URL;
    this.testTimeout = parseInt(process.env.TEST_TIMEOUT) || 10000;
    this.e2eTimeout = parseInt(process.env.E2E_TIMEOUT) || 30000;
  }

  /**
   * Get test database URI
   */
  getTestMongoUri() {
    if (this.isTestMode && this.testMongoUri) {
      return this.testMongoUri;
    }
    // Fallback to main database with test suffix
    const mainUri = process.env.MONGODB_URI;
    if (mainUri) {
      return mainUri.replace(/\?/, '-test?');
    }
    return 'mongodb://admin:password123@localhost:27017/vision_platform_test?authSource=admin';
  }

  /**
   * Get test Redis URL
   */
  getTestRedisUrl() {
    if (this.isTestMode && this.testRedisUrl) {
      return this.testRedisUrl;
    }
    // Fallback to main Redis with test database
    const mainRedis = process.env.REDIS_URL;
    if (mainRedis) {
      return mainRedis.replace(/(redis:\/\/[^\/]+)\/?/, '$1/1');
    }
    return 'redis://localhost:6379/1';
  }

  /**
   * Get test timeout
   */
  getTestTimeout() {
    return this.testTimeout;
  }

  /**
   * Get E2E timeout
   */
  getE2eTimeout() {
    return this.e2eTimeout;
  }

  /**
   * Check if running in test mode
   */
  isTestEnvironment() {
    return this.isTestMode;
  }

  /**
   * Get test configuration summary
   */
  getTestConfig() {
    return {
      isTestMode: this.isTestMode,
      testMongoUri: this.getTestMongoUri(),
      testRedisUrl: this.getTestRedisUrl(),
      testTimeout: this.testTimeout,
      e2eTimeout: this.e2eTimeout
    };
  }
}

module.exports = new TestConfig();

