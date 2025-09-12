/**
 * Centralized Phase Configuration
 * 
 * This file contains the single source of truth for the current phase.
 * All other files should import and use this configuration instead of hardcoding phase values.
 */

export const PHASE_CONFIG = {
  current: "stage2" as const,
  ragMode: "beyond" as const,
  environment: "prod" as const,
} as const;

export type Phase = typeof PHASE_CONFIG.current;
export type RagMode = typeof PHASE_CONFIG.ragMode;
export type Environment = typeof PHASE_CONFIG.environment;

/**
 * Get the current phase configuration
 */
export function getPhaseConfig() {
  return PHASE_CONFIG;
}

/**
 * Get the current phase
 */
export function getCurrentPhase(): Phase {
  return PHASE_CONFIG.current;
}

/**
 * Get the current RAG mode
 */
export function getCurrentRagMode(): RagMode {
  return PHASE_CONFIG.ragMode;
}

/**
 * Get the current environment
 */
export function getCurrentEnvironment(): Environment {
  return PHASE_CONFIG.environment;
}
