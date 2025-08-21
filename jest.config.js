module.exports = {
  preset: 'ts-jest',
  testTimeout: 30000,
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  clearMocks: true,
  restoreMocks: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx,js,jsx}',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.expo/',
    '/tests/e2e/',
    '/tests/unit/ocr.test.ts',
    '/tests/unit/translation.test.ts',
    '/tests/unit/accessibility.test.ts',
    '/apps/web/src/__tests__/performance.test.ts',
    '/apps/web/src/__tests__/toast.test.ts'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.expo/',
    '/__tests__/',
    '/test/',
    '/tests/',
    '/*.test.{ts,tsx,js,jsx}',
    '/*.spec.{ts,tsx,js,jsx}',
    '/types/',
    '/interfaces/',
    '/mocks/',
    '/fixtures/'
  ],
  projects: [
    {
      displayName: 'frontend',
      testMatch: [
        '<rootDir>/apps/web/src/**/*.test.{ts,tsx,js,jsx}',
        '<rootDir>/apps/web/src/__tests__/**/*.{ts,tsx,js,jsx}'
      ],
      testEnvironment: 'jsdom',
    },
    {
      displayName: 'backend',
      testMatch: [
        '<rootDir>/backend/**/*.test.{ts,tsx,js,jsx}',
        '<rootDir>/backend/__tests__/**/*.{ts,tsx,js,jsx}',
        '<rootDir>/services/api/**/*.test.{ts,tsx,js,jsx}',
        '<rootDir>/services/api/__tests__/**/*.{ts,tsx,js,jsx}'
      ],
      testEnvironment: 'node',
    }
  ]
};
