/**
 * Close (cancel) a specific order by ID or external ID
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
    // Place a small order to obtain an order ID
    const marketName = 'BTC-USD';
    const qty = new Decimal('0.001');
    // Use price below market for postOnly to work
    const price = new Decimal('57000');

    console.log('\nPlacing a small LIMIT order to then cancel...');
    const placeRes = await client.placeOrder({
      marketName,
      amountOfSynthetic: qty,
      price,
      side: OrderSide.BUY,
      timeInForce: TimeInForce.GTT,
      postOnly: true,
    });
    if (!placeRes.data) {
      throw new Error('Failed to place order');
    }
    const orderId = typeof placeRes.data.id === 'string' ? parseInt(placeRes.data.id, 10) : placeRes.data.id;
    console.log('Placed order ID:', orderId);

    console.log('Canceling order...');
    await client.orders.cancelOrder(orderId);
    console.log('Order canceled');
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




