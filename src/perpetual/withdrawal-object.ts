/**
 * Withdrawal object creation
 */

import Decimal from 'decimal.js';
import { EndpointConfig, StarknetDomain } from './configuration';
import { StarkPerpetualAccount } from './accounts';
import { WithdrawalRequest, StarkWithdrawalSettlement, Timestamp } from './withdrawals';
import { SettlementSignatureModel } from '../utils/model';
import { getWithdrawalMsgHash } from './crypto/signer';
import { generateNonce } from '../utils/nonce';
import { utcNow } from '../utils/date';

/**
 * Calculate expiration timestamp (15 days from now)
 */
function calcExpirationTimestamp(): number {
  const expireTime = new Date(utcNow());
  expireTime.setDate(expireTime.getDate() + 15);
  return Math.ceil(expireTime.getTime() / 1000);
}

/**
 * Create withdrawal object
 */
export function createWithdrawalObject(
  amount: Decimal,
  recipientStarkAddress: string,
  starkAccount: StarkPerpetualAccount,
  config: EndpointConfig,
  accountId: number,
  chainId: string,
  description?: string,
  nonce?: number,
  quoteId?: string
): WithdrawalRequest {
  const expirationTimestamp = calcExpirationTimestamp();
  
  // Scale amount by decimals
  const scaledAmount = amount.mul(Math.pow(10, config.collateralDecimals));
  const starkAmount = Math.round(scaledAmount.toNumber());
  
  const starknetDomain: StarknetDomain = config.starknetDomain;
  const finalNonce = nonce || generateNonce();

  const withdrawalHash = getWithdrawalMsgHash({
    recipientHex: recipientStarkAddress.startsWith('0x')
      ? recipientStarkAddress
      : '0x' + recipientStarkAddress,
    positionId: starkAccount.getVault(),
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

  const [transferSignatureR, transferSignatureS] = starkAccount.sign(withdrawalHash);

  const settlement = new StarkWithdrawalSettlement(
    recipientStarkAddress.startsWith('0x') ? recipientStarkAddress : `0x${recipientStarkAddress}`, // Hex string
    starkAccount.getVault(),
    config.collateralAssetOnChainId, // Already a hex string
    starkAmount,
    new Timestamp(expirationTimestamp),
    finalNonce,
    new SettlementSignatureModel(transferSignatureR, transferSignatureS)
  );

  return new WithdrawalRequest(
    accountId,
    amount,
    settlement,
    chainId,
    'USD',
    description,
    quoteId
  );
}


