/**
 * Account models and StarkPerpetualAccount class
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { isHexString } from '../utils/string';
import { sign as wasmSign } from './crypto/signer';
import { CustomStarkSigner, isCustomStarkSigner } from './custom-signer';

/**
 * Stark Perpetual Account
 * Manages signing operations for trading
 * 
 * Supports two modes of operation:
 * 1. Direct signing with a private key (default)
 * 2. Custom signer integration (e.g., Privy, Web3Auth)
 */
export class StarkPerpetualAccount {
  private vault: number;
  private privateKey?: bigint;
  private publicKey: bigint;
  private apiKey: string;
  private tradingFee: Map<string, any> = new Map();
  private customSigner?: CustomStarkSigner;

  constructor(vault: number | string, privateKey: string, publicKey: string, apiKey: string) {
    if (!isHexString(privateKey)) {
      throw new Error('Invalid private key format');
    }
    if (!isHexString(publicKey)) {
      throw new Error('Invalid public key format');
    }

    if (typeof vault === 'string') {
      this.vault = parseInt(vault, 10);
    } else {
      this.vault = vault;
    }

    // Remove '0x' prefix if present and convert to bigint
    const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const cleanPublicKey = publicKey.startsWith('0x') ? publicKey.slice(2) : publicKey;
    
    this.privateKey = BigInt('0x' + cleanPrivateKey);
    this.publicKey = BigInt('0x' + cleanPublicKey);
    this.apiKey = apiKey;
  }

  getVault(): number {
    return this.vault;
  }

  getPublicKey(): bigint {
    return this.publicKey;
  }

  getPublicKeyHex(): string {
    return '0x' + this.publicKey.toString(16);
  }

  getApiKey(): string {
    return this.apiKey;
  }

  getTradingFee(): Map<string, any> {
    return this.tradingFee;
  }

  setTradingFee(market: string, fee: any): void {
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
  setCustomSigner(signer: CustomStarkSigner): void {
    if (!isCustomStarkSigner(signer)) {
      throw new Error('Invalid custom signer: must implement CustomStarkSigner interface');
    }
    this.customSigner = signer;
  }

  /**
   * Get the custom signer if set
   */
  getCustomSigner(): CustomStarkSigner | undefined {
    return this.customSigner;
  }

  /**
   * Clear the custom signer and use direct signing
   */
  clearCustomSigner(): void {
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
  async sign(msgHash: bigint): Promise<[bigint, bigint]> {
    if (this.customSigner) {
      return this.customSigner.sign(msgHash);
    }
    
    if (!this.privateKey) {
      throw new Error('No private key or custom signer available for signing');
    }
    
    // Wrap synchronous WASM sign in Promise for consistent API
    return Promise.resolve(wasmSign(this.privateKey, msgHash));
  }
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
export function createStarkPerpetualAccountWithCustomSigner(
  vault: number | string,
  publicKey: string,
  apiKey: string,
  customSigner: CustomStarkSigner
): StarkPerpetualAccount {
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
export class AccountModel extends X10BaseModel {
  id: number;
  description: string;
  accountIndex: number;
  status: string;
  l2Key: string;
  l2Vault: number;
  bridgeStarknetAddress?: string;
  apiKeys?: string[];

  constructor(
    id: number,
    description: string,
    accountIndex: number,
    status: string,
    l2Key: string,
    l2Vault: number,
    bridgeStarknetAddress?: string,
    apiKeys?: string[]
  ) {
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

/**
 * Account leverage model
 */
export class AccountLeverage extends X10BaseModel {
  market: string;
  leverage: Decimal;

  constructor(market: string, leverage: Decimal) {
    super();
    this.market = market;
    this.leverage = leverage;
  }
}

/**
 * API key response model
 */
export class ApiKeyResponseModel extends X10BaseModel {
  key: string;

  constructor(key: string) {
    super();
    this.key = key;
  }
}

/**
 * API key request model
 */
export class ApiKeyRequestModel extends X10BaseModel {
  description: string;

  constructor(description: string) {
    super();
    this.description = description;
  }
}

/**
 * Balance model
 */
export class BalanceModel extends X10BaseModel {
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
export class AccountStreamDataModel extends X10BaseModel {
  orders?: any[];
  positions?: any[];
  trades?: any[];
  balance?: BalanceModel;
}

