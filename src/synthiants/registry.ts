/**
 * Synthiant Registry - CRUD operations and signed manifest management
 * 
 * @fileoverview Manages Synthiant agent registration, authentication, and lifecycle
 * @author Dev Team
 * @version 1.0.0
 */

import { createHash, createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Types and interfaces
export interface SynthiantManifest {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  quotas: ResourceQuotas;
  permissions: PermissionSet;
  signature: string;
  timestamp: number;
  expiresAt: number;
}

export interface ResourceQuotas {
  maxMemory: number;      // MB
  maxCPU: number;         // CPU cores
  maxTime: number;        // seconds
  maxTokens: number;      // token count
  maxNetwork: number;     // MB per hour
  maxFileOps: number;     // operations per hour
}

export interface PermissionSet {
  readPaths: string[];
  writePaths: string[];
  allowedDomains: string[];
  allowedTools: string[];
  deniedOperations: string[];
}

export interface SynthiantAgent {
  id: string;
  manifest: SynthiantManifest;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  createdAt: number;
  lastSeen: number;
  resourceUsage: CurrentResourceUsage;
  auditLog: AuditEntry[];
}

export interface CurrentResourceUsage {
  memory: number;
  cpu: number;
  time: number;
  tokens: number;
  network: number;
  fileOps: number;
}

export interface AuditEntry {
  timestamp: number;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'quota_exceeded';
  details: Record<string, any>;
}

export interface RegistryConfig {
  maxAgents: number;
  maxManifestSize: number;
  signatureSecret: string;
  auditRetentionDays: number;
}

/**
 * Synthiant Registry Class
 * Manages agent registration, authentication, and lifecycle
 */
export class SynthiantRegistry {
  private agents: Map<string, SynthiantAgent> = new Map();
  private config: RegistryConfig;
  private auditLog: AuditEntry[] = [];

  constructor(config: RegistryConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Register a new Synthiant agent
   */
  async registerAgent(manifest: Omit<SynthiantManifest, 'id' | 'signature' | 'timestamp'>): Promise<string> {
    try {
      // Validate manifest
      this.validateManifest(manifest);

      // Check registry capacity
      if (this.agents.size >= this.config.maxAgents) {
        throw new Error('Registry capacity exceeded');
      }

      // Generate agent ID and signature
      const id = uuidv4();
      const timestamp = Date.now();
      const expiresAt = timestamp + (24 * 60 * 60 * 1000); // 24 hours

      const fullManifest: SynthiantManifest = {
        ...manifest,
        id,
        timestamp,
        expiresAt,
        signature: this.signManifest(manifest, timestamp)
      };

      // Create agent record
      const agent: SynthiantAgent = {
        id,
        manifest: fullManifest,
        status: 'active',
        createdAt: timestamp,
        lastSeen: timestamp,
        resourceUsage: {
          memory: 0,
          cpu: 0,
          time: 0,
          tokens: 0,
          network: 0,
          fileOps: 0
        },
        auditLog: []
      };

      // Store agent
      this.agents.set(id, agent);

      // Log registration
      this.logAudit('agent_registered', { agentId: id, manifest: fullManifest });

      return id;
    } catch (error) {
      this.logAudit('agent_registration_failed', { error: error.message, manifest });
      throw error;
    }
  }

  /**
   * Retrieve agent by ID
   */
  async getAgent(id: string): Promise<SynthiantAgent | null> {
    const agent = this.agents.get(id);
    if (agent && agent.status !== 'terminated') {
      // Update last seen
      agent.lastSeen = Date.now();
      return agent;
    }
    return null;
  }

  /**
   * Update agent status
   */
  async updateAgentStatus(id: string, status: SynthiantAgent['status']): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) {
      return false;
    }

    const oldStatus = agent.status;
    agent.status = status;
    agent.lastSeen = Date.now();

    this.logAudit('agent_status_updated', { 
      agentId: id, 
      oldStatus, 
      newStatus: status 
    });

    return true;
  }

  /**
   * Update agent resource usage
   */
  async updateResourceUsage(id: string, usage: Partial<CurrentResourceUsage>): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent || agent.status !== 'active') {
      return false;
    }

    // Update usage
    Object.assign(agent.resourceUsage, usage);
    agent.lastSeen = Date.now();

    // Check quotas
    const manifest = agent.manifest;
    const quotas = manifest.quotas;

    if (usage.memory && usage.memory > quotas.maxMemory) {
      await this.handleQuotaBreach(id, 'memory', usage.memory, quotas.maxMemory);
    }

    if (usage.cpu && usage.cpu > quotas.maxCPU) {
      await this.handleQuotaBreach(id, 'cpu', usage.cpu, quotas.maxCPU);
    }

    if (usage.time && usage.time > quotas.maxTime) {
      await this.handleQuotaBreach(id, 'time', usage.time, quotas.maxTime);
    }

    return true;
  }

  /**
   * Terminate agent
   */
  async terminateAgent(id: string, reason: string): Promise<boolean> {
    const agent = this.agents.get(id);
    if (!agent) {
      return false;
    }

    agent.status = 'terminated';
    agent.lastSeen = Date.now();

    this.logAudit('agent_terminated', { 
      agentId: id, 
      reason,
      finalUsage: agent.resourceUsage 
    });

    return true;
  }

  /**
   * List all active agents
   */
  async listActiveAgents(): Promise<SynthiantAgent[]> {
    return Array.from(this.agents.values())
      .filter(agent => agent.status === 'active')
      .sort((a, b) => b.lastSeen - a.lastSeen);
  }

  /**
   * Get registry statistics
   */
  async getRegistryStats(): Promise<{
    totalAgents: number;
    activeAgents: number;
    totalMemory: number;
    totalCPU: number;
    uptime: number;
  }> {
    const activeAgents = await this.listActiveAgents();
    const totalMemory = activeAgents.reduce((sum, agent) => sum + agent.resourceUsage.memory, 0);
    const totalCPU = activeAgents.reduce((sum, agent) => sum + agent.resourceUsage.cpu, 0);

    return {
      totalAgents: this.agents.size,
      activeAgents: activeAgents.length,
      totalMemory,
      totalCPU,
      uptime: Date.now() - this.agents.size > 0 ? 
        Math.min(...Array.from(this.agents.values()).map(a => a.createdAt)) : Date.now()
    };
  }

  /**
   * Clean up expired agents
   */
  async cleanupExpiredAgents(): Promise<number> {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, agent] of this.agents.entries()) {
      if (agent.manifest.expiresAt < now && agent.status !== 'terminated') {
        await this.terminateAgent(id, 'manifest_expired');
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Validate manifest structure and content
   */
  private validateManifest(manifest: any): void {
    if (!manifest.name || typeof manifest.name !== 'string') {
      throw new Error('Invalid manifest: name is required and must be string');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      throw new Error('Invalid manifest: version is required and must be string');
    }

    if (!Array.isArray(manifest.capabilities)) {
      throw new Error('Invalid manifest: capabilities must be array');
    }

    if (!manifest.quotas || typeof manifest.quotas !== 'object') {
      throw new Error('Invalid manifest: quotas are required');
    }

    if (!manifest.permissions || typeof manifest.permissions !== 'object') {
      throw new Error('Invalid manifest: permissions are required');
    }

    // Validate quotas
    const quotas = manifest.quotas;
    if (quotas.maxMemory <= 0 || quotas.maxCPU <= 0 || quotas.maxTime <= 0) {
      throw new Error('Invalid manifest: quotas must be positive values');
    }

    // Validate permissions
    const permissions = manifest.permissions;
    if (!Array.isArray(permissions.readPaths) || !Array.isArray(permissions.writePaths)) {
      throw new Error('Invalid manifest: permissions must include readPaths and writePaths arrays');
    }
  }

  /**
   * Sign manifest with HMAC
   */
  private signManifest(manifest: any, timestamp: number): string {
    const data = JSON.stringify({
      ...manifest,
      timestamp,
      expiresAt: timestamp + (24 * 60 * 60 * 1000)
    });

    return createHmac('sha256', this.config.signatureSecret)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify manifest signature
   */
  private verifyManifestSignature(manifest: SynthiantManifest): boolean {
    const { signature, ...manifestWithoutSignature } = manifest;
    const expectedSignature = this.signManifest(manifestWithoutSignature, manifest.timestamp);
    return signature === expectedSignature;
  }

  /**
   * Handle quota breach
   */
  private async handleQuotaBreach(
    agentId: string, 
    resource: string, 
    current: number, 
    limit: number
  ): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.logAudit('quota_breach', {
      agentId,
      resource,
      current,
      limit,
      breach: current - limit
    });

    // Suspend agent on quota breach
    await this.updateAgentStatus(agentId, 'suspended');

    // Log breach for monitoring
    console.warn(`Quota breach detected for agent ${agentId}: ${resource} ${current}/${limit}`);
  }

  /**
   * Log audit entry
   */
  private logAudit(action: string, details: Record<string, any>): void {
    const entry: AuditEntry = {
      timestamp: Date.now(),
      action,
      resource: 'registry',
      outcome: 'success',
      details
    };

    this.auditLog.push(entry);

    // Trim old entries
    const cutoff = Date.now() - (this.config.auditRetentionDays * 24 * 60 * 60 * 1000);
    this.auditLog = this.auditLog.filter(entry => entry.timestamp > cutoff);
  }

  /**
   * Validate registry configuration
   */
  private validateConfig(): void {
    if (!this.config.signatureSecret || this.config.signatureSecret.length < 32) {
      throw new Error('Signature secret must be at least 32 characters');
    }

    if (this.config.maxAgents <= 0) {
      throw new Error('Max agents must be positive');
    }

    if (this.config.maxManifestSize <= 0) {
      throw new Error('Max manifest size must be positive');
    }

    if (this.config.auditRetentionDays <= 0) {
      throw new Error('Audit retention days must be positive');
    }
  }

  /**
   * Export audit log
   */
  async exportAuditLog(): Promise<AuditEntry[]> {
    return [...this.auditLog];
  }

  /**
   * Get agent audit log
   */
  async getAgentAuditLog(agentId: string): Promise<AuditEntry[]> {
    const agent = this.agents.get(agentId);
    return agent ? [...agent.auditLog] : [];
  }
}

// Default configuration
export const defaultRegistryConfig: RegistryConfig = {
  maxAgents: 100,
  maxManifestSize: 1024 * 1024, // 1MB
  signatureSecret: process.env.SYNTHIANT_SIGNATURE_SECRET || 'default-secret-change-in-production',
  auditRetentionDays: 90
};

// Export singleton instance
export const synthiantRegistry = new SynthiantRegistry(defaultRegistryConfig);
