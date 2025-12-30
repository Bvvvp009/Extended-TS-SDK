"use strict";
/**
 * Transfer object creation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransferObject = createTransferObject;
const transfers_1 = require("./transfers");
const model_1 = require("../utils/model");
const signer_1 = require("./crypto/signer");
const nonce_1 = require("../utils/nonce");
const date_1 = require("../utils/date");
/**
 * Calculate expiration timestamp (21 days from now)
 */
function calcExpirationTimestamp() {
    const expireTime = new Date((0, date_1.utcNow)());
    expireTime.setDate(expireTime.getDate() + 21); // 7 days + 14 days buffer
    return Math.ceil(expireTime.getTime() / 1000);
}
/**
 * Create transfer object
 */
async function createTransferObject(fromVault, toVault, toL2Key, amount, config, starkAccount, nonce) {
    const expirationTimestamp = calcExpirationTimestamp();
    // Scale amount by decimals
    const scaledAmount = amount.mul(Math.pow(10, config.collateralDecimals));
    const starkAmount = Math.round(scaledAmount.toNumber());
    const starknetDomain = config.starknetDomain;
    const finalNonce = nonce || (0, nonce_1.generateNonce)();
    // Convert to_l2_key to number if it's a string
    let toL2KeyNum;
    if (typeof toL2Key === 'string') {
        toL2KeyNum = parseInt(toL2Key, 16);
    }
    else {
        toL2KeyNum = toL2Key;
    }
    const transferHash = (0, signer_1.getTransferMsgHash)({
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
    const settlement = new transfers_1.StarkTransferSettlement(starkAmount, config.collateralAssetOnChainId, // Already a hex string
    expirationTimestamp, finalNonce, toVault, `0x${toL2KeyNum.toString(16)}`, // Convert to hex string
    fromVault, starkAccount.getPublicKeyHex(), new model_1.SettlementSignatureModel(transferSignatureR, transferSignatureS));
    return new transfers_1.OnChainPerpetualTransferModel(fromVault, toVault, amount, settlement, config.collateralAssetId);
}
//# sourceMappingURL=transfer-object.js.map