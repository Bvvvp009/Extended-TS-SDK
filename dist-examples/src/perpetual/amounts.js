"use strict";
/**
 * Amount conversion utilities
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarkAmount = exports.L1Amount = exports.HumanReadableAmount = exports.ROUNDING_FEE_CONTEXT = exports.ROUNDING_BUY_CONTEXT = exports.ROUNDING_SELL_CONTEXT = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
/**
 * Rounding contexts
 */
exports.ROUNDING_SELL_CONTEXT = decimal_js_1.default.ROUND_DOWN;
exports.ROUNDING_BUY_CONTEXT = decimal_js_1.default.ROUND_UP;
exports.ROUNDING_FEE_CONTEXT = decimal_js_1.default.ROUND_UP;
/**
 * Human-readable amount
 */
class HumanReadableAmount {
    value;
    asset;
    constructor(value, asset) {
        this.value = value;
        this.asset = asset;
    }
    toL1Amount() {
        const convertedValue = this.asset.convertInternalQuantityToL1Quantity(this.value);
        return new L1Amount(convertedValue, this.asset);
    }
    toStarkAmount(roundingMode = exports.ROUNDING_BUY_CONTEXT) {
        if (!this.asset) {
            throw new Error(`HumanReadableAmount.asset is undefined. value=${String(this.value)}`);
        }
        const convertedValue = this.asset.convertHumanReadableToStarkQuantity(this.value, decimal_js_1.default // Type workaround
        );
        if (convertedValue === undefined) {
            throw new Error('Asset conversion failed: asset or conversion method undefined');
        }
        return new StarkAmount(convertedValue, this.asset);
    }
}
exports.HumanReadableAmount = HumanReadableAmount;
/**
 * L1 amount
 */
class L1Amount {
    value;
    asset;
    constructor(value, asset) {
        this.value = value;
        this.asset = asset;
    }
    toInternalAmount() {
        const convertedValue = this.asset.convertL1QuantityToInternalQuantity(this.value);
        return new HumanReadableAmount(convertedValue, this.asset);
    }
}
exports.L1Amount = L1Amount;
/**
 * Stark amount
 */
class StarkAmount {
    value;
    asset;
    constructor(value, asset) {
        this.value = value;
        this.asset = asset;
    }
    toInternalAmount() {
        const convertedValue = this.asset.convertStarkToInternalQuantity(this.value);
        return new HumanReadableAmount(convertedValue, this.asset);
    }
    negate() {
        return new StarkAmount(-this.value, this.asset);
    }
}
exports.StarkAmount = StarkAmount;
//# sourceMappingURL=amounts.js.map