/**
 * Trading fee models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
/**
 * Trading fee model
 */
export declare class TradingFeeModel extends X10BaseModel {
    market: string;
    makerFeeRate: Decimal;
    takerFeeRate: Decimal;
    builderFeeRate: Decimal;
    constructor(market: string, makerFeeRate: Decimal, takerFeeRate: Decimal, builderFeeRate: Decimal);
}
/**
 * Default fees (0.02% maker, 0.05% taker)
 */
export declare const DEFAULT_FEES: TradingFeeModel;
//# sourceMappingURL=fees.d.ts.map