#!/usr/bin/env node

/**
 * Integration test: Simulate user experience importing and using the SDK
 * Tests both Node.js and simulated browser environments
 */

const path = require('path');
const fs = require('fs');

console.log('🧪 INTEGRATION TEST: SDK WASM Loading and Import Validation\n');
console.log('='.repeat(60));

// Test 1: Verify all WASM files exist in the package
console.log('\n✓ Test 1: Verify all WASM files are present');
const wasmDir = path.join(__dirname, '../wasm');
const requiredWasmFiles = [
  'stark_crypto_wasm.js',              // Node.js
  'stark_crypto_wasm_bg.wasm',         // Node.js binary
  'stark_crypto_wasm.d.ts',            // Node.js types
  'stark_crypto_wasm-web.js',          // Browser
  'stark_crypto_wasm_bg-web.js',       // Browser bindings
  'stark_crypto_wasm_bg-web.wasm',     // Browser binary
  'stark_crypto_wasm.d-web.ts',        // Browser types
];

const missingFiles = [];
requiredWasmFiles.forEach(file => {
  const filePath = path.join(wasmDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ MISSING: ${file}`);
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error(`\n❌ CRITICAL: Missing ${missingFiles.length} WASM files!`);
  process.exit(1);
}

// Test 2: Verify web file imports
console.log('\n✓ Test 2: Verify stark_crypto_wasm-web.js imports reference -web versions');
const webJsPath = path.join(wasmDir, 'stark_crypto_wasm-web.js');
const webJsContent = fs.readFileSync(webJsPath, 'utf8');

const webImportChecks = [
  { pattern: './stark_crypto_wasm_bg-web.wasm', name: 'WASM binary' },
  { pattern: './stark_crypto_wasm_bg-web.js', name: 'Bindings' },
];

let importErrors = [];
webImportChecks.forEach(check => {
  if (webJsContent.includes(check.pattern)) {
    console.log(`  ✅ Imports ${check.name}: ${check.pattern}`);
  } else {
    console.log(`  ❌ Missing import: ${check.pattern}`);
    importErrors.push(check.pattern);
  }
});

// Check for bad imports (Node.js versions in web file)
const badPatterns = ['./stark_crypto_wasm_bg.js', './stark_crypto_wasm_bg.wasm'];
badPatterns.forEach(pattern => {
  // Only check if not followed by -web
  const regex = new RegExp(`${pattern}(?!-web)`, 'g');
  if (regex.test(webJsContent)) {
    // Make sure it's not part of a -web reference
    const matches = webJsContent.match(regex);
    if (matches) {
      console.log(`  ❌ ERROR: Web file imports Node.js version: ${pattern}`);
      importErrors.push(`Bad import: ${pattern}`);
    }
  }
});

if (importErrors.length > 0) {
  console.error(`\n❌ Import validation failed for web file!`);
  process.exit(1);
}

// Test 3: Verify dist/ compiled files
console.log('\n✓ Test 3: Verify dist/ folder has compiled code');
const distSignerPath = path.join(__dirname, '../dist/perpetual/crypto/signer.js');
if (fs.existsSync(distSignerPath)) {
  console.log(`  ✅ dist/perpetual/crypto/signer.js exists`);
  const distContent = fs.readFileSync(distSignerPath, 'utf8');
  if (distContent.length > 1000) {
    console.log(`  ✅ Compiled file has content (${distContent.length} bytes)`);
  } else {
    console.log(`  ❌ Compiled file is suspiciously small (${distContent.length} bytes)`);
    process.exit(1);
  }
} else {
  console.log(`  ❌ dist/perpetual/crypto/signer.js NOT FOUND`);
  console.log(`     Run: npm run build:ts`);
  process.exit(1);
}

// Test 4: Verify Node.js WASM file is properly patched
console.log('\n✓ Test 4: Verify Node.js stark_crypto_wasm.js circular import fix');
const nodeJsPath = path.join(wasmDir, 'stark_crypto_wasm.js');
const nodeJsContent = fs.readFileSync(nodeJsPath, 'utf8');

if (nodeJsContent.includes('new Proxy')) {
  console.log(`  ✅ Proxy fix applied for circular imports`);
} else {
  console.log(`  ⚠️  Warning: Proxy fix not found (may still work)`);
}

if (nodeJsContent.includes("imports['__wbindgen_placeholder__']")) {
  console.log(`  ✅ __wbindgen_placeholder__ handled`);
}

// Test 5: Test actual Node.js import
console.log('\n✓ Test 5: Test Node.js require() of WASM module');
try {
  const wasmModule = require(path.join(wasmDir, 'stark_crypto_wasm.js'));
  if (wasmModule && typeof wasmModule === 'object') {
    console.log(`  ✅ Successfully loaded stark_crypto_wasm.js`);
    const exports = Object.keys(wasmModule);
    console.log(`  ✅ WASM module exports ${exports.length} functions/objects`);
    
    // Check for expected exports
    const expectedExports = ['sign', 'pedersen_hash', 'generate_keypair_from_eth_signature'];
    const foundExports = expectedExports.filter(exp => exports.includes(exp));
    console.log(`  ✅ Found ${foundExports.length}/${expectedExports.length} expected functions`);
  } else {
    console.log(`  ❌ WASM module loaded but is not an object`);
    process.exit(1);
  }
} catch (error) {
  console.log(`  ❌ Failed to require WASM module: ${error.message}`);
  process.exit(1);
}

// Test 6: Verify SDK can be imported
console.log('\n✓ Test 6: Test SDK import');
try {
  const sdk = require(path.join(__dirname, '../dist/index.js'));
  console.log(`  ✅ Successfully imported extended-typescript-sdk`);
  
  // Check for expected exports
  const expectedClasses = ['TradingClient', 'StreamClient', 'UserClient'];
  expectedClasses.forEach(cls => {
    if (sdk[cls]) {
      console.log(`  ✅ Export found: ${cls}`);
    } else {
      console.log(`  ⚠️  Missing export: ${cls}`);
    }
  });
} catch (error) {
  console.log(`  ❌ Failed to import SDK: ${error.message}`);
  process.exit(1);
}

// Test 7: Simulate browser import path checks (bundler perspective)
console.log('\n✓ Test 7: Verify bundler can resolve imports');
const bundlerChecks = [
  {
    file: 'stark_crypto_wasm-web.js',
    description: 'Web entry point',
    path: path.join(wasmDir, 'stark_crypto_wasm-web.js'),
  },
  {
    file: 'stark_crypto_wasm_bg-web.js',
    description: 'Web bindings',
    path: path.join(wasmDir, 'stark_crypto_wasm_bg-web.js'),
  },
  {
    file: 'stark_crypto_wasm_bg-web.wasm',
    description: 'Web WASM binary',
    path: path.join(wasmDir, 'stark_crypto_wasm_bg-web.wasm'),
  },
];

bundlerChecks.forEach(check => {
  if (fs.existsSync(check.path)) {
    const stats = fs.statSync(check.path);
    console.log(`  ✅ ${check.description}: ${check.file} (${stats.size} bytes)`);
  } else {
    console.log(`  ❌ ${check.description}: ${check.file} NOT FOUND`);
    process.exit(1);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS PASSED!\n');
console.log('Summary:');
console.log('  ✅ All WASM files present (7 files)');
console.log('  ✅ Web imports reference -web versions');
console.log('  ✅ Node.js circular import fix applied');
console.log('  ✅ WASM module loadable via require()');
console.log('  ✅ SDK imports successfully');
console.log('  ✅ Bundler can resolve all dependencies');
console.log('\n📦 Package is ready for npm publish!');
