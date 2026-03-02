import Decimal from 'decimal.js';
import { StarkPerpetualAccount } from '../accounts.js';
import { EndpointConfig } from '../configuration.js';
import { MarketModel } from '../markets.js';
import { createOrderObject } from '../order-object.js';
import { NewOrderModel, OrderSide, OrderStatus, TimeInForce } from '../orders.js';
import { PerpetualStreamClient } from '../stream-client/stream-client.js';
import { WrappedStreamResponse } from '../../utils/http.js';
import { MarketsInformationModule } from '../trading-client/markets-information-module.js';
import { OrderManagementModule } from '../trading-client/order-management-module.js';

type Resolver<T> = {
  resolve: (value: T) => void;
  reject: (reason?: any) => void;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

function externalIdOf(order: any): string | undefined {
  return order?.externalId ?? order?.external_id;
}

function statusOf(order: any): string | undefined {
  return order?.status;
}

export class TimedOpenOrderModel {
  startNanos: number;
  endNanos: number;
  operationMs: number;
  openOrder: any;

  constructor(startNanos: number, endNanos: number, openOrder: any) {
    this.startNanos = startNanos;
    this.endNanos = endNanos;
    this.operationMs = (endNanos - startNanos) / 1_000_000;
    this.openOrder = openOrder;
  }
}

export class TimedCancel {
  startNanos: number;
  endNanos: number;
  operationMs: number;

  constructor(startNanos: number, endNanos: number) {
    this.startNanos = startNanos;
    this.endNanos = endNanos;
    this.operationMs = (endNanos - startNanos) / 1_000_000;
  }
}

export class BlockingTradingClient {
  private endpointConfig: EndpointConfig;
  private account: StarkPerpetualAccount;
  private marketModule: MarketsInformationModule;
  private ordersModule: OrderManagementModule;
  private markets: Record<string, MarketModel> | null = null;
  private streamClient: PerpetualStreamClient;
  private orderResolvers: Map<string, Resolver<any>> = new Map();
  private cancelResolvers: Map<string, Resolver<void>> = new Map();
  private streamTask?: Promise<void>;
  private stopped = false;

  static async create(endpointConfig: EndpointConfig, account: StarkPerpetualAccount): Promise<BlockingTradingClient> {
    const client = new BlockingTradingClient(endpointConfig, account);
    client.startStream();
    return client;
  }

  constructor(endpointConfig: EndpointConfig, account: StarkPerpetualAccount) {
    this.endpointConfig = endpointConfig;
    this.account = account;
    this.marketModule = new MarketsInformationModule(endpointConfig, { apiKey: account.getApiKey() });
    this.ordersModule = new OrderManagementModule(endpointConfig, { apiKey: account.getApiKey() });
    this.streamClient = new PerpetualStreamClient({ apiUrl: endpointConfig.streamUrl });
  }

  private startStream(): void {
    if (this.streamTask) {
      return;
    }
    this.stopped = false;
    this.streamTask = this.streamLoop();
  }

  private async streamLoop(): Promise<void> {
    while (!this.stopped) {
      const stream = this.streamClient.subscribeToAccountUpdates(this.account.getApiKey());

      try {
        await stream.connect();

        for await (const event of stream as AsyncIterable<WrappedStreamResponse<any>>) {
          if (this.stopped) {
            break;
          }

          const orders = event?.data?.orders;
          if (!Array.isArray(orders)) {
            continue;
          }

          for (const order of orders) {
            await this.handleOrder(order);
          }
        }
      } catch {
        continue;
      } finally {
        await stream.close();
      }

      if (!this.stopped) {
        await sleep(1000);
      }
    }
  }

  private async handleOrder(order: any): Promise<void> {
    const externalId = externalIdOf(order);
    if (!externalId) {
      return;
    }

    const status = statusOf(order);
    if (status === OrderStatus.CANCELLED) {
      const cancelResolver = this.cancelResolvers.get(externalId);
      if (cancelResolver) {
        cancelResolver.resolve();
        this.cancelResolvers.delete(externalId);
      }
      return;
    }

    const orderResolver = this.orderResolvers.get(externalId);
    if (orderResolver) {
      orderResolver.resolve(order);
      this.orderResolvers.delete(externalId);
    }
  }

  async getMarkets(): Promise<Record<string, MarketModel>> {
    if (!this.markets) {
      this.markets = await this.marketModule.getMarketsDict();
    }
    return this.markets;
  }

  async massCancel(options: {
    orderIds?: number[];
    externalOrderIds?: string[];
    markets?: string[];
    cancelAll?: boolean;
  } = {}): Promise<void> {
    await this.ordersModule.massCancel(options);
  }

  async createAndPlaceOrder(options: {
    marketName: string;
    amountOfSynthetic: Decimal;
    price: Decimal;
    side: OrderSide;
    postOnly?: boolean;
    previousOrderExternalId?: string;
    externalId?: string;
    builderFee?: Decimal;
    builderId?: number;
    timeInForce?: TimeInForce;
  }): Promise<TimedOpenOrderModel> {
    const market = (await this.getMarkets())[options.marketName];
    if (!market) {
      throw new Error(`Market '${options.marketName}' not found.`);
    }

    const order: NewOrderModel = await createOrderObject(
      this.account,
      market,
      options.amountOfSynthetic,
      options.price,
      options.side,
      this.endpointConfig.starknetDomain,
      {
        postOnly: options.postOnly,
        previousOrderExternalId: options.previousOrderExternalId,
        orderExternalId: options.externalId,
        builderFee: options.builderFee,
        builderId: options.builderId,
        timeInForce: options.timeInForce,
      }
    );

    const externalId = order.id;
    if (this.orderResolvers.has(externalId)) {
      throw new Error(`Order with external id '${externalId}' is already pending.`);
    }

    const startedAt = Date.now() * 1_000_000;
    const orderEventPromise = new Promise<any>((resolve, reject) => {
      this.orderResolvers.set(externalId, { resolve, reject });
    });

    try {
      await this.ordersModule.placeOrder(order);
      const openOrder = await withTimeout(
        orderEventPromise,
        5000,
        `No placement event received for external id '${externalId}'.`
      );

      const finishedAt = Date.now() * 1_000_000;
      return new TimedOpenOrderModel(startedAt, finishedAt, openOrder);
    } finally {
      this.orderResolvers.delete(externalId);
    }
  }

  async cancelOrder(options: { orderExternalId: string }): Promise<TimedCancel> {
    const startedAt = Date.now() * 1_000_000;
    const externalId = options.orderExternalId;

    const cancelEventPromise = new Promise<void>((resolve, reject) => {
      this.cancelResolvers.set(externalId, { resolve, reject });
    });

    try {
      await this.ordersModule.cancelOrderByExternalId(externalId);
      await withTimeout(
        cancelEventPromise,
        5000,
        `No cancellation event received for external id '${externalId}'.`
      );

      const finishedAt = Date.now() * 1_000_000;
      return new TimedCancel(startedAt, finishedAt);
    } finally {
      this.cancelResolvers.delete(externalId);
    }
  }

  async close(): Promise<void> {
    this.stopped = true;
    await this.marketModule.closeSession();
    await this.ordersModule.closeSession();
  }
}
