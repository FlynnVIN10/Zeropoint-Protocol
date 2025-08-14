/**
 * Data Governance Types for tinygrad Training Recipes
 * Phase C1: Data & Governance Implementation
 * 
 * This module defines the core types for dataset validation, PII scanning,
 * license compliance, and audit logging required for safe AI training.
 */

export interface DatasetMetadata {
  /** Unique identifier for the dataset */
  id: string;
  
  /** Human-readable name */
  name: string;
  
  /** Version string (semantic versioning) */
  version: string;
  
  /** Source/origin of the dataset */
  source: DatasetSource;
  
  /** License information */
  license: LicenseInfo;
  
  /** Content type and format */
  contentType: ContentType;
  
  /** Size in bytes */
  sizeBytes: number;
  
  /** Number of samples/records */
  sampleCount: number;
  
  /** Checksums for integrity verification */
  checksums: ChecksumInfo;
  
  /** PII scanning results */
  piiScan: PIIScanResult;
  
  /** License compliance status */
  licenseCompliance: LicenseComplianceStatus;
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last modification timestamp */
  updatedAt: Date;
  
  /** Approval status */
  approvalStatus: ApprovalStatus;
  
  /** Approval metadata */
  approval?: ApprovalInfo;
}

export interface DatasetSource {
  /** Source type (e.g., "public", "licensed", "synthetic") */
  type: 'public' | 'licensed' | 'synthetic' | 'custom';
  
  /** Source URL or identifier */
  url?: string;
  
  /** Organization or entity providing the data */
  organization?: string;
  
  /** Contact information for data source */
  contact?: string;
  
  /** Geographic origin if applicable */
  geographicOrigin?: string;
  
  /** Collection date range */
  collectionDateRange?: {
    start: Date;
    end: Date;
  };
}

export interface LicenseInfo {
  /** License type (e.g., "MIT", "Apache-2.0", "CC-BY-4.0") */
  type: string;
  
  /** License URL */
  url?: string;
  
  /** License text */
  text?: string;
  
  /** Usage restrictions */
  restrictions?: string[];
  
  /** Attribution requirements */
  attributionRequired?: boolean;
  
  /** Commercial use allowed */
  commercialUseAllowed?: boolean;
  
  /** Modification allowed */
  modificationAllowed?: boolean;
  
  /** Distribution allowed */
  distributionAllowed?: boolean;
}

export interface ContentType {
  /** Primary content type */
  primary: 'text' | 'image' | 'audio' | 'video' | 'multimodal' | 'tabular' | 'graph';
  
  /** Specific format */
  format: string;
  
  /** Language(s) if text-based */
  languages?: string[];
  
  /** Domain/topic area */
  domain?: string;
  
  /** Quality indicators */
  quality?: {
    /** Data quality score (0-1) */
    score: number;
    /** Quality assessment method */
    method: string;
    /** Quality assessment date */
    assessedAt: Date;
  };
}

export interface ChecksumInfo {
  /** SHA-256 hash for integrity verification */
  sha256: string;
  
  /** MD5 hash (legacy support) */
  md5?: string;
  
  /** Blake3 hash (if available) */
  blake3?: string;
  
  /** Checksum generation timestamp */
  generatedAt: Date;
  
  /** Checksum generation method */
  method: string;
}

export interface PIIScanResult {
  /** Overall PII risk level */
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  /** PII types detected */
  detectedTypes: PIIType[];
  
  /** Sample PII instances found */
  samples: PIIInstance[];
  
  /** Total PII instances found */
  totalInstances: number;
  
  /** PII density (instances per sample) */
  density: number;
  
  /** Scanning timestamp */
  scannedAt: Date;
  
  /** Scanning tool version */
  toolVersion: string;
  
  /** Mitigation recommendations */
  recommendations: string[];
  
  /** Whether PII has been mitigated */
  mitigated: boolean;
  
  /** Mitigation method if applied */
  mitigationMethod?: string;
}

