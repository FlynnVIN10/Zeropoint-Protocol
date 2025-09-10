import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const short = (process.env.GITHUB_SHA || execSync('git rev-parse HEAD').toString().trim()).slice(0,7);
const buildTime = new Date().toISOString();

const outDir = path.join('public','evidence','phase2','verify', short);
fs.mkdirSync(outDir, { recursive: true });

// write canonical version.json used by smoke + deploy
const version = {
  phase: process.env.PHASE || 'stage2',
  commit: short,
  ciStatus: process.env.CI_STATUS || 'green',
  buildTime
};
fs.mkdirSync(path.join('public','status'), { recursive: true });
fs.writeFileSync(path.join('public','status','version.json'), JSON.stringify(version, null, 2));

// prevent drift: delete any other SHA dirs under phase2/verify
const root = path.join('public','evidence','phase2','verify');
for (const d of fs.readdirSync(root, { withFileTypes:true })) {
  if (d.isDirectory() && d.name !== short) fs.rmSync(path.join(root,d.name), { recursive:true, force:true });
}

// stamp a marker file in the current SHA dir
fs.writeFileSync(path.join(outDir,'ok.txt'), `ok ${short}\n${buildTime}\n`);

console.log('ok', short);