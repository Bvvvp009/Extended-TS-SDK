/**
 * Example: Creating a Deposit from Arbitrum
 * 
 * This example demonstrates how to deposit USDC from Arbitrum to Extended Exchange.
 * Uses the CORRECT depositWithId() method on the bridge contract.
 * 
 * ℹ️ SUPPORTED CHAINS:
 * This example shows deposit from Arbitrum, but Extended Exchange supports deposits
 * from multiple chains using the SAME method: depositWithId(token, amount, commitmentId)
 * 
 * Supported Chains:
 * - Ethereum (ETH)    - USDC 6 decimals, Bridge: 0x10417734001162Ea139e8b044DFe28DbB8B28ad0
 * - BNB Chain (BNB)   - USDT 18 decimals, Bridge: 0x10417734001162Ea139e8b044DFe28DbB8B28ad0
 * - Polygon (POLYGON) - USDC 6 decimals, Bridge: 0x10417734001162Ea139e8b044DFe28DbB8B28ad0
 * - Avalanche (AVAX)  - USDC 6 decimals, Bridge: 0x10417734001162Ea139e8b044DFe28DbB8B28ad0
 * - Arbitrum (ARB)    - USDC 6 decimals, Bridge: 0x10417734001162Ea139e8b044DFe28DbB8B28ad0
 * - Base (BASE)       - USDC 6 decimals, Bridge: 0x10417734001162Ea139e8b044DFe28DbB8B28ad0
 * 
 * All chains use the same bridge contract address and method.
 * Only differences: RPC endpoints, token addresses, and decimals (BNB uses 18, others use 6).
 * 
 * Prerequisites:
 * - Extended Exchange account with API credentials
 * - USDC/USDT balance on the source chain
 * - Environment variables configured in .env
 * - X10_EOA_PRIVATE_KEY for your wallet
 * - RPC_URL for the source chain RPC endpoint
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

// Arbitrum USDC contract address
const ARBITRUM_USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

// Contract ABIs
const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

const BRIDGE_ABI = [
  'function depositWithId(address token, uint256 amount, uint256 commitmentId) returns (bytes32)',
];

async function main() {
  console.log('='.repeat(80));
  console.log('DEPOSIT USDC FROM ARBITRUM TO EXTENDED EXCHANGE');
  console.log('='.repeat(80));
  console.log('\nInitializing WASM...');
  await initWasm();

  // Load credentials from environment
  const eoaPrivateKey = process.env.X10_EOA_PRIVATE_KEY || '';
  const rpcUrl = process.env.RPC_URL || '';
  const vaultId = parseInt(process.env.X10_VAULT_ID || '0', 10);
  const privateKey = process.env.X10_PRIVATE_KEY || '';
  const publicKey = process.env.X10_PUBLIC_KEY || '';
  const apiKey = process.env.X10_API_KEY || '';
  const environment = process.env.ENVIRONMENT || 'mainnet';

  // Validate credentials
  if (!vaultId || !privateKey || !publicKey || !apiKey || !eoaPrivateKey || !rpcUrl) {
    throw new Error('Missing required credentials in environment variables');
  }

  // Setup Arbitrum wallet
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(
    eoaPrivateKey.startsWith('0x') ? eoaPrivateKey : `0x${eoaPrivateKey}`,
    provider
  );
  const usdc = new ethers.Contract(ARBITRUM_USDC, USDC_ABI, wallet);

  console.log(`\n📍 Arbitrum Wallet: ${wallet.address}`);
  const usdcBalance = await usdc.balanceOf(wallet.address);
  const decimals = await usdc.decimals();
  const balanceFormatted = ethers.formatUnits(usdcBalance, decimals);
  console.log(`💰 USDC Balance: ${balanceFormatted} USDC`);

  // Select config based on environment
  const config = environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;

  // Create account and trading client
  const account = new StarkPerpetualAccount(vaultId, privateKey, publicKey, apiKey);
  const client = new PerpetualTradingClient(config, account);

  try {
    // Get current Extended balance
    console.log('\n1️⃣  Checking Extended balance before deposit...');
    const balanceBefore = await client.account.getBalance();
    const balanceBeforeAmount = balanceBefore.data?.balance?.toString() || '0';
    console.log(`   Extended Balance: ${balanceBeforeAmount} USDC`);

    // Deposit amount (can be passed as argument or default to 1 USDC)
    const depositAmount = new Decimal(process.argv[2] || '1');
    console.log(`\n💵 Deposit Amount: ${depositAmount} USDC`);

    // Get bridge configuration
    console.log('\n2️⃣  Getting bridge configuration...');
    const bridgeConfig = await client.account.getBridgeConfig();
    const arbChain = bridgeConfig.data?.chains.find((c: any) => c.chain === 'ARB');
    const bridgeAddress = arbChain?.contractAddress;

    if (!bridgeAddress) {
      throw new Error('Bridge address not found for Arbitrum');
    }
    console.log(`   Bridge Contract: ${bridgeAddress}`);
    console.log(`   Method: depositWithId(address, uint256, uint256)`);

    // Get bridge quote
    console.log('\n3️⃣  Getting bridge quote...');
    const quote = await client.account.getBridgeQuote('ARB', 'STRK', depositAmount);
    console.log(`   Commitment ID: ${quote.data?.id}`);
    console.log(`   Bridge Fee: ${quote.data?.fee} USDC`);

    // Commit the quote
    console.log('\n4️⃣  Committing quote...');
    await client.account.commitBridgeQuote(quote.data!.id);
    console.log('   ✅ Quote committed on-chain');

    // Check and approve USDC
    console.log('\n5️⃣  Approving USDC to bridge...');
    const amountWei = ethers.parseUnits(depositAmount.toString(), decimals);
    const allowance = await usdc.allowance(wallet.address, bridgeAddress);

    if (allowance < amountWei) {
      const approveTx = await usdc.approve(bridgeAddress, amountWei);
      console.log(`   TX: ${approveTx.hash}`);
      console.log('   Waiting for confirmation...');
      await approveTx.wait();
      console.log('   ✅ USDC approved');
    } else {
      console.log('   ✅ USDC already approved');
    }

    // Execute deposit using depositWithId
    console.log('\n6️⃣  Calling bridge.depositWithId()...');
    console.log(`   Token: ${ARBITRUM_USDC}`);
    console.log(`   Amount: ${amountWei.toString()} (${depositAmount} USDC)`);
    console.log(`   CommitmentID: ${quote.data!.id}`);

    const bridge = new ethers.Contract(bridgeAddress, BRIDGE_ABI, wallet);

    // CRITICAL: Convert quote ID to BigInt
    const commitmentId = BigInt('0x' + quote.data!.id);

    const depositTx = await bridge.depositWithId(
      ARBITRUM_USDC,
      amountWei,
      commitmentId
    );

    console.log(`\n   📤 TX Sent: ${depositTx.hash}`);
    console.log('   ⏳ Waiting for confirmation...');

    const receipt = await depositTx.wait();
    console.log(`   ✅ Confirmed in block ${receipt?.blockNumber}`);

    // Wait for settlement
    console.log('\n7️⃣  Waiting for settlement (~30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Check updated balance
    console.log('\n8️⃣  Checking Extended balance after deposit...');
    const balanceAfter = await client.account.getBalance();
    const balanceAfterAmount = balanceAfter.data?.balance?.toString() || '0';
    const change = new Decimal(balanceAfterAmount).minus(balanceBeforeAmount);
    console.log(`   Extended Balance: ${balanceAfterAmount} USDC`);
    console.log(`   Change: +${change} USDC`);

    // Success summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEPOSIT SUCCESSFUL');
    console.log('='.repeat(80));
    console.log(`Amount: ${depositAmount} USDC`);
    console.log(`TX Hash: ${depositTx.hash}`);
    console.log(`Block: ${receipt?.blockNumber}`);
    console.log(`Balance: ${balanceBeforeAmount} → ${balanceAfterAmount} USDC`);
    console.log('='.repeat(80));

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
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
