"use strict";
/**
 * Place one market and one limit order using environment variables
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const env_1 = require("../src/utils/env");
const decimal_js_1 = __importDefault(require("decimal.js"));
async function main() {
    await (0, index_1.initWasm)();
    const env = (0, env_1.getX10EnvConfig)(true);
    const config = env.environment === 'mainnet' ? index_1.MAINNET_CONFIG : index_1.TESTNET_CONFIG;
    const account = new index_1.StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
    const client = new index_1.PerpetualTradingClient(config, account);
    try {
        // Fetch markets info for price hints
        const marketsDict = await client.marketsInfo.getMarketsDict();
        // Prefer BTC-USD as it has smaller minimum order size
        const market = marketsDict['BTC-USD'] || marketsDict['ETH-USD'];
        if (!market) {
            throw new Error('BTC-USD or ETH-USD market not found');
        }
        // Choose market symbol
        const marketName = market.name;
        const limitMarketName = marketName;
        // Determine reference price from orderbook snapshot
        let refPrice = new decimal_js_1.default('0');
        let bestBid = null;
        let bestAsk = null;
        try {
            const ob = await client.marketsInfo.getOrderbookSnapshot(market.name);
            if (ob.data) {
                if (ob.data.asks && ob.data.asks.length > 0 && ob.data.asks[0].length > 0) {
                    bestAsk = new decimal_js_1.default(ob.data.asks[0][0]);
                }
                if (ob.data.bids && ob.data.bids.length > 0 && ob.data.bids[0].length > 0) {
                    bestBid = new decimal_js_1.default(ob.data.bids[0][0]);
                }
                // Use mid price if available
                if (bestBid && bestAsk && bestBid.gt(0) && bestAsk.gt(0)) {
                    refPrice = bestBid.add(bestAsk).div(2);
                }
                else if (bestAsk && bestAsk.gt(0)) {
                    refPrice = bestAsk;
                }
                else if (bestBid && bestBid.gt(0)) {
                    refPrice = bestBid;
                }
            }
        }
        catch { }
        // Fallback to index price from market data if available
        if (refPrice.eq(0)) {
            try {
                const indexPrice = market.indexPrice;
                if (indexPrice) {
                    refPrice = new decimal_js_1.default(indexPrice.toString());
                }
            }
            catch { }
        }
        // Last resort fallback - use reasonable defaults based on market
        if (refPrice.eq(0)) {
            refPrice = market.name.startsWith('BTC') ? new decimal_js_1.default('60000') : new decimal_js_1.default('3000');
        }
        // Use same small size as basic order example (0.001 BTC)
        const size = new decimal_js_1.default('0.001');
        // Place a limit order
        console.log(`\nPlacing LIMIT BUY on ${marketName}...`);
        const limitPrice = new decimal_js_1.default('60000'); // Same price as example 01
        const order = await client.placeOrder({
            marketName,
            amountOfSynthetic: size,
            price: limitPrice,
            side: index_1.OrderSide.BUY,
            timeInForce: index_1.TimeInForce.GTT,
            postOnly: true,
            reduceOnly: false,
        });
        console.log('Limit order placed:', JSON.stringify(order.data));
        if (order.data) {
            const orderId = typeof order.data.id === 'string'
                ? parseInt(order.data.id, 10)
                : order.data.id;
            console.log('Canceling limit order...');
            await client.orders.cancelOrder(orderId);
            console.log('Limit order canceled.');
        }
    }
    finally {
        await client.close();
    }
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=02_market_and_limit_env.js.map