"use strict";
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetOperationStatus = exports.AssetOperationType = exports.Asset = exports.TradingConfigModel = exports.MarketStatsModel = exports.MarketModel = exports.OrderTpslTriggerParam = exports.createOrderObject = exports.TradeType = exports.PublicTradeModel = exports.AccountTradeModel = exports.ExitType = exports.PositionStatus = exports.PositionSide = exports.PositionHistoryModel = exports.PositionModel = exports.PerpetualStreamConnection = exports.PerpetualStreamClient = exports.StarkKeyPair = exports.UserClient = exports.TestnetModule = exports.InfoModule = exports.MarketsInformationModule = exports.OrderManagementModule = exports.AccountModule = exports.PerpetualTradingClient = exports.CreateOrderTpslTriggerModel = exports.OpenOrderModel = exports.PlacedOrderModel = exports.NewOrderModel = exports.OrderTriggerPriceType = exports.OrderPriceType = exports.SelfTradeProtectionLevel = exports.OrderTpslType = exports.TimeInForce = exports.OrderStatusReason = exports.OrderStatus = exports.OrderType = exports.OrderSide = exports.isCustomStarkSigner = exports.createStarkPerpetualAccountWithCustomSigner = exports.BalanceModel = exports.AccountLeverage = exports.AccountModel = exports.StarkPerpetualAccount = exports.MAINNET_CONFIG = exports.TESTNET_CONFIG = exports.StarknetDomain = exports.EndpointConfig = exports.initWasm = void 0;
exports.SDK_VERSION = exports.getWithdrawalMsgHash = exports.getTransferMsgHash = exports.getOrderMsgHash = exports.generateKeypairFromEthSignature = exports.pedersenHash = exports.sign = exports.toEpochMillis = exports.utcNow = exports.generateNonce = exports.SettlementSignatureModel = exports.X10BaseModel = exports.StreamDataType = exports.WrappedStreamResponse = exports.WrappedApiResponse = exports.SubAccountExists = exports.NotAuthorizedException = exports.RateLimitException = exports.X10Error = exports.DEFAULT_FEES = exports.TradingFeeModel = void 0;
// Initialize WASM module
var signer_1 = require("./perpetual/crypto/signer");
Object.defineProperty(exports, "initWasm", { enumerable: true, get: function () { return signer_1.initWasm; } });
// Configuration
var configuration_1 = require("./perpetual/configuration");
Object.defineProperty(exports, "EndpointConfig", { enumerable: true, get: function () { return configuration_1.EndpointConfig; } });
Object.defineProperty(exports, "StarknetDomain", { enumerable: true, get: function () { return configuration_1.StarknetDomain; } });
Object.defineProperty(exports, "TESTNET_CONFIG", { enumerable: true, get: function () { return configuration_1.TESTNET_CONFIG; } });
Object.defineProperty(exports, "MAINNET_CONFIG", { enumerable: true, get: function () { return configuration_1.MAINNET_CONFIG; } });
// Accounts
var accounts_1 = require("./perpetual/accounts");
Object.defineProperty(exports, "StarkPerpetualAccount", { enumerable: true, get: function () { return accounts_1.StarkPerpetualAccount; } });
Object.defineProperty(exports, "AccountModel", { enumerable: true, get: function () { return accounts_1.AccountModel; } });
Object.defineProperty(exports, "AccountLeverage", { enumerable: true, get: function () { return accounts_1.AccountLeverage; } });
Object.defineProperty(exports, "BalanceModel", { enumerable: true, get: function () { return accounts_1.BalanceModel; } });
Object.defineProperty(exports, "createStarkPerpetualAccountWithCustomSigner", { enumerable: true, get: function () { return accounts_1.createStarkPerpetualAccountWithCustomSigner; } });
// Custom Signer Support
var custom_signer_1 = require("./perpetual/custom-signer");
Object.defineProperty(exports, "isCustomStarkSigner", { enumerable: true, get: function () { return custom_signer_1.isCustomStarkSigner; } });
// Orders
var orders_1 = require("./perpetual/orders");
Object.defineProperty(exports, "OrderSide", { enumerable: true, get: function () { return orders_1.OrderSide; } });
Object.defineProperty(exports, "OrderType", { enumerable: true, get: function () { return orders_1.OrderType; } });
Object.defineProperty(exports, "OrderStatus", { enumerable: true, get: function () { return orders_1.OrderStatus; } });
Object.defineProperty(exports, "OrderStatusReason", { enumerable: true, get: function () { return orders_1.OrderStatusReason; } });
Object.defineProperty(exports, "TimeInForce", { enumerable: true, get: function () { return orders_1.TimeInForce; } });
Object.defineProperty(exports, "OrderTpslType", { enumerable: true, get: function () { return orders_1.OrderTpslType; } });
Object.defineProperty(exports, "SelfTradeProtectionLevel", { enumerable: true, get: function () { return orders_1.SelfTradeProtectionLevel; } });
Object.defineProperty(exports, "OrderPriceType", { enumerable: true, get: function () { return orders_1.OrderPriceType; } });
Object.defineProperty(exports, "OrderTriggerPriceType", { enumerable: true, get: function () { return orders_1.OrderTriggerPriceType; } });
Object.defineProperty(exports, "NewOrderModel", { enumerable: true, get: function () { return orders_1.NewOrderModel; } });
Object.defineProperty(exports, "PlacedOrderModel", { enumerable: true, get: function () { return orders_1.PlacedOrderModel; } });
Object.defineProperty(exports, "OpenOrderModel", { enumerable: true, get: function () { return orders_1.OpenOrderModel; } });
Object.defineProperty(exports, "CreateOrderTpslTriggerModel", { enumerable: true, get: function () { return orders_1.CreateOrderTpslTriggerModel; } });
// Trading Client
var trading_client_1 = require("./perpetual/trading-client/trading-client");
Object.defineProperty(exports, "PerpetualTradingClient", { enumerable: true, get: function () { return trading_client_1.PerpetualTradingClient; } });
var account_module_1 = require("./perpetual/trading-client/account-module");
Object.defineProperty(exports, "AccountModule", { enumerable: true, get: function () { return account_module_1.AccountModule; } });
var order_management_module_1 = require("./perpetual/trading-client/order-management-module");
Object.defineProperty(exports, "OrderManagementModule", { enumerable: true, get: function () { return order_management_module_1.OrderManagementModule; } });
var markets_information_module_1 = require("./perpetual/trading-client/markets-information-module");
Object.defineProperty(exports, "MarketsInformationModule", { enumerable: true, get: function () { return markets_information_module_1.MarketsInformationModule; } });
var info_module_1 = require("./perpetual/trading-client/info-module");
Object.defineProperty(exports, "InfoModule", { enumerable: true, get: function () { return info_module_1.InfoModule; } });
var testnet_module_1 = require("./perpetual/trading-client/testnet-module");
Object.defineProperty(exports, "TestnetModule", { enumerable: true, get: function () { return testnet_module_1.TestnetModule; } });
// User Client
var user_client_1 = require("./perpetual/user-client/user-client");
Object.defineProperty(exports, "UserClient", { enumerable: true, get: function () { return user_client_1.UserClient; } });
var onboarding_1 = require("./perpetual/user-client/onboarding");
Object.defineProperty(exports, "StarkKeyPair", { enumerable: true, get: function () { return onboarding_1.StarkKeyPair; } });
// Stream Client
var stream_client_1 = require("./perpetual/stream-client/stream-client");
Object.defineProperty(exports, "PerpetualStreamClient", { enumerable: true, get: function () { return stream_client_1.PerpetualStreamClient; } });
var perpetual_stream_connection_1 = require("./perpetual/stream-client/perpetual-stream-connection");
Object.defineProperty(exports, "PerpetualStreamConnection", { enumerable: true, get: function () { return perpetual_stream_connection_1.PerpetualStreamConnection; } });
// Positions & Trades
var positions_1 = require("./perpetual/positions");
Object.defineProperty(exports, "PositionModel", { enumerable: true, get: function () { return positions_1.PositionModel; } });
Object.defineProperty(exports, "PositionHistoryModel", { enumerable: true, get: function () { return positions_1.PositionHistoryModel; } });
Object.defineProperty(exports, "PositionSide", { enumerable: true, get: function () { return positions_1.PositionSide; } });
Object.defineProperty(exports, "PositionStatus", { enumerable: true, get: function () { return positions_1.PositionStatus; } });
Object.defineProperty(exports, "ExitType", { enumerable: true, get: function () { return positions_1.ExitType; } });
var trades_1 = require("./perpetual/trades");
Object.defineProperty(exports, "AccountTradeModel", { enumerable: true, get: function () { return trades_1.AccountTradeModel; } });
Object.defineProperty(exports, "PublicTradeModel", { enumerable: true, get: function () { return trades_1.PublicTradeModel; } });
Object.defineProperty(exports, "TradeType", { enumerable: true, get: function () { return trades_1.TradeType; } });
// Order Objects
var order_object_1 = require("./perpetual/order-object");
Object.defineProperty(exports, "createOrderObject", { enumerable: true, get: function () { return order_object_1.createOrderObject; } });
Object.defineProperty(exports, "OrderTpslTriggerParam", { enumerable: true, get: function () { return order_object_1.OrderTpslTriggerParam; } });
// Markets
var markets_1 = require("./perpetual/markets");
Object.defineProperty(exports, "MarketModel", { enumerable: true, get: function () { return markets_1.MarketModel; } });
Object.defineProperty(exports, "MarketStatsModel", { enumerable: true, get: function () { return markets_1.MarketStatsModel; } });
Object.defineProperty(exports, "TradingConfigModel", { enumerable: true, get: function () { return markets_1.TradingConfigModel; } });
// Assets
var assets_1 = require("./perpetual/assets");
Object.defineProperty(exports, "Asset", { enumerable: true, get: function () { return assets_1.Asset; } });
Object.defineProperty(exports, "AssetOperationType", { enumerable: true, get: function () { return assets_1.AssetOperationType; } });
Object.defineProperty(exports, "AssetOperationStatus", { enumerable: true, get: function () { return assets_1.AssetOperationStatus; } });
// Fees
var fees_1 = require("./perpetual/fees");
Object.defineProperty(exports, "TradingFeeModel", { enumerable: true, get: function () { return fees_1.TradingFeeModel; } });
Object.defineProperty(exports, "DEFAULT_FEES", { enumerable: true, get: function () { return fees_1.DEFAULT_FEES; } });
// Errors
var errors_1 = require("./errors");
Object.defineProperty(exports, "X10Error", { enumerable: true, get: function () { return errors_1.X10Error; } });
Object.defineProperty(exports, "RateLimitException", { enumerable: true, get: function () { return errors_1.RateLimitException; } });
Object.defineProperty(exports, "NotAuthorizedException", { enumerable: true, get: function () { return errors_1.NotAuthorizedException; } });
Object.defineProperty(exports, "SubAccountExists", { enumerable: true, get: function () { return errors_1.SubAccountExists; } });
// Utils
var http_1 = require("./utils/http");
Object.defineProperty(exports, "WrappedApiResponse", { enumerable: true, get: function () { return http_1.WrappedApiResponse; } });
Object.defineProperty(exports, "WrappedStreamResponse", { enumerable: true, get: function () { return http_1.WrappedStreamResponse; } });
Object.defineProperty(exports, "StreamDataType", { enumerable: true, get: function () { return http_1.StreamDataType; } });
var model_1 = require("./utils/model");
Object.defineProperty(exports, "X10BaseModel", { enumerable: true, get: function () { return model_1.X10BaseModel; } });
Object.defineProperty(exports, "SettlementSignatureModel", { enumerable: true, get: function () { return model_1.SettlementSignatureModel; } });
var nonce_1 = require("./utils/nonce");
Object.defineProperty(exports, "generateNonce", { enumerable: true, get: function () { return nonce_1.generateNonce; } });
var date_1 = require("./utils/date");
Object.defineProperty(exports, "utcNow", { enumerable: true, get: function () { return date_1.utcNow; } });
Object.defineProperty(exports, "toEpochMillis", { enumerable: true, get: function () { return date_1.toEpochMillis; } });
// Utils
__exportStar(require("./utils/env"), exports);
// Cryptographic Signer Functions (exported for standalone use)
var signer_2 = require("./perpetual/crypto/signer");
Object.defineProperty(exports, "sign", { enumerable: true, get: function () { return signer_2.sign; } });
Object.defineProperty(exports, "pedersenHash", { enumerable: true, get: function () { return signer_2.pedersenHash; } });
Object.defineProperty(exports, "generateKeypairFromEthSignature", { enumerable: true, get: function () { return signer_2.generateKeypairFromEthSignature; } });
Object.defineProperty(exports, "getOrderMsgHash", { enumerable: true, get: function () { return signer_2.getOrderMsgHash; } });
Object.defineProperty(exports, "getTransferMsgHash", { enumerable: true, get: function () { return signer_2.getTransferMsgHash; } });
Object.defineProperty(exports, "getWithdrawalMsgHash", { enumerable: true, get: function () { return signer_2.getWithdrawalMsgHash; } });
// Version
exports.SDK_VERSION = '0.0.1';
//# sourceMappingURL=index.js.map