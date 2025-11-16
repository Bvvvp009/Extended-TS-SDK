/**
 * Trade models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { OrderSide } from './orders';

/**
 * Trade type
 */
export enum TradeType {
  TRADE = 'TRADE',
  LIQUIDATION = 'LIQUIDATION',
  DELEVERAGE = 'DELEVERAGE',
}

/**
 * Public trade model
 */
export class PublicTradeModel extends X10BaseModel {
  id: number;
  market: string;
  side: OrderSide;
  tradeType: TradeType;
  timestamp: number;
  price: Decimal;
  qty: Decimal;
}

/**
 * Account trade model
 */
export class AccountTradeModel extends X10BaseModel {
  id: number;
  accountId: number;
  market: string;
  orderId: number;
  side: OrderSide;
  price: Decimal;
  qty: Decimal;
  value: Decimal;
  fee: Decimal;
  isTaker: boolean;
  tradeType: TradeType;
  createdTime: number;
}







