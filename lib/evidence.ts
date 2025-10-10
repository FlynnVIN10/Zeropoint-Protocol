import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();

function todayDir() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return path.join(ROOT, 'public', 'evidence', 'compliance', `${y}-${m}-${day}`);
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeUiEvent(name: string, data: unknown) {
  const base = todayDir();
  const dir = path.join(base, 'ui-events');
  ensureDir(dir);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(dir, `${name}-${ts}.json`);
  fs.writeFileSync(file, JSON.stringify({ ts: new Date().toISOString(), ...(data as object) }, null, 2), 'utf8');
  appendHash(file);
}

export function writeVoteEvidence(proposalId: string, actor: string, decision: string, reason: string) {
  const base = todayDir();
  const dir = path.join(base, 'votes');
  ensureDir(dir);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const md = `# Vote
- proposal: ${proposalId}
- actor: ${actor}
- decision: ${decision}
- reason: ${reason}
- timestamp: ${new Date().toISOString()}
`;
  const file = path.join(dir, `${proposalId}-${actor}-${ts}.md`);
  fs.writeFileSync(file, md, 'utf8');
  appendHash(file);
}

export function updateProbeSummary(probeInfo: { filesHashed: number; lastProbeISO: string }) {
  const base = todayDir();
  ensureDir(base);
  const f = path.join(base, 'probe-summary.json');
  fs.writeFileSync(f, JSON.stringify(probeInfo, null, 2), 'utf8');
  appendHash(f);
}

function sha256File(fp: string) {
  const buf = fs.readFileSync(fp);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function appendHash(fp: string) {
  const base = todayDir();
  ensureDir(base);
  const hash = sha256File(fp);
  const rel = fp.replace(`${ROOT}${path.sep}`, '');
  const line = `${hash}  ${rel}\n`;
  const hashFile = path.join(base, 'file-hashes-complete.sha256');
  fs.appendFileSync(hashFile, line, 'utf8');
}

