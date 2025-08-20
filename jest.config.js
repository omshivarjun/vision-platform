module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test timeouts
  testTimeout: process.env.TEST_TIMEOUT || 10000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Environment variables for tests
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  
  // Project roots for monorepo
  projects: [
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/packages/shared/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'packages/shared/src/**/*.{ts,tsx}',
        '!packages/shared/src/**/*.d.ts',
        '!packages/shared/src/**/*.test.{ts,tsx}'
      ],
      coverageDirectory: 'packages/shared/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/apps/web/jest.setup.ts'],
      testEnvironment: 'jsdom',
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
        '^@vision-platform/shared$': '<rootDir>/packages/shared/src'
      },
      collectCoverageFrom: [
        'apps/web/src/**/*.{ts,tsx}',
        '!apps/web/src/**/*.d.ts',
        '!apps/web/src/**/*.test.{ts,tsx}',
        '!apps/web/src/**/*.stories.{ts,tsx}'
      ],
      coverageDirectory: 'apps/web/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'api',
      testMatch: ['<rootDir>/services/api/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/services/api/jest.setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/services/api/src/$1',
        '^@vision-platform/shared$': '<rootDir>/packages/shared/src'
      },
      collectCoverageFrom: [
        'services/api/src/**/*.ts',
        '!services/api/src/**/*.d.ts',
        '!services/api/src/**/*.test.ts'
      ],
      coverageDirectory: 'services/api/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'mobile',
      testMatch: ['<rootDir>/apps/mobile/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/apps/mobile/jest.setup.ts'],
      testEnvironment: 'jsdom',
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
        '^@vision-platform/shared$': '<rootDir>/packages/shared/src'
      },
      collectCoverageFrom: [
        'apps/mobile/src/**/*.{ts,tsx}',
        '!apps/mobile/src/**/*.d.ts',
        '!apps/mobile/src/**/*.test.{ts,tsx}'
      ],
      coverageDirectory: 'apps/mobile/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'ai',
      testMatch: ['<rootDir>/services/ai/**/*.test.py'],
      testRunner: 'jest-python',
      collectCoverageFrom: [
        'services/ai/app/**/*.py',
        '!services/ai/app/**/*.test.py',
        '!services/ai/app/**/__pycache__/**'
      ],
      coverageDirectory: 'services/ai/coverage',
      coverageReporters: ['text', 'xml', 'html']
    }
  ],

  // Global test configuration
  verbose: true,
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds for overall project
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },

  // Test timeout
  testTimeout: 30000,

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapping
  moduleNameMapping: {
    '^@vision-platform/shared$': '<rootDir>/packages/shared/src',
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Transform configuration
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.jsx?$': 'babel-jest'
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.{ts,tsx,js,jsx}',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}'
  ],

  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/.expo/'
  ],

  // Coverage ignore patterns
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

  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',

  // Environment variables
  setupFiles: ['<rootDir>/jest.env.js'],

  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,

  // Maximum workers
  maxWorkers: '50%',

  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',

  // Test results processor
  testResultsProcessor: 'jest-sonar-reporter',

  // Coverage collection
  collectCoverageFrom: [
    'packages/**/src/**/*.{ts,tsx}',
    'apps/**/src/**/*.{ts,tsx}',
    'services/**/src/**/*.{ts,tsx}',
    'services/**/app/**/*.py',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/__tests__/**',
    '!**/test/**',
    '!**/tests/**',
    '!**/mocks/**',
    '!**/fixtures/**',
    '!**/types/**',
    '!**/interfaces/**'
  ],

  // Coverage thresholds per package
  projects: [
    {
      displayName: 'shared',
      testMatch: ['<rootDir>/packages/shared/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      collectCoverageFrom: [
        'packages/shared/src/**/*.{ts,tsx}',
        '!packages/shared/src/**/*.d.ts',
        '!packages/shared/src/**/*.test.{ts,tsx}'
      ],
      coverageDirectory: 'packages/shared/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/apps/web/jest.setup.ts'],
      testEnvironment: 'jsdom',
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
        '^@vision-platform/shared$': '<rootDir>/packages/shared/src'
      },
      collectCoverageFrom: [
        'apps/web/src/**/*.{ts,tsx}',
        '!apps/web/src/**/*.d.ts',
        '!apps/web/src/**/*.test.{ts,tsx}',
        '!apps/web/src/**/*.stories.{ts,tsx}'
      ],
      coverageDirectory: 'apps/web/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'api',
      testMatch: ['<rootDir>/services/api/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/services/api/jest.setup.ts'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/services/api/src/$1',
        '^@vision-platform/shared$': '<rootDir>/packages/shared/src'
      },
      collectCoverageFrom: [
        'services/api/src/**/*.ts',
        '!services/api/src/**/*.d.ts',
        '!services/api/src/**/*.test.ts'
      ],
      coverageDirectory: 'services/api/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    {
      displayName: 'mobile',
      testMatch: ['<rootDir>/apps/mobile/**/*.test.{ts,tsx}'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest'
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
      setupFilesAfterEnv: ['<rootDir>/apps/mobile/jest.setup.ts'],
      testEnvironment: 'jsdom',
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/mobile/src/$1',
        '^@vision-platform/shared$': '<rootDir>/packages/shared/src'
      },
      collectCoverageFrom: [
        'apps/mobile/src/**/*.{ts,tsx}',
        '!apps/mobile/src/**/*.d.ts',
        '!apps/mobile/src/**/*.test.{ts,tsx}'
      ],
      coverageDirectory: 'apps/mobile/coverage',
      coverageReporters: ['text', 'lcov', 'html'],
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  ],

  // Integration test configuration
  testMatch: [
    '**/__tests__/**/*.{ts,tsx,js,jsx}',
    '**/*.test.{ts,tsx,js,jsx}',
    '**/*.spec.{ts,tsx,js,jsx}',
    '**/*.integration.test.{ts,tsx,js,jsx}',
    '**/*.e2e.test.{ts,tsx,js,jsx}'
  ],

  // Performance testing
  testTimeout: 60000, // 1 minute for performance tests

  // Parallel execution
  maxWorkers: '50%',

  // Test retries for flaky tests
  retryTimes: 2,

  // Test isolation
  isolateModules: true,

  // Preset for TypeScript
  preset: 'ts-jest',

  // Global test environment
  testEnvironment: 'node',

  // Extensions
  extensionsToTreatAsEsm: ['.ts', '.tsx'],

  // Module resolution
  moduleResolution: 'node',

  // Allow synthetic default imports
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,

  // Strict mode
  strict: true,

  // Skip type checking in tests for performance
  skipLibCheck: true,

  // Force consistent casing in file names
  forceConsistentCasingInFileNames: true,

  // Resolve JSON modules
  resolveJsonModule: true,

  // Allow JS files
  allowJs: true,

  // Check JS files
  checkJs: false,

  // Include declarations
  declaration: true,
  declarationMap: true,

  // Source maps
  sourceMap: true,
  inlineSourceMap: false,

  // Remove comments
  removeComments: false,

  // No emit on error
  noEmitOnError: true,

  // Import helpers
  importHelpers: true,

  // Experimental decorators
  experimentalDecorators: true,
  emitDecoratorMetadata: true,

  // JSX support
  jsx: 'react-jsx',

  // Base URL for module resolution
  baseUrl: '.',
  paths: {
    '@/*': ['src/*'],
    '@vision-platform/shared': ['packages/shared/src']
  }
}
