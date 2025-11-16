# Extended API Coverage Analysis

This document compares the Extended Exchange API documentation with the TypeScript SDK implementation.

## Public REST-API Endpoints

### ✅ Implemented

| Endpoint | Method | SDK Location | Status |
|----------|--------|--------------|--------|
| `/info/markets` | GET | `MarketsInformationModule.getMarkets()` | ✅ |
| `/info/markets/<market>/stats` | GET | `MarketsInformationModule.getMarketStatistics()` | ✅ |
| `/info/markets/<market>/orderbook` | GET | `MarketsInformationModule.getOrderbookSnapshot()` | ✅ |
| `/info/candles/<market>/<candle_type>` | GET | `MarketsInformationModule.getCandlesHistory()` | ✅ |
| `/info/<market>/funding` | GET | `MarketsInformationModule.getFundingRatesHistory()` | ✅ |

## Private REST-API Endpoints

### ✅ Implemented

| Endpoint | Method | SDK Location | Status |
|----------|--------|--------------|--------|
| `/user/account/info` | GET | `AccountModule.getAccount()` | ✅ |
| `/user/client/info` | GET | `AccountModule.getClient()` | ✅ |
| `/user/balance` | GET | `AccountModule.getBalance()` | ✅ |
| `/user/positions` | GET | `AccountModule.getPositions()` | ✅ |
| `/user/positions/history` | GET | `AccountModule.getPositionsHistory()` | ✅ |
| `/user/orders` | GET | `AccountModule.getOpenOrders()` | ✅ |
| `/user/orders/history` | GET | `AccountModule.getOrdersHistory()` | ✅ |
| `/user/orders/<order_id>` | GET | `AccountModule.getOrderById()` | ✅ |
| `/user/orders/external/<external_id>` | GET | `AccountModule.getOrderByExternalId()` | ✅ |
| `/user/trades` | GET | `AccountModule.getTrades()` | ✅ |
| `/user/fees` | GET | `AccountModule.getFees()` | ✅ |
| `/user/leverage` | GET | `AccountModule.getLeverage()` | ✅ |
| `/user/leverage` | PATCH | `AccountModule.updateLeverage()` | ✅ |
| `/user/order` | POST | `OrderManagementModule.placeOrder()` | ✅ |
| `/user/order/<order_id>` | DELETE | `OrderManagementModule.cancelOrder()` | ✅ |
| `/user/order` | DELETE | `OrderManagementModule.cancelOrderByExternalId()` | ✅ |
| `/user/order/massCancel` | POST | `OrderManagementModule.massCancel()` | ✅ |
| `/user/transfer/onchain` | POST | `AccountModule.transfer()` | ✅ |
| `/user/withdrawal` | POST | `AccountModule.withdraw()` | ✅ |
| `/user/assetOperations` | GET | `AccountModule.assetOperations()` | ✅ |
| `/user/bridge/config` | GET | `AccountModule.getBridgeConfig()` | ✅ |
| `/user/bridge/quote` | GET | `AccountModule.getBridgeQuote()` | ✅ |
| `/user/bridge/quote` | POST | `AccountModule.commitBridgeQuote()` | ✅ |
| `/user/deposit` | POST | `AccountModule.createDeposit()` | ✅ |
| `/user/deposits` | GET | `AccountModule.getDeposits()` | ✅ |
| `/user/withdrawals` | GET | `AccountModule.getWithdrawals()` | ✅ |
| `/user/transfers` | GET | `AccountModule.getTransfers()` | ✅ |

## WebSocket Streams

### ✅ Implemented

| Stream | SDK Location | Status |
|--------|--------------|--------|
| `/orderbooks` | `PerpetualStreamClient.subscribeToOrderbooks()` | ✅ |
| `/orderbooks/<market>` | `PerpetualStreamClient.subscribeToOrderbooks()` | ✅ |
| `/publicTrades` | `PerpetualStreamClient.subscribeToPublicTrades()` | ✅ |
| `/publicTrades/<market>` | `PerpetualStreamClient.subscribeToPublicTrades()` | ✅ |
| `/funding` | `PerpetualStreamClient.subscribeToFundingRates()` | ✅ |
| `/funding/<market>` | `PerpetualStreamClient.subscribeToFundingRates()` | ✅ |
| `/candles/<market>/<candle_type>` | `PerpetualStreamClient.subscribeToCandles()` | ✅ |
| `/account` | `PerpetualStreamClient.subscribeToAccountUpdates()` | ✅ |

## User Client (Onboarding)

### ✅ Implemented

| Endpoint | Method | SDK Location | Status |
|----------|--------|--------------|--------|
| `/auth/onboard` | POST | `UserClient.onboard()` | ✅ |
| `/auth/onboard/subaccount` | POST | `UserClient.onboardSubaccount()` | ✅ |
| `/api/v1/user/accounts` | GET | `UserClient.getAccounts()` | ✅ |
| `/api/v1/user/account/api-key` | POST | `UserClient.createAccountApiKey()` | ✅ |
| `/api/v1/user/account/api-key/<api_key_id>` | DELETE | `UserClient.deleteAccountApiKey()` | ✅ |
| `/api/v1/user/account/api-key` | GET | `UserClient.getAccountApiKeys()` | ✅ |

## Testnet Module

### ✅ Implemented

| Endpoint | Method | SDK Location | Status |
|----------|--------|--------------|--------|
| `/user/claim` | POST | `TestnetModule.claimTestingFunds()` | ✅ |
