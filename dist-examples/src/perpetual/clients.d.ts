/**
 * Client models
 */
import { X10BaseModel } from '../utils/model';
/**
 * Client model
 */
export declare class ClientModel extends X10BaseModel {
    id: number;
    evmWalletAddress?: string;
    starknetWalletAddress?: string;
    referralLinkCode?: string;
    constructor(id: number, evmWalletAddress?: string, starknetWalletAddress?: string, referralLinkCode?: string);
}
//# sourceMappingURL=clients.d.ts.map