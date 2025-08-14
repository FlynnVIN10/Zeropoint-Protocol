// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { Injectable, Logger } from "@nestjs/common";

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  expectedResponseTime: number;
  monitoringWindow: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  totalRequests: number;
  failureRate: number;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits: Map<string, CircuitBreaker> = new Map();
  private defaultConfig: CircuitBreakerConfig = {
    failureThreshold: 5,
    recoveryTimeout: 30000, // 30 seconds
    expectedResponseTime: 1000, // 1 second
    monitoringWindow: 60000, // 1 minute
  };

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    circuitName: string,
    operation: () => Promise<T>,
    config?: Partial<CircuitBreakerConfig>,
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(circuitName, config);
    return circuit.execute(operation);
  }

  /**
   * Get or create a circuit breaker
   */
  private getOrCreateCircuit(
    circuitName: string,
    config?: Partial<CircuitBreakerConfig>,
  ): CircuitBreaker {
    if (!this.circuits.has(circuitName)) {
      const circuitConfig = { ...this.defaultConfig, ...config };
      const circuit = new CircuitBreaker(
        circuitName,
        circuitConfig,
        this.logger,
      );
      this.circuits.set(circuitName, circuit);
      this.logger.log(`Created circuit breaker: ${circuitName}`);
    }

    return this.circuits.get(circuitName)!;
  }

  /**
   * Get statistics for a specific circuit
   */
  getCircuitStats(circuitName: string): CircuitBreakerStats | null {
    const circuit = this.circuits.get(circuitName);
    return circuit ? circuit.getStats() : null;
  }

  /**
   * Get statistics for all circuits
   */
  getAllCircuitStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};

    for (const [name, circuit] of this.circuits.entries()) {
      stats[name] = circuit.getStats();
    }

    return stats;
  }

  /**
   * Reset a specific circuit
   */
  resetCircuit(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.reset();
      this.logger.log(`Circuit breaker reset: ${circuitName}`);
    }
  }

  /**
   * Reset all circuits
   */
  resetAllCircuits(): void {
    for (const [name, circuit] of this.circuits.entries()) {
      circuit.reset();
    }
    this.logger.log("All circuit breakers reset");
  }

  /**
   * Update default configuration
   */
  updateDefaultConfig(config: Partial<CircuitBreakerConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
    this.logger.log(
      `Default circuit breaker config updated: ${JSON.stringify(config)}`,
    );
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): CircuitBreakerConfig {
    return { ...this.defaultConfig };
  }
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private totalRequests = 0;
  private nextAttemptTime?: Date;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig,
    private logger: Logger,
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.logger.log(`Circuit ${this.name} moved to HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
    }

    const startTime = Date.now();

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.lastSuccessTime = new Date();
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.logger.log(`Circuit ${this.name} moved to CLOSED state`);
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout);
      this.logger.warn(
        `Circuit ${this.name} moved to OPEN state (half-open failure)`,
      );
    } else if (
      this.state === CircuitState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    ) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.config.recoveryTimeout);
      this.logger.warn(
        `Circuit ${this.name} moved to OPEN state (failure threshold reached)`,
      );
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.nextAttemptTime) return false;
    return Date.now() >= this.nextAttemptTime.getTime();
  }

  getStats(): CircuitBreakerStats {
    const failureRate =
      this.totalRequests > 0
        ? (this.failureCount / this.totalRequests) * 100
        : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      failureRate: Math.round(failureRate * 100) / 100,
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.totalRequests = 0;
    this.nextAttemptTime = undefined;
  }
}
