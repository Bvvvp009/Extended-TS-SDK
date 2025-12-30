"use strict";
/**
 * Candle models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CandleModel = void 0;
const model_1 = require("../utils/model");
/**
 * Candle model
 */
class CandleModel extends model_1.X10BaseModel {
    open;
    low;
    high;
    close;
    volume;
    timestamp;
    constructor(open, low, high, close, timestamp, volume) {
        super();
        this.open = open;
        this.low = low;
        this.high = high;
        this.close = close;
        this.timestamp = timestamp;
        this.volume = volume;
    }
}
exports.CandleModel = CandleModel;
//# sourceMappingURL=candles.js.map