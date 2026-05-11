export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/generated/**'],
  coverageDirectory: 'coverage',
  setupFilesAfterFramework: [],
};
