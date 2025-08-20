// © 2025 Zeropoint Protocol, Inc., a Texas C Corporation with principal offices in Austin, TX. All Rights Reserved. View-Only License: No clone, modify, run or distribute without signed agreement. See LICENSE.md and legal@zeropointprotocol.ai.

import { exec } from "child_process";
import { promisify } from "util";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

export interface SystemDiagnostics {
  appliance_id: string;
  platform: string;
  commit: string;
  phase: string;
  system: {
    uname: string;
    sw_vers: string;
    hardware: string;
    displays: string;
  };
  python: {
    version: string;
    available: boolean;
  };
  tinygrad: {
    backend: string;
    available: boolean;
    metal_rhi: string;
  };
  environment: {
    node_version: string;
    npm_version: string;
    mocks_disabled: boolean;
    no_synthetic_data: boolean;
    real_compute_only: boolean;
  };
  timestamp: string;
}

export async function zpctlDiag(
  verbose: boolean = false,
): Promise<SystemDiagnostics> {
  const diagnostics: SystemDiagnostics = {
    appliance_id: "zp-local",
    platform: "darwin-arm64",
    commit: await getGitCommit(),
    phase: "A",
    system: {
      uname: "",
      sw_vers: "",
      hardware: "",
      displays: "",
    },
    python: {
      version: "",
      available: false,
    },
    tinygrad: {
      backend: "unknown",
      available: false,
      metal_rhi: "unknown",
    },
    environment: {
      node_version: process.version,
      npm_version: await getNpmVersion(),
      mocks_disabled: process.env.MOCKS_DISABLED === "1",
      no_synthetic_data: process.env.NO_SYNTHETIC_DATA === "1",
      real_compute_only: process.env.REAL_COMPUTE_ONLY === "1",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    // Get system information
    diagnostics.system.uname = await getUname();
    diagnostics.system.sw_vers = await getSwVers();
    diagnostics.system.hardware = await getSystemProfiler("SPHardwareDataType");
    diagnostics.system.displays = await getSystemProfiler("SPDisplaysDataType");

    // Get Python information
    const pythonInfo = await getPythonInfo();
    diagnostics.python = pythonInfo;

    // Get tinygrad information
    const tinygradInfo = await getTinygradInfo();
    diagnostics.tinygrad = tinygradInfo;
  } catch (error) {
    if (verbose) {
      console.error("Error during diagnostics:", error);
    }
  }

  return diagnostics;
}

async function getGitCommit(): Promise<string> {
  try {
    const { stdout } = await execAsync("git rev-parse HEAD");
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

async function getNpmVersion(): Promise<string> {
  try {
    const { stdout } = await execAsync("npm --version");
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

async function getUname(): Promise<string> {
  try {
    const { stdout } = await execAsync("uname -a");
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

async function getSwVers(): Promise<string> {
  try {
    const { stdout } = await execAsync("sw_vers");
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

async function getSystemProfiler(dataType: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`system_profiler ${dataType}`);
    return stdout.trim();
  } catch {
    return "unknown";
  }
}

async function getPythonInfo(): Promise<{
  version: string;
  available: boolean;
}> {
  try {
    const { stdout } = await execAsync("python3 --version");
    return {
      version: stdout.trim(),
      available: true,
    };
  } catch {
    try {
      const { stdout } = await execAsync("python --version");
      return {
        version: stdout.trim(),
        available: true,
      };
    } catch {
      return {
        version: "not available",
        available: false,
      };
    }
  }
}

async function getTinygradInfo(): Promise<{
  backend: string;
  available: boolean;
  metal_rhi: string;
}> {
  try {
    // Check if tinygrad is available
    const tinygradPath = path.join(process.cwd(), "vendor", "tinygrad");
    const exists = fs.existsSync(tinygradPath);

    if (!exists) {
      return {
        backend: "not installed",
        available: false,
        metal_rhi: "not available",
      };
    }

    // Try to get Metal RHI information
    let metalRhi = "unknown";
    try {
      const { stdout } = await execAsync(
        'system_profiler SPDisplaysDataType | grep "Metal"',
      );
      metalRhi = stdout.trim() || "available";
    } catch {
      metalRhi = "not available";
    }

    return {
      backend: "metal",
      available: true,
      metal_rhi: metalRhi,
    };
  } catch {
    return {
      backend: "unknown",
      available: false,
      metal_rhi: "unknown",
    };
  }
}
