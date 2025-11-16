/**
 * Orderbook models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';

/**
 * Orderbook quantity model
 */
export class OrderbookQuantityModel extends X10BaseModel {
  qty: Decimal;
  price: Decimal;

  constructor(qty: Decimal, price: Decimal) {
    super();
    this.qty = qty;
    this.price = price;
  }
}

/**
 * Orderbook update model
 */
export class OrderbookUpdateModel extends X10BaseModel {
  market: string;
  bid: OrderbookQuantityModel[];
  ask: OrderbookQuantityModel[];

  constructor(market: string, bid: OrderbookQuantityModel[], ask: OrderbookQuantityModel[]) {
    super();
    this.market = market;
    this.bid = bid;
    this.ask = ask;
  }
}







