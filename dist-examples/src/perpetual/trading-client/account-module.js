"use strict";
/**
 * Account module for trading client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountModule = void 0;
const base_module_1 = require("./base-module");
const http_1 = require("../../utils/http");
const accounts_1 = require("../accounts");
const transfer_object_1 = require("../transfer-object");
const withdrawal_object_1 = require("../withdrawal-object");
/**
 * Account module for managing account operations
 */
class AccountModule extends base_module_1.BaseModule {
    /**
     * Get account information
     */
    async getAccount() {
        const url = this.getUrl('/user/account/info');
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get client information
     */
    async getClient() {
        const url = this.getUrl('/user/client/info');
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get account balance
     * https://api.docs.extended.exchange/#get-balance
     */
    async getBalance() {
        const url = this.getUrl('/user/balance');
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get positions
     * https://api.docs.extended.exchange/#get-positions
     */
    async getPositions(options = {}) {
        const url = this.getUrl('/user/positions', {
            query: {
                market: options.marketNames,
                side: options.positionSide ? [options.positionSide] : undefined,
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get positions history
     * https://api.docs.extended.exchange/#get-positions-history
     */
    async getPositionsHistory(options = {}) {
        const url = this.getUrl('/user/positions/history', {
            query: {
                market: options.marketNames,
                side: options.positionSide ? [options.positionSide] : undefined,
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get open orders
     * https://api.docs.extended.exchange/#get-open-orders
     */
    async getOpenOrders(options = {}) {
        const url = this.getUrl('/user/orders', {
            query: {
                market: options.marketNames,
                type: options.orderType ? [options.orderType] : undefined,
                side: options.orderSide ? [options.orderSide] : undefined,
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get orders history
     * https://api.docs.extended.exchange/#get-orders-history
     */
    async getOrdersHistory(options = {}) {
        const url = this.getUrl('/user/orders/history', {
            query: {
                market: options.marketNames,
                type: options.orderType ? [options.orderType] : undefined,
                side: options.orderSide ? [options.orderSide] : undefined,
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get order by ID
     * https://api.docs.extended.exchange/#get-order-by-id
     */
    async getOrderById(orderId) {
        const url = this.getUrl('/user/orders/<order_id>', {
            pathParams: { order_id: orderId },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get order by external ID
     * https://api.docs.extended.exchange/#get-order-by-external-id
     */
    async getOrderByExternalId(externalId) {
        const url = this.getUrl('/user/orders/external/<external_id>', {
            pathParams: { external_id: externalId },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get trades
     * https://api.docs.extended.exchange/#get-trades
     */
    async getTrades(options) {
        const url = this.getUrl('/user/trades', {
            query: {
                market: options.marketNames,
                side: options.tradeSide ? [options.tradeSide] : undefined,
                type: options.tradeType ? [options.tradeType] : undefined,
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get fees
     * https://api.docs.extended.exchange/#get-fees
     */
    async getFees(options) {
        const url = this.getUrl('/user/fees', {
            query: {
                market: options.marketNames,
                builderId: options.builderId?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get leverage
     * https://api.docs.extended.exchange/#get-current-leverage
     */
    async getLeverage(marketNames) {
        const url = this.getUrl('/user/leverage', {
            query: {
                market: marketNames,
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Update leverage
     * https://api.docs.extended.exchange/#update-leverage
     */
    async updateLeverage(marketName, leverage) {
        const url = this.getUrl('/user/leverage');
        const requestModel = new accounts_1.AccountLeverage(marketName, leverage);
        return await (0, http_1.sendPatchRequest)(url, requestModel.toApiRequestJson(), this.getApiKey());
    }
    /**
     * Get asset operations
     */
    async assetOperations(options = {}) {
        const url = this.getUrl('/user/assetOperations', {
            query: {
                type: options.operationsType,
                status: options.operationsStatus,
                startTime: options.startTime?.toString(),
                endTime: options.endTime?.toString(),
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
                id: options.id?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get bridge config
     */
    async getBridgeConfig() {
        const url = this.getUrl('/user/bridge/config');
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get bridge quote
     */
    async getBridgeQuote(chainIn, chainOut, amount) {
        const url = this.getUrl('/user/bridge/quote', {
            query: {
                chainIn,
                chainOut,
                amount: amount.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Commit bridge quote
     */
    async commitBridgeQuote(id) {
        const url = this.getUrl('/user/bridge/quote', {
            query: { id },
        });
        return await (0, http_1.sendPostRequest)(url, undefined, this.getApiKey());
    }
    /**
     * Transfer
     */
    async transfer(options) {
        const fromVault = this.getStarkAccount().getVault();
        const url = this.getUrl('/user/transfer/onchain');
        const toL2KeyNum = typeof options.toL2Key === 'string' ? parseInt(options.toL2Key, 16) : options.toL2Key;
        const requestModel = await (0, transfer_object_1.createTransferObject)(fromVault, options.toVault, toL2KeyNum, options.amount, this.getEndpointConfig(), this.getStarkAccount(), options.nonce);
        return await (0, http_1.sendPostRequest)(url, requestModel.toApiRequestJson(), this.getApiKey());
    }
    /**
     * Withdraw
     */
    async withdraw(options) {
        const url = this.getUrl('/user/withdrawal');
        const accountResponse = await this.getAccount();
        const account = accountResponse.data;
        if (!account) {
            throw new Error('Account not found');
        }
        const chainId = options.chainId || 'STRK';
        if (!options.quoteId && chainId !== 'STRK') {
            throw new Error('quote_id is required for EVM withdrawals');
        }
        let recipientStarkAddress = options.starkAddress;
        if (!recipientStarkAddress) {
            if (chainId === 'STRK') {
                const clientResponse = await this.getClient();
                const client = clientResponse.data;
                if (!client) {
                    throw new Error('Client not found');
                }
                if (!client.starknetWalletAddress) {
                    throw new Error('Client does not have attached starknet_wallet_address. Cannot determine withdrawal address.');
                }
                recipientStarkAddress = client.starknetWalletAddress;
            }
            else {
                if (!account.bridgeStarknetAddress) {
                    throw new Error('Account bridge_starknet_address not found');
                }
                recipientStarkAddress = account.bridgeStarknetAddress;
            }
        }
        if (!recipientStarkAddress) {
            throw new Error('Recipient stark address not found');
        }
        const requestModel = await (0, withdrawal_object_1.createWithdrawalObject)(options.amount, recipientStarkAddress, this.getStarkAccount(), this.getEndpointConfig(), account.id, chainId, undefined, options.nonce, options.quoteId);
        return await (0, http_1.sendPostRequest)(url, requestModel.toApiRequestJson(), this.getApiKey());
    }
    /**
     * Create deposit
     * https://api.docs.extended.exchange/#create-deposit
     */
    async createDeposit(options) {
        const url = this.getUrl('/user/deposit');
        const accountResponse = await this.getAccount();
        const account = accountResponse.data;
        if (!account) {
            throw new Error('Account not found');
        }
        const chainId = options.chainId || 'STRK';
        if (!options.quoteId && chainId !== 'STRK') {
            throw new Error('quote_id is required for EVM deposits');
        }
        let recipientStarkAddress = options.starkAddress;
        if (!recipientStarkAddress) {
            if (chainId === 'STRK') {
                const clientResponse = await this.getClient();
                const client = clientResponse.data;
                if (!client) {
                    throw new Error('Client not found');
                }
                if (!client.starknetWalletAddress) {
                    throw new Error('Client does not have attached starknet_wallet_address. Cannot determine deposit address.');
                }
                recipientStarkAddress = client.starknetWalletAddress;
            }
            else {
                if (!account.bridgeStarknetAddress) {
                    throw new Error('Account bridge_starknet_address not found');
                }
                recipientStarkAddress = account.bridgeStarknetAddress;
            }
        }
        if (!recipientStarkAddress) {
            throw new Error('Recipient stark address not found');
        }
        const requestBody = {
            amount: options.amount.toString(),
            chainId,
            starkAddress: recipientStarkAddress,
        };
        if (options.quoteId) {
            requestBody.quoteId = options.quoteId;
        }
        return await (0, http_1.sendPostRequest)(url, requestBody, this.getApiKey());
    }
    /**
     * Get deposits list
     * https://api.docs.extended.exchange/#get-deposits
     */
    async getDeposits(options = {}) {
        const url = this.getUrl('/user/deposits', {
            query: {
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
                startTime: options.startTime?.toString(),
                endTime: options.endTime?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get withdrawals list
     * https://api.docs.extended.exchange/#get-withdrawals
     */
    async getWithdrawals(options = {}) {
        const url = this.getUrl('/user/withdrawals', {
            query: {
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
                startTime: options.startTime?.toString(),
                endTime: options.endTime?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get transfers list
     * https://api.docs.extended.exchange/#get-transfers
     */
    async getTransfers(options = {}) {
        const url = this.getUrl('/user/transfers', {
            query: {
                cursor: options.cursor?.toString(),
                limit: options.limit?.toString(),
                startTime: options.startTime?.toString(),
                endTime: options.endTime?.toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
}
exports.AccountModule = AccountModule;
//# sourceMappingURL=account-module.js.map