import { Injectable, Logger } from "@nestjs/common";
import {
  PetalTrainingRequest,
  TrainingCycleResult,
} from "../controllers/petals.controller.js";
import { TelemetryService } from "./telemetry.service.js";
import axios from "axios";

interface PetalsNode {
  id: string;
  url: string;
  status: "available" | "busy" | "offline";
  capabilities: string[];
  lastHeartbeat: number;
}

interface TrainingMetrics {
  loss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  epoch: number;
  timestamp: number;
}

interface DistributedTrainingConfig {
  nodes: PetalsNode[];
  batchSize: number;
  epochs: number;
  learningRate: number;
  modelType: string;
}

@Injectable()
export class PetalsService {
  private readonly logger = new Logger(PetalsService.name);
  private sharedModel: any = {};
  private trainingCycles: Map<string, TrainingCycleResult> = new Map();
  private activeNodes: Map<string, PetalsNode> = new Map();
  private trainingQueue: Map<string, PetalTrainingRequest> = new Map();

  constructor(private readonly telemetryService: TelemetryService) {
    this.initializePetalsNetwork();
  }

  private async initializePetalsNetwork(): Promise<void> {
    // Initialize distributed network nodes
    const defaultNodes: PetalsNode[] = [
      {
        id: "petals-node-1",
        url: process.env.PETALS_NODE_1_URL || "http://localhost:8001",
        status: "available",
        capabilities: ["training", "inference", "federated_learning"],
        lastHeartbeat: Date.now(),
      },
      {
        id: "petals-node-2",
        url: process.env.PETALS_NODE_2_URL || "http://localhost:8002",
        status: "available",
        capabilities: ["training", "inference"],
        lastHeartbeat: Date.now(),
      },
      {
        id: "petals-node-3",
        url: process.env.PETALS_NODE_3_URL || "http://localhost:8003",
        status: "available",
        capabilities: ["training", "federated_learning"],
        lastHeartbeat: Date.now(),
      },
    ];

    defaultNodes.forEach((node) => this.activeNodes.set(node.id, node));
    this.logger.log(
      `Initialized Petals network with ${defaultNodes.length} nodes`,
    );
  }

  async executeTrainingCycle(
    sandboxId: string,
    request: PetalTrainingRequest,
  ): Promise<TrainingCycleResult> {
    this.logger.log(
      `Executing distributed training cycle for agent ${request.agentId} in sandbox ${sandboxId}`,
    );

    const cycleId = `cycle_${Date.now()}_${request.agentId}`;
    const startTime = Date.now();

    // Emit training start event
    await this.telemetryService.logEvent("training", "cycle_started", {
      cycleId,
      agentId: request.agentId,
      sandboxId,
      modelType: request.modelType,
      timestamp: startTime,
    });

    try {
      // Distribute training across available nodes
      const availableNodes = Array.from(this.activeNodes.values()).filter(
        (node) => node.status === "available",
      );

      if (availableNodes.length === 0) {
        throw new Error("No available Petals nodes for training");
      }

      // Execute distributed training
      const trainingResults = await this.executeDistributedTraining(
        cycleId,
        request,
        availableNodes,
      );

      const duration = Date.now() - startTime;

      // Aggregate results from all nodes
      const aggregatedDeltas = await this.aggregateDeltas(
        trainingResults.modelDeltas,
      );
      const aggregatedMetrics = this.aggregateMetrics(trainingResults.metrics);

      const result: TrainingCycleResult = {
        id: cycleId,
        cycleId,
        requestId: request.id,
        agentId: request.agentId,
        status: 'completed',
        progress: 100,
        startTime: new Date(Date.now() - duration),
        endTime: new Date(),
        modelDeltas: aggregatedDeltas,
        metrics: {
          loss: aggregatedMetrics.loss,
          accuracy: aggregatedMetrics.accuracy,
          precision: aggregatedMetrics.precision,
          recall: aggregatedMetrics.recall,
          f1Score: aggregatedMetrics.f1Score,
          duration,
          nodesUsed: availableNodes.length,
        },
        timestamp: Date.now(),
      };

      this.trainingCycles.set(cycleId, result);

      // Update shared model with new deltas
      await this.updateSharedModel(aggregatedDeltas);

      // Emit training completion event
      await this.telemetryService.logEvent("training", "cycle_completed", {
        cycleId,
        agentId: request.agentId,
        metrics: result.metrics,
        duration,
        timestamp: Date.now(),
      });

      this.logger.log(
        `Distributed training cycle ${cycleId} completed in ${duration}ms with ${availableNodes.length} nodes`,
      );

      return result;
    } catch (error) {
      this.logger.error(`Training cycle ${cycleId} failed: ${error.message}`);

      // Emit training failure event
      await this.telemetryService.logEvent("training", "cycle_failed", {
        cycleId,
        agentId: request.agentId,
        error: error.message,
        timestamp: Date.now(),
      });

      throw error;
    }
  }

