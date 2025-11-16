/**
 * User client for onboarding and account management
 */

import { ethers } from 'ethers';
import { EndpointConfig } from '../configuration';
import { AccountModel, ApiKeyRequestModel, ApiKeyResponseModel } from '../accounts';
import { SubAccountExists } from '../../errors';
import { getUrl, sendGetRequest, sendPostRequest, sendDeleteRequest } from '../../utils/http';
import { utcNow } from '../../utils/date';
import {
  OnBoardedAccount,
  StarkKeyPair,
  getL2KeysFromL1Account,
  getOnboardingPayload,
  getSubAccountCreationPayload,
} from './onboarding';

const L1_AUTH_SIGNATURE_HEADER = 'L1_SIGNATURE';
const L1_MESSAGE_TIME_HEADER = 'L1_MESSAGE_TIME';
const ACTIVE_ACCOUNT_HEADER = 'X-X10-ACTIVE-ACCOUNT';

/**
 * User client for onboarding and L1 account operations
 */
export class UserClient {
  private endpointConfig: EndpointConfig;
  private l1PrivateKey: () => string;

  constructor(endpointConfig: EndpointConfig, l1PrivateKey: () => string) {
    this.endpointConfig = endpointConfig;
    this.l1PrivateKey = l1PrivateKey;
  }

  /**
   * Get URL
   */
  private getUrl(baseUrl: string, path: string, options: {
    query?: Record<string, string | string[]>;
    pathParams?: Record<string, string | number>;
  } = {}): string {
    return getUrl(`${baseUrl}${path}`, options);
  }

  /**
   * Onboard new account
   */
  async onboard(referralCode?: string): Promise<OnBoardedAccount> {
    const wallet = new ethers.Wallet(this.l1PrivateKey());
    const keyPair = await getL2KeysFromL1Account(
      this.l1PrivateKey(),
      0,
      this.endpointConfig.signingDomain
    );

    const payload = await getOnboardingPayload(
      this.l1PrivateKey(),
      this.endpointConfig.signingDomain,
      keyPair,
      this.endpointConfig.onboardingUrl,
      referralCode
    );

    const url = this.getUrl(this.endpointConfig.onboardingUrl, '/auth/onboard');

    const onboardingResponse = await sendPostRequest<any>(
      url,
      payload.toJson()
    );

    const onboardedClient = onboardingResponse.data;
    if (!onboardedClient) {
      throw new Error('No account data returned from onboarding');
    }

    return {
      account: onboardedClient.defaultAccount,
      l2KeyPair: keyPair,
    };
  }

