/**
 * Base module for trading client modules
 */

import { EndpointConfig } from '../configuration.js';
import { StarkPerpetualAccount } from '../accounts.js';
import { X10Error } from '../../errors.js';
import { getUrl } from '../../utils/http.js';

/**
 * Base module class for all trading client modules
 */
export class BaseModule {
  private endpointConfig: EndpointConfig;
  private apiKey?: string;
  private starkAccount?: StarkPerpetualAccount;
  private session?: any; // Will be fetch-based, no session needed

  constructor(
    endpointConfig: EndpointConfig,
    options: {
      apiKey?: string;
      starkAccount?: StarkPerpetualAccount;
    } = {}
  ) {
    this.endpointConfig = endpointConfig;
    this.apiKey = options.apiKey;
    this.starkAccount = options.starkAccount;
  }

  protected getUrl(path: string, options: {
    query?: Record<string, string | string[]>;
    pathParams?: Record<string, string | number>;
  } = {}): string {
    const fullPath = `${this.endpointConfig.apiBaseUrl}${path}`;
    return getUrl(fullPath, {
      query: options.query,
      pathParams: options.pathParams,
    });
  }

  protected getEndpointConfig(): EndpointConfig {
    return this.endpointConfig;
  }

  protected getApiKey(): string {
    if (!this.apiKey) {
      throw new X10Error('API key is not set');
    }
    return this.apiKey;
  }

  protected getStarkAccount(): StarkPerpetualAccount {
    if (!this.starkAccount) {
      throw new X10Error('Stark account is not set');
    }
    return this.starkAccount;
  }

  async closeSession(): Promise<void> {
    // No-op for fetch-based implementation
  }
}










