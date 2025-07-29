/** @type {import('jest').Config} */
export default {
  displayName: 'server',
  testEnvironment: 'node',
  transform: {}, // Empty transform means no transformations (using Node.js native ESM)
  moduleFileExtensions: ['js', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1' // This pattern might be causing issues
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  rootDir: '.',
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  setupFilesAfterEnv: ['./test-utils/setup.js'],
  // Add these new settings:
  modulePaths: ['<rootDir>'], // Add this to help with module resolution
  moduleDirectories: ['node_modules', 'apps/server'] // Add this to help with module resolution
};