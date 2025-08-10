/**
 * Audit System - JSONL logging and webhook integration
 * 
 * @fileoverview Provides comprehensive audit logging for all Synthiant activities
 * @author Dev Team
 * @version 1.0.0
 */

import { createWriteStream, WriteStream } from 'fs';
import { createHmac } from 'crypto';
import { EventEmitter } from 'events';

// Types and interfaces
export interface AuditEvent {
  id: string;
  timestamp: number;
  agentId?: string;
  taskId?: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'quota_exceeded' | 'security_violation';
  details: Record<string, any>;
  metadata: {
    version: string;
    source: string;
    environment: string;
    userAgent?: string;
    ipAddress?: string;
  };
  signature: string;
}

export interface AuditConfig {
  logFilePath: string;
  webhookUrl: string;
  webhookSecret: string;
  retentionDays: number;
  maxFileSize: number;
  enableCompression: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface WebhookPayload {
  events: AuditEvent[];
  batchId: string;
  timestamp: number;
  signature: string;
}

/**
 * Audit System Class
 * Manages comprehensive audit logging and webhook delivery
 */
export class AuditSystem extends EventEmitter {
  private config: AuditConfig;
  private logStream: WriteStream | null = null;
  private eventBuffer: AuditEvent[] = [];
  private bufferSize: number = 100;
  private flushInterval: NodeJS.Timeout | null = null;
  private isShuttingDown: boolean = false;

  constructor(config: AuditConfig) {
    super();
    this.config = config;
    this.initializeLogging();
    this.setupPeriodicFlush();
    this.setupEventHandlers();
  }

  /**
   * Log an audit event
   */
  async logEvent(
    action: string,
    resource: string,
    outcome: AuditEvent['outcome'],
    details: Record<string, any> = {},
    agentId?: string,
    taskId?: string
  ): Promise<string> {
    const event: AuditEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      agentId,
      taskId,
      action,
      resource,
      outcome,
      details,
      metadata: {
        version: '1.0.0',
        source: 'synthiant-runtime',
        environment: process.env.NODE_ENV || 'development',
        userAgent: details.userAgent,
        ipAddress: details.ipAddress
      },
      signature: ''
    };

    // Generate signature
    event.signature = this.signEvent(event);

    // Add to buffer
    this.eventBuffer.push(event);

    // Emit event for real-time processing
    this.emit('audit_event', event);

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flushBuffer();
    }

