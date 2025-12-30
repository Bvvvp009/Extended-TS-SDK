"use strict";
/**
 * Base model utilities and types
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyModel = exports.SettlementSignatureModel = exports.X10BaseModel = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
/**
 * Base model class for all X10 API models
 * Handles camelCase/snake_case conversion
 */
class X10BaseModel {
    /**
     * Convert model to pretty JSON string
     */
    toPrettyJson() {
        return JSON.stringify(this, null, 2);
    }
    /**
     * Convert model to API request JSON (camelCase)
     */
    toApiRequestJson(excludeNone = false) {
        const obj = {};
        for (const [key, value] of Object.entries(this)) {
            const camelKey = toCamel(key);
            if (excludeNone && (value === null || value === undefined)) {
                continue;
            }
            let processed = value;
            // Recursively convert nested models
            if (value instanceof X10BaseModel) {
                processed = value.toApiRequestJson(excludeNone);
            }
            // Convert arrays of models
            if (Array.isArray(value)) {
                processed = value.map((item) => item instanceof X10BaseModel ? item.toApiRequestJson(excludeNone) : item);
            }
            // Convert BigInt to hex string
            if (typeof processed === 'bigint') {
                processed = `0x${processed.toString(16)}`;
            }
            // Convert Decimal to string
            if (processed instanceof decimal_js_1.default) {
                processed = processed.toString();
            }
            // Convert snake_case to camelCase
            if (key !== camelKey) {
                obj[camelKey] = processed;
            }
            else {
                obj[key] = processed;
            }
        }
        return obj;
    }
}
exports.X10BaseModel = X10BaseModel;
/**
 * Convert snake_case to camelCase
 */
function toCamel(str) {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}
/**
 * Settlement signature model
 */
class SettlementSignatureModel extends X10BaseModel {
    r;
    s;
    constructor(r, s) {
        super();
        this.r = r;
        this.s = s;
    }
}
exports.SettlementSignatureModel = SettlementSignatureModel;
/**
 * Empty model (for void responses)
 */
class EmptyModel extends X10BaseModel {
}
exports.EmptyModel = EmptyModel;
//# sourceMappingURL=model.js.map