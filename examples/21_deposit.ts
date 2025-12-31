/**
 * Example: Creating a Deposit
 * 
 * This example demonstrates how to create a deposit into your Extended Exchange vault.
 * 
 * Prerequisites:
 * - Extended Exchange account with API credentials
 * - USDC balance on StarkNet L2 or supported EVM chain
 * - Environment variables configured in .env
 * 
 * Note: This example shows StarkNet deposits. For EVM deposits, you need a quote_id from the bridge.
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
    // Get current balance before deposit
    console.log('\nFetching current balance...');
    const balanceBefore = await client.account.getBalance();
    if (balanceBefore.data) {
      console.log('Current Balance:', {
        collateral: balanceBefore.data.collateralName,
        balance: balanceBefore.data.balance,
        equity: balanceBefore.data.equity,
        availableForTrade: balanceBefore.data.availableForTrade,
      });
    }

    // Create a deposit
    // Note: This initiates a deposit request. The actual USDC transfer must be done separately
    // on StarkNet or through the bridge for EVM chains.
    const depositAmount = new Decimal('10'); // 10 USDC

    console.log(`\nCreating deposit of ${depositAmount} USDC...`);

    // For StarkNet deposits (default)
    const depositResponse = await client.account.createDeposit({
      amount: depositAmount,
      chainId: 'STRK', // StarkNet
      // For EVM deposits, you would specify:
      // chainId: 'ETH' (or other EVM chain),
      // quoteId: 'quote-id-from-bridge',
    });

    if (depositResponse.data) {
      console.log('\nDeposit created successfully!');
      console.log('Deposit ID:', depositResponse.data);
      console.log('\nNote: You must now transfer USDC to complete the deposit.');
      console.log('For StarkNet: Transfer USDC to the Extended Exchange contract on StarkNet.');
      console.log('For EVM chains: Complete the bridge transaction using the quote ID.');
    }

    // Get deposit history
    console.log('\nFetching recent deposits...');
    const depositsResponse = await client.account.getDeposits({
      limit: 5,
    });

    if (depositsResponse.data && depositsResponse.data.length > 0) {
      console.log('\nRecent Deposits:');
      depositsResponse.data.forEach((deposit: any) => {
        console.log({
          id: deposit.id,
          amount: deposit.amount,
          chainId: deposit.chainId,
          status: deposit.status,
          createdTime: new Date(deposit.createdTime).toISOString(),
        });
      });
    } else {
      console.log('No deposits found.');
    }

    // Important notes
    console.log('\n=== Important Notes ===');
    console.log('1. Deposits require transferring USDC to the Extended Exchange contract.');
    console.log('2. For StarkNet: Use your StarkNet wallet to transfer USDC.');
    console.log('3. For EVM chains: Use the bridge UI or contract with the quote ID.');
    console.log('4. Deposits may take several minutes to confirm on-chain.');
    console.log('5. Check deposit status using getDeposits() method.');
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
