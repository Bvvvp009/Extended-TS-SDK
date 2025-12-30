"use strict";
/**
 * Order types and models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacedOrderModel = exports.OpenOrderModel = exports.NewOrderModel = exports.CreateOrderTpslTriggerModel = exports.StarkDebuggingOrderAmountsModel = exports.StarkSettlementModel = exports.SelfTradeProtectionLevel = exports.OrderPriceType = exports.OrderTriggerDirection = exports.OrderTriggerPriceType = exports.OrderStatusReason = exports.OrderStatus = exports.OrderTpslType = exports.OrderType = exports.OrderSide = exports.TimeInForce = void 0;
const model_1 = require("../utils/model");
/**
 * Time in force
 */
var TimeInForce;
(function (TimeInForce) {
    TimeInForce["GTT"] = "GTT";
    TimeInForce["IOC"] = "IOC";
    TimeInForce["FOK"] = "FOK";
})(TimeInForce || (exports.TimeInForce = TimeInForce = {}));
/**
 * Order side
 */
var OrderSide;
(function (OrderSide) {
    OrderSide["BUY"] = "BUY";
    OrderSide["SELL"] = "SELL";
})(OrderSide || (exports.OrderSide = OrderSide = {}));
/**
 * Order type
 */
var OrderType;
(function (OrderType) {
    OrderType["LIMIT"] = "LIMIT";
    OrderType["CONDITIONAL"] = "CONDITIONAL";
    OrderType["MARKET"] = "MARKET";
    OrderType["TPSL"] = "TPSL";
})(OrderType || (exports.OrderType = OrderType = {}));
/**
 * Order TPSL type
 */
var OrderTpslType;
(function (OrderTpslType) {
    OrderTpslType["ORDER"] = "ORDER";
    OrderTpslType["POSITION"] = "POSITION";
})(OrderTpslType || (exports.OrderTpslType = OrderTpslType = {}));
/**
 * Order status
 */
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["UNKNOWN"] = "UNKNOWN";
    OrderStatus["NEW"] = "NEW";
    OrderStatus["UNTRIGGERED"] = "UNTRIGGERED";
    OrderStatus["PARTIALLY_FILLED"] = "PARTIALLY_FILLED";
    OrderStatus["FILLED"] = "FILLED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["EXPIRED"] = "EXPIRED";
    OrderStatus["REJECTED"] = "REJECTED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
/**
 * Order status reason
 */
var OrderStatusReason;
(function (OrderStatusReason) {
    OrderStatusReason["UNKNOWN"] = "UNKNOWN";
    OrderStatusReason["NONE"] = "NONE";
    OrderStatusReason["UNKNOWN_MARKET"] = "UNKNOWN_MARKET";
    OrderStatusReason["DISABLED_MARKET"] = "DISABLED_MARKET";
    OrderStatusReason["NOT_ENOUGH_FUNDS"] = "NOT_ENOUGH_FUNDS";
    OrderStatusReason["NO_LIQUIDITY"] = "NO_LIQUIDITY";
    OrderStatusReason["INVALID_FEE"] = "INVALID_FEE";
    OrderStatusReason["INVALID_QTY"] = "INVALID_QTY";
    OrderStatusReason["INVALID_PRICE"] = "INVALID_PRICE";
    OrderStatusReason["INVALID_VALUE"] = "INVALID_VALUE";
    OrderStatusReason["UNKNOWN_ACCOUNT"] = "UNKNOWN_ACCOUNT";
    OrderStatusReason["SELF_TRADE_PROTECTION"] = "SELF_TRADE_PROTECTION";
    OrderStatusReason["POST_ONLY_FAILED"] = "POST_ONLY_FAILED";
    OrderStatusReason["REDUCE_ONLY_FAILED"] = "REDUCE_ONLY_FAILED";
    OrderStatusReason["INVALID_EXPIRE_TIME"] = "INVALID_EXPIRE_TIME";
    OrderStatusReason["POSITION_TPSL_CONFLICT"] = "POSITION_TPSL_CONFLICT";
    OrderStatusReason["INVALID_LEVERAGE"] = "INVALID_LEVERAGE";
    OrderStatusReason["PREV_ORDER_NOT_FOUND"] = "PREV_ORDER_NOT_FOUND";
    OrderStatusReason["PREV_ORDER_TRIGGERED"] = "PREV_ORDER_TRIGGERED";
    OrderStatusReason["TPSL_OTHER_SIDE_FILLED"] = "TPSL_OTHER_SIDE_FILLED";
    OrderStatusReason["PREV_ORDER_CONFLICT"] = "PREV_ORDER_CONFLICT";
    OrderStatusReason["ORDER_REPLACED"] = "ORDER_REPLACED";
    OrderStatusReason["POST_ONLY_MODE"] = "POST_ONLY_MODE";
    OrderStatusReason["REDUCE_ONLY_MODE"] = "REDUCE_ONLY_MODE";
    OrderStatusReason["TRADING_OFF_MODE"] = "TRADING_OFF_MODE";
})(OrderStatusReason || (exports.OrderStatusReason = OrderStatusReason = {}));
/**
 * Order trigger price type
 */
var OrderTriggerPriceType;
(function (OrderTriggerPriceType) {
    OrderTriggerPriceType["UNKNOWN"] = "UNKNOWN";
    OrderTriggerPriceType["MARK"] = "MARK";
    OrderTriggerPriceType["INDEX"] = "INDEX";
    OrderTriggerPriceType["LAST"] = "LAST";
})(OrderTriggerPriceType || (exports.OrderTriggerPriceType = OrderTriggerPriceType = {}));
/**
 * Order trigger direction
 */
