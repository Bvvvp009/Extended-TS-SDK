/**
 * Candle models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';

/**
 * Candle type
 */
export type CandleType = 'trades' | 'mark-prices' | 'index-prices';

/**
 * Candle interval
 */
export type CandleInterval = 'PT1M' | 'PT5M' | 'PT15M' | 'PT30M' | 'PT1H' | 'PT2H' | 'PT4H' | 'P1D';

/**
 * Candle model
 */
export class CandleModel extends X10BaseModel {
  open: Decimal;
  low: Decimal;
  high: Decimal;
  close: Decimal;
  volume?: Decimal;
  timestamp: number;

  constructor(
    open: Decimal,
    low: Decimal,
    high: Decimal,
    close: Decimal,
    timestamp: number,
    volume?: Decimal
  ) {
    super();
    this.open = open;
    this.low = low;
    this.high = high;
    this.close = close;
    this.timestamp = timestamp;
    this.volume = volume;
  }
}







