import { writeFileSync } from "node:fs";
const data = {
  version: process.env.APP_VERSION ?? process.env.GITHUB_REF_NAME ?? "v0.0.0",
  commit:  process.env.GIT_COMMIT ?? process.env.GITHUB_SHA ?? "unknown",
  build_time: new Date().toISOString(),
  source_repo: "https://github.com/FlynnVIN10/Zeropoint-Protocol"
};
writeFileSync("public/status/version.json", JSON.stringify(data));
