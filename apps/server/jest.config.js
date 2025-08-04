/** @type {import('jest').Config} */
export default {
  displayName: 'client',
  testEnvironment: 'jsdom', // Use jsdom for browser environment
  transform: {
    // Transform TypeScript files
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      isolatedModules: true
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Handle CSS imports (if you use CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/test-utils/fileMock.js',
    // Handle module path aliases if you have any
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)', 
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  rootDir: '.',
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true,
  setupFilesAfterEnv: ['./test-utils/setup.js'],
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules', 'apps/client', 'src']
};