/**
 * HTTP Tool - HTTP client for Synthiant agents
 * 
 * @fileoverview Provides secure HTTP client capabilities with rate limiting and security features
 * @author Dev Team
 * @version 1.0.0
 */

import { ToolInterface, ResourceUsage } from './index';

export interface HTTPConfig {
  maxRequestSize: number;
  maxResponseSize: number;
  timeout: number;
  maxRedirects: number;
  rateLimitPerMinute: number;
  allowedDomains: string[];
  deniedDomains: string[];
  enableCompression: boolean;
  userAgent: string;
}

export interface HTTPRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface HTTPResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  url: string;
  responseTime: number;
}

export interface HTTPStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

/**
 * HTTP Tool Implementation
 * Provides secure HTTP client capabilities with comprehensive security features
 */
export class HTTPTool implements ToolInterface {
  public readonly name = 'http';
  public readonly version = '1.0.0';
  public readonly description = 'HTTP client tool with security features and rate limiting';
  public readonly capabilities = ['http', 'https', 'api', 'rest', 'fetch'];

  private config: HTTPConfig;
  private requestCount: number = 0;
  private lastReset: number = Date.now();
  private stats: HTTPStats;
  private requestHistory: Array<{ timestamp: number; url: string; status: number }> = [];

  constructor(config?: Partial<HTTPConfig>) {
    this.config = {
      maxRequestSize: 10 * 1024 * 1024, // 10MB
      maxResponseSize: 50 * 1024 * 1024, // 50MB
      timeout: 30000, // 30 seconds
      maxRedirects: 5,
      rateLimitPerMinute: 100,
      allowedDomains: ['api.zeropointprotocol.ai', 'github.com', 'api.github.com'],
      deniedDomains: ['localhost', '127.0.0.1', '0.0.0.0', '10.0.0.0', '192.168.0.0'],
      enableCompression: true,
      userAgent: 'Synthiant-HTTP/1.0.0',
      ...config
    };

    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTime: 0
    };
  }

  /**
   * Execute HTTP request
   */
  async execute(params: HTTPRequest): Promise<HTTPResponse> {
    try {
      // Validate parameters
      if (!this.validateParams(params)) {
        throw new Error('Invalid HTTP request parameters');
      }

      // Check rate limits
      this.checkRateLimit();

      // Validate URL security
      this.validateUrlSecurity(params.url);

      // Check request size
      this.checkRequestSize(params);

      // Execute request
      const startTime = Date.now();
      const response = await this.performRequest(params);
      const responseTime = Date.now() - startTime;

      // Update statistics
      this.updateStats(response.status, responseTime);

      // Add to history
      this.addToHistory(params.url, response.status);

      return {
        ...response,
        responseTime
      };

    } catch (error) {
      console.error('HTTP tool execution failed:', error);
      this.updateStats(0, 0); // Failed request
      throw error;
    }
  }

  /**
   * Validate request parameters
   */
  validateParams(params: any): boolean {
    if (!params || typeof params !== 'object') {
      return false;
    }

    if (!params.method || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(params.method)) {
      return false;
    }

    if (!params.url || typeof params.url !== 'string') {
      return false;
    }

    try {
      new URL(params.url);
    } catch {
      return false;
    }

    if (params.timeout && (typeof params.timeout !== 'number' || params.timeout <= 0)) {
      return false;
    }

    if (params.headers && typeof params.headers !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * Get current resource usage
   */
  getQuotaUsage(): ResourceUsage {
    return {
      memory: this.requestHistory.length * 0.01, // 0.01MB per request
      cpu: 0.1, // Low CPU usage for HTTP operations
      time: 0,
      tokens: this.requestCount * 50, // 50 tokens per request
      network: this.requestCount * 0.1, // 0.1MB per request
      fileOps: 0
    };
  }

  /**
   * Validate URL security
   */
  private validateUrlSecurity(url: string): void {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check denied domains
    for (const deniedDomain of this.config.deniedDomains) {
      if (hostname === deniedDomain || hostname.endsWith(`.${deniedDomain}`)) {
        throw new Error(`Access denied to domain: ${hostname}`);
      }
    }

    // Check allowed domains (if configured)
    if (this.config.allowedDomains.length > 0) {
      let allowed = false;
      for (const allowedDomain of this.config.allowedDomains) {
        if (hostname === allowedDomain || hostname.endsWith(`.${allowedDomain}`)) {
          allowed = true;
          break;
        }
      }
      if (!allowed) {
        throw new Error(`Domain not in allowed list: ${hostname}`);
      }
    }

    // Check for local/private IP addresses
    if (urlObj.protocol === 'http:' && !this.isPublicDomain(hostname)) {
      throw new Error(`HTTP requests to non-public domains not allowed: ${hostname}`);
    }
  }

  /**
   * Check if domain is public
   */
  private isPublicDomain(hostname: string): boolean {
    // Simple check for common public domains
    const publicSuffixes = ['.com', '.org', '.net', '.edu', '.gov', '.ai', '.io', '.dev'];
    return publicSuffixes.some(suffix => hostname.endsWith(suffix));
  }

  /**
   * Check request size
   */
  private checkRequestSize(params: HTTPRequest): void {
    let size = 0;

    // URL size
    size += params.url.length;

    // Headers size
    if (params.headers) {
      size += JSON.stringify(params.headers).length;
    }

    // Body size
    if (params.body) {
      if (typeof params.body === 'string') {
        size += params.body.length;
      } else {
        size += JSON.stringify(params.body).length;
      }
    }

    if (size > this.config.maxRequestSize) {
      throw new Error(`Request size ${size} exceeds maximum allowed size ${this.config.maxRequestSize}`);
    }
  }

  /**
   * Perform HTTP request
   */
  private async performRequest(params: HTTPRequest): Promise<HTTPResponse> {
    const timeout = params.timeout || this.config.timeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(params.url, {
        method: params.method,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json, text/plain, */*',
          'Accept-Encoding': this.config.enableCompression ? 'gzip, deflate' : 'identity',
          ...params.headers
        },
        body: params.body ? JSON.stringify(params.body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Check response size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > this.config.maxResponseSize) {
        throw new Error(`Response size ${contentLength} exceeds maximum allowed size ${this.config.maxResponseSize}`);
      }

      // Parse response body
      let body: any;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        body = await response.json();
      } else if (contentType.includes('text/')) {
        body = await response.text();
      } else {
        body = await response.arrayBuffer();
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body,
        url: response.url
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): void {
    const now = Date.now();
    const minuteAgo = now - (60 * 1000);

    // Reset counter if minute has passed
    if (now - this.lastReset > 60 * 1000) {
      this.requestCount = 0;
      this.lastReset = now;
    }

    // Check if rate limit exceeded
    if (this.requestCount >= this.config.rateLimitPerMinute) {
      throw new Error(`Rate limit exceeded: ${this.config.rateLimitPerMinute} requests per minute`);
    }

    this.requestCount++;
  }

  /**
   * Update statistics
   */
  private updateStats(status: number, responseTime: number): void {
    this.stats.totalRequests++;
    this.stats.lastRequestTime = Date.now();

    if (status >= 200 && status < 400) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // Update average response time
    const totalTime = this.stats.averageResponseTime * (this.stats.totalRequests - 1) + responseTime;
    this.stats.averageResponseTime = totalTime / this.stats.totalRequests;
  }

  /**
   * Add request to history
   */
  private addToHistory(url: string, status: number): void {
    this.requestHistory.push({
      timestamp: Date.now(),
      url,
      status
    });

    // Keep only last 1000 requests
    if (this.requestHistory.length > 1000) {
      this.requestHistory = this.requestHistory.slice(-1000);
    }
  }

  /**
   * Get tool statistics
   */
  getStats(): HTTPStats {
    return { ...this.stats };
  }

  /**
   * Get request history
   */
  getRequestHistory(limit: number = 100): Array<{ timestamp: number; url: string; status: number }> {
    return this.requestHistory.slice(-limit);
  }

  /**
   * Clear request history
   */
  clearHistory(): void {
    this.requestHistory = [];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HTTPConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Test connectivity to a domain
   */
  async testConnectivity(domain: string): Promise<{ reachable: boolean; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://${domain}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        reachable: response.ok,
        responseTime
      };
    } catch (error) {
      return {
        reachable: false,
        responseTime: Date.now() - startTime
      };
    }
  }
}

// Export default instance
export const httpTool = new HTTPTool();

