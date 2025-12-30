"use strict";
/**
 * Testnet module for trading client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestnetModule = void 0;
const base_module_1 = require("./base-module");
const http_1 = require("../../utils/http");
const model_1 = require("../../utils/model");
/**
 * Claim response model
 */
class ClaimResponseModel extends model_1.X10BaseModel {
    id;
    constructor(id) {
        super();
        this.id = id;
    }
}
/**
 * Testnet module for testnet-specific operations
 */
class TestnetModule extends base_module_1.BaseModule {
    accountModule;
    constructor(endpointConfig, apiKey, accountModule) {
        super(endpointConfig, { apiKey });
        this.accountModule = accountModule;
    }
    /**
     * Claim testing funds
     */
    async claimTestingFunds() {
        const url = this.getUrl('/user/claim');
        const response = await (0, http_1.sendPostRequest)(url, {}, this.getApiKey());
        // Wait for claim to complete (simplified - no retry logic in this implementation)
        if (response.data && this.accountModule) {
            // Poll asset operations until completed
            // In production, add retry logic here
            await this.accountModule.assetOperations({ id: response.data.id });
        }
        return response;
    }
}
exports.TestnetModule = TestnetModule;
//# sourceMappingURL=testnet-module.js.map