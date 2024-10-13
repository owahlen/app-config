module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'], // Specify the pattern for your test files
    moduleFileExtensions: ['ts', 'js'],
    collectCoverage: true,                // Enable code coverage
    coverageDirectory: 'coverage',        // Directory for storing coverage reports
};
