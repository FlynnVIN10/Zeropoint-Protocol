export type VisionTask =
  | "image-classification"
  | "image-captioning"
  | "visual-question-answering"
  | "object-detection"
  | "image-segmentation";

export interface VLMConfig {
  modelType: "ViT-CLIP" | "ViT-BERT" | "Vision-Transformer";
  baseModel: string;
  visionEncoder: string;
  textEncoder: string;
  imageSize: number;
  patchSize: number;
  embedDim: number;
  numHeads: number;
  numLayers: number;
  vocabSize: number;
  maxTextLength: number;
  tasks: VisionTask[];
  trainingData: string;
  batchSize: number;
  learningRate: number;
  maxEpochs: number;
  warmupSteps: number;
  weightDecay: number;
  mixedPrecision: boolean;
  gradientAccumulation: number;
}

export interface VisionArchitecture {
  numPatches: number;
  patchEmbedDim: number;
  visionLayers: number;
  textLayers: number;
  crossAttentionLayers: number;
  fusionStrategy: "concat" | "attention" | "mlp";
  outputProjection: boolean;
}

export interface VisionEncoder {
  type: "ViT" | "ResNet" | "EfficientNet";
  backbone: string;
  pretrained: boolean;
  frozenLayers: string[];
  trainableLayers: string[];
}

export interface TextEncoder {
  type: "CLIP" | "BERT" | "GPT";
  backbone: string;
  pretrained: boolean;
  maxLength: number;
  tokenizer: string;
}

export interface TaskSpecificConfig {
  lossFunction: string;
  evaluationMetrics: string[];
  dataFormat: string;
  outputFormat: string;
  postProcessing: string[];
}

export interface DataAugmentation {
  visionAugmentations: {
    randomCrop: boolean;
    randomHorizontalFlip: boolean;
    colorJitter: boolean;
    randomRotation: boolean;
    normalization: boolean;
    randomErasing: boolean;
    mixup: boolean;
    cutmix: boolean;
  };
  textAugmentations: {
    synonymReplacement: boolean;
    randomInsertion: boolean;
    randomSwap: boolean;
    randomDeletion: boolean;
  };
}

export interface MultimodalConfig {
  textVisionAlignment: "contrastive" | "crossAttention" | "fusion";
  crossAttention: boolean;
  fusionStrategy: "early" | "late" | "hybrid";
  alignmentLoss: string;
  temperature: number;
}

export interface LossFunctions {
  visionLoss: string;
  textLoss: string;
  alignmentLoss: string;
  totalLoss: string;
  lossWeights: Record<string, number>;
}

export interface PretrainedConfig {
  loadPretrained: boolean;
  pretrainedPath: string;
  freezeLayers: string[];
  trainableLayers: string[];
  loadOptimizer: boolean;
  loadScheduler: boolean;
}

export interface VisionRecipe {
  config: VLMConfig;
  visionEncoder: VisionEncoder;
  textEncoder: TextEncoder;
  architecture: VisionArchitecture;
  trainingConfig: {
    optimizer: string;
    scheduler: string;
    lossFunction: string;
    metrics: string[];
  };
  requirements: {
    gpuMemory: string;
    cpuMemory: string;
    storage: string;
    dependencies: string[];
  };
  taskSpecificConfigs: Record<VisionTask, TaskSpecificConfig>;
  dataAugmentation: DataAugmentation;
  multimodalConfig: MultimodalConfig;
  lossFunctions: LossFunctions;
  pretrainedConfig: PretrainedConfig;
}

export interface VisionTrainingRun {
  id: string;
  recipeId: string;
  status: "running" | "completed" | "failed" | "interrupted";
  startTime: string;
  endTime?: string;
  currentEpoch: number;
  currentStep: number;
  totalSteps: number;
  visionTask: VisionTask;
}

export interface VisionMetrics {
  top1Accuracy?: number;
  top5Accuracy?: number;
  baselineTop1?: number;
  baselineTop5?: number;
  retrievalMetrics?: {
    rAt1: number;
    rAt5: number;
    rAt10: number;
    baselineRAt1: number;
    baselineRAt5: number;
    baselineRAt10: number;
  };
  visionMetrics?: {
    imageClassification?: {
      accuracy: number;
      precision: number;
      recall: number;
      f1Score: number;
    };
    imageCaptioning?: {
      bleu: number;
      rouge: number;
      meteor: number;
      cider: number;
    };
    objectDetection?: {
      mAP: number;
      precision: number;
      recall: number;
      f1Score: number;
    };
    visualQuestionAnswering?: {
      accuracy: number;
      exactMatch: number;
      f1Score: number;
    };
  };
  lossHistory: number[];
  learningRateHistory: number[];
  trainingTime: number;
  gpuUtilization: number[];
  memoryUsage: number[];
}

export interface VisionCheckpoint {
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
    visionMetrics: Record<string, any>;
  };
}

export interface CheckpointIntegrity {
  valid: boolean;
  sha: string;
  size: number;
  corrupted: boolean;
  errorMessage?: string;
}

export interface SafetyCard {
  modality: "vision";
  visionSpecificRisks: string[];
  biasMitigation: string[];
  contentFiltering: string[];
  privacyProtection: string[];
  lastUpdated: string;
  version: string;
  riskLevel: "low" | "medium" | "high";
  mitigationStrategies: string[];
}

export interface TextVisionAlignmentTest {
  alignmentScore: number;
  crossModalRetrieval: {
    imageToText: number;
    textToImage: number;
  };
  semanticSimilarity: number;
  modalityGap: number;
}

export interface LossComputation {
  total: number;
  vision: number;
  text: number;
  alignment: number;
  regularization: number;
}

export interface PretrainedWeightsResult {
  success: boolean;
  loadedLayers: string[];
  frozenLayers: string[];
  errorMessage?: string;
}
