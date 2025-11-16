/**
 * String utility functions
 */

/**
 * Check if a string is a valid hex string
 * @param s String to check
 * @param checkPrefix Whether to check for '0x' prefix
 */
export function isHexString(s: string, checkPrefix: boolean = true): boolean {
  if (checkPrefix && !s.startsWith('0x')) {
    return false;
  }

  const stringToCheck = checkPrefix ? s.slice(2) : s;
  const hexRegex = /^[0-9a-fA-F]+$/;
  
  return stringToCheck.length > 0 && hexRegex.test(stringToCheck);
}







