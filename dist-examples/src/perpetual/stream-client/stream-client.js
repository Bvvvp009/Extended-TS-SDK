"use strict";
/**
 * Perpetual stream client for WebSocket streaming
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerpetualStreamClient = void 0;
const perpetual_stream_connection_1 = require("./perpetual-stream-connection");
const http_1 = require("../../utils/http");
/**
 * Perpetual Stream Client for X10 WebSocket v1
 */
class PerpetualStreamClient {
    apiUrl;
    constructor(options) {
        this.apiUrl = options.apiUrl;
    }
    /**
     * Subscribe to orderbooks stream
     * https://api.docs.extended.exchange/#orderbooks-stream
     */
    subscribeToOrderbooks(options = {}) {
        const path = options.marketName
            ? `/orderbooks/<market>`
            : '/orderbooks';
        const url = (0, http_1.getUrl)(`${this.apiUrl}${path}`, {
            pathParams: options.marketName ? { market: options.marketName } : undefined,
            query: options.depth ? { depth: options.depth.toString() } : undefined,
        });
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url);
    }
    /**
     * Subscribe to public trades stream
     * https://api.docs.extended.exchange/#trades-stream
     */
    subscribeToPublicTrades(marketName) {
        const path = marketName ? '/publicTrades/<market>' : '/publicTrades';
        const url = (0, http_1.getUrl)(`${this.apiUrl}${path}`, {
            pathParams: marketName ? { market: marketName } : undefined,
        });
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url);
    }
    /**
     * Subscribe to funding rates stream
     * https://api.docs.extended.exchange/#funding-rates-stream
     */
    subscribeToFundingRates(marketName) {
        const path = marketName ? '/funding/<market>' : '/funding';
        const url = (0, http_1.getUrl)(`${this.apiUrl}${path}`, {
            pathParams: marketName ? { market: marketName } : undefined,
        });
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url);
    }
    /**
     * Subscribe to candles stream
     * https://api.docs.extended.exchange/#candles-stream
     */
    subscribeToCandles(options) {
        const url = (0, http_1.getUrl)(`${this.apiUrl}/candles/<market>/<candle_type>`, {
            pathParams: {
                market: options.marketName,
                candle_type: options.candleType,
            },
            query: {
                interval: options.interval,
            },
        });
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url);
    }
    /**
     * Subscribe to mark price stream
     * https://api.docs.extended.exchange/#mark-price-stream
     *
     * @param marketName - Optional market name. If not specified, subscribes to all markets
     * @returns PerpetualStreamConnection for mark price updates
     */
    subscribeToMarkPrice(marketName) {
        const path = marketName ? '/prices/mark/<market>' : '/prices/mark';
        const url = (0, http_1.getUrl)(`${this.apiUrl}${path}`, {
            pathParams: marketName ? { market: marketName } : undefined,
        });
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url);
    }
    /**
     * Subscribe to index price stream
     * https://api.docs.extended.exchange/#index-price-stream
     *
     * @param marketName - Optional market name. If not specified, subscribes to all markets
     * @returns PerpetualStreamConnection for index price updates
     */
    subscribeToIndexPrice(marketName) {
        const path = marketName ? '/prices/index/<market>' : '/prices/index';
        const url = (0, http_1.getUrl)(`${this.apiUrl}${path}`, {
            pathParams: marketName ? { market: marketName } : undefined,
        });
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url);
    }
    /**
     * Subscribe to account updates stream
     * https://api.docs.extended.exchange/#account-updates-stream
     */
    subscribeToAccountUpdates(apiKey) {
        const url = (0, http_1.getUrl)(`${this.apiUrl}/account`, {});
        return new perpetual_stream_connection_1.PerpetualStreamConnection(url, apiKey);
    }
}
exports.PerpetualStreamClient = PerpetualStreamClient;
//# sourceMappingURL=stream-client.js.map