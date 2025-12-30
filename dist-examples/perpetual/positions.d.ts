/**
 * Position models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
/**
 * Exit type
 */
export declare enum ExitType {
    TRADE = "TRADE",
    LIQUIDATION = "LIQUIDATION",
    ADL = "ADL"
}
/**
 * Position side
 */
export declare enum PositionSide {
    LONG = "LONG",
    SHORT = "SHORT"
}
/**
 * Position status
 */
export declare enum PositionStatus {
    OPENED = "OPENED",
    CLOSED = "CLOSED"
}
/**
 * Position model
 */
export declare class PositionModel extends X10BaseModel {
    id: number;
    accountId: number;
    market: string;
    status: PositionStatus;
    side: PositionSide;
    leverage: Decimal;
    size: Decimal;
    value: Decimal;
    openPrice: Decimal;
    markPrice: Decimal;
    liquidationPrice?: Decimal;
    unrealisedPnl: Decimal;
    realisedPnl: Decimal;
    tpPrice?: Decimal;
    slPrice?: Decimal;
    adl?: number;
    createdAt: number;
    updatedAt: number;
}
/**
 * Realised PnL breakdown model
 */
export declare class RealisedPnlBreakdownModel extends X10BaseModel {
    tradePnl: Decimal;
    fundingFees: Decimal;
    openFees: Decimal;
    closeFees: Decimal;
    constructor(tradePnl: Decimal, fundingFees: Decimal, openFees: Decimal, closeFees: Decimal);
}
/**
 * Position history model
 */
export declare class PositionHistoryModel extends X10BaseModel {
    id: number;
    accountId: number;
    market: string;
    side: PositionSide;
    size: Decimal;
    maxPositionSize: Decimal;
    leverage: Decimal;
    openPrice: Decimal;
    exitPrice?: Decimal;
    realisedPnl: Decimal;
    realisedPnlBreakdown: RealisedPnlBreakdownModel;
    createdTime: number;
    exitType?: ExitType;
    closedTime?: number;
}
//# sourceMappingURL=positions.d.ts.map