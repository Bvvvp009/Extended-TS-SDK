/**
 * Cross-platform WebSocket implementation
 * Uses native WebSocket in browsers, 'ws' package in Node.js
 */

let WebSocketImpl: any;
let isNodeWs = false;

if (typeof WebSocket !== 'undefined') {
  // Browser environment - use native WebSocket
  WebSocketImpl = WebSocket;
} else {
  // Node.js environment - use 'ws' package
  try {
    const ws = require('ws');
    WebSocketImpl = ws;
    isNodeWs = true;
  } catch (e) {
    throw new Error(
      'WebSocket not available. In Node.js, install "ws" package: npm install ws'
    );
  }
}

/**
 * Wrapper class to provide consistent API across environments
 */
class UnifiedWebSocket {
  private ws: any;
  private eventListeners: Map<string, Set<Function>> = new Map();

  // Static constants
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string, options?: any) {
    if (isNodeWs) {
      // Node.js 'ws' WebSocket
      this.ws = new WebSocketImpl(url, options);
      
      // Forward events
      this.ws.on('open', () => this.emit('open'));
      this.ws.on('error', (error: any) => this.emit('error', error));
      this.ws.on('close', (code: number, reason: string) => this.emit('close', { code, reason }));
      this.ws.on('message', (data: any) => this.emit('message', data));
    } else {
      // Browser WebSocket
      this.ws = new WebSocketImpl(url);
      
      this.ws.onopen = () => this.emit('open');
      this.ws.onerror = (error: any) => this.emit('error', error);
      this.ws.onclose = (event: any) => this.emit('close', event);
      this.ws.onmessage = (event: any) => this.emit('message', event.data);
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  on(event: string, listener: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  once(event: string, listener: Function) {
    const onceWrapper = (data: any) => {
      listener(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  off(event: string, listener: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  send(data: string | ArrayBuffer | Buffer) {
    this.ws.send(data);
  }

  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  get readyState() {
    return this.ws.readyState;
  }

  get CONNECTING() { return UnifiedWebSocket.CONNECTING; }
  get OPEN() { return UnifiedWebSocket.OPEN; }
  get CLOSING() { return UnifiedWebSocket.CLOSING; }
  get CLOSED() { return UnifiedWebSocket.CLOSED; }
}

// Export namespace for Data type compatibility
export namespace WebSocket {
  export type Data = string | Buffer | ArrayBuffer;
}

export default UnifiedWebSocket;
export { UnifiedWebSocket as WebSocket };
