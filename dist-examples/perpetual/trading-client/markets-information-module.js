"use strict";
/**
 * Markets information module for trading client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketsInformationModule = void 0;
const base_module_1 = require("./base-module");
const http_1 = require("../../utils/http");
const markets_1 = require("../markets");
const date_1 = require("../../utils/date");
/**
 * Markets information module for market data
 */
class MarketsInformationModule extends base_module_1.BaseModule {
    /**
     * Get markets
     * https://api.docs.extended.exchange/#get-markets
     */
    async getMarkets(options = {}) {
        const url = this.getUrl('/info/markets', {
            query: {
                market: options.marketNames,
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get markets as dictionary
     */
    async getMarketsDict() {
        const response = await this.getMarkets();
        if (!response.data) {
            return {};
        }
        const markets = {};
        for (const market of response.data) {
            // Hydrate plain JSON into proper model instances so getters work
            const model = Object.assign(new markets_1.MarketModel(), market);
            if (market.l2Config) {
                model.l2Config = Object.assign(model.l2Config ?? {}, market.l2Config);
            }
            if (market.tradingConfig) {
                model.tradingConfig = Object.assign(model.tradingConfig ?? {}, market.tradingConfig);
            }
            if (market.marketStats) {
                model.marketStats = Object.assign(model.marketStats ?? {}, market.marketStats);
            }
            markets[model.name] = model;
        }
        return markets;
    }
    /**
     * Get market statistics
     * https://api.docs.extended.exchange/#get-market-statistics
     */
    async getMarketStatistics(marketName) {
        const url = this.getUrl('/info/markets/<market>/stats', {
            pathParams: { market: marketName },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get candles history
     * https://api.docs.extended.exchange/#get-candles-history
     */
    async getCandlesHistory(options) {
        const url = this.getUrl('/info/candles/<market>/<candle_type>', {
            pathParams: {
                market: options.marketName,
                candle_type: options.candleType,
            },
            query: {
                interval: options.interval,
                limit: options.limit?.toString(),
                endTime: options.endTime ? (0, date_1.toEpochMillis)(options.endTime).toString() : undefined,
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get funding rates history
     * https://api.docs.extended.exchange/#get-funding-rates-history
     */
    async getFundingRatesHistory(options) {
        const url = this.getUrl('/info/<market>/funding', {
            pathParams: { market: options.marketName },
            query: {
                startTime: (0, date_1.toEpochMillis)(options.startTime).toString(),
                endTime: (0, date_1.toEpochMillis)(options.endTime).toString(),
            },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
    /**
     * Get orderbook snapshot
     * https://api.docs.extended.exchange/#get-market-order-book
     */
    async getOrderbookSnapshot(marketName) {
        const url = this.getUrl('/info/markets/<market>/orderbook', {
            pathParams: { market: marketName },
        });
        return await (0, http_1.sendGetRequest)(url, this.getApiKey());
    }
}
exports.MarketsInformationModule = MarketsInformationModule;
//# sourceMappingURL=markets-information-module.js.map