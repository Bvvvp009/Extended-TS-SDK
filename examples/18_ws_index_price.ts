/**
 * WebSocket Index Price Stream Example
 * 
 * This example demonstrates how to subscribe to index price updates via WebSocket.
 * An index price is a composite spot price sourced from multiple external providers.
 * It is used as the reference for funding-rate calculations.
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualStreamClient,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';

async function main() {
  try {
    console.log('Initializing WASM...');
    await initWasm();
    console.log('WASM initialized!');

    // Get configuration based on environment
    const env = getX10EnvConfig(false);
    const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

    // Create stream client
    const streamClient = new PerpetualStreamClient({
      apiUrl: config.streamUrl,
    });

    // Example 1: Subscribe to index price for a specific market
    console.log('\n=== Subscribing to index price for BTC-USD ===');
    const btcIndexPriceStream = streamClient.subscribeToIndexPrice('BTC-USD');
    await btcIndexPriceStream.connect();
    console.log('Connected. Listening for index price updates...\n');

    let updateCount = 0;
    const maxUpdates = 10;

    for await (const priceUpdate of btcIndexPriceStream) {
      console.log('Index Price Update:');
      console.log('  Type:', priceUpdate.type);
      console.log('  Market:', priceUpdate.data?.m);
      console.log('  Price:', priceUpdate.data?.p);
      console.log('  Timestamp:', priceUpdate.data?.ts);
      console.log('  Sequence:', priceUpdate.seq);
      console.log('---');

      updateCount++;
      if (updateCount >= maxUpdates) {
        console.log(`\nReceived ${maxUpdates} updates, closing connection...`);
        break;
      }
    }

    await btcIndexPriceStream.close();
    console.log('Connection closed.');

    // Example 2: Subscribe to index prices for all markets
    // Uncomment to test
    /*
    console.log('\n=== Subscribing to index prices for ALL markets ===');
    const allIndexPricesStream = streamClient.subscribeToIndexPrice();
    await allIndexPricesStream.connect();
    console.log('Connected. Listening for index price updates from all markets...\n');

    let allMarketsUpdateCount = 0;
    const maxAllMarketsUpdates = 20;

    for await (const priceUpdate of allIndexPricesStream) {
      console.log('Index Price Update:');
      console.log('  Market:', priceUpdate.data?.m);
      console.log('  Price:', priceUpdate.data?.p);
      console.log('  Timestamp:', new Date(priceUpdate.data?.ts).toISOString());
      console.log('---');

      allMarketsUpdateCount++;
      if (allMarketsUpdateCount >= maxAllMarketsUpdates) {
        console.log(`\nReceived ${maxAllMarketsUpdates} updates, closing connection...`);
        break;
      }
    }

    await allIndexPricesStream.close();
    console.log('Connection closed.');
    */

  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
