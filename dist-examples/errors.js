"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAccountExists = exports.NotAuthorizedException = exports.RateLimitException = exports.X10Error = void 0;
/**
 * Base error class for all X10 SDK errors
 */
class X10Error extends Error {
    constructor(message) {
        super(message);
        this.name = 'X10Error';
        Object.setPrototypeOf(this, X10Error.prototype);
    }
}
exports.X10Error = X10Error;
/**
 * Error thrown when rate limit is exceeded
 */
class RateLimitException extends X10Error {
    constructor(message) {
        super(message);
        this.name = 'RateLimitException';
    }
}
exports.RateLimitException = RateLimitException;
/**
 * Error thrown when authentication fails
 */
class NotAuthorizedException extends X10Error {
    constructor(message) {
        super(message);
        this.name = 'NotAuthorizedException';
    }
}
exports.NotAuthorizedException = NotAuthorizedException;
/**
 * Error thrown when a sub-account already exists
 */
class SubAccountExists extends X10Error {
    constructor(message) {
        super(message);
        this.name = 'SubAccountExists';
    }
}
exports.SubAccountExists = SubAccountExists;
//# sourceMappingURL=errors.js.map