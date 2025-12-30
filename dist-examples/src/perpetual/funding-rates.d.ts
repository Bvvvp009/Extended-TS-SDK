/**
 * Funding rate models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
/**
 * Funding rate model
 */
export declare class FundingRateModel extends X10BaseModel {
    market: string;
    fundingRate: Decimal;
    timestamp: number;
    constructor(market: string, fundingRate: Decimal, timestamp: number);
}
//# sourceMappingURL=funding-rates.d.ts.map