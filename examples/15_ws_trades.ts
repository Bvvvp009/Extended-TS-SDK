/**
 * WebSocket public trades stream example
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

  console.log('Subscribing to public trades for BTC-USD...');
  const tradesStream = streamClient.subscribeToPublicTrades('BTC-USD');
  await tradesStream.connect();
  console.log('Connected. Listening for public trades...');

  for await (const trade of tradesStream) {
    console.log('Trade:', JSON.stringify(trade));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




