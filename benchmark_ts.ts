/**
 * Benchmark TypeScript SDK signer performance
 * Measures: signing, order creation, HTTP request, total time
 */

import {
  initWasm,
  TESTNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
  OrderSide,
} from './src/index';
import { getX10EnvConfig } from './src/utils/env';
import Decimal from 'decimal.js';

function calculateStats(times: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  stddev: number;
  total: number;
} {
  if (times.length === 0) {
    return { mean: 0, median: 0, min: 0, max: 0, stddev: 0, total: 0 };
  }

  const sorted = [...times].sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const variance = times.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / times.length;
  const stddev = Math.sqrt(variance);
  const total = times.reduce((a, b) => a + b, 0);

  return { mean, median, min, max, stddev, total };
}

async function benchmarkSigningOnly(account: StarkPerpetualAccount, iterations: number = 100): Promise<ReturnType<typeof calculateStats>> {
  console.log(`\n=== Benchmarking Signing Only (${iterations} iterations) ===`);
  
  // Use a fixed message hash for consistency
  const testMsgHash = BigInt('1234567890123456789012345678901234567890');
  
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    account.sign(testMsgHash);
    const end = performance.now();
    times.push(end - start);
  }
  
  const stats = calculateStats(times);
  console.log(`Signing Times (ms):`);
  console.log(`  Mean:   ${stats.mean.toFixed(4)} ms`);
  console.log(`  Median: ${stats.median.toFixed(4)} ms`);
  console.log(`  Min:    ${stats.min.toFixed(4)} ms`);
  console.log(`  Max:    ${stats.max.toFixed(4)} ms`);
  console.log(`  StdDev: ${stats.stddev.toFixed(4)} ms`);
  console.log(`  Total:  ${stats.total.toFixed(4)} ms`);
  
  return stats;
}

async function benchmarkOrderPlacement(client: PerpetualTradingClient, iterations: number = 10): Promise<{
  http_mean: number;
  http_median: number;
  total_mean: number;
  total_median: number;
}> {
  console.log(`\n=== Benchmarking Order Placement (${iterations} iterations) ===`);
  
  const httpTimes: number[] = [];
  const totalTimes: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const totalStart = performance.now();
    
    try {
      const orderStart = performance.now();
      const response = await client.placeOrder({
        marketName: 'BTC-USD',
        amountOfSynthetic: new Decimal('0.001'),
        price: new Decimal('60000'),
        side: OrderSide.BUY,
        postOnly: true,
      });
      const orderEnd = performance.now();
      
      // Cancel immediately to free balance
      if (response.data) {
        const orderId = typeof response.data.id === 'string' 
          ? parseInt(response.data.id, 10) 
          : response.data.id;
        await client.orders.cancelOrder(orderId);
      }
      
      const orderTime = orderEnd - orderStart;
      const totalEnd = performance.now();
      const totalTime = totalEnd - totalStart;
      
      httpTimes.push(orderTime);
      totalTimes.push(totalTime);
      
    } catch (error: any) {
      console.log(`  Iteration ${i + 1} failed: ${error.message}`);
      continue;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (httpTimes.length > 0) {
    const httpStats = calculateStats(httpTimes);
    const totalStats = calculateStats(totalTimes);
    
    console.log(`Order Creation + HTTP (ms):`);
    console.log(`  Mean:   ${httpStats.mean.toFixed(4)} ms`);
    console.log(`  Median: ${httpStats.median.toFixed(4)} ms`);
    console.log(`  Min:    ${httpStats.min.toFixed(4)} ms`);
    console.log(`  Max:    ${httpStats.max.toFixed(4)} ms`);
    console.log(`  StdDev: ${httpStats.stddev.toFixed(4)} ms`);
    
    console.log(`\nTotal Time (including cancel) (ms):`);
    console.log(`  Mean:   ${totalStats.mean.toFixed(4)} ms`);
    console.log(`  Median: ${totalStats.median.toFixed(4)} ms`);
    console.log(`  Min:    ${totalStats.min.toFixed(4)} ms`);
    console.log(`  Max:    ${totalStats.max.toFixed(4)} ms`);
    console.log(`  StdDev: ${totalStats.stddev.toFixed(4)} ms`);
    
    return {
      http_mean: httpStats.mean,
      http_median: httpStats.median,
      total_mean: totalStats.mean,
      total_median: totalStats.median,
    };
  }
  
  return { http_mean: 0, http_median: 0, total_mean: 0, total_median: 0 };
}

async function main() {
  console.log('='.repeat(60));
  console.log('TypeScript SDK Benchmark');
  console.log('='.repeat(60));
  
  // Initialize WASM
  console.log('\nInitializing WASM...');
  await initWasm();
  console.log('WASM initialized!');
  
  // Load environment
  const env = getX10EnvConfig(true);
  
  // Create account
  const account = new StarkPerpetualAccount(
    env.vaultId,
    env.privateKey,
    env.publicKey,
    env.apiKey
  );
  
  // Create client
  const client = new PerpetualTradingClient(TESTNET_CONFIG, account);
  
  try {
    // Benchmark signing only
    const signingResults = await benchmarkSigningOnly(account, 100);
    
    // Benchmark order placement
    const orderResults = await benchmarkOrderPlacement(client, 10);
    
    console.log('\n' + '='.repeat(60));
    console.log('Summary');
    console.log('='.repeat(60));
    console.log(`Signing (mean):     ${signingResults.mean.toFixed(4)} ms`);
    console.log(`Order + HTTP (mean): ${orderResults.http_mean.toFixed(4)} ms`);
    console.log(`Total (mean):       ${orderResults.total_mean.toFixed(4)} ms`);
    
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

