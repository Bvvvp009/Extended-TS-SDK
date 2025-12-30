/**
 * User client for onboarding and account management
 */
import { EndpointConfig } from '../configuration';
import { AccountModel, ApiKeyResponseModel } from '../accounts';
import { OnBoardedAccount } from './onboarding';
/**
 * User client for onboarding and L1 account operations
 */
export declare class UserClient {
    private endpointConfig;
    private l1PrivateKey;
    constructor(endpointConfig: EndpointConfig, l1PrivateKey: () => string);
    /**
     * Get URL
     */
    private getUrl;
    /**
     * Onboard new account
     */
    onboard(referralCode?: string): Promise<OnBoardedAccount>;
    /**
     * Onboard sub-account
     */
    onboardSubaccount(accountIndex: number, description?: string): Promise<OnBoardedAccount>;
    /**
     * Get all accounts
     */
    getAccounts(): Promise<OnBoardedAccount[]>;
    /**
     * Create account API key
     */
    createAccountApiKey(account: AccountModel, description?: string): Promise<string>;
    /**
     * Delete account API key
     * https://api.docs.extended.exchange/#delete-api-key
     */
    deleteAccountApiKey(account: AccountModel, apiKeyId: number): Promise<void>;
    /**
     * Get list of account API keys
     * https://api.docs.extended.exchange/#get-api-keys
     */
    getAccountApiKeys(account: AccountModel): Promise<ApiKeyResponseModel[]>;
}
//# sourceMappingURL=user-client.d.ts.map