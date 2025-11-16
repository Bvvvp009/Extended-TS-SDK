/**
 * Funding rate models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';

/**
 * Funding rate model
 */
export class FundingRateModel extends X10BaseModel {
  market: string;
  fundingRate: Decimal;
  timestamp: number;

  constructor(market: string, fundingRate: Decimal, timestamp: number) {
    super();
    this.market = market;
    this.fundingRate = fundingRate;
    this.timestamp = timestamp;
  }
}







