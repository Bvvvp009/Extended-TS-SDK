/**
 * Markets information module for trading client
 */

import { BaseModule } from './base-module.js';
import { WrappedApiResponse, sendGetRequest } from '../../utils/http.js';
import { MarketModel, MarketStatsModel } from '../markets.js';
import { toEpochMillis } from '../../utils/date.js';

/**
 * Markets information module for market data
 */
export class MarketsInformationModule extends BaseModule {
  /**
   * Get markets
   * https://api.docs.extended.exchange/#get-markets
   */
  async getMarkets(options: {
    marketNames?: string[];
  } = {}): Promise<WrappedApiResponse<MarketModel[]>> {
    const url = this.getUrl('/info/markets', {
      query: {
        market: options.marketNames,
      },
    });
    return await sendGetRequest<MarketModel[]>(url, this.getApiKey());
  }

  /**
   * Get markets as dictionary
   */
  async getMarketsDict(): Promise<Record<string, MarketModel>> {
    const response = await this.getMarkets();
    if (!response.data) {
      return {};
    }
		const markets: Record<string, MarketModel> = {};
		for (const market of response.data) {
			// Hydrate plain JSON into proper model instances so getters work
			const model = Object.assign(new MarketModel(), market);
			if ((market as any).l2Config) {
				model.l2Config = Object.assign((model as any).l2Config ?? {}, (market as any).l2Config);
			}
			if ((market as any).tradingConfig) {
				model.tradingConfig = Object.assign((model as any).tradingConfig ?? {}, (market as any).tradingConfig);
			}
			if ((market as any).marketStats) {
				model.marketStats = Object.assign((model as any).marketStats ?? {}, (market as any).marketStats);
			}
			markets[model.name] = model;
		}
    return markets;
  }

  /**
   * Get market statistics
   * https://api.docs.extended.exchange/#get-market-statistics
   */
  async getMarketStatistics(marketName: string): Promise<WrappedApiResponse<MarketStatsModel>> {
    const url = this.getUrl('/info/markets/<market>/stats', {
      pathParams: { market: marketName },
    });
    return await sendGetRequest<MarketStatsModel>(url, this.getApiKey());
  }

  /**
   * Get candles history
   * https://api.docs.extended.exchange/#get-candles-history
   */
  async getCandlesHistory(options: {
    marketName: string;
    candleType: string;
    interval: string;
    limit?: number;
    endTime?: Date;
  }): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/info/candles/<market>/<candle_type>', {
      pathParams: {
        market: options.marketName,
        candle_type: options.candleType,
      },
      query: {
        interval: options.interval,
        limit: options.limit?.toString(),
        endTime: options.endTime ? toEpochMillis(options.endTime).toString() : undefined,
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get funding rates history
   * https://api.docs.extended.exchange/#get-funding-rates-history
   */
  async getFundingRatesHistory(options: {
    marketName: string;
    startTime: Date;
    endTime: Date;
  }): Promise<WrappedApiResponse<any[]>> {
    const url = this.getUrl('/info/<market>/funding', {
      pathParams: { market: options.marketName },
      query: {
        startTime: toEpochMillis(options.startTime).toString(),
        endTime: toEpochMillis(options.endTime).toString(),
      },
    });
    return await sendGetRequest<any[]>(url, this.getApiKey());
  }

  /**
   * Get orderbook snapshot
   * https://api.docs.extended.exchange/#get-market-order-book
   */
  async getOrderbookSnapshot(marketName: string): Promise<WrappedApiResponse<any>> {
    const url = this.getUrl('/info/markets/<market>/orderbook', {
      pathParams: { market: marketName },
    });
    return await sendGetRequest<any>(url, this.getApiKey());
  }
}



