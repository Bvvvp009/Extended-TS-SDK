/**
 * Asset models and utilities
 */
import Decimal from 'decimal.js';
import { X10BaseModel, HexValue } from '../utils/model';
/**
 * Asset model
 */
export declare class Asset {
    id: number;
    name: string;
    precision: number;
    active: boolean;
    isCollateral: boolean;
    settlementExternalId: string;
    settlementResolution: number;
    l1ExternalId: string;
    l1Resolution: number;
    constructor(id: number, name: string, precision: number, active: boolean, isCollateral: boolean, settlementExternalId: string, settlementResolution: number, l1ExternalId: string, l1Resolution: number);
    /**
     * Convert human-readable amount to Stark quantity
     */
    convertHumanReadableToStarkQuantity(internal: Decimal, roundingContext: Decimal.Constructor): number;
    /**
     * Convert Stark quantity to internal quantity
     */
    convertStarkToInternalQuantity(stark: number): Decimal;
    /**
     * Convert L1 quantity to internal quantity
     */
    convertL1QuantityToInternalQuantity(l1: number): Decimal;
    /**
     * Convert internal quantity to L1 quantity
     */
    convertInternalQuantityToL1Quantity(internal: Decimal): number;
}
/**
 * Asset operation type
 */
export declare enum AssetOperationType {
    CLAIM = "CLAIM",
    DEPOSIT = "DEPOSIT",
    FAST_WITHDRAWAL = "FAST_WITHDRAWAL",
    SLOW_WITHDRAWAL = "SLOW_WITHDRAWAL",
    TRANSFER = "TRANSFER"
}
/**
 * Asset operation status
 */
export declare enum AssetOperationStatus {
    UNKNOWN = "UNKNOWN",
    CREATED = "CREATED",
    IN_PROGRESS = "IN_PROGRESS",
    REJECTED = "REJECTED",
    READY_FOR_CLAIM = "READY_FOR_CLAIM",
    COMPLETED = "COMPLETED"
}
/**
 * Asset operation model
 */
export declare class AssetOperationModel extends X10BaseModel {
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
    constructor(id: string, type: AssetOperationType, status: AssetOperationStatus, amount: Decimal, fee: Decimal, asset: number, time: number, accountId: number, counterpartyAccountId?: number, transactionHash?: HexValue);
}
//# sourceMappingURL=assets.d.ts.map