  /**
   * Onboard sub-account
   */
  async onboardSubaccount(
    accountIndex: number,
    description?: string
  ): Promise<OnBoardedAccount> {
    const requestPath = '/auth/onboard/subaccount';
    const finalDescription = description || `Subaccount ${accountIndex}`;

    const wallet = new ethers.Wallet(this.l1PrivateKey());
    const time = utcNow();
    const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const l1Message = `${requestPath}@${authTimeString}`;
    
    // Sign with ethers
    const l1Signature = await wallet.signMessage(l1Message);

    const keyPair = await getL2KeysFromL1Account(
      this.l1PrivateKey(),
      accountIndex,
      this.endpointConfig.signingDomain
    );

    const payload = await getSubAccountCreationPayload(
      accountIndex,
      wallet.address,
      keyPair,
      finalDescription,
      this.endpointConfig.onboardingUrl
    );

    const headers: Record<string, string> = {
      [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
      [L1_MESSAGE_TIME_HEADER]: authTimeString,
    };

    const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);

    try {
      const onboardingResponse = await sendPostRequest<AccountModel>(
        url,
        payload.toJson(),
        undefined,
        headers,
        new Map([[409, SubAccountExists as any]])
      );

      const onboardedAccount = onboardingResponse.data;
      if (!onboardedAccount) {
        throw new Error('No account data returned from onboarding');
      }

      return {
        account: onboardedAccount,
        l2KeyPair: keyPair,
      };
    } catch (error) {
      if (error instanceof SubAccountExists) {
        const clientAccounts = await this.getAccounts();
        const accountWithIndex = clientAccounts.find(
          (acc) => acc.account.accountIndex === accountIndex
        );
        if (!accountWithIndex) {
          throw new SubAccountExists(
            'Subaccount already exists but not found in client accounts'
          );
        }
        return accountWithIndex;
      }
      throw error;
    }
  }

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<OnBoardedAccount[]> {
    const requestPath = '/api/v1/user/accounts';
    const wallet = new ethers.Wallet(this.l1PrivateKey());
    const time = utcNow();
    const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const l1Message = `${requestPath}@${authTimeString}`;
    
    const l1Signature = await wallet.signMessage(l1Message);

    const headers: Record<string, string> = {
      [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
      [L1_MESSAGE_TIME_HEADER]: authTimeString,
    };

    const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
    const response = await sendGetRequest<AccountModel[]>(
      url,
      undefined,
      headers
    );

    const accounts = response.data || [];

    const result: OnBoardedAccount[] = [];
    for (const account of accounts) {
      const keyPair = await getL2KeysFromL1Account(
        this.l1PrivateKey(),
        account.accountIndex,
        this.endpointConfig.signingDomain
      );
      result.push({
        account,
        l2KeyPair: keyPair,
      });
    }

    return result;
  }

  /**
   * Create account API key
   */
  async createAccountApiKey(account: AccountModel, description?: string): Promise<string> {
    const requestPath = '/api/v1/user/account/api-key';
    const finalDescription = description || `trading api key for account ${account.id}`;

    const wallet = new ethers.Wallet(this.l1PrivateKey());
    const time = utcNow();
    const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const l1Message = `${requestPath}@${authTimeString}`;
    
    const l1Signature = await wallet.signMessage(l1Message);

    const headers: Record<string, string> = {
      [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
      [L1_MESSAGE_TIME_HEADER]: authTimeString,
      [ACTIVE_ACCOUNT_HEADER]: account.id.toString(),
    };

    const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
    const request = new ApiKeyRequestModel(finalDescription);
    const response = await sendPostRequest<ApiKeyResponseModel>(
      url,
      request.toApiRequestJson(),
      undefined,
      headers
    );

    const responseData = response.data;
    if (!responseData) {
      throw new Error('No API key data returned from onboarding');
    }

    return responseData.key;
  }

  /**
   * Delete account API key
   * https://api.docs.extended.exchange/#delete-api-key
   */
  async deleteAccountApiKey(account: AccountModel, apiKeyId: number): Promise<void> {
    const requestPath = `/api/v1/user/account/api-key/${apiKeyId}`;
    const wallet = new ethers.Wallet(this.l1PrivateKey());
    const time = utcNow();
    const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const l1Message = `${requestPath}@${authTimeString}`;
    
    const l1Signature = await wallet.signMessage(l1Message);

    const headers: Record<string, string> = {
      [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
      [L1_MESSAGE_TIME_HEADER]: authTimeString,
      [ACTIVE_ACCOUNT_HEADER]: account.id.toString(),
    };

    const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
    await sendDeleteRequest<any>(url, undefined, headers);
  }

  /**
   * Get list of account API keys
   * https://api.docs.extended.exchange/#get-api-keys
   */
  async getAccountApiKeys(account: AccountModel): Promise<ApiKeyResponseModel[]> {
    const requestPath = '/api/v1/user/account/api-key';
    const wallet = new ethers.Wallet(this.l1PrivateKey());
    const time = utcNow();
    const authTimeString = time.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const l1Message = `${requestPath}@${authTimeString}`;
    
    const l1Signature = await wallet.signMessage(l1Message);

    const headers: Record<string, string> = {
      [L1_AUTH_SIGNATURE_HEADER]: l1Signature,
      [L1_MESSAGE_TIME_HEADER]: authTimeString,
      [ACTIVE_ACCOUNT_HEADER]: account.id.toString(),
    };

    const url = this.getUrl(this.endpointConfig.onboardingUrl, requestPath);
    const response = await sendGetRequest<ApiKeyResponseModel[]>(
      url,
      undefined,
      headers
    );

    return response.data || [];
  }
}


