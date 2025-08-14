/**
 * Synthiant Runtime - Sandboxed execution with resource caps and I/O policy
 *
 * @fileoverview Provides secure, sandboxed execution environment for Synthiant agents
 * @author Dev Team
 * @version 1.0.0
 */

import { EventEmitter } from "events";
import { performance } from "perf_hooks";
import {
  synthiantRegistry,
  SynthiantAgent,
  CurrentResourceUsage,
} from "./registry";

// Types and interfaces
export interface RuntimeConfig {
  maxExecutionTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  maxCPUUsage: number; // CPU cores
  maxTokenUsage: number; // token count
  maxNetworkUsage: number; // MB per hour
  maxFileOperations: number; // operations per hour
  enableSandboxing: boolean; // enable sandboxing features
  enableQuotaEnforcement: boolean; // enable quota enforcement
}

export interface TaskContext {
  taskId: string;
  agentId: string;
  startTime: number;
  resourceUsage: CurrentResourceUsage;
  executionHistory: ExecutionStep[];
}

export interface ExecutionStep {
  timestamp: number;
  action: string;
  resource: string;
  duration: number;
  outcome: "success" | "failure" | "quota_exceeded";
  details: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  output: any;
  error?: string;
  executionTime: number;
  resourceUsage: CurrentResourceUsage;
  auditTrail: ExecutionStep[];
}

export interface SandboxPolicy {
  allowedPaths: string[];
  deniedPaths: string[];
  allowedDomains: string[];
  deniedDomains: string[];
  allowedTools: string[];
  deniedTools: string[];
  maxFileSize: number;
  maxNetworkPayload: number;
}

/**
 * Synthiant Runtime Class
 * Provides sandboxed execution environment with resource monitoring
 */
export class SynthiantRuntime extends EventEmitter {
  private config: RuntimeConfig;
  private activeTasks: Map<string, TaskContext> = new Map();
  private resourceMonitor: ResourceMonitor;
  private sandboxPolicy: SandboxPolicy;

  constructor(config: RuntimeConfig, sandboxPolicy: SandboxPolicy) {
    super();
    this.config = config;
    this.sandboxPolicy = sandboxPolicy;
    this.resourceMonitor = new ResourceMonitor(config);

    this.setupEventHandlers();
  }

