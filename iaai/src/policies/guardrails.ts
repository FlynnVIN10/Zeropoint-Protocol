/**
 * Policies and Guardrails - Security and safety enforcement
 *
 * @fileoverview Enforces allowed paths, secrets, limits, and security policies
 * @author Dev Team
 * @version 1.0.0
 */

import { auditSystem } from "../audit";

// Types and interfaces
export interface SecurityPolicy {
  allowedPaths: string[];
  deniedPaths: string[];
  allowedDomains: string[];
  deniedDomains: string[];
  allowedFileTypes: string[];
  deniedFileTypes: string[];
  maxFileSize: number;
  maxNetworkPayload: number;
  maxExecutionTime: number;
  maxMemoryUsage: number;
  maxCPUUsage: number;
  maxTokenUsage: number;
  maxNetworkRequests: number;
  maxFileOperations: number;
}

export interface SecretPolicy {
  allowedSecrets: string[];
  deniedSecrets: string[];
  secretPatterns: RegExp[];
  redactionRules: RedactionRule[];
  encryptionRequired: boolean;
  auditSecrets: boolean;
}

export interface RedactionRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

export interface AccessControl {
  allowedUsers: string[];
  allowedRoles: string[];
  allowedIPs: string[];
  deniedIPs: string[];
  timeRestrictions: TimeRestriction[];
  rateLimits: RateLimit[];
}

export interface TimeRestriction {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startHour: number; // 0-23
  endHour: number; // 0-23
  timezone: string;
}

export interface RateLimit {
  resource: string;
  maxRequests: number;
  timeWindow: number; // milliseconds
  burstLimit: number;
}

export interface PolicyViolation {
  type: "security" | "quota" | "access" | "secret";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  details: Record<string, any>;
  timestamp: number;
  agentId?: string;
  taskId?: string;
}

export interface GuardrailResult {
  allowed: boolean;
  violations: PolicyViolation[];
  warnings: string[];
  auditTrail: any[];
}

/**
 * Policies and Guardrails Class
 * Enforces security, safety, and access control policies
 */
export class PoliciesGuardrails {
  private securityPolicy: SecurityPolicy;
  private secretPolicy: SecretPolicy;
  private accessControl: AccessControl;
  private violations: PolicyViolation[] = [];
  private rateLimitCounters: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(
    securityPolicy: SecurityPolicy,
    secretPolicy: SecretPolicy,
    accessControl: AccessControl,
  ) {
    this.securityPolicy = securityPolicy;
    this.secretPolicy = secretPolicy;
    this.accessControl = accessControl;
  }

