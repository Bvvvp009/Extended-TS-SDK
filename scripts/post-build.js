#!/usr/bin/env node

/**
 * Post-build script to add package.json files for dual ESM/CJS support
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Setting up dual ESM/CommonJS package structure...\n');

// Add package.json to CJS folder to mark it as CommonJS
const cjsPackageJson = {
  type: 'commonjs'
};

const cjsPackagePath = path.join(__dirname, '../dist/cjs/package.json');
fs.writeFileSync(cjsPackagePath, JSON.stringify(cjsPackageJson, null, 2));
console.log('✓ Created dist/cjs/package.json (CommonJS)');

// Add package.json to ESM folder to mark it as ESM
const esmPackageJson = {
  type: 'module'
};

const esmPackagePath = path.join(__dirname, '../dist/esm/package.json');
fs.writeFileSync(esmPackagePath, JSON.stringify(esmPackageJson, null, 2));
console.log('✓ Created dist/esm/package.json (ESM)');

console.log('\n✅ Dual package setup complete!');
console.log('   - ESM: dist/esm/');
console.log('   - CJS: dist/cjs/');
