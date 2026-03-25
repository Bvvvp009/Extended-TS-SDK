/**
 * Market order with TP/SL example (env-based)
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
import { createStableAccountFromEnv } from './_shared_stable_account';
import Decimal from 'decimal.js';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const { config, account } = createStableAccountFromEnv(true);
  const client = new PerpetualTradingClient(config, account);

  try {
    const marketName = 'BTC-USD';
    const qty = new Decimal('0.001'); // Use minimum order size
    // Use fixed price like basic example (which works)
    const referencePrice = new Decimal('60000');
    const tick = new Decimal('0.01'); // BTC-USD tick size
    // Use same price as example 01 for consistency
    const orderPrice = referencePrice;

    console.log('\nPlacing LIMIT order with TP/SL (postOnly)...');
    // Calculate TP/SL prices with proper tick precision
    const tpTrigger = referencePrice.mul(1.01).div(tick).toDecimalPlaces(0, Decimal.ROUND_UP).mul(tick);
    const tpPrice = referencePrice.mul(1.01).div(tick).toDecimalPlaces(0, Decimal.ROUND_UP).mul(tick);
    const slTrigger = referencePrice.mul(0.99).div(tick).toDecimalPlaces(0, Decimal.ROUND_DOWN).mul(tick);
    const slPrice = referencePrice.mul(0.99).div(tick).toDecimalPlaces(0, Decimal.ROUND_DOWN).mul(tick);
    
    const res = await client.placeOrder({
      marketName,
      amountOfSynthetic: qty,
      price: orderPrice,
      side: OrderSide.BUY,
      timeInForce: TimeInForce.GTT,
      postOnly: true,
      tpSlType: OrderTpslType.ORDER,
      takeProfit: {
        triggerPrice: tpTrigger,
        triggerPriceType: OrderTriggerPriceType.MARK,
        price: tpPrice,
        priceType: OrderPriceType.LIMIT,
      },
      stopLoss: {
        triggerPrice: slTrigger,
        triggerPriceType: OrderTriggerPriceType.MARK,
        price: slPrice,
        priceType: OrderPriceType.LIMIT,
      },
    } as any);

    if (res.data) {
      console.log('Order placed (LIMIT with TP/SL). ID:', res.data.id);
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


