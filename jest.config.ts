import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

const customJestConfig: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // Make sure this file exists
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
  },
};

// Export the Jest config using createJestConfig
export default createJestConfig(customJestConfig);