/**
 * Example: Creating a Withdrawal
 * 
 * This example demonstrates how to withdraw funds from your Extended Exchange vault.
 * 
 * Prerequisites:
 * - Extended Exchange account with API credentials
 * - Available balance for withdrawal in your vault
 * - Environment variables configured in .env
 * 
 * Note: This example shows StarkNet withdrawals. For EVM withdrawals, you need a quote_id from the bridge.
 */

import dotenv from 'dotenv';
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
  console.log('Initializing WASM...');
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
    console.log('\nFetching current balance...');
    const balanceBefore = await client.account.getBalance();
    if (balanceBefore.data) {
      console.log('Current Balance:', {
        collateral: balanceBefore.data.collateralName,
        balance: balanceBefore.data.balance,
        equity: balanceBefore.data.equity,
        availableForWithdrawal: balanceBefore.data.availableForWithdrawal,
        availableForTrade: balanceBefore.data.availableForTrade,
      });

      // Check if we have funds available for withdrawal
      const availableForWithdrawal = new Decimal(balanceBefore.data.availableForWithdrawal);
      if (availableForWithdrawal.lte(0)) {
        console.log('\n No funds available for withdrawal.');
        console.log('You must close all positions and have no open orders to withdraw funds.');
        return;
      }
    }

    // Create a withdrawal
    const withdrawalAmount = new Decimal('5'); // 5 USDC

    console.log(`\nCreating withdrawal of ${withdrawalAmount} USDC...`);

    // For StarkNet withdrawals (default)
    const withdrawalResponse = await client.account.withdraw({
      amount: withdrawalAmount,
      chainId: 'STRK', // StarkNet
      // Optional: Specify a different StarkNet address to receive funds
      // starkAddress: '0x...',
      
      // For EVM withdrawals, you would specify:
      // chainId: 'ETH' (or other EVM chain),
      // quoteId: 'quote-id-from-bridge',
    });

    if (withdrawalResponse.data) {
      console.log('\nWithdrawal created successfully!');
      console.log('Withdrawal ID:', withdrawalResponse.data);
      console.log('\nNote: Withdrawal will be processed on-chain.');
      console.log('For StarkNet: Funds will be transferred to your StarkNet wallet.');
      console.log('For EVM chains: Complete the bridge claim using the quote ID.');
    }

    // Get withdrawal history
    console.log('\nFetching recent withdrawals...');
    const withdrawalsResponse = await client.account.getWithdrawals({
      limit: 5,
    });

    if (withdrawalsResponse.data && withdrawalsResponse.data.length > 0) {
      console.log('\nRecent Withdrawals:');
      withdrawalsResponse.data.forEach((withdrawal: any) => {
        console.log({
          id: withdrawal.id,
          amount: withdrawal.amount,
          chainId: withdrawal.chainId,
          status: withdrawal.status,
          recipient: withdrawal.recipientStarkAddress
            ? withdrawal.recipientStarkAddress.substring(0, 10) + '...'
            : 'N/A',
          createdTime: new Date(withdrawal.createdTime).toISOString(),
        });
      });
    } else {
      console.log('No withdrawals found.');
    }

    // Get updated balance
    console.log('\nFetching updated balance...');
    const balanceAfter = await client.account.getBalance();
    if (balanceAfter.data) {
      console.log('Updated Balance:', {
        collateral: balanceAfter.data.collateralName,
        balance: balanceAfter.data.balance,
        equity: balanceAfter.data.equity,
        availableForWithdrawal: balanceAfter.data.availableForWithdrawal,
      });
    }

    // Important notes
    console.log('\n=== Important Notes ===');
    console.log('1. You must close all positions before withdrawing funds.');
    console.log('2. All open orders must be canceled before withdrawal.');
    console.log('3. For StarkNet: Funds are sent to your connected StarkNet wallet.');
    console.log('4. For EVM chains: Use the bridge UI to claim funds with the quote ID.');
    console.log('5. Withdrawals may take several minutes to confirm on-chain.');
    console.log('6. Check withdrawal status using getWithdrawals() method.');
  } catch (error: any) {
    console.error('\nError:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
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
