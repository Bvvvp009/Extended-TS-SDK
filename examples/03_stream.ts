/**
 * Stream subscription example
 */

import {
  initWasm,
  TESTNET_CONFIG,
  PerpetualStreamClient,
} from '../src/index';

async function main() {
  // Initialize WASM (required!)
  await initWasm();

  const streamClient = new PerpetualStreamClient({
    apiUrl: TESTNET_CONFIG.streamUrl,
  });

  // Subscribe to orderbook
  console.log('Subscribing to BTC-USD orderbook...');
  const orderbookStream = streamClient.subscribeToOrderbooks({
    marketName: 'BTC-USD',
    depth: 10,
  });

  await orderbookStream.connect();
  console.log('Connected to orderbook stream');

  // Listen to updates
  for await (const update of orderbookStream) {
    console.log('Orderbook update:', update);
    // Process update...
  }
}

main().catch(console.error);







