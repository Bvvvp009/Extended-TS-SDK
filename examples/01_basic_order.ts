/**
 * Basic order placement example
 */

import {
  initWasm,
  TESTNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
  OrderSide,
} from '../src/index';
import Decimal from 'decimal.js';

async function main() {
  // Initialize WASM (required!)
  await initWasm();

  // This example requires real credentials. Prefer examples/01_basic_order_env.ts.
  throw new Error('Use examples/01_basic_order_env.ts with environment variables for real orders.');

  // The legacy inline example with placeholders is intentionally disabled.
}

main().catch(console.error);





