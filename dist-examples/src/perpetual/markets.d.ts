/**
 * Market models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { Asset } from './assets';
/**
 * Risk factor config
 */
export declare class RiskFactorConfig extends X10BaseModel {
    upperBound: Decimal;
    riskFactor: Decimal;
    get maxLeverage(): Decimal;
}
/**
 * Market stats model
 */
export declare class MarketStatsModel extends X10BaseModel {
    dailyVolume: Decimal;
    dailyVolumeBase: Decimal;
    dailyPriceChange: Decimal;
    dailyLow: Decimal;
    dailyHigh: Decimal;
    lastPrice: Decimal;
    askPrice: Decimal;
    bidPrice: Decimal;
    markPrice: Decimal;
    indexPrice: Decimal;
    fundingRate: Decimal;
    nextFundingRate: number;
    openInterest: Decimal;
    openInterestBase: Decimal;
}
/**
 * Trading config model
 */
export declare class TradingConfigModel extends X10BaseModel {
    minOrderSize: Decimal;
    minOrderSizeChange: Decimal;
    minPriceChange: Decimal;
    maxMarketOrderValue: Decimal;
    maxLimitOrderValue: Decimal;
    maxPositionValue: Decimal;
    maxLeverage: Decimal;
    maxNumOrders: number;
    limitPriceCap: Decimal;
    limitPriceFloor: Decimal;
    riskFactorConfig: RiskFactorConfig[];
    get pricePrecision(): number;
    get quantityPrecision(): number;
    maxLeverageForPositionValue(positionValue: Decimal): Decimal;
    maxPositionValueForLeverage(leverage: Decimal): Decimal;
    roundOrderSize(orderSize: Decimal, roundingMode?: Decimal.Rounding): Decimal;
    calculateOrderSizeFromValue(orderValue: Decimal, orderPrice: Decimal, roundingMode?: Decimal.Rounding): Decimal;
    roundPrice(price: Decimal, roundingMode?: Decimal.Rounding): Decimal;
}
/**
 * L2 config model
 */
export declare class L2ConfigModel extends X10BaseModel {
    type: string;
    collateralId: string;
    collateralResolution: number;
    syntheticId: string;
    syntheticResolution: number;
}
/**
 * Market model
 */
export declare class MarketModel extends X10BaseModel {
    name: string;
    assetName: string;
    assetPrecision: number;
    collateralAssetName: string;
    collateralAssetPrecision: number;
    active: boolean;
    marketStats: MarketStatsModel;
    tradingConfig: TradingConfigModel;
    l2Config: L2ConfigModel;
    get syntheticAsset(): Asset;
    get collateralAsset(): Asset;
}
//# sourceMappingURL=markets.d.ts.map