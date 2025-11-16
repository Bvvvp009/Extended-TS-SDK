/**
 * Cancel all open orders - utility script
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const env = getX10EnvConfig(true);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const account = new StarkPerpetualAccount(
    env.vaultId,
    env.privateKey,
    env.publicKey,
    env.apiKey
  );

  const client = new PerpetualTradingClient(config, account);

  try {
    // Get open orders first
    const ordersResponse = await client.account.getOpenOrders();
    if (ordersResponse.data && ordersResponse.data.length > 0) {
      console.log(`Found ${ordersResponse.data.length} open orders`);
      console.log('Orders:', ordersResponse.data.map(o => ({ id: o.id, market: o.market, qty: o.qty.toString() })));
    } else {
      console.log('No open orders found');
    }

    // Cancel all orders
    console.log('\nCanceling all orders...');
    const cancelResponse = await client.orders.massCancel({ cancelAll: true });
    console.log('Cancel response:', cancelResponse);

    // Verify
    const ordersAfter = await client.account.getOpenOrders();
    if (ordersAfter.data && ordersAfter.data.length > 0) {
      console.log(`Warning: Still ${ordersAfter.data.length} open orders after cancel`);
    } else {
      console.log('All orders canceled successfully');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

