/**
 * Order object creation
 */

import Decimal from 'decimal.js';
import { StarkPerpetualAccount } from './accounts';
import { MarketModel } from './markets';
import { StarknetDomain } from './configuration';
import {
  OrderSide,
  OrderTpslType,
  OrderTriggerPriceType,
  OrderPriceType,
  SelfTradeProtectionLevel,
  TimeInForce,
  OrderType,
  NewOrderModel,
  CreateOrderTpslTriggerModel,
  StarkSettlementModel,
} from './orders';
import {
  OrderSettlementData,
  SettlementDataCtx,
  createOrderSettlementData,
} from './order-object-settlement';
import { generateNonce } from '../utils/nonce';
import { utcNow, toEpochMillis } from '../utils/date';
import { DEFAULT_FEES } from './fees';

/**
 * Order TPSL trigger parameter
 */
export class OrderTpslTriggerParam {
  triggerPrice: Decimal;
  triggerPriceType: OrderTriggerPriceType;
  price: Decimal;
  priceType: OrderPriceType;

  constructor(
    triggerPrice: Decimal,
    triggerPriceType: OrderTriggerPriceType,
    price: Decimal,
    priceType: OrderPriceType
  ) {
    this.triggerPrice = triggerPrice;
    this.triggerPriceType = triggerPriceType;
    this.price = price;
    this.priceType = priceType;
  }
}

/**
 * Get opposite order side
 */
function getOppositeSide(side: OrderSide): OrderSide {
  return side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
}

/**
 * Create order TPSL trigger model
 */
function createOrderTpslTriggerModel(
  triggerParam: OrderTpslTriggerParam,
  settlementData: OrderSettlementData
): CreateOrderTpslTriggerModel {
  return new CreateOrderTpslTriggerModel(
    triggerParam.triggerPrice,
    triggerParam.triggerPriceType,
    triggerParam.price,
    triggerParam.priceType,
    settlementData.settlement,
    settlementData.debuggingAmounts
  );
}

/**
 * Create an order object to be placed on the exchange
 */
export async function createOrderObject(
  account: StarkPerpetualAccount,
  market: MarketModel,
  amountOfSynthetic: Decimal,
  price: Decimal,
  side: OrderSide,
  starknetDomain: StarknetDomain,
  options: {
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
  } = {}
): Promise<NewOrderModel> {
  const {
    orderType = OrderType.LIMIT,
    postOnly = false,
    previousOrderExternalId,
    expireTime,
    orderExternalId,
    timeInForce = TimeInForce.GTT,
    selfTradeProtectionLevel = SelfTradeProtectionLevel.ACCOUNT,
    nonce,
    builderFee,
    builderId,
    reduceOnly = false,
    tpSlType,
    takeProfit,
    stopLoss,
  } = options;

  let finalExpireTime = expireTime;
  if (!finalExpireTime) {
    finalExpireTime = new Date(utcNow());
    finalExpireTime.setHours(finalExpireTime.getHours() + 1);
  }

  // Validate side
  if (side !== OrderSide.BUY && side !== OrderSide.SELL) {
    throw new Error(`Unexpected order side value: ${side}`);
  }

  // Validate time in force
  if (timeInForce === TimeInForce.FOK) {
    throw new Error(`Unexpected time in force value: ${timeInForce}`);
  }

  // Validate TPSL
  if (tpSlType === OrderTpslType.POSITION) {
    throw new Error('`POSITION` TPSL type is not supported yet');
  }

  if (
    (takeProfit && takeProfit.priceType === OrderPriceType.MARKET) ||
    (stopLoss && stopLoss.priceType === OrderPriceType.MARKET)
  ) {
    throw new Error('TPSL `MARKET` price type is not supported yet');
  }

  const finalNonce = nonce || generateNonce();
  const fees = (account.getTradingFee().get(market.name) as any) || DEFAULT_FEES;
  const feeRate = fees.takerFeeRate;

  const settlementDataCtx = new SettlementDataCtx(
    market,
    fees,
    finalNonce,
    account.getVault(),
    finalExpireTime,
    (msgHash: bigint) => account.sign(msgHash),
    account.getPublicKey(),
    starknetDomain,
    builderFee
  );

  const settlementData = await createOrderSettlementData(
    side,
    amountOfSynthetic,
    price,
    settlementDataCtx
  );

  let tpTriggerModel: CreateOrderTpslTriggerModel | undefined;
  if (takeProfit) {
    const tpSettlementData = await createOrderSettlementData(
      getOppositeSide(side),
      amountOfSynthetic,
      takeProfit.price,
      settlementDataCtx
    );
    tpTriggerModel = createOrderTpslTriggerModel(takeProfit, tpSettlementData);
  }

  let slTriggerModel: CreateOrderTpslTriggerModel | undefined;
  if (stopLoss) {
    const slSettlementData = await createOrderSettlementData(
      getOppositeSide(side),
      amountOfSynthetic,
      stopLoss.price,
      settlementDataCtx
    );
    slTriggerModel = createOrderTpslTriggerModel(stopLoss, slSettlementData);
  }

  const orderId = orderExternalId || settlementData.orderHash.toString();
  const order = new NewOrderModel(
    orderId,
    market.name,
    orderType,
    side,
    settlementData.syntheticAmountHuman.value,
    price,
    postOnly,
    timeInForce,
    toEpochMillis(finalExpireTime),
    feeRate,
    selfTradeProtectionLevel,
    new Decimal(finalNonce),
    settlementData.settlement,
    settlementData.debuggingAmounts,
    reduceOnly,
    previousOrderExternalId,
    tpSlType,
    tpTriggerModel,
    slTriggerModel,
    builderFee,
    builderId
  );

  return order;
}