  /**
   * Check if a file path is allowed
   */
  async checkFilePath(
    path: string,
    operation: "read" | "write",
  ): Promise<GuardrailResult> {
    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    try {
      // Check denied paths first
      for (const deniedPath of this.securityPolicy.deniedPaths) {
        if (path.includes(deniedPath) || path.startsWith(deniedPath)) {
          violations.push({
            type: "security",
            severity: "high",
            description: `Access denied to restricted path: ${path}`,
            details: {
              path,
              operation,
              deniedPath,
              reason: "Path explicitly denied",
            },
            timestamp: Date.now(),
          });
        }
      }

      // Check allowed paths
      let pathAllowed = false;
      for (const allowedPath of this.securityPolicy.allowedPaths) {
        if (path.startsWith(allowedPath)) {
          pathAllowed = true;
          break;
        }
      }

      if (!pathAllowed) {
        violations.push({
          type: "security",
          severity: "medium",
          description: `Path not in allowed list: ${path}`,
          details: {
            path,
            operation,
            allowedPaths: this.securityPolicy.allowedPaths,
            reason: "Path not explicitly allowed",
          },
          timestamp: Date.now(),
        });
      }

      // Check file type restrictions
      const fileExtension = path.split(".").pop()?.toLowerCase();
      if (fileExtension) {
        if (this.securityPolicy.deniedFileTypes.includes(fileExtension)) {
          violations.push({
            type: "security",
            severity: "high",
            description: `File type denied: ${fileExtension}`,
            details: {
              path,
              fileExtension,
              deniedFileTypes: this.securityPolicy.deniedFileTypes,
              reason: "File type explicitly denied",
            },
            timestamp: Date.now(),
          });
        }
      }

      // Log access attempt
      await auditSystem.logSuccess(
        "file_access_checked",
        "policies_guardrails",
        {
          path,
          operation,
          allowed: violations.length === 0,
          violationCount: violations.length,
        },
      );

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        auditTrail: [],
      };
    } catch (error) {
      await auditSystem.logFailure(
        "file_path_check_failed",
        "policies_guardrails",
        error.message,
        { path, operation, error: error.message },
      );

      return {
        allowed: false,
        violations: [
          {
            type: "security",
            severity: "critical",
            description: `Error checking file path: ${error.message}`,
            details: { path, operation, error: error.message },
            timestamp: Date.now(),
          },
        ],
        warnings: [],
        auditTrail: [],
      };
    }
  }

  /**
   * Check if a network request is allowed
   */
  async checkNetworkRequest(
    url: string,
    method: string,
    payloadSize: number,
  ): Promise<GuardrailResult> {
    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;

      // Check denied domains
      for (const deniedDomain of this.securityPolicy.deniedDomains) {
        if (domain.includes(deniedDomain) || domain === deniedDomain) {
          violations.push({
            type: "security",
            severity: "high",
            description: `Network access denied to restricted domain: ${domain}`,
            details: {
              url,
              domain,
              method,
              deniedDomain,
              reason: "Domain explicitly denied",
            },
            timestamp: Date.now(),
          });
        }
      }

      // Check allowed domains
      let domainAllowed = false;
      for (const allowedDomain of this.securityPolicy.allowedDomains) {
        if (domain.includes(allowedDomain) || domain === allowedDomain) {
          domainAllowed = true;
          break;
        }
      }

      if (!domainAllowed) {
        violations.push({
          type: "security",
          severity: "medium",
          description: `Domain not in allowed list: ${domain}`,
          details: {
            url,
            domain,
            method,
            allowedDomains: this.securityPolicy.allowedDomains,
            reason: "Domain not explicitly allowed",
          },
          timestamp: Date.now(),
        });
      }

      // Check payload size
      if (payloadSize > this.securityPolicy.maxNetworkPayload) {
        violations.push({
          type: "quota",
          severity: "medium",
          description: `Network payload size exceeds limit: ${payloadSize} > ${this.securityPolicy.maxNetworkPayload}`,
          details: {
            url,
            payloadSize,
            maxPayloadSize: this.securityPolicy.maxNetworkPayload,
            reason: "Payload size limit exceeded",
          },
          timestamp: Date.now(),
        });
      }

      // Check rate limits
      const rateLimitKey = `network:${domain}`;
      const rateLimitResult = this.checkRateLimit(
        rateLimitKey,
        this.accessControl.rateLimits.find((r) => r.resource === "network"),
      );
      if (!rateLimitResult.allowed) {
        violations.push({
          type: "quota",
          severity: "medium",
          description: `Rate limit exceeded for network requests to: ${domain}`,
          details: {
            url,
            domain,
            rateLimitKey,
            reason: "Rate limit exceeded",
          },
          timestamp: Date.now(),
        });
      }

      // Log network check
      await auditSystem.logSuccess(
        "network_request_checked",
        "policies_guardrails",
        {
          url,
          domain,
          method,
          payloadSize,
          allowed: violations.length === 0,
          violationCount: violations.length,
        },
      );

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        auditTrail: [],
      };
    } catch (error) {
      await auditSystem.logFailure(
        "network_request_check_failed",
        "policies_guardrails",
        error.message,
        { url, method, payloadSize, error: error.message },
      );

      return {
        allowed: false,
        violations: [
          {
            type: "security",
            severity: "critical",
            description: `Error checking network request: ${error.message}`,
            details: { url, method, payloadSize, error: error.message },
            timestamp: Date.now(),
          },
        ],
        warnings: [],
        auditTrail: [],
      };
    }
  }

  /**
   * Check if content contains secrets
   */
  async checkSecrets(content: string): Promise<GuardrailResult> {
    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    try {
      // Check for denied secrets
      for (const deniedSecret of this.secretPolicy.deniedSecrets) {
        if (content.includes(deniedSecret)) {
          violations.push({
            type: "secret",
            severity: "critical",
            description: `Denied secret found in content: ${deniedSecret}`,
            details: {
              secretType: "denied_secret",
              secret: deniedSecret,
              reason: "Secret explicitly denied",
            },
            timestamp: Date.now(),
          });
        }
      }

      // Check for secret patterns
      for (const pattern of this.secretPolicy.secretPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push({
            type: "secret",
            severity: "high",
            description: `Secret pattern detected: ${pattern.source}`,
            details: {
              secretType: "pattern_match",
              pattern: pattern.source,
              matches: matches.length,
              reason: "Content matches secret pattern",
            },
            timestamp: Date.now(),
          });
        }
      }

      // Log secret check
      await auditSystem.logSuccess("secrets_checked", "policies_guardrails", {
        contentLength: content.length,
        violationCount: violations.length,
        warningCount: warnings.length,
      });

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        auditTrail: [],
      };
    } catch (error) {
      await auditSystem.logFailure(
        "secrets_check_failed",
        "policies_guardrails",
        error.message,
        { contentLength: content.length, error: error.message },
      );

      return {
        allowed: false,
        violations: [
          {
            type: "secret",
            severity: "critical",
            description: `Error checking secrets: ${error.message}`,
            details: { contentLength: content.length, error: error.message },
            timestamp: Date.now(),
          },
        ],
        warnings: [],
        auditTrail: [],
      };
    }
  }

  /**
   * Check access control
   */
  async checkAccessControl(
    user: string,
    role: string,
    ip: string,
  ): Promise<GuardrailResult> {
    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    try {
      // Check user access
      if (!this.accessControl.allowedUsers.includes(user)) {
        violations.push({
          type: "access",
          severity: "high",
          description: `User not in allowed list: ${user}`,
          details: {
            user,
            allowedUsers: this.accessControl.allowedUsers,
            reason: "User not explicitly allowed",
          },
          timestamp: Date.now(),
        });
      }

      // Check role access
      if (!this.accessControl.allowedRoles.includes(role)) {
        violations.push({
          type: "access",
          severity: "medium",
          description: `Role not in allowed list: ${role}`,
          details: {
            user,
            role,
            allowedRoles: this.accessControl.allowedRoles,
            reason: "Role not explicitly allowed",
          },
          timestamp: Date.now(),
        });
      }

      // Check IP restrictions
      for (const deniedIP of this.accessControl.deniedIPs) {
        if (ip === deniedIP || ip.startsWith(deniedIP)) {
          violations.push({
            type: "access",
            severity: "high",
            description: `Access denied from IP: ${ip}`,
            details: {
              user,
              ip,
              deniedIP,
              reason: "IP explicitly denied",
            },
            timestamp: Date.now(),
          });
        }
      }

      // Check time restrictions
      const now = new Date();
      const currentDay = now.getDay();
      const currentHour = now.getHours();

      for (const restriction of this.accessControl.timeRestrictions) {
        if (restriction.dayOfWeek === currentDay) {
          if (
            currentHour < restriction.startHour ||
            currentHour >= restriction.endHour
          ) {
            violations.push({
              type: "access",
              severity: "medium",
              description: `Access denied outside allowed hours`,
              details: {
                user,
                currentDay,
                currentHour,
                restriction,
                reason: "Outside allowed time window",
              },
              timestamp: Date.now(),
            });
          }
        }
      }

      // Log access check
      await auditSystem.logSuccess(
        "access_control_checked",
        "policies_guardrails",
        {
          user,
          role,
          ip,
          allowed: violations.length === 0,
          violationCount: violations.length,
        },
      );

      return {
        allowed: violations.length === 0,
        violations,
        warnings,
        auditTrail: [],
      };
    } catch (error) {
      await auditSystem.logFailure(
        "access_control_check_failed",
        "policies_guardrails",
        error.message,
        { user, role, ip, error: error.message },
      );

      return {
        allowed: false,
        violations: [
          {
            type: "access",
            severity: "critical",
            description: `Error checking access control: ${error.message}`,
            details: { user, role, ip, error: error.message },
            timestamp: Date.now(),
          },
        ],
        warnings: [],
        auditTrail: [],
      };
    }
  }

  /**
   * Check rate limits
   */
  private checkRateLimit(
    key: string,
    rateLimit?: RateLimit,
  ): { allowed: boolean; remaining: number } {
    if (!rateLimit) {
      return { allowed: true, remaining: -1 };
    }

    const now = Date.now();
    const counter = this.rateLimitCounters.get(key);

    if (!counter || now > counter.resetTime) {
      // Reset counter
      this.rateLimitCounters.set(key, {
        count: 1,
        resetTime: now + rateLimit.timeWindow,
      });
      return { allowed: true, remaining: rateLimit.maxRequests - 1 };
    }

    if (counter.count >= rateLimit.maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    counter.count++;
    return { allowed: true, remaining: rateLimit.maxRequests - counter.count };
  }

  /**
   * Get policy violations
   */
  getPolicyViolations(): PolicyViolation[] {
    return [...this.violations];
  }

  /**
   * Get policy statistics
   */
  getPolicyStats(): {
    totalViolations: number;
    violationsByType: Record<string, number>;
    violationsBySeverity: Record<string, number>;
    recentViolations: PolicyViolation[];
  } {
    const stats = {
      totalViolations: this.violations.length,
      violationsByType: {} as Record<string, number>,
      violationsBySeverity: {} as Record<string, number>,
      recentViolations: this.violations
        .filter((v) => Date.now() - v.timestamp < 24 * 60 * 60 * 1000) // Last 24 hours
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10),
    };

    // Count by type
    for (const violation of this.violations) {
      stats.violationsByType[violation.type] =
        (stats.violationsByType[violation.type] || 0) + 1;
      stats.violationsBySeverity[violation.severity] =
        (stats.violationsBySeverity[violation.severity] || 0) + 1;
    }

    return stats;
  }

  /**
   * Clear old violations
   */
  clearOldViolations(maxAge: number): number {
    const cutoff = Date.now() - maxAge;
    const initialCount = this.violations.length;
    this.violations = this.violations.filter((v) => v.timestamp > cutoff);
    return initialCount - this.violations.length;
  }
}