  private async executeDistributedTraining(
    cycleId: string,
    request: PetalTrainingRequest,
    nodes: PetalsNode[],
  ): Promise<{ modelDeltas: any[]; metrics: TrainingMetrics[] }> {
    const trainingPromises = nodes.map(async (node) => {
      try {
        // Mark node as busy
        node.status = "busy";

        // Emit node training start event
        await this.telemetryService.logEvent(
          "training",
          "node_training_started",
          {
            cycleId,
            nodeId: node.id,
            timestamp: Date.now(),
          },
        );

        // Execute training on node
        const response = await axios.post(
          `${node.url}/train`,
          {
            cycleId,
            modelType: request.modelType,
            trainingParams: request.trainingParams,
            data: request.trainingData,
          },
          {
            timeout: 300000, // 5 minute timeout
          },
        );

        // Mark node as available
        node.status = "available";
        node.lastHeartbeat = Date.now();

        // Emit node training completion event
        await this.telemetryService.logEvent(
          "training",
          "node_training_completed",
          {
            cycleId,
            nodeId: node.id,
            metrics: response.data.metrics,
            timestamp: Date.now(),
          },
        );

        return {
          modelDeltas: response.data.modelDeltas,
          metrics: response.data.metrics,
          nodeId: node.id,
        };
      } catch (error) {
        // Mark node as offline on failure
        node.status = "offline";

        this.logger.error(
          `Training failed on node ${node.id}: ${error.message}`,
        );

        // Emit node training failure event
        await this.telemetryService.logEvent(
          "training",
          "node_training_failed",
          {
            cycleId,
            nodeId: node.id,
            error: error.message,
            timestamp: Date.now(),
          },
        );

        throw error;
      }
    });

    const results = await Promise.allSettled(trainingPromises);
    const successfulResults = results
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    if (successfulResults.length === 0) {
      throw new Error("All training nodes failed");
    }

    return {
      modelDeltas: successfulResults.map((r) => r.modelDeltas),
      metrics: successfulResults.map((r) => r.metrics),
    };
  }

  async aggregateDeltas(modelDeltas: any[]): Promise<any> {
    this.logger.log(
      `Aggregating model deltas from ${modelDeltas.length} nodes`,
    );

    // Federated averaging of model deltas
    const aggregatedDeltas = {
      weights: {},
      biases: {},
      metadata: {
        aggregationMethod: "federated_average",
        nodesCount: modelDeltas.length,
        timestamp: Date.now(),
      },
    };

    if (modelDeltas.length === 0) {
      return aggregatedDeltas;
    }

    // Aggregate weights
    const weightKeys = Object.keys(modelDeltas[0].weights || {});
    for (const key of weightKeys) {
      const weightArrays = modelDeltas
        .map((delta) => delta.weights[key])
        .filter(Boolean);
      if (weightArrays.length > 0) {
        aggregatedDeltas.weights[key] = this.averageArrays(weightArrays);
      }
    }

    // Aggregate biases
    const biasKeys = Object.keys(modelDeltas[0].biases || {});
    for (const key of biasKeys) {
      const biasArrays = modelDeltas
        .map((delta) => delta.biases[key])
        .filter(Boolean);
      if (biasArrays.length > 0) {
        aggregatedDeltas.biases[key] = this.averageArrays(biasArrays);
      }
    }

    this.logger.log(
      "Model deltas aggregated successfully using federated averaging",
    );
    return aggregatedDeltas;
  }

