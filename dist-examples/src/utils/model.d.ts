/**
 * Base model utilities and types
 */
/**
 * Hex value type - represented as string in JSON, BigInt in memory
 */
export type HexValue = string | bigint;
/**
 * Base model class for all X10 API models
 * Handles camelCase/snake_case conversion
 */
export declare class X10BaseModel {
    /**
     * Convert model to pretty JSON string
     */
    toPrettyJson(): string;
    /**
     * Convert model to API request JSON (camelCase)
     */
    toApiRequestJson(excludeNone?: boolean): Record<string, any>;
}
/**
 * Settlement signature model
 */
export declare class SettlementSignatureModel extends X10BaseModel {
    r: HexValue;
    s: HexValue;
    constructor(r: HexValue, s: HexValue);
}
/**
 * Empty model (for void responses)
 */
export declare class EmptyModel extends X10BaseModel {
}
//# sourceMappingURL=model.d.ts.map