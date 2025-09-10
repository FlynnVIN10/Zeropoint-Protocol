// buildMeta.ts - Single source of truth for build metadata
// Per CTO directive: Unify status across all endpoints

export const buildMeta = {
  phase: process.env.PHASE ?? 'stage2',
  commit: process.env.GITHUB_SHA?.slice(0,7) ?? process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) ?? 'unknown',
  ciStatus: process.env.CI_STATUS ?? 'green',
  buildTime: new Date().toISOString(),
};
