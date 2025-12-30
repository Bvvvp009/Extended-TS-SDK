"use strict";
/**
 * Onboarding example
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
async function main() {
    // Initialize WASM (required!)
    await (0, index_1.initWasm)();
    // This example requires real credentials. Prefer examples/02_onboarding_env.ts.
    throw new Error('Use examples/02_onboarding_env.ts with environment variables for real onboarding.');
    // The legacy inline example with placeholders is intentionally disabled.
}
main().catch(console.error);
//# sourceMappingURL=02_onboarding.js.map