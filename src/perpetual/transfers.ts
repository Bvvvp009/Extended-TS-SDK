/**
 * Transfer models
 */

import Decimal from 'decimal.js';
import { X10BaseModel, HexValue } from '../utils/model.js';
import { SettlementSignatureModel } from '../utils/model.js';

/**
 * Stark transfer settlement
 */
export class StarkTransferSettlement extends X10BaseModel {
  amount: number;
  assetId: HexValue;
  expirationTimestamp: number;
  nonce: number;
  receiverPositionId: number;
  receiverPublicKey: HexValue;
  senderPositionId: number;
  senderPublicKey: HexValue;
  signature: SettlementSignatureModel;

  constructor(
    amount: number,
    assetId: HexValue,
    expirationTimestamp: number,
    nonce: number,
    receiverPositionId: number,
    receiverPublicKey: HexValue,
    senderPositionId: number,
    senderPublicKey: HexValue,
    signature: SettlementSignatureModel
  ) {
    super();
    this.amount = amount;
    this.assetId = assetId;
    this.expirationTimestamp = expirationTimestamp;
    this.nonce = nonce;
    this.receiverPositionId = receiverPositionId;
    this.receiverPublicKey = receiverPublicKey;
    this.senderPositionId = senderPositionId;
    this.senderPublicKey = senderPublicKey;
    this.signature = signature;
  }
}

/**
 * Perpetual transfer model
 */
export class PerpetualTransferModel extends X10BaseModel {
  fromAccount: number;
  toAccount: number;
  amount: Decimal;
  transferredAsset: string;
  settlement: StarkTransferSettlement;

  constructor(
    fromAccount: number,
    toAccount: number,
    amount: Decimal,
    transferredAsset: string,
    settlement: StarkTransferSettlement
  ) {
    super();
    this.fromAccount = fromAccount;
    this.toAccount = toAccount;
    this.amount = amount;
    this.transferredAsset = transferredAsset;
    this.settlement = settlement;
  }
}

/**
 * On-chain perpetual transfer model
 */
export class OnChainPerpetualTransferModel extends X10BaseModel {
  fromVault: number;
  toVault: number;
  amount: Decimal;
  settlement: StarkTransferSettlement;
  transferredAsset: string;

  constructor(
    fromVault: number,
    toVault: number,
    amount: Decimal,
    settlement: StarkTransferSettlement,
    transferredAsset: string
  ) {
    super();
    this.fromVault = fromVault;
    this.toVault = toVault;
    this.amount = amount;
    this.settlement = settlement;
    this.transferredAsset = transferredAsset;
  }
}

/**
 * Transfer response model
 */
export class TransferResponseModel extends X10BaseModel {
  validSignature: boolean;
  id?: number;
  hashCalculated?: string;
  starkExRepresentation?: Record<string, any>;

  constructor(
    validSignature: boolean,
    id?: number,
    hashCalculated?: string,
    starkExRepresentation?: Record<string, any>
  ) {
    super();
    this.validSignature = validSignature;
    this.id = id;
    this.hashCalculated = hashCalculated;
    this.starkExRepresentation = starkExRepresentation;
  }
}










