"use strict";
/**
 * Close all open positions by placing reduceOnly market orders for each
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
        const positionsResponse = await client.account.getPositions();
        const positions = positionsResponse.data || [];
        if (!positions.length) {
            console.log('No open positions found.');
            return;
        }
        for (const p of positions) {
            const base = new decimal_js_1.default(p.positionBase);
            if (base.eq(0))
                continue;
            const marketName = p.market;
            const size = base.abs();
            const side = base.gt(0) ? index_1.OrderSide.SELL : index_1.OrderSide.BUY;
            const referencePrice = new decimal_js_1.default(p.markPrice || p.indexPrice || 60000);
            console.log(`Closing ${marketName} position size=${size.toString()} side=${side}`);
            const res = await client.placeOrder({
                marketName,
                amountOfSynthetic: size,
                price: referencePrice,
                side,
                reduceOnly: true,
                timeInForce: 1, // IOC
            });
            if (res.data) {
                console.log(`Close order placed for ${marketName}. ID:`, res.data.id);
            }
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
//# sourceMappingURL=09_close_all_positions.js.map