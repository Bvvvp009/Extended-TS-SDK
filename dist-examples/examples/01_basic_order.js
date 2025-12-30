"use strict";
/**
 * Basic order placement example
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
async function main() {
    // Initialize WASM (required!)
    await (0, index_1.initWasm)();
    // This example requires real credentials. Prefer examples/01_basic_order_env.ts.
    throw new Error('Use examples/01_basic_order_env.ts with environment variables for real orders.');
    // The legacy inline example with placeholders is intentionally disabled.
}
main().catch(console.error);
//# sourceMappingURL=01_basic_order.js.map