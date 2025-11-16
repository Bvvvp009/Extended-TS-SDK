/**
 * Close all open positions by placing reduceOnly market orders for each
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualTradingClient,
  OrderSide,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import Decimal from 'decimal.js';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const env = getX10EnvConfig(true);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
  const { StarkPerpetualAccount } = await import('../src/index');
  const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
  const client = new PerpetualTradingClient(config, account);

  try {
    const positionsResponse = await client.account.getPositions();
    const positions = positionsResponse.data || [];
    if (!positions.length) {
      console.log('No open positions found.');
      return;
    }

    for (const p of positions) {
      const base = new Decimal(p.positionBase);
      if (base.eq(0)) continue;
      const marketName = p.market;
      const size = base.abs();
      const side = base.gt(0) ? OrderSide.SELL : OrderSide.BUY;
      const referencePrice = new Decimal(p.markPrice || p.indexPrice || 60000);
      console.log(`Closing ${marketName} position size=${size.toString()} side=${side}`);
      const res = await client.placeOrder({
        marketName,
        amountOfSynthetic: size,
        price: referencePrice,
        side,
        reduceOnly: true,
        timeInForce: 1 as any, // IOC
      } as any);
      if (res.data) {
        console.log(`Close order placed for ${marketName}. ID:`, res.data.id);
      }
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




