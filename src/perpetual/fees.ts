/**
 * Trading fee models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';

/**
 * Trading fee model
 */
export class TradingFeeModel extends X10BaseModel {
  market: string;
  makerFeeRate: Decimal;
  takerFeeRate: Decimal;
  builderFeeRate: Decimal;

  constructor(market: string, makerFeeRate: Decimal, takerFeeRate: Decimal, builderFeeRate: Decimal) {
    super();
    this.market = market;
    this.makerFeeRate = makerFeeRate;
    this.takerFeeRate = takerFeeRate;
    this.builderFeeRate = builderFeeRate;
  }
}

/**
 * Default fees (0.02% maker, 0.05% taker)
 */
export const DEFAULT_FEES = new TradingFeeModel(
  'BTC-USD',
  new Decimal(2).div(10000), // 0.02%
  new Decimal(5).div(10000), // 0.05%
  new Decimal(0)
);







