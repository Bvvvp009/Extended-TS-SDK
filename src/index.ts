/**
 * Extended TypeScript Trading SDK
 * 
 * Unofficial TypeScript client for Extended Exchange API
 * Built and maintained by the community
 * 
 * Extended is a perpetual DEX, built by an ex-Revolut team.
 * Extended offers perpetual contracts on both crypto and TradFi assets,
 * with USDC as collateral and leverage of up to 100x.
 */

// Initialize WASM module
export { initWasm } from './perpetual/crypto/signer';

// Configuration
export { EndpointConfig, StarknetDomain, TESTNET_CONFIG, MAINNET_CONFIG } from './perpetual/configuration';

// Accounts
export { 
  StarkPerpetualAccount, 
  AccountModel, 
  AccountLeverage, 
  BalanceModel,
  createStarkPerpetualAccountWithCustomSigner
} from './perpetual/accounts';

// Custom Signer Support
export { 
  CustomStarkSigner, 
  SignatureResult, 
  isCustomStarkSigner 
} from './perpetual/custom-signer';

// Orders
export {
  OrderSide,
  OrderType,
  OrderStatus,
  OrderStatusReason,
  TimeInForce,
  OrderTpslType,
  SelfTradeProtectionLevel,
  OrderPriceType,
  OrderTriggerPriceType,
  NewOrderModel,
  PlacedOrderModel,
  OpenOrderModel,
  CreateOrderTpslTriggerModel,
} from './perpetual/orders';

// Trading Client
export { PerpetualTradingClient } from './perpetual/trading-client/trading-client';
export { AccountModule } from './perpetual/trading-client/account-module';
export { OrderManagementModule } from './perpetual/trading-client/order-management-module';
export { MarketsInformationModule } from './perpetual/trading-client/markets-information-module';
export { InfoModule } from './perpetual/trading-client/info-module';
export { TestnetModule } from './perpetual/trading-client/testnet-module';

// User Client
export { UserClient } from './perpetual/user-client/user-client';
export { OnBoardedAccount, StarkKeyPair } from './perpetual/user-client/onboarding';

// Stream Client
export { PerpetualStreamClient } from './perpetual/stream-client/stream-client';
export { PerpetualStreamConnection } from './perpetual/stream-client/perpetual-stream-connection';

// Positions & Trades
export { PositionModel, PositionHistoryModel, PositionSide, PositionStatus, ExitType } from './perpetual/positions';
export { AccountTradeModel, PublicTradeModel, TradeType } from './perpetual/trades';

// Order Objects
export { createOrderObject, OrderTpslTriggerParam } from './perpetual/order-object';

// Markets
export { MarketModel, MarketStatsModel, TradingConfigModel } from './perpetual/markets';

// Assets
export { Asset, AssetOperationType, AssetOperationStatus } from './perpetual/assets';

// Fees
export { TradingFeeModel, DEFAULT_FEES } from './perpetual/fees';

// Errors
export { X10Error, RateLimitException, NotAuthorizedException, SubAccountExists } from './errors';

// Utils
export { WrappedApiResponse, WrappedStreamResponse, StreamDataType } from './utils/http';
export { X10BaseModel, SettlementSignatureModel } from './utils/model';
export { generateNonce } from './utils/nonce';
export { utcNow, toEpochMillis } from './utils/date';

// Utils
export * from './utils/env';

// Cryptographic Signer Functions (exported for standalone use)
export {
  sign,
  pedersenHash,
  generateKeypairFromEthSignature,
  getOrderMsgHash,
  getTransferMsgHash,
  getWithdrawalMsgHash,
} from './perpetual/crypto/signer';

// Version
export const SDK_VERSION = '0.0.1';