export interface PIIType {
  /** PII category */
  category: 'personal' | 'financial' | 'medical' | 'biometric' | 'location' | 'other';
  
  /** Specific PII type */
  type: string;
  
  /** Description */
  description: string;
  
  /** Risk level for this type */
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  /** Regulatory implications */
  regulations?: string[];
}

export interface PIIInstance {
  /** PII type */
  type: string;
  
  /** Sample text containing PII */
  sample: string;
  
  /** Line number in dataset */
  lineNumber?: number;
  
  /** Confidence score (0-1) */
  confidence: number;
  
  /** Whether this is a false positive */
  isFalsePositive?: boolean;
}

export interface LicenseComplianceStatus {
  /** Overall compliance status */
  status: 'compliant' | 'non-compliant' | 'requires-review' | 'unknown';
  
  /** Compliance checks performed */
  checks: ComplianceCheck[];
  
  /** Compliance score (0-1) */
  score: number;
  
  /** Compliance assessment date */
  assessedAt: Date;
  
  /** Compliance issues found */
  issues: ComplianceIssue[];
  
  /** Whether compliance issues have been resolved */
  resolved: boolean;
}

export interface ComplianceCheck {
  /** Check name */
  name: string;
  
  /** Check description */
  description: string;
  
  /** Check result */
  result: 'pass' | 'fail' | 'warning' | 'error';
  
  /** Check details */
  details?: string;
  
  /** Check timestamp */
  timestamp: Date;
}

export interface ComplianceIssue {
  /** Issue severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Issue description */
  description: string;
  
  /** Issue category */
  category: 'license' | 'attribution' | 'restriction' | 'usage' | 'other';
  
  /** Recommended action */
  recommendedAction: string;
  
  /** Whether issue has been resolved */
  resolved: boolean;
  
  /** Resolution method if resolved */
  resolutionMethod?: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'requires-changes';

export interface ApprovalInfo {
  /** Approval decision */
  decision: 'approved' | 'rejected' | 'requires-changes';
  
  /** Approver information */
  approver: string;
  
  /** Approval timestamp */
  timestamp: Date;
  
  /** Approval comments */
  comments?: string;
  
  /** Required changes if any */
  requiredChanges?: string[];
  
  /** Approval criteria met */
  criteriaMet: string[];
}

export interface DatasetManifest {
  /** Manifest version */
  version: string;
  
  /** Generated timestamp */
  generatedAt: Date;
  
  /** Dataset entries */
  datasets: DatasetMetadata[];
  
  /** Policy information */
  policy: DataPolicy;
  
  /** Audit trail */
  auditTrail: AuditEntry[];
}

export interface DataPolicy {
  /** Policy version */
  version: string;
  
  /** Policy effective date */
  effectiveDate: Date;
  
  /** Allowed data sources */
  allowedSources: string[];
  
  /** Denied data sources */
  deniedSources: string[];
  
  /** Allowed license types */
  allowedLicenses: string[];
  
  /** Denied license types */
  deniedLicenses: string[];
  
  /** Maximum PII risk level allowed */
  maxPIIRiskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  
  /** Required compliance checks */
  requiredComplianceChecks: string[];
  
  /** Data retention policy */
  retentionPolicy: RetentionPolicy;
  
  /** Usage restrictions */
  usageRestrictions: string[];
}

export interface RetentionPolicy {
  /** Retention period in days */
  retentionDays: number;
  
  /** Whether data can be archived */
  archivingAllowed: boolean;
  
  /** Whether data can be deleted */
  deletionAllowed: boolean;
  
  /** Data disposal method */
  disposalMethod: string;
}

export interface AuditEntry {
  /** Unique audit entry ID */
  id: string;
  
  /** Event timestamp */
  timestamp: Date;
  
  /** Event type */
  eventType: AuditEventType;
  
  /** User/actor performing the action */
  actor: string;
  
  /** Action performed */
  action: string;
  
  /** Target resource */
  resource: string;
  
  /** Event details */
  details: Record<string, any>;
  