  /**
   * Execute a task in the sandboxed runtime
   */
  async executeTask(
    agentId: string,
    taskFn: () => Promise<any>,
    taskMetadata: Record<string, any> = {},
  ): Promise<TaskResult> {
    const taskId = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Validate agent
    const agent = await synthiantRegistry.getAgent(agentId);
    if (!agent || agent.status !== "active") {
      throw new Error(`Agent ${agentId} not found or not active`);
    }

    // Create task context
    const context: TaskContext = {
      taskId,
      agentId,
      startTime: performance.now(),
      resourceUsage: {
        memory: 0,
        cpu: 0,
        time: 0,
        tokens: 0,
        network: 0,
        fileOps: 0,
      },
      executionHistory: [],
    };

    this.activeTasks.set(taskId, context);
    this.emit("task_started", { taskId, agentId, metadata: taskMetadata });

    try {
      // Start resource monitoring
      const monitorPromise = this.resourceMonitor.startMonitoring(
        taskId,
        agentId,
      );

      // Execute task with timeout
      const taskPromise = this.executeWithTimeout(
        taskFn,
        this.config.maxExecutionTime,
      );

      // Wait for completion or timeout
      const [output] = await Promise.race([
        taskPromise,
        this.createTimeoutPromise(this.config.maxExecutionTime),
      ]);

      // Stop monitoring
      await this.resourceMonitor.stopMonitoring(taskId);

      // Get final resource usage
      const finalUsage = await this.resourceMonitor.getResourceUsage(taskId);

      // Update agent resource usage
      await synthiantRegistry.updateResourceUsage(agentId, finalUsage);

      // Create result
      const result: TaskResult = {
        success: true,
        output,
        executionTime: performance.now() - context.startTime,
        resourceUsage: finalUsage,
        auditTrail: context.executionHistory,
      };

      this.emit("task_completed", { taskId, agentId, result });
      return result;
    } catch (error) {
      // Stop monitoring
      await this.resourceMonitor.stopMonitoring(taskId);

      // Log error
      this.logExecutionStep(context, "task_failed", "execution", 0, "failure", {
        error: error.message,
        stack: error.stack,
      });

      // Create error result
      const result: TaskResult = {
        success: false,
        output: null,
        error: error.message,
        executionTime: performance.now() - context.startTime,
        resourceUsage: context.resourceUsage,
        auditTrail: context.executionHistory,
      };

      this.emit("task_failed", {
        taskId,
        agentId,
        error: error.message,
        result,
      });
      throw error;
    } finally {
      // Cleanup
      this.activeTasks.delete(taskId);
      this.emit("task_cleanup", { taskId, agentId });
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Task execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Log execution step
   */
  private logExecutionStep(
    context: TaskContext,
    action: string,
    resource: string,
    duration: number,
    outcome: ExecutionStep["outcome"],
    details: Record<string, any> = {},
  ): void {
    const step: ExecutionStep = {
      timestamp: Date.now(),
      action,
      resource,
      duration,
      outcome,
      details,
    };

    context.executionHistory.push(step);
    this.emit("execution_step", { taskId: context.taskId, step });
  }

  /**
   * Get active task count
   */
  getActiveTaskCount(): number {
    return this.activeTasks.size;
  }

  /**
   * Get task context
   */
  getTaskContext(taskId: string): TaskContext | undefined {
    return this.activeTasks.get(taskId);
  }

  /**
   * Terminate all tasks for an agent
   */
  async terminateAgentTasks(agentId: string): Promise<number> {
    let terminatedCount = 0;

    for (const [taskId, context] of this.activeTasks.entries()) {
      if (context.agentId === agentId) {
        // Stop monitoring
        await this.resourceMonitor.stopMonitoring(taskId);

        // Log termination
        this.logExecutionStep(
          context,
          "task_terminated",
          "execution",
          0,
          "failure",
          {
            reason: "agent_terminated",
          },
        );

        // Remove from active tasks
        this.activeTasks.delete(taskId);
        terminatedCount++;

        this.emit("task_terminated", {
          taskId,
          agentId,
          reason: "agent_terminated",
        });
      }
    }

    return terminatedCount;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on("task_started", (data) => {
      console.log(
        `[Runtime] Task started: ${data.taskId} for agent ${data.agentId}`,
      );
    });

    this.on("task_completed", (data) => {
      console.log(
        `[Runtime] Task completed: ${data.taskId} in ${data.executionTime.toFixed(2)}ms`,
      );
    });

    this.on("task_failed", (data) => {
      console.error(`[Runtime] Task failed: ${data.taskId} - ${data.error}`);
    });

    this.on("execution_step", (data) => {
      console.debug(
        `[Runtime] Execution step: ${data.step.action} on ${data.step.resource}`,
      );
    });
  }

  /**
   * Get runtime statistics
   */
  getRuntimeStats(): {
    activeTasks: number;
    totalMemory: number;
    totalCPU: number;
    uptime: number;
  } {
    const activeTasks = Array.from(this.activeTasks.values());
    const totalMemory = activeTasks.reduce(
      (sum, task) => sum + task.resourceUsage.memory,
      0,
    );
    const totalCPU = activeTasks.reduce(
      (sum, task) => sum + task.resourceUsage.cpu,
      0,
    );

    return {
      activeTasks: this.activeTasks.size,
      totalMemory,
      totalCPU,
      uptime:
        Date.now() -
        (this.activeTasks.size > 0
          ? Math.min(...activeTasks.map((t) => t.startTime))
          : Date.now()),
    };
  }
}

/**
 * Resource Monitor Class
 * Monitors resource usage during task execution
 */
class ResourceMonitor {
  private config: RuntimeConfig;
  private activeMonitors: Map<string, NodeJS.Timeout> = new Map();
  private resourceUsage: Map<string, CurrentResourceUsage> = new Map();

  constructor(config: RuntimeConfig) {
    this.config = config;
  }

  /**
   * Start monitoring resources for a task
   */
  async startMonitoring(taskId: string, agentId: string): Promise<void> {
    // Initialize resource usage
    this.resourceUsage.set(taskId, {
      memory: 0,
      cpu: 0,
      time: 0,
      tokens: 0,
      network: 0,
      fileOps: 0,
    });

    // Start monitoring loop
    const monitorInterval = setInterval(() => {
      this.updateResourceUsage(taskId, agentId);
    }, 1000); // Update every second

    this.activeMonitors.set(taskId, monitorInterval);
  }

  /**
   * Stop monitoring resources for a task
   */
  async stopMonitoring(taskId: string): Promise<void> {
    const monitor = this.activeMonitors.get(taskId);
    if (monitor) {
      clearInterval(monitor);
      this.activeMonitors.delete(taskId);
    }
  }

  /**
   * Update resource usage for a task
   */
  private updateResourceUsage(taskId: string, agentId: string): void {
    const usage = this.resourceUsage.get(taskId);
    if (!usage) return;

    // Simulate resource usage (in real implementation, this would use actual metrics)
    const currentTime = Date.now();

    // Update time usage
    usage.time = Math.floor((currentTime - performance.now()) / 1000);

    // Update memory usage (simulated)
    usage.memory = Math.min(
      usage.memory + Math.random() * 10,
      this.config.maxMemoryUsage,
    );

    // Update CPU usage (simulated)
    usage.cpu = Math.min(
      usage.cpu + Math.random() * 0.1,
      this.config.maxCPUUsage,
    );

    // Check quotas
    if (this.config.enableQuotaEnforcement) {
      if (usage.memory > this.config.maxMemoryUsage) {
        this.handleQuotaBreach(
          taskId,
          "memory",
          usage.memory,
          this.config.maxMemoryUsage,
        );
      }

      if (usage.cpu > this.config.maxCPUUsage) {
        this.handleQuotaBreach(
          taskId,
          "cpu",
          usage.cpu,
          this.config.maxCPUUsage,
        );
      }

      if (usage.time > this.config.maxExecutionTime / 1000) {
        this.handleQuotaBreach(
          taskId,
          "time",
          usage.time,
          this.config.maxExecutionTime / 1000,
        );
      }
    }
  }

  /**
   * Handle quota breach
   */
  private handleQuotaBreach(
    taskId: string,
    resource: string,
    current: number,
    limit: number,
  ): void {
    console.warn(
      `Quota breach detected for task ${taskId}: ${resource} ${current}/${limit}`,
    );

    // Stop monitoring
    this.stopMonitoring(taskId);

    // Emit quota breach event
    (process as any).emit("quota_breach", { taskId, resource, current, limit });
  }

  /**
   * Get current resource usage for a task
   */
  async getResourceUsage(taskId: string): Promise<CurrentResourceUsage> {
    return (
      this.resourceUsage.get(taskId) || {
        memory: 0,
        cpu: 0,
        time: 0,
        tokens: 0,
        network: 0,
        fileOps: 0,
      }
    );
  }

  /**
   * Update specific resource usage
   */
  updateSpecificUsage(
    taskId: string,
    updates: Partial<CurrentResourceUsage>,
  ): void {
    const usage = this.resourceUsage.get(taskId);
    if (usage) {
      Object.assign(usage, updates);
    }
  }
}

// Default runtime configuration
export const defaultRuntimeConfig: RuntimeConfig = {
  maxExecutionTime: 30 * 60 * 1000, // 30 minutes
  maxMemoryUsage: 200, // 200MB
  maxCPUUsage: 2, // 2 CPU cores
  maxTokenUsage: 10000, // 10,000 tokens
  maxNetworkUsage: 100, // 100MB per hour
  maxFileOperations: 1000, // 1,000 operations per hour
  enableSandboxing: true, // enable sandboxing
  enableQuotaEnforcement: true, // enable quota enforcement
};

// Default sandbox policy
export const defaultSandboxPolicy: SandboxPolicy = {
  allowedPaths: ["/tmp", "/var/tmp", "/app/data"],
  deniedPaths: ["/etc", "/var/log", "/root", "/home"],
  allowedDomains: ["api.zeropointprotocol.ai", "github.com"],
  deniedDomains: ["localhost", "127.0.0.1", "0.0.0.0"],
  allowedTools: ["github", "rag", "sse", "http"],
  deniedTools: ["shell", "exec", "eval", "require"],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxNetworkPayload: 5 * 1024 * 1024, // 5MB
};

// Export singleton instance
export const synthiantRuntime = new SynthiantRuntime(
  defaultRuntimeConfig,
  defaultSandboxPolicy,
);
