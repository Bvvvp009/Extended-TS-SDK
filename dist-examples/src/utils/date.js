"use strict";
/**
 * Date and time utility functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcNow = utcNow;
exports.toEpochMillis = toEpochMillis;
/**
 * Get current UTC datetime
 */
function utcNow() {
    return new Date();
}
/**
 * Convert Date to epoch milliseconds
 * Uses Math.ceil to ensure consistent rounding behavior
 */
function toEpochMillis(value) {
    return Math.ceil(value.getTime());
}
//# sourceMappingURL=date.js.map