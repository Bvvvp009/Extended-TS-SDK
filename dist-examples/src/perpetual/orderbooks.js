"use strict";
/**
 * Orderbook models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderbookUpdateModel = exports.OrderbookQuantityModel = void 0;
const model_1 = require("../utils/model");
/**
 * Orderbook quantity model
 */
class OrderbookQuantityModel extends model_1.X10BaseModel {
    qty;
    price;
    constructor(qty, price) {
        super();
        this.qty = qty;
        this.price = price;
    }
}
exports.OrderbookQuantityModel = OrderbookQuantityModel;
/**
 * Orderbook update model
 */
class OrderbookUpdateModel extends model_1.X10BaseModel {
    market;
    bid;
    ask;
    constructor(market, bid, ask) {
        super();
        this.market = market;
        this.bid = bid;
        this.ask = ask;
    }
}
exports.OrderbookUpdateModel = OrderbookUpdateModel;
//# sourceMappingURL=orderbooks.js.map