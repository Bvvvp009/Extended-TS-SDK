"use strict";
/**
 * Asset models and utilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetOperationModel = exports.AssetOperationStatus = exports.AssetOperationType = exports.Asset = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const model_1 = require("../utils/model");
/**
 * Asset model
 */
class Asset {
    id;
    name;
    precision;
    active;
    isCollateral;
    settlementExternalId;
    settlementResolution;
    l1ExternalId;
    l1Resolution;
    constructor(id, name, precision, active, isCollateral, settlementExternalId, settlementResolution, l1ExternalId, l1Resolution) {
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
    convertHumanReadableToStarkQuantity(internal, roundingContext) {
        const result = internal.mul(this.settlementResolution);
        // Round according to context
        return Math.round(result.toNumber());
    }
    /**
     * Convert Stark quantity to internal quantity
     */
    convertStarkToInternalQuantity(stark) {
        return new decimal_js_1.default(stark).div(this.settlementResolution);
    }
    /**
     * Convert L1 quantity to internal quantity
     */
    convertL1QuantityToInternalQuantity(l1) {
        return new decimal_js_1.default(l1).div(this.l1Resolution);
    }
    /**
     * Convert internal quantity to L1 quantity
     */
    convertInternalQuantityToL1Quantity(internal) {
        if (!this.isCollateral) {
            throw new Error('Only collateral assets have an L1 representation');
        }
        return Math.round(internal.mul(this.l1Resolution).toNumber());
    }
}
exports.Asset = Asset;
/**
 * Asset operation type
 */
var AssetOperationType;
(function (AssetOperationType) {
    AssetOperationType["CLAIM"] = "CLAIM";
    AssetOperationType["DEPOSIT"] = "DEPOSIT";
    AssetOperationType["FAST_WITHDRAWAL"] = "FAST_WITHDRAWAL";
    AssetOperationType["SLOW_WITHDRAWAL"] = "SLOW_WITHDRAWAL";
    AssetOperationType["TRANSFER"] = "TRANSFER";
})(AssetOperationType || (exports.AssetOperationType = AssetOperationType = {}));
/**
 * Asset operation status
 */
var AssetOperationStatus;
(function (AssetOperationStatus) {
    AssetOperationStatus["UNKNOWN"] = "UNKNOWN";
    AssetOperationStatus["CREATED"] = "CREATED";
    AssetOperationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AssetOperationStatus["REJECTED"] = "REJECTED";
    AssetOperationStatus["READY_FOR_CLAIM"] = "READY_FOR_CLAIM";
    AssetOperationStatus["COMPLETED"] = "COMPLETED";
})(AssetOperationStatus || (exports.AssetOperationStatus = AssetOperationStatus = {}));
/**
 * Asset operation model
 */
class AssetOperationModel extends model_1.X10BaseModel {
    id;
    type;
    status;
    amount;
    fee;
    asset;
    time;
    accountId;
    counterpartyAccountId;
    transactionHash;
    constructor(id, type, status, amount, fee, asset, time, accountId, counterpartyAccountId, transactionHash) {
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
exports.AssetOperationModel = AssetOperationModel;
//# sourceMappingURL=assets.js.map