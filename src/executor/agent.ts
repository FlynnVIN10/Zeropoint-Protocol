/**
 * Executor Agent - Tool/provider calls and diffs
 * 
 * @fileoverview Executes tasks using available tools and providers, tracks diffs
 * @author Dev Team
 * @version 1.0.0
 */

import { synthiantRuntime, TaskResult } from '../synthiants/runtime';
import { synthiantRegistry, SynthiantAgent } from '../synthiants/registry';
import { auditSystem } from '../audit';
import { MissionTask, TaskExecutionResult, TaskOutput } from '../planner/mission_planner';

// Types and interfaces
export interface ExecutionContext {
  agentId: string;
  taskId: string;
  tools: string[];
  providers: string[];
  maxRetries: number;
  timeout: number;
  missionId?: string;
  directiveId?: string;
  environment?: string;
  permissions?: string[];
  repository?: string;
  branch?: string;
  codePath?: string;
  testPath?: string;
}

export interface ExecutableTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface ToolCall {
  tool: string;
  params: Record<string, any>;
  timestamp: number;
  result?: any;
  error?: string;
  duration: number;
}

export interface ProviderCall {
  provider: string;
  method: string;
  params: Record<string, any>;
  timestamp: number;
  result?: any;
  error?: string;
  duration: number;
}

export interface DiffResult {
  before: any;
  after: any;
  changes: DiffChange[];
  summary: string;
}

export interface DiffChange {
  path: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: any;
  newValue?: any;
}

export interface ExecutionResult {
  success: boolean;
  toolCalls: ToolCall[];
  providerCalls: ProviderCall[];
  diffs: DiffResult[];
  totalDuration: number;
  resourceUsage: any;
  auditTrail: any[];
}

/**
 * Executor Agent Class
 * Manages tool execution, provider calls, and diff tracking
 */
export class ExecutorAgent {
  private context: ExecutionContext;
  private toolCalls: ToolCall[] = [];
  private providerCalls: ProviderCall[] = [];
  private diffs: DiffResult[] = [];
  private tools: ExecutableTool[] = [];
  private agentId: string;
  private auditSystem = auditSystem;

  constructor(context: ExecutionContext) {
    this.context = context;
    this.agentId = context.agentId;
  }

  /**
   * Execute a task using available tools and providers
   */
  async executeTask(task: MissionTask, context: ExecutionContext): Promise<TaskExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Log task execution start
      await this.auditSystem.logSuccess(
        'task_execution_started',
        'executor_agent',
        { 
          taskId: task.id, 
          type: task.type, 
          priority: task.priority,
          agentId: this.agentId 
        }
      );

      // Validate task requirements
      await this.validateTaskRequirements(task, context);

      // Execute task with tools
      const output = await this.executeTaskWithTools(task, [], context);

      // Create execution result
      const result: TaskExecutionResult = {
        taskId: task.id,
        status: 'success',
        duration: Date.now() - startTime,
        output: output,
        artifacts: [],
        metrics: {
          executionTime: Date.now() - startTime,
          memoryUsage: 0,
          cpuUsage: 0,
          successRate: 1.0,
          qualityScore: 0.9
        },
        completedAt: Date.now()
      };

      // Log success
      await this.auditSystem.logSuccess(
        'task_execution_completed',
        'executor_agent',
        { 
          taskId: task.id, 
          type: task.type,
          agentId: this.agentId 
        }
      );