// Default security policy
export const defaultSecurityPolicy: SecurityPolicy = {
  allowedPaths: ["/tmp", "/var/tmp", "/app/data", "/workspace"],
  deniedPaths: ["/etc", "/var/log", "/root", "/home", "/proc", "/sys"],
  allowedDomains: ["api.zeropointprotocol.ai", "github.com", "api.github.com"],
  deniedDomains: ["localhost", "127.0.0.1", "0.0.0.0", "192.168.", "10."],
  allowedFileTypes: [
    "txt",
    "md",
    "json",
    "yaml",
    "yml",
    "ts",
    "js",
    "py",
    "sh",
  ],
  deniedFileTypes: ["exe", "bat", "cmd", "com", "pif", "scr", "vbs", "jar"],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxNetworkPayload: 5 * 1024 * 1024, // 5MB
  maxExecutionTime: 30 * 60 * 1000, // 30 minutes
  maxMemoryUsage: 200, // 200MB
  maxCPUUsage: 2, // 2 CPU cores
  maxTokenUsage: 10000, // 10,000 tokens
  maxNetworkRequests: 500, // 500 requests per hour
  maxFileOperations: 1000, // 1,000 operations per hour
};

// Default secret policy
export const defaultSecretPolicy: SecretPolicy = {
  allowedSecrets: ["public-key", "non-sensitive-config"],
  deniedSecrets: ["password", "secret", "key", "token", "credential"],
  secretPatterns: [
    /password\s*[:=]\s*['"][^'"]+['"]/gi,
    /secret\s*[:=]\s*['"][^'"]+['"]/gi,
    /api_key\s*[:=]\s*['"][^'"]+['"]/gi,
    /token\s*[:=]\s*['"][^'"]+['"]/gi,
  ],
  redactionRules: [
    {
      pattern: /password\s*[:=]\s*['"][^'"]+['"]/gi,
      replacement: "password: [REDACTED]",
      description: "Redact password values",
    },
    {
      pattern: /secret\s*[:=]\s*['"][^'"]+['"]/gi,
      replacement: "secret: [REDACTED]",
      description: "Redact secret values",
    },
  ],
  encryptionRequired: true,
  auditSecrets: true,
};

// Default access control
export const defaultAccessControl: AccessControl = {
  allowedUsers: ["synthiant-bot", "admin", "dev"],
  allowedRoles: ["bot", "admin", "developer", "reviewer"],
  allowedIPs: ["127.0.0.1", "::1"],
  deniedIPs: ["0.0.0.0"],
  timeRestrictions: [
    {
      dayOfWeek: 0, // Sunday
      startHour: 0,
      endHour: 23,
      timezone: "UTC",
    },
  ],
  rateLimits: [
    {
      resource: "network",
      maxRequests: 100,
      timeWindow: 60 * 60 * 1000, // 1 hour
      burstLimit: 10,
    },
    {
      resource: "file",
      maxRequests: 1000,
      timeWindow: 60 * 60 * 1000, // 1 hour
      burstLimit: 100,
    },
  ],
};
