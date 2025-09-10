// buildMeta.ts - Single source of truth for build metadata
// Per CTO directive: Unify status across all endpoints

// Safe access to process.env for both Node.js and Edge Runtime
function getEnv(key: string, defaultValue: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }
  return defaultValue;
}

export const buildMeta = {
  phase: getEnv('PHASE', 'stage2'),
  commit: getEnv('GITHUB_SHA', getEnv('VERCEL_GIT_COMMIT_SHA', 'unknown')).slice(0,7),
  ciStatus: getEnv('CI_STATUS', 'green'),
  buildTime: new Date().toISOString(),
};
