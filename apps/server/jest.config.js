/** @type {import('jest').Config} */
export default {
  displayName: 'server',
  testEnvironment: 'node',
  transform: {}, // Empty transform means no transformations (using Node.js native ESM)
  moduleFileExtensions: ['js', 'json', 'node'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  rootDir: '.',
  testPathIgnorePatterns: ['/node_modules/'],
  // Add these new settings:
  verbose: true, // More detailed output for debugging
  setupFilesAfterEnv: ['./test-utils/setup.js'] // Optional: for global setup
};