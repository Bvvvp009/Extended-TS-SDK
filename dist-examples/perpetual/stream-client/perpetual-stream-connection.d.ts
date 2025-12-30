/**
 * Perpetual stream connection for WebSocket streaming
 */
import { WrappedStreamResponse } from '../../utils/http';
/**
 * Perpetual stream connection
 */
export declare class PerpetualStreamConnection<T> {
    private streamUrl;
    private apiKey?;
    private msgsCount;
    private websocket?;
    constructor(streamUrl: string, apiKey?: string);
    /**
     * Send data through WebSocket
     */
    send(data: string | Buffer): Promise<void>;
    /**
     * Receive message from WebSocket
     */
    recv(): Promise<WrappedStreamResponse<T>>;
    /**
     * Close WebSocket connection
     */
    close(): Promise<void>;
    /**
     * Get messages count
     */
    getMsgsCount(): number;
    /**
     * Check if connection is closed
     */
    isClosed(): boolean;
    /**
     * Connect to WebSocket
     */
    connect(): Promise<this>;
    /**
     * Receive message
     */
    private receive;
    /**
     * Async iterator for messages
     */
    [Symbol.asyncIterator](): AsyncIterator<WrappedStreamResponse<T>>;
}
//# sourceMappingURL=perpetual-stream-connection.d.ts.map