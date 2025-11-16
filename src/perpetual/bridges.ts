/**
 * Bridge models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';

/**
 * Chain config
 */
export class ChainConfig extends X10BaseModel {
  chain: string;
  contractAddress: string;

  constructor(chain: string, contractAddress: string) {
    super();
    this.chain = chain;
    this.contractAddress = contractAddress;
  }
}

/**
 * Bridges config
 */
export class BridgesConfig extends X10BaseModel {
  chains: ChainConfig[];

  constructor(chains: ChainConfig[]) {
    super();
    this.chains = chains;
  }
}

/**
 * Quote model
 */
export class Quote extends X10BaseModel {
  id: string;
  fee: Decimal;

  constructor(id: string, fee: Decimal) {
    super();
    this.id = id;
    this.fee = fee;
  }
}







