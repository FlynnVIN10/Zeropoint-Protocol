/**
 * Trainer Supervisor Service
 * Spawns and manages Python training processes with evidence capture
 */

import { spawn, ChildProcess } from 'child_process';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();

interface TrainingStep {
  type: 'step';
  step: number;
  loss: number;
  elapsedMs: number;
  w: number;
  b: number;
}

interface TrainingInfo {
  type: 'info' | 'error';
  message: string;
}

type TrainingOutput = TrainingStep | TrainingInfo;

class TrainerService {
  private process: ChildProcess | null = null;
  private currentRun: string | null = null;
  private synthientId: string;
  private stepCount = 0;

  constructor() {
    this.synthientId = process.env.SYNTHIENT_ID || 'synth-1';
  }

  private async ensureSynthient(): Promise<string> {
    // Find or create synthient
    let synthient = await db.synthient.findFirst({
      where: { name: this.synthientId }
    });

    if (!synthient) {
      synthient = await db.synthient.create({
        data: {
          name: this.synthientId,
          status: 'idle'
        }
      });
    }

    return synthient.id;
  }

  private async createTrainingRun(): Promise<string> {
    const synthientId = await this.ensureSynthient();
    
    const run = await db.trainingRun.create({
      data: {
        synthientId,
        status: 'running'
      }
    });

    return run.id;
  }

  private todayDir(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return path.join(ROOT, 'public', 'evidence', 'compliance', `${y}-${m}-${day}`);
  }

  private ensureDir(p: string): void {
    fs.mkdirSync(p, { recursive: true });
  }

  private appendHash(filePath: string): void {
    const base = this.todayDir();
    this.ensureDir(base);
    
    const hash = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
    const rel = filePath.replace(`${ROOT}${path.sep}`, '');
    const line = `${hash}  ${rel}\n`;
    const hashFile = path.join(base, 'file-hashes-complete.sha256');
    fs.appendFileSync(hashFile, line, 'utf8');
  }

  private async persistStep(step: TrainingStep): Promise<void> {
    if (!this.currentRun) return;

    try {
      // Insert TrainingStep record
      await db.trainingStep.create({
        data: {
          runId: this.currentRun,
          step: step.step,
          loss: step.loss,
          elapsedMs: step.elapsedMs,
          parameters: JSON.stringify({ w: step.w, b: step.b })
        }
      });

      // Write evidence JSON
      const base = this.todayDir();
      const dir = path.join(base, 'training');
      this.ensureDir(dir);
      
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const file = path.join(dir, `${ts}-step-${step.step}.json`);
      
      const evidence = {
        timestamp: new Date().toISOString(),
        runId: this.currentRun,
        step: step.step,
        loss: step.loss,
        elapsedMs: step.elapsedMs,
        parameters: { w: step.w, b: step.b }
      };
      
      fs.writeFileSync(file, JSON.stringify(evidence, null, 2), 'utf8');
      this.appendHash(file);
      
      this.stepCount++;
      
    } catch (error) {
      console.error('Failed to persist training step:', error);
    }
  }

  private async updateRunStatus(status: 'completed' | 'failed'): Promise<void> {
    if (!this.currentRun) return;

    try {
      await db.trainingRun.update({
        where: { id: this.currentRun },
        data: {
          status,
          finishedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to update training run status:', error);
    }
  }

  private getPythonCommand(): string[] {
    // Try nice -n 10 first, fallback to plain python3
    const pythonPath = path.join(ROOT, 'trainer', 'tinygrad_train.py');
    
    // Check if nice is available
    try {
      require('child_process').execSync('which nice', { stdio: 'ignore' });
      return ['nice', '-n', '10', 'python3', pythonPath];
    } catch {
      // nice not available, check if we should double TRAIN_PAUSE_MS
      const currentPause = parseInt(process.env.TRAIN_PAUSE_MS || '8000');
      const doubledPause = currentPause * 2;
      
      console.log(`nice not available, doubling TRAIN_PAUSE_MS from ${currentPause} to ${doubledPause}ms`);
      process.env.TRAIN_PAUSE_MS = doubledPause.toString();
      
      return ['python3', pythonPath];
    }
  }

  async start(): Promise<{ started: boolean; runId?: string }> {
    if (this.process) {
      return { started: false };
    }

    try {
      this.currentRun = await this.createTrainingRun();
      this.stepCount = 0;

      const cmd = this.getPythonCommand();
      console.log('Starting trainer with command:', cmd.join(' '));

      this.process = spawn(cmd[0], cmd.slice(1), {
        env: {
          ...process.env,
          TRAIN_ENABLED: '1'
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      this.process.stdout?.on('data', async (data) => {
        const lines = data.toString().split('\n').filter((line: string) => line.trim());
        
        for (const line of lines) {
          try {
            const output: TrainingOutput = JSON.parse(line);
            
            if (output.type === 'step') {
              await this.persistStep(output as TrainingStep);
            } else if (output.type === 'info') {
              console.log(`[TRAINER INFO] ${(output as TrainingInfo).message}`);
            } else if (output.type === 'error') {
              console.error(`[TRAINER ERROR] ${(output as TrainingInfo).message}`);
            }
          } catch (error) {
            console.error('Failed to parse trainer output:', line, error);
          }
        }
      });

      this.process.stderr?.on('data', (data) => {
        console.error(`[TRAINER STDERR] ${data.toString()}`);
      });

      this.process.on('exit', async (code) => {
        console.log(`Trainer process exited with code ${code}`);
        await this.updateRunStatus(code === 0 ? 'completed' : 'failed');
        this.process = null;
        this.currentRun = null;
      });

      this.process.on('error', async (error) => {
        console.error('Trainer process error:', error);
        await this.updateRunStatus('failed');
        this.process = null;
        this.currentRun = null;
      });

      return { started: true, runId: this.currentRun };

    } catch (error) {
      console.error('Failed to start trainer:', error);
      return { started: false };
    }
  }

  async stop(): Promise<{ stopped: boolean }> {
    if (!this.process) {
      return { stopped: false };
    }

    try {
      this.process.kill('SIGTERM');
      
      // Wait for graceful shutdown
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          if (this.process) {
            this.process.kill('SIGKILL');
          }
          resolve(undefined);
        }, 5000);

        this.process?.on('exit', () => {
          clearTimeout(timeout);
          resolve(undefined);
        });
      });

      await this.updateRunStatus('failed'); // Stopped by user
      this.process = null;
      this.currentRun = null;

      return { stopped: true };

    } catch (error) {
      console.error('Failed to stop trainer:', error);
      return { stopped: false };
    }
  }

  getStatus(): { running: boolean; runId?: string; stepCount: number } {
    return {
      running: this.process !== null,
      runId: this.currentRun || undefined,
      stepCount: this.stepCount
    };
  }

  async getLatestStep(): Promise<any | null> {
    try {
      const latestStep = await db.trainingStep.findFirst({
        orderBy: { createdAt: 'desc' },
        include: {
          TrainingRun: {
            include: {
              Synthient: true
            }
          }
        }
      });

      return latestStep;
    } catch (error) {
      console.error('Failed to get latest training step:', error);
      return null;
    }
  }
}

// Singleton instance
export const trainerService = new TrainerService();

// Export functions for API use
export async function startTrainer() {
  return trainerService.start();
}

export async function stopTrainer() {
  return trainerService.stop();
}

export function getTrainerStatus() {
  return trainerService.getStatus();
}

export async function getLatestTrainingStep() {
  return trainerService.getLatestStep();
}
