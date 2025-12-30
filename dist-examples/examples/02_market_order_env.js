"use strict";
/**
 * Market order example using environment variables
 * Uses IOC (Immediate or Cancel) time in force to create market orders
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
    const env = (0, env_1.getX10EnvConfig)(true);
    const config = env.environment === 'mainnet' ? index_1.MAINNET_CONFIG : index_1.TESTNET_CONFIG;
    const { StarkPerpetualAccount } = await Promise.resolve().then(() => __importStar(require('../src/index')));
    const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
    const client = new index_1.PerpetualTradingClient(config, account);
    try {
        const marketName = 'BTC-USD';
        // Get current market price for reference
        let referencePrice = new decimal_js_1.default('60000'); // Fallback
        try {
            const orderbook = await client.marketsInfo.getOrderbookSnapshot(marketName);
            if (orderbook.data) {
                if (orderbook.data.asks && orderbook.data.asks.length > 0 && orderbook.data.asks[0].length > 0) {
                    referencePrice = new decimal_js_1.default(orderbook.data.asks[0][0]); // Use best ask for buy orders
                }
            }
        }
        catch (e) {
            console.log('Could not fetch orderbook, using fallback price');
        }
        const qty = new decimal_js_1.default('0.0001'); // Very small size to minimize cost
        console.log(`\nPlacing MARKET BUY order on ${marketName}...`);
        console.log(`Quantity: ${qty.toString()}, Reference price: ${referencePrice.toString()}`);
        console.log('Note: Market orders use IOC (Immediate or Cancel) time in force');
        // Market order: Use IOC time in force and reference price
        // The order will execute immediately at market price or cancel
        const order = await client.placeOrder({
            marketName,
            amountOfSynthetic: qty,
            price: referencePrice, // Reference price for market orders
            side: index_1.OrderSide.BUY,
            timeInForce: index_1.TimeInForce.IOC, // IOC makes it a market order
            reduceOnly: false,
        });
        if (order.data) {
            console.log('Market order placed successfully!');
            console.log('Order ID:', order.data.id);
            console.log('Order status:', order.data.status);
            console.log('Order details:', JSON.stringify(order.data, null, 2));
        }
        else {
            console.log('Order response:', order);
        }
    }
    catch (error) {
        console.error('Error placing market order:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
    finally {
        await client.close();
    }
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=02_market_order_env.js.map