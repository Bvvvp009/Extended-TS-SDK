"use strict";
/**
 * Market order with TP/SL example (env-based)
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
    // Reuse the account builder from 01_basic_order_env.ts
    const { StarkPerpetualAccount } = await Promise.resolve().then(() => __importStar(require('../src/index')));
    const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
    const client = new index_1.PerpetualTradingClient(config, account);
    try {
        const marketName = 'BTC-USD';
        const qty = new decimal_js_1.default('0.001'); // Use minimum order size
        // Use fixed price like basic example (which works)
        const referencePrice = new decimal_js_1.default('60000');
        const tick = new decimal_js_1.default('0.01'); // BTC-USD tick size
        // Use same price as example 01 for consistency
        const orderPrice = referencePrice;
        console.log('\nPlacing LIMIT order with TP/SL (postOnly)...');
        // Calculate TP/SL prices with proper tick precision
        const tpTrigger = referencePrice.mul(1.01).div(tick).toDecimalPlaces(0, decimal_js_1.default.ROUND_UP).mul(tick);
        const tpPrice = referencePrice.mul(1.01).div(tick).toDecimalPlaces(0, decimal_js_1.default.ROUND_UP).mul(tick);
        const slTrigger = referencePrice.mul(0.99).div(tick).toDecimalPlaces(0, decimal_js_1.default.ROUND_DOWN).mul(tick);
        const slPrice = referencePrice.mul(0.99).div(tick).toDecimalPlaces(0, decimal_js_1.default.ROUND_DOWN).mul(tick);
        const res = await client.placeOrder({
            marketName,
            amountOfSynthetic: qty,
            price: orderPrice,
            side: index_1.OrderSide.BUY,
            timeInForce: index_1.TimeInForce.GTT,
            postOnly: true,
            tpSlType: index_1.OrderTpslType.ORDER,
            takeProfit: {
                triggerPrice: tpTrigger,
                triggerPriceType: index_1.OrderTriggerPriceType.MARK,
                price: tpPrice,
                priceType: index_1.OrderPriceType.LIMIT,
            },
            stopLoss: {
                triggerPrice: slTrigger,
                triggerPriceType: index_1.OrderTriggerPriceType.MARK,
                price: slPrice,
                priceType: index_1.OrderPriceType.LIMIT,
            },
        });
        if (res.data) {
            console.log('Order placed (LIMIT with TP/SL). ID:', res.data.id);
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
//# sourceMappingURL=04_market_with_tpsl.js.map