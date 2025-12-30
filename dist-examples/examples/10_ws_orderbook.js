"use strict";
/**
 * WebSocket orderbook stream example
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const env_1 = require("../src/utils/env");
async function main() {
    console.log('Initializing WASM...');
    await (0, index_1.initWasm)();
    const env = (0, env_1.getX10EnvConfig)(false);
    const config = env.environment === 'mainnet' ? index_1.MAINNET_CONFIG : index_1.TESTNET_CONFIG;
    const streamClient = new index_1.PerpetualStreamClient({
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
//# sourceMappingURL=10_ws_orderbook.js.map