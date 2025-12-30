/**
 * Perpetual stream client for WebSocket streaming
 */

import { PerpetualStreamConnection } from './perpetual-stream-connection';
import { WrappedStreamResponse } from '../../utils/http';
import { getUrl } from '../../utils/http';

/**
 * Perpetual Stream Client for X10 WebSocket v1
 */
export class PerpetualStreamClient {
  private apiUrl: string;

  constructor(options: { apiUrl: string }) {
    this.apiUrl = options.apiUrl;
  }

  /**
   * Subscribe to orderbooks stream
   * https://api.docs.extended.exchange/#orderbooks-stream
   */
  subscribeToOrderbooks(options: {
    marketName?: string;
    depth?: number;
  } = {}): PerpetualStreamConnection<any> {
    const path = options.marketName
      ? `/orderbooks/<market>`
      : '/orderbooks';
    
    const url = getUrl(`${this.apiUrl}${path}`, {
      pathParams: options.marketName ? { market: options.marketName } : undefined,
      query: options.depth ? { depth: options.depth.toString() } : undefined,
    });

    return new PerpetualStreamConnection(url);
  }

  /**
   * Subscribe to public trades stream
   * https://api.docs.extended.exchange/#trades-stream
   */
  subscribeToPublicTrades(marketName?: string): PerpetualStreamConnection<any> {
    const path = marketName ? '/publicTrades/<market>' : '/publicTrades';
    const url = getUrl(`${this.apiUrl}${path}`, {
      pathParams: marketName ? { market: marketName } : undefined,
    });

    return new PerpetualStreamConnection(url);
  }

  /**
   * Subscribe to funding rates stream
   * https://api.docs.extended.exchange/#funding-rates-stream
   */
  subscribeToFundingRates(marketName?: string): PerpetualStreamConnection<any> {
    const path = marketName ? '/funding/<market>' : '/funding';
    const url = getUrl(`${this.apiUrl}${path}`, {
      pathParams: marketName ? { market: marketName } : undefined,
    });

    return new PerpetualStreamConnection(url);
  }

  /**
   * Subscribe to candles stream
   * https://api.docs.extended.exchange/#candles-stream
   */
  subscribeToCandles(options: {
    marketName: string;
    candleType: string;
    interval: string;
  }): PerpetualStreamConnection<any> {
    const url = getUrl(`${this.apiUrl}/candles/<market>/<candle_type>`, {
      pathParams: {
        market: options.marketName,
        candle_type: options.candleType,
      },
      query: {
        interval: options.interval,
      },
    });

    return new PerpetualStreamConnection(url);
  }

  /**
   * Subscribe to mark price stream
   * https://api.docs.extended.exchange/#mark-price-stream
   * 
   * @param marketName - Optional market name. If not specified, subscribes to all markets
   * @returns PerpetualStreamConnection for mark price updates
   */
  subscribeToMarkPrice(marketName?: string): PerpetualStreamConnection<any> {
    const path = marketName ? '/prices/mark/<market>' : '/prices/mark';
    const url = getUrl(`${this.apiUrl}${path}`, {
      pathParams: marketName ? { market: marketName } : undefined,
    });

    return new PerpetualStreamConnection(url);
  }

  /**
   * Subscribe to index price stream
   * https://api.docs.extended.exchange/#index-price-stream
   * 
   * @param marketName - Optional market name. If not specified, subscribes to all markets
   * @returns PerpetualStreamConnection for index price updates
   */
  subscribeToIndexPrice(marketName?: string): PerpetualStreamConnection<any> {
    const path = marketName ? '/prices/index/<market>' : '/prices/index';
    const url = getUrl(`${this.apiUrl}${path}`, {
      pathParams: marketName ? { market: marketName } : undefined,
    });

    return new PerpetualStreamConnection(url);
  }

  /**
   * Subscribe to account updates stream
   * https://api.docs.extended.exchange/#account-updates-stream
   */
  subscribeToAccountUpdates(apiKey: string): PerpetualStreamConnection<any> {
    const url = getUrl(`${this.apiUrl}/account`, {});
    return new PerpetualStreamConnection(url, apiKey);
  }
}










