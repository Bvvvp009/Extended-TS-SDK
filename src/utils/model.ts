/**
 * Base model utilities and types
 */

import Decimal from 'decimal.js';

/**
 * Hex value type - represented as string in JSON, BigInt in memory
 */
export type HexValue = string | bigint;

/**
 * Base model class for all X10 API models
 * Handles camelCase/snake_case conversion
 */
export class X10BaseModel {
  /**
   * Convert model to pretty JSON string
   */
  toPrettyJson(): string {
    return JSON.stringify(this, null, 2);
  }

  /**
   * Convert model to API request JSON (camelCase)
   */
  toApiRequestJson(excludeNone: boolean = false): Record<string, any> {
    const obj: Record<string, any> = {};

    for (const [key, value] of Object.entries(this)) {
      const camelKey = toCamel(key);

      if (excludeNone && (value === null || value === undefined)) {
        continue;
      }

      let processed: any = value;

      // Recursively convert nested models
      if (value instanceof X10BaseModel) {
        processed = value.toApiRequestJson(excludeNone);
      }

      // Convert arrays of models
      if (Array.isArray(value)) {
        processed = value.map((item) =>
          item instanceof X10BaseModel ? item.toApiRequestJson(excludeNone) : item
        );
      }

      // Convert BigInt to hex string
      if (typeof processed === 'bigint') {
        processed = `0x${processed.toString(16)}`;
      }

      // Convert Decimal to string
      if (processed instanceof Decimal) {
        processed = processed.toString();
      }

      // Convert snake_case to camelCase
      if (key !== camelKey) {
        obj[camelKey] = processed;
      } else {
        obj[key] = processed;
      }
    }

    return obj;
  }
}

/**
 * Convert snake_case to camelCase
 */
function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Settlement signature model
 */
export class SettlementSignatureModel extends X10BaseModel {
  r: HexValue;
  s: HexValue;

  constructor(r: HexValue, s: HexValue) {
    super();
    this.r = r;
    this.s = s;
  }
}

/**
 * Empty model (for void responses)
 */
export class EmptyModel extends X10BaseModel {}






