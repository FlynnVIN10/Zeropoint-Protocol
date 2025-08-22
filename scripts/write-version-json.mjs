import { writeFileSync } from "node:fs";
const data = {
  version: process.env.APP_VERSION ?? "v0.0.0",
  commit:  process.env.GIT_COMMIT ?? "unknown",
  build_time: new Date().toISOString(),
  source_repo: "https://github.com/FlynnVIN10/Zeropoint-Protocol"
};
writeFileSync("public/status/version.json", JSON.stringify(data));
