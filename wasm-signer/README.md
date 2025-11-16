# WASM Stark Crypto Signer

This is a WebAssembly (WASM) module that provides fast cryptographic operations for the Extended TypeScript SDK.

## Building

Use the main SDK build script:

```bash
# From typescript-sdk root
npm run build:signer
```

This builds both Node.js and browser targets and copies files to `wasm/` folder.

### Manual Build

If you need to build manually:

```bash
# Build for Node.js
wasm-pack build --target nodejs --out-dir pkg

# Build for browser
wasm-pack build --target bundler --out-dir pkg-web
```

## Implementation

The WASM signer uses `starknet-crypto` crate for cryptographic operations. It's production-ready and tested for compatibility with Extended Exchange API.

**Note**: Users don't need to build this - the SDK ships with pre-built WASM files.







