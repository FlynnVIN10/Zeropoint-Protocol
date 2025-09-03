import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const {
  CF_PAGES_COMMIT_SHA = "",
  CF_PAGES_URL = "https://zeropointprotocol.ai",
  CF_PAGES_BRANCH = "",
  CF_PAGES_COMMIT_TIME = new Date().toISOString(),
} = process.env;

if (!CF_PAGES_COMMIT_SHA) {
  console.error("Missing CF_PAGES_COMMIT_SHA");
  process.exit(1);
}

const short = CF_PAGES_COMMIT_SHA.slice(0, 7);
const base = "public";
const statusDir = join(base, "status");
const evDir = join(base, "evidence", "verify", short);

await mkdir(statusDir, { recursive: true });
await mkdir(evDir, { recursive: true });

const common = {
  commit: short,
  branch: CF_PAGES_BRANCH || "unknown",
  deployment_url: `${CF_PAGES_URL}/evidence/`,
  timestamp: CF_PAGES_COMMIT_TIME,
};

await writeFile(
  join(statusDir, "version.json"),
  JSON.stringify(
    { phase: "stage-1", ciStatus: "unknown", buildTime: CF_PAGES_COMMIT_TIME, ...common },
    null,
    2
  )
);

await writeFile(
  join(evDir, "index.json"),
  JSON.stringify({ ...common, files: [] }, null, 2)
);

await writeFile(
  join(evDir, "metadata.json"),
  JSON.stringify({ ...common, source_of_truth: "/public/evidence/" }, null, 2)
);

await writeFile(
  join(evDir, "progress.json"),
  JSON.stringify({ ...common, tasks: [] }, null, 2)
);

await writeFile(
  join(evDir, "provenance.json"),
  JSON.stringify({ ...common, generator: "build:generate-evidence" }, null, 2)
);

console.log(`Evidence generated for ${short} at ${evDir}`);


