/**
 * Account models and StarkPerpetualAccount class
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { isHexString } from '../utils/string';
import { sign as wasmSign } from './crypto/signer';

/**
 * Stark Perpetual Account
 * Manages signing operations for trading
 */
export class StarkPerpetualAccount {
  private vault: number;
  private privateKey: bigint;
  private publicKey: bigint;
  private apiKey: string;
  private tradingFee: Map<string, any> = new Map();

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
   * Sign a message hash
   * Returns [r, s] tuple
   */
  sign(msgHash: bigint): [bigint, bigint] {
    return wasmSign(this.privateKey, msgHash);
  }
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

