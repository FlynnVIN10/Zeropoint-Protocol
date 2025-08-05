import { Injectable, Logger } from '@nestjs/common';
import { SandboxCreateRequest } from '../controllers/petals.controller.js';
import { TelemetryService } from './telemetry.service.js';
import axios from 'axios';
import { EventEmitter } from 'events';

export interface SandboxConfig {
  id: string;
  agentId: string;
  resourceCaps: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  status: 'creating' | 'running' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  containerId?: string;
  logs: string[];
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
    gpuUsage?: number;
    networkIO: number;
    diskIO: number;
  };
}

export interface WonderCraftContainer {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'terminated';
  image: string;
  command: string[];
  environment: Record<string, string>;
  resources: {
    cpu: number;
    memory: number;
    gpu?: number;
  };
  ports: number[];
  volumes: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  exitCode?: number;
  logs: {
    stdout: string[];
    stderr: string[];
  };
}

@Injectable()
export class SandboxService extends EventEmitter {
  private readonly logger = new Logger(SandboxService.name);
  private sandboxes: Map<string, SandboxConfig> = new Map();
  private wonderCraftApiUrl: string;
  private wonderCraftApiKey: string;

  constructor(private readonly telemetryService: TelemetryService) {
    super();
    this.wonderCraftApiUrl = process.env.WONDERCRAFT_API_URL || 'http://localhost:8080';
    this.wonderCraftApiKey = process.env.WONDERCRAFT_API_KEY || 'default-key';
    
    // Start monitoring loop for container status updates
    this.startMonitoringLoop();
  }

  async createSandbox(request: SandboxCreateRequest): Promise<string> {
    this.logger.log(`Creating WonderCraft sandbox for agent ${request.agentId}`);

    const sandboxId = `sandbox_${Date.now()}_${request.agentId}`;
    
    const sandboxConfig: SandboxConfig = {
      id: sandboxId,
      agentId: request.agentId,
      resourceCaps: request.resourceCaps,
      status: 'creating',
      createdAt: Date.now(),
      logs: [],
      metrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        gpuUsage: 0,
        networkIO: 0,
        diskIO: 0,
      },
    };

    this.sandboxes.set(sandboxId, sandboxConfig);

    // Emit sandbox creation event
    await this.telemetryService.logEvent('sandbox', 'creation_started', {
      sandboxId,
      agentId: request.agentId,
      resourceCaps: request.resourceCaps,
      timestamp: Date.now(),
    });

