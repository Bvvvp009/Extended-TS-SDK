"use strict";
/**
 * Client models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModel = void 0;
const model_1 = require("../utils/model");
/**
 * Client model
 */
class ClientModel extends model_1.X10BaseModel {
    id;
    evmWalletAddress;
    starknetWalletAddress;
    referralLinkCode;
    constructor(id, evmWalletAddress, starknetWalletAddress, referralLinkCode) {
        super();
        this.id = id;
        this.evmWalletAddress = evmWalletAddress;
        this.starknetWalletAddress = starknetWalletAddress;
        this.referralLinkCode = referralLinkCode;
    }
}
exports.ClientModel = ClientModel;
//# sourceMappingURL=clients.js.map