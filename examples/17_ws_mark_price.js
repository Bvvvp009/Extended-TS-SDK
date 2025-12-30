"use strict";
/**
 * WebSocket Mark Price Stream Example
 *
 * This example demonstrates how to subscribe to mark price updates via WebSocket.
 * Mark prices are used to calculate unrealized P&L and serve as the reference for liquidations.
 * The stream provides real-time updates whenever a mark price changes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const env_1 = require("../src/utils/env");
async function main() {
    try {
        console.log('Initializing WASM...');
        await (0, index_1.initWasm)();
        console.log('WASM initialized!');
        // Get configuration based on environment
        const env = (0, env_1.getX10EnvConfig)(false);
        const config = env.environment === 'mainnet' ? index_1.MAINNET_CONFIG : index_1.TESTNET_CONFIG;
        // Create stream client
        const streamClient = new index_1.PerpetualStreamClient({
            apiUrl: config.streamUrl,
        });
        // Example 1: Subscribe to mark price for a specific market
        console.log('\n=== Subscribing to mark price for BTC-USD ===');
        const btcMarkPriceStream = streamClient.subscribeToMarkPrice('BTC-USD');
        await btcMarkPriceStream.connect();
        console.log('Connected. Listening for mark price updates...\n');
        let updateCount = 0;
        const maxUpdates = 10;
        for await (const priceUpdate of btcMarkPriceStream) {
            console.log('Mark Price Update:');
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
        await btcMarkPriceStream.close();
        console.log('Connection closed.');
        // Example 2: Subscribe to mark prices for all markets
        // Uncomment to test
        /*
        console.log('\n=== Subscribing to mark prices for ALL markets ===');
        const allMarkPricesStream = streamClient.subscribeToMarkPrice();
        await allMarkPricesStream.connect();
        console.log('Connected. Listening for mark price updates from all markets...\n');
    
        let allMarketsUpdateCount = 0;
        const maxAllMarketsUpdates = 20;
    
        for await (const priceUpdate of allMarkPricesStream) {
          console.log('Mark Price Update:');
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
    
        await allMarkPricesStream.close();
        console.log('Connection closed.');
        */
    }
    catch (error) {
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
//# sourceMappingURL=17_ws_mark_price.js.map