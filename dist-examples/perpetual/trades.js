"use strict";
/**
 * Trade models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountTradeModel = exports.PublicTradeModel = exports.TradeType = void 0;
const model_1 = require("../utils/model");
/**
 * Trade type
 */
var TradeType;
(function (TradeType) {
    TradeType["TRADE"] = "TRADE";
    TradeType["LIQUIDATION"] = "LIQUIDATION";
    TradeType["DELEVERAGE"] = "DELEVERAGE";
})(TradeType || (exports.TradeType = TradeType = {}));
/**
 * Public trade model
 */
class PublicTradeModel extends model_1.X10BaseModel {
    id;
    market;
    side;
    tradeType;
    timestamp;
    price;
    qty;
}
exports.PublicTradeModel = PublicTradeModel;
/**
 * Account trade model
 */
class AccountTradeModel extends model_1.X10BaseModel {
    id;
    accountId;
    market;
    orderId;
    side;
    price;
    qty;
    value;
    fee;
    isTaker;
    tradeType;
    createdTime;
}
exports.AccountTradeModel = AccountTradeModel;
//# sourceMappingURL=trades.js.map