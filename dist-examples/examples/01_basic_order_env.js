"use strict";
/**
 * Basic order placement example using environment variables
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const env_1 = require("../src/utils/env");
const decimal_js_1 = __importDefault(require("decimal.js"));
async function main() {
    console.log('Initializing WASM...');
    await (0, index_1.initWasm)();
    console.log('WASM initialized!');
    // Load environment configuration
    const env = (0, env_1.getX10EnvConfig)(true);
    const config = env.environment === 'mainnet' ? index_1.MAINNET_CONFIG : index_1.TESTNET_CONFIG;
    console.log('Creating account...');
    const account = new index_1.StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
    console.log('Creating trading client...');
    const client = new index_1.PerpetualTradingClient(config, account);
    try {
        // Get balance
        console.log('\nFetching balance...');
        const balanceResponse = await client.account.getBalance();
        if (balanceResponse.data) {
            console.log('Balance:', JSON.stringify(balanceResponse.data));
        }
        // Get positions
        console.log('\nFetching positions...');
        const positionsResponse = await client.account.getPositions();
        if (positionsResponse.data) {
            console.log('Positions:', positionsResponse.data.length, 'open');
        }
        // Get open orders
        console.log('\nFetching open orders...');
        const ordersResponse = await client.account.getOpenOrders();
        if (ordersResponse.data) {
            console.log('Open orders:', ordersResponse.data.length);
        }
        // Get markets
        console.log('\nFetching markets...');
        const marketsResponse = await client.marketsInfo.getMarkets();
        if (marketsResponse.data) {
            console.log('Available markets count:', marketsResponse.data.length);
        }
        // Place a test order (small amount)
        console.log('\nPlacing test order...');
        const order = await client.placeOrder({
            marketName: 'BTC-USD',
            amountOfSynthetic: new decimal_js_1.default('0.001'),
            price: new decimal_js_1.default('60000'),
            side: index_1.OrderSide.BUY,
            // Optional safety on mainnet: uncomment to avoid taking liquidity
            // postOnly: true,
        });
        if (order.data) {
            console.log('Order placed successfully!');
            console.log('Order ID:', order.data.id);
            console.log('Order:', JSON.stringify(order.data));
            // Cancel the order
            console.log('\nCanceling order...');
            await client.orders.cancelOrder(typeof order.data.id === 'string' ? parseInt(order.data.id, 10) : order.data.id);
            console.log('Order canceled!');
        }
    }
    catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
    finally {
        // Cleanup
        await client.close();
    }
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=01_basic_order_env.js.map