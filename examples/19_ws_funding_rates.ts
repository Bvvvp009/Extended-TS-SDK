/**
 * WebSocket Funding Rates Stream Example
 * 
 * This example demonstrates how to subscribe to funding rates updates via WebSocket.
 * While the funding rate is calculated every minute, it is applied only once per hour.
 * The records include only those funding rates that were used for funding fee payments.
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

    // Example 1: Subscribe to funding rates for a specific market
    console.log('\n=== Subscribing to funding rates for BTC-USD ===');
    const btcFundingStream = streamClient.subscribeToFundingRates('BTC-USD');
    await btcFundingStream.connect();
    console.log('Connected. Listening for funding rate updates...\n');
    console.log('Note: Funding rates are applied hourly, so updates may take some time.\n');

    let updateCount = 0;
    const maxUpdates = 5;

    for await (const fundingUpdate of btcFundingStream) {
      console.log('Funding Rate Update:');
      console.log('  Market:', fundingUpdate.data?.m);
      console.log('  Funding Rate:', fundingUpdate.data?.f);
      console.log('  Applied at:', new Date(fundingUpdate.data?.T).toISOString());
      console.log('  Stream Timestamp:', fundingUpdate.ts);
      console.log('  Sequence:', fundingUpdate.seq);
      console.log('---');

      updateCount++;
      if (updateCount >= maxUpdates) {
        console.log(`\nReceived ${maxUpdates} updates, closing connection...`);
        break;
      }
    }

    await btcFundingStream.close();
    console.log('Connection closed.');

    // Example 2: Subscribe to funding rates for all markets
    // Uncomment to test
    /*
    console.log('\n=== Subscribing to funding rates for ALL markets ===');
    const allFundingStream = streamClient.subscribeToFundingRates();
    await allFundingStream.connect();
    console.log('Connected. Listening for funding rate updates from all markets...\n');

    let allMarketsUpdateCount = 0;
    const maxAllMarketsUpdates = 10;

    for await (const fundingUpdate of allFundingStream) {
      console.log('Funding Rate Update:');
      console.log('  Market:', fundingUpdate.data?.m);
      console.log('  Funding Rate:', fundingUpdate.data?.f);
      console.log('  Applied at:', new Date(fundingUpdate.data?.T).toISOString());
      console.log('---');

      allMarketsUpdateCount++;
      if (allMarketsUpdateCount >= maxAllMarketsUpdates) {
        console.log(`\nReceived ${maxAllMarketsUpdates} updates, closing connection...`);
        break;
      }
    }

    await allFundingStream.close();
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
