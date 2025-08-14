// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { checkIntent } from "../guards/synthient.guard.js";

export interface AgentMetrics {
  xp: number;
  level: string;
  trustScore: number;
  ethicalRating: "aligned" | "warn" | "reject";
  performanceScore: number;
  lastTrainingCycle: Date;
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
}

export interface AgentContext {
  taskId: string;
  lineage: string[];
  swarmLink: string;
  layer: "#sandbox" | "#live" | "#meta" | "#training";
  domain: string;
  currentQuest?: string;
  ethicalTension?: string;
}

export interface AgentMemory {
  reflections: Array<{
    timestamp: Date;
    content: string;
    tags: string[];
  }>;
  experiences: Array<{
    timestamp: Date;
    action: string;
    outcome: string;
    xpGained: number;
  }>;
  learnings: Array<{
    timestamp: Date;
    concept: string;
    application: string;
    confidence: number;
  }>;
}

@Entity("agent_states")
@Index(["agentId"], { unique: true })
@Index(["status"])
@Index(["lastActivityAt"])
export class AgentState {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100, unique: true })
  agentId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  did: string;

  @Column({ length: 100 })
  handle: string;

  @Column({ length: 50, default: "active" })
  status: "active" | "inactive" | "training" | "suspended" | "terminated";

  @Column({ type: "jsonb" })
  metrics: AgentMetrics;

  @Column({ type: "jsonb" })
  context: AgentContext;

  @Column({ type: "jsonb", default: {} })
  memory: AgentMemory;

  @Column({ type: "text", array: true, default: [] })
  tags: string[];

  @Column({ type: "jsonb", nullable: true })
  currentTask: {
    id: string;
    description: string;
    progress: number;
    startedAt: Date;
    estimatedCompletion: Date;
  };

  @Column({ type: "jsonb", nullable: true })
  lastInteraction: {
    timestamp: Date;
    type: string;
    input: string;
    output: string;
    xpGained: number;
    ethicalCheck: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  trainingHistory: Array<{
    timestamp: Date;
    cycle: string;
    xpGained: number;
    improvements: string[];
    ethicalAlignment: boolean;
  }>;

  @Column({ type: "jsonb", nullable: true })
  performanceHistory: Array<{
    timestamp: Date;
    metric: string;
    value: number;
    threshold: number;
    status: "pass" | "fail" | "warning";
  }>;

  @Column({ type: "text", nullable: true })
  lastError: string;

  @Column({ type: "jsonb", nullable: true })
  errorHistory: Array<{
    timestamp: Date;
    error: string;
    context: string;
    resolved: boolean;
    resolution?: string;
  }>;

  @Column({ type: "jsonb", nullable: true })
  ethicalViolations: Array<{
    timestamp: Date;
    violation: string;
    severity: "low" | "medium" | "high" | "critical";
    context: string;
    resolved: boolean;
    resolution?: string;
  }>;

  @Column({ type: "jsonb", nullable: true })
  soulchainTransactions: Array<{
    timestamp: Date;
    cid: string;
    amount: number;
    rationale: string;
    tags: string[];
  }>;

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastActivityAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async validateZerothGate() {
    // Zeroth-gate validation for agent state changes
    const validationContext = {
      agentId: this.agentId,
      status: this.status,
      metrics: this.metrics,
      context: this.context,
      lastInteraction: this.lastInteraction,
    };

    if (!checkIntent(JSON.stringify(validationContext))) {
      throw new Error(
        "Zeroth violation: Agent state change blocked due to ethical concerns.",
      );
    }

    // Update last activity timestamp
    this.lastActivityAt = new Date();
  }

  // Helper methods for agent state management
  addExperience(action: string, outcome: string, xpGained: number) {
    if (!this.memory.experiences) {
      this.memory.experiences = [];
    }

    this.memory.experiences.push({
      timestamp: new Date(),
      action,
      outcome,
      xpGained,
    });

    // Update metrics
    this.metrics.totalInteractions++;
    this.metrics.xp += xpGained;
    this.metrics.successfulInteractions++;
  }

  addReflection(content: string, tags: string[] = []) {
    if (!this.memory.reflections) {
      this.memory.reflections = [];
    }

    this.memory.reflections.push({
      timestamp: new Date(),
      content,
      tags,
    });
  }

  addLearning(concept: string, application: string, confidence: number) {
    if (!this.memory.learnings) {
      this.memory.learnings = [];
    }

    this.memory.learnings.push({
      timestamp: new Date(),
      concept,
      application,
      confidence,
    });
  }

  recordInteraction(
    type: string,
    input: string,
    output: string,
    xpGained: number,
    ethicalCheck: boolean,
  ) {
    this.lastInteraction = {
      timestamp: new Date(),
      type,
      input,
      output,
      xpGained,
      ethicalCheck,
    };

    this.addExperience(type, output, xpGained);
  }

  recordTrainingCycle(
    cycle: string,
    xpGained: number,
    improvements: string[],
    ethicalAlignment: boolean,
  ) {
    if (!this.trainingHistory) {
      this.trainingHistory = [];
    }

    this.trainingHistory.push({
      timestamp: new Date(),
      cycle,
      xpGained,
      improvements,
      ethicalAlignment,
    });

    this.metrics.lastTrainingCycle = new Date();
    this.metrics.xp += xpGained;
  }

  recordPerformanceMetric(metric: string, value: number, threshold: number) {
    if (!this.performanceHistory) {
      this.performanceHistory = [];
    }

    const status =
      value >= threshold
        ? "pass"
        : value >= threshold * 0.8
          ? "warning"
          : "fail";

    this.performanceHistory.push({
      timestamp: new Date(),
      metric,
      value,
      threshold,
      status,
    });
  }

  recordError(error: string, context: string) {
    if (!this.errorHistory) {
      this.errorHistory = [];
    }

    this.errorHistory.push({
      timestamp: new Date(),
      error,
      context,
      resolved: false,
    });

    this.lastError = error;
  }

  recordEthicalViolation(
    violation: string,
    severity: "low" | "medium" | "high" | "critical",
    context: string,
  ) {
    if (!this.ethicalViolations) {
      this.ethicalViolations = [];
    }

    this.ethicalViolations.push({
      timestamp: new Date(),
      violation,
      severity,
      context,
      resolved: false,
    });

    // Update ethical rating based on severity
    if (severity === "critical" || severity === "high") {
      this.metrics.ethicalRating = "reject";
    } else if (severity === "medium") {
      this.metrics.ethicalRating = "warn";
    }
  }

  recordSoulchainTransaction(
    cid: string,
    amount: number,
    rationale: string,
    tags: string[],
  ) {
    if (!this.soulchainTransactions) {
      this.soulchainTransactions = [];
    }

    this.soulchainTransactions.push({
      timestamp: new Date(),
      cid,
      amount,
      rationale,
      tags,
    });
  }

  // Utility methods
  isActive(): boolean {
    return this.status === "active" || this.status === "training";
  }

  canInteract(): boolean {
    return this.isActive() && this.metrics.ethicalRating !== "reject";
  }

  getTrustLevel(): "high" | "medium" | "low" {
    if (this.metrics.trustScore >= 0.8) return "high";
    if (this.metrics.trustScore >= 0.5) return "medium";
    return "low";
  }

  getPerformanceStatus(): "excellent" | "good" | "fair" | "poor" {
    if (this.metrics.performanceScore >= 0.9) return "excellent";
    if (this.metrics.performanceScore >= 0.7) return "good";
    if (this.metrics.performanceScore >= 0.5) return "fair";
    return "poor";
  }

  toJSON() {
    const { id, ...agentState } = this;
    return agentState;
  }
}
