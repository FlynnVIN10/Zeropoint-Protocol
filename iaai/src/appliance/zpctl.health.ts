import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

export interface HealthCheck {
  status: "green" | "yellow" | "red";
  checks: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  details: {
    file_permissions: HealthCheckResult;
    env_flags: HealthCheckResult;
    api_reachability: HealthCheckResult;
    audit_write: HealthCheckResult;
    website_status: HealthCheckResult;
  };
  timestamp: string;
}

export interface HealthCheckResult {
  status: "pass" | "fail" | "warning";
  message: string;
  details?: string;
}

export async function zpctlHealth(): Promise<HealthCheck> {
  const checks = await Promise.all([
    checkFilePermissions(),
    checkEnvironmentFlags(),
    checkApiReachability(),
    checkAuditWrite(),
    checkWebsiteStatus(),
  ]);

  const passed = checks.filter((c) => c.status === "pass").length;
  const failed = checks.filter((c) => c.status === "fail").length;
  const warnings = checks.filter((c) => c.status === "warning").length;
  const total = checks.length;

  let overallStatus: "green" | "yellow" | "red" = "green";
  if (failed > 0) {
    overallStatus = "red";
  } else if (warnings > 0) {
    overallStatus = "yellow";
  }

  return {
    status: overallStatus,
    checks: {
      total,
      passed,
      failed,
      warnings,
    },
    details: {
      file_permissions: checks[0],
      env_flags: checks[1],
      api_reachability: checks[2],
      audit_write: checks[3],
      website_status: checks[4],
    },
    timestamp: new Date().toISOString(),
  };
}

async function checkFilePermissions(): Promise<HealthCheckResult> {
  try {
    // Check if key directories are writable
    const testDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testFile = path.join(testDir, "health-test.txt");
    fs.writeFileSync(testFile, "health check");
    fs.unlinkSync(testFile);

    return {
      status: "pass",
      message: "File permissions are correct",
    };
  } catch (error) {
    return {
      status: "fail",
      message: "File permissions check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkEnvironmentFlags(): Promise<HealthCheckResult> {
  const requiredFlags = [
    "MOCKS_DISABLED",
    "NO_SYNTHETIC_DATA",
    "REAL_COMPUTE_ONLY",
  ];

  const missingFlags = requiredFlags.filter(
    (flag) => process.env[flag] !== "1",
  );

  if (missingFlags.length === 0) {
    return {
      status: "pass",
      message: "All required environment flags are set",
    };
  } else if (missingFlags.length === 1) {
    return {
      status: "warning",
      message: "Some environment flags are missing",
      details: `Missing: ${missingFlags.join(", ")}`,
    };
  } else {
    return {
      status: "fail",
      message: "Multiple required environment flags are missing",
      details: `Missing: ${missingFlags.join(", ")}`,
    };
  }
}

async function checkApiReachability(): Promise<HealthCheckResult> {
  try {
    // Check if the local API is reachable
    const { stdout } = await execAsync(
      'curl -s -f http://localhost:3000/health 2>/dev/null || echo "unavailable"',
    );

    if (stdout.trim() === "unavailable") {
      return {
        status: "warning",
        message: "Local API is not reachable",
        details: "This is expected if the API is not running",
      };
    }

    return {
      status: "pass",
      message: "Local API is reachable",
    };
  } catch (error) {
    return {
      status: "warning",
      message: "Could not check API reachability",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkAuditWrite(): Promise<HealthCheckResult> {
  try {
    const auditDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(auditDir)) {
      fs.mkdirSync(auditDir, { recursive: true });
    }

    const auditFile = path.join(auditDir, "audit.log");
    const testEntry = `[${new Date().toISOString()}] HEALTH_CHECK: Audit write test\n`;
    fs.appendFileSync(auditFile, testEntry);

    return {
      status: "pass",
      message: "Audit logging is working",
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Audit logging failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkWebsiteStatus(): Promise<HealthCheckResult> {
  try {
    // Check if the website build directory exists
    const websiteDir = path.join(process.cwd(), "website-v2", ".next");

    if (!fs.existsSync(websiteDir)) {
      return {
        status: "warning",
        message: "Website not built yet",
        details: "Run npm run build in website-v2 directory",
      };
    }

    // Check if the website has been built recently
    const stats = fs.statSync(websiteDir);
    const buildAge = Date.now() - stats.mtime.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    if (buildAge > maxAge) {
      return {
        status: "warning",
        message: "Website build is outdated",
        details: `Last built ${Math.round(buildAge / (60 * 60 * 1000))} hours ago`,
      };
    }

    return {
      status: "pass",
      message: "Website is up to date",
    };
  } catch (error) {
    return {
      status: "fail",
      message: "Website status check failed",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
