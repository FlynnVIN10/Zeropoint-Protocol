/**
 * GitHub Tool - Repository access and PR creation for Synthiant agents
 * 
 * @fileoverview Provides GitHub integration capabilities for Synthiant agents
 * @author Dev Team
 * @version 1.0.0
 */

import { ToolInterface, ResourceUsage } from './index';

export interface GitHubToolParams {
  action: 'read' | 'write' | 'create_pr' | 'review' | 'merge';
  repository: string;
  path?: string;
  content?: string;
  branch?: string;
  title?: string;
  body?: string;
  labels?: string[];
}

export interface GitHubResponse {
  success: boolean;
  data?: any;
  error?: string;
  quotaUsage: ResourceUsage;
}

/**
 * GitHub Tool Implementation
 * Provides safe GitHub operations for Synthiant agents
 */
export class GitHubTool implements ToolInterface {
  public readonly name = 'github';
  public readonly version = '1.0.0';
  public readonly description = 'GitHub repository operations and PR management';
  public readonly capabilities = ['read', 'write', 'create_pr', 'review', 'merge'];

  private apiToken: string;
  private baseUrl: string;
  private rateLimitRemaining: number = 5000;
  private rateLimitReset: number = 0;

  constructor() {
    this.apiToken = process.env.GITHUB_TOKEN || '';
    this.baseUrl = 'https://api.github.com';
    
    if (!this.apiToken) {
      console.warn('GitHub token not configured - tool will be limited');
    }
  }

