"use strict";
/**
 * WASM-based Stark crypto signer
 *
 * This module provides fast cryptographic operations using WebAssembly
 * compiled from Rust. The WASM signer is shipped with the SDK and works
 * in both Node.js and browser environments.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWasm = initWasm;
exports.sign = sign;
exports.pedersenHash = pedersenHash;
exports.generateKeypairFromEthSignature = generateKeypairFromEthSignature;
exports.getOrderMsgHash = getOrderMsgHash;
exports.getTransferMsgHash = getTransferMsgHash;
exports.getWithdrawalMsgHash = getWithdrawalMsgHash;
let wasmModule = null;
let isInitialized = false;
/**
 * Initialize the WASM cryptographic module
 *
 * **MUST be called before using any signing or hashing functions.**
 * This function loads the WebAssembly module that provides fast cryptographic operations.
 *
 * @throws Error if WASM module cannot be loaded
 *
 * @example
 * ```typescript
 * import { initWasm, sign } from 'extended-typescript-sdk';
 *
 * async function main() {
 *   await initWasm(); // Initialize first!
 *   const [r, s] = sign(privateKey, msgHash);
 * }
 * ```
 */
async function initWasm() {
    if (isInitialized) {
        return;
    }
    try {
        // Load local WASM build from shipped wasm/ folder
        // Supports both Node.js and browser environments
        // Detect Node.js: check for process.versions.node (not just process, as bundlers may polyfill it)
        const isNode = typeof process !== 'undefined' &&
            process.versions &&
            typeof process.versions.node === 'string' &&
            typeof require !== 'undefined';
        if (isNode) {
            // Node.js environment - use require/fs
            const path = require('path');
            const fs = require('fs');
            let wasmPath;
            // Try shipped wasm/ folder first (included in npm package)
            const possiblePaths = [
                path.join(__dirname, '../../wasm/stark_crypto_wasm'),
                path.join(process.cwd(), 'wasm/stark_crypto_wasm'),
                path.join(process.cwd(), 'node_modules/extended-typescript-sdk/wasm/stark_crypto_wasm'),
                // Fallback to build directory (for development)
                path.join(__dirname, '../../wasm-signer/pkg/stark_crypto_wasm'),
                path.join(process.cwd(), 'wasm-signer/pkg/stark_crypto_wasm'),
            ];
            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath + '.js') || fs.existsSync(testPath + '.d.ts')) {
                    wasmPath = testPath;
                    break;
                }
            }
            if (!wasmPath) {
                throw new Error(`WASM module not found. Tried: ${possiblePaths.join(', ')}\n` +
                    `Please run: npm run build:signer\n` +
                    `Or if you want to build your own: npm run build:signer:custom`);
            }
            // Use absolute path for require()
            const absoluteWasmPath = path.resolve(wasmPath);
            // Use require() for CommonJS modules (patched nodejs target)
            wasmModule = require(absoluteWasmPath);
            // Initialize the WASM module
            if (wasmModule.init) {
                wasmModule.init();
            }
        }
        else {
            // Browser environment - use dynamic import
            // Try to load from wasm/ folder (bundler will handle this)
            try {
                // For browser, we expect the bundler to handle WASM imports
                // The bundler should resolve wasm/stark_crypto_wasm-web.js
                // @ts-expect-error - Dynamic import resolved at runtime by bundler
                wasmModule = await Promise.resolve().then(() => __importStar(require('../../wasm/stark_crypto_wasm-web')));
                if (wasmModule.init) {
                    await wasmModule.init();
                }
            }
            catch (browserError) {
                // Fallback: try without -web suffix (for custom builds)
                try {
                    // @ts-expect-error - Dynamic import resolved at runtime by bundler
                    wasmModule = await Promise.resolve().then(() => __importStar(require('../../wasm/stark_crypto_wasm')));
                    if (wasmModule.init) {
                        await wasmModule.init();
                    }
                }
                catch (fallbackError) {
                    throw new Error(`Failed to load WASM module in browser environment.\n` +
                        `Make sure to build with browser target: npm run build:signer\n` +
                        `Error: ${browserError.message || browserError}`);
                }
            }
        }
        isInitialized = true;
    }
    catch (error) {
        throw new Error(`Failed to initialize WASM module.\n` +
            `The SDK should ship with pre-built WASM files. If you're developing, run: npm run build:signer\n` +
            `Error: ${error?.message || error}`);
    }
}
/**
 * Check if WASM module is initialized
 */
function ensureInitialized() {
    if (!isInitialized || !wasmModule) {
        throw new Error('WASM module not initialized. Call initWasm() first.');
    }
}
/**
 * Sign a message hash using ECDSA
 *
 * This function signs a message hash using the StarkNet private key.
 * Returns the signature as a tuple [r, s] where both are BigInt values.
 * Compatible with Extended Exchange API.
 *
 * @param privateKey - StarkNet private key as BigInt
 * @param msgHash - Message hash to sign as BigInt
 * @returns Tuple [r, s] representing the ECDSA signature
 *
 * @example
 * ```typescript
 * await initWasm();
 * const privateKey = BigInt('0x...');
 * const msgHash = BigInt('0x...');
 * const [r, s] = sign(privateKey, msgHash);
 * ```
 */
