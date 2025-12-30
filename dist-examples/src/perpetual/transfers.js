"use strict";
/**
 * Transfer models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferResponseModel = exports.OnChainPerpetualTransferModel = exports.PerpetualTransferModel = exports.StarkTransferSettlement = void 0;
const model_1 = require("../utils/model");
/**
 * Stark transfer settlement
 */
class StarkTransferSettlement extends model_1.X10BaseModel {
    amount;
    assetId;
    expirationTimestamp;
    nonce;
    receiverPositionId;
    receiverPublicKey;
    senderPositionId;
    senderPublicKey;
    signature;
    constructor(amount, assetId, expirationTimestamp, nonce, receiverPositionId, receiverPublicKey, senderPositionId, senderPublicKey, signature) {
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
exports.StarkTransferSettlement = StarkTransferSettlement;
/**
 * Perpetual transfer model
 */
class PerpetualTransferModel extends model_1.X10BaseModel {
    fromAccount;
    toAccount;
    amount;
    transferredAsset;
    settlement;
    constructor(fromAccount, toAccount, amount, transferredAsset, settlement) {
        super();
        this.fromAccount = fromAccount;
        this.toAccount = toAccount;
        this.amount = amount;
        this.transferredAsset = transferredAsset;
        this.settlement = settlement;
    }
}
exports.PerpetualTransferModel = PerpetualTransferModel;
/**
 * On-chain perpetual transfer model
 */
class OnChainPerpetualTransferModel extends model_1.X10BaseModel {
    fromVault;
    toVault;
    amount;
    settlement;
    transferredAsset;
    constructor(fromVault, toVault, amount, settlement, transferredAsset) {
        super();
        this.fromVault = fromVault;
        this.toVault = toVault;
        this.amount = amount;
        this.settlement = settlement;
        this.transferredAsset = transferredAsset;
    }
}
exports.OnChainPerpetualTransferModel = OnChainPerpetualTransferModel;
/**
 * Transfer response model
 */
class TransferResponseModel extends model_1.X10BaseModel {
    validSignature;
    id;
    hashCalculated;
    starkExRepresentation;
    constructor(validSignature, id, hashCalculated, starkExRepresentation) {
        super();
        this.validSignature = validSignature;
        this.id = id;
        this.hashCalculated = hashCalculated;
        this.starkExRepresentation = starkExRepresentation;
    }
}
exports.TransferResponseModel = TransferResponseModel;
//# sourceMappingURL=transfers.js.map