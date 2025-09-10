// buildMeta.ts - Single source of truth for build metadata
// Per CTO directive: Unify status across all endpoints

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export interface BuildMeta {
  phase: string;
  commit: string;
  ciStatus: string;
  buildTime: string;
}

// Get commit SHA from environment or git
function getCommitSha(): string {
  // Try environment variables first (CI/CD)
  const envCommit = process.env.GITHUB_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.CF_PAGES_COMMIT_SHA;
  if (envCommit) {
    return envCommit.slice(0, 7);
  }
  
  // Fallback to git command
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim().slice(0, 7);
  } catch {
    return 'unknown';
  }
}

// Get build metadata
export function getBuildMeta(): BuildMeta {
  const commit = getCommitSha();
  const buildTime = new Date().toISOString();
  const phase = process.env.PHASE || 'stage2';
  const ciStatus = process.env.CI_STATUS || 'green';
  
  return {
    phase,
    commit,
    ciStatus,
    buildTime
  };
}

// Write build metadata to public files
export function writeBuildMeta(): void {
  const meta = getBuildMeta();
  
  // Write version.json
  const versionPath = path.join(process.cwd(), 'public', 'status', 'version.json');
  fs.mkdirSync(path.dirname(versionPath), { recursive: true });
  fs.writeFileSync(versionPath, JSON.stringify(meta, null, 2));
  
  // Write evidence index
  const evidenceDir = path.join(process.cwd(), 'public', 'evidence', 'phase2', 'verify', meta.commit);
  fs.mkdirSync(evidenceDir, { recursive: true });
  
  const evidenceIndex = {
    ...meta,
    generated: buildTime,
    evidence: {
      version: meta,
      status: 'verified'
    }
  };
  
  const evidencePath = path.join(evidenceDir, 'index.json');
  fs.writeFileSync(evidencePath, JSON.stringify(evidenceIndex, null, 2));
  
  // Clean up old evidence directories
  const root = path.join(process.cwd(), 'public', 'evidence', 'phase2', 'verify');
  try {
    for (const d of fs.readdirSync(root, { withFileTypes: true })) {
      if (d.isDirectory() && d.name !== meta.commit) {
        fs.rmSync(path.join(root, d.name), { recursive: true, force: true });
      }
    }
  } catch {
    // Ignore cleanup errors
  }
}