function sign(privateKey, msgHash) {
    ensureInitialized();
    const privHex = '0x' + privateKey.toString(16);
    const hashHex = '0x' + msgHash.toString(16);
    // Use local WASM for signing
    if (!wasmModule.sign) {
        throw new Error('WASM sign function not available. Make sure the WASM module is properly built.');
    }
    const result = wasmModule.sign(privHex, hashHex);
    // Convert string results to bigint
    const r = BigInt(result[0]);
    const s = BigInt(result[1]);
    return [r, s];
}
/**
 * Compute Pedersen hash of two field elements
 *
 * Pedersen hash is used extensively in StarkNet for hashing operations.
 * Compatible with Extended Exchange API.
 *
 * @param a - First field element as BigInt
 * @param b - Second field element as BigInt
 * @returns Pedersen hash as BigInt
 *
 * @example
 * ```typescript
 * await initWasm();
 * const hash = pedersenHash(BigInt('0x123'), BigInt('0x456'));
 * ```
 */
function pedersenHash(a, b) {
    ensureInitialized();
    if (!wasmModule.pedersen_hash) {
        throw new Error('WASM pedersen_hash function not available.');
    }
    // Convert bigint to hex string (with 0x prefix)
    // Field elements are 251 bits, so we use the natural hex representation
    const aHex = '0x' + a.toString(16);
    const bHex = '0x' + b.toString(16);
    const result = wasmModule.pedersen_hash(aHex, bHex);
    // Remove '0x' prefix if present
    const cleanResult = result.startsWith('0x') ? result.slice(2) : result;
    return BigInt('0x' + cleanResult);
}
/**
 * Generate StarkNet keypair from Ethereum signature
 *
 * Derives a StarkNet keypair from an Ethereum signature using key grinding.
 * Used during account onboarding to create L2 keys from L1 Ethereum account.
 * Compatible with Extended Exchange API.
 *
 * @param ethSignature - Ethereum signature as hex string (65 bytes: r(32) + s(32) + v(1))
 * @returns Tuple [privateKey, publicKey] as BigInt values
 *
 * @example
 * ```typescript
 * await initWasm();
 * const ethSig = '0x...'; // 65-byte hex string
 * const [privateKey, publicKey] = generateKeypairFromEthSignature(ethSig);
 * ```
 */
function generateKeypairFromEthSignature(ethSignature) {
    ensureInitialized();
    if (!wasmModule.generate_keypair_from_eth_signature) {
        throw new Error('WASM generate_keypair_from_eth_signature function not available.');
    }
    const result = wasmModule.generate_keypair_from_eth_signature(ethSignature);
    // Convert string results to bigint
    const privateKey = BigInt(result[0]);
    const publicKey = BigInt(result[1]);
    return [privateKey, publicKey];
}
/**
 * Generate message hash for an order
 *
 * Creates a structured hash for order signing compatible with Extended Exchange API.
 * This hash is used to sign orders before submitting them to the exchange.
 *
 * @param params - Order parameters including position, assets, amounts, expiration, etc.
 * @returns Message hash as BigInt that can be signed with sign()
 *
 * @example
 * ```typescript
 * await initWasm();
 * const orderHash = getOrderMsgHash({
 *   positionId: 12345,
 *   baseAssetId: '0x...',
 *   baseAmount: '1000000',
 *   // ... other parameters
 * });
 * const [r, s] = sign(privateKey, orderHash);
 * ```
 */
function getOrderMsgHash(params) {
    ensureInitialized();
    if (!wasmModule.get_order_msg_hash) {
        throw new Error('WASM get_order_msg_hash function not available.');
    }
    const result = wasmModule.get_order_msg_hash(BigInt(params.positionId), params.baseAssetId, params.baseAmount, params.quoteAssetId, params.quoteAmount, params.feeAmount, params.feeAssetId, BigInt(params.expiration), BigInt(params.salt), params.userPublicKey, params.domainName, params.domainVersion, params.domainChainId, params.domainRevision);
    // Remove '0x' prefix if present
    const cleanResult = result.startsWith('0x') ? result.slice(2) : result;
    return BigInt('0x' + cleanResult);
}
/**
 * Generate message hash for a transfer
 *
 * Creates a structured hash for transfer signing compatible with Extended Exchange API.
 *
 * @param params - Transfer parameters including sender/recipient positions, amount, etc.
 * @returns Message hash as BigInt that can be signed with sign()
 */
function getTransferMsgHash(params) {
    ensureInitialized();
    if (!wasmModule.get_transfer_msg_hash) {
        throw new Error('WASM get_transfer_msg_hash function not available.');
    }
    const result = wasmModule.get_transfer_msg_hash(BigInt(params.recipientPositionId), BigInt(params.senderPositionId), params.amount, BigInt(params.expiration), params.salt, params.userPublicKey, params.domainName, params.domainVersion, params.domainChainId, params.domainRevision, params.collateralId);
    // Remove '0x' prefix if present
    const cleanResult = result.startsWith('0x') ? result.slice(2) : result;
    return BigInt('0x' + cleanResult);
}
/**
 * Get withdrawal message hash
 */
/**
 * Generate message hash for a withdrawal
 *
 * Creates a structured hash for withdrawal signing compatible with Extended Exchange API.
 *
 * @param params - Withdrawal parameters including recipient, position, amount, etc.
 * @returns Message hash as BigInt that can be signed with sign()
 */
function getWithdrawalMsgHash(params) {
    ensureInitialized();
    if (!wasmModule.get_withdrawal_msg_hash) {
        throw new Error('WASM get_withdrawal_msg_hash function not available.');
    }
    const result = wasmModule.get_withdrawal_msg_hash(params.recipientHex, BigInt(params.positionId), params.amount, BigInt(params.expiration), params.salt, params.userPublicKey, params.domainName, params.domainVersion, params.domainChainId, params.domainRevision, params.collateralId);
    // Remove '0x' prefix if present
    const cleanResult = result.startsWith('0x') ? result.slice(2) : result;
    return BigInt('0x' + cleanResult);
}
//# sourceMappingURL=signer.js.map