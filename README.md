# Extended TypeScript Trading SDK

**⚠️ Unofficial SDK**: This is an **unofficial TypeScript SDK** for Extended Exchange, built and maintained by the community. It is not officially supported by Extended.

TypeScript client for [Extended Exchange API](https://api.docs.extended.exchange/).

## About Extended Exchange

Extended is a perpetual DEX (Decentralized Exchange), built by an ex-Revolut team. As of now, Extended offers perpetual contracts on both crypto and TradFi assets, with USDC as collateral and leverage of up to 100x.

This SDK provides full type safety and modern async/await patterns for interacting with the Extended Exchange API.

## Installation

```bash
npm install extended-typescript-sdk
```

## Prerequisites

- Node.js 18+ or TypeScript 5.3+
- **No Rust required** - The SDK ships with pre-built WASM signer

## Quick Start

### 1. Initialize the SDK

The SDK ships with pre-built WASM signer - no build step required!

```typescript
import {
  initWasm,
  TESTNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
} from 'extended-typescript-sdk';
import Decimal from 'decimal.js';

// Initialize WASM module (MUST be called before using any crypto functions)
// Automatically loads the correct WASM for Node.js or browser
await initWasm();

// Create a Stark account
const starkAccount = new StarkPerpetualAccount(
  vaultId,           // number
  privateKey,        // Hex string (e.g., "0x123...")
  publicKey,         // Hex string
  apiKey             // string
);

// Create trading client
const tradingClient = new PerpetualTradingClient(TESTNET_CONFIG, starkAccount);
```

### 2. Place an Order

```typescript
import { OrderSide } from 'extended-typescript-sdk';
import Decimal from 'decimal.js';

const placedOrder = await tradingClient.placeOrder({
  marketName: 'BTC-USD',
  amountOfSynthetic: new Decimal('1'),
  price: new Decimal('63000.1'),
  side: OrderSide.SELL,
});

console.log('Placed order:', placedOrder);

// Cancel the order
await tradingClient.orders.cancelOrder(placedOrder.id);
```

### 3. Get Account Information

```typescript
// Get balance
const balance = await tradingClient.account.getBalance();
console.log('Balance:', balance.toPrettyJson());

// Get positions
const positions = await tradingClient.account.getPositions();
console.log('Positions:', positions.toPrettyJson());

// Get open orders
const openOrders = await tradingClient.account.getOpenOrders();
console.log('Open orders:', openOrders.toPrettyJson());
```

### 4. Onboarding (User Client)

```typescript
import { UserClient, TESTNET_CONFIG } from 'extended-typescript-sdk';

// Create user client
const userClient = new UserClient(TESTNET_CONFIG, () => ethPrivateKey);

// Onboard new account
const account = await userClient.onboard();

// Get API key
const apiKey = await userClient.createAccountApiKey(account.account, 'My trading key');

// Use the account
const starkAccount = new StarkPerpetualAccount(
  account.account.l2Vault,
  account.l2KeyPair.privateHex,
  account.l2KeyPair.publicHex,
  apiKey
);

const client = new PerpetualTradingClient(TESTNET_CONFIG, starkAccount);
```

### 5. Stream Data

```typescript
import { PerpetualStreamClient, TESTNET_CONFIG } from 'extended-typescript-sdk';

const streamClient = new PerpetualStreamClient({
  apiUrl: TESTNET_CONFIG.streamUrl,
});

// Subscribe to orderbooks
const orderbookStream = streamClient.subscribeToOrderbooks({ marketName: 'BTC-USD' });
await orderbookStream.connect();

for await (const update of orderbookStream) {
  console.log('Orderbook update:', update);
}

// Subscribe to public trades
const tradesStream = streamClient.subscribeToPublicTrades('BTC-USD');
await tradesStream.connect();

for await (const trade of tradesStream) {
  console.log('Trade:', trade);
}

// Subscribe to funding rates
const fundingStream = streamClient.subscribeToFundingRates('BTC-USD');
await fundingStream.connect();

for await (const fundingUpdate of fundingStream) {
  console.log('Funding rate:', fundingUpdate);
}

// Subscribe to candles (OHLCV data)
const candlesStream = streamClient.subscribeToCandles({
  marketName: 'BTC-USD',
  candleType: 'trades', // 'trades', 'mark-prices', or 'index-prices'
  interval: 'PT1M', // ISO 8601 duration (PT1M, PT5M, PT15M, PT1H, etc.)
});
await candlesStream.connect();

for await (const candle of candlesStream) {
  console.log('Candle:', candle);
}

// Subscribe to mark price updates
const markPriceStream = streamClient.subscribeToMarkPrice('BTC-USD');
await markPriceStream.connect();

for await (const priceUpdate of markPriceStream) {
  console.log('Mark price:', priceUpdate);
}

// Subscribe to index price updates
const indexPriceStream = streamClient.subscribeToIndexPrice('BTC-USD');
await indexPriceStream.connect();

for await (const priceUpdate of indexPriceStream) {
  console.log('Index price:', priceUpdate);
}

// Subscribe to account updates (requires API key)
const accountStream = streamClient.subscribeToAccountUpdates(apiKey);
await accountStream.connect();

for await (const update of accountStream) {
  console.log('Account update:', update);
}
```

## WASM Signer

The SDK includes a pre-built WASM signer that works in both **Node.js** and **browser** environments. **No Rust installation is required to use the SDK.**

### Using the Pre-built Signer

The SDK ships with pre-built WASM files. Simply use the SDK:

```typescript
import { initWasm, sign } from 'extended-typescript-sdk';

await initWasm(); // Automatically loads the correct WASM for your environment
const [r, s] = sign(privateKey, msgHash);
```

The signer automatically detects your environment (Node.js or browser) and loads the appropriate WASM module.

### Custom Signer Support (Privy, Web3Auth, etc.)

The SDK supports **custom signers** for integration with remote signing services like Privy, Web3Auth, or hardware wallets:

```typescript
import { 
  CustomStarkSigner, 
  createStarkPerpetualAccountWithCustomSigner 
} from 'extended-typescript-sdk';

// Implement the CustomStarkSigner interface
class PrivyStarkSigner implements CustomStarkSigner {
  constructor(private privyClient: any, private walletId: string) {}
  
  async sign(msgHash: bigint): Promise<[bigint, bigint]> {
    const msgHashHex = '0x' + msgHash.toString(16);
    const signature = await this.privyClient.signStarknetMessage(
      this.walletId,
      msgHashHex
    );
    return [BigInt(signature.r), BigInt(signature.s)];
  }
}

// Create account with custom signer
const privySigner = new PrivyStarkSigner(privyClient, walletId);
const account = createStarkPerpetualAccountWithCustomSigner(
  vaultId,
  publicKeyHex,
  apiKey,
  privySigner
);

// Use normally - signing will be handled by Privy
const client = new PerpetualTradingClient(TESTNET_CONFIG, account);
```

See [examples/16_privy_integration.ts](./examples/16_privy_integration.ts) for a complete example.

### Building Your Own WASM Signer

If you want to build your own WASM signer (requires Rust and wasm-pack):

```bash
npm run build:signer:custom
```

**Prerequisites:**
1. Install Rust: https://www.rust-lang.org/tools/install
2. Install wasm-pack: `cargo install wasm-pack`

This will build both Node.js and browser targets and replace the shipped WASM signer.

### Implementation

The WASM signer uses `starknet-crypto` crate for cryptographic operations. It's production-ready and tested for compatibility with Extended Exchange API.

## API Documentation

### Trading Client

```typescript
import { PerpetualTradingClient, TESTNET_CONFIG } from 'extended-typescript-sdk';

const client = new PerpetualTradingClient(config, account);

// Place order
await client.placeOrder({
  marketName: 'BTC-USD',
  amountOfSynthetic: new Decimal('1'),
  price: new Decimal('63000'),
  side: OrderSide.BUY,
});

// Account module
await client.account.getBalance();
await client.account.getPositions();
await client.account.getOpenOrders();
await client.account.updateLeverage('BTC-USD', new Decimal('10'));

// Orders module
await client.orders.cancelOrder(orderId);
await client.orders.cancelOrderByExternalId(externalId);
await client.orders.massCancel({ markets: ['BTC-USD'] });

// Markets module
await client.marketsInfo.getMarkets();
await client.marketsInfo.getMarketStatistics('BTC-USD');
await client.marketsInfo.getOrderbookSnapshot('BTC-USD');
```

### User Client (Onboarding)

```typescript
import { UserClient } from 'extended-typescript-sdk';

const userClient = new UserClient(config, () => ethPrivateKey);

// Onboard new account
const account = await userClient.onboard();

// Onboard subaccount
const subaccount = await userClient.onboardSubaccount(1, 'My subaccount');

// Get all accounts
const accounts = await userClient.getAccounts();

// Create API key
const apiKey = await userClient.createAccountApiKey(account.account, 'description');
```

### Stream Client

```typescript
import { PerpetualStreamClient } from 'extended-typescript-sdk';

const streamClient = new PerpetualStreamClient({ apiUrl: config.streamUrl });

// Subscribe to orderbooks
const orderbookStream = streamClient.subscribeToOrderbooks({
  marketName: 'BTC-USD',
  depth: 10,
});

// Subscribe to public trades
const tradesStream = streamClient.subscribeToPublicTrades('BTC-USD');

// Subscribe to funding rates
const fundingStream = streamClient.subscribeToFundingRates('BTC-USD');

// Subscribe to account updates (requires API key)
const accountStream = streamClient.subscribeToAccountUpdates(apiKey);
```

## Environment Configuration

The SDK supports different environments:

```typescript
import { TESTNET_CONFIG, MAINNET_CONFIG } from 'extended-typescript-sdk';

// Use testnet
const client = new PerpetualTradingClient(TESTNET_CONFIG, account);

// Use mainnet
const client = new PerpetualTradingClient(MAINNET_CONFIG, account);
```

## TypeScript Support

This SDK is written in TypeScript and provides full type definitions. All types are exported:

```typescript
import {
  OrderSide,
  OrderType,
  OrderStatus,
  TimeInForce,
  StarkPerpetualAccount,
  PerpetualTradingClient,
  UserClient,
  PerpetualStreamClient,
  // ... and more
} from 'extended-typescript-sdk';
```

## Error Handling

The SDK provides specific error types:

```typescript
import {
  X10Error,
  RateLimitException,
  NotAuthorizedException,
  SubAccountExists,
} from 'extended-typescript-sdk';

try {
  await client.placeOrder({ ... });
} catch (error) {
  if (error instanceof RateLimitException) {
    // Handle rate limit
  } else if (error instanceof NotAuthorizedException) {
    // Handle authentication error
  }
}
```

## Examples

See `examples/` directory for complete examples:

- Basic order placement
- Onboarding flow
- Stream subscriptions
- Market data access
- Account management

## WASM Performance

The WASM signer provides ~90-95% of native Rust performance:

```
Native Rust:          ~50μs per signature
WASM (Rust):          ~55μs per signature  (10% slower)
Pure JavaScript:      ~500μs per signature (10x slower)
```

The performance difference is negligible in real-world applications.

## Building the SDK

### For Users (No Build Required)

The SDK ships with pre-built WASM signer - just install and use:

```bash
npm install extended-typescript-sdk
```

### For Developers

If you're developing the SDK or want to build your own WASM signer:

```bash
# Install dependencies
npm install

# Build WASM signer (requires Rust and wasm-pack)
npm run build:signer

# Build TypeScript
npm run build:ts

# Build everything
npm run build  # Builds both WASM signer and TypeScript

# Build custom WASM signer (for users who want to replace shipped WASM)
npm run build:signer:custom
```

### Build Commands

- `npm run build` - Builds WASM signer and TypeScript (full build)
- `npm run build:signer` - Builds WASM signer for both Node.js and browser
- `npm run build:signer:custom` - Build your own WASM signer (requires Rust)
- `npm run build:ts` - Build TypeScript only
- `npm run clean` - Clean all build artifacts

### Development Commands

```bash
# Run tests
npm test

# Lint
npm run lint

# Format code
npm run format
```

## Contributing

1. Clone the repository
2. Install dependencies: `npm install`
3. Install Rust and wasm-pack (only if building WASM signer)
4. Build: `npm run build`
5. Run tests: `npm test`

## License

MIT

## Support

For issues and questions:
- GitHub: https://github.com/Bvvvp009/Extended-TS-SDK
- Documentation: https://api.docs.extended.exchange/
- Extended Exchange: https://extended.exchange/

**Note**: This is an unofficial, community-maintained SDK. For official support, please contact Extended Exchange directly.

## Environment Support

- ✅ Node.js (v18+)
- ✅ Browsers (Chrome/Firefox/Safari/Edge)
- ✅ PWAs
- ✅ React Native (with polyfills or custom signer)
- ✅ Electron
- ⚠️ Native iOS/Android (via React Native or WebView)

Details and setup notes: see [ENVIRONMENT_SUPPORT.md](ENVIRONMENT_SUPPORT.md).

## API Coverage

See [API_COVERAGE.md](./API_COVERAGE.md) for complete API endpoint coverage analysis.

## Standalone Signer Functions

The cryptographic signer functions are exported from the main SDK package for standalone use:

```typescript
import { 
  initWasm, 
  sign, 
  pedersenHash,
  getOrderMsgHash,
  getTransferMsgHash,
  getWithdrawalMsgHash,
  generateKeypairFromEthSignature
} from 'extended-typescript-sdk';

// Initialize WASM module (required first!)
await initWasm();

// Sign a message hash
const privateKey = BigInt('0x...');
const msgHash = BigInt('0x...');
const [r, s] = sign(privateKey, msgHash);

// Compute Pedersen hash
const hash = pedersenHash(BigInt('0x123'), BigInt('0x456'));

// Generate order message hash (for custom order signing)
const orderHash = getOrderMsgHash({
  positionId: 12345,
  baseAssetId: '0x...',
  baseAmount: '1000000',
  // ... other order parameters
});

// Generate keypair from Ethereum signature (for onboarding)
const [privateKey, publicKey] = generateKeypairFromEthSignature(ethSignature);
```

All signer functions are documented with JSDoc comments. See the [signer source code](./src/perpetual/crypto/signer.ts) for detailed documentation.
