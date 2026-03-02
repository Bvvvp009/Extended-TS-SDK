/**
 * HTTP client utilities for X10 API
 */

import { USER_AGENT, DEFAULT_REQUEST_TIMEOUT_SECONDS } from '../config.js';
import { RateLimitException, NotAuthorizedException } from '../errors.js';
import { X10BaseModel } from './model.js';

export type ApiResponseType<T> = T | T[] | number;

/**
 * HTTP Request headers
 */
export enum RequestHeader {
  ACCEPT = 'Accept',
  API_KEY = 'X-Api-Key',
  CONTENT_TYPE = 'Content-Type',
  USER_AGENT = 'User-Agent',
}

/**
 * Response status
 */
export enum ResponseStatus {
  OK = 'OK',
  ERROR = 'ERROR',
}

/**
 * Stream data types
 */
export enum StreamDataType {
  UNKNOWN = 'UNKNOWN',
  BALANCE = 'BALANCE',
  DELTA = 'DELTA',
  DEPOSIT = 'DEPOSIT',
  ORDER = 'ORDER',
  POSITION = 'POSITION',
  SNAPSHOT = 'SNAPSHOT',
  TRADE = 'TRADE',
  TRANSFER = 'TRANSFER',
  WITHDRAWAL = 'WITHDRAWAL',
}

/**
 * Response error model
 */
export class ResponseError extends X10BaseModel {
  code: number;
  message: string;
  debugInfo?: string;

  constructor(code: number, message: string, debugInfo?: string) {
    super();
    this.code = code;
    this.message = message;
    this.debugInfo = debugInfo;
  }
}

/**
 * Pagination model
 */
export class Pagination extends X10BaseModel {
  cursor?: number;
  count: number;

  constructor(cursor: number | undefined, count: number) {
    super();
    this.cursor = cursor;
    this.count = count;
  }
}

/**
 * Wrapped API response
 */
export class WrappedApiResponse<T> extends X10BaseModel {
  status: ResponseStatus;
  data?: T;
  error?: ResponseError;
  pagination?: Pagination;

  constructor(status: ResponseStatus, data?: T, error?: ResponseError, pagination?: Pagination) {
    super();
    this.status = status;
    this.data = data;
    this.error = error;
    this.pagination = pagination;
  }
}

/**
 * Wrapped stream response
 */
export class WrappedStreamResponse<T> extends X10BaseModel {
  type?: StreamDataType;
  data?: T;
  error?: string;
  ts: number;
  seq: number;

  constructor(type: StreamDataType | undefined, data: T | undefined, error: string | undefined, ts: number, seq: number) {
    super();
    this.type = type;
    this.data = data;
    this.error = error;
    this.ts = ts;
    this.seq = seq;
  }
}

/**
 * Build URL with path parameters and query string
 */
export function getUrl(
  template: string,
  options: {
    query?: Record<string, string | string[]>;
    pathParams?: Record<string, string | number>;
  } = {}
): string {
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
    const queryParts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== null && item !== undefined) {
            queryParts.push(`${key}=${encodeURIComponent(item)}`);
          }
        }
      } else if (value !== null && value !== undefined) {
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
function getHeaders(apiKey?: string, requestHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    [RequestHeader.ACCEPT]: 'application/json',
    [RequestHeader.CONTENT_TYPE]: 'application/json',
    [RequestHeader.USER_AGENT]: USER_AGENT,
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
function handleKnownErrors(
  url: string,
  responseCodeToException: Map<number, typeof Error> | undefined,
  status: number,
  responseText: string
): void {
  if (status === 401) {
    throw new NotAuthorizedException(`Unauthorized response from ${url}: ${responseText}`);
  }

  if (status === 429) {
    throw new RateLimitException(`Rate limited response from ${url}: ${responseText}`);
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
export async function sendGetRequest<T>(
  url: string,
  apiKey?: string,
  requestHeaders?: Record<string, string>,
  responseCodeToException?: Map<number, typeof Error>
): Promise<WrappedApiResponse<T>> {
  const headers = getHeaders(apiKey, requestHeaders);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);

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
    return data as WrappedApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Send POST request
 */
export async function sendPostRequest<T>(
  url: string,
  json?: any,
  apiKey?: string,
  requestHeaders?: Record<string, string>,
  responseCodeToException?: Map<number, typeof Error>
): Promise<WrappedApiResponse<T>> {
  const headers = getHeaders(apiKey, requestHeaders);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);

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
    
    return data as WrappedApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Send PATCH request
 */
export async function sendPatchRequest<T>(
  url: string,
  json?: any,
  apiKey?: string,
  requestHeaders?: Record<string, string>,
  responseCodeToException?: Map<number, typeof Error>
): Promise<WrappedApiResponse<T>> {
  const headers = getHeaders(apiKey, requestHeaders);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);

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
    return data as WrappedApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Send DELETE request
 */
export async function sendDeleteRequest<T>(
  url: string,
  apiKey?: string,
  requestHeaders?: Record<string, string>,
  responseCodeToException?: Map<number, typeof Error>
): Promise<WrappedApiResponse<T>> {
  const headers = getHeaders(apiKey, requestHeaders);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_REQUEST_TIMEOUT_SECONDS * 1000);

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
    return data as WrappedApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}










