"use strict";
/**
 * Bridge models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quote = exports.BridgesConfig = exports.ChainConfig = void 0;
const model_1 = require("../utils/model");
/**
 * Chain config
 */
class ChainConfig extends model_1.X10BaseModel {
    chain;
    contractAddress;
    constructor(chain, contractAddress) {
        super();
        this.chain = chain;
        this.contractAddress = contractAddress;
    }
}
exports.ChainConfig = ChainConfig;
/**
 * Bridges config
 */
class BridgesConfig extends model_1.X10BaseModel {
    chains;
    constructor(chains) {
        super();
        this.chains = chains;
    }
}
exports.BridgesConfig = BridgesConfig;
/**
 * Quote model
 */
class Quote extends model_1.X10BaseModel {
    id;
    fee;
    constructor(id, fee) {
        super();
        this.id = id;
        this.fee = fee;
    }
}
exports.Quote = Quote;
//# sourceMappingURL=bridges.js.map