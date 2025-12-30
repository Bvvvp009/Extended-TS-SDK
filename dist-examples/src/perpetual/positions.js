"use strict";
/**
 * Position models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionHistoryModel = exports.RealisedPnlBreakdownModel = exports.PositionModel = exports.PositionStatus = exports.PositionSide = exports.ExitType = void 0;
const model_1 = require("../utils/model");
/**
 * Exit type
 */
var ExitType;
(function (ExitType) {
    ExitType["TRADE"] = "TRADE";
    ExitType["LIQUIDATION"] = "LIQUIDATION";
    ExitType["ADL"] = "ADL";
})(ExitType || (exports.ExitType = ExitType = {}));
/**
 * Position side
 */
var PositionSide;
(function (PositionSide) {
    PositionSide["LONG"] = "LONG";
    PositionSide["SHORT"] = "SHORT";
})(PositionSide || (exports.PositionSide = PositionSide = {}));
/**
 * Position status
 */
var PositionStatus;
(function (PositionStatus) {
    PositionStatus["OPENED"] = "OPENED";
    PositionStatus["CLOSED"] = "CLOSED";
})(PositionStatus || (exports.PositionStatus = PositionStatus = {}));
/**
 * Position model
 */
class PositionModel extends model_1.X10BaseModel {
    id;
    accountId;
    market;
    status;
    side;
    leverage;
    size;
    value;
    openPrice;
    markPrice;
    liquidationPrice;
    unrealisedPnl;
    realisedPnl;
    tpPrice;
    slPrice;
    adl;
    createdAt;
    updatedAt;
}
exports.PositionModel = PositionModel;
/**
 * Realised PnL breakdown model
 */
class RealisedPnlBreakdownModel extends model_1.X10BaseModel {
    tradePnl;
    fundingFees;
    openFees;
    closeFees;
    constructor(tradePnl, fundingFees, openFees, closeFees) {
        super();
        this.tradePnl = tradePnl;
        this.fundingFees = fundingFees;
        this.openFees = openFees;
        this.closeFees = closeFees;
    }
}
exports.RealisedPnlBreakdownModel = RealisedPnlBreakdownModel;
/**
 * Position history model
 */
class PositionHistoryModel extends model_1.X10BaseModel {
    id;
    accountId;
    market;
    side;
    size;
    maxPositionSize;
    leverage;
    openPrice;
    exitPrice;
    realisedPnl;
    realisedPnlBreakdown;
    createdTime;
    exitType;
    closedTime;
}
exports.PositionHistoryModel = PositionHistoryModel;
//# sourceMappingURL=positions.js.map