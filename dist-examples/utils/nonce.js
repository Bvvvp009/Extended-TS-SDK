"use strict";
/**
 * Nonce generation utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNonce = generateNonce;
/**
 * Generates a nonce for use in StarkEx transactions
 * Returns a random integer between 0 and 2^32 - 1
 */
function generateNonce() {
    return Math.floor(Math.random() * (2 ** 32));
}
//# sourceMappingURL=nonce.js.map