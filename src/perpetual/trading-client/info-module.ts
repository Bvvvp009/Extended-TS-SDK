/**
 * Info module for trading client
 */

import { BaseModule } from './base-module.js';
import { WrappedApiResponse, sendGetRequest } from '../../utils/http.js';
import { X10BaseModel } from '../../utils/model.js';

/**
 * Settings model
 */
class SettingsModel extends X10BaseModel {
  starkExContractAddress: string;

  constructor(starkExContractAddress: string) {
    super();
    this.starkExContractAddress = starkExContractAddress;
  }
}

/**
 * Info module for general information
 */
export class InfoModule extends BaseModule {
  /**
   * Get settings
   */
  async getSettings(): Promise<WrappedApiResponse<SettingsModel>> {
    const url = this.getUrl('/info/settings');
    return await sendGetRequest<SettingsModel>(url);
  }
}










