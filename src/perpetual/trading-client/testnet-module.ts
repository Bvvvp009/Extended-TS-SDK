/**
 * Testnet module for trading client
 */

import { BaseModule } from './base-module.js';
import { AccountModule } from './account-module.js';
import { WrappedApiResponse, sendPostRequest } from '../../utils/http.js';
import { X10BaseModel } from '../../utils/model.js';

/**
 * Claim response model
 */
class ClaimResponseModel extends X10BaseModel {
  id: number;

  constructor(id: number) {
    super();
    this.id = id;
  }
}

/**
 * Testnet module for testnet-specific operations
 */
export class TestnetModule extends BaseModule {
  private accountModule: AccountModule;

  constructor(
    endpointConfig: any,
    apiKey: string | undefined,
    accountModule: AccountModule
  ) {
    super(endpointConfig, { apiKey });
    this.accountModule = accountModule;
  }

  /**
   * Claim testing funds
   */
  async claimTestingFunds(): Promise<WrappedApiResponse<ClaimResponseModel>> {
    const url = this.getUrl('/user/claim');
    const response = await sendPostRequest<ClaimResponseModel>(
      url,
      {},
      this.getApiKey()
    );

    // Wait for claim to complete (simplified - no retry logic in this implementation)
    if (response.data && this.accountModule) {
      // Poll asset operations until completed
      // In production, add retry logic here
      await this.accountModule.assetOperations({ id: response.data.id });
    }

    return response;
  }
}

