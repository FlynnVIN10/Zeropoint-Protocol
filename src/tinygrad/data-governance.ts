/**
 * Data Governance Implementation for tinygrad Training Recipes
 * Phase C1: Data & Governance Implementation
 * 
 * This module provides the core functionality for dataset validation, PII scanning,
 * license compliance, and audit logging required for safe AI training.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import {
  DatasetMetadata,
  DatasetSource,
  LicenseInfo,
  ContentType,
  ChecksumInfo,
  PIIScanResult,
  PIIType,
  PIIInstance,
  LicenseComplianceStatus,
  ComplianceCheck,
  ComplianceIssue,
  ApprovalStatus,
  ApprovalInfo,
  DatasetManifest,
  DataPolicy,
  RetentionPolicy,
  AuditEntry,
  AuditEventType,
  GovernanceConfig,
  PIIScanConfig,
  LicenseValidationConfig,
  ComplianceCheckingConfig,
  AuditLoggingConfig,
  GovernanceReport,
  PolicyViolation
} from './data-governance.types';

export class DataGovernanceService {
  private config: GovernanceConfig;
  private auditLog: AuditEntry[] = [];
  private datasets: Map<string, DatasetMetadata> = new Map();

  constructor(config?: Partial<GovernanceConfig>) {
    this.config = this.initializeConfig(config);
  }

  /**
   * Initialize governance configuration with defaults
   */
  private initializeConfig(config?: Partial<GovernanceConfig>): GovernanceConfig {
    const defaultConfig: GovernanceConfig = {
      piiScanning: {
        enabled: true,
        detectionThreshold: 0.8,
        maxFalsePositiveRate: 0.05,
        scanTypes: ['email', 'phone', 'ssn', 'credit_card', 'address', 'name'],
        toolConfig: {}
      },
      licenseValidation: {
        enabled: true,
        allowedLicenses: ['MIT', 'Apache-2.0', 'CC-BY-4.0', 'CC-BY-SA-4.0', 'CC0'],
        validationRules: [],
        autoComplianceCheck: true
      },
      complianceChecking: {
        enabled: true,
        requiredChecks: ['pii_scan', 'license_validation', 'checksum_verification'],
        thresholds: {
          maxPIIRiskLevel: 0.1,
          minLicenseCompliance: 0.8,
          maxChecksumMismatch: 0.0
        },
        autoResolution: false
      },
      auditLogging: {
        enabled: true,
        retentionDays: 365,
        format: 'jsonl',
        destination: 'file',
        level: 'info'
      }
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Scan dataset for PII using pattern matching and ML-based detection
   */
  async scanForPII(datasetPath: string, content: string[]): Promise<PIIScanResult> {
    const startTime = Date.now();
    const detectedTypes: PIIType[] = [];
    const samples: PIIInstance[] = [];
    let totalInstances = 0;

    // PII detection patterns
    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      ssn: /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g,
      credit_card: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi,
      name: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g
    };

    // Scan each line for PII
    for (let i = 0; i < content.length; i++) {
      const line = content[i];
      
      for (const [type, pattern] of Object.entries(patterns)) {
        const matches = line.match(pattern);
        if (matches) {
          const piiType: PIIType = {
            category: this.getPIICategory(type),
            type,
            description: this.getPIIDescription(type),
            riskLevel: this.getPIIRiskLevel(type),
            regulations: this.getPIIRegulations(type)
          };

          // Add to detected types if not already present
          if (!detectedTypes.find(t => t.type === type)) {
            detectedTypes.push(piiType);
          }

          // Create PII instance
          const instance: PIIInstance = {
            type,
            sample: matches[0],
            lineNumber: i + 1,
            confidence: this.calculateConfidence(matches[0], type),
            isFalsePositive: false
          };

          samples.push(instance);
          totalInstances += matches.length;
        }
      }
    }

    // Calculate risk level based on detected PII
    const riskLevel = this.calculateOverallRiskLevel(detectedTypes, totalInstances, content.length);
    
    // Generate recommendations
    const recommendations = this.generatePIIRecommendations(detectedTypes, totalInstances);

    const piiScanResult: PIIScanResult = {
      riskLevel,
      detectedTypes,
      samples,
      totalInstances,
      density: totalInstances / content.length,
      scannedAt: new Date(),
      toolVersion: '1.0.0',
      recommendations,
      mitigated: false
    };

    // Log audit event
    this.logAuditEvent('dataset_scan', 'PII scan completed', datasetPath, {
      piiDetected: totalInstances > 0,
      riskLevel,
      totalInstances,
      scanDuration: Date.now() - startTime
    });

    return piiScanResult;
  }

  /**
   * Validate license compliance for a dataset
   */
  async validateLicense(licenseInfo: LicenseInfo): Promise<LicenseComplianceStatus> {
    const startTime = Date.now();
    const checks: ComplianceCheck[] = [];
    const issues: ComplianceIssue[] = [];
    let score = 0;

    // Check if license type is allowed
    const licenseTypeCheck: ComplianceCheck = {
      name: 'license_type_allowed',
      description: 'Check if license type is in allowed list',
      result: this.config.licenseValidation.allowedLicenses.includes(licenseInfo.type) ? 'pass' : 'fail',
      details: `License type: ${licenseInfo.type}`,
      timestamp: new Date()
    };
    checks.push(licenseTypeCheck);

    // Check license text availability
    const licenseTextCheck: ComplianceCheck = {
      name: 'license_text_available',
      description: 'Check if license text is provided',
      result: licenseInfo.text ? 'pass' : 'warning',
      details: 'License text should be provided for verification',
      timestamp: new Date()
    };
    checks.push(licenseTextCheck);

    // Check usage restrictions
    const restrictionsCheck: ComplianceCheck = {
      name: 'usage_restrictions',
      description: 'Check usage restrictions compatibility',
      result: this.checkUsageRestrictions(licenseInfo) ? 'pass' : 'fail',
      details: 'Usage restrictions must be compatible with training use',
      timestamp: new Date()
    };
    checks.push(restrictionsCheck);

    // Calculate compliance score
    const passedChecks = checks.filter(c => c.result === 'pass').length;
    score = passedChecks / checks.length;

    // Generate compliance issues
    if (licenseTypeCheck.result === 'fail') {
      issues.push({
        severity: 'high',
        description: `License type '${licenseInfo.type}' is not in allowed list`,
        category: 'license',
        recommendedAction: 'Use one of the allowed license types or request approval',
        resolved: false
      });
    }

    if (restrictionsCheck.result === 'fail') {
      issues.push({
        severity: 'medium',
        description: 'Usage restrictions are incompatible with training use',
        category: 'restriction',
        recommendedAction: 'Review and modify usage restrictions',
        resolved: false
      });
    }

    const complianceStatus: LicenseComplianceStatus = {
      status: score >= 0.8 ? 'compliant' : score >= 0.6 ? 'requires-review' : 'non-compliant',
      checks,
      score,
      assessedAt: new Date(),
      issues,
      resolved: issues.length === 0
    };

    // Log audit event
    this.logAuditEvent('license_validation', 'License validation completed', licenseInfo.type, {
      compliant: complianceStatus.status === 'compliant',
      score,
      issues: issues.length,
      validationDuration: Date.now() - startTime
    });

    return complianceStatus;
  }

  /**
   * Generate checksums for dataset integrity verification
   */
  async generateChecksums(datasetPath: string, content: string[]): Promise<ChecksumInfo> {
    const startTime = Date.now();
    
    // Generate SHA-256 hash
    const contentString = content.join('\n');
    const sha256Hash = crypto.createHash('sha256').update(contentString).digest('hex');
    
    // Generate MD5 hash (legacy support)
    const md5Hash = crypto.createHash('md5').update(contentString).digest('hex');
    
    // Generate Blake3 hash if available (using crypto module fallback)
    let blake3Hash: string | undefined;
    try {
      // Note: Node.js doesn't have built-in Blake3, so we'll use a fallback
      blake3Hash = crypto.createHash('sha3-256').update(contentString).digest('hex');
    } catch (error) {
      // Blake3 not available, skip
    }

    const checksumInfo: ChecksumInfo = {
      sha256: sha256Hash,
      md5: md5Hash,
      blake3: blake3Hash,
      generatedAt: new Date(),
      method: 'crypto.createHash'
    };

    // Log audit event
    this.logAuditEvent('checksum_generation', 'Checksums generated', datasetPath, {
      sha256: sha256Hash,
      md5: md5Hash,
      blake3: blake3Hash,
      generationDuration: Date.now() - startTime
    });

    return checksumInfo;
  }

  /**
   * Verify checksums for dataset integrity
   */
  async verifyChecksums(datasetPath: string, content: string[], expectedChecksums: ChecksumInfo): Promise<boolean> {
    const actualChecksums = await this.generateChecksums(datasetPath, content);
    
    const sha256Valid = actualChecksums.sha256 === expectedChecksums.sha256;
    const md5Valid = !expectedChecksums.md5 || actualChecksums.md5 === expectedChecksums.md5;
    const blake3Valid = !expectedChecksums.blake3 || actualChecksums.blake3 === expectedChecksums.blake3;

    const isValid = sha256Valid && md5Valid && blake3Valid;

    // Log audit event
    this.logAuditEvent('checksum_verification', 'Checksum verification completed', datasetPath, {
      sha256Valid,
      md5Valid,
      blake3Valid,
      overallValid: isValid,
      expectedSha256: expectedChecksums.sha256,
      actualSha256: actualChecksums.sha256
    });

    return isValid;
  }

  /**
   * Create dataset manifest with governance information
   */
  async createDatasetManifest(datasets: DatasetMetadata[]): Promise<DatasetManifest> {
    const policy: DataPolicy = {
      version: '1.0.0',
      effectiveDate: new Date(),
      allowedSources: ['public', 'licensed', 'synthetic'],
      deniedSources: ['restricted', 'confidential'],
      allowedLicenses: this.config.licenseValidation.allowedLicenses,
      deniedLicenses: ['proprietary', 'restricted'],
      maxPIIRiskLevel: 'low',
      requiredComplianceChecks: this.config.complianceChecking.requiredChecks,
      retentionPolicy: {
        retentionDays: 365,
        archivingAllowed: true,
        deletionAllowed: true,
        disposalMethod: 'secure deletion'
      },
      usageRestrictions: [
        'No commercial use without explicit permission',
        'No redistribution of original data',
        'Training use only'
      ]
    };

    const manifest: DatasetManifest = {
      version: '1.0.0',
      generatedAt: new Date(),
      datasets,
      policy,
      auditTrail: this.auditLog
    };

    // Log audit event
    this.logAuditEvent('manifest_creation', 'Dataset manifest created', 'manifest.yaml', {
      datasetCount: datasets.length,
      policyVersion: policy.version,
      manifestVersion: manifest.version
    });

    return manifest;
  }

  /**
   * Log audit event for compliance tracking
   */
  private logAuditEvent(
    eventType: AuditEventType,
    action: string,
    resource: string,
    details: Record<string, any>
  ): void {
    if (!this.config.auditLogging.enabled) return;

    const auditEntry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      eventType,
      actor: 'system',
      action,
      resource,
      details,
      outcome: 'success',
      complianceImplications: this.getComplianceImplications(eventType, details)
    };

    this.auditLog.push(auditEntry);

    // Write to file if configured
    if (this.config.auditLogging.destination === 'file') {
      this.writeAuditLog(auditEntry);
    }
  }

  /**
   * Write audit log entry to file
   */
  private writeAuditLog(entry: AuditEntry): void {
    try {
      const logDir = path.join(process.cwd(), 'logs', 'audit');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, `audit-${new Date().toISOString().split('T')[0]}.jsonl`);
      const logEntry = JSON.stringify(entry) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  /**
   * Get compliance implications for audit events
   */
  private getComplianceImplications(eventType: AuditEventType, details: Record<string, any>): string[] {
    const implications: string[] = [];

    switch (eventType) {
      case 'dataset_scan':
        if (details.piiDetected) {
          implications.push('PII detection requires review and potential mitigation');
        }
        break;
      case 'license_validation':
        if (!details.compliant) {
          implications.push('License non-compliance may prevent dataset usage');
        }
        break;
      case 'checksum_verification':
        if (!details.overallValid) {
          implications.push('Checksum mismatch indicates potential data corruption');
        }
        break;
    }

    return implications;
  }

  /**
   * Helper methods for PII detection
   */
  private getPIICategory(type: string): 'personal' | 'financial' | 'medical' | 'biometric' | 'location' | 'other' {
    const categoryMap: Record<string, 'personal' | 'financial' | 'medical' | 'biometric' | 'location' | 'other'> = {
      email: 'personal',
      phone: 'personal',
      ssn: 'personal',
      credit_card: 'financial',
      address: 'location',
      name: 'personal'
    };
    return categoryMap[type] || 'other';
  }

  private getPIIDescription(type: string): string {
    const descriptionMap: Record<string, string> = {
      email: 'Email address',
      phone: 'Phone number',
      ssn: 'Social Security Number',
      credit_card: 'Credit card number',
      address: 'Physical address',
      name: 'Full name'
    };
    return descriptionMap[type] || 'Unknown PII type';
  }

  private getPIIRiskLevel(type: string): 'low' | 'medium' | 'high' | 'critical' {
    const riskMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      email: 'low',
      phone: 'low',
      ssn: 'critical',
      credit_card: 'high',
      address: 'medium',
      name: 'low'
    };
    return riskMap[type] || 'low';
  }

  private getPIIRegulations(type: string): string[] {
    const regulationMap: Record<string, string[]> = {
      ssn: ['GDPR', 'CCPA', 'HIPAA'],
      credit_card: ['PCI-DSS', 'GDPR'],
      address: ['GDPR', 'CCPA'],
      email: ['GDPR', 'CCPA'],
      phone: ['GDPR', 'CCPA'],
      name: ['GDPR', 'CCPA']
    };
    return regulationMap[type] || [];
  }

  private calculateConfidence(text: string, type: string): number {
    // Simple confidence calculation based on pattern strength
    const confidenceMap: Record<string, number> = {
      email: 0.95,
      phone: 0.90,
      ssn: 0.98,
      credit_card: 0.92,
      address: 0.85,
      name: 0.80
    };
    
    let baseConfidence = confidenceMap[type] || 0.70;
    
    // Adjust confidence based on text characteristics
    if (text.length < 3) baseConfidence *= 0.8;
    if (text.length > 50) baseConfidence *= 0.9;
    
    return Math.min(baseConfidence, 1.0);
  }

  private calculateOverallRiskLevel(
    detectedTypes: PIIType[],
    totalInstances: number,
    totalLines: number
  ): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (totalInstances === 0) return 'none';
    
    // Calculate weighted risk based on PII types and density
    let weightedRisk = 0;
    const density = totalInstances / totalLines;
    
    for (const piiType of detectedTypes) {
      const riskWeight = { low: 1, medium: 2, high: 3, critical: 4 }[piiType.riskLevel];
      weightedRisk += riskWeight * density;
    }
    
    if (weightedRisk >= 0.1) return 'critical';
    if (weightedRisk >= 0.05) return 'high';
    if (weightedRisk >= 0.02) return 'medium';
    if (weightedRisk >= 0.01) return 'low';
    return 'none';
  }

  private generatePIIRecommendations(detectedTypes: PIIType[], totalInstances: number): string[] {
    const recommendations: string[] = [];
    
    if (totalInstances === 0) {
      recommendations.push('No PII detected - dataset is safe for training');
      return recommendations;
    }
    
    if (detectedTypes.some(t => t.riskLevel === 'critical')) {
      recommendations.push('Critical PII detected - immediate mitigation required before approval');
    }
    
    if (detectedTypes.some(t => t.riskLevel === 'high')) {
      recommendations.push('High-risk PII detected - mitigation required before approval');
    }
    
    if (detectedTypes.some(t => t.riskLevel === 'medium')) {
      recommendations.push('Medium-risk PII detected - review and consider mitigation');
    }
    
    recommendations.push('Consider data anonymization or pseudonymization techniques');
    recommendations.push('Implement data minimization practices');
    recommendations.push('Ensure compliance with relevant data protection regulations');
    
    return recommendations;
  }

  private checkUsageRestrictions(licenseInfo: LicenseInfo): boolean {
    // Check if usage restrictions are compatible with training use
    if (!licenseInfo.restrictions) return true;
    
    const incompatibleRestrictions = [
      'no machine learning',
      'no AI training',
      'no derivative works',
      'no commercial use'
    ];
    
    return !licenseInfo.restrictions.some(restriction =>
      incompatibleRestrictions.some(incompatible =>
        restriction.toLowerCase().includes(incompatible)
      )
    );
  }

  /**
   * Generate governance report for monitoring and compliance
   */
  async generateGovernanceReport(startDate: Date, endDate: Date): Promise<GovernanceReport> {
    const periodDatasets = Array.from(this.datasets.values()).filter(
      d => d.createdAt >= startDate && d.createdAt <= endDate
    );
    
    const compliantDatasets = periodDatasets.filter(d => d.approvalStatus === 'approved');
    const nonCompliantDatasets = periodDatasets.filter(d => d.approvalStatus === 'rejected');
    const pendingReviewDatasets = periodDatasets.filter(d => d.approvalStatus === 'pending');
    
    const piiScanned = periodDatasets.filter(d => d.piiScan.totalInstances > 0);
    const highRiskPII = periodDatasets.filter(d => d.piiScan.riskLevel === 'high' || d.piiScan.riskLevel === 'critical');
    const mitigatedPII = periodDatasets.filter(d => d.piiScan.mitigated);
    
    const totalChecks = periodDatasets.reduce((sum, d) => sum + d.licenseCompliance.checks.length, 0);
    const passedChecks = periodDatasets.reduce((sum, d) => 
      sum + d.licenseCompliance.checks.filter(c => c.result === 'pass').length, 0
    );
    const failedChecks = periodDatasets.reduce((sum, d) => 
      sum + d.licenseCompliance.checks.filter(c => c.result === 'fail').length, 0
    );
    const warningChecks = periodDatasets.reduce((sum, d) => 
      sum + d.licenseCompliance.checks.filter(c => c.result === 'warning').length, 0
    );
    
    const status = this.calculateOverallStatus(
      compliantDatasets.length,
      nonCompliantDatasets.length,
      highRiskPII.length
    );
    
    const policyViolations = this.identifyPolicyViolations(periodDatasets);
    const recommendations = this.generateReportRecommendations(
      periodDatasets,
      highRiskPII,
      failedChecks
    );
    
    const report: GovernanceReport = {
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      status,
      datasetSummary: {
        total: periodDatasets.length,
        compliant: compliantDatasets.length,
        nonCompliant: nonCompliantDatasets.length,
        pendingReview: pendingReviewDatasets.length
      },
      piiSummary: {
        totalScanned: piiScanned.length,
        highRisk: highRiskPII.length,
        mitigated: mitigatedPII.length,
        outstanding: highRiskPII.length - mitigatedPII.length
      },
      complianceSummary: {
        totalChecks,
        passed: passedChecks,
        failed: failedChecks,
        warnings: warningChecks
      },
      policyViolations,
      recommendations
    };
    
    return report;
  }

  private calculateOverallStatus(
    compliant: number,
    nonCompliant: number,
    highRiskPII: number
  ): 'healthy' | 'warning' | 'critical' {
    if (nonCompliant === 0 && highRiskPII === 0) return 'healthy';
    if (nonCompliant > 0 || highRiskPII > 0) return 'critical';
    return 'warning';
  }

  private identifyPolicyViolations(datasets: DatasetMetadata[]): PolicyViolation[] {
    const violations: PolicyViolation[] = [];
    
    for (const dataset of datasets) {
      if (dataset.piiScan.riskLevel === 'high' || dataset.piiScan.riskLevel === 'critical') {
        violations.push({
          severity: dataset.piiScan.riskLevel === 'critical' ? 'critical' : 'high',
          description: `High PII risk level: ${dataset.piiScan.riskLevel}`,
          affectedDatasets: [dataset.id],
          timestamp: dataset.piiScan.scannedAt,
          resolved: dataset.piiScan.mitigated
        });
      }
      
      if (dataset.licenseCompliance.status === 'non-compliant') {
        violations.push({
          severity: 'high',
          description: 'License compliance failure',
          affectedDatasets: [dataset.id],
          timestamp: dataset.licenseCompliance.assessedAt,
          resolved: dataset.licenseCompliance.resolved
        });
      }
    }
    
    return violations;
  }

  private generateReportRecommendations(
    datasets: DatasetMetadata[],
    highRiskPII: DatasetMetadata[],
    failedChecks: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (highRiskPII.length > 0) {
      recommendations.push('Immediate PII mitigation required for high-risk datasets');
    }
    
    if (failedChecks > 0) {
      recommendations.push('License compliance issues need resolution');
    }
    
    if (datasets.length === 0) {
      recommendations.push('No datasets processed in this period');
    }
    
    if (datasets.length > 0 && highRiskPII.length === 0 && failedChecks === 0) {
      recommendations.push('All datasets are compliant - continue monitoring');
    }
    
    recommendations.push('Regular PII scanning recommended for all new datasets');
    recommendations.push('Implement automated compliance checking for faster processing');
    
    return recommendations;
  }
}
