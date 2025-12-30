"use strict";
/**
 * Order settlement and hashing logic
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementDataCtx = exports.OrderSettlementData = void 0;
exports.hashOrder = hashOrder;
exports.createOrderSettlementData = createOrderSettlementData;
const decimal_js_1 = __importDefault(require("decimal.js"));
const orders_1 = require("./orders");
const model_1 = require("../utils/model");
const amounts_1 = require("./amounts");
const signer_1 = require("./crypto/signer");
/**
 * Order settlement data
 */
class OrderSettlementData {
    syntheticAmountHuman;
    orderHash;
    settlement;
    debuggingAmounts;
    constructor(syntheticAmountHuman, orderHash, settlement, debuggingAmounts) {
        this.syntheticAmountHuman = syntheticAmountHuman;
        this.orderHash = orderHash;
        this.settlement = settlement;
        this.debuggingAmounts = debuggingAmounts;
    }
}
exports.OrderSettlementData = OrderSettlementData;
/**
 * Settlement data context
 */
class SettlementDataCtx {
    market;
    fees;
    builderFee;
    nonce;
    collateralPositionId;
    expireTime;
    signer;
    publicKey;
    starknetDomain;
    constructor(market, fees, nonce, collateralPositionId, expireTime, signer, publicKey, starknetDomain, builderFee) {
        this.market = market;
        this.fees = fees;
        this.builderFee = builderFee;
        this.nonce = nonce;
        this.collateralPositionId = collateralPositionId;
        this.expireTime = expireTime;
        this.signer = signer;
        this.publicKey = publicKey;
        this.starknetDomain = starknetDomain;
    }
}
exports.SettlementDataCtx = SettlementDataCtx;
/**
 * Calculate settlement expiration (add 14 days buffer)
 */
function calcSettlementExpiration(expirationTimestamp) {
    const expireTimeWithBuffer = new Date(expirationTimestamp);
    expireTimeWithBuffer.setDate(expireTimeWithBuffer.getDate() + 14);
    return Math.ceil(expireTimeWithBuffer.getTime() / 1000);
}
/**
 * Hash an order
 */
function hashOrder(amountSynthetic, amountCollateral, maxFee, nonce, positionId, expirationTimestamp, publicKey, starknetDomain) {
    const syntheticAsset = amountSynthetic.asset;
    const collateralAsset = amountCollateral.asset;
    const baseAssetId = syntheticAsset.settlementExternalId.startsWith('0x')
        ? syntheticAsset.settlementExternalId
        : '0x' + syntheticAsset.settlementExternalId;
    const quoteAssetId = collateralAsset.settlementExternalId.startsWith('0x')
        ? collateralAsset.settlementExternalId
        : '0x' + collateralAsset.settlementExternalId;
    return (0, signer_1.getOrderMsgHash)({
        positionId,
        baseAssetId,
        baseAmount: amountSynthetic.value.toString(),
        quoteAssetId,
        quoteAmount: amountCollateral.value.toString(),
        feeAmount: maxFee.value.toString(),
        feeAssetId: quoteAssetId,
        expiration: calcSettlementExpiration(expirationTimestamp),
        salt: nonce,
        userPublicKey: '0x' + publicKey.toString(16),
        domainName: starknetDomain.name,
        domainVersion: starknetDomain.version,
        domainChainId: starknetDomain.chainId,
        domainRevision: starknetDomain.revision,
    });
}
/**
 * Create order settlement data
 */
async function createOrderSettlementData(side, syntheticAmount, price, ctx) {
    const isBuyingSynthetic = side === orders_1.OrderSide.BUY;
    const roundingContext = isBuyingSynthetic ? amounts_1.ROUNDING_BUY_CONTEXT : amounts_1.ROUNDING_SELL_CONTEXT;
    const syntheticAmountHuman = new amounts_1.HumanReadableAmount(syntheticAmount, ctx.market.syntheticAsset);
    const collateralAmountHuman = new amounts_1.HumanReadableAmount(syntheticAmount.mul(price), ctx.market.collateralAsset);
    const totalFee = ctx.fees.takerFeeRate.plus(ctx.builderFee || new decimal_js_1.default(0));
    const feeAmountHuman = new amounts_1.HumanReadableAmount(totalFee.mul(collateralAmountHuman.value), ctx.market.collateralAsset);
    let starkCollateralAmount = collateralAmountHuman.toStarkAmount(roundingContext);
    let starkSyntheticAmount = syntheticAmountHuman.toStarkAmount(roundingContext);
    const starkFeeAmount = feeAmountHuman.toStarkAmount(amounts_1.ROUNDING_FEE_CONTEXT);
    if (isBuyingSynthetic) {
        starkCollateralAmount = starkCollateralAmount.negate();
    }
    else {
        starkSyntheticAmount = starkSyntheticAmount.negate();
    }
    const debuggingAmounts = new orders_1.StarkDebuggingOrderAmountsModel(new decimal_js_1.default(starkCollateralAmount.value), new decimal_js_1.default(starkFeeAmount.value), new decimal_js_1.default(starkSyntheticAmount.value));
    const orderHash = hashOrder(starkSyntheticAmount, starkCollateralAmount, starkFeeAmount, ctx.nonce, ctx.collateralPositionId, ctx.expireTime, ctx.publicKey, ctx.starknetDomain);
    const [orderSignatureR, orderSignatureS] = await ctx.signer(orderHash);
    const settlement = new orders_1.StarkSettlementModel(new model_1.SettlementSignatureModel('0x' + orderSignatureR.toString(16), '0x' + orderSignatureS.toString(16)), '0x' + ctx.publicKey.toString(16), new decimal_js_1.default(ctx.collateralPositionId));
    return new OrderSettlementData(syntheticAmountHuman, orderHash, settlement, debuggingAmounts);
}
//# sourceMappingURL=order-object-settlement.js.map