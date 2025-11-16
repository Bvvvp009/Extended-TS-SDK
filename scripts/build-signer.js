#!/usr/bin/env node

/**
 * Build script for WASM signer
 * Builds both Node.js and browser targets and copies to wasm/ folder
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const wasmSignerDir = path.join(__dirname, '../wasm-signer');
const wasmOutputDir = path.join(__dirname, '../wasm');

console.log('🔨 Building WASM signer...\n');

// Clean output directory
if (fs.existsSync(wasmOutputDir)) {
  fs.rmSync(wasmOutputDir, { recursive: true, force: true });
}
fs.mkdirSync(wasmOutputDir, { recursive: true });

// Build Node.js target
console.log('📦 Building Node.js target...');
try {
  execSync('wasm-pack build --target nodejs --out-dir pkg', {
    cwd: wasmSignerDir,
    stdio: 'inherit',
  });
  
  // Copy Node.js WASM files
  const nodePkgDir = path.join(wasmSignerDir, 'pkg');
  const nodeFiles = ['stark_crypto_wasm.js', 'stark_crypto_wasm_bg.wasm', 'stark_crypto_wasm.d.ts'];
  
  nodeFiles.forEach(file => {
    const src = path.join(nodePkgDir, file);
    const dest = path.join(wasmOutputDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Copied ${file}`);
    }
  });
} catch (error) {
  console.error('❌ Failed to build Node.js target:', error.message);
  process.exit(1);
}

// Build browser/bundler target
console.log('\n🌐 Building browser target...');
try {
  execSync('wasm-pack build --target bundler --out-dir pkg-web', {
    cwd: wasmSignerDir,
    stdio: 'inherit',
  });
  
  // Copy browser WASM files with -web suffix
  const webPkgDir = path.join(wasmSignerDir, 'pkg-web');
  const webFiles = ['stark_crypto_wasm.js', 'stark_crypto_wasm_bg.wasm', 'stark_crypto_wasm.d.ts'];
  
  webFiles.forEach(file => {
    const src = path.join(webPkgDir, file);
    const baseName = path.basename(file, path.extname(file));
    const ext = path.extname(file);
    const dest = path.join(wasmOutputDir, `${baseName}-web${ext}`);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Copied ${file} -> ${path.basename(dest)}`);
    }
  });
  
  // Also copy web files without -web suffix for browser bundlers that expect standard names
  // This allows bundlers to resolve wasm/stark_crypto_wasm.js in browser builds
  const webFilesStandard = ['stark_crypto_wasm_bg.wasm'];
  webFilesStandard.forEach(file => {
    const src = path.join(webPkgDir, file);
    const dest = path.join(wasmOutputDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  ✓ Copied ${file} (browser standard)`);
    }
  });
} catch (error) {
  console.error('❌ Failed to build browser target:', error.message);
  process.exit(1);
}

console.log('\n✅ WASM signer build complete!');
console.log(`   Output: ${wasmOutputDir}`);
console.log('\n📝 Note: Users can rebuild their own WASM signer with:');
console.log('   npm run build:signer:custom');

