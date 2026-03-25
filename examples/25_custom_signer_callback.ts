/**
 * Example: Callback-based custom signer integration
 *
 * This example shows the minimal integration needed to bypass the built-in
 * WASM signer and delegate signing to an external provider.
 *
 * If you already use the official x10 wrapper, prefer
 * createOfficialWrapperStarkSigner() for less glue code.
 */

import dotenv from 'dotenv';
import Decimal from 'decimal.js';
import {
  MAINNET_CONFIG,
  TESTNET_CONFIG,
  PerpetualTradingClient,
  OrderSide,
  createCustomStarkSigner,
  createStarkPerpetualAccountWithCustomSigner,
  initWasm,
} from '../src/index';

dotenv.config();

type RemoteSignature = {
  r: string;
  s: string;
};

type RemoteStarkSigner = {
  sign: (msgHashHex: string) => Promise<RemoteSignature>;
};

function createRemoteSigner(): RemoteStarkSigner {
  return {
    async sign(_msgHashHex: string): Promise<RemoteSignature> {
      throw new Error(
        'Replace createRemoteSigner() with your canonical Stark signer integration'
      );
    },
  };
}

async function main() {
  await initWasm();

  const vaultId = parseInt(process.env.X10_VAULT_ID || '', 10);
  const publicKeyHex = process.env.X10_PUBLIC_KEY || '';
  const apiKey = process.env.X10_API_KEY || '';
  const environment = process.env.ENVIRONMENT || 'mainnet';

  if (!vaultId || !publicKeyHex || !apiKey) {
    throw new Error('Missing X10_VAULT_ID, X10_PUBLIC_KEY, or X10_API_KEY');
  }

  const remoteSigner = createRemoteSigner();

  const signer = createCustomStarkSigner(async (msgHash) => {
    const signature = await remoteSigner.sign('0x' + msgHash.toString(16));

    return {
      r: signature.r,
      s: signature.s,
    };
  });

  const account = createStarkPerpetualAccountWithCustomSigner(
    vaultId,
    publicKeyHex,
    apiKey,
    signer
  );

  const config = environment === 'mainnet' ? MAINNET_CONFIG : TESTNET_CONFIG;
  const client = new PerpetualTradingClient(config, account);

  try {
    const order = await client.placeOrder({
      marketName: process.env.X10_MARKET || 'BTC-USD',
      amountOfSynthetic: new Decimal(process.env.X10_QTY || '0.001'),
      price: new Decimal(process.env.X10_PRICE || '50000'),
      side: OrderSide.BUY,
    });

    console.log('Placed order:', order.toPrettyJson());
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}