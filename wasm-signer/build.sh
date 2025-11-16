#!/bin/bash
# Build script for WASM signer

set -e

echo "Building WASM signer for Node.js..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack is not installed"
    echo "Install it with: cargo install wasm-pack"
    exit 1
fi

# Build for Node.js
wasm-pack build --target nodejs --out-dir pkg

echo "WASM signer built successfully!"
echo "Output: ./pkg/"







