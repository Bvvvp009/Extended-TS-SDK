"use strict";
/**
 * Funding rate models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundingRateModel = void 0;
const model_1 = require("../utils/model");
/**
 * Funding rate model
 */
class FundingRateModel extends model_1.X10BaseModel {
    market;
    fundingRate;
    timestamp;
    constructor(market, fundingRate, timestamp) {
        super();
        this.market = market;
        this.fundingRate = fundingRate;
        this.timestamp = timestamp;
    }
}
exports.FundingRateModel = FundingRateModel;
//# sourceMappingURL=funding-rates.js.map