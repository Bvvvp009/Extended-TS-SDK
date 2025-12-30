/**
 * Base module for trading client modules
 */
import { EndpointConfig } from '../configuration';
import { StarkPerpetualAccount } from '../accounts';
/**
 * Base module class for all trading client modules
 */
export declare class BaseModule {
    private endpointConfig;
    private apiKey?;
    private starkAccount?;
    private session?;
    constructor(endpointConfig: EndpointConfig, options?: {
        apiKey?: string;
        starkAccount?: StarkPerpetualAccount;
    });
    protected getUrl(path: string, options?: {
        query?: Record<string, string | string[]>;
        pathParams?: Record<string, string | number>;
    }): string;
    protected getEndpointConfig(): EndpointConfig;
    protected getApiKey(): string;
    protected getStarkAccount(): StarkPerpetualAccount;
    closeSession(): Promise<void>;
}
//# sourceMappingURL=base-module.d.ts.map