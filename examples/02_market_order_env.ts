/**
 * Market order example using environment variables
 * Uses IOC (Immediate or Cancel) time in force to create market orders
 */

import {
  initWasm,
  PerpetualTradingClient,
  OrderSide,
  TimeInForce,
} from '../src/index';
import { createStableAccountFromEnv, findAffordableMarketOrder } from './_shared_stable_account';
import Decimal from 'decimal.js';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const { config, account } = createStableAccountFromEnv(true);
  const client = new PerpetualTradingClient(config, account);

  try {
    const affordableOrder = await findAffordableMarketOrder(client);
    const marketName = affordableOrder.marketName;
    const referencePrice = affordableOrder.referencePrice;
    const qty = affordableOrder.quantity;
    console.log(`\nPlacing MARKET BUY order on ${marketName}...`);
    console.log(`Quantity: ${qty.toString()}, Reference price: ${referencePrice.toString()}`);
    console.log('Note: Market orders use IOC (Immediate or Cancel) time in force');
    
    // Market order: Use IOC time in force and reference price
    // The order will execute immediately at market price or cancel
    const order = await client.placeOrder({
      marketName,
      amountOfSynthetic: qty,
      price: referencePrice, // Reference price for market orders
      side: OrderSide.BUY,
      timeInForce: TimeInForce.IOC, // IOC makes it a market order
      reduceOnly: false,
    });

    if (order.data) {
      console.log('Market order placed successfully!');
      console.log('Order ID:', order.data.id);
      console.log('Order status:', order.data.status);
      console.log('Order details:', JSON.stringify(order.data, null, 2));
    } else {
      console.log('Order response:', order);
    }
  } catch (error: any) {
    console.error('Error placing market order:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

