"use strict";
/**
 * Custom signer interface for external signing services
 *
 * This module provides interfaces and types to enable integration with
 * external signing services like Privy, Web3Auth, or custom HSM solutions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCustomStarkSigner = isCustomStarkSigner;
/**
 * Type guard to check if a value is a CustomStarkSigner
 */
function isCustomStarkSigner(value) {
    return (value !== null &&
        typeof value === 'object' &&
        typeof value.sign === 'function');
}
//# sourceMappingURL=custom-signer.js.map