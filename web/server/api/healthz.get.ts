export default defineEventHandler(() => ({
  status: 'ok',
  commit: process.env.CF_PAGES_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
  buildTime: new Date().toISOString()
}))
