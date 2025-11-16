/**
 * Market models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { Asset } from './assets';

/**
 * Risk factor config
 */
export class RiskFactorConfig extends X10BaseModel {
  upperBound: Decimal;
  riskFactor: Decimal;

  get maxLeverage(): Decimal {
    return new Decimal(1).div(this.riskFactor).toDecimalPlaces(2);
  }
}

/**
 * Market stats model
 */
export class MarketStatsModel extends X10BaseModel {
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
export class TradingConfigModel extends X10BaseModel {
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

  get pricePrecision(): number {
    return Math.abs(Math.ceil(Math.log10(this.minPriceChange.toNumber())));
  }

  get quantityPrecision(): number {
    return Math.abs(Math.ceil(Math.log10(this.minOrderSizeChange.toNumber())));
  }

  maxLeverageForPositionValue(positionValue: Decimal): Decimal {
    const filtered = this.riskFactorConfig.filter(
      (x) => x.upperBound.gte(positionValue)
    );
    return filtered.length > 0 ? filtered[0].maxLeverage : new Decimal(0);
  }

  maxPositionValueForLeverage(leverage: Decimal): Decimal {
    const filtered = this.riskFactorConfig.filter(
      (x) => x.maxLeverage.gte(leverage)
    );
    return filtered.length > 0 ? filtered[filtered.length - 1].upperBound : new Decimal(0);
  }

  roundOrderSize(orderSize: Decimal, roundingMode: Decimal.Rounding = Decimal.ROUND_UP): Decimal {
    const rounded = orderSize
      .div(this.minOrderSizeChange)
      .toDecimalPlaces(0, roundingMode)
      .mul(this.minOrderSizeChange);
    return rounded;
  }

  calculateOrderSizeFromValue(
    orderValue: Decimal,
    orderPrice: Decimal,
    roundingMode: Decimal.Rounding = Decimal.ROUND_UP
  ): Decimal {
    const orderSize = orderValue.div(orderPrice);
    if (orderSize.gt(0)) {
      return this.roundOrderSize(orderSize, roundingMode);
    }
    return new Decimal(0);
  }

  roundPrice(price: Decimal, roundingMode: Decimal.Rounding = Decimal.ROUND_UP): Decimal {
    return price.toDecimalPlaces(this.pricePrecision, roundingMode);
  }
}

/**
 * L2 config model
 */
export class L2ConfigModel extends X10BaseModel {
  type: string;
  collateralId: string;
  collateralResolution: number;
  syntheticId: string;
  syntheticResolution: number;
}

/**
 * Market model
 */
export class MarketModel extends X10BaseModel {
  name: string;
  assetName: string;
  assetPrecision: number;
  collateralAssetName: string;
  collateralAssetPrecision: number;
  active: boolean;
  marketStats: MarketStatsModel;
  tradingConfig: TradingConfigModel;
  l2Config: L2ConfigModel;

  get syntheticAsset(): Asset {
    return new Asset(
      1,
      this.assetName,
      this.assetPrecision,
      this.active,
      false,
      this.l2Config.syntheticId,
      this.l2Config.syntheticResolution,
      '',
      0
    );
  }

  get collateralAsset(): Asset {
    return new Asset(
      2,
      this.collateralAssetName,
      this.collateralAssetPrecision,
      this.active,
      true,
      this.l2Config.collateralId,
      this.l2Config.collateralResolution,
      '',
      0
    );
  }
}


