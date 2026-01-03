/**
 * Order settlement and hashing logic
 */

import Decimal from 'decimal.js';
import { MarketModel } from './markets.js';
import { TradingFeeModel } from './fees.js';
import { StarknetDomain } from './configuration.js';
import { OrderSide, StarkSettlementModel, StarkDebuggingOrderAmountsModel } from './orders.js';
import { SettlementSignatureModel } from '../utils/model.js';
import { HumanReadableAmount, StarkAmount, ROUNDING_BUY_CONTEXT, ROUNDING_SELL_CONTEXT, ROUNDING_FEE_CONTEXT } from './amounts.js';
import { getOrderMsgHash } from './crypto/signer.js';
import { StarkPerpetualAccount } from './accounts.js';

/**
 * Order settlement data
 */
export class OrderSettlementData {
  syntheticAmountHuman: HumanReadableAmount;
  orderHash: bigint;
  settlement: StarkSettlementModel;
  debuggingAmounts: StarkDebuggingOrderAmountsModel;

  constructor(
    syntheticAmountHuman: HumanReadableAmount,
    orderHash: bigint,
    settlement: StarkSettlementModel,
    debuggingAmounts: StarkDebuggingOrderAmountsModel
  ) {
    this.syntheticAmountHuman = syntheticAmountHuman;
    this.orderHash = orderHash;
    this.settlement = settlement;
    this.debuggingAmounts = debuggingAmounts;
  }
}

/**
 * Settlement data context
 */
export class SettlementDataCtx {
  market: MarketModel;
  fees: TradingFeeModel;
  builderFee?: Decimal;
  nonce: number;
  collateralPositionId: number;
  expireTime: Date;
  signer: (msgHash: bigint) => Promise<[bigint, bigint]>;
  publicKey: bigint;
  starknetDomain: StarknetDomain;

  constructor(
    market: MarketModel,
    fees: TradingFeeModel,
    nonce: number,
    collateralPositionId: number,
    expireTime: Date,
    signer: (msgHash: bigint) => Promise<[bigint, bigint]>,
    publicKey: bigint,
    starknetDomain: StarknetDomain,
    builderFee?: Decimal
  ) {
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

/**
 * Calculate settlement expiration (add 14 days buffer)
 */
function calcSettlementExpiration(expirationTimestamp: Date): number {
  const expireTimeWithBuffer = new Date(expirationTimestamp);
  expireTimeWithBuffer.setDate(expireTimeWithBuffer.getDate() + 14);
  return Math.ceil(expireTimeWithBuffer.getTime() / 1000);
}

/**
 * Hash an order
 */
export function hashOrder(
  amountSynthetic: StarkAmount,
  amountCollateral: StarkAmount,
  maxFee: StarkAmount,
  nonce: number,
  positionId: number,
  expirationTimestamp: Date,
  publicKey: bigint,
  starknetDomain: StarknetDomain
): bigint {
  const syntheticAsset = amountSynthetic.asset;
  const collateralAsset = amountCollateral.asset;

  const baseAssetId = syntheticAsset.settlementExternalId.startsWith('0x')
    ? syntheticAsset.settlementExternalId
    : '0x' + syntheticAsset.settlementExternalId;

  const quoteAssetId = collateralAsset.settlementExternalId.startsWith('0x')
    ? collateralAsset.settlementExternalId
    : '0x' + collateralAsset.settlementExternalId;

  return getOrderMsgHash({
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
export async function createOrderSettlementData(
  side: OrderSide,
  syntheticAmount: Decimal,
  price: Decimal,
  ctx: SettlementDataCtx
): Promise<OrderSettlementData> {
  const isBuyingSynthetic = side === OrderSide.BUY;
  const roundingContext = isBuyingSynthetic ? ROUNDING_BUY_CONTEXT : ROUNDING_SELL_CONTEXT;

  const syntheticAmountHuman = new HumanReadableAmount(syntheticAmount, ctx.market.syntheticAsset);
  const collateralAmountHuman = new HumanReadableAmount(
    syntheticAmount.mul(price),
    ctx.market.collateralAsset
  );

  const totalFee = ctx.fees.takerFeeRate.plus(ctx.builderFee || new Decimal(0));
  const feeAmountHuman = new HumanReadableAmount(
    totalFee.mul(collateralAmountHuman.value),
    ctx.market.collateralAsset
  );

  let starkCollateralAmount = collateralAmountHuman.toStarkAmount(roundingContext);
  let starkSyntheticAmount = syntheticAmountHuman.toStarkAmount(roundingContext);
  const starkFeeAmount = feeAmountHuman.toStarkAmount(ROUNDING_FEE_CONTEXT);

  if (isBuyingSynthetic) {
    starkCollateralAmount = starkCollateralAmount.negate();
  } else {
    starkSyntheticAmount = starkSyntheticAmount.negate();
  }

  const debuggingAmounts = new StarkDebuggingOrderAmountsModel(
    new Decimal(starkCollateralAmount.value),
    new Decimal(starkFeeAmount.value),
    new Decimal(starkSyntheticAmount.value)
  );

  const orderHash = hashOrder(
    starkSyntheticAmount,
    starkCollateralAmount,
    starkFeeAmount,
    ctx.nonce,
    ctx.collateralPositionId,
    ctx.expireTime,
    ctx.publicKey,
    ctx.starknetDomain
  );

  const [orderSignatureR, orderSignatureS] = await ctx.signer(orderHash);

  const settlement = new StarkSettlementModel(
    new SettlementSignatureModel('0x' + orderSignatureR.toString(16), '0x' + orderSignatureS.toString(16)),
    '0x' + ctx.publicKey.toString(16),
    new Decimal(ctx.collateralPositionId)
  );

  return new OrderSettlementData(
    syntheticAmountHuman,
    orderHash,
    settlement,
    debuggingAmounts
  );
}



