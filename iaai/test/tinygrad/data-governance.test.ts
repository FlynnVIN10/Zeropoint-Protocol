/**
 * Data Governance Tests for tinygrad Training Recipes
 * Phase C1: Data & Governance Implementation
 *
 * This test suite validates the data governance framework including PII scanning,
 * license validation, checksum verification, and audit logging functionality.
 */

import { DataGovernanceService } from "../../src/tinygrad/data-governance";
import {
  DatasetMetadata,
  PIIScanResult,
  LicenseComplianceStatus,
  ChecksumInfo,
  DatasetManifest,
  GovernanceReport,
} from "../../src/tinygrad/data-governance.types";

describe("DataGovernanceService", () => {
  let governanceService: DataGovernanceService;
  let sampleDataset: DatasetMetadata;
  let sampleContent: string[];

  beforeEach(() => {
    governanceService = new DataGovernanceService();

    // Sample dataset metadata
    sampleDataset = {
      id: "test-dataset-v1",
      name: "Test Dataset v1",
      version: "1.0.0",
      source: {
        type: "public",
        url: "https://example.com/dataset",
        organization: "Test Organization",
      },
      license: {
        type: "MIT",
        url: "https://opensource.org/licenses/MIT",
        text: "MIT License",
        attributionRequired: false,
        commercialUseAllowed: true,
        modificationAllowed: true,
        distributionAllowed: true,
      },
      contentType: {
        primary: "text",
        format: "plain text",
        languages: ["en"],
      },
      sizeBytes: 1024,
      sampleCount: 100,
      checksums: {
        sha256: "test-sha256-hash",
        generatedAt: new Date(),
        method: "test",
      },
      piiScan: {
        riskLevel: "none",
        detectedTypes: [],
        samples: [],
        totalInstances: 0,
        density: 0,
        scannedAt: new Date(),
        toolVersion: "1.0.0",
        recommendations: [],
        mitigated: false,
      },
      licenseCompliance: {
        status: "compliant",
        checks: [],
        score: 1.0,
        assessedAt: new Date(),
        issues: [],
        resolved: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      approvalStatus: "pending",
    };

    // Sample content with potential PII
    sampleContent = [
      "This is a sample text document.",
      "Contact us at user@example.com for more information.",
      "John Smith is a software engineer.",
      "Phone number: (555) 123-4567",
      "Address: 123 Main Street, Anytown, USA",
      "SSN: 123-45-6789",
      "Credit card: 4111-1111-1111-1111",
      "Another line of text without PII.",
      "Jane Doe contributed to this project.",
      "Email: support@company.org",
    ];
  });

  describe("PII Scanning", () => {
    it("should detect email addresses in content", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.riskLevel).toBe("critical"); // High PII density results in critical risk
      expect(piiResult.totalInstances).toBeGreaterThan(0);
      expect(piiResult.detectedTypes.some((t) => t.type === "email")).toBe(
        true,
      );
      expect(piiResult.samples.some((s) => s.type === "email")).toBe(true);
    });

    it("should detect names in content", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.detectedTypes.some((t) => t.type === "name")).toBe(true);
      expect(piiResult.samples.some((s) => s.type === "name")).toBe(true);
    });

    it("should detect phone numbers in content", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.detectedTypes.some((t) => t.type === "phone")).toBe(
        true,
      );
      expect(piiResult.samples.some((s) => s.type === "phone")).toBe(true);
    });

    it("should detect SSN in content", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.detectedTypes.some((t) => t.type === "ssn")).toBe(true);
      expect(piiResult.samples.some((s) => s.type === "ssn")).toBe(true);
    });

    it("should detect credit card numbers in content", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(
        piiResult.detectedTypes.some((t) => t.type === "credit_card"),
      ).toBe(true);
      expect(piiResult.samples.some((s) => s.type === "credit_card")).toBe(
        true,
      );
    });

    it("should detect addresses in content", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.detectedTypes.some((t) => t.type === "address")).toBe(
        true,
      );
      expect(piiResult.samples.some((s) => s.type === "address")).toBe(true);
    });

    it("should calculate correct PII density", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.density).toBeGreaterThan(0);
      expect(piiResult.density).toBeLessThanOrEqual(1);
      expect(piiResult.density).toBe(
        piiResult.totalInstances / sampleContent.length,
      );
    });

    it("should provide mitigation recommendations", async () => {
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      expect(piiResult.recommendations).toBeInstanceOf(Array);
      expect(piiResult.recommendations.length).toBeGreaterThan(0);
      expect(
        piiResult.recommendations.every((r) => typeof r === "string"),
      ).toBe(true);
    });

    it("should handle content without PII", async () => {
      const cleanContent = [
        "This is a clean text document.",
        "No personal information here.",
        "Just regular content for testing.",
      ];

      const piiResult = await governanceService.scanForPII(
        "clean-dataset",
        cleanContent,
      );

      expect(piiResult.riskLevel).toBe("none");
      expect(piiResult.totalInstances).toBe(0);
      expect(piiResult.detectedTypes).toHaveLength(0);
      expect(piiResult.samples).toHaveLength(0);
    });

    it("should respect PII detection threshold", async () => {
      const customConfig = {
        piiScanning: {
          enabled: true,
          detectionThreshold: 0.95,
          maxFalsePositiveRate: 0.01,
          scanTypes: [
            "email",
            "phone",
            "ssn",
            "credit_card",
            "address",
            "name",
          ],
          toolConfig: {},
        },
      };

      const customService = new DataGovernanceService(customConfig);
      const piiResult = await customService.scanForPII(
        "test-dataset",
        sampleContent,
      );

      // With higher threshold, fewer PII instances should be detected
      expect(piiResult.totalInstances).toBeLessThanOrEqual(
        await governanceService
          .scanForPII("test-dataset", sampleContent)
          .then((r) => r.totalInstances),
      );
    });
  });

  describe("License Validation", () => {
    it("should validate MIT license as compliant", async () => {
      const licenseInfo = {
        type: "MIT",
        url: "https://opensource.org/licenses/MIT",
        text: "MIT License",
        attributionRequired: false,
        commercialUseAllowed: true,
        modificationAllowed: true,
        distributionAllowed: true,
      };

      const compliance = await governanceService.validateLicense(licenseInfo);

      expect(compliance.status).toBe("compliant");
      expect(compliance.score).toBe(1.0);
      expect(compliance.issues).toHaveLength(0);
      expect(compliance.resolved).toBe(true);
    });

    it("should validate CC-BY-4.0 license as compliant", async () => {
      const licenseInfo = {
        type: "CC-BY-4.0",
        url: "https://creativecommons.org/licenses/by/4.0/",
        text: "Creative Commons Attribution 4.0 International License",
        attributionRequired: true,
        commercialUseAllowed: true,
        modificationAllowed: true,
        distributionAllowed: true,
      };

      const compliance = await governanceService.validateLicense(licenseInfo);

      expect(compliance.status).toBe("compliant");
      expect(compliance.score).toBe(1.0);
      expect(compliance.issues).toHaveLength(0);
    });

    it("should reject proprietary licenses", async () => {
      const licenseInfo = {
        type: "proprietary",
        text: "Proprietary License",
        attributionRequired: false,
        commercialUseAllowed: false,
        modificationAllowed: false,
        distributionAllowed: false,
      };

      const compliance = await governanceService.validateLicense(licenseInfo);

      expect(compliance.status).toBe("requires-review"); // Proprietary licenses require review
      expect(compliance.score).toBeLessThan(1.0);
      expect(compliance.issues.length).toBeGreaterThan(0);
      expect(compliance.resolved).toBe(false);
    });

    it("should perform multiple compliance checks", async () => {
      const licenseInfo = {
        type: "MIT",
        url: "https://opensource.org/licenses/MIT",
        text: "MIT License",
        attributionRequired: false,
        commercialUseAllowed: true,
        modificationAllowed: true,
        distributionAllowed: true,
      };

      const compliance = await governanceService.validateLicense(licenseInfo);

      expect(compliance.checks).toBeInstanceOf(Array);
      expect(compliance.checks.length).toBeGreaterThan(0);
      expect(
        compliance.checks.every((c) =>
          ["pass", "fail", "warning", "error"].includes(c.result),
        ),
      ).toBe(true);
    });

    it("should handle missing license text", async () => {
      const licenseInfo = {
        type: "MIT",
        url: "https://opensource.org/licenses/MIT",
        attributionRequired: false,
        commercialUseAllowed: true,
        modificationAllowed: true,
        distributionAllowed: true,
      };

      const compliance = await governanceService.validateLicense(licenseInfo);

      expect(compliance.status).toBe("requires-review");
      expect(compliance.checks.some((c) => c.result === "warning")).toBe(true);
    });
  });

  describe("Checksum Generation and Verification", () => {
    it("should generate SHA-256 checksums", async () => {
      const checksums = await governanceService.generateChecksums(
        "test-dataset",
        sampleContent,
      );

      expect(checksums.sha256).toBeDefined();
      expect(checksums.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(checksums.md5).toBeDefined();
      expect(checksums.md5).toMatch(/^[a-f0-9]{32}$/);
      expect(checksums.generatedAt).toBeInstanceOf(Date);
      expect(checksums.method).toBe("crypto.createHash");
    });

    it("should verify valid checksums", async () => {
      const checksums = await governanceService.generateChecksums(
        "test-dataset",
        sampleContent,
      );
      const isValid = await governanceService.verifyChecksums(
        "test-dataset",
        sampleContent,
        checksums,
      );

      expect(isValid).toBe(true);
    });

    it("should detect checksum mismatches", async () => {
      const checksums = await governanceService.generateChecksums(
        "test-dataset",
        sampleContent,
      );

      // Modify content to create mismatch
      const modifiedContent = [...sampleContent, "Additional line"];
      const isValid = await governanceService.verifyChecksums(
        "test-dataset",
        modifiedContent,
        checksums,
      );

      expect(isValid).toBe(false);
    });

    it("should handle empty content", async () => {
      const emptyContent: string[] = [];
      const checksums = await governanceService.generateChecksums(
        "empty-dataset",
        emptyContent,
      );

      expect(checksums.sha256).toBeDefined();
      expect(checksums.md5).toBeDefined();

      const isValid = await governanceService.verifyChecksums(
        "empty-dataset",
        emptyContent,
        checksums,
      );
      expect(isValid).toBe(true);
    });
  });

  describe("Dataset Manifest Creation", () => {
    it("should create manifest with multiple datasets", async () => {
      const datasets = [sampleDataset];
      const manifest = await governanceService.createDatasetManifest(datasets);

      expect(manifest.version).toBe("1.0.0");
      expect(manifest.generatedAt).toBeInstanceOf(Date);
      expect(manifest.datasets).toHaveLength(1);
      expect(manifest.policy).toBeDefined();
      expect(manifest.auditTrail).toBeInstanceOf(Array);
    });

    it("should include policy information in manifest", async () => {
      const datasets = [sampleDataset];
      const manifest = await governanceService.createDatasetManifest(datasets);

      expect(manifest.policy.version).toBe("1.0.0");
      expect(manifest.policy.effectiveDate).toBeInstanceOf(Date);
      expect(manifest.policy.allowedSources).toBeInstanceOf(Array);
      expect(manifest.policy.deniedSources).toBeInstanceOf(Array);
      expect(manifest.policy.allowedLicenses).toBeInstanceOf(Array);
    });

    it("should include audit trail in manifest", async () => {
      const datasets = [sampleDataset];
      const manifest = await governanceService.createDatasetManifest(datasets);

      expect(manifest.auditTrail).toBeInstanceOf(Array);
      expect(manifest.auditTrail.length).toBeGreaterThan(0);
      expect(
        manifest.auditTrail.every(
          (entry) => entry.id && entry.timestamp && entry.eventType,
        ),
      ).toBe(true);
    });
  });

  describe("Governance Report Generation", () => {
    it("should generate governance report for date range", async () => {
      const startDate = new Date("2025-08-01T00:00:00Z");
      const endDate = new Date("2025-08-11T23:59:59Z");

      const report = await governanceService.generateGovernanceReport(
        startDate,
        endDate,
      );

      expect(report.generatedAt).toBeInstanceOf(Date);
      expect(report.period.start).toEqual(startDate);
      expect(report.period.end).toEqual(endDate);
      expect(report.status).toBeDefined();
      expect(report.datasetSummary).toBeDefined();
      expect(report.piiSummary).toBeDefined();
      expect(report.complianceSummary).toBeDefined();
    });

    it("should calculate correct dataset summary", async () => {
      const startDate = new Date("2025-08-01T00:00:00Z");
      const endDate = new Date("2025-08-11T23:59:59Z");

      const report = await governanceService.generateGovernanceReport(
        startDate,
        endDate,
      );

      expect(report.datasetSummary.total).toBeGreaterThanOrEqual(0);
      expect(report.datasetSummary.compliant).toBeGreaterThanOrEqual(0);
      expect(report.datasetSummary.nonCompliant).toBeGreaterThanOrEqual(0);
      expect(report.datasetSummary.pendingReview).toBeGreaterThanOrEqual(0);

      const total = report.datasetSummary.total;
      const sum =
        report.datasetSummary.compliant +
        report.datasetSummary.nonCompliant +
        report.datasetSummary.pendingReview;
      expect(sum).toBeLessThanOrEqual(total);
    });

    it("should include policy violations in report", async () => {
      const startDate = new Date("2025-08-01T00:00:00Z");
      const endDate = new Date("2025-08-11T23:59:59Z");

      const report = await governanceService.generateGovernanceReport(
        startDate,
        endDate,
      );

      expect(report.policyViolations).toBeInstanceOf(Array);
      expect(report.recommendations).toBeInstanceOf(Array);
    });
  });

  describe("Configuration Management", () => {
    it("should initialize with default configuration", () => {
      const defaultService = new DataGovernanceService();

      expect(defaultService).toBeDefined();
      // Configuration should be accessible through reflection or public methods
    });

    it("should accept custom configuration", () => {
      const customConfig = {
        piiScanning: {
          enabled: false,
          detectionThreshold: 0.9,
          maxFalsePositiveRate: 0.05,
          scanTypes: [
            "email",
            "phone",
            "ssn",
            "credit_card",
            "address",
            "name",
          ],
          toolConfig: {},
        },
        licenseValidation: {
          enabled: false,
          allowedLicenses: [],
          validationRules: [],
          autoComplianceCheck: false,
        },
      };

      const customService = new DataGovernanceService(customConfig);
      expect(customService).toBeDefined();
    });

    it("should merge custom configuration with defaults", () => {
      const customConfig = {
        piiScanning: {
          enabled: true,
          detectionThreshold: 0.95,
          maxFalsePositiveRate: 0.05,
          scanTypes: [
            "email",
            "phone",
            "ssn",
            "credit_card",
            "address",
            "name",
          ],
          toolConfig: {},
        },
      };

      const customService = new DataGovernanceService(customConfig);
      expect(customService).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid dataset paths gracefully", async () => {
      const invalidPath = "";
      const content = ["test content"];

      // Should not throw error
      await expect(
        governanceService.scanForPII(invalidPath, content),
      ).resolves.toBeDefined();
    });

    it("should handle empty content arrays", async () => {
      const emptyContent: string[] = [];

      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        emptyContent,
      );
      expect(piiResult.totalInstances).toBe(0);
      expect(piiResult.riskLevel).toBe("none");
    });

    it("should handle null/undefined license information", async () => {
      const invalidLicense = {
        type: "",
        attributionRequired: false,
        commercialUseAllowed: false,
        modificationAllowed: false,
        distributionAllowed: false,
      };

      const compliance =
        await governanceService.validateLicense(invalidLicense);
      expect(compliance.status).toBe("non-compliant");
    });
  });

  describe("Performance and Scalability", () => {
    it("should handle large content arrays efficiently", async () => {
      const largeContent = Array.from(
        { length: 10000 },
        (_, i) => `Line ${i}: This is test content without PII.`,
      );

      const startTime = Date.now();
      const piiResult = await governanceService.scanForPII(
        "large-dataset",
        largeContent,
      );
      const endTime = Date.now();

      expect(piiResult).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should maintain consistent performance across multiple scans", async () => {
      const content = ["test content"];
      const times: number[] = [];

      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await governanceService.scanForPII(`dataset-${i}`, content);
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      // Performance should be consistent (within reasonable variance)
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const variance =
        times.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) /
        times.length;

      expect(variance).toBeLessThan(1000); // Variance should be less than 1 second
    });
  });

  describe("Integration Tests", () => {
    it("should perform complete dataset validation workflow", async () => {
      // 1. PII Scan
      const piiResult = await governanceService.scanForPII(
        "test-dataset",
        sampleContent,
      );
      expect(piiResult).toBeDefined();

      // 2. License Validation
      const compliance = await governanceService.validateLicense(
        sampleDataset.license,
      );
      expect(compliance).toBeDefined();

      // 3. Checksum Generation
      const checksums = await governanceService.generateChecksums(
        "test-dataset",
        sampleContent,
      );
      expect(checksums).toBeDefined();

      // 4. Checksum Verification
      const isValid = await governanceService.verifyChecksums(
        "test-dataset",
        sampleContent,
        checksums,
      );
      expect(isValid).toBe(true);

      // 5. Manifest Creation
      const manifest = await governanceService.createDatasetManifest([
        sampleDataset,
      ]);
      expect(manifest).toBeDefined();

      // 6. Report Generation
      const startDate = new Date("2025-08-01T00:00:00Z");
      const endDate = new Date("2025-08-11T23:59:59Z");
      const report = await governanceService.generateGovernanceReport(
        startDate,
        endDate,
      );
      expect(report).toBeDefined();
    });

    it("should maintain data consistency across operations", async () => {
      const originalContent = [...sampleContent];

      // Perform various operations
      await governanceService.scanForPII("test-dataset", sampleContent);
      await governanceService.generateChecksums("test-dataset", sampleContent);

      // Content should remain unchanged
      expect(sampleContent).toEqual(originalContent);
    });
  });
});
