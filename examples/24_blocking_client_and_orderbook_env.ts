/**
 * Demonstrates BlockingTradingClient + OrderBook utilities.
 *
 * Flow:
 * 1) Start local OrderBook stream and print best bid/ask
 * 2) Place one order with BlockingTradingClient
 * 3) Wait for stream-confirmed placement and then cancel by external id
 */

import Decimal from 'decimal.js';
import {
  EndpointConfig,
  MAINNET_CONFIG,
  OrderBook,
  OrderSide,
  StarkPerpetualAccount,
  TESTNET_CONFIG,
  BlockingTradingClient,
  TimeInForce,
  initWasm,
} from '../src';
import { getX10EnvConfig } from '../src/utils/env';

function extractExternalId(order: any): string | undefined {
  return order?.externalId ?? order?.external_id;
}

function roundToStep(value: Decimal, stepValue: Decimal): Decimal {
  const step = new Decimal(stepValue);
  if (step.lte(0)) {
    return value;
  }
  return value.div(step).toDecimalPlaces(0, Decimal.ROUND_UP).mul(step);
}

async function main() {
  await initWasm();
  const env = getX10EnvConfig(true);
  const config: EndpointConfig = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
  const blockingClient = await BlockingTradingClient.create(config, account);

  const marketName = 'ETH-USD';
  const orderBook = await OrderBook.create(config, marketName, { start: true, depth: 20 });

  try {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const bestBid = orderBook.bestBid();
    const bestAsk = orderBook.bestAsk();
    console.log('Best bid:', bestBid ? `${bestBid.price.toString()} / ${bestBid.amount.toString()}` : 'n/a');
    console.log('Best ask:', bestAsk ? `${bestAsk.price.toString()} / ${bestAsk.amount.toString()}` : 'n/a');

    const markets = await blockingClient.getMarkets();
    const market = markets[marketName];
    if (!market) {
      throw new Error(`Market ${marketName} not found`);
    }

    const amount = new Decimal((market as any).tradingConfig?.minOrderSize ?? '0.01');
    const basePrice = bestBid?.price ? new Decimal(bestBid.price) : new Decimal(market.marketStats.bidPrice);
    const priceStep = new Decimal((market as any).tradingConfig?.minPriceChange ?? '0.1');
    const orderPrice = roundToStep(basePrice.mul(new Decimal('0.9')), priceStep);

    const externalId = `blocking-example-${Date.now()}`;
    const placed = await blockingClient.createAndPlaceOrder({
      marketName,
      amountOfSynthetic: new Decimal(amount),
      price: orderPrice,
      side: OrderSide.BUY,
      postOnly: true,
      externalId,
      timeInForce: TimeInForce.GTT,
      builderId: env.builderId,
      builderFee: env.builderId ? new Decimal('0.0002') : undefined,
    });

    console.log('Placed (stream-confirmed) in ms:', placed.operationMs.toFixed(3));
    console.log('Placed order external id:', extractExternalId(placed.openOrder) || externalId);

    const finalExternalId = extractExternalId(placed.openOrder) || externalId;
    const cancelled = await blockingClient.cancelOrder({ orderExternalId: finalExternalId });
    console.log('Cancelled (stream-confirmed) in ms:', cancelled.operationMs.toFixed(3));
  } catch (error: any) {
    console.error('Example failed:', error?.message || error);
  } finally {
    await orderBook.close();
    await blockingClient.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
