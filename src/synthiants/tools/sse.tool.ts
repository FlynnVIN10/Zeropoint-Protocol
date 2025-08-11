/**
 * SSE Tool - Server-Sent Events for Synthiant agents
 *
 * @fileoverview Provides real-time data streaming capabilities for Synthiant agents
 * @author Dev Team
 * @version 1.0.0
 */

import { ToolInterface, ResourceUsage } from "./index";

export interface SSEConfig {
  maxConnections: number;
  heartbeatInterval: number;
  maxEventSize: number;
  enableCompression: boolean;
  rateLimitPerMinute: number;
}

export interface SSEEvent {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
  comment?: string;
}

export interface SSEConnection {
  id: string;
  agentId: string;
  connectedAt: number;
  lastHeartbeat: number;
  eventCount: number;
  isActive: boolean;
}

export interface SSEMessage {
  type: "connect" | "disconnect" | "event" | "heartbeat";
  data: any;
  timestamp: number;
}

/**
 * SSE Tool Implementation
 * Provides real-time event streaming capabilities
 */
export class SSETool implements ToolInterface {
  public readonly name = "sse";
  public readonly version = "1.0.0";
  public readonly description =
    "Server-Sent Events tool for real-time data streaming";
  public readonly capabilities = [
    "streaming",
    "events",
    "realtime",
    "broadcast",
  ];

