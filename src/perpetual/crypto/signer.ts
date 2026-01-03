/**
 * WASM-based Stark crypto signer
 * 
 * This module provides fast cryptographic operations using WebAssembly
 * compiled from Rust. The WASM signer is shipped with the SDK and works
 * in both Node.js and browser environments.
 */

// Dynamic WASM module type - loaded at runtime
type WasmModule = {
  init?: () => void;
  sign?: (private_key: string, msg_hash: string) => string[];
  pedersen_hash?: (a: string, b: string) => string;
  generate_keypair_from_eth_signature?: (eth_signature: string) => string[];
  get_order_msg_hash?: (...args: any[]) => string;
  get_transfer_msg_hash?: (...args: any[]) => string;
  get_withdrawal_msg_hash?: (...args: any[]) => string;
};

let wasmModule: WasmModule | null = null;
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
export async function initWasm(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    const isNode = typeof process !== 'undefined' && 
                   process.versions && 
                   typeof process.versions.node === 'string';
    
    if (isNode) {
      const hasRequire = typeof require !== 'undefined';
      const hasDirname = typeof __dirname !== 'undefined';
      
      if (hasRequire && hasDirname) {
        const path = require('path');
        const fs = require('fs');
        
        const possiblePaths = [
          path.join(__dirname, '../../../wasm/stark_crypto_wasm.js'),
          path.join(__dirname, '../../wasm/stark_crypto_wasm.js'),
          path.join(process.cwd(), 'wasm/stark_crypto_wasm.js'),
          path.join(process.cwd(), 'node_modules/extended-typescript-sdk/wasm/stark_crypto_wasm.js'),
        ];
        
        let wasmPath: string | undefined;
        for (const testPath of possiblePaths) {
          if (fs.existsSync(testPath)) {
            wasmPath = testPath;
            break;
          }
        }
        
        if (!wasmPath) {
          throw new Error(`WASM module not found. Tried: ${possiblePaths.join(', ')}`);
        }
        
        wasmModule = require(wasmPath) as WasmModule;
        if (wasmModule.init) {
          wasmModule.init();
        }
      } else {
        const pathModule = await import('path');
        const fsModule = await import('fs');
        const { createRequire } = await import('module');
        const basePath = process.cwd();
        
        const possiblePaths = [
          pathModule.join(basePath, 'node_modules/extended-typescript-sdk/wasm/stark_crypto_wasm.js'),
          pathModule.join(basePath, 'node_modules/extended-typescript-sdk/dist/esm/wasm/stark_crypto_wasm.js'),
          pathModule.join(basePath, 'dist/esm/wasm/stark_crypto_wasm.js'),
          pathModule.join(basePath, 'wasm/stark_crypto_wasm.js'),
        ];
        
        let wasmPath: string | undefined;
        for (const testPath of possiblePaths) {
          if (fsModule.existsSync(testPath)) {
            wasmPath = testPath;
            break;
          }
        }
        
        if (!wasmPath) {
          throw new Error(`WASM module not found. Tried: ${possiblePaths.join(', ')}`);
        }
        
        const wasmUrl = pathModule.isAbsolute(wasmPath) 
          ? `file:///${wasmPath.replace(/\\/g, '/')}`
          : wasmPath;
        const requireFunc = createRequire(wasmUrl);
        wasmModule = requireFunc(wasmPath) as WasmModule;
        if (wasmModule.init) {
          wasmModule.init();
        }
      }
    } else {
      try {
        // @ts-ignore
        wasmModule = await import('/wasm/stark_crypto_wasm-web.js') as WasmModule;
        
        if (wasmModule.init) {
          await wasmModule.init();
        }
      } catch (browserError: any) {
        try {
          // @ts-ignore
          wasmModule = await import('extended-typescript-sdk/wasm/stark_crypto_wasm-web.js') as WasmModule;
          if (wasmModule.init) {
            await wasmModule.init();
          }
        } catch (packageError: any) {
          try {
            // @ts-ignore
            wasmModule = await import('extended-typescript-sdk/wasm/stark_crypto_wasm-web') as WasmModule;
            if (wasmModule.init) {
              await wasmModule.init();
            }
          } catch (fallbackError: any) {
            throw new Error(
              `Failed to load WASM module in browser environment.\n` +
              `Make sure WASM files are in /wasm/ folder or build with: npm run build:signer\n` +
              `Tried: /wasm/stark_crypto_wasm-web.js, extended-typescript-sdk/wasm/*\n` +
              `Errors: ${browserError.message}\n` +
              `Package error: ${packageError.message}`
            );
          }
        }
      }
    }
    
    isInitialized = true;
  } catch (error: any) {
    throw new Error(
      `Failed to initialize WASM module.\n` +
      `The SDK should ship with pre-built WASM files. If you're developing, run: npm run build:signer\n` +
      `Error: ${error?.message || error}`
    );
  }
}

