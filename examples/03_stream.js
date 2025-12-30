"use strict";
/**
 * Stream subscription example
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
async function main() {
    // Initialize WASM (required!)
    await (0, index_1.initWasm)();
    const streamClient = new index_1.PerpetualStreamClient({
        apiUrl: index_1.TESTNET_CONFIG.streamUrl,
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
//# sourceMappingURL=03_stream.js.map