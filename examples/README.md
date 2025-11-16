# Extended TypeScript SDK Examples

This directory contains example scripts demonstrating how to use the Extended TypeScript Trading SDK.

## Installation

Install the SDK from npm:

```bash
npm install x10-typescript-trading-starknet
```

Or if using the signer package standalone:

```bash
npm install @extended/signer
```

## Prerequisites

1. **Node.js 18+** and npm
2. **Rust** (for building WASM signer) - [Install Rust](https://www.rust-lang.org/tools/install)
3. **wasm-pack** - `cargo install wasm-pack`

## Setup

1. **Build the WASM signer** (required before running examples):

```bash
cd typescript-sdk
npm run build:wasm
```

2. **Set up environment variables**:

Create a `.env.local` file in the `typescript-sdk` directory:

```bash
X10_API_KEY=your_api_key_here
X10_PUBLIC_KEY=0x...
X10_PRIVATE_KEY=0x...
X10_VAULT_ID=123456
X10_BUILDER_ID=789012
ENVIRONMENT=testnet
```

See [ENV_SETUP.md](../ENV_SETUP.md) for detailed environment variable configuration.

## Running Examples

All examples use `ts-node` with the project's TypeScript configuration:

```bash
npx ts-node --project tsconfig.examples.json examples/01_basic_order_env.ts
```

## Example Files

### Basic Examples

- **01_basic_order_env.ts** - Place and cancel a basic order using environment variables
- **02_market_and_limit_env.ts** - Place limit orders (market and limit examples)

### Order Management

- **04_market_with_tpsl.ts** - Place order with Take Profit / Stop Loss
- **05_limit_with_tpsl.ts** - Place limit order with TP/SL
- **06_twap.ts** - Time-Weighted Average Price (TWAP) order execution
- **07_close_order.ts** - Cancel a specific order by ID
- **13_modify_order.ts** - Modify order using cancel + replace pattern

### Position Management

- **08_close_position.ts** - Close a single open position
- **09_close_all_positions.ts** - Close all open positions

### Account Management

- **02_onboarding_env.ts** - Onboard new account and create API key
- **11_transfer_between_accounts.ts** - Transfer funds between sub-accounts
- **14_update_leverage.ts** - Update leverage for a market

### Streaming

- **03_stream.ts** - Subscribe to orderbook stream
- **10_ws_orderbook.ts** - WebSocket orderbook subscription
- **15_ws_trades.ts** - WebSocket public trades stream

### Utilities

- **_cancel_all_orders.ts** - Utility to cancel all open orders

## Using the SDK from npm

### Full SDK Usage

```typescript
import {
  initWasm,
  TESTNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
  OrderSide,
} from 'x10-typescript-trading-starknet';
import Decimal from 'decimal.js';

async function main() {
  // Initialize WASM (required!)
  await initWasm();

  // Create account
  const account = new StarkPerpetualAccount(
    vaultId,
    privateKey,
    publicKey,
    apiKey
  );

  // Create trading client
  const client = new PerpetualTradingClient(TESTNET_CONFIG, account);

  // Place order
  const order = await client.placeOrder({
    marketName: 'BTC-USD',
    amountOfSynthetic: new Decimal('0.001'),
    price: new Decimal('60000'),
    side: OrderSide.BUY,
  });

  console.log('Order placed:', order.data?.id);
  
  await client.close();
}

main().catch(console.error);
```

### Standalone Signer Usage

If you only need cryptographic signing functionality:

```typescript
import { initWasm, sign, getOrderMsgHash } from 'x10-typescript-trading-starknet';

async function main() {
  // Initialize WASM module
  await initWasm();

  // Sign a message hash
  const privateKey = BigInt('0x...');
  const msgHash = BigInt('0x...');
  const [r, s] = sign(privateKey, msgHash);

  // Generate order message hash
  const orderHash = getOrderMsgHash({
    vaultId: 12345,
    marketName: 'BTC-USD',
    amountOfSynthetic: new Decimal('1'),
    price: new Decimal('60000'),
    side: OrderSide.BUY,
    nonce: 123456,
    expireTime: Date.now() + 3600000,
    // ... other parameters
  });

  console.log('Order hash:', orderHash.toString(16));
}

main().catch(console.error);
```

## Environment Variables

All examples that use `_env.ts` suffix read from environment variables. See [ENV_SETUP.md](../ENV_SETUP.md) for configuration details.

Required variables:
- `X10_API_KEY` - Your API key from Extended Exchange
- `X10_PUBLIC_KEY` - L2 public key (hex, starts with 0x)
- `X10_PRIVATE_KEY` - L2 private key (hex, starts with 0x)
- `X10_VAULT_ID` - Account vault ID (number)
- `ENVIRONMENT` - `testnet` or `mainnet` (defaults to testnet)

## Notes

- Examples use small order sizes suitable for testnet
- All examples include proper error handling
- Examples clean up orders/positions when possible
- Use `postOnly: true` for limit orders to avoid taking liquidity
- Always call `await client.close()` to clean up resources

## Troubleshooting

### WASM Not Initialized Error

Make sure to call `await initWasm()` before using any SDK functions:

```typescript
await initWasm(); // Must be called first!
```

### Build WASM Signer

If you see errors about missing WASM module:

```bash
cd typescript-sdk
npm run build:wasm
```

### Environment Variables Not Found

Ensure `.env.local` file exists in `typescript-sdk` directory with required variables.

## More Information

- [Main README](../README.md) - Full SDK documentation
- [Quick Start Guide](../QUICK_START.md) - Getting started guide
- [Environment Setup](../ENV_SETUP.md) - Environment variable configuration
- [Extended Exchange API Docs](https://api.docs.extended.exchange/) - Official API documentation