    return event.id;
  }

  /**
   * Log successful action
   */
  async logSuccess(
    action: string,
    resource: string,
    details: Record<string, any> = {},
    agentId?: string,
    taskId?: string
  ): Promise<string> {
    return this.logEvent(action, resource, 'success', details, agentId, taskId);
  }

  /**
   * Log failed action
   */
  async logFailure(
    action: string,
    resource: string,
    error: string,
    details: Record<string, any> = {},
    agentId?: string,
    taskId?: string
  ): Promise<string> {
    return this.logEvent(action, resource, 'failure', {
      ...details,
      error,
      stack: new Error().stack
    }, agentId, taskId);
  }

  /**
   * Log quota breach
   */
  async logQuotaBreach(
    action: string,
    resource: string,
    quotaType: string,
    current: number,
    limit: number,
    agentId?: string,
    taskId?: string
  ): Promise<string> {
    return this.logEvent(action, resource, 'quota_exceeded', {
      quotaType,
      current,
      limit,
      breach: current - limit
    }, agentId, taskId);
  }

  /**
   * Log security violation
   */
  async logSecurityViolation(
    action: string,
    resource: string,
    violationType: string,
    details: Record<string, any> = {},
    agentId?: string,
    taskId?: string
  ): Promise<string> {
    return this.logEvent(action, resource, 'security_violation', {
      violationType,
      ...details
    }, agentId, taskId);
  }

  /**
   * Flush event buffer to log file and webhook
   */
  async flushBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      // Write to log file
      await this.writeToLogFile(events);

      // Send to webhook
      await this.sendToWebhook(events);

      this.emit('buffer_flushed', { count: events.length, timestamp: Date.now() });

    } catch (error) {
      console.error('Failed to flush audit buffer:', error);
      this.emit('flush_error', { error: error.message, events });
      
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Get audit events by criteria
   */
  async queryEvents(criteria: {
    startTime?: number;
    endTime?: number;
    agentId?: string;
    action?: string;
    resource?: string;
    outcome?: string;
    limit?: number;
  }): Promise<AuditEvent[]> {
    // In a real implementation, this would query the log file or database
    // For now, return empty array
    return [];
  }

  /**
   * Export audit log for specified time range
   */
  async exportAuditLog(startTime: number, endTime: number): Promise<AuditEvent[]> {
    // In a real implementation, this would read from the log file
    // For now, return empty array
    return [];
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(): Promise<number> {
    const cutoffTime = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
    
    // In a real implementation, this would remove old log files
    // For now, return 0
    return 0;
  }

  /**
   * Shutdown audit system
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    // Stop periodic flush
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush remaining buffer
    await this.flushBuffer();
    
    // Close log stream
    if (this.logStream) {
      this.logStream.end();
    }
    
    this.emit('shutdown_complete');
  }

  /**
   * Initialize logging system
   */
  private initializeLogging(): void {
    try {
      this.logStream = createWriteStream(this.config.logFilePath, {
        flags: 'a',
        encoding: 'utf8'
      });

      this.logStream.on('error', (error) => {
        console.error('Audit log stream error:', error);
        this.emit('log_error', error);
      });

      console.log(`Audit logging initialized: ${this.config.logFilePath}`);
    } catch (error) {
      console.error('Failed to initialize audit logging:', error);
      throw error;
    }
  }

  /**
   * Setup periodic buffer flush
   */
  private setupPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      if (!this.isShuttingDown) {
        this.flushBuffer().catch(error => {
          console.error('Periodic flush failed:', error);
        });
      }
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('audit_event', (event) => {
      if (this.config.logLevel === 'debug') {
        console.debug(`[Audit] ${event.action} on ${event.resource}: ${event.outcome}`);
      }
    });

    this.on('buffer_flushed', (data) => {
      if (this.config.logLevel === 'info') {
        console.info(`[Audit] Buffer flushed: ${data.count} events`);
      }
    });

    this.on('flush_error', (data) => {
      console.error(`[Audit] Flush error: ${data.error}`);
    });
  }

  /**
   * Write events to log file
   */
  private async writeToLogFile(events: AuditEvent[]): Promise<void> {
    if (!this.logStream) {
      throw new Error('Log stream not initialized');
    }

    for (const event of events) {
      const logLine = JSON.stringify(event) + '\n';
      this.logStream.write(logLine);
    }

    // Ensure data is written
    await new Promise<void>((resolve, reject) => {
      this.logStream!.write('', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  /**
   * Send events to webhook
   */
  private async sendToWebhook(events: AuditEvent[]): Promise<void> {
    if (!this.config.webhookUrl) {
      return; // Webhook not configured
    }

    const payload: WebhookPayload = {
      events,
      batchId: this.generateBatchId(),
      timestamp: Date.now(),
      signature: ''
    };

    // Generate webhook signature
    payload.signature = this.signWebhookPayload(payload);

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Synthiant-Audit/1.0.0'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }

      this.emit('webhook_sent', { 
        batchId: payload.batchId, 
        eventCount: events.length,
        status: response.status 
      });

    } catch (error) {
      console.error('Webhook delivery failed:', error);
      this.emit('webhook_error', { 
        error: error.message, 
        batchId: payload.batchId,
        eventCount: events.length 
      });
      
      // In a real implementation, you might want to retry or queue failed webhooks
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sign audit event
   */
  private signEvent(event: Omit<AuditEvent, 'signature'>): string {
    const data = JSON.stringify(event);
    
    return createHmac('sha256', this.config.webhookSecret)
      .update(data)
      .digest('hex');
  }

  /**
   * Sign webhook payload
   */
  private signWebhookPayload(payload: Omit<WebhookPayload, 'signature'>): string {
    const data = JSON.stringify(payload);
    
    return createHmac('sha256', this.config.webhookSecret)
      .update(data)
      .digest('hex');
  }
}

// Default configuration
export const defaultAuditConfig: AuditConfig = {
  logFilePath: './logs/audit.jsonl',
  webhookUrl: process.env.AUDIT_WEBHOOK_URL || 'http://localhost:3000/audit/events',
  webhookSecret: process.env.AUDIT_WEBHOOK_SECRET || 'default-secret-change-in-production',
  retentionDays: 90,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  enableCompression: true,
  logLevel: 'info'
};

// Export singleton instance
export const auditSystem = new AuditSystem(defaultAuditConfig);

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Shutting down audit system...');
  await auditSystem.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down audit system...');
  await auditSystem.shutdown();
  process.exit(0);
});
