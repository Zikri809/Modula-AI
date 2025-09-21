import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

const config: Config = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',

    // For database testing, use node environment
    testEnvironment: 'jest-environment-node',

    // Setup file for database connections, etc.
    //setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

    // Test file patterns
    testMatch: [
        '**/__tests__/**/*.(ts|tsx|js)',
        '**/*.(test|spec).(ts|tsx|js)',
    ],

    // Module name mapping for Next.js aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^~/(.*)$': '<rootDir>/$1',
    },
};

// Export the Jest config created by next/jest
export default createJestConfig(config);