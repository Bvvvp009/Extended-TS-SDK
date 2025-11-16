/**
 * Onboarding logic for deriving L2 keys from L1 Ethereum account
 */

import { ethers } from 'ethers';
import Decimal from 'decimal.js';
import { AccountModel } from '../accounts';
import { X10BaseModel } from '../../utils/model';
import { generateKeypairFromEthSignature, pedersenHash, sign as starkSign } from '../crypto/signer';

/**
 * Stark key pair
 */
export class StarkKeyPair {
  private: bigint;
  public: bigint;

  constructor(privateKey: bigint, publicKey: bigint) {
    this.private = privateKey;
    this.public = publicKey;
  }

  get publicHex(): string {
    return '0x' + this.public.toString(16);
  }

  get privateHex(): string {
    return '0x' + this.private.toString(16);
  }
}

/**
 * Onboarded client model
 */
export class OnboardedClientModel extends X10BaseModel {
  l1Address: string;
  defaultAccount: AccountModel;

  constructor(l1Address: string, defaultAccount: AccountModel) {
    super();
    this.l1Address = l1Address;
    this.defaultAccount = defaultAccount;
  }
}

/**
 * On-boarded account
 */
export interface OnBoardedAccount {
  account: AccountModel;
  l2KeyPair: StarkKeyPair;
}

/**
 * Account registration
 */
export class AccountRegistration {
  accountIndex: number;
  wallet: string;
  tosAccepted: boolean;
  time: Date;
  action: string;
  host: string;

  constructor(
    accountIndex: number,
    wallet: string,
    tosAccepted: boolean,
    time: Date,
    action: string,
    host: string
  ) {
    this.accountIndex = accountIndex;
    this.wallet = wallet;
    this.tosAccepted = tosAccepted;
    this.time = time;
    this.action = action;
    this.host = host;
  }

  get timeString(): string {
    return this.time.toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  /**
   * Convert to EIP-712 signable message
   */
  toSignableMessage(signingDomain: string): { domain: any; types: any; message: any; primaryType?: string } {
    const domain = {
      name: signingDomain,
    };

    // Ethers v6 expects types without EIP712Domain included
    const types = {
      AccountRegistration: [
        { name: 'accountIndex', type: 'int8' },
        { name: 'wallet', type: 'address' },
        { name: 'tosAccepted', type: 'bool' },
        { name: 'time', type: 'string' },
        { name: 'action', type: 'string' },
        { name: 'host', type: 'string' },
      ],
    };

    const message = {
      accountIndex: this.accountIndex,
      wallet: this.wallet,
      tosAccepted: this.tosAccepted,
      time: this.timeString,
      action: this.action,
      host: this.host,
    };

    return {
      domain,
      types: types as any,
      primaryType: 'AccountRegistration',
      message,
    };
  }

  toJson(): Record<string, any> {
    return {
      accountIndex: this.accountIndex,
      wallet: this.wallet,
      tosAccepted: this.tosAccepted,
      time: this.timeString,
      action: this.action,
      host: this.host,
    };
  }
}

/**
 * Onboarding payload
 */
export class OnboardingPayLoad {
  l1Signature: string;
  l2Key: bigint;
  l2R: bigint;
  l2S: bigint;
  accountRegistration: AccountRegistration;
  referralCode?: string;

  constructor(
    l1Signature: string,
    l2Key: bigint,
    l2R: bigint,
    l2S: bigint,
    accountRegistration: AccountRegistration,
    referralCode?: string
  ) {
    this.l1Signature = l1Signature;
    this.l2Key = l2Key;
    this.l2R = l2R;
    this.l2S = l2S;
    this.accountRegistration = accountRegistration;
    this.referralCode = referralCode;
  }

  toJson(): Record<string, any> {
    return {
      l1Signature: this.l1Signature,
      l2Key: '0x' + this.l2Key.toString(16),
      l2Signature: {
        r: '0x' + this.l2R.toString(16),
        s: '0x' + this.l2S.toString(16),
      },
      accountCreation: this.accountRegistration.toJson(),
      referralCode: this.referralCode,
    };
  }
}

/**
 * Sub-account onboarding payload
 */
export class SubAccountOnboardingPayload {
  l2Key: bigint;
  l2R: bigint;
  l2S: bigint;
  accountRegistration: AccountRegistration;
  description: string;

