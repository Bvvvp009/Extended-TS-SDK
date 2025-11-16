/**
 * WebSocket orderbook stream example
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualStreamClient,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const env = getX10EnvConfig(false);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const streamClient = new PerpetualStreamClient({
    apiUrl: config.streamUrl,
  });

  console.log('Subscribing to BTC-USD orderbook depth=10...');
  const orderbookStream = streamClient.subscribeToOrderbooks({
    marketName: 'BTC-USD',
    depth: 10,
  });

  await orderbookStream.connect();
  console.log('Connected. Listening for updates...');

  for await (const update of orderbookStream) {
    console.log('Orderbook update:', JSON.stringify(update));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




