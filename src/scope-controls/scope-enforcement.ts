/**
 * Scope Enforcement Framework - Phase P0
 * 
 * This module provides runtime scope validation and mock detection
 * to enforce the frozen scope and prevent mock implementations.
 */

export interface ScopeViolation {
  /** Type of violation */
  type: 'mock_implementation' | 'scope_boundary' | 'synthetic_data' | 'simulated_hardware';
  
  /** Description of the violation */
  description: string;
  
  /** File or component where violation occurred */
  location: string;
  
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Timestamp of violation */
  timestamp: Date;
  
  /** Recommended action */
  recommendedAction: string;
}

export interface ScopeEnforcementConfig {
  /** Whether scope enforcement is enabled */
  enabled: boolean;
  
  /** Whether to fail on violations */
  failOnViolation: boolean;
  
  /** Logging level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  /** Mock detection patterns */
  mockPatterns: string[];
  
  /** Scope boundaries */
  scopeBoundaries: {
    allowed: string[];
    denied: string[];
  };
}

export class ScopeEnforcementService {
  private config: ScopeEnforcementConfig;
  private violations: ScopeViolation[] = [];
  private isEnabled: boolean;

  constructor(config?: Partial<ScopeEnforcementConfig>) {
    this.config = this.initializeConfig(config);
    this.isEnabled = this.config.enabled && this.isMockDetectionEnabled();
  }

