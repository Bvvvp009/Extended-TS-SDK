import Decimal from 'decimal.js';
import { EndpointConfig } from './configuration.js';
import { OrderbookUpdateModel } from './orderbooks.js';
import { PerpetualStreamClient } from './stream-client/stream-client.js';
import { StreamDataType, WrappedStreamResponse } from '../utils/http.js';

export class OrderBookEntry {
  price: Decimal;
  amount: Decimal;

  constructor(price: Decimal, amount: Decimal) {
    this.price = price;
    this.amount = amount;
  }
}

export class ImpactDetails {
  price: Decimal;
  amount: Decimal;

  constructor(price: Decimal, amount: Decimal) {
    this.price = price;
    this.amount = amount;
  }
}

function toDecimal(value: any): Decimal {
  return value instanceof Decimal ? value : new Decimal(value);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class OrderBook {
  private streamClient: PerpetualStreamClient;
  private marketName: string;
  private depth?: number;
  private task?: Promise<void>;
  private stopped = false;
  private bidPrices: Map<string, OrderBookEntry> = new Map();
  private askPrices: Map<string, OrderBookEntry> = new Map();

  private bestAskChangeCallback?: (entry: OrderBookEntry | null) => Promise<void>;
  private bestBidChangeCallback?: (entry: OrderBookEntry | null) => Promise<void>;

  static async create(
    endpointConfig: EndpointConfig,
    marketName: string,
    options: {
      bestAskChangeCallback?: (entry: OrderBookEntry | null) => Promise<void>;
      bestBidChangeCallback?: (entry: OrderBookEntry | null) => Promise<void>;
      start?: boolean;
      depth?: number;
    } = {}
  ): Promise<OrderBook> {
    const orderBook = new OrderBook(endpointConfig, marketName, options);
    if (options.start) {
      await orderBook.startOrderbook();
    }
    return orderBook;
  }

  constructor(
    endpointConfig: EndpointConfig,
    marketName: string,
    options: {
      bestAskChangeCallback?: (entry: OrderBookEntry | null) => Promise<void>;
      bestBidChangeCallback?: (entry: OrderBookEntry | null) => Promise<void>;
      depth?: number;
    } = {}
  ) {
    this.streamClient = new PerpetualStreamClient({ apiUrl: endpointConfig.streamUrl });
    this.marketName = marketName;
    this.depth = options.depth;
    this.bestAskChangeCallback = options.bestAskChangeCallback;
    this.bestBidChangeCallback = options.bestBidChangeCallback;
  }

  async startOrderbook(): Promise<void> {
    if (this.task) {
      return;
    }
    this.stopped = false;
    this.task = this.loop();
  }

  stopOrderbook(): void {
    this.stopped = true;
    this.task = undefined;
  }

  private async loop(): Promise<void> {
    while (!this.stopped) {
      const stream = this.streamClient.subscribeToOrderbooks({
        marketName: this.marketName,
        depth: this.depth,
      });

      try {
        await stream.connect();
        for await (const event of stream as AsyncIterable<WrappedStreamResponse<any>>) {
          if (this.stopped) {
            break;
          }

          if (!event?.data) {
            continue;
          }

          if (event.type === StreamDataType.SNAPSHOT) {
            await this.initOrderbook(event.data as OrderbookUpdateModel);
          }

          if (event.type === StreamDataType.DELTA) {
            await this.updateOrderbook(event.data as OrderbookUpdateModel);
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

  private async updateOrderbook(data: OrderbookUpdateModel): Promise<void> {
    const bestBidBeforeUpdate = this.bestBid();
    const bestAskBeforeUpdate = this.bestAsk();

    for (const bid of data.bid || []) {
      const price = toDecimal((bid as any).price);
      const qty = toDecimal((bid as any).qty);
      this.applyDelta(this.bidPrices, price, qty);
    }

    for (const ask of data.ask || []) {
      const price = toDecimal((ask as any).price);
      const qty = toDecimal((ask as any).qty);
      this.applyDelta(this.askPrices, price, qty);
    }

    const bestBidAfterUpdate = this.bestBid();
    const bestAskAfterUpdate = this.bestAsk();

    if (this.bestBidChanged(bestBidBeforeUpdate, bestBidAfterUpdate) && this.bestBidChangeCallback) {
      await this.bestBidChangeCallback(bestBidAfterUpdate);
    }

    if (this.bestAskChanged(bestAskBeforeUpdate, bestAskAfterUpdate) && this.bestAskChangeCallback) {
      await this.bestAskChangeCallback(bestAskAfterUpdate);
    }
  }

  private async initOrderbook(data: OrderbookUpdateModel): Promise<void> {
    const bestBidBeforeUpdate = this.bestBid();
    const bestAskBeforeUpdate = this.bestAsk();

    this.bidPrices.clear();
    this.askPrices.clear();

    for (const bid of data.bid || []) {
      const price = toDecimal((bid as any).price);
      const qty = toDecimal((bid as any).qty);
      this.bidPrices.set(price.toString(), new OrderBookEntry(price, qty));
    }

    for (const ask of data.ask || []) {
      const price = toDecimal((ask as any).price);
      const qty = toDecimal((ask as any).qty);
      this.askPrices.set(price.toString(), new OrderBookEntry(price, qty));
    }

    const bestBidAfterUpdate = this.bestBid();
    const bestAskAfterUpdate = this.bestAsk();

    if (this.bestBidChanged(bestBidBeforeUpdate, bestBidAfterUpdate) && this.bestBidChangeCallback) {
      await this.bestBidChangeCallback(bestBidAfterUpdate);
    }

    if (this.bestAskChanged(bestAskBeforeUpdate, bestAskAfterUpdate) && this.bestAskChangeCallback) {
      await this.bestAskChangeCallback(bestAskAfterUpdate);
    }
  }

  private applyDelta(target: Map<string, OrderBookEntry>, price: Decimal, qtyDelta: Decimal): void {
    const key = price.toString();
    const existing = target.get(key);

    if (existing) {
      const updatedAmount = existing.amount.plus(qtyDelta);
      if (updatedAmount.eq(0)) {
        target.delete(key);
      } else {
        existing.amount = updatedAmount;
      }
      return;
    }

    target.set(key, new OrderBookEntry(price, qtyDelta));
  }

  private bestBidChanged(before: OrderBookEntry | null, after: OrderBookEntry | null): boolean {
    if (!before && !after) {
      return false;
    }
    if (!before || !after) {
      return true;
    }
    return !before.price.eq(after.price) || !before.amount.eq(after.amount);
  }

  private bestAskChanged(before: OrderBookEntry | null, after: OrderBookEntry | null): boolean {
    if (!before && !after) {
      return false;
    }
    if (!before || !after) {
      return true;
    }
    return !before.price.eq(after.price) || !before.amount.eq(after.amount);
  }

  bestBid(): OrderBookEntry | null {
    if (this.bidPrices.size === 0) {
      return null;
    }

    let best: OrderBookEntry | null = null;
    for (const entry of this.bidPrices.values()) {
      if (!best || entry.price.gt(best.price)) {
        best = entry;
      }
    }

    return best;
  }

  bestAsk(): OrderBookEntry | null {
    if (this.askPrices.size === 0) {
      return null;
    }

    let best: OrderBookEntry | null = null;
    for (const entry of this.askPrices.values()) {
      if (!best || entry.price.lt(best.price)) {
        best = entry;
      }
    }

    return best;
  }

  calculatePriceImpactNotional(notional: Decimal, side: 'BUY' | 'SELL'): ImpactDetails | null {
    if (notional.lte(0)) {
      return null;
    }

    const levels = side === 'BUY'
      ? Array.from(this.askPrices.values()).sort((a, b) => a.price.cmp(b.price))
      : Array.from(this.bidPrices.values()).sort((a, b) => b.price.cmp(a.price));

    let remainingToSpend = notional;
    let totalAmount = new Decimal(0);
    let weightedSum = new Decimal(0);

    for (const level of levels) {
      if (remainingToSpend.lte(0)) {
        break;
      }

      if (level.amount.lte(0)) {
        continue;
      }

      const amountToPurchase = Decimal.min(remainingToSpend.div(level.price), level.amount);
      const spent = amountToPurchase.mul(level.price);

      weightedSum = weightedSum.plus(amountToPurchase.mul(level.price));
      totalAmount = totalAmount.plus(amountToPurchase);
      remainingToSpend = remainingToSpend.minus(spent);
    }

    if (remainingToSpend.gt(0) || totalAmount.eq(0)) {
      return null;
    }

    return new ImpactDetails(weightedSum.div(totalAmount), totalAmount);
  }

  calculatePriceImpactQty(qty: Decimal, side: 'BUY' | 'SELL'): ImpactDetails | null {
    if (qty.lte(0)) {
      return null;
    }

    const levels = side === 'BUY'
      ? Array.from(this.askPrices.values()).sort((a, b) => a.price.cmp(b.price))
      : Array.from(this.bidPrices.values()).sort((a, b) => b.price.cmp(a.price));

    let remainingQty = qty;
    let totalAmount = new Decimal(0);
    let totalSpent = new Decimal(0);

    for (const level of levels) {
      if (remainingQty.lte(0)) {
        break;
      }

      if (level.amount.lte(0)) {
        continue;
      }

      const take = Decimal.min(remainingQty, level.amount);
      totalSpent = totalSpent.plus(take.mul(level.price));
      totalAmount = totalAmount.plus(take);
      remainingQty = remainingQty.minus(take);
    }

    if (remainingQty.gt(0) || totalAmount.eq(0)) {
      return null;
    }

    return new ImpactDetails(totalSpent.div(totalAmount), totalAmount);
  }

  async close(): Promise<void> {
    this.stopOrderbook();
  }
}
