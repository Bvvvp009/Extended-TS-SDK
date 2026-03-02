/**
 * Client models
 */

import { X10BaseModel } from '../utils/model.js';

/**
 * Client model
 */
export class ClientModel extends X10BaseModel {
  id: number;
  evmWalletAddress?: string;
  starknetWalletAddress?: string;
  referralLinkCode?: string;

  constructor(
    id: number,
    evmWalletAddress?: string,
    starknetWalletAddress?: string,
    referralLinkCode?: string
  ) {
    super();
    this.id = id;
    this.evmWalletAddress = evmWalletAddress;
    this.starknetWalletAddress = starknetWalletAddress;
    this.referralLinkCode = referralLinkCode;
  }
}










