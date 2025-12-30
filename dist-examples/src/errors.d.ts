/**
 * Base error class for all X10 SDK errors
 */
export declare class X10Error extends Error {
    constructor(message: string);
}
/**
 * Error thrown when rate limit is exceeded
 */
export declare class RateLimitException extends X10Error {
    constructor(message: string);
}
/**
 * Error thrown when authentication fails
 */
export declare class NotAuthorizedException extends X10Error {
    constructor(message: string);
}
/**
 * Error thrown when a sub-account already exists
 */
export declare class SubAccountExists extends X10Error {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map