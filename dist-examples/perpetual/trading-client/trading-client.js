"use strict";
/**
 * Perpetual Trading Client
 * Main client for X10 Perpetual Trading API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerpetualTradingClient = void 0;
const order_object_1 = require("../order-object");
const date_1 = require("../../utils/date");
const account_module_1 = require("./account-module");
const order_management_module_1 = require("./order-management-module");
const markets_information_module_1 = require("./markets-information-module");
const info_module_1 = require("./info-module");
const testnet_module_1 = require("./testnet-module");
/**
 * Perpetual Trading Client for X10 REST API v1
 */
class PerpetualTradingClient {
    markets = null;
    starkAccount;
    infoModule;
    marketsInfoModule;
    accountModule;
    orderManagementModule;
    testnetModule;
    config;
    constructor(endpointConfig, starkAccount) {
        const apiKey = starkAccount?.getApiKey();
        this.config = endpointConfig;
        this.starkAccount = starkAccount;
        this.infoModule = new info_module_1.InfoModule(endpointConfig);
        this.marketsInfoModule = new markets_information_module_1.MarketsInformationModule(endpointConfig, { apiKey });
        this.accountModule = new account_module_1.AccountModule(endpointConfig, {
            apiKey,
            starkAccount,
        });
        this.orderManagementModule = new order_management_module_1.OrderManagementModule(endpointConfig, { apiKey });
        this.testnetModule = new testnet_module_1.TestnetModule(endpointConfig, apiKey, this.accountModule);
    }
    /**
     * Place an order
     */
    async placeOrder(options) {
        if (!this.starkAccount) {
            throw new Error('Stark account is not set');
        }
        if (!this.markets) {
            this.markets = await this.marketsInfoModule.getMarketsDict();
        }
        const market = this.markets[options.marketName];
        if (!market) {
            throw new Error(`Market ${options.marketName} not found`);
        }
        const expireTime = options.expireTime || (() => {
            const dt = new Date((0, date_1.utcNow)());
            dt.setHours(dt.getHours() + 1);
            return dt;
        })();
        const order = (0, order_object_1.createOrderObject)(this.starkAccount, market, options.amountOfSynthetic, options.price, options.side, this.config.starknetDomain, {
            postOnly: options.postOnly,
            previousOrderExternalId: options.previousOrderId,
            expireTime,
            orderExternalId: options.externalId,
            timeInForce: options.timeInForce,
            selfTradeProtectionLevel: options.selfTradeProtectionLevel,
            builderFee: options.builderFee,
            builderId: options.builderId,
            reduceOnly: options.reduceOnly,
            tpSlType: options.tpSlType,
            takeProfit: options.takeProfit,
            stopLoss: options.stopLoss,
        });
        return await this.orderManagementModule.placeOrder(await order);
    }
    /**
     * Close all sessions
     */
    async close() {
        await this.marketsInfoModule.closeSession();
        await this.accountModule.closeSession();
        await this.orderManagementModule.closeSession();
    }
    /**
     * Info module
     */
    get info() {
        return this.infoModule;
    }
    /**
     * Markets info module
     */
    get marketsInfo() {
        return this.marketsInfoModule;
    }
    /**
     * Account module
     */
    get account() {
        return this.accountModule;
    }
    /**
     * Orders module
     */
    get orders() {
        return this.orderManagementModule;
    }
    /**
     * Testnet module
     */
    get testnet() {
        return this.testnetModule;
    }
}
exports.PerpetualTradingClient = PerpetualTradingClient;
//# sourceMappingURL=trading-client.js.map