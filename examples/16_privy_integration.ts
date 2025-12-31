/**
 * Example: Using Privy for Remote Signing
 * 
 * This example demonstrates how to integrate the Extended SDK with Privy
 * for remote signing. Privy keeps the private keys secure and signs
 * messages remotely without exposing the keys to your application.
 * 
 * Prerequisites:
 * - Privy account setup
 * - Privy StarkNet wallet configured
 * 
 * Installation:
 * ```
 * npm install @privy-io/react-auth
 * npm install extended-typescript-sdk
 * ```
 */

import dotenv from 'dotenv';
import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualTradingClient,
  CustomStarkSigner,
  createStarkPerpetualAccountWithCustomSigner,
  OrderSide,
} from '../src/index';

// Load environment variables from .env file
dotenv.config();

/**
 * Example Privy Signer Implementation
 * 
 * Note: This is a conceptual implementation. The actual Privy API
 * may differ. Check Privy's documentation for the exact API:
 * https://docs.privy.io/
 */
class PrivyStarkSigner implements CustomStarkSigner {
  // In a real implementation, you would pass the Privy client and wallet ID
  constructor(
    private privyClient: any, // Replace with actual Privy client type
    private walletId: string
  ) {}

  /**
   * Sign a message hash using Privy's remote signing
   */
  async sign(msgHash: bigint): Promise<[bigint, bigint]> {
    // Convert the message hash to hex format
    const msgHashHex = '0x' + msgHash.toString(16);

    // Use Privy's API to sign the message remotely
    // Note: The exact method name may differ in Privy's API
    const signature = await this.privyClient.signStarknetMessage(
      this.walletId,
      msgHashHex
    );

    // Privy returns the signature components
    // Convert them to bigint for use with Extended SDK
    return [BigInt(signature.r), BigInt(signature.s)];
  }
}

/**
 * Main example function
 */
async function main() {
  try {
    console.log('Initializing WASM...');
    await initWasm();
    console.log('WASM initialized!');

    // Step 1: Setup Privy (pseudo-code)
    // In a real application, you would initialize Privy properly
    // const privyClient = await initializePrivy({ ... });
    // const privyUser = await privyClient.login();
    // const starknetWallet = privyUser.linkedAccounts.find(a => a.type === 'starknet');
    
    // Load credentials from environment variables
    const privyAppId = process.env.PRIVY_APP_ID;
    const privySecretKey = process.env.PRIVY_SECRET_KEY;
    const walletId = process.env.PRIVY_WALLET_ID || 'your-privy-wallet-id';
    
    // Your Extended Exchange account details from environment
    const vaultId = parseInt(process.env.X10_VAULT_ID || '12345', 10);
    const publicKeyHex = process.env.X10_PUBLIC_KEY || '0x...';
    const apiKey = process.env.X10_API_KEY || 'your-api-key';
    
    // Validate we have required credentials
    if (!privyAppId || !privySecretKey || !publicKeyHex || !apiKey) {
        throw new Error('Missing required credentials in environment variables');
    }
    
    // Create a mock Privy client for this example
    // In production, initialize Privy SDK with: const privyClient = new PrivyClient({ appId: privyAppId });
    const privyClient = {
        appId: privyAppId,
        secretKey: privySecretKey,
        walletId: walletId
    };

    // Step 2: Create a Privy signer
    const privySigner = new PrivyStarkSigner(privyClient, walletId);

    // Step 3: Create a StarkPerpetualAccount with the custom signer
    console.log('Creating account with Privy signer...');
    const account = createStarkPerpetualAccountWithCustomSigner(
      vaultId,
      publicKeyHex,
      apiKey,
      privySigner
    );

    // Step 4: Create trading client
    // Use MAINNET_CONFIG since our vault ID is on mainnet
    const environment = process.env.ENVIRONMENT || 'mainnet';
    const config = environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
    const tradingClient = new PerpetualTradingClient(config, account);

    // Step 5: Now you can use the trading client normally
    // All signing operations will be handled by Privy remotely
    console.log('\nGetting balance...');
    const balance = await tradingClient.account.getBalance();
    if (balance.data) {
      console.log('Balance:', JSON.stringify(balance.data, null, 2));
    }

    // Note on placing orders:
    // ========================
    // To place an order, you would call:
    //   const placedOrder = await tradingClient.placeOrder({ ... });
    // 
    // The SDK will automatically:
    // 1. Create the order object
    // 2. Call PrivyStarkSigner.sign() to sign the order
    // 3. Privy's remote signing API will securely sign the message
    // 4. The signed order will be sent to Extended Exchange
    //
    // Your private key never leaves Privy's secure environment!
    
    console.log('\nSuccessfully authenticated with Privy and connected to Extended Exchange');
    console.log('Account balance retrieved:');
    console.log(`  Balance: ${balance.data?.balance} USD`);
    console.log(`  Equity: ${balance.data?.equity} USD`);
    console.log(`  Available for trade: ${balance.data?.availableForTrade} USD`);
    console.log('\nTo place orders, initialize with a real Privy client');

    await tradingClient.close();
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the example
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { PrivyStarkSigner };
