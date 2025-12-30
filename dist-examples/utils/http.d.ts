/**
 * HTTP client utilities for X10 API
 */
import { X10BaseModel } from './model';
export type ApiResponseType<T> = T | T[] | number;
/**
 * HTTP Request headers
 */
export declare enum RequestHeader {
    ACCEPT = "Accept",
    API_KEY = "X-Api-Key",
    CONTENT_TYPE = "Content-Type",
    USER_AGENT = "User-Agent"
}
/**
 * Response status
 */
export declare enum ResponseStatus {
    OK = "OK",
    ERROR = "ERROR"
}
/**
 * Stream data types
 */
export declare enum StreamDataType {
    UNKNOWN = "UNKNOWN",
    BALANCE = "BALANCE",
    DELTA = "DELTA",
    DEPOSIT = "DEPOSIT",
    ORDER = "ORDER",
    POSITION = "POSITION",
    SNAPSHOT = "SNAPSHOT",
    TRADE = "TRADE",
    TRANSFER = "TRANSFER",
    WITHDRAWAL = "WITHDRAWAL"
}
/**
 * Response error model
 */
export declare class ResponseError extends X10BaseModel {
    code: number;
    message: string;
    debugInfo?: string;
    constructor(code: number, message: string, debugInfo?: string);
}
/**
 * Pagination model
 */
export declare class Pagination extends X10BaseModel {
    cursor?: number;
    count: number;
    constructor(cursor: number | undefined, count: number);
}
/**
 * Wrapped API response
 */
export declare class WrappedApiResponse<T> extends X10BaseModel {
    status: ResponseStatus;
    data?: T;
    error?: ResponseError;
    pagination?: Pagination;
    constructor(status: ResponseStatus, data?: T, error?: ResponseError, pagination?: Pagination);
}
/**
 * Wrapped stream response
 */
export declare class WrappedStreamResponse<T> extends X10BaseModel {
    type?: StreamDataType;
    data?: T;
    error?: string;
    ts: number;
    seq: number;
    constructor(type: StreamDataType | undefined, data: T | undefined, error: string | undefined, ts: number, seq: number);
}
/**
 * Build URL with path parameters and query string
 */
export declare function getUrl(template: string, options?: {
    query?: Record<string, string | string[]>;
    pathParams?: Record<string, string | number>;
}): string;
/**
 * Send GET request
 */
export declare function sendGetRequest<T>(url: string, apiKey?: string, requestHeaders?: Record<string, string>, responseCodeToException?: Map<number, typeof Error>): Promise<WrappedApiResponse<T>>;
/**
 * Send POST request
 */
export declare function sendPostRequest<T>(url: string, json?: any, apiKey?: string, requestHeaders?: Record<string, string>, responseCodeToException?: Map<number, typeof Error>): Promise<WrappedApiResponse<T>>;
/**
 * Send PATCH request
 */
export declare function sendPatchRequest<T>(url: string, json?: any, apiKey?: string, requestHeaders?: Record<string, string>, responseCodeToException?: Map<number, typeof Error>): Promise<WrappedApiResponse<T>>;
/**
 * Send DELETE request
 */
export declare function sendDeleteRequest<T>(url: string, apiKey?: string, requestHeaders?: Record<string, string>, responseCodeToException?: Map<number, typeof Error>): Promise<WrappedApiResponse<T>>;
//# sourceMappingURL=http.d.ts.map