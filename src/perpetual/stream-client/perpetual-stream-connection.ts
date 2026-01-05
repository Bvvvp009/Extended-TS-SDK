/**
 * Perpetual stream connection for WebSocket streaming
 */

import WebSocket, { WebSocket as WebSocketNamespace } from '../../utils/websocket.js';
import { USER_AGENT } from '../../config.js';
import { RequestHeader } from '../../utils/http.js';
import { WrappedStreamResponse } from '../../utils/http.js';

/**
 * Perpetual stream connection
 */
export class PerpetualStreamConnection<T> {
  private streamUrl: string;
  private apiKey?: string;
  private msgsCount: number = 0;
  private websocket?: WebSocket;

  constructor(streamUrl: string, apiKey?: string) {
    this.streamUrl = streamUrl;
    this.apiKey = apiKey;
  }

  /**
   * Send data through WebSocket
   */
  async send(data: string | Buffer): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.websocket.send(data);
  }

  /**
   * Receive message from WebSocket
   */
  async recv(): Promise<WrappedStreamResponse<T>> {
    if (!this.websocket) {
      throw new Error('WebSocket is not connected');
    }
    return await this.receive();
  }

  /**
   * Close WebSocket connection
   */
  async close(): Promise<void> {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.close();
    }
  }

  /**
   * Get messages count
   */
  getMsgsCount(): number {
    return this.msgsCount;
  }

  /**
   * Check if connection is closed
   */
  isClosed(): boolean {
    if (!this.websocket) {
      return true;
    }
    return this.websocket.readyState === WebSocket.CLOSED;
  }

  /**
   * Connect to WebSocket
   */
  async connect(): Promise<this> {
    const extraHeaders: Record<string, string> = {
      [RequestHeader.USER_AGENT]: USER_AGENT,
    };

    if (this.apiKey) {
      extraHeaders[RequestHeader.API_KEY] = this.apiKey;
    }

    return new Promise((resolve, reject) => {
      this.websocket = new WebSocket(this.streamUrl, {
        headers: extraHeaders,
      });

      this.websocket.on('open', () => {
        resolve(this);
      });

      this.websocket.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Receive message
   */
  private async receive(): Promise<WrappedStreamResponse<T>> {
    if (!this.websocket) {
      throw new Error('WebSocket is not connected');
    }

    return new Promise((resolve, reject) => {
      const messageHandler = (data: WebSocketNamespace.Data) => {
        this.msgsCount++;
        try {
          const parsed = JSON.parse(data.toString());
          resolve(parsed as WrappedStreamResponse<T>);
        } catch (error) {
          reject(error);
        }
      };

      this.websocket!.once('message', messageHandler);
      this.websocket!.on('error', reject);
    });
  }

  /**
   * Async iterator for messages
   */
  async* [Symbol.asyncIterator](): AsyncIterator<WrappedStreamResponse<T>> {
    while (!this.isClosed()) {
      try {
        yield await this.receive();
      } catch (error) {
        break;
      }
    }
  }
}










