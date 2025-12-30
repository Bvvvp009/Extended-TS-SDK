/**
 * Perpetual stream client for WebSocket streaming
 */
import { PerpetualStreamConnection } from './perpetual-stream-connection';
/**
 * Perpetual Stream Client for X10 WebSocket v1
 */
export declare class PerpetualStreamClient {
    private apiUrl;
    constructor(options: {
        apiUrl: string;
    });
    /**
     * Subscribe to orderbooks stream
     * https://api.docs.extended.exchange/#orderbooks-stream
     */
    subscribeToOrderbooks(options?: {
        marketName?: string;
        depth?: number;
    }): PerpetualStreamConnection<any>;
    /**
     * Subscribe to public trades stream
     * https://api.docs.extended.exchange/#trades-stream
     */
    subscribeToPublicTrades(marketName?: string): PerpetualStreamConnection<any>;
    /**
     * Subscribe to funding rates stream
     * https://api.docs.extended.exchange/#funding-rates-stream
     */
    subscribeToFundingRates(marketName?: string): PerpetualStreamConnection<any>;
    /**
     * Subscribe to candles stream
     * https://api.docs.extended.exchange/#candles-stream
     */
    subscribeToCandles(options: {
        marketName: string;
        candleType: string;
        interval: string;
    }): PerpetualStreamConnection<any>;
    /**
     * Subscribe to mark price stream
     * https://api.docs.extended.exchange/#mark-price-stream
     *
     * @param marketName - Optional market name. If not specified, subscribes to all markets
     * @returns PerpetualStreamConnection for mark price updates
     */
    subscribeToMarkPrice(marketName?: string): PerpetualStreamConnection<any>;
    /**
     * Subscribe to index price stream
     * https://api.docs.extended.exchange/#index-price-stream
     *
     * @param marketName - Optional market name. If not specified, subscribes to all markets
     * @returns PerpetualStreamConnection for index price updates
     */
    subscribeToIndexPrice(marketName?: string): PerpetualStreamConnection<any>;
    /**
     * Subscribe to account updates stream
     * https://api.docs.extended.exchange/#account-updates-stream
     */
    subscribeToAccountUpdates(apiKey: string): PerpetualStreamConnection<any>;
}
//# sourceMappingURL=stream-client.d.ts.map