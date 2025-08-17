import{d as o,m as t}from"../../nitro/nitro.mjs";import"node:buffer";import"node:process";import"cloudflare:workers";import"node:events";import"node:timers";const e=o(()=>({status:"ok",commit:t.env.CF_PAGES_COMMIT_SHA||t.env.VERCEL_GIT_COMMIT_SHA||"unknown",buildTime:(new Date).toISOString()}));export{e as default};
//# sourceMappingURL=healthz.get.mjs.map
