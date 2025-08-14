/**
 * Petals Provider Adapter - Federated Learning Integration
 *
 * @fileoverview Provides secure integration with Petals federated learning system
 * @author Dev Team
 * @version 1.0.0
 */

export interface PetalsConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  enableRedaction: boolean;
  redactionPatterns: RegExp[];
  maxPayloadSize: number;
  enableCompression: boolean;
  userAgent: string;
}

export interface PetalsRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface PetalsResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  responseTime: number;
  retryCount: number;
}

export interface PetalsModel {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  status: "active" | "inactive" | "training" | "error";
  lastUpdated: number;
}

export interface PetalsTrainingJob {
  id: string;
  modelId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  startTime: number;
  endTime?: number;
  error?: string;
}

/**
 * Petals Provider Adapter
 * Provides secure integration with Petals federated learning system
 */
export class PetalsProvider {
  private config: PetalsConfig;
  private isEnabled: boolean;
  private requestCount: number = 0;
  private lastReset: number = Date.now();
  private activeJobs: Map<string, PetalsTrainingJob> = new Map();

  constructor(config?: Partial<PetalsConfig>) {
    this.config = {
      baseUrl: process.env.PETALS_BASE_URL || "https://api.petals.dev",
      apiKey: process.env.PETALS_API_KEY || "",
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      enableRedaction: true,
      redactionPatterns: [
        /password/i,
        /token/i,
        /secret/i,
        /key/i,
        /credential/i,
        /auth/i,
      ],
      maxPayloadSize: 10 * 1024 * 1024, // 10MB
      enableCompression: true,
      userAgent: "Zeropoint-Petals/1.0.0",
      ...config,
    };

    // Check if Petals is enabled
    this.isEnabled =
      process.env.ENABLE_PETALS === "true" && !!this.config.apiKey;

    if (this.isEnabled) {
      console.log("Petals provider enabled and configured");
    } else {
      console.log("Petals provider disabled or not configured");
    }
  }

