"use strict";
/**
 * WebSocket public trades stream example
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
//# sourceMappingURL=15_ws_trades.js.map