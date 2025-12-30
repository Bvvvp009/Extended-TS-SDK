"use strict";
/**
 * WebSocket Candles Stream Example
 *
 * This example demonstrates how to subscribe to candles (OHLCV) data via WebSocket.
 * Candles are available for trades, mark prices, and index prices.
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
        // Example 1: Subscribe to 1-minute trade candles for BTC-USD
        console.log('\n=== Subscribing to 1-minute trade candles for BTC-USD ===');
        const tradeCandlesStream = streamClient.subscribeToCandles({
            marketName: 'BTC-USD',
            candleType: 'trades',
            interval: 'PT1M', // ISO 8601 duration: 1 minute
        });
        await tradeCandlesStream.connect();
        console.log('Connected. Listening for trade candles...\n');
        console.log('Available intervals: PT1M, PT5M, PT15M, PT30M, PT1H, PT2H, PT4H, PT8H, PT12H, PT24H, P7D, P30D');
        console.log('Candle types: trades, mark-prices, index-prices\n');
        let updateCount = 0;
        const maxUpdates = 5;
        for await (const candleUpdate of tradeCandlesStream) {
            console.log('Trade Candle Update:');
            if (candleUpdate.data && candleUpdate.data.length > 0) {
                const candle = candleUpdate.data[0];
                console.log('  Timestamp:', new Date(candle.T).toISOString());
                console.log('  Open:', candle.o);
                console.log('  High:', candle.h);
                console.log('  Low:', candle.l);
                console.log('  Close:', candle.c);
                console.log('  Volume:', candle.v);
                console.log('  Sequence:', candleUpdate.seq);
            }
            console.log('---');
            updateCount++;
            if (updateCount >= maxUpdates) {
                console.log(`\nReceived ${maxUpdates} updates, closing connection...`);
                break;
            }
        }
        await tradeCandlesStream.close();
        console.log('Connection closed.');
        // Example 2: Subscribe to 5-minute mark price candles
        // Uncomment to test
        /*
        console.log('\n=== Subscribing to 5-minute mark price candles for BTC-USD ===');
        const markPriceCandlesStream = streamClient.subscribeToCandles({
          marketName: 'BTC-USD',
          candleType: 'mark-prices',
          interval: 'PT5M', // 5 minutes
        });
        
        await markPriceCandlesStream.connect();
        console.log('Connected. Listening for mark price candles...\n');
    
        let markPriceUpdateCount = 0;
        const maxMarkPriceUpdates = 5;
    
        for await (const candleUpdate of markPriceCandlesStream) {
          console.log('Mark Price Candle Update:');
          if (candleUpdate.data && candleUpdate.data.length > 0) {
            const candle = candleUpdate.data[0];
            console.log('  Timestamp:', new Date(candle.T).toISOString());
            console.log('  Open:', candle.o);
            console.log('  High:', candle.h);
            console.log('  Low:', candle.l);
            console.log('  Close:', candle.c);
            console.log('  Note: Mark price candles do not include volume');
          }
          console.log('---');
    
          markPriceUpdateCount++;
          if (markPriceUpdateCount >= maxMarkPriceUpdates) {
            console.log(`\nReceived ${maxMarkPriceUpdates} updates, closing connection...`);
            break;
          }
        }
    
        await markPriceCandlesStream.close();
        console.log('Connection closed.');
        */
        // Example 3: Subscribe to 15-minute index price candles
        // Uncomment to test
        /*
        console.log('\n=== Subscribing to 15-minute index price candles for ETH-USD ===');
        const indexPriceCandlesStream = streamClient.subscribeToCandles({
          marketName: 'ETH-USD',
          candleType: 'index-prices',
          interval: 'PT15M', // 15 minutes
        });
        
        await indexPriceCandlesStream.connect();
        console.log('Connected. Listening for index price candles...\n');
    
        let indexPriceUpdateCount = 0;
        const maxIndexPriceUpdates = 5;
    
        for await (const candleUpdate of indexPriceCandlesStream) {
          console.log('Index Price Candle Update:');
          if (candleUpdate.data && candleUpdate.data.length > 0) {
            const candle = candleUpdate.data[0];
            console.log('  Timestamp:', new Date(candle.T).toISOString());
            console.log('  Open:', candle.o);
            console.log('  High:', candle.h);
            console.log('  Low:', candle.l);
            console.log('  Close:', candle.c);
          }
          console.log('---');
    
          indexPriceUpdateCount++;
          if (indexPriceUpdateCount >= maxIndexPriceUpdates) {
            console.log(`\nReceived ${maxIndexPriceUpdates} updates, closing connection...`);
            break;
          }
        }
    
        await indexPriceCandlesStream.close();
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
//# sourceMappingURL=20_ws_candles.js.map