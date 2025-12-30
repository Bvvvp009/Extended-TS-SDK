"use strict";
/**
 * Withdrawal models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalRequest = exports.StarkWithdrawalSettlement = exports.Timestamp = void 0;
const model_1 = require("../utils/model");
/**
 * Timestamp model
 */
class Timestamp extends model_1.X10BaseModel {
    seconds;
    constructor(seconds) {
        super();
        this.seconds = seconds;
    }
}
exports.Timestamp = Timestamp;
/**
 * Stark withdrawal settlement
 */
class StarkWithdrawalSettlement extends model_1.X10BaseModel {
    recipient;
    positionId;
    collateralId;
    amount;
    expiration;
    salt;
    signature;
    constructor(recipient, positionId, collateralId, amount, expiration, salt, signature) {
        super();
        this.recipient = recipient;
        this.positionId = positionId;
        this.collateralId = collateralId;
        this.amount = amount;
        this.expiration = expiration;
        this.salt = salt;
        this.signature = signature;
    }
}
exports.StarkWithdrawalSettlement = StarkWithdrawalSettlement;
/**
 * Withdrawal request model
 */
class WithdrawalRequest extends model_1.X10BaseModel {
    accountId;
    amount;
    description;
    settlement;
    chainId;
    quoteId;
    asset;
    constructor(accountId, amount, settlement, chainId, asset, description, quoteId) {
        super();
        this.accountId = accountId;
        this.amount = amount;
        this.description = description;
        this.settlement = settlement;
        this.chainId = chainId;
        this.quoteId = quoteId;
        this.asset = asset;
    }
}
exports.WithdrawalRequest = WithdrawalRequest;
//# sourceMappingURL=withdrawals.js.map