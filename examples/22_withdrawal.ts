/**
 * Example: Creating a Withdrawal to Arbitrum
 * 
 * This example demonstrates how to withdraw USDC from your Extended Exchange vault
 * back to your Arbitrum wallet.
 * 
 * Prerequisites:
 * - Extended Exchange account with API credentials
 * - Available balance for withdrawal in your vault
 * - Environment variables configured in .env
 * - All positions must be closed
 * - All open orders must be canceled
 * 
 * Verified working on January 2, 2026
 */

import dotenv from 'dotenv';
import { ethers } from 'ethers';
import {
  initWasm,
  MAINNET_CONFIG,
  TESTNET_CONFIG,
  StarkPerpetualAccount,
  PerpetualTradingClient,
} from '../src/index';
import Decimal from 'decimal.js';

// Load environment variables
dotenv.config();

async function main() {
  console.log('='.repeat(80));
  console.log('WITHDRAW USDC FROM EXTENDED TO ARBITRUM');
  console.log('='.repeat(80));
  console.log('\nInitializing WASM...');
  await initWasm();

  // Load credentials from environment
  const vaultId = parseInt(process.env.X10_VAULT_ID || '0', 10);
  const privateKey = process.env.X10_PRIVATE_KEY || '';
  const publicKey = process.env.X10_PUBLIC_KEY || '';
  const apiKey = process.env.X10_API_KEY || '';
  const environment = process.env.ENVIRONMENT || 'mainnet';

  // Validate credentials
  if (!vaultId || !privateKey || !publicKey || !apiKey) {
    throw new Error('Missing required credentials in environment variables');
  }

  // Select config based on environment
  const config = environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  // Create account
  const account = new StarkPerpetualAccount(vaultId, privateKey, publicKey, apiKey);

  // Create trading client
  const client = new PerpetualTradingClient(config, account);

  try {
    // Get current balance before withdrawal
    console.log('\n1️⃣  Checking current balance...');
    const balanceBefore = await client.account.getBalance();
    const balanceBeforeAmount = balanceBefore.data?.balance?.toString() || '0';
    
    if (balanceBefore.data) {
      console.log(`   Balance: ${balanceBeforeAmount} USDC`);
      console.log(`   Equity: ${balanceBefore.data.equity}`);
      console.log(`   Available for Withdrawal: ${balanceBefore.data.availableForWithdrawal}`);

      // Check if we have funds available for withdrawal
      const availableForWithdrawal = new Decimal(balanceBefore.data.availableForWithdrawal);
      if (availableForWithdrawal.lte(0)) {
        console.log('\n⚠️  No funds available for withdrawal.');
        console.log('   You must close all positions and cancel all open orders first.');
        await client.close();
        return;
      }
    }

    // Withdrawal amount (can be passed as argument or default to 0.1 USDC)
    const withdrawalAmount = new Decimal(process.argv[2] || '0.1');
    console.log(`\n💵 Withdrawal Amount: ${withdrawalAmount} USDC`);

    // Get bridge quote for withdrawal (required for EVM chains)
    console.log('\n3️⃣  Getting bridge quote for withdrawal...');
    const quote = await client.account.getBridgeQuote('STRK', 'ARB', withdrawalAmount);
    console.log(`   Quote ID: ${quote.data?.id}`);
    console.log(`   Bridge Fee: ${quote.data?.fee} USDC`);

    // Commit the quote
    console.log('\n4️⃣  Committing bridge quote...');
    await client.account.commitBridgeQuote(quote.data!.id);
    console.log('   ✅ Quote committed');

    // Create withdrawal to Arbitrum
    console.log('\n5️⃣  Creating withdrawal...');
    console.log(`   Amount: ${withdrawalAmount} USDC`);
    console.log(`   Chain: ARB (Arbitrum)`);
    
    // Generate nonce (timestamp-based)
    const nonce = Math.floor(Date.now() / 1000);
    console.log(`   Nonce: ${nonce}`);

    const withdrawalResponse = await client.account.withdraw({
      amount: withdrawalAmount,
      chainId: 'ARB',
      // Don't pass starkAddress - let SDK use account.bridgeStarknetAddress
      nonce: nonce,
      quoteId: quote.data!.id,
    });

    if (withdrawalResponse.data) {
      console.log('\n✅ WITHDRAWAL CREATED SUCCESSFULLY!');
      console.log(`   Withdrawal ID: ${withdrawalResponse.data}`);
      console.log('\n   Note: Withdrawal will be processed on-chain.');
      console.log('   Funds will be transferred to your Arbitrum wallet.');
    }

    // Get updated balance
    console.log('\n6️⃣  Checking updated balance...');
    const balanceAfter = await client.account.getBalance();
    if (balanceAfter.data) {
      const balanceAfterAmount = balanceAfter.data.balance?.toString() || '0';
      console.log(`   Balance: ${balanceAfterAmount} USDC`);
      console.log(`   Equity: ${balanceAfter.data.equity}`);
      console.log(`   Available for Withdrawal: ${balanceAfter.data.availableForWithdrawal}`);
    }

    // Success summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ WITHDRAWAL SUCCESSFUL');
    console.log('='.repeat(80));
    console.log(`Amount: ${withdrawalAmount} USDC`);
    console.log(`Withdrawal ID: ${withdrawalResponse.data}`);
    console.log('\nImportant Notes:');
    console.log('1. You must close all positions before withdrawing funds.');
    console.log('2. All open orders must be canceled before withdrawal.');
    console.log('3. Withdrawals are sent to your Arbitrum wallet.');
    console.log('4. Withdrawals may take several minutes to confirm on-chain.');
    console.log('5. Check withdrawal status using getWithdrawals() method.');
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ WITHDRAWAL FAILED');
    console.error(`   Error: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }

    console.log('\n⚠️  Common Issues:');
    console.log('   - Ensure all positions are closed');
    console.log('   - Cancel all open orders');
    console.log('   - Verify sufficient available balance');
    console.log('   - Check if account verification is required');
  } finally {
    await client.close();
  }
}

// Run the example
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { main };
