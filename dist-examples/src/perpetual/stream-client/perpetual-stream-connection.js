"use strict";
/**
 * Perpetual stream connection for WebSocket streaming
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerpetualStreamConnection = void 0;
const ws_1 = __importDefault(require("ws"));
const config_1 = require("../../config");
const http_1 = require("../../utils/http");
/**
 * Perpetual stream connection
 */
class PerpetualStreamConnection {
    streamUrl;
    apiKey;
    msgsCount = 0;
    websocket;
    constructor(streamUrl, apiKey) {
        this.streamUrl = streamUrl;
        this.apiKey = apiKey;
    }
    /**
     * Send data through WebSocket
     */
    async send(data) {
        if (!this.websocket || this.websocket.readyState !== ws_1.default.OPEN) {
            throw new Error('WebSocket is not connected');
        }
        this.websocket.send(data);
    }
    /**
     * Receive message from WebSocket
     */
    async recv() {
        if (!this.websocket) {
            throw new Error('WebSocket is not connected');
        }
        return await this.receive();
    }
    /**
     * Close WebSocket connection
     */
    async close() {
        if (this.websocket && this.websocket.readyState === ws_1.default.OPEN) {
            this.websocket.close();
        }
    }
    /**
     * Get messages count
     */
    getMsgsCount() {
        return this.msgsCount;
    }
    /**
     * Check if connection is closed
     */
    isClosed() {
        if (!this.websocket) {
            return true;
        }
        return this.websocket.readyState === ws_1.default.CLOSED;
    }
    /**
     * Connect to WebSocket
     */
    async connect() {
        const extraHeaders = {
            [http_1.RequestHeader.USER_AGENT]: config_1.USER_AGENT,
        };
        if (this.apiKey) {
            extraHeaders[http_1.RequestHeader.API_KEY] = this.apiKey;
        }
        return new Promise((resolve, reject) => {
            this.websocket = new ws_1.default(this.streamUrl, {
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
    async receive() {
        if (!this.websocket) {
            throw new Error('WebSocket is not connected');
        }
        return new Promise((resolve, reject) => {
            const messageHandler = (data) => {
                this.msgsCount++;
                try {
                    const parsed = JSON.parse(data.toString());
                    resolve(parsed);
                }
                catch (error) {
                    reject(error);
                }
            };
            this.websocket.once('message', messageHandler);
            this.websocket.on('error', reject);
        });
    }
    /**
     * Async iterator for messages
     */
    async *[Symbol.asyncIterator]() {
        while (!this.isClosed()) {
            try {
                yield await this.receive();
            }
            catch (error) {
                break;
            }
        }
    }
}
exports.PerpetualStreamConnection = PerpetualStreamConnection;
//# sourceMappingURL=perpetual-stream-connection.js.map