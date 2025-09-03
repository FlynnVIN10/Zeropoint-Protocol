import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";

const {
  CF_PAGES_COMMIT_SHA = "",
  CF_PAGES_URL = "https://zeropointprotocol.ai",
  CF_PAGES_BRANCH = "unknown",
  CF_PAGES_COMMIT_TIME = new Date().toISOString(),
} = process.env;

if (!CF_PAGES_COMMIT_SHA) {
  console.error("Missing CF_PAGES_COMMIT_SHA");
  process.exit(1);
}

const short = CF_PAGES_COMMIT_SHA.slice(0, 7);
const root = resolve("public");
const statusDir = join(root, "status");
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

const common = {
  commit: short,
  branch: CF_PAGES_BRANCH,
  deployment_url: `${CF_PAGES_URL}/evidence/`,
  timestamp: CF_PAGES_COMMIT_TIME,
};

await fs.writeFile(
  join(statusDir, "version.json"),
  JSON.stringify(
    { phase: "stage-1", ciStatus: "unknown", buildTime: CF_PAGES_COMMIT_TIME, ...common },
    null,
    2
  )
);

const files = (await listFiles(verDir)).filter((p) => !p.endsWith("index.json"));
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