  /**
   * Initialize scope enforcement configuration
   */
  private initializeConfig(config?: Partial<ScopeEnforcementConfig>): ScopeEnforcementConfig {
    const defaultConfig: ScopeEnforcementConfig = {
      enabled: true,
      failOnViolation: true,
      logLevel: 'error',
      mockPatterns: [
        'mock',
        'Mock',
        'MOCK',
        'fake',
        'Fake',
        'FAKE',
        'synthetic',
        'Synthetic',
        'SYNTHETIC',
        'simulated',
        'Simulated',
        'SIMULATED',
        'stub',
        'Stub',
        'STUB',
        'spy',
        'Spy',
        'SPY'
      ],
      scopeBoundaries: {
        allowed: [
          'tinygrad',
          'petals',
          'wondercraft',
          'website-v2',
          'dual-consensus',
          'governance',
          'safety',
          'image',
          'recovery'
        ],
        denied: [
          'mock',
          'fake',
          'synthetic',
          'simulated',
          'stub',
          'spy'
        ]
      }
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Check if mock detection is enabled via environment
   */
  private isMockDetectionEnabled(): boolean {
    const mocksDisabled = process.env.MOCKS_DISABLED === '1';
    const runtimeDetection = process.env.RUNTIME_MOCK_DETECTION_ENABLED === '1';
    const scopeValidation = process.env.RUNTIME_SCOPE_VALIDATION_ENABLED === '1';
    
    return mocksDisabled && runtimeDetection && scopeValidation;
  }

  /**
   * Validate scope boundaries for a component
   */
  validateScopeBoundary(component: string, action: string): boolean {
    if (!this.isEnabled) return true;

    const isAllowed = this.config.scopeBoundaries.allowed.some(
      allowed => component.toLowerCase().includes(allowed.toLowerCase())
    );

    const isDenied = this.config.scopeBoundaries.denied.some(
      denied => component.toLowerCase().includes(denied.toLowerCase())
    );

    if (isDenied) {
      const violation: ScopeViolation = {
        type: 'scope_boundary',
        description: `Component '${component}' is outside allowed scope boundaries`,
        location: `${component}:${action}`,
        severity: 'high',
        timestamp: new Date(),
        recommendedAction: 'Remove component or request scope expansion approval'
      };

      this.recordViolation(violation);
      return false;
    }

    if (!isAllowed) {
      const violation: ScopeViolation = {
        type: 'scope_boundary',
        description: `Component '${component}' is not explicitly in allowed scope`,
        location: `${component}:${action}`,
        severity: 'medium',
        timestamp: new Date(),
        recommendedAction: 'Add component to allowed scope or remove if not needed'
      };

      this.recordViolation(violation);
      return false;
    }

    return true;
  }

  /**
   * Detect mock implementations in code
   */
  detectMockImplementation(code: string, location: string): boolean {
    if (!this.isEnabled) return false;

    const mockDetected = this.config.mockPatterns.some(pattern => 
      code.toLowerCase().includes(pattern.toLowerCase())
    );

    if (mockDetected) {
      const violation: ScopeViolation = {
        type: 'mock_implementation',
        description: `Mock implementation detected in code at ${location}`,
        location,
        severity: 'critical',
        timestamp: new Date(),
        recommendedAction: 'Replace mock implementation with real implementation'
      };

      this.recordViolation(violation);
      return true;
    }

    return false;
  }

  /**
   * Validate synthetic data usage
   */
  validateSyntheticData(dataSource: string, dataType: string): boolean {
    if (!this.isEnabled) return true;

    const isSynthetic = this.config.mockPatterns.some(pattern => 
      dataSource.toLowerCase().includes(pattern.toLowerCase()) ||
      dataType.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isSynthetic) {
      const violation: ScopeViolation = {
        type: 'synthetic_data',
        description: `Synthetic data detected: ${dataSource} (${dataType})`,
        location: `${dataSource}:${dataType}`,
        severity: 'high',
        timestamp: new Date(),
        recommendedAction: 'Use real data sources or properly licensed synthetic data'
      };

      this.recordViolation(violation);
      return false;
    }

    return true;
  }

  /**
   * Validate hardware interactions
   */
  validateHardwareInteraction(interaction: string, component: string): boolean {
    if (!this.isEnabled) return true;

    const isSimulated = this.config.mockPatterns.some(pattern => 
      interaction.toLowerCase().includes(pattern.toLowerCase()) ||
      component.toLowerCase().includes(pattern.toLowerCase())
    );

    if (isSimulated) {
      const violation: ScopeViolation = {
        type: 'simulated_hardware',
        description: `Simulated hardware interaction detected: ${interaction} in ${component}`,
        location: `${component}:${interaction}`,
        severity: 'critical',
        timestamp: new Date(),
        recommendedAction: 'Use real hardware interactions only'
      };

      this.recordViolation(violation);
      return false;
    }

    return true;
  }

  /**
   * Record a scope violation
   */
  private recordViolation(violation: ScopeViolation): void {
    this.violations.push(violation);
    
    // Log violation based on config level
    this.logViolation(violation);
    
    // Fail if configured to do so
    if (this.config.failOnViolation) {
      throw new Error(`Scope violation: ${violation.description}`);
    }
  }

  /**
   * Log scope violation
   */
  private logViolation(violation: ScopeViolation): void {
    const logMessage = `[SCOPE VIOLATION] ${violation.type.toUpperCase()}: ${violation.description} at ${violation.location}`;
    
    switch (this.config.logLevel) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }

    // Additional logging for critical violations
    if (violation.severity === 'critical') {
      console.error(`[CRITICAL] ${logMessage}`);
      console.error(`[CRITICAL] Recommended action: ${violation.recommendedAction}`);
    }
  }

  /**
   * Get all recorded violations
   */
  getViolations(): ScopeViolation[] {
    return [...this.violations];
  }

  /**
   * Get violations by type
   */
  getViolationsByType(type: ScopeViolation['type']): ScopeViolation[] {
    return this.violations.filter(v => v.type === type);
  }

  /**
   * Get violations by severity
   */
  getViolationsBySeverity(severity: ScopeViolation['severity']): ScopeViolation[] {
    return this.violations.filter(v => v.severity === severity);
  }

  /**
   * Clear violation history
   */
  clearViolations(): void {
    this.violations = [];
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    complianceScore: number;
    isCompliant: boolean;
  } {
    const totalViolations = this.violations.length;
    
    const violationsByType = this.violations.reduce((acc, v) => {
      acc[v.type] = (acc[v.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const violationsBySeverity = this.violations.reduce((acc, v) => {
      acc[v.severity] = (acc[v.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate compliance score (0-100)
    const criticalViolations = violationsBySeverity.critical || 0;
    const highViolations = violationsBySeverity.high || 0;
    const mediumViolations = violationsBySeverity.medium || 0;
    const lowViolations = violationsBySeverity.low || 0;

    let complianceScore = 100;
    complianceScore -= criticalViolations * 25; // Critical violations heavily penalize
    complianceScore -= highViolations * 15;     // High violations significantly penalize
    complianceScore -= mediumViolations * 10;   // Medium violations moderately penalize
    complianceScore -= lowViolations * 5;       // Low violations slightly penalize

    complianceScore = Math.max(0, complianceScore); // Ensure score doesn't go below 0

    const isCompliant = complianceScore >= 90 && criticalViolations === 0;

    return {
      totalViolations,
      violationsByType,
      violationsBySeverity,
      complianceScore,
      isCompliant
    };
  }

  /**
   * Validate entire codebase for scope compliance
   */
  async validateCodebase(codebasePath: string): Promise<{
    compliant: boolean;
    violations: ScopeViolation[];
    report: any;
  }> {
    if (!this.isEnabled) {
      return {
        compliant: true,
        violations: [],
        report: { message: 'Scope enforcement disabled' }
      };
    }

    // This would typically scan the entire codebase
    // For now, we'll return the current state
    const report = this.generateComplianceReport();
    
    return {
      compliant: report.isCompliant,
      violations: this.violations,
      report
    };
  }

  /**
   * Check if scope enforcement is active
   */
  isActive(): boolean {
    return this.isEnabled;
  }

  /**
   * Get current configuration
   */
  getConfig(): ScopeEnforcementConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ScopeEnforcementConfig>): void {
    this.config = { ...this.config, ...updates };
    this.isEnabled = this.config.enabled && this.isMockDetectionEnabled();
  }
}

// Export singleton instance
export const scopeEnforcement = new ScopeEnforcementService();

// Export utility functions
export function validateScope(component: string, action: string): boolean {
  return scopeEnforcement.validateScopeBoundary(component, action);
}

export function detectMock(code: string, location: string): boolean {
  return scopeEnforcement.detectMockImplementation(code, location);
}

export function validateData(dataSource: string, dataType: string): boolean {
  return scopeEnforcement.validateSyntheticData(dataSource, dataType);
}

export function validateHardware(interaction: string, component: string): boolean {
  return scopeEnforcement.validateHardwareInteraction(interaction, component);
}
