/**
 * Synthiant Tools - Main index file
 * 
 * @fileoverview Exports all available tools for Synthiant agents
 * @author Dev Team
 * @version 1.0.0
 */

// Core tool interfaces
export interface ToolInterface {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  execute(params: any): Promise<any>;
  validateParams(params: any): boolean;
  getQuotaUsage(): ResourceUsage;
}

export interface ResourceUsage {
  memory: number;
  cpu: number;
  time: number;
  tokens: number;
  network: number;
  fileOps: number;
}

// Tool implementations
export { GitHubTool } from './github.tool';
export { RAGTool } from './rag.tool';
export { SSETool } from './sse.tool';
export { HTTPTool } from './http.tool';
export { ShellDenylistTool } from './shell-denylist.tool';

// Tool registry
export class ToolRegistry {
  private tools: Map<string, ToolInterface> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  /**
   * Register a tool
   */
  registerTool(tool: ToolInterface): void {
    this.tools.set(tool.name, tool);
    console.log(`Registered tool: ${tool.name} v${tool.version}`);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): ToolInterface | undefined {
    return this.tools.get(name);
  }

  /**
   * List all available tools
   */
  listTools(): ToolInterface[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if tool is available
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Register default tools
   */
  private registerDefaultTools(): void {
    // Import and register default tools
    import('./github.tool').then(({ GitHubTool }) => {
      this.registerTool(new GitHubTool());
    }).catch(console.error);

    import('./rag.tool').then(({ RAGTool }) => {
      this.registerTool(new RAGTool());
    }).catch(console.error);

    import('./sse.tool').then(({ SSETool }) => {
      this.registerTool(new SSETool());
    }).catch(console.error);

    import('./http.tool').then(({ HTTPTool }) => {
      this.registerTool(new HTTPTool());
    }).catch(console.error);

    import('./shell-denylist.tool').then(({ ShellDenylistTool }) => {
      this.registerTool(new ShellDenylistTool());
    }).catch(console.error);
  }

  /**
   * Get tool statistics
   */
  getToolStats(): {
    totalTools: number;
    toolNames: string[];
    totalMemoryUsage: number;
    totalCPUUsage: number;
  } {
    const tools = this.listTools();
    const totalMemoryUsage = tools.reduce((sum, tool) => sum + tool.getQuotaUsage().memory, 0);
    const totalCPUUsage = tools.reduce((sum, tool) => sum + tool.getQuotaUsage().cpu, 0);

    return {
      totalTools: tools.length,
      toolNames: tools.map(t => t.name),
      totalMemoryUsage,
      totalCPUUsage
    };
  }

  /**
   * Validate tool parameters
   */
  validateToolParams(toolName: string, params: any): boolean {
    const tool = this.getTool(toolName);
    if (!tool) {
      return false;
    }
    return tool.validateParams(params);
  }

  /**
   * Execute tool with validation
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    const tool = this.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    if (!tool.validateParams(params)) {
      throw new Error(`Invalid parameters for tool: ${toolName}`);
    }

    return await tool.execute(params);
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();