  private aggregateMetrics(metrics: TrainingMetrics[]): TrainingMetrics {
    if (metrics.length === 0) {
      return {
        loss: 0,
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        epoch: 0,
        timestamp: Date.now(),
      };
    }

    return {
      loss: metrics.reduce((sum, m) => sum + m.loss, 0) / metrics.length,
      accuracy:
        metrics.reduce((sum, m) => sum + m.accuracy, 0) / metrics.length,
      precision:
        metrics.reduce((sum, m) => sum + m.precision, 0) / metrics.length,
      recall: metrics.reduce((sum, m) => sum + m.recall, 0) / metrics.length,
      f1Score: metrics.reduce((sum, m) => sum + m.f1Score, 0) / metrics.length,
      epoch: Math.max(...metrics.map((m) => m.epoch)),
      timestamp: Date.now(),
    };
  }

  private averageArrays(arrays: number[][]): number[] {
    if (arrays.length === 0) return [];

    const result = new Array(arrays[0].length).fill(0);
    for (const array of arrays) {
      for (let i = 0; i < array.length; i++) {
        result[i] += array[i];
      }
    }

    return result.map((sum) => sum / arrays.length);
  }

  async updateSharedModel(deltas: any): Promise<void> {
    this.logger.log("Updating shared model with aggregated deltas");

    // Apply deltas to shared model using exponential moving average
    const alpha = 0.1; // Learning rate for model updates

    this.sharedModel = {
      ...this.sharedModel,
      weights: this.updateWeights(
        this.sharedModel.weights || {},
        deltas.weights || {},
        alpha,
      ),
      biases: this.updateWeights(
        this.sharedModel.biases || {},
        deltas.biases || {},
        alpha,
      ),
      lastUpdated: Date.now(),
      version: (this.sharedModel.version || 0) + 1,
    };

    // Emit model update event
    await this.telemetryService.logEvent("model", "shared_model_updated", {
      version: this.sharedModel.version,
      timestamp: Date.now(),
    });

    this.logger.log(
      `Shared model updated successfully to version ${this.sharedModel.version}`,
    );
  }

  private updateWeights(current: any, deltas: any, alpha: number): any {
    const updated = { ...current };

    for (const [key, deltaArray] of Object.entries(deltas)) {
      if (Array.isArray(deltaArray)) {
        if (!updated[key]) {
          updated[key] = new Array(deltaArray.length).fill(0);
        }

        for (let i = 0; i < deltaArray.length; i++) {
          updated[key][i] =
            updated[key][i] * (1 - alpha) + deltaArray[i] * alpha;
        }
      }
    }

    return updated;
  }

  async getTrainingStatus(cycleId: string): Promise<any> {
    const cycle = this.trainingCycles.get(cycleId);
    if (!cycle) {
      throw new Error(`Training cycle ${cycleId} not found`);
    }

    return {
      cycleId,
      status: "completed",
      metrics: cycle.metrics,
      timestamp: cycle.timestamp,
      modelVersion: this.sharedModel.version,
    };
  }

  async getSharedModel(): Promise<any> {
    return {
      model: this.sharedModel,
      lastUpdated: this.sharedModel.lastUpdated || Date.now(),
      version: this.sharedModel.version || 0,
      nodeCount: this.activeNodes.size,
    };
  }

  async getNetworkStatus(): Promise<any> {
    const nodes = Array.from(this.activeNodes.values());
    return {
      totalNodes: nodes.length,
      availableNodes: nodes.filter((n) => n.status === "available").length,
      busyNodes: nodes.filter((n) => n.status === "busy").length,
      offlineNodes: nodes.filter((n) => n.status === "offline").length,
      nodes: nodes.map((node) => ({
        id: node.id,
        status: node.status,
        lastHeartbeat: node.lastHeartbeat,
        capabilities: node.capabilities,
      })),
    };
  }

  async addNode(nodeConfig: Omit<PetalsNode, "lastHeartbeat">): Promise<void> {
    const node: PetalsNode = {
      ...nodeConfig,
      lastHeartbeat: Date.now(),
    };

    this.activeNodes.set(node.id, node);

    await this.telemetryService.logEvent("network", "node_added", {
      nodeId: node.id,
      capabilities: node.capabilities,
      timestamp: Date.now(),
    });

    this.logger.log(`Added new Petals node: ${node.id}`);
  }

  async removeNode(nodeId: string): Promise<void> {
    if (this.activeNodes.has(nodeId)) {
      this.activeNodes.delete(nodeId);

      await this.telemetryService.logEvent("network", "node_removed", {
        nodeId,
        timestamp: Date.now(),
      });

      this.logger.log(`Removed Petals node: ${nodeId}`);
    }
  }
}
