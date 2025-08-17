import{d as o,m as e}from"../../nitro/nitro.mjs";import"node:buffer";import"node:process";import"cloudflare:workers";import"node:events";import"node:timers";const r=o(()=>({ready:!0,commit:e.env.CF_PAGES_COMMIT_SHA||e.env.VERCEL_GIT_COMMIT_SHA||"unknown",buildTime:(new Date).toISOString()}));export{r as default};
//# sourceMappingURL=readyz.get.mjs.map
