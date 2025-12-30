/**
 * Order object creation
 */
import Decimal from 'decimal.js';
import { StarkPerpetualAccount } from './accounts';
import { MarketModel } from './markets';
import { StarknetDomain } from './configuration';
import { OrderSide, OrderTpslType, OrderTriggerPriceType, OrderPriceType, SelfTradeProtectionLevel, TimeInForce, OrderType, NewOrderModel } from './orders';
/**
 * Order TPSL trigger parameter
 */
export declare class OrderTpslTriggerParam {
    triggerPrice: Decimal;
    triggerPriceType: OrderTriggerPriceType;
    price: Decimal;
    priceType: OrderPriceType;
    constructor(triggerPrice: Decimal, triggerPriceType: OrderTriggerPriceType, price: Decimal, priceType: OrderPriceType);
}
/**
 * Create an order object to be placed on the exchange
 */
export declare function createOrderObject(account: StarkPerpetualAccount, market: MarketModel, amountOfSynthetic: Decimal, price: Decimal, side: OrderSide, starknetDomain: StarknetDomain, options?: {
    orderType?: OrderType;
    postOnly?: boolean;
    previousOrderExternalId?: string;
    expireTime?: Date;
    orderExternalId?: string;
    timeInForce?: TimeInForce;
    selfTradeProtectionLevel?: SelfTradeProtectionLevel;
    nonce?: number;
    builderFee?: Decimal;
    builderId?: number;
    reduceOnly?: boolean;
    tpSlType?: OrderTpslType;
    takeProfit?: OrderTpslTriggerParam;
    stopLoss?: OrderTpslTriggerParam;
}): Promise<NewOrderModel>;
//# sourceMappingURL=order-object.d.ts.map