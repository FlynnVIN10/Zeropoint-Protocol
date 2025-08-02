import { Injectable, Logger } from '@nestjs/common';
import { SandboxCreateRequest } from '../controllers/petals.controller.js';

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
}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);
  private sandboxes: Map<string, SandboxConfig> = new Map();

  async createSandbox(request: SandboxCreateRequest): Promise<string> {
    this.logger.log(`Creating WonderCraft sandbox for agent ${request.agentId}`);

    const sandboxId = `sandbox_${Date.now()}_${request.agentId}`;
    
    const sandboxConfig: SandboxConfig = {
      id: sandboxId,
      agentId: request.agentId,
      resourceCaps: request.resourceCaps,
      status: 'creating',
      createdAt: Date.now(),
    };

    this.sandboxes.set(sandboxId, sandboxConfig);

    // Simulate container creation with resource caps
    await this.simulateContainerCreation(sandboxId, request.resourceCaps);
    
    sandboxConfig.status = 'running';
    this.sandboxes.set(sandboxId, sandboxConfig);

    this.logger.log(`WonderCraft sandbox ${sandboxId} created and running`);
    
    return sandboxId;
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

    // Simulate command execution with resource monitoring
    const result = await this.simulateCommandExecution(sandboxId, command);
    
    return result;
  }

  async destroySandbox(sandboxId: string): Promise<void> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    this.logger.log(`Destroying WonderCraft sandbox ${sandboxId}`);

    // Simulate container destruction
    await this.simulateContainerDestruction(sandboxId);
    
    sandbox.status = 'completed';
    sandbox.completedAt = Date.now();
    this.sandboxes.set(sandboxId, sandbox);

    this.logger.log(`WonderCraft sandbox ${sandboxId} destroyed`);
  }

  async getSandboxStatus(sandboxId: string): Promise<SandboxConfig> {
    const sandbox = this.sandboxes.get(sandboxId);
    if (!sandbox) {
      throw new Error(`Sandbox ${sandboxId} not found`);
    }

    return sandbox;
  }

  async listSandboxes(): Promise<SandboxConfig[]> {
    return Array.from(this.sandboxes.values());
  }

  private async simulateContainerCreation(sandboxId: string, resourceCaps: any): Promise<void> {
    this.logger.log(`Creating container with resource caps: CPU=${resourceCaps.cpu}, Memory=${resourceCaps.memory}MB`);
    
    // Simulate container creation time
    await new Promise(resolve => setTimeout(resolve, 200));
    
    this.logger.log(`Container created successfully with ID: ${sandboxId}`);
  }

  private async simulateCommandExecution(sandboxId: string, command: string): Promise<any> {
    this.logger.log(`Executing command: ${command}`);
    
    // Simulate command execution time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock execution result
    return {
      exitCode: 0,
      stdout: `Command executed successfully in sandbox ${sandboxId}`,
      stderr: '',
      duration: Math.random() * 1000 + 100,
    };
  }

  private async simulateContainerDestruction(sandboxId: string): Promise<void> {
    this.logger.log(`Destroying container: ${sandboxId}`);
    
    // Simulate container destruction time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.logger.log(`Container destroyed successfully: ${sandboxId}`);
  }
} 