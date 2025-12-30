/**
 * Markets information module for trading client
 */
import { BaseModule } from './base-module';
import { WrappedApiResponse } from '../../utils/http';
import { MarketModel, MarketStatsModel } from '../markets';
/**
 * Markets information module for market data
 */
export declare class MarketsInformationModule extends BaseModule {
    /**
     * Get markets
     * https://api.docs.extended.exchange/#get-markets
     */
    getMarkets(options?: {
        marketNames?: string[];
    }): Promise<WrappedApiResponse<MarketModel[]>>;
    /**
     * Get markets as dictionary
     */
    getMarketsDict(): Promise<Record<string, MarketModel>>;
    /**
     * Get market statistics
     * https://api.docs.extended.exchange/#get-market-statistics
     */
    getMarketStatistics(marketName: string): Promise<WrappedApiResponse<MarketStatsModel>>;
    /**
     * Get candles history
     * https://api.docs.extended.exchange/#get-candles-history
     */
    getCandlesHistory(options: {
        marketName: string;
        candleType: string;
        interval: string;
        limit?: number;
        endTime?: Date;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get funding rates history
     * https://api.docs.extended.exchange/#get-funding-rates-history
     */
    getFundingRatesHistory(options: {
        marketName: string;
        startTime: Date;
        endTime: Date;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get orderbook snapshot
     * https://api.docs.extended.exchange/#get-market-order-book
     */
    getOrderbookSnapshot(marketName: string): Promise<WrappedApiResponse<any>>;
}
//# sourceMappingURL=markets-information-module.d.ts.map