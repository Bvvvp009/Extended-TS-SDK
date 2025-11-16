/**
 * Simple TWAP executor with optional TP/SL (env-based)
 * Note: native TWAP order type is not exposed; this script slices orders over time.
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualTradingClient,
  OrderSide,
  OrderTpslType,
  OrderTriggerPriceType,
  OrderPriceType,
  TimeInForce,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import Decimal from 'decimal.js';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const env = getX10EnvConfig(true);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
  const { StarkPerpetualAccount } = await import('../src/index');
  const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
  const client = new PerpetualTradingClient(config, account);

  try {
    const marketName = 'BTC-USD';
    const totalQty = new Decimal('0.001'); // Single slice to fit balance
    const slices = 1; // Single slice for demonstration
    const delayMs = 2_000;
    const sliceQty = totalQty;
    const referencePrice = new Decimal('60000');

    console.log(`\nExecuting TWAP: ${slices} slice(s) of ${sliceQty.toString()}...`);
    console.log('Note: Full TWAP would place multiple slices over time. This demonstrates a single slice.');
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
          triggerPrice: referencePrice.mul(1.01),
          triggerPriceType: OrderTriggerPriceType.MARK,
          price: referencePrice.mul(1.01),
          priceType: OrderPriceType.LIMIT,
        },
        stopLoss: {
          triggerPrice: referencePrice.mul(0.99),
          triggerPriceType: OrderTriggerPriceType.MARK,
          price: referencePrice.mul(0.99),
          priceType: OrderPriceType.LIMIT,
        },
      } as any);
      if (res.data) {
        const orderId = typeof res.data.id === 'string' ? parseInt(res.data.id, 10) : res.data.id;
        orderIds.push(orderId);
        console.log(`Slice ${i + 1}/${slices} placed. ID: ${orderId}`);
      }
      if (i < slices - 1) {
        await sleep(delayMs);
      }
    }
    // Cancel last order
    if (orderIds.length > 0) {
      await client.orders.cancelOrder(orderIds[orderIds.length - 1]);
      console.log('TWAP order completed and canceled');
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


