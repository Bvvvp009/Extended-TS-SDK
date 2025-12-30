"use strict";
/**
 * Order object creation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderTpslTriggerParam = void 0;
exports.createOrderObject = createOrderObject;
const decimal_js_1 = __importDefault(require("decimal.js"));
const orders_1 = require("./orders");
const order_object_settlement_1 = require("./order-object-settlement");
const nonce_1 = require("../utils/nonce");
const date_1 = require("../utils/date");
const fees_1 = require("./fees");
/**
 * Order TPSL trigger parameter
 */
class OrderTpslTriggerParam {
    triggerPrice;
    triggerPriceType;
    price;
    priceType;
    constructor(triggerPrice, triggerPriceType, price, priceType) {
        this.triggerPrice = triggerPrice;
        this.triggerPriceType = triggerPriceType;
        this.price = price;
        this.priceType = priceType;
    }
}
exports.OrderTpslTriggerParam = OrderTpslTriggerParam;
/**
 * Get opposite order side
 */
function getOppositeSide(side) {
    return side === orders_1.OrderSide.BUY ? orders_1.OrderSide.SELL : orders_1.OrderSide.BUY;
}
/**
 * Create order TPSL trigger model
 */
function createOrderTpslTriggerModel(triggerParam, settlementData) {
    return new orders_1.CreateOrderTpslTriggerModel(triggerParam.triggerPrice, triggerParam.triggerPriceType, triggerParam.price, triggerParam.priceType, settlementData.settlement, settlementData.debuggingAmounts);
}
/**
 * Create an order object to be placed on the exchange
 */
async function createOrderObject(account, market, amountOfSynthetic, price, side, starknetDomain, options = {}) {
    const { orderType = orders_1.OrderType.LIMIT, postOnly = false, previousOrderExternalId, expireTime, orderExternalId, timeInForce = orders_1.TimeInForce.GTT, selfTradeProtectionLevel = orders_1.SelfTradeProtectionLevel.ACCOUNT, nonce, builderFee, builderId, reduceOnly = false, tpSlType, takeProfit, stopLoss, } = options;
    let finalExpireTime = expireTime;
    if (!finalExpireTime) {
        finalExpireTime = new Date((0, date_1.utcNow)());
        finalExpireTime.setHours(finalExpireTime.getHours() + 1);
    }
    // Validate side
    if (side !== orders_1.OrderSide.BUY && side !== orders_1.OrderSide.SELL) {
        throw new Error(`Unexpected order side value: ${side}`);
    }
    // Validate time in force
    if (timeInForce === orders_1.TimeInForce.FOK) {
        throw new Error(`Unexpected time in force value: ${timeInForce}`);
    }
    // Validate TPSL
    if (tpSlType === orders_1.OrderTpslType.POSITION) {
        throw new Error('`POSITION` TPSL type is not supported yet');
    }
    if ((takeProfit && takeProfit.priceType === orders_1.OrderPriceType.MARKET) ||
        (stopLoss && stopLoss.priceType === orders_1.OrderPriceType.MARKET)) {
        throw new Error('TPSL `MARKET` price type is not supported yet');
    }
    const finalNonce = nonce || (0, nonce_1.generateNonce)();
    const fees = account.getTradingFee().get(market.name) || fees_1.DEFAULT_FEES;
    const feeRate = fees.takerFeeRate;
    const settlementDataCtx = new order_object_settlement_1.SettlementDataCtx(market, fees, finalNonce, account.getVault(), finalExpireTime, (msgHash) => account.sign(msgHash), account.getPublicKey(), starknetDomain, builderFee);
    const settlementData = await (0, order_object_settlement_1.createOrderSettlementData)(side, amountOfSynthetic, price, settlementDataCtx);
    let tpTriggerModel;
    if (takeProfit) {
        const tpSettlementData = await (0, order_object_settlement_1.createOrderSettlementData)(getOppositeSide(side), amountOfSynthetic, takeProfit.price, settlementDataCtx);
        tpTriggerModel = createOrderTpslTriggerModel(takeProfit, tpSettlementData);
    }
    let slTriggerModel;
    if (stopLoss) {
        const slSettlementData = await (0, order_object_settlement_1.createOrderSettlementData)(getOppositeSide(side), amountOfSynthetic, stopLoss.price, settlementDataCtx);
        slTriggerModel = createOrderTpslTriggerModel(stopLoss, slSettlementData);
    }
    const orderId = orderExternalId || settlementData.orderHash.toString();
    const order = new orders_1.NewOrderModel(orderId, market.name, orderType, side, settlementData.syntheticAmountHuman.value, price, postOnly, timeInForce, (0, date_1.toEpochMillis)(finalExpireTime), feeRate, selfTradeProtectionLevel, new decimal_js_1.default(finalNonce), settlementData.settlement, settlementData.debuggingAmounts, reduceOnly, previousOrderExternalId, tpSlType, tpTriggerModel, slTriggerModel, builderFee, builderId);
    return order;
}
//# sourceMappingURL=order-object.js.map