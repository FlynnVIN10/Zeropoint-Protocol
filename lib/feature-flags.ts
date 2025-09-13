// CTO Directive: Compliance check
if (process.env.MOCKS_DISABLED === '1') {
  throw new Error('Module temporarily unavailable - MOCKS_DISABLED=1 enforced')
}

// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

// lib/feature-flags.ts

export interface FeatureFlags {
  QUANTUM_ENABLED: boolean
  CONSENSUS_ENABLED: boolean
  TRAINING_ENABLED: boolean
  SSE_ENABLED: boolean
  MOCKS_DISABLED: boolean
}

class FeatureFlagManager {
  private flags: FeatureFlags
  private listeners: Set<(flags: FeatureFlags) => void> = new Set()

  constructor() {
    // Initialize with environment-based defaults
    this.flags = {
      QUANTUM_ENABLED: process.env.QUANTUM_ENABLED === 'true',
      CONSENSUS_ENABLED: process.env.CONSENSUS_ENABLED !== 'false',
      TRAINING_ENABLED: process.env.TRAINING_ENABLED !== 'false',
      SSE_ENABLED: process.env.SSE_ENABLED !== 'false',
      MOCKS_DISABLED: process.env.MOCKS_DISABLED === '1' || process.env.MOCKS_DISABLED === 'true'
    }

    // Override with runtime config if available
    this.loadRuntimeConfig()
  }

  private loadRuntimeConfig() {
    try {
      // In production, this could load from a config service
      // For now, we'll use environment variables
      if (process.env.NODE_ENV === 'production') {
        this.flags.MOCKS_DISABLED = true
      }
    } catch (error) {
      console.warn('Failed to load runtime config:', error)
    }
  }

  getFlags(): FeatureFlags {
    return { ...this.flags }
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag]
  }

  setFlag(flag: keyof FeatureFlags, value: boolean) {
    this.flags[flag] = value
    this.notifyListeners()
  }

  updateFlags(updates: Partial<FeatureFlags>) {
    this.flags = { ...this.flags, ...updates }
    this.notifyListeners()
  }

  subscribe(listener: (flags: FeatureFlags) => void): () => void {
    this.listeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyListeners() {
    const flags = this.getFlags()
    this.listeners.forEach(listener => {
      try {
        listener(flags)
      } catch (error) {
        console.error('Feature flag listener error:', error)
      }
    })
  }

  // Validation methods
  validateFlags(): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Production validation rules
    if (process.env.NODE_ENV === 'production') {
      if (!this.flags.MOCKS_DISABLED) {
        errors.push('MOCKS_DISABLED must be true in production')
      }
      
      if (this.flags.QUANTUM_ENABLED && !this.flags.CONSENSUS_ENABLED) {
        errors.push('Quantum features require consensus to be enabled')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Get flags for specific environments
  getFlagsForEnvironment(env: 'development' | 'staging' | 'production'): FeatureFlags {
    const baseFlags = this.getFlags()
    
    switch (env) {
      case 'development':
        return {
          ...baseFlags,
          QUANTUM_ENABLED: true,
          MOCKS_DISABLED: false
        }
      case 'staging':
        return {
          ...baseFlags,
          QUANTUM_ENABLED: false,
          MOCKS_DISABLED: true
        }
      case 'production':
        return {
          ...baseFlags,
          QUANTUM_ENABLED: false,
          MOCKS_DISABLED: true
        }
      default:
        return baseFlags
    }
  }
}

// Export singleton instance
export const featureFlags = new FeatureFlagManager()

// Export types
// FeatureFlags is already exported from the class definition

// Export convenience functions
export const isQuantumEnabled = () => featureFlags.isEnabled('QUANTUM_ENABLED')
export const isConsensusEnabled = () => featureFlags.isEnabled('CONSENSUS_ENABLED')
export const isTrainingEnabled = () => featureFlags.isEnabled('TRAINING_ENABLED')
export const isSSEEnabled = () => featureFlags.isEnabled('SSE_ENABLED')
export const isMocksDisabled = () => featureFlags.isEnabled('MOCKS_DISABLED')

export default featureFlags
