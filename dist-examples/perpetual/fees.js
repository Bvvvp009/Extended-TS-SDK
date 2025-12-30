"use strict";
/**
 * Trading fee models
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_FEES = exports.TradingFeeModel = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const model_1 = require("../utils/model");
/**
 * Trading fee model
 */
class TradingFeeModel extends model_1.X10BaseModel {
    market;
    makerFeeRate;
    takerFeeRate;
    builderFeeRate;
    constructor(market, makerFeeRate, takerFeeRate, builderFeeRate) {
        super();
        this.market = market;
        this.makerFeeRate = makerFeeRate;
        this.takerFeeRate = takerFeeRate;
        this.builderFeeRate = builderFeeRate;
    }
}
exports.TradingFeeModel = TradingFeeModel;
/**
 * Default fees (0.02% maker, 0.05% taker)
 */
exports.DEFAULT_FEES = new TradingFeeModel('BTC-USD', new decimal_js_1.default(2).div(10000), // 0.02%
new decimal_js_1.default(5).div(10000), // 0.05%
new decimal_js_1.default(0));
//# sourceMappingURL=fees.js.map