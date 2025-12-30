/**
 * Info module for trading client
 */
import { BaseModule } from './base-module';
import { WrappedApiResponse } from '../../utils/http';
import { X10BaseModel } from '../../utils/model';
/**
 * Settings model
 */
declare class SettingsModel extends X10BaseModel {
    starkExContractAddress: string;
    constructor(starkExContractAddress: string);
}
/**
 * Info module for general information
 */
export declare class InfoModule extends BaseModule {
    /**
     * Get settings
     */
    getSettings(): Promise<WrappedApiResponse<SettingsModel>>;
}
export {};
//# sourceMappingURL=info-module.d.ts.map