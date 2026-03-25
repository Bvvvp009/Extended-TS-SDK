/**
 * Limit order with TP/SL example (env-based)
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
    const qty = new Decimal('0.001');
    // Use price below market for postOnly to work
    const limitPrice = new Decimal('57000');

    console.log('\nPlacing LIMIT order with TP/SL...');
    const res = await client.placeOrder({
      marketName,
      amountOfSynthetic: qty,
      price: limitPrice,
      side: OrderSide.BUY,
      timeInForce: TimeInForce.GTT,
      postOnly: true, // ensure we do not take liquidity
      tpSlType: OrderTpslType.ORDER,
      takeProfit: {
        triggerPrice: limitPrice.mul(1.01),
        triggerPriceType: OrderTriggerPriceType.MARK,
        price: limitPrice.mul(1.01),
        priceType: OrderPriceType.LIMIT,
      },
      stopLoss: {
        triggerPrice: limitPrice.mul(0.99),
        triggerPriceType: OrderTriggerPriceType.MARK,
        price: limitPrice.mul(0.99),
        priceType: OrderPriceType.LIMIT,
      },
    });

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


