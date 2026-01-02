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
  
  // Patch the Node.js WASM file to fix circular imports issue
  // The nodejs target generates code with imports['__wbindgen_placeholder__'] = module.exports
  // which tries to import "./stark_crypto_wasm_bg.js" before exports are populated
  // We fix this by creating Proxy objects that forward to exports dynamically
  const wasmJsPath = path.join(wasmOutputDir, 'stark_crypto_wasm.js');
  let wasmJsContent = fs.readFileSync(wasmJsPath, 'utf8');
  
  wasmJsContent = wasmJsContent.replace(
    /let imports = \{\};\nimports\['__wbindgen_placeholder__'\] = module\.exports;/,
    `let imports = {};
// Create a proxy object that will forward to exports once they're defined
imports['__wbindgen_placeholder__'] = new Proxy({}, {
  get: (target, prop) => {
    return exports[prop];
  }
});
// Also handle the "./stark_crypto_wasm_bg.js" import that wasm-bindgen expects
imports['./stark_crypto_wasm_bg.js'] = new Proxy({}, {
  get: (target, prop) => {
    return exports[prop];
  }
});`
  );
  
  fs.writeFileSync(wasmJsPath, wasmJsContent);
  console.log(`  ✓ Patched ${path.basename(wasmJsPath)} to fix circular imports`);
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
  const webFiles = ['stark_crypto_wasm.js', 'stark_crypto_wasm_bg.js', 'stark_crypto_wasm_bg.wasm', 'stark_crypto_wasm.d.ts'];
  
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
  
  // Patch stark_crypto_wasm-web.js to reference -web versions of imported modules
  // wasm-pack generates imports for ./stark_crypto_wasm_bg.js but we renamed it to -web version
  const webJsPath = path.join(wasmOutputDir, 'stark_crypto_wasm-web.js');
  if (fs.existsSync(webJsPath)) {
    let webJsContent = fs.readFileSync(webJsPath, 'utf8');
    webJsContent = webJsContent
      .replace(/\.\/stark_crypto_wasm_bg\.wasm/g, './stark_crypto_wasm_bg-web.wasm')
      .replace(/\.\/stark_crypto_wasm_bg\.js/g, './stark_crypto_wasm_bg-web.js');
    fs.writeFileSync(webJsPath, webJsContent);
    console.log(`  ✓ Patched stark_crypto_wasm-web.js to reference -web files`);
  }
} catch (error) {
  console.error('❌ Failed to build browser target:', error.message);
  process.exit(1);
}

console.log('\n✅ WASM signer build complete!');
console.log(`   Output: ${wasmOutputDir}`);
console.log('\n📝 Note: Users can rebuild their own WASM signer with:');
console.log('   npm run build:signer:custom');

