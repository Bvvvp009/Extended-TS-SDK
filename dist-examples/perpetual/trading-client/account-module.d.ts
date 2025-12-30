/**
 * Account module for trading client
 */
import Decimal from 'decimal.js';
import { BaseModule } from './base-module';
import { WrappedApiResponse } from '../../utils/http';
import { EmptyModel } from '../../utils/model';
import { AccountModel, AccountLeverage, BalanceModel } from '../accounts';
import { OrderSide, OrderType, OpenOrderModel } from '../orders';
import { TradingFeeModel } from '../fees';
import { ClientModel } from '../clients';
import { BridgesConfig, Quote } from '../bridges';
import { TransferResponseModel } from '../transfers';
/**
 * Account module for managing account operations
 */
export declare class AccountModule extends BaseModule {
    /**
     * Get account information
     */
    getAccount(): Promise<WrappedApiResponse<AccountModel>>;
    /**
     * Get client information
     */
    getClient(): Promise<WrappedApiResponse<ClientModel>>;
    /**
     * Get account balance
     * https://api.docs.extended.exchange/#get-balance
     */
    getBalance(): Promise<WrappedApiResponse<BalanceModel>>;
    /**
     * Get positions
     * https://api.docs.extended.exchange/#get-positions
     */
    getPositions(options?: {
        marketNames?: string[];
        positionSide?: string;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get positions history
     * https://api.docs.extended.exchange/#get-positions-history
     */
    getPositionsHistory(options?: {
        marketNames?: string[];
        positionSide?: string;
        cursor?: number;
        limit?: number;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get open orders
     * https://api.docs.extended.exchange/#get-open-orders
     */
    getOpenOrders(options?: {
        marketNames?: string[];
        orderType?: OrderType;
        orderSide?: OrderSide;
    }): Promise<WrappedApiResponse<OpenOrderModel[]>>;
    /**
     * Get orders history
     * https://api.docs.extended.exchange/#get-orders-history
     */
    getOrdersHistory(options?: {
        marketNames?: string[];
        orderType?: OrderType;
        orderSide?: OrderSide;
        cursor?: number;
        limit?: number;
    }): Promise<WrappedApiResponse<OpenOrderModel[]>>;
    /**
     * Get order by ID
     * https://api.docs.extended.exchange/#get-order-by-id
     */
    getOrderById(orderId: number): Promise<WrappedApiResponse<OpenOrderModel>>;
    /**
     * Get order by external ID
     * https://api.docs.extended.exchange/#get-order-by-external-id
     */
    getOrderByExternalId(externalId: string): Promise<WrappedApiResponse<OpenOrderModel[]>>;
    /**
     * Get trades
     * https://api.docs.extended.exchange/#get-trades
     */
    getTrades(options: {
        marketNames: string[];
        tradeSide?: OrderSide;
        tradeType?: string;
        cursor?: number;
        limit?: number;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get fees
     * https://api.docs.extended.exchange/#get-fees
     */
    getFees(options: {
        marketNames: string[];
        builderId?: number;
    }): Promise<WrappedApiResponse<TradingFeeModel[]>>;
    /**
     * Get leverage
     * https://api.docs.extended.exchange/#get-current-leverage
     */
    getLeverage(marketNames: string[]): Promise<WrappedApiResponse<AccountLeverage[]>>;
    /**
     * Update leverage
     * https://api.docs.extended.exchange/#update-leverage
     */
    updateLeverage(marketName: string, leverage: Decimal): Promise<WrappedApiResponse<EmptyModel>>;
    /**
     * Get asset operations
     */
    assetOperations(options?: {
        id?: number;
        operationsType?: string[];
        operationsStatus?: string[];
        startTime?: number;
        endTime?: number;
        cursor?: number;
        limit?: number;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get bridge config
     */
    getBridgeConfig(): Promise<WrappedApiResponse<BridgesConfig>>;
    /**
     * Get bridge quote
     */
    getBridgeQuote(chainIn: string, chainOut: string, amount: Decimal): Promise<WrappedApiResponse<Quote>>;
    /**
     * Commit bridge quote
     */
    commitBridgeQuote(id: string): Promise<WrappedApiResponse<EmptyModel>>;
    /**
     * Transfer
     */
    transfer(options: {
        toVault: number;
        toL2Key: number | string;
        amount: Decimal;
        nonce?: number;
    }): Promise<WrappedApiResponse<TransferResponseModel>>;
    /**
     * Withdraw
     */
    withdraw(options: {
        amount: Decimal;
        chainId?: string;
        starkAddress?: string;
        nonce?: number;
        quoteId?: string;
    }): Promise<WrappedApiResponse<number>>;
    /**
     * Create deposit
     * https://api.docs.extended.exchange/#create-deposit
     */
    createDeposit(options: {
        amount: Decimal;
        chainId?: string;
        starkAddress?: string;
        quoteId?: string;
    }): Promise<WrappedApiResponse<number>>;
    /**
     * Get deposits list
     * https://api.docs.extended.exchange/#get-deposits
     */
    getDeposits(options?: {
        cursor?: number;
        limit?: number;
        startTime?: number;
        endTime?: number;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get withdrawals list
     * https://api.docs.extended.exchange/#get-withdrawals
     */
    getWithdrawals(options?: {
        cursor?: number;
        limit?: number;
        startTime?: number;
        endTime?: number;
    }): Promise<WrappedApiResponse<any[]>>;
    /**
     * Get transfers list
     * https://api.docs.extended.exchange/#get-transfers
     */
    getTransfers(options?: {
        cursor?: number;
        limit?: number;
        startTime?: number;
        endTime?: number;
    }): Promise<WrappedApiResponse<any[]>>;
}
//# sourceMappingURL=account-module.d.ts.map