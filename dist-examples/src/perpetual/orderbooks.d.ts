/**
 * Orderbook models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
/**
 * Orderbook quantity model
 */
export declare class OrderbookQuantityModel extends X10BaseModel {
    qty: Decimal;
    price: Decimal;
    constructor(qty: Decimal, price: Decimal);
}
/**
 * Orderbook update model
 */
export declare class OrderbookUpdateModel extends X10BaseModel {
    market: string;
    bid: OrderbookQuantityModel[];
    ask: OrderbookQuantityModel[];
    constructor(market: string, bid: OrderbookQuantityModel[], ask: OrderbookQuantityModel[]);
}
//# sourceMappingURL=orderbooks.d.ts.map