import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";

const {
  CF_PAGES_COMMIT_SHA = "",
  CF_PAGES_URL = "https://zeropointprotocol.ai",
  CF_PAGES_BRANCH = "unknown",
  CF_PAGES_COMMIT_TIME = "",
} = process.env;

// If not running in Cloudflare Pages context, no-op to avoid local build failures
if (!CF_PAGES_COMMIT_SHA) {
  console.warn("generate-evidence.mjs: CF_PAGES_COMMIT_SHA not set; skipping evidence generation.");
  process.exit(0);
}

const short = CF_PAGES_COMMIT_SHA.slice(0, 7);
const root = resolve("public");
const statusDir = join(root, "status");
const buildInfoPath = join(root, "build-info.json");
const verDir = join(root, "evidence", "verify", short);

await fs.mkdir(statusDir, { recursive: true });
await fs.mkdir(verDir, { recursive: true });

async function listFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) return listFiles(p);
        return p.startsWith(root) ? p.slice(root.length) : p;
      })
    );
    return nested.flat();
  } catch {
    return [];
  }
}

const iso = (CF_PAGES_COMMIT_TIME ? new Date(CF_PAGES_COMMIT_TIME) : new Date()).toISOString().replace(/Z$/, "Z");

const common = {
  commit: short,
  branch: CF_PAGES_BRANCH,
  deployment_url: `${CF_PAGES_URL}/evidence/`,
  timestamp: iso,
};

// Do NOT generate /status/version.json; this path is owned by a Cloudflare Pages Function.
// Keeping this file absent ensures the Function is authoritative and prevents drift.

const files = (await listFiles(verDir)).filter((p) => !/\/index\.json$/.test(p) && p.startsWith(`/evidence/verify/${short}/`));
await fs.writeFile(join(verDir, "index.json"), JSON.stringify({ ...common, files }, null, 2));
await fs.writeFile(
  join(verDir, "metadata.json"),
  JSON.stringify({ ...common, source_of_truth: "/public/evidence/" }, null, 2)
);
await fs.writeFile(join(verDir, "progress.json"), JSON.stringify({ ...common, tasks: [] }, null, 2));
await fs.writeFile(
  join(verDir, "provenance.json"),
  JSON.stringify({ ...common, generator: "build:generate-evidence@pages" }, null, 2)
);

console.log(`ok ${short}`);

// Also write a canonical build-info.json for runtime consumption by Functions
await fs.writeFile(
  buildInfoPath,
  JSON.stringify(
    {
      commit: short,
      buildTime: iso,
      env: "prod",
    },
    null,
    2
  )
);


