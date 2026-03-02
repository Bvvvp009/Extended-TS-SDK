/**
 * Place an order with explicit order type and builder fields using environment variables.
 *
 * Why this example:
 * - `client.placeOrder(...)` currently infers LIMIT-style behavior by defaults.
 * - To explicitly send `orderType`, use `createOrderObject(...)` and then `client.orders.placeOrder(...)`.
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
  OrderSide,
  OrderType,
  TimeInForce,
  createOrderObject,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import Decimal from 'decimal.js';

async function main() {
  await initWasm();

  const env = getX10EnvConfig(true);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
  const client = new PerpetualTradingClient(config, account);

  try {
    const marketName = 'BTC-USD';

    const markets = await client.marketsInfo.getMarketsDict();
    const market = markets[marketName];
    if (!market) {
      throw new Error(`Market ${marketName} not found`);
    }

    const quantity = new Decimal(market.tradingConfig.minOrderSize as any);

    let referencePrice = new Decimal('60000');
    try {
      const orderbook = await client.marketsInfo.getOrderbookSnapshot(marketName);
      if (orderbook.data?.asks?.[0]?.[0]) {
        referencePrice = new Decimal(orderbook.data.asks[0][0]);
      }
    } catch {}

    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    const orderObject = await createOrderObject(
      account,
      market,
      quantity,
      referencePrice,
      OrderSide.BUY,
      config.starknetDomain,
      {
        orderType: OrderType.MARKET,
        timeInForce: TimeInForce.IOC,
        orderExternalId: `example-ordertype-builder-${Date.now()}`,
        builderFee: new Decimal('0.0002'),
        reduceOnly: false,
      }
    );

    const placed = await client.orders.placeOrder(orderObject);

    console.log('Order placed with explicit orderType + builder fields');
    console.log(JSON.stringify(placed.data, null, 2));
  } catch (error: any) {
    console.error('Failed to place order:', error?.message || error);
    if (error?.response) {
      console.error('API response:', error.response);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
