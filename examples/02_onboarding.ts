/**
 * Onboarding example
 */

import {
  initWasm,
  TESTNET_CONFIG,
  UserClient,
  StarkPerpetualAccount,
  PerpetualTradingClient,
} from '../src/index';

async function main() {
  // Initialize WASM (required!)
  await initWasm();

  // This example requires real credentials. Prefer examples/02_onboarding_env.ts.
  throw new Error('Use examples/02_onboarding_env.ts with environment variables for real onboarding.');

  // The legacy inline example with placeholders is intentionally disabled.
}

main().catch(console.error);





