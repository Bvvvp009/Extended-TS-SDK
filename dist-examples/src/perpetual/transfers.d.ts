/**
 * Transfer models
 */
import Decimal from 'decimal.js';
import { X10BaseModel, HexValue } from '../utils/model';
import { SettlementSignatureModel } from '../utils/model';
/**
 * Stark transfer settlement
 */
export declare class StarkTransferSettlement extends X10BaseModel {
    amount: number;
    assetId: HexValue;
    expirationTimestamp: number;
    nonce: number;
    receiverPositionId: number;
    receiverPublicKey: HexValue;
    senderPositionId: number;
    senderPublicKey: HexValue;
    signature: SettlementSignatureModel;
    constructor(amount: number, assetId: HexValue, expirationTimestamp: number, nonce: number, receiverPositionId: number, receiverPublicKey: HexValue, senderPositionId: number, senderPublicKey: HexValue, signature: SettlementSignatureModel);
}
/**
 * Perpetual transfer model
 */
export declare class PerpetualTransferModel extends X10BaseModel {
    fromAccount: number;
    toAccount: number;
    amount: Decimal;
    transferredAsset: string;
    settlement: StarkTransferSettlement;
    constructor(fromAccount: number, toAccount: number, amount: Decimal, transferredAsset: string, settlement: StarkTransferSettlement);
}
/**
 * On-chain perpetual transfer model
 */
export declare class OnChainPerpetualTransferModel extends X10BaseModel {
    fromVault: number;
    toVault: number;
    amount: Decimal;
    settlement: StarkTransferSettlement;
    transferredAsset: string;
    constructor(fromVault: number, toVault: number, amount: Decimal, settlement: StarkTransferSettlement, transferredAsset: string);
}
/**
 * Transfer response model
 */
export declare class TransferResponseModel extends X10BaseModel {
    validSignature: boolean;
    id?: number;
    hashCalculated?: string;
    starkExRepresentation?: Record<string, any>;
    constructor(validSignature: boolean, id?: number, hashCalculated?: string, starkExRepresentation?: Record<string, any>);
}
//# sourceMappingURL=transfers.d.ts.map