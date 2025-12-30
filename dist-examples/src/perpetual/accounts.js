"use strict";
/**
 * Account models and StarkPerpetualAccount class
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountStreamDataModel = exports.BalanceModel = exports.ApiKeyRequestModel = exports.ApiKeyResponseModel = exports.AccountLeverage = exports.AccountModel = exports.StarkPerpetualAccount = void 0;
exports.createStarkPerpetualAccountWithCustomSigner = createStarkPerpetualAccountWithCustomSigner;
const model_1 = require("../utils/model");
const string_1 = require("../utils/string");
const signer_1 = require("./crypto/signer");
const custom_signer_1 = require("./custom-signer");
/**
 * Stark Perpetual Account
 * Manages signing operations for trading
 *
 * Supports two modes of operation:
 * 1. Direct signing with a private key (default)
 * 2. Custom signer integration (e.g., Privy, Web3Auth)
 */
class StarkPerpetualAccount {
    vault;
    privateKey;
    publicKey;
    apiKey;
    tradingFee = new Map();
    customSigner;
    constructor(vault, privateKey, publicKey, apiKey) {
        if (!(0, string_1.isHexString)(privateKey)) {
            throw new Error('Invalid private key format');
        }
        if (!(0, string_1.isHexString)(publicKey)) {
            throw new Error('Invalid public key format');
        }
        if (typeof vault === 'string') {
            this.vault = parseInt(vault, 10);
        }
        else {
            this.vault = vault;
        }
        // Remove '0x' prefix if present and convert to bigint
        const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        const cleanPublicKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
        this.privateKey = BigInt('0x' + cleanPrivateKey);
        this.publicKey = BigInt('0x' + cleanPublicKey);
        this.apiKey = apiKey;
    }
    getVault() {
        return this.vault;
    }
    getPublicKey() {
        return this.publicKey;
    }
    getPublicKeyHex() {
        return '0x' + this.publicKey.toString(16);
    }
    getApiKey() {
        return this.apiKey;
    }
    getTradingFee() {
        return this.tradingFee;
    }
    setTradingFee(market, fee) {
        this.tradingFee.set(market, fee);
    }
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
    setCustomSigner(signer) {
        if (!(0, custom_signer_1.isCustomStarkSigner)(signer)) {
            throw new Error('Invalid custom signer: must implement CustomStarkSigner interface');
        }
        this.customSigner = signer;
    }
    /**
     * Get the custom signer if set
     */
    getCustomSigner() {
        return this.customSigner;
    }
    /**
     * Clear the custom signer and use direct signing
     */
    clearCustomSigner() {
        this.customSigner = undefined;
    }
    /**
     * Sign a message hash
     * Returns Promise resolving to [r, s] tuple
     *
     * If a custom signer is set, uses the custom signer.
     * Otherwise, uses the built-in WASM signer with the private key.
     *
     * @returns Promise resolving to signature tuple [r, s]
     */
    async sign(msgHash) {
        if (this.customSigner) {
            return this.customSigner.sign(msgHash);
        }
        if (!this.privateKey) {
            throw new Error('No private key or custom signer available for signing');
        }
        // Wrap synchronous WASM sign in Promise for consistent API
        return Promise.resolve((0, signer_1.sign)(this.privateKey, msgHash));
    }
}
exports.StarkPerpetualAccount = StarkPerpetualAccount;
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
function createStarkPerpetualAccountWithCustomSigner(vault, publicKey, apiKey, customSigner) {
    // Use a dummy private key (all zeros) to satisfy the constructor
    // This maintains backward compatibility without breaking existing code
    // The dummy key is never used when a custom signer is set
    const dummyPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const account = new StarkPerpetualAccount(vault, dummyPrivateKey, publicKey, apiKey);
    account.setCustomSigner(customSigner);
    return account;
}
/**
 * Account model
 */
class AccountModel extends model_1.X10BaseModel {
    id;
    description;
    accountIndex;
    status;
    l2Key;
    l2Vault;
    bridgeStarknetAddress;
    apiKeys;
    constructor(id, description, accountIndex, status, l2Key, l2Vault, bridgeStarknetAddress, apiKeys) {
        super();
        this.id = id;
        this.description = description;
        this.accountIndex = accountIndex;
        this.status = status;
        this.l2Key = l2Key;
        this.l2Vault = l2Vault;
        this.bridgeStarknetAddress = bridgeStarknetAddress;
        this.apiKeys = apiKeys;
    }
}
exports.AccountModel = AccountModel;
/**
 * Account leverage model
 */
class AccountLeverage extends model_1.X10BaseModel {
    market;
    leverage;
    constructor(market, leverage) {
        super();
        this.market = market;
        this.leverage = leverage;
    }
}
exports.AccountLeverage = AccountLeverage;
/**
 * API key response model
 */
class ApiKeyResponseModel extends model_1.X10BaseModel {
    key;
    constructor(key) {
        super();
        this.key = key;
    }
}
exports.ApiKeyResponseModel = ApiKeyResponseModel;
/**
 * API key request model
 */
class ApiKeyRequestModel extends model_1.X10BaseModel {
    description;
    constructor(description) {
        super();
        this.description = description;
    }
}
exports.ApiKeyRequestModel = ApiKeyRequestModel;
/**
 * Balance model
 */
class BalanceModel extends model_1.X10BaseModel {
    collateralName;
    balance;
    equity;
    availableForTrade;
    availableForWithdrawal;
    unrealisedPnl;
    initialMargin;
    marginRatio;
    updatedTime;
}
exports.BalanceModel = BalanceModel;
/**
 * Account stream data model
 */
class AccountStreamDataModel extends model_1.X10BaseModel {
    orders;
    positions;
    trades;
    balance;
}
exports.AccountStreamDataModel = AccountStreamDataModel;
//# sourceMappingURL=accounts.js.map