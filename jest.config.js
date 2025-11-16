module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  // Mock ES modules that Jest can't handle
  moduleNameMapper: {
    '^@x10xchange/stark-crypto-wrapper-wasm$': '<rootDir>/tests/__mocks__/stark-crypto-wrapper-wasm.js',
  },
};

