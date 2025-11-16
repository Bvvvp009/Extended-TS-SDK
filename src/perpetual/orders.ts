/**
 * Order types and models
 */

import Decimal from 'decimal.js';
import { X10BaseModel, SettlementSignatureModel } from '../utils/model';

/**
 * Time in force
 */
export enum TimeInForce {
  GTT = 'GTT',
  IOC = 'IOC',
  FOK = 'FOK',
}

/**
 * Order side
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * Order type
 */
export enum OrderType {
  LIMIT = 'LIMIT',
  CONDITIONAL = 'CONDITIONAL',
  MARKET = 'MARKET',
  TPSL = 'TPSL',
}

/**
 * Order TPSL type
 */
export enum OrderTpslType {
  ORDER = 'ORDER',
  POSITION = 'POSITION',
}

/**
 * Order status
 */
export enum OrderStatus {
  UNKNOWN = 'UNKNOWN',
  NEW = 'NEW',
  UNTRIGGERED = 'UNTRIGGERED',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

/**
 * Order status reason
 */
export enum OrderStatusReason {
  UNKNOWN = 'UNKNOWN',
  NONE = 'NONE',
  UNKNOWN_MARKET = 'UNKNOWN_MARKET',
  DISABLED_MARKET = 'DISABLED_MARKET',
  NOT_ENOUGH_FUNDS = 'NOT_ENOUGH_FUNDS',
  NO_LIQUIDITY = 'NO_LIQUIDITY',
  INVALID_FEE = 'INVALID_FEE',
  INVALID_QTY = 'INVALID_QTY',
  INVALID_PRICE = 'INVALID_PRICE',
  INVALID_VALUE = 'INVALID_VALUE',
  UNKNOWN_ACCOUNT = 'UNKNOWN_ACCOUNT',
  SELF_TRADE_PROTECTION = 'SELF_TRADE_PROTECTION',
  POST_ONLY_FAILED = 'POST_ONLY_FAILED',
  REDUCE_ONLY_FAILED = 'REDUCE_ONLY_FAILED',
  INVALID_EXPIRE_TIME = 'INVALID_EXPIRE_TIME',
  POSITION_TPSL_CONFLICT = 'POSITION_TPSL_CONFLICT',
  INVALID_LEVERAGE = 'INVALID_LEVERAGE',
  PREV_ORDER_NOT_FOUND = 'PREV_ORDER_NOT_FOUND',
  PREV_ORDER_TRIGGERED = 'PREV_ORDER_TRIGGERED',
  TPSL_OTHER_SIDE_FILLED = 'TPSL_OTHER_SIDE_FILLED',
  PREV_ORDER_CONFLICT = 'PREV_ORDER_CONFLICT',
  ORDER_REPLACED = 'ORDER_REPLACED',
  POST_ONLY_MODE = 'POST_ONLY_MODE',
  REDUCE_ONLY_MODE = 'REDUCE_ONLY_MODE',
  TRADING_OFF_MODE = 'TRADING_OFF_MODE',
}

/**
 * Order trigger price type
 */
export enum OrderTriggerPriceType {
  UNKNOWN = 'UNKNOWN',
  MARK = 'MARK',
  INDEX = 'INDEX',
  LAST = 'LAST',
}

/**
 * Order trigger direction
 */
export enum OrderTriggerDirection {
  UNKNOWN = 'UNKNOWN',
  UP = 'UP',
  DOWN = 'DOWN',
}

/**
 * Order price type
 */
export enum OrderPriceType {
  UNKNOWN = 'UNKNOWN',
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
}

/**
 * Self trade protection level
 */
export enum SelfTradeProtectionLevel {
  NONE = 'NONE',
  MARKET = 'MARKET',
  ACCOUNT = 'ACCOUNT',
}

/**
 * Settlement model
 */
export class StarkSettlementModel extends X10BaseModel {
  signature: SettlementSignatureModel;
  starkKey: string | bigint;
  collateralPosition: Decimal;

