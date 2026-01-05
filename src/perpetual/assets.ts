/**
 * Asset models and utilities
 */

import Decimal from 'decimal.js';
import { X10BaseModel, HexValue } from '../utils/model.js';

/**
 * Asset model
 */
export class Asset {
  id: number;
  name: string;
  precision: number;
  active: boolean;
  isCollateral: boolean;
  settlementExternalId: string;
  settlementResolution: number;
  l1ExternalId: string;
  l1Resolution: number;

  constructor(
    id: number,
    name: string,
    precision: number,
    active: boolean,
    isCollateral: boolean,
    settlementExternalId: string,
    settlementResolution: number,
    l1ExternalId: string,
    l1Resolution: number
  ) {
    this.id = id;
    this.name = name;
    this.precision = precision;
    this.active = active;
    this.isCollateral = isCollateral;
    this.settlementExternalId = settlementExternalId;
    this.settlementResolution = settlementResolution;
    this.l1ExternalId = l1ExternalId;
    this.l1Resolution = l1Resolution;
  }

  /**
   * Convert human-readable amount to Stark quantity
   */
  convertHumanReadableToStarkQuantity(
    internal: Decimal,
    _roundingContext: Decimal.Constructor
  ): number {
    const result = internal.mul(this.settlementResolution);
    // Round according to context
    return Math.round(result.toNumber());
  }

  /**
   * Convert Stark quantity to internal quantity
   */
  convertStarkToInternalQuantity(stark: number): Decimal {
    return new Decimal(stark).div(this.settlementResolution);
  }

  /**
   * Convert L1 quantity to internal quantity
   */
  convertL1QuantityToInternalQuantity(l1: number): Decimal {
    return new Decimal(l1).div(this.l1Resolution);
  }

  /**
   * Convert internal quantity to L1 quantity
   */
  convertInternalQuantityToL1Quantity(internal: Decimal): number {
    if (!this.isCollateral) {
      throw new Error('Only collateral assets have an L1 representation');
    }
    return Math.round(internal.mul(this.l1Resolution).toNumber());
  }
}

/**
 * Asset operation type
 */
export enum AssetOperationType {
  CLAIM = 'CLAIM',
  DEPOSIT = 'DEPOSIT',
  FAST_WITHDRAWAL = 'FAST_WITHDRAWAL',
  SLOW_WITHDRAWAL = 'SLOW_WITHDRAWAL',
  TRANSFER = 'TRANSFER',
}

/**
 * Asset operation status
 */
export enum AssetOperationStatus {
  UNKNOWN = 'UNKNOWN',
  CREATED = 'CREATED',
  IN_PROGRESS = 'IN_PROGRESS',
  REJECTED = 'REJECTED',
  READY_FOR_CLAIM = 'READY_FOR_CLAIM',
  COMPLETED = 'COMPLETED',
}

/**
 * Asset operation model
 */
export class AssetOperationModel extends X10BaseModel {
  id: string;
  type: AssetOperationType;
  status: AssetOperationStatus;
  amount: Decimal;
  fee: Decimal;
  asset: number;
  time: number;
  accountId: number;
  counterpartyAccountId?: number;
  transactionHash?: HexValue;

  constructor(
    id: string,
    type: AssetOperationType,
    status: AssetOperationStatus,
    amount: Decimal,
    fee: Decimal,
    asset: number,
    time: number,
    accountId: number,
    counterpartyAccountId?: number,
    transactionHash?: HexValue
  ) {
    super();
    this.id = id;
    this.type = type;
    this.status = status;
    this.amount = amount;
    this.fee = fee;
    this.asset = asset;
    this.time = time;
    this.accountId = accountId;
    this.counterpartyAccountId = counterpartyAccountId;
    this.transactionHash = transactionHash;
  }
}










