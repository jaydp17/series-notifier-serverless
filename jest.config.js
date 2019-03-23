module.exports = {
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