  constructor(
    l2Key: bigint,
    l2R: bigint,
    l2S: bigint,
    accountRegistration: AccountRegistration,
    description: string
  ) {
    this.l2Key = l2Key;
    this.l2R = l2R;
    this.l2S = l2S;
    this.accountRegistration = accountRegistration;
    this.description = description;
  }

  toJson(): Record<string, any> {
    return {
      l2Key: '0x' + this.l2Key.toString(16),
      l2Signature: {
        r: '0x' + this.l2R.toString(16),
        s: '0x' + this.l2S.toString(16),
      },
      accountCreation: this.accountRegistration.toJson(),
      description: this.description,
    };
  }
}

export const REGISTER_ACTION = 'REGISTER';
export const SUB_ACCOUNT_ACTION = 'CREATE_SUB_ACCOUNT';

/**
 * Get registration struct to sign
 */
export function getRegistrationStructToSign(
  accountIndex: number,
  address: string,
  timestamp: Date,
  action: string,
  host: string
): AccountRegistration {
  return new AccountRegistration(
    accountIndex,
    address,
    true,
    timestamp,
    action,
    host
  );
}

/**
 * Get key derivation struct to sign (EIP-712)
 */
export function getKeyDerivationStructToSign(
  accountIndex: number,
  address: string,
  signingDomain: string
): any {
  const domain = {
    name: signingDomain,
  };

  // Ethers v6 expects types without EIP712Domain included
  const types = {
    AccountCreation: [
      { name: 'accountIndex', type: 'int8' },
      { name: 'wallet', type: 'address' },
      { name: 'tosAccepted', type: 'bool' },
    ],
  };

  const message = {
    accountIndex,
    wallet: address,
    tosAccepted: true,
  };

  return {
    domain,
    types,
    primaryType: 'AccountCreation',
    message,
  };
}

/**
 * Get L2 keys from L1 account
 */
export async function getL2KeysFromL1Account(
  l1PrivateKey: string,
  accountIndex: number,
  signingDomain: string
): Promise<StarkKeyPair> {
  const wallet = new ethers.Wallet(l1PrivateKey);
  const struct = getKeyDerivationStructToSign(
    accountIndex,
    wallet.address,
    signingDomain
  );

  // Sign with ethers.js EIP-712
  const signature = await wallet.signTypedData(
    struct.domain,
    struct.types,
    struct.message
  );

  // Generate keypair from Ethereum signature using WASM
  const [privateKey, publicKey] = generateKeypairFromEthSignature(signature);

  return new StarkKeyPair(privateKey, publicKey);
}

/**
 * Get onboarding payload
 */
export async function getOnboardingPayload(
  l1PrivateKey: string,
  signingDomain: string,
  keyPair: StarkKeyPair,
  host: string,
  referralCode?: string,
  time?: Date
): Promise<OnboardingPayLoad> {
  const wallet = new ethers.Wallet(l1PrivateKey);
  const timestamp = time || new Date();

  const registrationPayload = getRegistrationStructToSign(
    0,
    wallet.address,
    timestamp,
    REGISTER_ACTION,
    host
  );

  const signableMessage = registrationPayload.toSignableMessage(signingDomain);
  const l1Signature = await wallet.signTypedData(
    signableMessage.domain,
    signableMessage.types as any,
    signableMessage.message as any
  );

  // L2 message: pedersen_hash(l1_address, l2_public_key)
  const l1AddressInt = BigInt(wallet.address);
  const l2Message = pedersenHash(l1AddressInt, keyPair.public);
  const [l2R, l2S] = starkSign(l2Message, keyPair.private);

  return new OnboardingPayLoad(
    l1Signature,
    keyPair.public,
    l2R,
    l2S,
    registrationPayload,
    referralCode
  );
}

/**
 * Get sub-account creation payload
 */
export async function getSubAccountCreationPayload(
  accountIndex: number,
  l1Address: string,
  keyPair: StarkKeyPair,
  description: string,
  host: string,
  time?: Date
): Promise<SubAccountOnboardingPayload> {
  const timestamp = time || new Date();

  const registrationPayload = getRegistrationStructToSign(
    accountIndex,
    l1Address,
    timestamp,
    SUB_ACCOUNT_ACTION,
    host
  );

  // L2 message: pedersen_hash(l1_address, l2_public_key)
  const l1AddressInt = BigInt(l1Address);
  const l2Message = pedersenHash(l1AddressInt, keyPair.public);
  const [l2R, l2S] = starkSign(l2Message, keyPair.private);

  return new SubAccountOnboardingPayload(
    keyPair.public,
    l2R,
    l2S,
    registrationPayload,
    description
  );
}

