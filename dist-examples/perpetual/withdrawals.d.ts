/**
 * Withdrawal models
 */
import Decimal from 'decimal.js';
import { X10BaseModel, HexValue } from '../utils/model';
import { SettlementSignatureModel } from '../utils/model';
/**
 * Timestamp model
 */
export declare class Timestamp extends X10BaseModel {
    seconds: number;
    constructor(seconds: number);
}
/**
 * Stark withdrawal settlement
 */
export declare class StarkWithdrawalSettlement extends X10BaseModel {
    recipient: HexValue;
    positionId: number;
    collateralId: HexValue;
    amount: number;
    expiration: Timestamp;
    salt: number;
    signature: SettlementSignatureModel;
    constructor(recipient: HexValue, positionId: number, collateralId: HexValue, amount: number, expiration: Timestamp, salt: number, signature: SettlementSignatureModel);
}
/**
 * Withdrawal request model
 */
export declare class WithdrawalRequest extends X10BaseModel {
    accountId: number;
    amount: Decimal;
    description?: string;
    settlement: StarkWithdrawalSettlement;
    chainId: string;
    quoteId?: string;
    asset: string;
    constructor(accountId: number, amount: Decimal, settlement: StarkWithdrawalSettlement, chainId: string, asset: string, description?: string, quoteId?: string);
}
//# sourceMappingURL=withdrawals.d.ts.map