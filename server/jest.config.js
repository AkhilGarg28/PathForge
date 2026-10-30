export default {
  testEnvironment: 'node',
  transform: {},
  testTimeout: 300000,
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!eslint.config.js',
    '!index.js',
    '!server.js'
  ]
};