  /**
   * Check if Petals is enabled
   */
  isPetalsEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Make a request to Petals API
   */
  async request(request: PetalsRequest): Promise<PetalsResponse> {
    if (!this.isEnabled) {
      throw new Error("Petals provider is disabled");
    }

    try {
      // Validate request
      this.validateRequest(request);

      // Check payload size
      this.checkPayloadSize(request.data);

      // Redact sensitive data if enabled
      const redactedData = this.config.enableRedaction
        ? this.redactSensitiveData(request.data)
        : request.data;

      // Execute request with retry logic
      const response = await this.executeWithRetry(request, redactedData);

      // Update request count
      this.requestCount++;

      return response;
    } catch (error) {
      console.error("Petals request failed:", error);
      throw error;
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<PetalsModel[]> {
    if (!this.isEnabled) {
      throw new Error("Petals provider is disabled");
    }

    const response = await this.request({
      method: "GET",
      endpoint: "/models",
    });

    if (!response.success) {
      throw new Error(`Failed to get models: ${response.error}`);
    }

    return response.data || [];
  }

  /**
   * Start a training job
   */
  async startTraining(modelId: string, trainingData: any): Promise<string> {
    if (!this.isEnabled) {
      throw new Error("Petals provider is disabled");
    }

    const response = await this.request({
      method: "POST",
      endpoint: "/training/start",
      data: {
        modelId,
        trainingData: this.config.enableRedaction
          ? this.redactSensitiveData(trainingData)
          : trainingData,
      },
    });

    if (!response.success) {
      throw new Error(`Failed to start training: ${response.error}`);
    }

    const jobId = response.data?.jobId;
    if (!jobId) {
      throw new Error("No job ID returned from training start");
    }

    // Track active job
    this.activeJobs.set(jobId, {
      id: jobId,
      modelId,
      status: "pending",
      progress: 0,
      startTime: Date.now(),
    });

    return jobId;
  }

  /**
   * Get training job status
   */
  async getTrainingStatus(jobId: string): Promise<PetalsTrainingJob | null> {
    if (!this.isEnabled) {
      throw new Error("Petals provider is disabled");
    }

    const response = await this.request({
      method: "GET",
      endpoint: `/training/status/${jobId}`,
    });

    if (!response.success) {
      throw new Error(`Failed to get training status: ${response.error}`);
    }

    const job = response.data;
    if (job) {
      // Update local tracking
      this.activeJobs.set(jobId, job);
    }

    return job || null;
  }

  /**
   * Cancel a training job
   */
  async cancelTraining(jobId: string): Promise<boolean> {
    if (!this.isEnabled) {
      throw new Error("Petals provider is disabled");
    }

    const response = await this.request({
      method: "POST",
      endpoint: `/training/cancel/${jobId}`,
    });

    if (response.success) {
      // Update local tracking
      const job = this.activeJobs.get(jobId);
      if (job) {
        job.status = "failed";
        job.error = "Cancelled by user";
        this.activeJobs.set(jobId, job);
      }
    }

    return response.success;
  }

  /**
   * Validate request parameters
   */
  private validateRequest(request: PetalsRequest): void {
    if (!request || typeof request !== "object") {
      throw new Error("Invalid request object");
    }

    if (
      !request.method ||
      !["GET", "POST", "PUT", "DELETE"].includes(request.method)
    ) {
      throw new Error("Invalid HTTP method");
    }

    if (!request.endpoint || typeof request.endpoint !== "string") {
      throw new Error("Invalid endpoint");
    }

    if (
      request.timeout &&
      (typeof request.timeout !== "number" || request.timeout <= 0)
    ) {
      throw new Error("Invalid timeout value");
    }
  }

  /**
   * Check payload size
   */
  private checkPayloadSize(data: any): void {
    if (!data) return;

    const payloadSize = JSON.stringify(data).length;
    if (payloadSize > this.config.maxPayloadSize) {
      throw new Error(
        `Payload size ${payloadSize} exceeds maximum allowed size ${this.config.maxPayloadSize}`,
      );
    }
  }

  /**
   * Redact sensitive data
   */
  private redactSensitiveData(data: any): any {
    if (!data || typeof data !== "object") {
      return data;
    }

    const redacted = JSON.parse(JSON.stringify(data));
    this.redactObject(redacted);
    return redacted;
  }

  /**
   * Recursively redact sensitive data from object
   */
  private redactObject(obj: any): void {
    if (!obj || typeof obj !== "object") {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null) {
        this.redactObject(value);
      } else if (typeof value === "string") {
        // Check if key matches redaction patterns
        for (const pattern of this.config.redactionPatterns) {
          if (pattern.test(key)) {
            obj[key] = "[REDACTED]";
            break;
          }
        }
      }
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(
    request: PetalsRequest,
    data: any,
  ): Promise<PetalsResponse> {
    let lastError: Error | null = null;
    let retryCount = 0;

    while (retryCount <= this.config.maxRetries) {
      try {
        const startTime = Date.now();

        const response = await this.executeRequest(request, data);

        return {
          success: true,
          data: response,
          statusCode: 200,
          responseTime: Date.now() - startTime,
          retryCount,
        };
      } catch (error) {
        lastError = error as Error;
        retryCount++;

        if (retryCount <= this.config.maxRetries) {
          // Wait before retry with exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, retryCount - 1);
          await this.sleep(delay);
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || "Request failed after all retries",
      statusCode: 0,
      responseTime: 0,
      retryCount,
    };
  }

  /**
   * Execute the actual HTTP request
   */
  private async executeRequest(
    request: PetalsRequest,
    data: any,
  ): Promise<any> {
    const url = `${this.config.baseUrl}${request.endpoint}`;
    const timeout = request.timeout || this.config.timeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: request.method,
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "User-Agent": this.config.userAgent,
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": this.config.enableCompression
            ? "gzip, deflate"
            : "identity",
          ...request.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get provider statistics
   */
  getStats(): {
    isEnabled: boolean;
    totalRequests: number;
    activeJobs: number;
    config: Partial<PetalsConfig>;
  } {
    return {
      isEnabled: this.isEnabled,
      totalRequests: this.requestCount,
      activeJobs: this.activeJobs.size,
      config: {
        baseUrl: this.config.baseUrl,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
        enableRedaction: this.config.enableRedaction,
        maxPayloadSize: this.config.maxPayloadSize,
      },
    };
  }

  /**
   * Get active training jobs
   */
  getActiveJobs(): PetalsTrainingJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PetalsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Re-check if enabled
    this.isEnabled =
      process.env.ENABLE_PETALS === "true" && !!this.config.apiKey;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.activeJobs.clear();
  }
}

// Export default instance
export const petalsProvider = new PetalsProvider();
