/**
 * Amount conversion utilities
 */
import Decimal from 'decimal.js';
import { Asset } from './assets';
/**
 * Rounding contexts
 */
export declare const ROUNDING_SELL_CONTEXT: 1;
export declare const ROUNDING_BUY_CONTEXT: 0;
export declare const ROUNDING_FEE_CONTEXT: 0;
/**
 * Human-readable amount
 */
export declare class HumanReadableAmount {
    value: Decimal;
    asset: Asset;
    constructor(value: Decimal, asset: Asset);
    toL1Amount(): L1Amount;
    toStarkAmount(roundingMode?: Decimal.Rounding): StarkAmount;
}
/**
 * L1 amount
 */
export declare class L1Amount {
    value: number;
    asset: Asset;
    constructor(value: number, asset: Asset);
    toInternalAmount(): HumanReadableAmount;
}
/**
 * Stark amount
 */
export declare class StarkAmount {
    value: number;
    asset: Asset;
    constructor(value: number, asset: Asset);
    toInternalAmount(): HumanReadableAmount;
    negate(): StarkAmount;
}
//# sourceMappingURL=amounts.d.ts.map