  /**
   * Execute GitHub operation
   */
  async execute(params: GitHubToolParams): Promise<GitHubResponse> {
    try {
      // Validate parameters
      if (!this.validateParams(params)) {
        throw new Error('Invalid parameters provided');
      }

      // Check rate limits
      await this.checkRateLimit();

      // Execute based on action
      let result: any;
      const startTime = Date.now();

      switch (params.action) {
        case 'read':
          result = await this.readRepository(params);
          break;
        case 'write':
          result = await this.writeRepository(params);
          break;
        case 'create_pr':
          result = await this.createPullRequest(params);
          break;
        case 'review':
          result = await this.reviewPullRequest(params);
          break;
        case 'merge':
          result = await this.mergePullRequest(params);
          break;
        default:
          throw new Error(`Unsupported action: ${params.action}`);
      }

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result,
        quotaUsage: this.calculateQuotaUsage(executionTime, params.action)
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        quotaUsage: this.calculateQuotaUsage(0, params.action)
      };
    }
  }

  /**
   * Validate tool parameters
   */
  validateParams(params: GitHubToolParams): boolean {
    if (!params.action || !this.capabilities.includes(params.action)) {
      return false;
    }

    if (!params.repository || typeof params.repository !== 'string') {
      return false;
    }

    // Validate repository format (owner/repo)
    if (!params.repository.includes('/') || params.repository.split('/').length !== 2) {
      return false;
    }

    // Validate required fields for specific actions
    switch (params.action) {
      case 'create_pr':
        if (!params.title || !params.body || !params.branch) {
          return false;
        }
        break;
      case 'write':
        if (!params.path || !params.content || !params.branch) {
          return false;
        }
        break;
    }

    return true;
  }

  /**
   * Get current quota usage
   */
  getQuotaUsage(): ResourceUsage {
    return {
      memory: 50, // 50MB base usage
      cpu: 0.1,   // 0.1 CPU cores
      time: 0,    // Will be calculated per execution
      tokens: 0,  // Will be calculated per execution
      network: 0, // Will be calculated per execution
      fileOps: 0  // Will be calculated per execution
    };
  }

  /**
   * Read repository content
   */
  private async readRepository(params: GitHubToolParams): Promise<any> {
    const [owner, repo] = params.repository.split('/');
    const path = params.path || '';
    
    const url = path ? 
      `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}` :
      `${this.baseUrl}/repos/${owner}/${repo}`;

    const response = await this.makeRequest(url, 'GET');
    
    if (response.status === 404) {
      throw new Error(`Path not found: ${path}`);
    }

    return response.data;
  }

  /**
   * Write to repository
   */
  private async writeRepository(params: GitHubToolParams): Promise<any> {
    const [owner, repo] = params.repository.split('/');
    const { path, content, branch } = params;

    if (!path || !content || !branch) {
      throw new Error('Path, content, and branch are required for write operations');
    }

    // Get current file SHA if it exists
    let sha: string | undefined;
    try {
      const currentFile = await this.readRepository({
        action: 'read',
        repository: params.repository,
        path
      });
      sha = currentFile.sha;
    } catch (error) {
      // File doesn't exist, that's fine
    }

    const payload = {
      message: `Update ${path} via Synthiant agent`,
      content: Buffer.from(content).toString('base64'),
      branch,
      ...(sha && { sha })
    };

    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    const response = await this.makeRequest(url, 'PUT', payload);

    return response.data;
  }

  /**
   * Create pull request
   */
  private async createPullRequest(params: GitHubToolParams): Promise<any> {
    const [owner, repo] = params.repository;
    const { title, body, branch } = params;

    if (!title || !body || !branch) {
      throw new Error('Title, body, and branch are required for PR creation');
    }

    const payload = {
      title,
      body,
      head: branch,
      base: 'main' // Default base branch
    };

    const url = `${this.baseUrl}/repos/${owner}/${repo}/pulls`;
    const response = await this.makeRequest(url, 'POST', payload);

    return response.data;
  }

  /**
   * Review pull request
   */
  private async reviewPullRequest(params: GitHubToolParams): Promise<any> {
    const [owner, repo] = params.repository;
    const { body } = params;

    if (!body) {
      throw new Error('Review body is required');
    }

    // This is a simplified review - in practice, you'd need the PR number
    const payload = {
      body,
      event: 'COMMENT' // Could be APPROVE, REQUEST_CHANGES, or COMMENT
    };

    // Note: This would need the actual PR number from params
    throw new Error('PR review requires PR number - not implemented in this version');
  }

  /**
   * Merge pull request
   */
  private async mergePullRequest(params: GitHubToolParams): Promise<any> {
    const [owner, repo] = params.repository;

    // Note: This would need the actual PR number from params
    throw new Error('PR merge requires PR number - not implemented in this version');
  }

  /**
   * Make HTTP request to GitHub API
   */
  private async makeRequest(url: string, method: string, body?: any): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Synthiant-Agent/1.0.0'
    };

    if (this.apiToken) {
      headers['Authorization'] = `token ${this.apiToken}`;
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    };

    const response = await fetch(url, options);

    // Update rate limit info
    this.updateRateLimitInfo(response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
    }

    return response;
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(): Promise<void> {
    if (this.rateLimitRemaining <= 0) {
      const now = Date.now();
      if (now < this.rateLimitReset) {
        const waitTime = Math.ceil((this.rateLimitReset - now) / 1000);
        throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
      }
    }
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: Response): void {
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }

    if (reset) {
      this.rateLimitReset = parseInt(reset, 10) * 1000; // Convert to milliseconds
    }
  }

  /**
   * Calculate quota usage for this operation
   */
  private calculateQuotaUsage(executionTime: number, action: string): ResourceUsage {
    const baseUsage = this.getQuotaUsage();
    
    // Adjust based on action complexity
    let multiplier = 1;
    switch (action) {
      case 'read':
        multiplier = 1;
        break;
      case 'write':
        multiplier = 2;
        break;
      case 'create_pr':
        multiplier = 3;
        break;
      case 'review':
        multiplier = 1.5;
        break;
      case 'merge':
        multiplier = 2;
        break;
    }

    return {
      memory: baseUsage.memory * multiplier,
      cpu: baseUsage.cpu * multiplier,
      time: executionTime,
      tokens: Math.ceil(executionTime / 1000 * 10), // Estimate tokens based on time
      network: Math.ceil(executionTime / 1000 * 0.1), // Estimate network usage
      fileOps: action === 'write' ? 1 : 0
    };
  }
}