  constructor(signature: SettlementSignatureModel, starkKey: string | bigint, collateralPosition: Decimal) {
    super();
    this.signature = signature;
    this.starkKey = starkKey;
    this.collateralPosition = collateralPosition;
  }
}

/**
 * Debugging order amounts model
 */
export class StarkDebuggingOrderAmountsModel extends X10BaseModel {
  collateralAmount: Decimal;
  feeAmount: Decimal;
  syntheticAmount: Decimal;

  constructor(collateralAmount: Decimal, feeAmount: Decimal, syntheticAmount: Decimal) {
    super();
    this.collateralAmount = collateralAmount;
    this.feeAmount = feeAmount;
    this.syntheticAmount = syntheticAmount;
  }
}

/**
 * Order TPSL trigger model
 */
export class CreateOrderTpslTriggerModel extends X10BaseModel {
  triggerPrice: Decimal;
  triggerPriceType: OrderTriggerPriceType;
  price: Decimal;
  priceType: OrderPriceType;
  settlement: StarkSettlementModel;
  debuggingAmounts: StarkDebuggingOrderAmountsModel;

  constructor(
    triggerPrice: Decimal,
    triggerPriceType: OrderTriggerPriceType,
    price: Decimal,
    priceType: OrderPriceType,
    settlement: StarkSettlementModel,
    debuggingAmounts: StarkDebuggingOrderAmountsModel
  ) {
    super();
    this.triggerPrice = triggerPrice;
    this.triggerPriceType = triggerPriceType;
    this.price = price;
    this.priceType = priceType;
    this.settlement = settlement;
    this.debuggingAmounts = debuggingAmounts;
  }
}

/**
 * New order model
 */
export class NewOrderModel extends X10BaseModel {
  id: string;
  market: string;
  type: OrderType;
  side: OrderSide;
  qty: Decimal;
  price: Decimal;
  postOnly: boolean;
  timeInForce: TimeInForce;
  expiryEpochMillis: number;
  fee: Decimal;
  selfTradeProtectionLevel: SelfTradeProtectionLevel;
  nonce: Decimal;
  cancelId?: string;
  settlement: StarkSettlementModel;
  tpSlType?: OrderTpslType;
  takeProfit?: CreateOrderTpslTriggerModel;
  stopLoss?: CreateOrderTpslTriggerModel;
  debuggingAmounts: StarkDebuggingOrderAmountsModel;
  builderFee?: Decimal;
  builderId?: number;
  reduceOnly: boolean;

  constructor(
    id: string,
    market: string,
    type: OrderType,
    side: OrderSide,
    qty: Decimal,
    price: Decimal,
    postOnly: boolean,
    timeInForce: TimeInForce,
    expiryEpochMillis: number,
    fee: Decimal,
    selfTradeProtectionLevel: SelfTradeProtectionLevel,
    nonce: Decimal,
    settlement: StarkSettlementModel,
    debuggingAmounts: StarkDebuggingOrderAmountsModel,
    reduceOnly: boolean,
    cancelId?: string,
    tpSlType?: OrderTpslType,
    takeProfit?: CreateOrderTpslTriggerModel,
    stopLoss?: CreateOrderTpslTriggerModel,
    builderFee?: Decimal,
    builderId?: number
  ) {
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

/**
 * Open order model
 */
export class OpenOrderModel extends X10BaseModel {
  id: number;
  accountId: number;
  externalId: string;
  market: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  statusReason?: OrderStatusReason;
  price: Decimal;
  averagePrice?: Decimal;
  qty: Decimal;
  filledQty?: Decimal;
  reduceOnly: boolean;
  postOnly: boolean;
  createdTime: number;
  updatedTime: number;
  expiryTime?: number;
}

/**
 * Placed order model
 */
export class PlacedOrderModel extends X10BaseModel {
  id: string;
  market: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  price: Decimal;
  qty: Decimal;
  postOnly: boolean;
  createdTime: number;
  updatedTime: number;
}







