export interface FinetuneConfig {
  modelSize: "8B" | "13B";
  baseModel: string;
  targetTasks: string[];
  mixedPrecision: boolean;
  gradientAccumulation: number;
  learningRate: number;
  batchSize: number;
  maxEpochs: number;
  warmupSteps: number;
  weightDecay: number;
  checkpointInterval: number;
  validationInterval: number;
  earlyStoppingPatience: number;
  maxGradNorm: number;
  seed: number;
}

export interface MixedPrecisionConfig {
  enabled: boolean;
  dtype: "float16" | "bfloat16";
  lossScaling: number;
  dynamicScaling: boolean;
  initialScale: number;
  scaleWindow: number;
}

export interface GradientAccumulationConfig {
  steps: number;
  syncBN: boolean;
  effectiveBatchSize: number;
  gradientBuffer: boolean;
}

export interface ModelArchitecture {
  parameters: number;
  layers: number;
  attentionHeads: number;
  hiddenSize: number;
  intermediateSize: number;
  vocabSize: number;
  maxPositionEmbeddings: number;
}

export interface RecipeTemplate {
  name: string;
  modelSize: "8B" | "13B";
  config: FinetuneConfig;
  requirements: {
    gpuMemory: string;
    cpuMemory: string;
    storage: string;
    dependencies: string[];
  };
  description: string;
  tags: string[];
}

export interface TrainingRun {
  id: string;
  recipeId: string;
  status: "running" | "completed" | "failed" | "interrupted";
  startTime: string;
  endTime?: string;
  currentEpoch: number;
  currentStep: number;
  totalSteps: number;
}

export interface TrainingMetrics {
  lossHistory: number[];
  gradientHistory?: number[][];
  learningRateHistory: number[];
  perplexity?: {
    baseline: number;
    final: number;
    history: number[];
  };
  taskAccuracy?: {
    baseline: number;
    final: number;
    history: number[];
  };
  validationMetrics?: {
    loss: number[];
    accuracy: number[];
    perplexity: number[];
  };
  trainingTime: number;
  gpuUtilization: number[];
  memoryUsage: number[];
}

export interface CheckpointInfo {
  path: string;
  metadata: {
    sha: string;
    timestamp: string;
    epoch: number;
    step: number;
    loss: number;
    accuracy: number;
    modelSize: number;
    optimizerState: boolean;
    schedulerState: boolean;
  };
}

export interface CheckpointIntegrity {
  valid: boolean;
  sha: string;
  size: number;
  corrupted: boolean;
  errorMessage?: string;
}

export interface RunLog {
  runId: string;
  config: FinetuneConfig;
  metrics: TrainingMetrics;
  checkpoints: CheckpointInfo[];
  timestamp: string;
  duration: number;
  status: string;
  environment: {
    gpu: string;
    cuda: string;
    python: string;
    tinygrad: string;
  };
  logs: string[];
}

export interface TrainingStatus {
  status: "running" | "completed" | "failed" | "interrupted" | "paused";
  progress: number;
  currentEpoch: number;
  currentStep: number;
  totalSteps: number;
  estimatedTimeRemaining: number;
  lastCheckpoint?: CheckpointInfo;
}

export interface ResumeResult {
  success: boolean;
  checkpointPath: string;
  resumedFromStep: number;
  resumedFromEpoch: number;
  errorMessage?: string;
}