/**
 * Check if WASM module is initialized
 */
function ensureInitialized(): void {
  if (!isInitialized || !wasmModule) {
    throw new Error(
      'WASM module not initialized. Call initWasm() first.'
    );
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
export function sign(privateKey: bigint, msgHash: bigint): [bigint, bigint] {
  ensureInitialized();
  
  const privHex = '0x' + privateKey.toString(16);
  const hashHex = '0x' + msgHash.toString(16);
  
  if (!wasmModule!.sign) {
    throw new Error('WASM sign function not available.');
  }

  const result = wasmModule!.sign(privHex, hashHex);
  
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
export function pedersenHash(a: bigint, b: bigint): bigint {
  ensureInitialized();
  
  if (!wasmModule!.pedersen_hash) {
    throw new Error('WASM pedersen_hash function not available.');
  }

  // Convert bigint to hex string (with 0x prefix)
  // Field elements are 251 bits, so we use the natural hex representation
  const aHex = '0x' + a.toString(16);
  const bHex = '0x' + b.toString(16);
  const result = wasmModule!.pedersen_hash(aHex, bHex);
  
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
export function generateKeypairFromEthSignature(ethSignature: string): [bigint, bigint] {
  ensureInitialized();
  
  if (!wasmModule!.generate_keypair_from_eth_signature) {
    throw new Error('WASM generate_keypair_from_eth_signature function not available.');
  }

  const result = wasmModule!.generate_keypair_from_eth_signature(ethSignature);
  
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
export function getOrderMsgHash(params: {
  positionId: number;
  baseAssetId: string;
  baseAmount: string;
  quoteAssetId: string;
  quoteAmount: string;
  feeAmount: string;
  feeAssetId: string;
  expiration: number;
  salt: number;
  userPublicKey: string;
  domainName: string;
  domainVersion: string;
  domainChainId: string;
  domainRevision: string;
}): bigint {
  ensureInitialized();
  
  if (!wasmModule!.get_order_msg_hash) {
    throw new Error('WASM get_order_msg_hash function not available.');
  }

  const result = wasmModule!.get_order_msg_hash(
    BigInt(params.positionId),
    params.baseAssetId,
    params.baseAmount,
    params.quoteAssetId,
    params.quoteAmount,
    params.feeAmount,
    params.feeAssetId,
    BigInt(params.expiration),
    BigInt(params.salt),
    params.userPublicKey,
    params.domainName,
    params.domainVersion,
    params.domainChainId,
    params.domainRevision
  );
  
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
export function getTransferMsgHash(params: {
  recipientPositionId: number;
  senderPositionId: number;
  amount: string;
  expiration: number;
  salt: string;
  userPublicKey: string;
  domainName: string;
  domainVersion: string;
  domainChainId: string;
  domainRevision: string;
  collateralId: string;
}): bigint {
  ensureInitialized();
  
  if (!wasmModule!.get_transfer_msg_hash) {
    throw new Error('WASM get_transfer_msg_hash function not available.');
  }

  const result = wasmModule!.get_transfer_msg_hash(
    BigInt(params.recipientPositionId),
    BigInt(params.senderPositionId),
    params.amount,
    BigInt(params.expiration),
    params.salt,
    params.userPublicKey,
    params.domainName,
    params.domainVersion,
    params.domainChainId,
    params.domainRevision,
    params.collateralId
  );
  
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
export function getWithdrawalMsgHash(params: {
  recipientHex: string;
  positionId: number;
  amount: string;
  expiration: number;
  salt: string;
  userPublicKey: string;
  domainName: string;
  domainVersion: string;
  domainChainId: string;
  domainRevision: string;
  collateralId: string;
}): bigint {
  ensureInitialized();
  
  if (!wasmModule!.get_withdrawal_msg_hash) {
    throw new Error('WASM get_withdrawal_msg_hash function not available.');
  }

  const result = wasmModule!.get_withdrawal_msg_hash(
    params.recipientHex,
    BigInt(params.positionId),
    params.amount,
    BigInt(params.expiration),
    params.salt,
    params.userPublicKey,
    params.domainName,
    params.domainVersion,
    params.domainChainId,
    params.domainRevision,
    params.collateralId
  );
  
  // Remove '0x' prefix if present
  const cleanResult = result.startsWith('0x') ? result.slice(2) : result;
  
  return BigInt('0x' + cleanResult);
}

