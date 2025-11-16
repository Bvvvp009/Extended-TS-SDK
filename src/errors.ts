/**
 * Base error class for all X10 SDK errors
 */
export class X10Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'X10Error';
    Object.setPrototypeOf(this, X10Error.prototype);
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitException extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitException';
  }
}

/**
 * Error thrown when authentication fails
 */
export class NotAuthorizedException extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotAuthorizedException';
  }
}

/**
 * Error thrown when a sub-account already exists
 */
export class SubAccountExists extends X10Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubAccountExists';
  }
}