  /** Event outcome */
  outcome: 'success' | 'failure' | 'warning';
  
  /** Related dataset IDs if applicable */
  datasetIds?: string[];
  
  /** Compliance implications */
  complianceImplications?: string[];
}

export type AuditEventType = 
  | 'dataset_upload'
  | 'dataset_scan'
  | 'dataset_approval'
  | 'dataset_rejection'
  | 'policy_update'
  | 'compliance_check'
  | 'pii_mitigation'
  | 'license_validation'
  | 'audit_review'
  | 'system_access'
  | 'checksum_generation'
  | 'checksum_verification'
  | 'manifest_creation';

export interface GovernanceConfig {
  /** PII scanning configuration */
  piiScanning: PIIScanConfig;
  
  /** License validation configuration */
  licenseValidation: LicenseValidationConfig;
  
  /** Compliance checking configuration */
  complianceChecking: ComplianceCheckingConfig;
  
  /** Audit logging configuration */
  auditLogging: AuditLoggingConfig;
}

export interface PIIScanConfig {
  /** Whether PII scanning is enabled */
  enabled: boolean;
  
  /** PII detection threshold (0-1) */
  detectionThreshold: number;
  
  /** Maximum false positive rate allowed */
  maxFalsePositiveRate: number;
  
  /** PII types to scan for */
  scanTypes: string[];
  
  /** Custom PII patterns */
  customPatterns?: RegExp[];
  
  /** Scanning tool configuration */
  toolConfig: Record<string, any>;
}

export interface LicenseValidationConfig {
  /** Whether license validation is enabled */
  enabled: boolean;
  
  /** Allowed license types */
  allowedLicenses: string[];
  
  /** License validation rules */
  validationRules: LicenseValidationRule[];
  
  /** Automatic compliance checking */
  autoComplianceCheck: boolean;
}

export interface LicenseValidationRule {
  /** Rule name */
  name: string;
  
  /** Rule description */
  description: string;
  
  /** Rule condition */
  condition: string;
  
  /** Rule action */
  action: 'allow' | 'deny' | 'require-review';
  
  /** Rule priority */
  priority: number;
}

export interface ComplianceCheckingConfig {
  /** Whether compliance checking is enabled */
  enabled: boolean;
  
  /** Required compliance checks */
  requiredChecks: string[];
  
  /** Compliance thresholds */
  thresholds: Record<string, number>;
  
  /** Automatic issue resolution */
  autoResolution: boolean;
}

export interface AuditLoggingConfig {
  /** Whether audit logging is enabled */
  enabled: boolean;
  
  /** Log retention period in days */
  retentionDays: number;
  
  /** Log format */
  format: 'json' | 'jsonl' | 'csv';
  
  /** Log destination */
  destination: 'file' | 'database' | 'external';
  
  /** Log level */
  level: 'debug' | 'info' | 'warn' | 'error';
}

export interface GovernanceReport {
  /** Report generation timestamp */
  generatedAt: Date;
  
  /** Report period */
  period: {
    start: Date;
    end: Date;
  };
  
  /** Overall governance status */
  status: 'healthy' | 'warning' | 'critical';
  
  /** Dataset summary */
  datasetSummary: {
    total: number;
    compliant: number;
    nonCompliant: number;
    pendingReview: number;
  };
  
  /** PII summary */
  piiSummary: {
    totalScanned: number;
    highRisk: number;
    mitigated: number;
    outstanding: number;
  };
  
  /** Compliance summary */
  complianceSummary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  
  /** Policy violations */
  policyViolations: PolicyViolation[];
  
  /** Recommendations */
  recommendations: string[];
}

export interface PolicyViolation {
  /** Violation severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Violation description */
  description: string;
  
  /** Affected datasets */
  affectedDatasets: string[];
  
  /** Violation timestamp */
  timestamp: Date;
  
  /** Whether violation has been resolved */
  resolved: boolean;
  
  /** Resolution method if resolved */
  resolutionMethod?: string;
}
