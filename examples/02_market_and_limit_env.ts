/**
 * Place one market and one limit order using environment variables
 */

import {
	initWasm,
	PerpetualTradingClient,
	OrderSide,
	TimeInForce,
} from '../src/index';
import { createStableAccountFromEnv, findAffordableMarketOrder } from './_shared_stable_account';
import Decimal from 'decimal.js';

async function main() {
	await initWasm();

	const { config, account } = createStableAccountFromEnv(true);

	const client = new PerpetualTradingClient(config, account);

	try {
		const affordableOrder = await findAffordableMarketOrder(client);
		const marketName = affordableOrder.marketName;
		const limitMarketName = marketName;
		const size = affordableOrder.quantity;

		// Place a limit order
		console.log(`\nPlacing LIMIT BUY on ${marketName}...`);
		const limitPrice = affordableOrder.postOnlyPrice;
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


