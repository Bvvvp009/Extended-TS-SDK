module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@x10xchange/stark-crypto-wrapper-wasm$': '<rootDir>/tests/__mocks__/stark-crypto-wrapper-wasm.js',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // Mock ES modules that Jest can't handle
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};

