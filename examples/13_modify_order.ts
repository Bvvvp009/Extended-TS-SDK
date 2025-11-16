/**
 * Modify order by cancel+replace pattern using externalId linkage
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualTradingClient,
  OrderSide,
  TimeInForce,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import Decimal from 'decimal.js';

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
    const qty = new Decimal('0.001');
    const price = new Decimal('60000');
    const externalId = `modify-${Date.now()}`;

    console.log('\nPlacing original LIMIT order...');
    const placeRes = await client.placeOrder({
      marketName,
      amountOfSynthetic: qty,
      price,
      side: OrderSide.BUY,
      timeInForce: TimeInForce.GTT,
      postOnly: true,
      externalId,
    });
    if (!placeRes.data) {
      throw new Error('Failed to place original order');
    }
    const orderId = typeof placeRes.data.id === 'string' ? parseInt(placeRes.data.id, 10) : placeRes.data.id;
    console.log('Original order ID:', orderId);

    console.log('Canceling original order...');
    await client.orders.cancelOrder(orderId);

    console.log('Placing replacement order with new price...');
    const newPrice = price.mul(0.999); // slightly better
    const replaceRes = await client.placeOrder({
      marketName,
      amountOfSynthetic: qty,
      price: newPrice,
      side: OrderSide.BUY,
      timeInForce: TimeInForce.GTT,
      postOnly: true,
      previousOrderId: externalId, // server may link modification by external ID
      externalId: `${externalId}-r`,
    } as any);

    if (replaceRes.data) {
      console.log('Replacement order ID:', replaceRes.data.id);
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




