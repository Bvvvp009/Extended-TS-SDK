/**
 * Client-side TWAP executor with optional TP/SL (env-based)
 * Note: native TWAP order type is not exposed; this script slices orders over time.
 */

import {
  initWasm,
  PerpetualTradingClient,
  OrderSide,
  OrderTpslType,
  OrderTriggerPriceType,
  OrderPriceType,
  TimeInForce,
} from '../src/index';
import {
  createStableAccountFromEnv,
  findAffordableMarketOrder,
  getMarketPricePrecision,
} from './_shared_stable_account';
import Decimal from 'decimal.js';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getPositiveIntegerEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];
  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const { config, account } = createStableAccountFromEnv(true);
  const client = new PerpetualTradingClient(config, account);

  try {
    const affordableOrder = await findAffordableMarketOrder(client);
    const marketName = affordableOrder.marketName;
    const market = (await client.marketsInfo.getMarketsDict())[marketName];
    const pricePrecision = getMarketPricePrecision(market);
    const roundPrice = (price: Decimal, roundingMode: Decimal.Rounding = Decimal.ROUND_HALF_UP) =>
      price.toDecimalPlaces(pricePrecision, roundingMode);
    const slices = getPositiveIntegerEnv('TWAP_SLICES', 3);
    const delayMs = getPositiveIntegerEnv('TWAP_DELAY_MS', 2_000);
    const sliceQty = affordableOrder.quantity;
    const totalQty = sliceQty.mul(slices);
    const referencePrice = affordableOrder.postOnlyPrice;
    const takeProfitPrice = roundPrice(referencePrice.mul(1.01), Decimal.ROUND_UP);
    const stopLossPrice = roundPrice(referencePrice.mul(0.99), Decimal.ROUND_DOWN);

    console.log(`\nExecuting client-side TWAP on ${marketName}: ${slices} slice(s) of ${sliceQty.toString()} (total ${totalQty.toString()})...`);
    console.log(`Each slice is posted as a limit child order, waits ${delayMs}ms, then is canceled before the next slice.`);
    const orderIds: number[] = [];
    for (let i = 0; i < slices; i++) {
      const res = await client.placeOrder({
        marketName,
        amountOfSynthetic: sliceQty,
        price: referencePrice,
        side: OrderSide.BUY,
        timeInForce: TimeInForce.GTT,
        postOnly: true,
        tpSlType: OrderTpslType.ORDER,
        takeProfit: {
          triggerPrice: takeProfitPrice,
          triggerPriceType: OrderTriggerPriceType.MARK,
          price: takeProfitPrice,
          priceType: OrderPriceType.LIMIT,
        },
        stopLoss: {
          triggerPrice: stopLossPrice,
          triggerPriceType: OrderTriggerPriceType.MARK,
          price: stopLossPrice,
          priceType: OrderPriceType.LIMIT,
        },
      } as any);
      if (res.data) {
        const orderId = typeof res.data.id === 'string' ? parseInt(res.data.id, 10) : res.data.id;
        orderIds.push(orderId);
        console.log(`Slice ${i + 1}/${slices} placed. ID: ${orderId}`);

        await sleep(delayMs);
        await client.orders.cancelOrder(orderId);
        console.log(`Slice ${i + 1}/${slices} canceled. ID: ${orderId}`);
      }
    }
    console.log(`TWAP schedule completed: ${orderIds.length} child limit order(s) placed and canceled.`);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


