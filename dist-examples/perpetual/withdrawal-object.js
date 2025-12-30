"use strict";
/**
 * Withdrawal object creation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdrawalObject = createWithdrawalObject;
const withdrawals_1 = require("./withdrawals");
const model_1 = require("../utils/model");
const signer_1 = require("./crypto/signer");
const nonce_1 = require("../utils/nonce");
const date_1 = require("../utils/date");
/**
 * Calculate expiration timestamp (15 days from now)
 */
function calcExpirationTimestamp() {
    const expireTime = new Date((0, date_1.utcNow)());
    expireTime.setDate(expireTime.getDate() + 15);
    return Math.ceil(expireTime.getTime() / 1000);
}
/**
 * Create withdrawal object
 */
async function createWithdrawalObject(amount, recipientStarkAddress, starkAccount, config, accountId, chainId, description, nonce, quoteId) {
    const expirationTimestamp = calcExpirationTimestamp();
    // Scale amount by decimals
    const scaledAmount = amount.mul(Math.pow(10, config.collateralDecimals));
    const starkAmount = Math.round(scaledAmount.toNumber());
    const starknetDomain = config.starknetDomain;
    const finalNonce = nonce || (0, nonce_1.generateNonce)();
    const withdrawalHash = (0, signer_1.getWithdrawalMsgHash)({
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
    const [transferSignatureR, transferSignatureS] = await starkAccount.sign(withdrawalHash);
    const settlement = new withdrawals_1.StarkWithdrawalSettlement(recipientStarkAddress.startsWith('0x') ? recipientStarkAddress : `0x${recipientStarkAddress}`, // Hex string
    starkAccount.getVault(), config.collateralAssetOnChainId, // Already a hex string
    starkAmount, new withdrawals_1.Timestamp(expirationTimestamp), finalNonce, new model_1.SettlementSignatureModel(transferSignatureR, transferSignatureS));
    return new withdrawals_1.WithdrawalRequest(accountId, amount, settlement, chainId, 'USD', description, quoteId);
}
//# sourceMappingURL=withdrawal-object.js.map