// Zeropoint Protocol - Tinygrad Trainer Service
// Provides training lifecycle management for AI models
// Per CTO directive: No mocks, real CPU training with evidence

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type JobState = {
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  finishedAt?: string;
  metricsPath?: string;
  logPath?: string;
  error?: string;
};

const jobs = new Map<string, JobState>();

export async function startTraining(input: any) {
  const jobId = crypto.randomUUID();
  const date = new Date().toISOString().split('T')[0];
  const evidenceDir = path.join(process.cwd(), 'public', 'evidence', 'runs', date, `tinygrad-${jobId}`);
  
  await fs.mkdir(evidenceDir, { recursive: true });
  
  const metricsPath = path.join(evidenceDir, 'metrics.json');
  const logPath = path.join(evidenceDir, 'tinygrad.log');
  
  const jobState: JobState = {
    jobId,
    status: 'running',
    startedAt: new Date().toISOString(),
    metricsPath,
    logPath
  };
  
  jobs.set(jobId, jobState);
  
  // Spawn real training script
  const epochs = input.epochs || 50;
  const lr = input.lr || 0.01;
  
  const proc = spawn('python3', [
    path.join(process.cwd(), 'scripts', 'tinygrad_train_real.py'),
    '--run-id', jobId,
    '--output', metricsPath,
    '--log', logPath,
    '--epochs', String(epochs),
    '--lr', String(lr)
  ]);
  
  let stdout = '';
  let stderr = '';
  
  proc.stdout.on('data', (data) => { stdout += data.toString(); });
  proc.stderr.on('data', (data) => { stderr += data.toString(); });
  
  proc.on('close', (code) => {
    const state = jobs.get(jobId);
    if (state) {
      if (code === 0) {
        state.status = 'completed';
        state.finishedAt = new Date().toISOString();
      } else {
        state.status = 'failed';
        state.finishedAt = new Date().toISOString();
        state.error = stderr || `Exit code: ${code}`;
      }
    }
  });
  
  return { ok: true, jobId, evidenceDir, epochs, lr };
}

export async function jobStatus(jobId: string) {
  const state = jobs.get(jobId);
  if (!state) {
    return { ok: false, error: 'Job not found', jobId };
  }
  
  let lastLoss: number | undefined;
  if (state.metricsPath) {
    try {
      const data = await fs.readFile(state.metricsPath, 'utf-8');
      const metrics = JSON.parse(data);
      lastLoss = metrics.loss_end;
    } catch {
      // Metrics not yet written
    }
  }
  
  return {
    ok: true,
    jobId,
    state: state.status,
    startedAt: state.startedAt,
    finishedAt: state.finishedAt,
    lastLoss,
    error: state.error
  };
}

export async function jobLogs(jobId: string) {
  const state = jobs.get(jobId);
  if (!state || !state.logPath) {
    return { ok: false, error: 'Job not found', jobId };
  }
  
  try {
    const logs = await fs.readFile(state.logPath, 'utf-8');
    return { ok: true, jobId, logs: logs.split('\n') };
  } catch {
    return { ok: true, jobId, logs: ['Log file not yet created'] };
  }
}
