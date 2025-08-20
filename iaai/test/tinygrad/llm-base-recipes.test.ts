import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { LLMBaseRecipes } from "../../src/tinygrad/llm-base-recipes";
import {
  FinetuneConfig,
  TrainingMetrics,
  CheckpointInfo,
  RecipeTemplate,
} from "../../src/tinygrad/llm-base-recipes.types";

describe("Phase C2: Recipes LLM Base", () => {
  let llmRecipes: LLMBaseRecipes;
  let testConfig: FinetuneConfig;

  beforeEach(async () => {
    testConfig = {
      modelSize: "13B",
      baseModel: "microsoft/DialoGPT-medium",
      targetTasks: ["text-generation", "conversation"],
      mixedPrecision: true,
      gradientAccumulation: 4,
      learningRate: 1e-5,
      batchSize: 8,
      maxEpochs: 3,
      warmupSteps: 100,
      weightDecay: 0.01,
      checkpointInterval: 1000,
      validationInterval: 500,
      earlyStoppingPatience: 3,
      maxGradNorm: 1.0,
      seed: 42,
    };

    llmRecipes = new LLMBaseRecipes();
    await llmRecipes.initialize();
  });

  afterEach(async () => {
    await llmRecipes.shutdown();
  });

  describe("Milestone C2: Recipes: LLM Base", () => {
    it("should create tinygrad finetune templates for 8-13B class models", async () => {
      const templates = await llmRecipes.getRecipeTemplates();

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);

      const modelSizes = templates.map((t) => t.modelSize);
      expect(modelSizes).toContain("8B");
      expect(modelSizes).toContain("13B");

      templates.forEach((template) => {
        expect(template.name).toBeDefined();
        expect(template.modelSize).toBeDefined();
        expect(template.config).toBeDefined();
        expect(template.requirements).toBeDefined();
      });
    });

    it("should support mixed precision training", async () => {
      const config = { ...testConfig, mixedPrecision: true };
      const recipe = await llmRecipes.createRecipe(config);

      expect(recipe.config.mixedPrecision).toBe(true);
      expect(recipe.mixedPrecisionConfig).toBeDefined();
      expect(recipe.mixedPrecisionConfig.enabled).toBe(true);
      expect(recipe.mixedPrecisionConfig.dtype).toBe("float16");
      expect(recipe.mixedPrecisionConfig.lossScaling).toBeDefined();
    });

    it("should implement gradient accumulation", async () => {
      const config = { ...testConfig, gradientAccumulation: 8 };
      const recipe = await llmRecipes.createRecipe(config);

      expect(recipe.config.gradientAccumulation).toBe(8);
      expect(recipe.gradientAccumulationConfig).toBeDefined();
      expect(recipe.gradientAccumulationConfig.steps).toBe(8);
      expect(recipe.gradientAccumulationConfig.syncBN).toBeDefined();
    });

    it("should perform checkpoint integrity checks", async () => {
      const config = { ...testConfig, checkpointInterval: 500 };
      const recipe = await llmRecipes.createRecipe(config);

      // Start training first to create a training run
      const trainingRun = await llmRecipes.startTraining(recipe);

      const checkpoint = await llmRecipes.createCheckpoint(
        recipe,
        "test-checkpoint",
      );

      expect(checkpoint.path).toBeDefined();
      expect(checkpoint.metadata).toBeDefined();
      expect(checkpoint.metadata.sha).toBeDefined();
      expect(checkpoint.metadata.timestamp).toBeDefined();
      expect(checkpoint.metadata.epoch).toBeDefined();
      expect(checkpoint.metadata.step).toBeDefined();

      const integrityCheck = await llmRecipes.verifyCheckpoint(checkpoint.path);
      expect(integrityCheck.valid).toBe(true);
      expect(integrityCheck.sha).toBe(checkpoint.metadata.sha);
    });

    it("should achieve monotonic loss convergence", async () => {
      const config = { ...testConfig, maxEpochs: 5 };
      const recipe = await llmRecipes.createRecipe(config);

      const trainingRun = await llmRecipes.startTraining(recipe);
      const metrics = await llmRecipes.getTrainingMetrics(trainingRun.id);

      expect(metrics.lossHistory).toBeDefined();
      expect(metrics.lossHistory.length).toBeGreaterThan(1);

      // Check for monotonic decrease (allowing small fluctuations)
      let previousLoss = metrics.lossHistory[0];
      let nonDecreasingCount = 0;

      for (let i = 1; i < metrics.lossHistory.length; i++) {
        const currentLoss = metrics.lossHistory[i];
        if (currentLoss > previousLoss + 0.01) {
          // Allow 0.01 tolerance
          nonDecreasingCount++;
        }
        previousLoss = currentLoss;
      }

      // At least 80% of steps should show decreasing loss
      const decreasingRatio =
        (metrics.lossHistory.length - 1 - nonDecreasingCount) /
        (metrics.lossHistory.length - 1);
      expect(decreasingRatio).toBeGreaterThan(0.8);
    });

    it("should prevent NaN values during training", async () => {
      const config = { ...testConfig, maxEpochs: 3 };
      const recipe = await llmRecipes.createRecipe(config);

      const trainingRun = await llmRecipes.startTraining(recipe);
      const metrics = await llmRecipes.getTrainingMetrics(trainingRun.id);

      expect(metrics.lossHistory).toBeDefined();

      // Check for NaN values
      const hasNaN = metrics.lossHistory.some((loss) => isNaN(loss));
      expect(hasNaN).toBe(false);

      // Check gradients for NaN
      if (metrics.gradientHistory) {
        const hasGradientNaN = metrics.gradientHistory.some((grad) =>
          grad.some((val) => isNaN(val)),
        );
        expect(hasGradientNaN).toBe(false);
      }
    });

    it("should commit run logs with training details", async () => {
      const config = { ...testConfig, maxEpochs: 2 };
      const recipe = await llmRecipes.createRecipe(config);

      const trainingRun = await llmRecipes.startTraining(recipe);
      const runLog = await llmRecipes.generateRunLog(trainingRun.id);

      expect(runLog.runId).toBe(trainingRun.id);
      expect(runLog.config).toBeDefined();
      expect(runLog.metrics).toBeDefined();
      expect(runLog.checkpoints).toBeDefined();
      expect(runLog.timestamp).toBeDefined();
      expect(runLog.duration).toBeDefined();
      expect(runLog.status).toBeDefined();
    });

    it("should achieve ≥10% perplexity reduction or ≥5-point task gain", async () => {
      const config = { ...testConfig, maxEpochs: 3 };
      const recipe = await llmRecipes.createRecipe(config);

      const trainingRun = await llmRecipes.startTraining(recipe);
      const metrics = await llmRecipes.getTrainingMetrics(trainingRun.id);

      expect(metrics.perplexity).toBeDefined();
      expect(metrics.taskAccuracy).toBeDefined();

      if (
        metrics.perplexity &&
        metrics.perplexity.baseline &&
        metrics.perplexity.final
      ) {
        const perplexityReduction =
          (metrics.perplexity.baseline - metrics.perplexity.final) /
          metrics.perplexity.baseline;
        expect(perplexityReduction).toBeGreaterThan(0.1); // ≥10% reduction
      }

      if (
        metrics.taskAccuracy &&
        metrics.taskAccuracy.baseline &&
        metrics.taskAccuracy.final
      ) {
        const taskGain =
          metrics.taskAccuracy.final - metrics.taskAccuracy.baseline;
        expect(taskGain).toBeGreaterThan(5); // ≥5-point gain
      }
    });

    it("should produce equivalent metrics with same seed", async () => {
      const config1 = { ...testConfig, seed: 42, maxEpochs: 2 };
      const config2 = { ...testConfig, seed: 42, maxEpochs: 2 };

      const recipe1 = await llmRecipes.createRecipe(config1);
      const recipe2 = await llmRecipes.createRecipe(config2);

      const run1 = await llmRecipes.startTraining(recipe1);
      const run2 = await llmRecipes.startTraining(recipe2);

      const metrics1 = await llmRecipes.getTrainingMetrics(run1.id);
      const metrics2 = await llmRecipes.getTrainingMetrics(run2.id);

      // Check that final metrics are within ±1% tolerance
      if (metrics1.lossHistory && metrics2.lossHistory) {
        const finalLoss1 =
          metrics1.lossHistory[metrics1.lossHistory.length - 1];
        const finalLoss2 =
          metrics2.lossHistory[metrics2.lossHistory.length - 1];

        const lossDifference = Math.abs(finalLoss1 - finalLoss2) / finalLoss1;
        expect(lossDifference).toBeLessThan(0.01); // ±1% tolerance
      }
    });

    it("should record checkpoint SHA for integrity", async () => {
      const config = { ...testConfig, checkpointInterval: 100 };
      const recipe = await llmRecipes.createRecipe(config);

      const trainingRun = await llmRecipes.startTraining(recipe);
      const checkpoints = await llmRecipes.getCheckpoints(trainingRun.id);

      expect(checkpoints.length).toBeGreaterThan(0);

      for (const checkpoint of checkpoints) {
        expect(checkpoint.metadata.sha).toBeDefined();
        expect(checkpoint.metadata.sha).toMatch(/^[a-f0-9]{64}$/); // SHA-256 format

        // Verify SHA matches actual file
        const integrityCheck = await llmRecipes.verifyCheckpoint(
          checkpoint.path,
        );
        expect(integrityCheck.sha).toBe(checkpoint.metadata.sha);
      }
    });

    it("should support different model architectures (8B, 13B)", async () => {
      const modelSizes = ["8B", "13B"];

      for (const size of modelSizes) {
        const config = { ...testConfig, modelSize: size as "8B" | "13B" };
        const recipe = await llmRecipes.createRecipe(config);

        expect(recipe.config.modelSize).toBe(size);
        expect(recipe.architecture).toBeDefined();
        expect(recipe.architecture.parameters).toBeDefined();
        expect(recipe.architecture.layers).toBeDefined();
        expect(recipe.architecture.attentionHeads).toBeDefined();

        // Verify parameter count is approximately correct
        const expectedParams = size === "8B" ? 8e9 : 13e9;
        const actualParams = recipe.architecture.parameters;
        const paramTolerance = 0.2; // 20% tolerance

        expect(
          Math.abs(actualParams - expectedParams) / expectedParams,
        ).toBeLessThan(paramTolerance);
      }
    });

    it("should handle training interruptions gracefully", async () => {
      const config = { ...testConfig, maxEpochs: 5 };
      const recipe = await llmRecipes.createRecipe(config);

      const trainingRun = await llmRecipes.startTraining(recipe);

      // Simulate interruption after some training
      await new Promise((resolve) => setTimeout(resolve, 100));
      await llmRecipes.interruptTraining(trainingRun.id);

      const status = await llmRecipes.getTrainingStatus(trainingRun.id);
      expect(status.status).toBe("interrupted");

      // Should be able to resume from last checkpoint
      const checkpoints = await llmRecipes.getCheckpoints(trainingRun.id);
      expect(checkpoints.length).toBeGreaterThan(0);

      const lastCheckpoint = checkpoints[checkpoints.length - 1];
      const resumeResult = await llmRecipes.resumeTraining(
        trainingRun.id,
        lastCheckpoint.path,
      );
      expect(resumeResult.success).toBe(true);
    });
  });
});
