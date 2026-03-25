/**
 * Basic order placement example using environment variables
 */

import {
  initWasm,
  PerpetualTradingClient,
  OrderSide,
} from '../src/index';
import { createStableAccountFromEnv, findAffordableMarketOrder } from './_shared_stable_account';
import Decimal from 'decimal.js';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();
  console.log('WASM initialized!');

  const { config, account } = createStableAccountFromEnv(true);

  console.log('Creating stable account...');

  console.log('Creating trading client...');
  const client = new PerpetualTradingClient(config, account);

  try {
    // Get balance
    console.log('\nFetching balance...');
    const balanceResponse = await client.account.getBalance();
    if (balanceResponse.data) {
      console.log('Balance:', JSON.stringify(balanceResponse.data));
    }

    // Get positions
    console.log('\nFetching positions...');
    const positionsResponse = await client.account.getPositions();
    if (positionsResponse.data) {
      console.log('Positions:', positionsResponse.data.length, 'open');
    }

    // Get open orders
    console.log('\nFetching open orders...');
    const ordersResponse = await client.account.getOpenOrders();
    if (ordersResponse.data) {
      console.log('Open orders:', ordersResponse.data.length);
    }

    // Get markets
    console.log('\nFetching markets...');
    const marketsResponse = await client.marketsInfo.getMarkets();
    if (marketsResponse.data) {
      console.log('Available markets count:', marketsResponse.data.length);
    }

    const affordableOrder = await findAffordableMarketOrder(client);

    // Place a test order (small amount)
    console.log('\nPlacing test order...');
    const order = await client.placeOrder({
      marketName: affordableOrder.marketName,
      amountOfSynthetic: affordableOrder.quantity,
      price: affordableOrder.postOnlyPrice,
      side: OrderSide.BUY,
      postOnly: true,
    });

    if (order.data) {
      console.log('Order placed successfully!');
      console.log('Order ID:', order.data.id);
      console.log('Order:', JSON.stringify(order.data));

      // Cancel the order
      console.log('\nCanceling order...');
      await client.orders.cancelOrder(typeof order.data.id === 'string' ? parseInt(order.data.id, 10) : order.data.id);
      console.log('Order canceled!');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    // Cleanup
    await client.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


