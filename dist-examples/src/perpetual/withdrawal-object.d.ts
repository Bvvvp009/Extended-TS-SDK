/**
 * Withdrawal object creation
 */
import Decimal from 'decimal.js';
import { EndpointConfig } from './configuration';
import { StarkPerpetualAccount } from './accounts';
import { WithdrawalRequest } from './withdrawals';
/**
 * Create withdrawal object
 */
export declare function createWithdrawalObject(amount: Decimal, recipientStarkAddress: string, starkAccount: StarkPerpetualAccount, config: EndpointConfig, accountId: number, chainId: string, description?: string, nonce?: number, quoteId?: string): Promise<WithdrawalRequest>;
//# sourceMappingURL=withdrawal-object.d.ts.map