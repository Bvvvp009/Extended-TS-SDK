/**
 * Bridge models
 */
import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';
/**
 * Chain config
 */
export declare class ChainConfig extends X10BaseModel {
    chain: string;
    contractAddress: string;
    constructor(chain: string, contractAddress: string);
}
/**
 * Bridges config
 */
export declare class BridgesConfig extends X10BaseModel {
    chains: ChainConfig[];
    constructor(chains: ChainConfig[]);
}
/**
 * Quote model
 */
export declare class Quote extends X10BaseModel {
    id: string;
    fee: Decimal;
    constructor(id: string, fee: Decimal);
}
//# sourceMappingURL=bridges.d.ts.map