var OrderTriggerDirection;
(function (OrderTriggerDirection) {
    OrderTriggerDirection["UNKNOWN"] = "UNKNOWN";
    OrderTriggerDirection["UP"] = "UP";
    OrderTriggerDirection["DOWN"] = "DOWN";
})(OrderTriggerDirection || (exports.OrderTriggerDirection = OrderTriggerDirection = {}));
/**
 * Order price type
 */
var OrderPriceType;
(function (OrderPriceType) {
    OrderPriceType["UNKNOWN"] = "UNKNOWN";
    OrderPriceType["MARKET"] = "MARKET";
    OrderPriceType["LIMIT"] = "LIMIT";
})(OrderPriceType || (exports.OrderPriceType = OrderPriceType = {}));
/**
 * Self trade protection level
 */
var SelfTradeProtectionLevel;
(function (SelfTradeProtectionLevel) {
    SelfTradeProtectionLevel["NONE"] = "NONE";
    SelfTradeProtectionLevel["MARKET"] = "MARKET";
    SelfTradeProtectionLevel["ACCOUNT"] = "ACCOUNT";
})(SelfTradeProtectionLevel || (exports.SelfTradeProtectionLevel = SelfTradeProtectionLevel = {}));
/**
 * Settlement model
 */
class StarkSettlementModel extends model_1.X10BaseModel {
    signature;
    starkKey;
    collateralPosition;
    constructor(signature, starkKey, collateralPosition) {
        super();
        this.signature = signature;
        this.starkKey = starkKey;
        this.collateralPosition = collateralPosition;
    }
}
exports.StarkSettlementModel = StarkSettlementModel;
/**
 * Debugging order amounts model
 */
class StarkDebuggingOrderAmountsModel extends model_1.X10BaseModel {
    collateralAmount;
    feeAmount;
    syntheticAmount;
    constructor(collateralAmount, feeAmount, syntheticAmount) {
        super();
        this.collateralAmount = collateralAmount;
        this.feeAmount = feeAmount;
        this.syntheticAmount = syntheticAmount;
    }
}
exports.StarkDebuggingOrderAmountsModel = StarkDebuggingOrderAmountsModel;
/**
 * Order TPSL trigger model
 */
class CreateOrderTpslTriggerModel extends model_1.X10BaseModel {
    triggerPrice;
    triggerPriceType;
    price;
    priceType;
    settlement;
    debuggingAmounts;
    constructor(triggerPrice, triggerPriceType, price, priceType, settlement, debuggingAmounts) {
        super();
        this.triggerPrice = triggerPrice;
        this.triggerPriceType = triggerPriceType;
        this.price = price;
        this.priceType = priceType;
        this.settlement = settlement;
        this.debuggingAmounts = debuggingAmounts;
    }
}
exports.CreateOrderTpslTriggerModel = CreateOrderTpslTriggerModel;
/**
 * New order model
 */
class NewOrderModel extends model_1.X10BaseModel {
    id;
    market;
    type;
    side;
    qty;
    price;
    postOnly;
    timeInForce;
    expiryEpochMillis;
    fee;
    selfTradeProtectionLevel;
    nonce;
    cancelId;
    settlement;
    tpSlType;
    takeProfit;
    stopLoss;
    debuggingAmounts;
    builderFee;
    builderId;
    reduceOnly;
    constructor(id, market, type, side, qty, price, postOnly, timeInForce, expiryEpochMillis, fee, selfTradeProtectionLevel, nonce, settlement, debuggingAmounts, reduceOnly, cancelId, tpSlType, takeProfit, stopLoss, builderFee, builderId) {
        super();
        this.id = id;
        this.market = market;
        this.type = type;
        this.side = side;
        this.qty = qty;
        this.price = price;
        this.postOnly = postOnly;
        this.timeInForce = timeInForce;
        this.expiryEpochMillis = expiryEpochMillis;
        this.fee = fee;
        this.selfTradeProtectionLevel = selfTradeProtectionLevel;
        this.nonce = nonce;
        this.cancelId = cancelId;
        this.settlement = settlement;
        this.tpSlType = tpSlType;
        this.takeProfit = takeProfit;
        this.stopLoss = stopLoss;
        this.debuggingAmounts = debuggingAmounts;
        this.builderFee = builderFee;
        this.builderId = builderId;
        this.reduceOnly = reduceOnly;
    }
}
exports.NewOrderModel = NewOrderModel;
/**
 * Open order model
 */
class OpenOrderModel extends model_1.X10BaseModel {
    id;
    accountId;
    externalId;
    market;
    type;
    side;
    status;
    statusReason;
    price;
    averagePrice;
    qty;
    filledQty;
    reduceOnly;
    postOnly;
    createdTime;
    updatedTime;
    expiryTime;
}
exports.OpenOrderModel = OpenOrderModel;
/**
 * Placed order model
 */
class PlacedOrderModel extends model_1.X10BaseModel {
    id;
    market;
    type;
    side;
    status;
    price;
    qty;
    postOnly;
    createdTime;
    updatedTime;
}
exports.PlacedOrderModel = PlacedOrderModel;
//# sourceMappingURL=orders.js.map