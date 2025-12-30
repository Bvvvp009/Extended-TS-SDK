/**
 * Example: Using Privy for Remote Signing
 *
 * This example demonstrates how to integrate the Extended SDK with Privy
 * for remote signing. Privy keeps the private keys secure and signs
 * messages remotely without exposing the keys to your application.
 *
 * Prerequisites:
 * - Privy account setup
 * - Privy StarkNet wallet configured
 *
 * Installation:
 * ```
 * npm install @privy-io/react-auth
 * npm install extended-typescript-sdk
 * ```
 */
import { CustomStarkSigner } from '../src/index';
/**
 * Example Privy Signer Implementation
 *
 * Note: This is a conceptual implementation. The actual Privy API
 * may differ. Check Privy's documentation for the exact API:
 * https://docs.privy.io/
 */
declare class PrivyStarkSigner implements CustomStarkSigner {
    private privyClient;
    private walletId;
    constructor(privyClient: any, // Replace with actual Privy client type
    walletId: string);
    /**
     * Sign a message hash using Privy's remote signing
     */
    sign(msgHash: bigint): Promise<[bigint, bigint]>;
}
export { PrivyStarkSigner };
//# sourceMappingURL=16_privy_integration.d.ts.map