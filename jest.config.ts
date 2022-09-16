module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  maxWorkers: 1,

  // restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules'],
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  globalTeardown: './test/utils/test-teardown-globals.ts',
  testTimeout: 30000,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleDirectories: ['node_modules', 'src'],
};