    try {
      // Create container via WonderCraft API
      const container = await this.createWonderCraftContainer(sandboxId, request);
      
      sandboxConfig.containerId = container.id;
      sandboxConfig.status = 'running';
      this.sandboxes.set(sandboxId, sandboxConfig);

      // Emit sandbox creation success event
      await this.telemetryService.logEvent('sandbox', 'creation_completed', {
        sandboxId,
        containerId: container.id,
        timestamp: Date.now(),
      });

      this.logger.log(`WonderCraft sandbox ${sandboxId} created and running with container ${container.id}`);
      
      return sandboxId;

    } catch (error) {
      sandboxConfig.status = 'failed';
      this.sandboxes.set(sandboxId, sandboxConfig);

      // Emit sandbox creation failure event
      await this.telemetryService.logEvent('sandbox', 'creation_failed', {
        sandboxId,
        error: error.message,
        timestamp: Date.now(),
      });

      this.logger.error(`Failed to create WonderCraft sandbox ${sandboxId}: ${error.message}`);
      throw error;
    }
  }

  private async createWonderCraftContainer(sandboxId: string, request: SandboxCreateRequest): Promise<WonderCraftContainer> {
    const containerConfig = {
      name: `sandbox-${sandboxId}`,
      image: request.image || 'wondercraft/base:latest',
      command: request.command || ['/bin/bash'],
      environment: {
        SANDBOX_ID: sandboxId,
        AGENT_ID: request.agentId,
        ...request.environment,
      },
      resources: {
        cpu: request.resourceCaps.cpu,
        memory: request.resourceCaps.memory,
        gpu: request.resourceCaps.gpu,
      },
      ports: request.ports || [],
      volumes: request.volumes || [],
    };

    const response = await axios.post(
      `${this.wonderCraftApiUrl}/api/v1/containers`,
      containerConfig,
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    return response.data;
  }

  async executeInSandbox(sandboxId: string, command: string): Promise<any> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    if (sandbox.status !== 'running') {
      throw new Error(`Sandbox ${sandboxId} is not running`);
    }

    this.logger.log(`Executing command in sandbox ${sandboxId}: ${command}`);

    // Emit command execution event
    await this.telemetryService.logEvent('sandbox', 'command_executed', {
      sandboxId,
      command,
      timestamp: Date.now(),
    });

    try {
      // Execute command via WonderCraft API
      const result = await this.executeWonderCraftCommand(sandboxId, command);
      
      // Update sandbox logs
      sandbox.logs.push(`[${new Date().toISOString()}] ${command}`);
      if (result.stdout) {
        sandbox.logs.push(`[STDOUT] ${result.stdout}`);
      }
      if (result.stderr) {
        sandbox.logs.push(`[STDERR] ${result.stderr}`);
      }
      this.sandboxes.set(sandboxId, sandbox);

      // Emit command completion event
      await this.telemetryService.logEvent('sandbox', 'command_completed', {
        sandboxId,
        command,
        exitCode: result.exitCode,
        duration: result.duration,
        timestamp: Date.now(),
      });

      return result;

    } catch (error) {
      // Emit command failure event
      await this.telemetryService.logEvent('sandbox', 'command_failed', {
        sandboxId,
        command,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  private async executeWonderCraftCommand(sandboxId: string, command: string): Promise<any> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox?.containerId) {
      throw new Error(`Container not found for sandbox ${sandboxId}`);
    }

    const response = await axios.post(
      `${this.wonderCraftApiUrl}/api/v1/containers/${sandbox.containerId}/exec`,
      {
        command: command.split(' '),
        tty: false,
        stream: false,
      },
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 1 minute timeout
      }
    );

    return {
      exitCode: response.data.exitCode,
      stdout: response.data.stdout,
      stderr: response.data.stderr,
      duration: response.data.duration,
    };
  }

  async destroySandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    this.logger.log(`Destroying WonderCraft sandbox ${sandboxId}`);

    // Emit sandbox destruction event
    await this.telemetryService.logEvent('sandbox', 'destruction_started', {
      sandboxId,
      timestamp: Date.now(),
    });

    try {
      // Destroy container via WonderCraft API
      if (sandbox.containerId) {
        await this.destroyWonderCraftContainer(sandbox.containerId);
      }
      
      sandbox.status = 'completed';
      sandbox.completedAt = Date.now();
      this.sandboxes.set(sandboxId, sandbox);

      // Emit sandbox destruction completion event
      await this.telemetryService.logEvent('sandbox', 'destruction_completed', {
        sandboxId,
        timestamp: Date.now(),
      });

      this.logger.log(`WonderCraft sandbox ${sandboxId} destroyed`);

    } catch (error) {
      // Emit sandbox destruction failure event
      await this.telemetryService.logEvent('sandbox', 'destruction_failed', {
        sandboxId,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  private async destroyWonderCraftContainer(containerId: string): Promise<void> {
    await axios.delete(
      `${this.wonderCraftApiUrl}/api/v1/containers/${containerId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );
  }

  async getSandboxStatus(sandboxId: string): Promise<SandboxConfig> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    // Update metrics from WonderCraft API if container is running
    if (sandbox.containerId && sandbox.status === 'running') {
      try {
        const metrics = await this.getContainerMetrics(sandbox.containerId);
        sandbox.metrics = metrics;
        this.sandboxes.set(sandboxId, sandbox);
      } catch (error) {
        this.logger.warn(`Failed to get metrics for container ${sandbox.containerId}: ${error.message}`);
      }
    }

    return sandbox;
  }

  private async getContainerMetrics(containerId: string): Promise<SandboxConfig['metrics']> {
    const response = await axios.get(
      `${this.wonderCraftApiUrl}/api/v1/containers/${containerId}/metrics`,
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return {
      cpuUsage: response.data.cpu || 0,
      memoryUsage: response.data.memory || 0,
      gpuUsage: response.data.gpu || 0,
      networkIO: response.data.network || 0,
      diskIO: response.data.disk || 0,
    };
  }

  async listSandboxes(): Promise<SandboxConfig[]> {
    return Array.from(this.sandboxes.values());
  }

  async getSandboxLogs(sandboxId: string, lines: number = 100): Promise<string[]> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    if (sandbox.containerId && sandbox.status === 'running') {
      try {
        const response = await axios.get(
          `${this.wonderCraftApiUrl}/api/v1/containers/${sandbox.containerId}/logs`,
          {
            headers: {
              'Authorization': `Bearer ${this.wonderCraftApiKey}`,
            },
            params: { lines },
            timeout: 10000,
          }
        );

        return response.data.logs || [];
      } catch (error) {
        this.logger.warn(`Failed to get logs for container ${sandbox.containerId}: ${error.message}`);
      }
    }

    return sandbox.logs.slice(-lines);
  }

  async pauseSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox?.containerId) {
      throw new Error(`Container not found for sandbox ${sandboxId}`);
    }

    await axios.post(
      `${this.wonderCraftApiUrl}/api/v1/containers/${sandbox.containerId}/pause`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
        },
      }
    );

    await this.telemetryService.logEvent('sandbox', 'paused', {
      sandboxId,
      timestamp: Date.now(),
    });
  }

  async resumeSandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox?.containerId) {
      throw new Error(`Container not found for sandbox ${sandboxId}`);
    }

    await axios.post(
      `${this.wonderCraftApiUrl}/api/v1/containers/${sandbox.containerId}/resume`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
        },
      }
    );

    await this.telemetryService.logEvent('sandbox', 'resumed', {
      sandboxId,
      timestamp: Date.now(),
    });
  }

  private startMonitoringLoop(): void {
    setInterval(async () => {
      for (const [sandboxId, sandbox] of this.sandboxes.entries()) {
        if (sandbox.containerId && sandbox.status === 'running') {
          try {
            const containerStatus = await this.getContainerStatus(sandbox.containerId);
            
            if (containerStatus.status === 'completed' || containerStatus.status === 'failed') {
              sandbox.status = containerStatus.status;
              sandbox.completedAt = Date.now();
              this.sandboxes.set(sandboxId, sandbox);

              // Emit status change event
              this.emit('sandboxStatusChanged', {
                sandboxId,
                status: containerStatus.status,
                timestamp: Date.now(),
              });

              await this.telemetryService.logEvent('sandbox', 'status_changed', {
                sandboxId,
                status: containerStatus.status,
                timestamp: Date.now(),
              });
            }
          } catch (error) {
            this.logger.warn(`Failed to check status for container ${sandbox.containerId}: ${error.message}`);
          }
        }
      }
    }, 5000); // Check every 5 seconds
  }

  private async getContainerStatus(containerId: string): Promise<{ status: string }> {
    const response = await axios.get(
      `${this.wonderCraftApiUrl}/api/v1/containers/${containerId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.wonderCraftApiKey}`,
        },
        timeout: 5000,
      }
    );

    return { status: response.data.status };
  }

  // SSE streaming support
  createStatusStream(sandboxId: string): NodeJS.ReadableStream {
    const { Readable } = require('stream');
    
    const stream = new Readable({
      read() {},
    });

    const sendUpdate = (data: any) => {
      stream.push(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial status
    const sandbox = this.sandboxes.get(sandboxId);
    if (sandbox) {
      sendUpdate({
        type: 'status',
        sandboxId,
        status: sandbox.status,
        timestamp: Date.now(),
      });
    }

    // Listen for status changes
    const statusHandler = (data: any) => {
      if (data.sandboxId === sandboxId) {
        sendUpdate({
          type: 'status_change',
          sandboxId,
          status: data.status,
          timestamp: data.timestamp,
        });
      }
    };

    this.on('sandboxStatusChanged', statusHandler);

    // Clean up when stream ends
    stream.on('close', () => {
      this.off('sandboxStatusChanged', statusHandler);
    });

    return stream;
  }
} 