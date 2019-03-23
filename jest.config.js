module.exports = {
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  globalSetup: '<rootDir>/test/test.setup.js',

  collectCoverageFrom: ['src/**/*.ts'],

  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
      isolatedModules: true,
    },
  },
};
