/**
 * Verify onboarding + place a test order using existing .env credentials
 * This script:
 *  1. Loads credentials from .env (no L1_PRIVATE_KEY required)
 *  2. Verifies account info, balance, positions and open orders
 *  3. Places a small test limit order and then cancels it
 */

import {
  initWasm,
  PerpetualTradingClient,
  OrderSide,
} from '../src/index';
import { ResponseStatus } from '../src/utils/http';
import Decimal from 'decimal.js';
import { createStableAccountFromEnv, findAffordableMarketOrder } from './_shared_stable_account';

async function main() {
  console.log('=== Onboarding Verification + Order Test ===\n');

  // ── INIT ──────────────────────────────────────────────────────────────────
  console.log('[1/5] Initializing WASM...');
  await initWasm();
  console.log('      WASM ready.\n');

  // ── LOAD ENV ──────────────────────────────────────────────────────────────
  console.log('[2/5] Loading environment config...');
  const { env, config, account } = createStableAccountFromEnv(true);
  console.log(`      Network   : ${env.environment}`);
  console.log(`      Public key: ${env.publicKey}`);
  console.log(`      Vault ID  : ${env.vaultId}`);
  console.log(`      API key   : ${env.apiKey}\n`);

  // ── BUILD ACCOUNT ─────────────────────────────────────────────────────────
  console.log('[3/5] Building stable signer-backed account...');
  const client = new PerpetualTradingClient(config, account);
  console.log('      Account created.\n');

  try {
    // ── VERIFY ONBOARDING ──────────────────────────────────────────────────
    console.log('[4/5] Verifying onboarding (account details)...');

    // Balance
    const balanceRes = await client.account.getBalance();
    if (balanceRes.status !== ResponseStatus.OK) {
      throw new Error(`Balance fetch failed – status ${balanceRes.status}`);
    }
    const balance = balanceRes.data;
    console.log('  Balance:');
    if (balance && typeof balance === 'object') {
      const b = balance as any;
      console.log(`    Total equity  : ${b.totalEquity   ?? b.equity      ?? JSON.stringify(b)}`);
      console.log(`    Avail. balance: ${b.balance       ?? b.availableBalance ?? b.freeBalance ?? '-'}`);
      console.log(`    Unrealised PnL: ${b.unrealisedPnl ?? b.unrealizedPnl    ?? '-'}`);
    } else {
      console.log('    ', JSON.stringify(balance));
    }

    // Positions
    const posRes = await client.account.getPositions();
    if (posRes.status !== ResponseStatus.OK) {
      throw new Error(`Positions fetch failed – status ${posRes.status}`);
    }
    console.log(`\n  Open positions: ${(posRes.data as any[])?.length ?? 0}`);
    if (Array.isArray(posRes.data) && posRes.data.length > 0) {
      for (const p of posRes.data.slice(0, 3)) {
        const pos = p as any;
        console.log(`    → ${pos.market ?? pos.marketName} | side: ${pos.side} | size: ${pos.size ?? pos.quantity}`);
      }
    }

    // Open orders
    const openOrdersRes = await client.account.getOpenOrders();
    if (openOrdersRes.status !== ResponseStatus.OK) {
      throw new Error(`Open orders fetch failed – status ${openOrdersRes.status}`);
    }
    console.log(`\n  Open orders: ${(openOrdersRes.data as any[])?.length ?? 0}`);
    if (Array.isArray(openOrdersRes.data) && openOrdersRes.data.length > 0) {
      for (const o of openOrdersRes.data.slice(0, 3)) {
        const ord = o as any;
        console.log(`    → ${ord.market ?? ord.marketName} | ${ord.side} | price: ${ord.price} | qty: ${ord.size ?? ord.quantity}`);
      }
    }

    // Markets
    const marketsRes = await client.marketsInfo.getMarkets();
    if (marketsRes.status !== ResponseStatus.OK) {
      throw new Error(`Markets fetch failed – status ${marketsRes.status}`);
    }
    const markets = marketsRes.data as any[];
    console.log(`\n  Available markets: ${markets?.length ?? 0}`);
    const btcMarket = markets?.find((m: any) =>
      (m.name ?? m.symbol ?? m.marketName ?? '').includes('BTC'),
    );
    if (btcMarket) {
      const m = btcMarket as any;
      console.log(`  BTC market: ${m.name ?? m.symbol ?? m.marketName}`);
      console.log(`    Mark price   : ${m.markPrice ?? m.indexPrice ?? '-'}`);
      console.log(`    Min order qty: ${m.minOrderSize ?? m.minOrderAmount ?? '-'}`);
    }

    console.log('\n  ✓ Onboarding verified – all API calls succeeded.\n');

    // ── PLACE + CANCEL ORDER ───────────────────────────────────────────────
    const affordableOrder = await findAffordableMarketOrder(client);
    console.log(`[5/5] Placing a test ${affordableOrder.marketName} limit order (post-only)...`);

    const testPrice = affordableOrder.postOnlyPrice;
    const testQty = affordableOrder.quantity;

    const orderRes = await client.placeOrder({
      marketName: affordableOrder.marketName,
      amountOfSynthetic: testQty,
      price: testPrice,
      side: OrderSide.BUY,
      postOnly: true,
    });

    if (!orderRes.data) {
      throw new Error(`Order placement returned no data. Status: ${orderRes.status}`);
    }

    const placed = orderRes.data as any;
    const orderId: number =
      typeof placed.id === 'string' ? parseInt(placed.id, 10) : placed.id;

    console.log(`  ✓ Order placed!`);
    console.log(`    Order ID : ${orderId}`);
    console.log(`    Market   : ${placed.market ?? placed.marketName ?? affordableOrder.marketName}`);
    console.log(`    Side     : ${placed.side ?? 'BUY'}`);
    console.log(`    Price    : ${placed.price ?? testPrice.toString()}`);
    console.log(`    Quantity : ${placed.size ?? placed.quantity ?? testQty.toString()}`);
    console.log(`    Status   : ${placed.status ?? '-'}`);

    // Cancel the test order immediately
    console.log(`\n  Canceling order ${orderId}...`);
    await client.orders.cancelOrder(orderId);
    console.log(`  ✓ Order ${orderId} canceled.\n`);

    console.log('=== All checks passed. Onboarding is correct and trading API works. ===');
  } catch (err: any) {
    console.error('\n✗ Error:', err.message ?? err);
    if (err.response) {
      console.error('  Response body:', JSON.stringify(err.response?.data ?? err.response, null, 2));
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
