/**
 * Trade models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
import { OrderSide } from './orders';
/**
 * Trade type
 */
export declare enum TradeType {
    TRADE = "TRADE",
    LIQUIDATION = "LIQUIDATION",
    DELEVERAGE = "DELEVERAGE"
}
/**
 * Public trade model
 */
export declare class PublicTradeModel extends X10BaseModel {
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
export declare class AccountTradeModel extends X10BaseModel {
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
//# sourceMappingURL=trades.d.ts.map