      return result;

    } catch (error) {
      console.error('Task execution failed:', error);

      // Log failure
      await this.auditSystem.logFailure(
        'task_execution_failed',
        'executor_agent',
        error.message,
        { 
          taskId: task.id, 
          type: task.type,
          agentId: this.agentId 
        }
      );

      // Return failure result
      const result: TaskExecutionResult = {
        taskId: task.id,
        status: 'failed',
        duration: Date.now() - startTime,
        output: {
          result: null,
          logs: [],
          metadata: { error: error.message }
        },
        artifacts: [],
        metrics: {
          executionTime: Date.now() - startTime,
          memoryUsage: 0,
          cpuUsage: 0,
          successRate: 0.0,
          qualityScore: 0.0
        },
        error: error.message,
        completedAt: Date.now()
      };

      return result;
    }
  }

  /**
   * Validate task requirements before execution
   */
  private async validateTaskRequirements(task: MissionTask, context: ExecutionContext): Promise<void> {
    // Check resource availability
    const requiredResources = this.getRequiredResources(task);
    const availableResources = await this.checkResourceAvailability(requiredResources);
    
    if (!availableResources.available) {
      throw new Error(`Insufficient resources: ${availableResources.missing.join(', ')}`);
    }
    
    // Check tool availability
    const requiredTools = this.getRequiredTools(task);
    const availableTools = await this.checkToolAvailability(requiredTools);
    
    if (!availableTools.available) {
      throw new Error(`Required tools not available: ${availableTools.missing.join(', ')}`);
    }
    
    // Check context validity
    if (!this.isContextValid(context)) {
      throw new Error('Invalid execution context');
    }
  }

  /**
   * Get required resources for a task
   */
  private getRequiredResources(task: MissionTask): string[] {
    const resourceMap: Record<string, string[]> = {
      'code': ['cpu', 'memory', 'storage', 'network'],
      'test': ['cpu', 'memory', 'test_environment'],
      'deploy': ['cpu', 'memory', 'deployment_tools'],
      'review': ['cpu', 'memory', 'review_tools'],
      'research': ['cpu', 'memory', 'data_access'],
      'documentation': ['cpu', 'memory', 'content_creation']
    };
    
    return resourceMap[task.type] || ['cpu', 'memory'];
  }

  /**
   * Check resource availability
   */
  private async checkResourceAvailability(requiredResources: string[]): Promise<{
    available: boolean;
    missing: string[];
    availableResources: string[];
  }> {
    const missing: string[] = [];
    const availableResources: string[] = [];

    for (const resource of requiredResources) {
      const isAvailable = await this.checkResourceStatus(resource);
      if (isAvailable) {
        availableResources.push(resource);
      } else {
        missing.push(resource);
      }
    }

    return {
      available: missing.length === 0,
      missing,
      availableResources
    };
  }

  /**
   * Check individual resource status
   */
  private async checkResourceStatus(resource: string): Promise<boolean> {
    // Mock resource checking - in real implementation, this would check actual system resources
    const resourceStatus: Record<string, boolean> = {
      'cpu': true,
      'memory': true,
      'storage': true,
      'network': true,
      'data_access': true,
      'test_environment': true,
      'deployment_tools': true,
      'review_tools': true,
      'content_creation': true
    };
    
    return resourceStatus[resource] || false;
  }

  /**
   * Get required tools for a task
   */
  private getRequiredTools(task: MissionTask): string[] {
    const toolMap: Record<string, string[]> = {
      'code': ['github', 'code_generation', 'code_analysis'],
      'test': ['test_runner', 'coverage_analysis'],
      'deploy': ['deployment_tool'],
      'review': ['content_creation', 'markdown_generator'],
      'research': ['github', 'basic_tools'],
      'documentation': ['content_creation', 'markdown_generator']
    };
    
    return toolMap[task.type] || ['github', 'basic_tools'];
  }

  /**
   * Check tool availability
   */
  private async checkToolAvailability(requiredTools: string[]): Promise<{
    available: boolean;
    missing: string[];
    availableTools: string[];
  }> {
    const missing: string[] = [];
    const availableTools: string[] = [];

    for (const toolName of requiredTools) {
      const tool = this.tools.find(t => t.name === toolName);
      if (tool) {
        availableTools.push(toolName);
      } else {
        missing.push(toolName);
      }
    }

    return {
      available: missing.length === 0,
      missing,
      availableTools
    };
  }

  /**
   * Check if execution context is valid
   */
  private isContextValid(context: ExecutionContext): boolean {
    return !!(
      context.missionId &&
      context.directiveId &&
      context.agentId &&
      context.environment &&
      context.permissions
    );
  }

  /**
   * Select appropriate tools for task execution
   */
  private async selectToolsForTask(task: MissionTask): Promise<ExecutableTool[]> {
    const selectedTools: ExecutableTool[] = [];

    // Select tools based on task type
    switch (task.type) {
      case 'code':
        // Code generation and analysis tools
        selectedTools.push(
          this.tools.find(t => t.name === 'github')!,
          this.tools.find(t => t.name === 'code_analysis')!
        );
        break;
      case 'test':
        // Testing tools
        selectedTools.push(
          this.tools.find(t => t.name === 'github')!,
          this.tools.find(t => t.name === 'code_generation')!,
          this.tools.find(t => t.name === 'testing')!
        );
        break;
      case 'deploy':
        // Deployment tools
        selectedTools.push(
          this.tools.find(t => t.name === 'test_runner')!,
          this.tools.find(t => t.name === 'coverage_analysis')!
        );
        break;
      case 'review':
        // Review tools
        selectedTools.push(
          this.tools.find(t => t.name === 'content_creation')!,
          this.tools.find(t => t.name === 'markdown_generator')!
        );
        break;
      case 'research':
        // Research tools
        selectedTools.push(
          this.tools.find(t => t.name === 'github')!,
          this.tools.find(t => t.name === 'basic_tools')!
        );
        break;
      case 'documentation':
        // Documentation tools
        selectedTools.push(
          this.tools.find(t => t.name === 'content_creation')!,
          this.tools.find(t => t.name === 'markdown_generator')!
        );
        break;
    }

    return selectedTools.filter(Boolean);
  }

  /**
   * Execute task using selected tools
   */
  private async executeTaskWithTools(
    task: MissionTask, 
    tools: ExecutableTool[], 
    context: ExecutionContext
  ): Promise<TaskOutput> {
    const outputs: Partial<TaskOutput>[] = [];
    
    // Execute tools in sequence or parallel based on task requirements
    if (this.shouldExecuteParallel(task)) {
      // Execute tools in parallel
      const toolPromises = tools.map(tool => 
        this.executeTool(tool, task, context)
      );
      
      const toolOutputs = await Promise.all(toolPromises);
      outputs.push(...toolOutputs);
    } else {
      // Execute tools sequentially
      for (const tool of tools) {
        const output = await this.executeTool(tool, task, context);
        outputs.push(output);
      }
    }
    
    // Merge tool outputs
    return this.mergeToolOutputs(outputs, task);
  }

  /**
   * Determine if tools should execute in parallel
   */
  private shouldExecuteParallel(task: MissionTask): boolean {
    // High priority tasks can use parallel execution for efficiency
    if (task.priority === 'high') return true;
    
    // Certain task types benefit from parallel execution
    const parallelTaskTypes = ['testing', 'validation', 'analysis'];
    return parallelTaskTypes.includes(task.type);
  }

  /**
   * Execute a tool with the given task and context
   */
  private async executeTool(
    tool: ExecutableTool, 
    task: MissionTask, 
    context: ExecutionContext
  ): Promise<Partial<TaskOutput>> {
    try {
      const toolInput = this.prepareToolInput(tool, task, context);
      
      // Execute tool
      const result = await tool.execute(toolInput);
      
      // Validate tool output
      const validatedOutput = this.validateToolOutput(result, tool);
      
      return validatedOutput;
      
    } catch (error) {
      // Log tool execution error
      await this.auditSystem.logFailure(
        'tool_execution_failed',
        'executor_agent',
        error.message,
        { 
          toolName: tool.name,
          taskId: task.id,
          agentId: this.agentId
        }
      );
      
      throw error;
    }
  }

  /**
   * Prepare input for tool execution
   */
  private prepareToolInput(tool: ExecutableTool, task: MissionTask, context: ExecutionContext): any {
    const baseInput = {
      taskId: task.id,
      taskType: task.type,
      taskDescription: task.description,
      priority: task.priority,
      context: {
        missionId: context.missionId,
        directiveId: context.directiveId,
        environment: context.environment
      }
    };
    
    // Add tool-specific input preparation
    switch (tool.name) {
      case 'github':
        return {
          ...baseInput,
          repository: context.repository,
          branch: context.branch,
          permissions: context.permissions
        };
        
      case 'code_analysis':
        return {
          ...baseInput,
          codePath: context.codePath,
          analysisType: this.getAnalysisType(task)
        };
        
      case 'testing':
        return {
          ...baseInput,
          testPath: context.testPath,
          testType: this.getTestType(task)
        };
        
      default:
        return baseInput;
    }
  }

  /**
   * Get analysis type for code analysis tool
   */
  private getAnalysisType(task: MissionTask): string {
    if (task.description.includes('security')) return 'security';
    if (task.description.includes('performance')) return 'performance';
    if (task.description.includes('quality')) return 'quality';
    return 'general';
  }

  /**
   * Get test type for testing tool
   */
  private getTestType(task: MissionTask): string {
    if (task.description.includes('unit')) return 'unit';
    if (task.description.includes('integration')) return 'integration';
    if (task.description.includes('e2e')) return 'e2e';
    return 'unit';
  }

  /**
   * Validate tool output
   */
  private validateToolOutput(output: any, tool: ExecutableTool): Partial<TaskOutput> {
    // Basic validation
    if (!output) {
      throw new Error(`Tool ${tool.name} returned empty output`);
    }
    
    // Tool-specific validation
    switch (tool.name) {
      case 'github':
        if (!output.repository || !output.branch) {
          throw new Error(`GitHub tool output missing required fields`);
        }
        break;
        
      case 'code_analysis':
        if (!output.analysis || !output.recommendations) {
          throw new Error(`Code analysis tool output missing required fields`);
        }
        break;
        
      case 'testing':
        if (!output.testResults || !output.coverage) {
          throw new Error(`Testing tool output missing required fields`);
        }
        break;
    }
    
    return output;
  }

  /**
   * Merge tool outputs into a single task output
   */
  private mergeToolOutputs(outputs: Partial<TaskOutput>[], task: MissionTask): TaskOutput {
    const merged: TaskOutput = {
      result: null,
      logs: [],
      metadata: {}
    };

    // Merge results
    for (const output of outputs) {
      if (output.result) {
        merged.result = output.result;
      }
      if (output.logs) {
        merged.logs.push(...output.logs);
      }
      if (output.metadata) {
        merged.metadata = { ...merged.metadata, ...output.metadata };
      }
    }

    return merged;
  }

  /**
   * Process task output for final delivery
   */
  private async processTaskOutput(output: TaskOutput, task: MissionTask): Promise<TaskOutput> {
    // Apply output formatting based on task type
    const formattedOutput = this.formatOutput(output, task);
    
    // Apply quality checks
    const qualityCheckedOutput = await this.applyQualityChecks(formattedOutput, task);
    
    // Apply security validation
    const securityValidatedOutput = await this.applySecurityValidation(qualityCheckedOutput, task);
    
    return securityValidatedOutput;
  }

  /**
   * Format output based on task type
   */
  private formatOutput(output: TaskOutput, task: MissionTask): TaskOutput {
    const formatted = { ...output };
    
    // Add task type context to metadata
    formatted.metadata = {
      ...formatted.metadata,
      taskType: task.type,
      formattedAt: new Date().toISOString()
    };
    
    return formatted;
  }

  /**
   * Apply quality checks to output
   */
  private async applyQualityChecks(output: TaskOutput, task: MissionTask): Promise<TaskOutput> {
    // Check output completeness
    if (!output.result && output.logs.length === 0) {
      output.metadata = {
        ...output.metadata,
        qualityNote: 'Output quality validated - minimal content detected'
      };
    }
    
    return output;
  }

  /**
   * Apply security validation to output
   */
  private async applySecurityValidation(output: TaskOutput, task: MissionTask): Promise<TaskOutput> {
    // Check for sensitive information in metadata
    if (output.metadata) {
      const sanitizedMetadata: Record<string, any> = {};
      for (const [key, value] of Object.entries(output.metadata)) {
        if (typeof value === 'string') {
          sanitizedMetadata[key] = this.sanitizeContent(value);
        } else {
          sanitizedMetadata[key] = value;
        }
      }
      output.metadata = sanitizedMetadata;
    }
    
    return output;
  }

  /**
   * Sanitize content to remove sensitive information
   */
  private sanitizeContent(content: string): string {
    // Remove potential API keys, tokens, etc.
    const sensitivePatterns = [
      /[a-zA-Z0-9]{32,}/g, // Long alphanumeric strings (potential tokens)
      /sk-[a-zA-Z0-9]{20,}/g, // OpenAI-style API keys
      /ghp_[a-zA-Z0-9]{36}/g, // GitHub personal access tokens
      /[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}/g // Credit card patterns
    ];
    
    let sanitized = content;
    for (const pattern of sensitivePatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
    
    return sanitized;
  }

  /**
   * Generate diffs for code changes
   */
  private async generateDiffs(
    task: MissionTask, 
    output: TaskOutput, 
    context: ExecutionContext
  ): Promise<DiffResult[]> {
    const diffs: DiffResult[] = [];
    
    // Only generate diffs for code-related tasks
    if (!['code', 'test', 'deploy'].includes(task.type)) {
      return diffs;
    }

    try {
      // Get current state
      const currentState = await this.getCurrentState(context);
      
      // Extract proposed changes
      const proposedChanges = this.extractProposedChanges(output);
      
      // Generate diffs for each change
      for (const change of proposedChanges) {
        const changes = this.generateDiff(change, currentState);
        if (changes.length > 0) {
          diffs.push({
            before: currentState,
            after: change,
            changes: changes,
            summary: `Generated ${changes.length} changes`
          });
        }
      }
      
    } catch (error) {
      // Log diff generation error but don't fail the task
      await this.auditSystem.logFailure(
        'diff_generation_failed',
        'executor_agent',
        error.message,
        { 
          taskId: task.id,
          error: error.message,
          agentId: this.agentId
        }
      );
    }
    
    return diffs;
  }

  /**
   * Get current state for diff generation
   */
  private async getCurrentState(context: ExecutionContext): Promise<any> {
    // Mock current state - in real implementation, this would fetch from repository
    return {
      files: {},
      branches: ['main', 'develop'],
      lastCommit: 'abc123',
      timestamp: new Date()
    };
  }

  /**
   * Extract proposed changes from task output
   */
  private extractProposedChanges(output: TaskOutput): any[] {
    const changes: any[] = [];
    
    // Extract changes from result
    if (output.result && typeof output.result === 'object') {
      if (Array.isArray(output.result.changes)) {
        changes.push(...output.result.changes);
      } else if (output.result.changes) {
        changes.push(output.result.changes);
      }
    }
    
    // Extract changes from metadata
    if (output.metadata && output.metadata.changes) {
      if (Array.isArray(output.metadata.changes)) {
        changes.push(...output.metadata.changes);
      } else {
        changes.push(output.metadata.changes);
      }
    }
    
    return changes;
  }



  /**
   * Execute a tool call
   */
  async executeToolCall(tool: string, params: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    const callId = `${this.context.taskId}-tool-${Date.now()}`;

    try {
      // Validate tool access
      if (!this.context.tools.includes(tool)) {
        throw new Error(`Tool ${tool} not available in execution context`);
      }

      // Log tool call start
      await auditSystem.logSuccess(
        'tool_call_started',
        tool,
        { 
          tool, 
          params, 
          callId,
          taskId: this.context.taskId,
          agentId: this.context.agentId
        },
        this.context.agentId,
        this.context.taskId
      );

      // Execute tool (placeholder - would integrate with actual tool implementations)
      const result = await this.callTool(tool, params);
      const duration = Date.now() - startTime;

      // Record tool call
      const toolCall: ToolCall = {
        tool,
        params,
        timestamp: startTime,
        result,
        duration
      };
      this.toolCalls.push(toolCall);

      // Log tool call success
      await auditSystem.logSuccess(
        'tool_call_completed',
        tool,
        { 
          tool, 
          callId,
          duration,
          result: typeof result === 'string' ? result.substring(0, 100) : result
        },
        this.context.agentId,
        this.context.taskId
      );

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failed tool call
      const toolCall: ToolCall = {
        tool,
        params,
        timestamp: startTime,
        error: error.message,
        duration
      };
      this.toolCalls.push(toolCall);

      // Log tool call failure
      await auditSystem.logFailure(
        'tool_call_failed',
        tool,
        error.message,
        { 
          tool, 
          callId,
          duration,
          params
        },
        this.context.agentId,
        this.context.taskId
      );

      throw error;
    }
  }

  /**
   * Execute a provider call
   */
  async executeProviderCall(provider: string, method: string, params: Record<string, any>): Promise<any> {
    const startTime = Date.now();
    const callId = `${this.context.taskId}-provider-${Date.now()}`;

    try {
      // Validate provider access
      if (!this.context.providers.includes(provider)) {
        throw new Error(`Provider ${provider} not available in execution context`);
      }

      // Log provider call start
      await auditSystem.logSuccess(
        'provider_call_started',
        provider,
        { 
          provider, 
          method, 
          params, 
          callId,
          taskId: this.context.taskId,
          agentId: this.context.agentId
        },
        this.context.agentId,
        this.context.taskId
      );

      // Execute provider call (placeholder - would integrate with actual provider implementations)
      const result = await this.callProvider(provider, method, params);
      const duration = Date.now() - startTime;

      // Record provider call
      const providerCall: ProviderCall = {
        provider,
        method,
        params,
        timestamp: startTime,
        result,
        duration
      };
      this.providerCalls.push(providerCall);

      // Log provider call success
      await auditSystem.logSuccess(
        'provider_call_completed',
        provider,
        { 
          provider, 
          method,
          callId,
          duration,
          result: typeof result === 'string' ? result.substring(0, 100) : result
        },
        this.context.agentId,
        this.context.taskId
      );

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;

      // Record failed provider call
      const providerCall: ProviderCall = {
        provider,
        method,
        params,
        timestamp: startTime,
        error: error.message,
        duration
      };
      this.providerCalls.push(providerCall);

      // Log provider call failure
      await auditSystem.logFailure(
        'provider_call_failed',
        provider,
        error.message,
        { 
          provider, 
          method,
          callId,
          duration,
          params
        },
        this.context.agentId,
        this.context.taskId
      );

      throw error;
    }
  }

  /**
   * Track changes between two states
   */
  async trackChanges(before: any, after: any, description: string): Promise<DiffResult> {
    try {
      const changes = this.generateDiff(before, after);
      
      const diffResult: DiffResult = {
        before,
        after,
        changes: changes,
        summary: description
      };

      // Store diff
      this.diffs.push(diffResult);

      // Log change tracking
      await this.auditSystem.logSuccess(
        'changes_tracked',
        'executor_agent',
        {
          description,
          changeCount: changes.length,
          agentId: this.agentId
        }
      );

      return diffResult;

    } catch (error) {
      console.error('Error tracking changes:', error);
      
      // Return empty diff on error
      return {
        before,
        after,
        changes: [],
        summary: `Error tracking changes: ${error.message}`
      };
    }
  }

  /**
   * Get execution summary
   */
  getExecutionSummary(): {
    toolCalls: number;
    providerCalls: number;
    diffs: number;
    totalDuration: number;
  } {
    const totalDuration = this.toolCalls.reduce((sum, call) => sum + call.duration, 0) +
                         this.providerCalls.reduce((sum, call) => sum + call.duration, 0);

    return {
      toolCalls: this.toolCalls.length,
      providerCalls: this.providerCalls.length,
      diffs: this.diffs.length,
      totalDuration
    };
  }

  /**
   * Call tool implementation (placeholder)
   */
  private async callTool(tool: string, params: Record<string, any>): Promise<any> {
    // This would integrate with actual tool implementations
    // For now, return a mock result
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
    
    return {
      tool,
      params,
      result: `Mock result from ${tool}`,
      timestamp: Date.now()
    };
  }

  /**
   * Call provider implementation (placeholder)
   */
  private async callProvider(provider: string, method: string, params: Record<string, any>): Promise<any> {
    // This would integrate with actual provider implementations
    // For now, return a mock result
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing time
    
    return {
      provider,
      method,
      params,
      result: `Mock result from ${provider}.${method}`,
      timestamp: Date.now()
    };
  }

  /**
   * Generate diff between two states
   */
  private generateDiff(before: any, after: any): DiffChange[] {
    const changes: DiffChange[] = [];
    
    if (!before || !after || typeof before !== 'object' || typeof after !== 'object') {
      return changes;
    }

    // Simple object diff
    for (const [key, value] of Object.entries(after)) {
      if (before[key] !== value) {
        changes.push({
          path: key,
          type: before[key] === undefined ? 'added' : 'modified',
          oldValue: before[key],
          newValue: value
        });
      }
    }

    // Check for removed properties
    for (const key of Object.keys(before)) {
      if (!(key in after)) {
        changes.push({
          path: key,
          type: 'removed',
          oldValue: before[key],
          newValue: undefined
        });
      }
    }

    return changes;
  }
}

// Export default configuration
export const defaultExecutionContext: ExecutionContext = {
  agentId: '',
  taskId: '',
  tools: ['github', 'rag', 'sse', 'http'],
  providers: ['petals', 'tinygrad', 'wondercraft'],
  maxRetries: 3,
  timeout: 30000 // 30 seconds
};
