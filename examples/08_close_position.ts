/**
 * Close a single position by placing a reduceOnly market order
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
    const marketName = 'BTC-USD';

    const positionsResponse = await client.account.getPositions();
    const positions = positionsResponse.data || [];
    const pos = positions.find((p: any) => {
      const base = new Decimal(p.positionBase);
      return p.market === marketName && !base.eq(0);
    });
    if (!pos) {
      console.log('No open position found on', marketName);
      return;
    }

    const size = new Decimal(pos.positionBase).abs();
    const side = new Decimal(pos.positionBase).gt(0) ? OrderSide.SELL : OrderSide.BUY;
    const referencePrice = new Decimal(pos.markPrice || pos.indexPrice || 60000);

    console.log(`Closing position ${marketName}, size=${size.toString()}, side=${side}`);
    const res = await client.placeOrder({
      marketName,
      amountOfSynthetic: size,
      price: referencePrice,
      side,
      reduceOnly: true,
      timeInForce: 1 as any, // IOC for market-like close
    } as any);

    if (res.data) {
      console.log('Close order placed. ID:', res.data.id);
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


