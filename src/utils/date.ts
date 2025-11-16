/**
 * Date and time utility functions
 */

/**
 * Get current UTC datetime
 */
export function utcNow(): Date {
  return new Date();
}

/**
 * Convert Date to epoch milliseconds
 * Uses Math.ceil to ensure consistent rounding behavior
 */
export function toEpochMillis(value: Date): number {
  return Math.ceil(value.getTime());
}







