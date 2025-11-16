/**
 * Withdrawal models
 */

import Decimal from 'decimal.js';
import { X10BaseModel, HexValue } from '../utils/model';
import { SettlementSignatureModel } from '../utils/model';

/**
 * Timestamp model
 */
export class Timestamp extends X10BaseModel {
  seconds: number;

  constructor(seconds: number) {
    super();
    this.seconds = seconds;
  }
}

/**
 * Stark withdrawal settlement
 */
export class StarkWithdrawalSettlement extends X10BaseModel {
  recipient: HexValue;
  positionId: number;
  collateralId: HexValue;
  amount: number;
  expiration: Timestamp;
  salt: number;
  signature: SettlementSignatureModel;

  constructor(
    recipient: HexValue,
    positionId: number,
    collateralId: HexValue,
    amount: number,
    expiration: Timestamp,
    salt: number,
    signature: SettlementSignatureModel
  ) {
    super();
    this.recipient = recipient;
    this.positionId = positionId;
    this.collateralId = collateralId;
    this.amount = amount;
    this.expiration = expiration;
    this.salt = salt;
    this.signature = signature;
  }
}

/**
 * Withdrawal request model
 */
export class WithdrawalRequest extends X10BaseModel {
  accountId: number;
  amount: Decimal;
  description?: string;
  settlement: StarkWithdrawalSettlement;
  chainId: string;
  quoteId?: string;
  asset: string;

  constructor(
    accountId: number,
    amount: Decimal,
    settlement: StarkWithdrawalSettlement,
    chainId: string,
    asset: string,
    description?: string,
    quoteId?: string
  ) {
    super();
    this.accountId = accountId;
    this.amount = amount;
    this.description = description;
    this.settlement = settlement;
    this.chainId = chainId;
    this.quoteId = quoteId;
    this.asset = asset;
  }
}







