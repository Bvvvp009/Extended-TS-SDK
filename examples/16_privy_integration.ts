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

import {
  initWasm,
  TESTNET_CONFIG,
  PerpetualTradingClient,
  CustomStarkSigner,
  createStarkPerpetualAccountWithCustomSigner,
  OrderSide,
} from '../src/index';
import Decimal from 'decimal.js';

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
    
    // For this example, we'll use placeholders
    const privyClient = null; // Replace with actual Privy client
    const walletId = 'your-privy-wallet-id';
    
    // Your Extended Exchange account details
    const vaultId = 12345; // Your vault ID from Extended Exchange
    const publicKeyHex = '0x...'; // Your public key from Extended Exchange
    const apiKey = 'your-api-key'; // Your API key from Extended Exchange

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
    const tradingClient = new PerpetualTradingClient(TESTNET_CONFIG, account);

    // Step 5: Now you can use the trading client normally
    // All signing operations will be handled by Privy remotely
    console.log('\nGetting balance...');
    const balance = await tradingClient.account.getBalance();
    if (balance.data) {
      console.log('Balance:', balance.data.toPrettyJson());
    }

    // Place an order (signing will be done by Privy)
    console.log('\nPlacing order...');
    const placedOrder = await tradingClient.placeOrder({
      marketName: 'BTC-USD',
      amountOfSynthetic: new Decimal('0.1'),
      price: new Decimal('63000'),
      side: OrderSide.BUY,
    });
    console.log('Order placed:', placedOrder);

    // The SDK will automatically use Privy to sign the order
    // without ever exposing your private key!

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
