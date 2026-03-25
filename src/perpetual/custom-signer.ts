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

export type SignatureComponent = bigint | number | string;

export type SignatureResultLike =
  | [SignatureComponent, SignatureComponent]
  | SignatureResult
  | {
      r: SignatureComponent;
      s: SignatureComponent;
    };

export type CustomSignerCallback =
  (msgHash: bigint) => Promise<SignatureResultLike> | SignatureResultLike;

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

function normalizeSignatureComponent(
  value: SignatureComponent,
  field: 'r' | 's'
): bigint {
  if (typeof value === 'bigint') {
    return value;
  }

  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(`Invalid signature ${field}: expected a non-negative integer`);
    }

    return BigInt(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error(`Invalid signature ${field}: empty string`);
    }

    const isHex = /^0x[0-9a-f]+$/i.test(trimmed);
    const isDecimal = /^\d+$/.test(trimmed);

    if (!isHex && !isDecimal) {
      throw new Error(
        `Invalid signature ${field}: expected decimal or 0x-prefixed hex string`
      );
    }

    return BigInt(trimmed);
  }

  throw new Error(`Invalid signature ${field}: unsupported value type`);
}

export function normalizeSignatureResult(
  signature: SignatureResultLike
): [bigint, bigint] {
  if (Array.isArray(signature)) {
    if (signature.length !== 2) {
      throw new Error('Invalid signature result: expected [r, s] tuple');
    }

    return [
      normalizeSignatureComponent(signature[0], 'r'),
      normalizeSignatureComponent(signature[1], 's'),
    ];
  }

  if (
    signature !== null &&
    typeof signature === 'object' &&
    'r' in signature &&
    's' in signature
  ) {
    return [
      normalizeSignatureComponent(signature.r, 'r'),
      normalizeSignatureComponent(signature.s, 's'),
    ];
  }

  throw new Error('Invalid signature result: expected [r, s] or { r, s }');
}

export class CallbackStarkSigner implements CustomStarkSigner {
  private readonly signCallback: CustomSignerCallback;

  constructor(signCallback: CustomSignerCallback) {
    if (typeof signCallback !== 'function') {
      throw new Error('Invalid sign callback: expected a function');
    }

    this.signCallback = signCallback;
  }

  async sign(msgHash: bigint): Promise<[bigint, bigint]> {
    const signature = await this.signCallback(msgHash);
    return normalizeSignatureResult(signature);
  }
}

export function createCustomStarkSigner(
  signCallback: CustomSignerCallback
): CustomStarkSigner {
  return new CallbackStarkSigner(signCallback);
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
