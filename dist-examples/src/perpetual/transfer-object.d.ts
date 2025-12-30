/**
 * Transfer object creation
 */
import Decimal from 'decimal.js';
import { EndpointConfig } from './configuration';
import { StarkPerpetualAccount } from './accounts';
import { OnChainPerpetualTransferModel } from './transfers';
/**
 * Create transfer object
 */
export declare function createTransferObject(fromVault: number, toVault: number, toL2Key: number | string, amount: Decimal, config: EndpointConfig, starkAccount: StarkPerpetualAccount, nonce?: number): Promise<OnChainPerpetualTransferModel>;
//# sourceMappingURL=transfer-object.d.ts.map