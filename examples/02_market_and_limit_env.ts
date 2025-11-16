/**
 * Place one market and one limit order using environment variables
 */

import {
	initWasm,
	TESTNET_CONFIG,
	MAINNET_CONFIG,
	StarkPerpetualAccount,
	PerpetualTradingClient,
	OrderSide,
	TimeInForce,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import Decimal from 'decimal.js';

async function main() {
	await initWasm();

	const env = getX10EnvConfig(true);
	const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

	const account = new StarkPerpetualAccount(
		env.vaultId,
		env.privateKey,
		env.publicKey,
		env.apiKey
	);

	const client = new PerpetualTradingClient(config, account);

	try {
		// Fetch markets info for price hints
		const marketsDict = await client.marketsInfo.getMarketsDict();
		// Prefer BTC-USD as it has smaller minimum order size
		const market = marketsDict['BTC-USD'] || marketsDict['ETH-USD'];
		if (!market) {
			throw new Error('BTC-USD or ETH-USD market not found');
		}

		// Choose market symbol
		const marketName = market.name;
		const limitMarketName = marketName;

		// Determine reference price from orderbook snapshot
		let refPrice = new Decimal('0');
		let bestBid: Decimal | null = null;
		let bestAsk: Decimal | null = null;
		try {
			const ob = await client.marketsInfo.getOrderbookSnapshot(market.name);
			if (ob.data) {
				if (ob.data.asks && ob.data.asks.length > 0 && ob.data.asks[0].length > 0) {
					bestAsk = new Decimal(ob.data.asks[0][0]);
				}
				if (ob.data.bids && ob.data.bids.length > 0 && ob.data.bids[0].length > 0) {
					bestBid = new Decimal(ob.data.bids[0][0]);
				}
				// Use mid price if available
				if (bestBid && bestAsk && bestBid.gt(0) && bestAsk.gt(0)) {
					refPrice = bestBid.add(bestAsk).div(2);
				} else if (bestAsk && bestAsk.gt(0)) {
					refPrice = bestAsk;
				} else if (bestBid && bestBid.gt(0)) {
					refPrice = bestBid;
				}
			}
		} catch {}
		// Fallback to index price from market data if available
		if (refPrice.eq(0)) {
			try {
				const indexPrice = (market as any).indexPrice;
				if (indexPrice) {
					refPrice = new Decimal(indexPrice.toString());
				}
			} catch {}
		}
		// Last resort fallback - use reasonable defaults based on market
		if (refPrice.eq(0)) {
			refPrice = market.name.startsWith('BTC') ? new Decimal('60000') : new Decimal('3000');
		}
		// Use same small size as basic order example (0.001 BTC)
		const size = new Decimal('0.001');

		// Place a limit order
		console.log(`\nPlacing LIMIT BUY on ${marketName}...`);
		const limitPrice = new Decimal('60000'); // Same price as example 01
		const order = await client.placeOrder({
			marketName,
			amountOfSynthetic: size,
			price: limitPrice,
			side: OrderSide.BUY,
			timeInForce: TimeInForce.GTT,
			postOnly: true,
			reduceOnly: false,
		});
		console.log('Limit order placed:', JSON.stringify(order.data));

		if (order.data) {
			const orderId = typeof order.data.id === 'string'
				? parseInt(order.data.id, 10)
				: order.data.id;
			console.log('Canceling limit order...');
			await client.orders.cancelOrder(orderId);
			console.log('Limit order canceled.');
		}
	} finally {
		await client.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});


