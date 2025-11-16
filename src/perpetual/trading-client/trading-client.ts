/**
 * Perpetual Trading Client
 * Main client for X10 Perpetual Trading API
 */

import Decimal from 'decimal.js';
import { EndpointConfig } from '../configuration';
import { StarkPerpetualAccount } from '../accounts';
import { MarketModel } from '../markets';
import {
  OrderSide,
  OrderTpslType,
  PlacedOrderModel,
  SelfTradeProtectionLevel,
  TimeInForce,
} from '../orders';
import { OrderTpslTriggerParam, createOrderObject } from '../order-object';
import { WrappedApiResponse } from '../../utils/http';
import { utcNow } from '../../utils/date';
import { AccountModule } from './account-module';
import { OrderManagementModule } from './order-management-module';
import { MarketsInformationModule } from './markets-information-module';
import { InfoModule } from './info-module';
import { TestnetModule } from './testnet-module';

/**
 * Perpetual Trading Client for X10 REST API v1
 */
export class PerpetualTradingClient {
  private markets: Record<string, MarketModel> | null = null;
  private starkAccount?: StarkPerpetualAccount;
  private infoModule: InfoModule;
  private marketsInfoModule: MarketsInformationModule;
  private accountModule: AccountModule;
  private orderManagementModule: OrderManagementModule;
  private testnetModule: TestnetModule;
  private config: EndpointConfig;

  constructor(endpointConfig: EndpointConfig, starkAccount?: StarkPerpetualAccount) {
    const apiKey = starkAccount?.getApiKey();

    this.config = endpointConfig;
    this.starkAccount = starkAccount;

    this.infoModule = new InfoModule(endpointConfig);
    this.marketsInfoModule = new MarketsInformationModule(endpointConfig, { apiKey });
    this.accountModule = new AccountModule(endpointConfig, {
      apiKey,
      starkAccount,
    });
    this.orderManagementModule = new OrderManagementModule(endpointConfig, { apiKey });
    this.testnetModule = new TestnetModule(endpointConfig, apiKey, this.accountModule);
  }

  /**
   * Place an order
   */
  async placeOrder(options: {
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
  }): Promise<WrappedApiResponse<PlacedOrderModel>> {
    if (!this.starkAccount) {
      throw new Error('Stark account is not set');
    }

    if (!this.markets) {
      this.markets = await this.marketsInfoModule.getMarketsDict();
    }

    const market = this.markets[options.marketName];
    if (!market) {
      throw new Error(`Market ${options.marketName} not found`);
    }

    const expireTime = options.expireTime || (() => {
      const dt = new Date(utcNow());
      dt.setHours(dt.getHours() + 1);
      return dt;
    })();

    const order = createOrderObject(
      this.starkAccount,
      market,
      options.amountOfSynthetic,
      options.price,
      options.side,
      this.config.starknetDomain,
      {
        postOnly: options.postOnly,
        previousOrderExternalId: options.previousOrderId,
        expireTime,
        orderExternalId: options.externalId,
        timeInForce: options.timeInForce,
        selfTradeProtectionLevel: options.selfTradeProtectionLevel,
        builderFee: options.builderFee,
        builderId: options.builderId,
        reduceOnly: options.reduceOnly,
        tpSlType: options.tpSlType,
        takeProfit: options.takeProfit,
        stopLoss: options.stopLoss,
      }
    );

    return await this.orderManagementModule.placeOrder(order);
  }

  /**
   * Close all sessions
   */
  async close(): Promise<void> {
    await this.marketsInfoModule.closeSession();
    await this.accountModule.closeSession();
    await this.orderManagementModule.closeSession();
  }

  /**
   * Info module
   */
  get info(): InfoModule {
    return this.infoModule;
  }

  /**
   * Markets info module
   */
  get marketsInfo(): MarketsInformationModule {
    return this.marketsInfoModule;
  }

  /**
   * Account module
   */
  get account(): AccountModule {
    return this.accountModule;
  }

  /**
   * Orders module
   */
  get orders(): OrderManagementModule {
    return this.orderManagementModule;
  }

  /**
   * Testnet module
   */
  get testnet(): TestnetModule {
    return this.testnetModule;
  }
}







