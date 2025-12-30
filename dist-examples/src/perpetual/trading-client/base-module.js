"use strict";
/**
 * Base module for trading client modules
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModule = void 0;
const errors_1 = require("../../errors");
const http_1 = require("../../utils/http");
/**
 * Base module class for all trading client modules
 */
class BaseModule {
    endpointConfig;
    apiKey;
    starkAccount;
    session; // Will be fetch-based, no session needed
    constructor(endpointConfig, options = {}) {
        this.endpointConfig = endpointConfig;
        this.apiKey = options.apiKey;
        this.starkAccount = options.starkAccount;
    }
    getUrl(path, options = {}) {
        const fullPath = `${this.endpointConfig.apiBaseUrl}${path}`;
        return (0, http_1.getUrl)(fullPath, {
            query: options.query,
            pathParams: options.pathParams,
        });
    }
    getEndpointConfig() {
        return this.endpointConfig;
    }
    getApiKey() {
        if (!this.apiKey) {
            throw new errors_1.X10Error('API key is not set');
        }
        return this.apiKey;
    }
    getStarkAccount() {
        if (!this.starkAccount) {
            throw new errors_1.X10Error('Stark account is not set');
        }
        return this.starkAccount;
    }
    async closeSession() {
        // No-op for fetch-based implementation
    }
}
exports.BaseModule = BaseModule;
//# sourceMappingURL=base-module.js.map