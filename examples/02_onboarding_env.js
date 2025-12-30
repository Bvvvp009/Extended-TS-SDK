"use strict";
/**
 * Onboarding example using environment variables
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const env_1 = require("../src/utils/env");
async function main() {
    console.log('Initializing WASM...');
    await (0, index_1.initWasm)();
    console.log('WASM initialized!');
    // Load environment configuration
    const env = (0, env_1.getX10EnvConfig)(false); // Don't require API keys for onboarding
    const config = env.environment === 'mainnet' ? index_1.MAINNET_CONFIG : index_1.TESTNET_CONFIG;
    if (!env.l1PrivateKey) {
        throw new Error('L1_PRIVATE_KEY is required for onboarding');
    }
    console.log('Creating user client...');
    const userClient = new index_1.UserClient(config, () => env.l1PrivateKey);
    try {
        // Onboard new account
        console.log('\nOnboarding account...');
        const account = await userClient.onboard();
        console.log('Account onboarded successfully!');
        console.log('Account ID:', account.account.id);
        console.log('Account Index:', account.account.accountIndex);
        console.log('Vault ID:', account.account.l2Vault);
        // Create API key
        console.log('\nCreating API key...');
        const apiKey = await userClient.createAccountApiKey(account.account, 'TypeScript SDK API Key');
        console.log('API key created:', apiKey);
        // Test the account with trading client
        console.log('\nTesting account with trading client...');
        const starkAccount = new index_1.StarkPerpetualAccount(account.account.l2Vault, account.l2KeyPair.privateHex, account.l2KeyPair.publicHex, apiKey);
        const tradingClient = new index_1.PerpetualTradingClient(config, starkAccount);
        // Get balance
        const balanceResponse = await tradingClient.account.getBalance();
        if (balanceResponse.data) {
            console.log('Balance:', balanceResponse.data.toPrettyJson());
        }
        // Testnet: Claim testing funds
        if (env.environment === 'testnet') {
            console.log('\nClaiming testnet funds...');
            const claimResponse = await tradingClient.testnet.claimTestingFunds();
            if (claimResponse.data) {
                console.log('Claim submitted. ID:', claimResponse.data.id);
            }
        }
        await tradingClient.close();
    }
    catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=02_onboarding_env.js.map