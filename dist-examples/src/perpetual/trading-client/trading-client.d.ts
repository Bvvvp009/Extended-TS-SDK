/**
 * Perpetual Trading Client
 * Main client for X10 Perpetual Trading API
 */
import Decimal from 'decimal.js';
import { EndpointConfig } from '../configuration';
import { StarkPerpetualAccount } from '../accounts';
import { OrderSide, OrderTpslType, PlacedOrderModel, SelfTradeProtectionLevel, TimeInForce } from '../orders';
import { OrderTpslTriggerParam } from '../order-object';
import { WrappedApiResponse } from '../../utils/http';
import { AccountModule } from './account-module';
import { OrderManagementModule } from './order-management-module';
import { MarketsInformationModule } from './markets-information-module';
import { InfoModule } from './info-module';
import { TestnetModule } from './testnet-module';
/**
 * Perpetual Trading Client for X10 REST API v1
 */
export declare class PerpetualTradingClient {
    private markets;
    private starkAccount?;
    private infoModule;
    private marketsInfoModule;
    private accountModule;
    private orderManagementModule;
    private testnetModule;
    private config;
    constructor(endpointConfig: EndpointConfig, starkAccount?: StarkPerpetualAccount);
    /**
     * Place an order
     */
    placeOrder(options: {
        marketName: string;
        amountOfSynthetic: Decimal;
        price: Decimal;
        side: OrderSide;
        postOnly?: boolean;
        previousOrderId?: string;
        expireTime?: Date;
        timeInForce?: TimeInForce;
        selfTradeProtectionLevel?: SelfTradeProtectionLevel;
        externalId?: string;
        builderFee?: Decimal;
        builderId?: number;
        reduceOnly?: boolean;
        tpSlType?: OrderTpslType;
        takeProfit?: OrderTpslTriggerParam;
        stopLoss?: OrderTpslTriggerParam;
    }): Promise<WrappedApiResponse<PlacedOrderModel>>;
    /**
     * Close all sessions
     */
    close(): Promise<void>;
    /**
     * Info module
     */
    get info(): InfoModule;
    /**
     * Markets info module
     */
    get marketsInfo(): MarketsInformationModule;
    /**
     * Account module
     */
    get account(): AccountModule;
    /**
     * Orders module
     */
    get orders(): OrderManagementModule;
    /**
     * Testnet module
     */
    get testnet(): TestnetModule;
}
//# sourceMappingURL=trading-client.d.ts.map