/**
 * Custom signer interface for external signing services
 * 
 * This module provides interfaces and types to enable integration with
 * external signing services like Privy, Web3Auth, or custom HSM solutions.
 */

/**
 * Signature result interface
 * Represents an ECDSA signature as [r, s] tuple
 */
export interface SignatureResult {
  r: bigint;
  s: bigint;
}

/**
 * Custom signer interface
 * 
 * Implement this interface to integrate with external signing services.
 * The signer must be able to sign StarkNet message hashes using ECDSA.
 * 
 * @example
 * ```typescript
 * // Privy integration example
 * class PrivyStarkSigner implements CustomStarkSigner {
 *   constructor(private privyClient: PrivyClient, private walletId: string) {}
 *   
 *   async sign(msgHash: bigint): Promise<[bigint, bigint]> {
 *     const msgHashHex = '0x' + msgHash.toString(16);
 *     const signature = await this.privyClient.signStarknetMessage(
 *       this.walletId,
 *       msgHashHex
 *     );
 *     return [BigInt(signature.r), BigInt(signature.s)];
 *   }
 * }
 * ```
 */
export interface CustomStarkSigner {
  /**
   * Sign a StarkNet message hash
   * 
   * @param msgHash - Message hash to sign as BigInt
   * @returns Promise resolving to [r, s] signature tuple
   */
  sign(msgHash: bigint): Promise<[bigint, bigint]>;
}

/**
 * Type guard to check if a value is a CustomStarkSigner
 */
export function isCustomStarkSigner(value: any): value is CustomStarkSigner {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.sign === 'function'
  );
}
