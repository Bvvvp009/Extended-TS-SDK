/**
 * Testnet module for trading client
 */
import { BaseModule } from './base-module';
import { AccountModule } from './account-module';
import { WrappedApiResponse } from '../../utils/http';
import { X10BaseModel } from '../../utils/model';
/**
 * Claim response model
 */
declare class ClaimResponseModel extends X10BaseModel {
    id: number;
    constructor(id: number);
}
/**
 * Testnet module for testnet-specific operations
 */
export declare class TestnetModule extends BaseModule {
    private accountModule;
    constructor(endpointConfig: any, apiKey: string | undefined, accountModule: AccountModule);
    /**
     * Claim testing funds
     */
    claimTestingFunds(): Promise<WrappedApiResponse<ClaimResponseModel>>;
}
export {};
//# sourceMappingURL=testnet-module.d.ts.map