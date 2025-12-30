/**
 * WASM-based Stark crypto signer
 *
 * This module provides fast cryptographic operations using WebAssembly
 * compiled from Rust. The WASM signer is shipped with the SDK and works
 * in both Node.js and browser environments.
 */
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
export declare function initWasm(): Promise<void>;
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
export declare function sign(privateKey: bigint, msgHash: bigint): [bigint, bigint];
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
export declare function pedersenHash(a: bigint, b: bigint): bigint;
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
export declare function generateKeypairFromEthSignature(ethSignature: string): [bigint, bigint];
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
export declare function getOrderMsgHash(params: {
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
}): bigint;
/**
 * Generate message hash for a transfer
 *
 * Creates a structured hash for transfer signing compatible with Extended Exchange API.
 *
 * @param params - Transfer parameters including sender/recipient positions, amount, etc.
 * @returns Message hash as BigInt that can be signed with sign()
 */
export declare function getTransferMsgHash(params: {
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
}): bigint;
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
export declare function getWithdrawalMsgHash(params: {
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
}): bigint;
//# sourceMappingURL=signer.d.ts.map