  private config: SSEConfig;
  private connections: Map<string, SSEConnection> = new Map();
  private eventQueue: Map<string, SSEEvent[]> = new Map();
  private messageCount: number = 0;
  private lastReset: number = Date.now();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<SSEConfig>) {
    this.config = {
      maxConnections: 100,
      heartbeatInterval: 30000, // 30 seconds
      maxEventSize: 1024 * 1024, // 1MB
      enableCompression: true,
      rateLimitPerMinute: 1000,
      ...config,
    };

    this.startHeartbeat();
  }

  /**
   * Execute SSE operation
   */
  async execute(params: any): Promise<any> {
    try {
      const { action, ...actionParams } = params;

      switch (action) {
        case "connect":
          return this.connect(actionParams.agentId, actionParams.connectionId);
        case "disconnect":
          return this.disconnect(actionParams.connectionId);
        case "send":
          return this.sendEvent(actionParams.connectionId, actionParams.event);
        case "broadcast":
          return this.broadcastEvent(actionParams.event, actionParams.filter);
        case "status":
          return this.getConnectionStatus(actionParams.connectionId);
        default:
          throw new Error(`Unknown SSE action: ${action}`);
      }
    } catch (error) {
      console.error("SSE tool execution failed:", error);
      throw error;
    }
  }

  /**
   * Validate parameters
   */
  validateParams(params: any): boolean {
    if (!params || typeof params !== "object") {
      return false;
    }

    if (!params.action || typeof params.action !== "string") {
      return false;
    }

    const validActions = [
      "connect",
      "disconnect",
      "send",
      "broadcast",
      "status",
    ];
    if (!validActions.includes(params.action)) {
      return false;
    }

    // Validate action-specific parameters
    switch (params.action) {
      case "connect":
        return params.agentId && typeof params.agentId === "string";
      case "disconnect":
      case "status":
        return params.connectionId && typeof params.connectionId === "string";
      case "send":
        return (
          params.connectionId &&
          params.event &&
          typeof params.connectionId === "string" &&
          typeof params.event === "object"
        );
      case "broadcast":
        return params.event && typeof params.event === "object";
      default:
        return false;
    }
  }

  /**
   * Get current resource usage
   */
  getQuotaUsage(): ResourceUsage {
    const activeConnections = Array.from(this.connections.values()).filter(
      (c) => c.isActive,
    );

    return {
      memory: activeConnections.length * 0.5, // 0.5MB per connection
      cpu: activeConnections.length * 0.01, // 0.01 CPU per connection
      time: 0,
      tokens: this.messageCount * 10, // 10 tokens per message
      network: activeConnections.length * 0.1, // 0.1MB per connection
      fileOps: 0,
    };
  }

  /**
   * Connect a new SSE client
   */
  private async connect(
    agentId: string,
    connectionId?: string,
  ): Promise<{ connectionId: string; status: string }> {
    // Check connection limits
    if (this.connections.size >= this.config.maxConnections) {
      throw new Error("Maximum connections exceeded");
    }

    // Check rate limits
    this.checkRateLimit();

    const id =
      connectionId ||
      `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const connection: SSEConnection = {
      id,
      agentId,
      connectedAt: Date.now(),
      lastHeartbeat: Date.now(),
      eventCount: 0,
      isActive: true,
    };

    this.connections.set(id, connection);
    this.eventQueue.set(id, []);

    console.log(`SSE connection established: ${id} for agent ${agentId}`);

    return {
      connectionId: id,
      status: "connected",
    };
  }

  /**
   * Disconnect an SSE client
   */
  private async disconnect(connectionId: string): Promise<{ status: string }> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    connection.isActive = false;
    this.connections.delete(connectionId);
    this.eventQueue.delete(connectionId);

    console.log(`SSE connection closed: ${connectionId}`);

    return { status: "disconnected" };
  }

  /**
   * Send event to specific connection
   */
  private async sendEvent(
    connectionId: string,
    event: SSEEvent,
  ): Promise<{ status: string; messageId: string }> {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isActive) {
      throw new Error("Connection not found or inactive");
    }

    // Validate event size
    if (JSON.stringify(event).length > this.config.maxEventSize) {
      throw new Error("Event size exceeds maximum allowed size");
    }

    // Add event to queue
    const queue = this.eventQueue.get(connectionId) || [];
    queue.push(event);
    this.eventQueue.set(connectionId, queue);

    // Update connection stats
    connection.eventCount++;
    connection.lastHeartbeat = Date.now();

    this.messageCount++;

    return {
      status: "sent",
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  /**
   * Broadcast event to all connections
   */
  private async broadcastEvent(
    event: SSEEvent,
    filter?: (connection: SSEConnection) => boolean,
  ): Promise<{ status: string; sentCount: number }> {
    let sentCount = 0;
    const activeConnections = Array.from(this.connections.values()).filter(
      (c) => c.isActive,
    );

    for (const connection of activeConnections) {
      // Apply filter if provided
      if (filter && !filter(connection)) {
        continue;
      }

      try {
        await this.sendEvent(connection.id, event);
        sentCount++;
      } catch (error) {
        console.error(
          `Failed to send broadcast to connection ${connection.id}:`,
          error,
        );
      }
    }

    return {
      status: "broadcasted",
      sentCount,
    };
  }

  /**
   * Get connection status
   */
  private async getConnectionStatus(
    connectionId: string,
  ): Promise<SSEConnection | null> {
    return this.connections.get(connectionId) || null;
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const minuteAgo = now - 60 * 1000;

    // Reset counter if minute has passed
    if (now - this.lastReset > 60 * 1000) {
      this.messageCount = 0;
      this.lastReset = now;
    }

    // Check if rate limit exceeded
    if (this.messageCount >= this.config.rateLimitPerMinute) {
      throw new Error(
        `Rate limit exceeded: ${this.config.rateLimitPerMinute} messages per minute`,
      );
    }
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.performHeartbeat();
    }, this.config.heartbeatInterval);
  }

  /**
   * Perform heartbeat check
   */
  private performHeartbeat(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatInterval * 2;

    for (const [id, connection] of this.connections.entries()) {
      if (now - connection.lastHeartbeat > timeout) {
        console.log(`SSE connection timeout: ${id}`);
        connection.isActive = false;
        this.connections.delete(id);
        this.eventQueue.delete(id);
      }
    }
  }

  /**
   * Get all active connections
   */
  getActiveConnections(): SSEConnection[] {
    return Array.from(this.connections.values()).filter((c) => c.isActive);
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    totalConnections: number;
    activeConnections: number;
    totalMessages: number;
    averageMessagesPerConnection: number;
  } {
    const activeConnections = this.getActiveConnections();
    const avgMessages =
      activeConnections.length > 0
        ? activeConnections.reduce((sum, c) => sum + c.eventCount, 0) /
          activeConnections.length
        : 0;

    return {
      totalConnections: this.connections.size,
      activeConnections: activeConnections.length,
      totalMessages: this.messageCount,
      averageMessagesPerConnection: avgMessages,
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Close all connections
    for (const [id, connection] of this.connections.entries()) {
      connection.isActive = false;
    }

    this.connections.clear();
    this.eventQueue.clear();
  }
}

// Export default instance
export const sseTool = new SSETool();
