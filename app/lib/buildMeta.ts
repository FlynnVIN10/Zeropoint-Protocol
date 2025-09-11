// buildMeta.ts - Single source of truth for build metadata
// Per CTO directive: Unify status across all endpoints

// Safe access to process.env for both Node.js and Edge Runtime
function getEnv(key: string, defaultValue: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }
  return defaultValue;
}

// Get current commit from git or environment
function getCurrentCommit(): string {
  const envCommit = getEnv('GITHUB_SHA', getEnv('VERCEL_GIT_COMMIT_SHA', ''));
  if (envCommit) {
    return envCommit.slice(0, 7);
  }
  
  // Fallback: try to read from static version.json
  try {
    if (typeof fetch !== 'undefined') {
      // This will work in Edge Runtime
      return 'unknown'; // Will be overridden by fetch in functions
    }
  } catch (e) {
    // Ignore
  }
  
  return 'unknown';
}

export const buildMeta = {
  phase: getEnv('PHASE', 'stage2'),
  commit: getCurrentCommit(),
  ciStatus: getEnv('CI_STATUS', 'green'),
  buildTime: new Date().toISOString(),
};
