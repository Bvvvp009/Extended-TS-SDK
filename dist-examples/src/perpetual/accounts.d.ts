/**
 * Account models and StarkPerpetualAccount class
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { CustomStarkSigner } from './custom-signer';
/**
 * Stark Perpetual Account
 * Manages signing operations for trading
 *
 * Supports two modes of operation:
 * 1. Direct signing with a private key (default)
 * 2. Custom signer integration (e.g., Privy, Web3Auth)
 */
export declare class StarkPerpetualAccount {
    private vault;
    private privateKey?;
    private publicKey;
    private apiKey;
    private tradingFee;
    private customSigner?;
    constructor(vault: number | string, privateKey: string, publicKey: string, apiKey: string);
    getVault(): number;
    getPublicKey(): bigint;
    getPublicKeyHex(): string;
    getApiKey(): string;
    getTradingFee(): Map<string, any>;
    setTradingFee(market: string, fee: any): void;
    /**
     * Set a custom signer for remote signing (e.g., Privy, Web3Auth)
     *
     * @param signer - Custom signer implementation
     *
     * @example
     * ```typescript
     * const account = new StarkPerpetualAccount(vault, privateKey, publicKey, apiKey);
     * account.setCustomSigner(new PrivyStarkSigner(privyClient, walletId));
     * ```
     */
    setCustomSigner(signer: CustomStarkSigner): void;
    /**
     * Get the custom signer if set
     */
    getCustomSigner(): CustomStarkSigner | undefined;
    /**
     * Clear the custom signer and use direct signing
     */
    clearCustomSigner(): void;
    /**
     * Sign a message hash
     * Returns Promise resolving to [r, s] tuple
     *
     * If a custom signer is set, uses the custom signer.
     * Otherwise, uses the built-in WASM signer with the private key.
     *
     * @returns Promise resolving to signature tuple [r, s]
     */
    sign(msgHash: bigint): Promise<[bigint, bigint]>;
}
/**
 * Create a StarkPerpetualAccount with a custom signer
 *
 * Use this factory function when integrating with external signing services
 * like Privy, Web3Auth, or other remote signers that don't expose private keys.
 *
 * Note: This function uses a dummy private key internally to maintain backward
 * compatibility with the existing StarkPerpetualAccount constructor. The dummy
 * key is never used for signing when a custom signer is set.
 *
 * @param vault - Vault ID
 * @param publicKey - Public key as hex string
 * @param apiKey - API key for authentication
 * @param customSigner - Custom signer implementation
 * @returns StarkPerpetualAccount configured with the custom signer
 *
 * @example
 * ```typescript
 * const privySigner = new PrivyStarkSigner(privyClient, walletId);
 * const account = createStarkPerpetualAccountWithCustomSigner(
 *   vaultId,
 *   publicKeyHex,
 *   apiKey,
 *   privySigner
 * );
 * ```
 */
export declare function createStarkPerpetualAccountWithCustomSigner(vault: number | string, publicKey: string, apiKey: string, customSigner: CustomStarkSigner): StarkPerpetualAccount;
/**
 * Account model
 */
export declare class AccountModel extends X10BaseModel {
    id: number;
    description: string;
    accountIndex: number;
    status: string;
    l2Key: string;
    l2Vault: number;
    bridgeStarknetAddress?: string;
    apiKeys?: string[];
    constructor(id: number, description: string, accountIndex: number, status: string, l2Key: string, l2Vault: number, bridgeStarknetAddress?: string, apiKeys?: string[]);
}
/**
 * Account leverage model
 */
export declare class AccountLeverage extends X10BaseModel {
    market: string;
    leverage: Decimal;
    constructor(market: string, leverage: Decimal);
}
/**
 * API key response model
 */
export declare class ApiKeyResponseModel extends X10BaseModel {
    key: string;
    constructor(key: string);
}
/**
 * API key request model
 */
export declare class ApiKeyRequestModel extends X10BaseModel {
    description: string;
    constructor(description: string);
}
/**
 * Balance model
 */
export declare class BalanceModel extends X10BaseModel {
    collateralName: string;
    balance: Decimal;
    equity: Decimal;
    availableForTrade: Decimal;
    availableForWithdrawal: Decimal;
    unrealisedPnl: Decimal;
    initialMargin: Decimal;
    marginRatio: Decimal;
    updatedTime: number;
}
/**
 * Account stream data model
 */
export declare class AccountStreamDataModel extends X10BaseModel {
    orders?: any[];
    positions?: any[];
    trades?: any[];
    balance?: BalanceModel;
}
//# sourceMappingURL=accounts.d.ts.map