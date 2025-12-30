"use strict";
/**
 * Info module for trading client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoModule = void 0;
const base_module_1 = require("./base-module");
const http_1 = require("../../utils/http");
const model_1 = require("../../utils/model");
/**
 * Settings model
 */
class SettingsModel extends model_1.X10BaseModel {
    starkExContractAddress;
    constructor(starkExContractAddress) {
        super();
        this.starkExContractAddress = starkExContractAddress;
    }
}
/**
 * Info module for general information
 */
class InfoModule extends base_module_1.BaseModule {
    /**
     * Get settings
     */
    async getSettings() {
        const url = this.getUrl('/info/settings');
        return await (0, http_1.sendGetRequest)(url);
    }
}
exports.InfoModule = InfoModule;
//# sourceMappingURL=info-module.js.map