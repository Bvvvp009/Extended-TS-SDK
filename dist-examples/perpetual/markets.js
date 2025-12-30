"use strict";
/**
 * Market models
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketModel = exports.L2ConfigModel = exports.TradingConfigModel = exports.MarketStatsModel = exports.RiskFactorConfig = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const model_1 = require("../utils/model");
const assets_1 = require("./assets");
/**
 * Risk factor config
 */
class RiskFactorConfig extends model_1.X10BaseModel {
    upperBound;
    riskFactor;
    get maxLeverage() {
        return new decimal_js_1.default(1).div(this.riskFactor).toDecimalPlaces(2);
    }
}
exports.RiskFactorConfig = RiskFactorConfig;
/**
 * Market stats model
 */
class MarketStatsModel extends model_1.X10BaseModel {
    dailyVolume;
    dailyVolumeBase;
    dailyPriceChange;
    dailyLow;
    dailyHigh;
    lastPrice;
    askPrice;
    bidPrice;
    markPrice;
    indexPrice;
    fundingRate;
    nextFundingRate;
    openInterest;
    openInterestBase;
}
exports.MarketStatsModel = MarketStatsModel;
/**
 * Trading config model
 */
class TradingConfigModel extends model_1.X10BaseModel {
    minOrderSize;
    minOrderSizeChange;
    minPriceChange;
    maxMarketOrderValue;
    maxLimitOrderValue;
    maxPositionValue;
    maxLeverage;
    maxNumOrders;
    limitPriceCap;
    limitPriceFloor;
    riskFactorConfig;
    get pricePrecision() {
        return Math.abs(Math.ceil(Math.log10(this.minPriceChange.toNumber())));
    }
    get quantityPrecision() {
        return Math.abs(Math.ceil(Math.log10(this.minOrderSizeChange.toNumber())));
    }
    maxLeverageForPositionValue(positionValue) {
        const filtered = this.riskFactorConfig.filter((x) => x.upperBound.gte(positionValue));
        return filtered.length > 0 ? filtered[0].maxLeverage : new decimal_js_1.default(0);
    }
    maxPositionValueForLeverage(leverage) {
        const filtered = this.riskFactorConfig.filter((x) => x.maxLeverage.gte(leverage));
        return filtered.length > 0 ? filtered[filtered.length - 1].upperBound : new decimal_js_1.default(0);
    }
    roundOrderSize(orderSize, roundingMode = decimal_js_1.default.ROUND_UP) {
        const rounded = orderSize
            .div(this.minOrderSizeChange)
            .toDecimalPlaces(0, roundingMode)
            .mul(this.minOrderSizeChange);
        return rounded;
    }
    calculateOrderSizeFromValue(orderValue, orderPrice, roundingMode = decimal_js_1.default.ROUND_UP) {
        const orderSize = orderValue.div(orderPrice);
        if (orderSize.gt(0)) {
            return this.roundOrderSize(orderSize, roundingMode);
        }
        return new decimal_js_1.default(0);
    }
    roundPrice(price, roundingMode = decimal_js_1.default.ROUND_UP) {
        return price.toDecimalPlaces(this.pricePrecision, roundingMode);
    }
}
exports.TradingConfigModel = TradingConfigModel;
/**
 * L2 config model
 */
class L2ConfigModel extends model_1.X10BaseModel {
    type;
    collateralId;
    collateralResolution;
    syntheticId;
    syntheticResolution;
}
exports.L2ConfigModel = L2ConfigModel;
/**
 * Market model
 */
class MarketModel extends model_1.X10BaseModel {
    name;
    assetName;
    assetPrecision;
    collateralAssetName;
    collateralAssetPrecision;
    active;
    marketStats;
    tradingConfig;
    l2Config;
    get syntheticAsset() {
        return new assets_1.Asset(1, this.assetName, this.assetPrecision, this.active, false, this.l2Config.syntheticId, this.l2Config.syntheticResolution, '', 0);
    }
    get collateralAsset() {
        return new assets_1.Asset(2, this.collateralAssetName, this.collateralAssetPrecision, this.active, true, this.l2Config.collateralId, this.l2Config.collateralResolution, '', 0);
    }
}
exports.MarketModel = MarketModel;
//# sourceMappingURL=markets.js.map