"use strict";
/**
 * HTTP client utilities for X10 API
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedStreamResponse = exports.WrappedApiResponse = exports.Pagination = exports.ResponseError = exports.StreamDataType = exports.ResponseStatus = exports.RequestHeader = void 0;
exports.getUrl = getUrl;
exports.sendGetRequest = sendGetRequest;
exports.sendPostRequest = sendPostRequest;
exports.sendPatchRequest = sendPatchRequest;
exports.sendDeleteRequest = sendDeleteRequest;
const config_1 = require("../config");
const errors_1 = require("../errors");
const model_1 = require("./model");
/**
 * HTTP Request headers
 */
var RequestHeader;
(function (RequestHeader) {
    RequestHeader["ACCEPT"] = "Accept";
    RequestHeader["API_KEY"] = "X-Api-Key";
    RequestHeader["CONTENT_TYPE"] = "Content-Type";
    RequestHeader["USER_AGENT"] = "User-Agent";
})(RequestHeader || (exports.RequestHeader = RequestHeader = {}));
/**
 * Response status
 */
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["OK"] = "OK";
    ResponseStatus["ERROR"] = "ERROR";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
/**
 * Stream data types
 */
var StreamDataType;
(function (StreamDataType) {
    StreamDataType["UNKNOWN"] = "UNKNOWN";
    StreamDataType["BALANCE"] = "BALANCE";
    StreamDataType["DELTA"] = "DELTA";
    StreamDataType["DEPOSIT"] = "DEPOSIT";
    StreamDataType["ORDER"] = "ORDER";
    StreamDataType["POSITION"] = "POSITION";
    StreamDataType["SNAPSHOT"] = "SNAPSHOT";
    StreamDataType["TRADE"] = "TRADE";
    StreamDataType["TRANSFER"] = "TRANSFER";
    StreamDataType["WITHDRAWAL"] = "WITHDRAWAL";
})(StreamDataType || (exports.StreamDataType = StreamDataType = {}));
/**
 * Response error model
 */
class ResponseError extends model_1.X10BaseModel {
    code;
    message;
    debugInfo;
    constructor(code, message, debugInfo) {
        super();
        this.code = code;
        this.message = message;
        this.debugInfo = debugInfo;
    }
}
exports.ResponseError = ResponseError;
/**
 * Pagination model
 */
class Pagination extends model_1.X10BaseModel {
    cursor;
    count;
    constructor(cursor, count) {
        super();
        this.cursor = cursor;
        this.count = count;
    }
}
exports.Pagination = Pagination;
/**
 * Wrapped API response
 */
class WrappedApiResponse extends model_1.X10BaseModel {
    status;
    data;
    error;
    pagination;
    constructor(status, data, error, pagination) {
        super();
        this.status = status;
        this.data = data;
        this.error = error;
        this.pagination = pagination;
    }
}
exports.WrappedApiResponse = WrappedApiResponse;
/**
 * Wrapped stream response
 */
class WrappedStreamResponse extends model_1.X10BaseModel {
    type;
    data;
    error;
    ts;
    seq;
    constructor(type, data, error, ts, seq) {
        super();
        this.type = type;
        this.data = data;
        this.error = error;
        this.ts = ts;
        this.seq = seq;
    }
}
exports.WrappedStreamResponse = WrappedStreamResponse;
/**
 * Build URL with path parameters and query string
 */
function getUrl(template, options = {}) {
    let url = template;
    const { query, pathParams } = options;
    // Replace path parameters
    if (pathParams) {
        for (const [key, value] of Object.entries(pathParams)) {
            const regex = new RegExp(`<\\??${key}>`, 'g');
            url = url.replace(regex, String(value));
        }
    }
    // Remove trailing slash
    url = url.replace(/\/+$/, '');
    // Add query string
    if (query) {
        const queryParts = [];
        for (const [key, value] of Object.entries(query)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    if (item !== null && item !== undefined) {
                        queryParts.push(`${key}=${encodeURIComponent(item)}`);
                    }
                }
            }
            else if (value !== null && value !== undefined) {
                queryParts.push(`${key}=${encodeURIComponent(value)}`);
            }
        }
        if (queryParts.length > 0) {
            url += '?' + queryParts.join('&');
        }
    }
    return url;
}
/**
 * Get HTTP headers for requests
 */
function getHeaders(apiKey, requestHeaders) {
    const headers = {
        [RequestHeader.ACCEPT]: 'application/json',
        [RequestHeader.CONTENT_TYPE]: 'application/json',
        [RequestHeader.USER_AGENT]: config_1.USER_AGENT,
    };
    if (apiKey) {
        headers[RequestHeader.API_KEY] = apiKey;
    }
    if (requestHeaders) {
        Object.assign(headers, requestHeaders);
    }
    return headers;
}
/**
 * Handle HTTP errors
 */
function handleKnownErrors(url, responseCodeToException, status, responseText) {
    if (status === 401) {
        throw new errors_1.NotAuthorizedException(`Unauthorized response from ${url}: ${responseText}`);
    }
    if (status === 429) {
        throw new errors_1.RateLimitException(`Rate limited response from ${url}: ${responseText}`);
    }
    if (responseCodeToException && status in responseCodeToException) {
        const ExceptionClass = responseCodeToException.get(status);
        if (ExceptionClass) {
            throw new ExceptionClass(responseText);
        }
    }
    if (status > 299) {
        throw new Error(`Error response from ${url}: code ${status} - ${responseText}`);
    }
}
/**
 * Send GET request
 */
async function sendGetRequest(url, apiKey, requestHeaders, responseCodeToException) {
    const headers = getHeaders(apiKey, requestHeaders);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const responseText = await response.text();
        handleKnownErrors(url, responseCodeToException, response.status, responseText);
        const data = JSON.parse(responseText);
        return data;
    }
    catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
/**
 * Send POST request
 */
async function sendPostRequest(url, json, apiKey, requestHeaders, responseCodeToException) {
    const headers = getHeaders(apiKey, requestHeaders);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: json ? JSON.stringify(json) : undefined,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const responseText = await response.text();
        handleKnownErrors(url, responseCodeToException, response.status, responseText);
        const data = JSON.parse(responseText);
        if (data.status !== ResponseStatus.OK || data.error) {
            throw new Error(`Error response from POST ${url}: ${JSON.stringify(data.error)}`);
        }
        return data;
    }
    catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
/**
 * Send PATCH request
 */
async function sendPatchRequest(url, json, apiKey, requestHeaders, responseCodeToException) {
    const headers = getHeaders(apiKey, requestHeaders);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers,
            body: json ? JSON.stringify(json) : undefined,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        let responseText = await response.text();
        if (responseText === '') {
            responseText = '{"status": "OK"}';
        }
        handleKnownErrors(url, responseCodeToException, response.status, responseText);
        const data = JSON.parse(responseText);
        return data;
    }
    catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
/**
 * Send DELETE request
 */
async function sendDeleteRequest(url, apiKey, requestHeaders, responseCodeToException) {
    const headers = getHeaders(apiKey, requestHeaders);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config_1.DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const responseText = await response.text();
        handleKnownErrors(url, responseCodeToException, response.status, responseText);
        const data = JSON.parse(responseText);
        return data;
    }
    catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
//# sourceMappingURL=http.js.map