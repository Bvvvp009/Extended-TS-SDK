/**
 * Transfer object creation
 */

import Decimal from 'decimal.js';
import { EndpointConfig, StarknetDomain } from './configuration';
import { StarkPerpetualAccount } from './accounts';
import { OnChainPerpetualTransferModel, StarkTransferSettlement } from './transfers';
import { SettlementSignatureModel } from '../utils/model';
import { getTransferMsgHash } from './crypto/signer';
import { generateNonce } from '../utils/nonce';
import { utcNow } from '../utils/date';

/**
 * Calculate expiration timestamp (21 days from now)
 */
function calcExpirationTimestamp(): number {
  const expireTime = new Date(utcNow());
  expireTime.setDate(expireTime.getDate() + 21); // 7 days + 14 days buffer
  return Math.ceil(expireTime.getTime() / 1000);
}

/**
 * Create transfer object
 */
export async function createTransferObject(
  fromVault: number,
  toVault: number,
  toL2Key: number | string,
  amount: Decimal,
  config: EndpointConfig,
  starkAccount: StarkPerpetualAccount,
  nonce?: number
): Promise<OnChainPerpetualTransferModel> {
  const expirationTimestamp = calcExpirationTimestamp();
  
  // Scale amount by decimals
  const scaledAmount = amount.mul(Math.pow(10, config.collateralDecimals));
  const starkAmount = Math.round(scaledAmount.toNumber());
  
  const starknetDomain: StarknetDomain = config.starknetDomain;
  const finalNonce = nonce || generateNonce();

  // Convert to_l2_key to number if it's a string
  let toL2KeyNum: number;
  if (typeof toL2Key === 'string') {
    toL2KeyNum = parseInt(toL2Key, 16);
  } else {
    toL2KeyNum = toL2Key;
  }

  const transferHash = getTransferMsgHash({
    recipientPositionId: toVault,
    senderPositionId: fromVault,
    amount: starkAmount.toString(),
    expiration: expirationTimestamp,
    salt: finalNonce.toString(),
    userPublicKey: '0x' + starkAccount.getPublicKey().toString(16),
    domainName: starknetDomain.name,
    domainVersion: starknetDomain.version,
    domainChainId: starknetDomain.chainId,
    domainRevision: starknetDomain.revision,
    collateralId: config.collateralAssetOnChainId,
  });

  const [transferSignatureR, transferSignatureS] = await starkAccount.sign(transferHash);
  
  const settlement = new StarkTransferSettlement(
    starkAmount,
    config.collateralAssetOnChainId, // Already a hex string
    expirationTimestamp,
    finalNonce,
    toVault,
    `0x${toL2KeyNum.toString(16)}`, // Convert to hex string
    fromVault,
    starkAccount.getPublicKeyHex(),
    new SettlementSignatureModel(transferSignatureR, transferSignatureS)
  );

  return new OnChainPerpetualTransferModel(
    fromVault,
    toVault,
    amount,
    settlement,
    config.collateralAssetId
  );
}


