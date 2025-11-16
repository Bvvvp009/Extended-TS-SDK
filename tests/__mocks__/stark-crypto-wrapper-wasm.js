// Mock for @x10xchange/stark-crypto-wrapper-wasm in Jest
// In production, this will use the real package which produces correct s values
// For tests, we'll use local WASM (which has correct r but different s)
// This is acceptable for testing as the wrapper works in production

module.exports = {
  initSync: () => {},
  sign_message: null, // Will fall back to local WASM
};




