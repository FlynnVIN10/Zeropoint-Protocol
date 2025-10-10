import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

type FileAnalysis = {
  filepath: string;
  sizeBytes: number;
  numLines: number;
  hasTodo: boolean;
  usesAny: boolean;
  hasConsoleLog: boolean;
};

async function walkDir(root: string, collected: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(root, entry.name);
    // Skip heavy/irrelevant dirs
    if (entry.isDirectory()) {
      if (["node_modules", ".git", "public", "prisma", ".next", "dev.db", "dev.db-shm", "dev.db-wal"].some((n) => entry.name === n)) {
        continue;
      }
      await walkDir(full, collected);
    } else {
      if (/\.(ts|tsx|js|jsx|mjs|cjs|py|sh)$/.test(entry.name)) collected.push(full);
    }
  }
  return collected;
}

async function analyzeFiles(files: string[], repoRoot: string): Promise<{ summaries: FileAnalysis[]; insights: string[] }> {
  const summaries: FileAnalysis[] = [];
  const insights: string[] = [];
  for (const file of files) {
    try {
      const buf = await fs.readFile(file, "utf8");
      const rel = path.relative(repoRoot, file);
      const numLines = buf.split(/\r?\n/).length;
      const analysis: FileAnalysis = {
        filepath: rel,
        sizeBytes: Buffer.byteLength(buf),
        numLines,
        hasTodo: /\b(TODO|FIXME|XXX)\b/.test(buf),
        usesAny: /\b:any\b/.test(buf),
        hasConsoleLog: /console\.log\(/.test(buf),
      };
      summaries.push(analysis);
    } catch {
      // ignore file read errors
    }
  }

  const tooLarge = summaries.filter((s) => s.numLines > 500);
  if (tooLarge.length) insights.push(`Consider splitting ${tooLarge.length} large files (>500 lines).`);
  const withAny = summaries.filter((s) => s.usesAny && s.filepath.endsWith(".ts"));
  if (withAny.length) insights.push(`Reduce unsafe TypeScript 'any' in ${withAny.length} files.`);
  const withTodo = summaries.filter((s) => s.hasTodo);
  if (withTodo.length) insights.push(`Resolve TODO/FIXME in ${withTodo.length} files (replace with issues or implement).`);
  const withConsole = summaries.filter((s) => s.hasConsoleLog);
  if (withConsole.length) insights.push(`Remove console.log in ${withConsole.length} files; prefer structured logging.`);

  return { summaries, insights };
}

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const id = params.id;
  
  // Update synthient status to training
  await db.synthient.update({
    where: { id },
    data: {
      status: "training",
      lastHeartbeat: new Date()
    }
  });
  
  // Create training run
  const run = await db.trainingRun.create({
    data: {
      synthientId: id
    }
  });

  // Kick off background job: code analysis + proposal + synthient vote record
  (async () => {
    const repoRoot = process.cwd();
    const date = new Date().toISOString().split('T')[0];
    const evidenceDir = path.join(repoRoot, 'public', 'evidence', 'runs', date, `train-${run.id}`);
    await fs.mkdir(evidenceDir, { recursive: true });

    // Attempt provider health checks (no mocks)
    const petalsUrl = process.env.PETALS_API_URL || 'http://localhost:8000';
    const tinygradUrl = process.env.TINYGRAD_API_URL || 'http://localhost:8002';
    let petalsHealthy = false;
    let tinygradHealthy = false;
    try { const r = await fetch(`${petalsUrl}/health`, { signal: AbortSignal.timeout(3000) }); petalsHealthy = r.ok; } catch {}
    try { const r = await fetch(`${tinygradUrl}/health`, { signal: AbortSignal.timeout(3000) }); tinygradHealthy = r.ok; } catch {}

    // Walk and analyze repository code
    const files = await walkDir(repoRoot);
    const { summaries, insights } = await analyzeFiles(files.slice(0, 4000), repoRoot);

    // Persist analysis
    await fs.writeFile(path.join(evidenceDir, 'analysis.json'), JSON.stringify({
      runId: run.id,
      synthientId: id,
      timestamp: new Date().toISOString(),
      totals: {
        filesScanned: summaries.length,
        lines: summaries.reduce((a, b) => a + b.numLines, 0),
        bytes: summaries.reduce((a, b) => a + b.sizeBytes, 0),
      },
      providerHealth: { petalsHealthy, tinygradHealthy, petalsUrl, tinygradUrl },
      insights,
      topHotspots: summaries
        .sort((a, b) => b.numLines - a.numLines)
        .slice(0, 20),
    }, null, 2));

    // Create improvement proposal (left open for human consensus)
    const proposal = await db.proposal.create({
      data: {
        id: `proposal-${Date.now()}`,
        title: `SYNTHIENT CODE IMPROVEMENT PROPOSAL — ${id}`,
        body: [
          `Objective: Improve reliability, security, and performance across the platform.`,
          `Providers: tinygrad=${tinygradHealthy ? 'healthy' : 'unavailable'}, petals=${petalsHealthy ? 'healthy' : 'unavailable'}.`,
          `Evidence: /public/evidence/runs/${date}/train-${run.id}/analysis.json`,
          `Key Insights: ${insights.slice(0, 10).join(' | ') || 'None'}`
        ].join('\n\n'),
        status: 'open',
        evidenceJson: JSON.stringify({ analysisPath: `public/evidence/runs/${date}/train-${run.id}/analysis.json` }),
      }
    });

    // Record synthient consensus vote without changing proposal status
    await db.vote.create({
      data: {
        id: `vote-${Date.now()}`,
        proposalId: proposal.id,
        actor: id,
        decision: 'approve',
        reason: 'SYNTHIENT CONSENSUS: Proceed to human review with improvements plan.',
      }
    });

    // Finalize run
    await db.trainingRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        metricsJson: JSON.stringify({
          filesScanned: summaries.length,
          insights: insights.length,
          petalsHealthy,
          tinygradHealthy,
          evidence: `/public/evidence/runs/${date}/train-${run.id}/analysis.json`,
          proposalId: proposal.id,
        })
      }
    });

    await db.synthient.update({
      where: { id },
      data: {
        status: "ready",
        lastHeartbeat: new Date()
      }
    });
  })().catch(() => {});
  
  return NextResponse.json({
    started: true,
    runId: run.id
  });
}

