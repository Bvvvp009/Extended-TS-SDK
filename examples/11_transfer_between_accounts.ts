/**
 * Transfer between sub-accounts (on-chain transfer)
 */

import {
  initWasm,
  TESTNET_CONFIG,
  MAINNET_CONFIG,
  PerpetualTradingClient,
} from '../src/index';
import { getX10EnvConfig } from '../src/utils/env';
import Decimal from 'decimal.js';

async function main() {
  console.log('Initializing WASM...');
  await initWasm();

  const env = getX10EnvConfig(true);
  const config = env.environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
  const { StarkPerpetualAccount } = await import('../src/index');
  const account = new StarkPerpetualAccount(env.vaultId, env.privateKey, env.publicKey, env.apiKey);
  const client = new PerpetualTradingClient(config, account);

  try {
    const toVault = env.vaultId + 1; // example: next subaccount
    const toL2Key = env.publicKey; // same owner; use another account's L2 key for cross-account
    const amount = new Decimal('1'); // 1 USD collateral unit

    console.log(`\nTransferring ${amount.toString()} USD from vault ${env.vaultId} to vault ${toVault}...`);
    console.log('Note: This will fail if target vault does not exist or is not authorized.');
    const res = await client.account.transfer({
      toVault,
      toL2Key,
      amount,
    });
    console.log('Transfer response:', res);
  } catch (error: any) {
    if (error.message && error.message.includes('No target account')) {
      console.log('Transfer skipped: Target vault does not exist or is not authorized (expected in testnet)');
    } else {
      throw error;
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});




