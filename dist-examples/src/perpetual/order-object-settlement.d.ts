/**
 * Order settlement and hashing logic
 */
import Decimal from 'decimal.js';
import { MarketModel } from './markets';
import { TradingFeeModel } from './fees';
import { StarknetDomain } from './configuration';
import { OrderSide, StarkSettlementModel, StarkDebuggingOrderAmountsModel } from './orders';
import { HumanReadableAmount, StarkAmount } from './amounts';
/**
 * Order settlement data
 */
export declare class OrderSettlementData {
    syntheticAmountHuman: HumanReadableAmount;
    orderHash: bigint;
    settlement: StarkSettlementModel;
    debuggingAmounts: StarkDebuggingOrderAmountsModel;
    constructor(syntheticAmountHuman: HumanReadableAmount, orderHash: bigint, settlement: StarkSettlementModel, debuggingAmounts: StarkDebuggingOrderAmountsModel);
}
/**
 * Settlement data context
 */
export declare class SettlementDataCtx {
    market: MarketModel;
    fees: TradingFeeModel;
    builderFee?: Decimal;
    nonce: number;
    collateralPositionId: number;
    expireTime: Date;
    signer: (msgHash: bigint) => Promise<[bigint, bigint]>;
    publicKey: bigint;
    starknetDomain: StarknetDomain;
    constructor(market: MarketModel, fees: TradingFeeModel, nonce: number, collateralPositionId: number, expireTime: Date, signer: (msgHash: bigint) => Promise<[bigint, bigint]>, publicKey: bigint, starknetDomain: StarknetDomain, builderFee?: Decimal);
}
/**
 * Hash an order
 */
export declare function hashOrder(amountSynthetic: StarkAmount, amountCollateral: StarkAmount, maxFee: StarkAmount, nonce: number, positionId: number, expirationTimestamp: Date, publicKey: bigint, starknetDomain: StarknetDomain): bigint;
/**
 * Create order settlement data
 */
export declare function createOrderSettlementData(side: OrderSide, syntheticAmount: Decimal, price: Decimal, ctx: SettlementDataCtx): Promise<OrderSettlementData>;
//# sourceMappingURL=order-object-settlement.d.ts.map