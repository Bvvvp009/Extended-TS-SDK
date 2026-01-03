# Changelog

All notable changes to the Extended TypeScript SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2026-01-03

### Fixed
- Fixed Vite/Rollup build errors when using the SDK in projects with bundlers
  - Added proper `exports` field in package.json for better module resolution
  - Added `module` field for ESM support
  - Added `sideEffects: false` for better tree-shaking

### Added
- Comprehensive bundler configuration guide (BUNDLER_CONFIG.md)
- Example Vite configuration file (vite.config.example.ts)
- Documentation for handling WASM files in various bundlers (Vite, Rollup, Webpack, Next.js)

## [0.0.1] - 2025-01-XX

### Added
- Initial release of Extended TypeScript SDK
- Full TypeScript type definitions for Extended Exchange API
- Pre-built WASM signer for cryptographic operations (no Rust build required)
- Support for both Node.js and browser environments
- Comprehensive trading client with order management
- Account management (balance, positions, orders, leverage)
- User client for account onboarding and API key management
- Stream client for real-time market data (orderbooks, trades, funding rates)
- Environment variable configuration support
- Comprehensive example suite (19 examples)
- Support for testnet and mainnet environments

### Features
- **Trading Operations**
  - Place limit and market orders
  - Cancel orders (by ID, external ID, or mass cancel)
  - Modify orders (cancel + replace pattern)
  - Support for Take Profit / Stop Loss orders
  - TWAP order execution examples
  - Position management (close single/all positions)
  - Leverage management

- **Account Management**
  - Account onboarding (new accounts and subaccounts)
  - API key creation and management
  - Balance and position queries
  - Transfer between sub-accounts
  - Leverage updates

- **Market Data**
  - Real-time orderbook streaming
  - Public trades streaming
  - Funding rates streaming
  - Account updates streaming
  - Market statistics and orderbook snapshots

- **Cryptographic Signing**
  - WASM-based StarkNet signature generation
  - Order message hash generation
  - L2 key derivation from L1 Ethereum keys
  - Automatic environment detection (Node.js/browser)

### Examples
- `01_basic_order_env.ts` - Basic order placement and cancellation
- `02_market_order_env.ts` - Market order placement using IOC time in force
- `02_market_and_limit_env.ts` - Limit order examples
- `02_onboarding_env.ts` - Account onboarding and API key creation
- `03_stream.ts` - Orderbook streaming
- `04_market_with_tpsl.ts` - Market orders with Take Profit/Stop Loss
- `05_limit_with_tpsl.ts` - Limit orders with Take Profit/Stop Loss
- `06_twap.ts` - Time-Weighted Average Price order execution
- `07_close_order.ts` - Cancel specific orders
- `08_close_position.ts` - Close single position
- `09_close_all_positions.ts` - Close all positions
- `10_ws_orderbook.ts` - WebSocket orderbook subscription
- `11_transfer_between_accounts.ts` - Transfer funds
- `13_modify_order.ts` - Modify existing orders
- `14_update_leverage.ts` - Update leverage settings
- `15_ws_trades.ts` - WebSocket public trades stream
- `_cancel_all_orders.ts` - Utility to cancel all orders

### Security
- All credentials loaded from environment variables (no hardcoded secrets)
- Test vectors clearly documented in test files
- Comprehensive `.gitignore` to prevent accidental secret commits
- Support for multiple environment variable naming conventions

### Documentation
- Comprehensive README with quick start guide
- API documentation with examples
- Example README with detailed usage instructions
- Environment variable template (`env.template`)
- TypeScript type definitions for all API models

### Dependencies
- `decimal.js` ^10.4.3 - Precise decimal arithmetic
- `dotenv` ^16.3.1 - Environment variable loading
- `ethers` ^6.9.0 - Ethereum wallet operations
- `ws` ^8.16.0 - WebSocket client

### Development
- TypeScript 5.3+ support
- ESLint configuration
- Prettier formatting
- Jest testing framework
- Comprehensive test suite

### Notes
- This is an **unofficial SDK** maintained by the community
- SDK ships with pre-built WASM files - no Rust build required for users
- All examples tested and verified
- Full backward compatibility with Extended Exchange API

---

## [Unreleased]

### Planned
- Additional order types support
- Enhanced error handling
- More comprehensive examples
- Performance optimizations

