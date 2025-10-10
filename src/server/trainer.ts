/**
 * Trainer Supervisor Service
 * Spawns and manages Python training processes with evidence capture
 */

import { spawn, ChildProcess } from 'child_process';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { evaluateConsensus } from './consensus';

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
  private instanceId: string;

  constructor() {
    this.synthientId = process.env.SYNTHIENT_ID || 'synth-1';
    this.instanceId = Math.random().toString(36).substring(7);
    console.log(`[TRAINER] TrainerService instance created with ID: ${this.instanceId}`);
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

  private async createTrainingRun(lr?: number): Promise<string> {
    const synthientId = await this.ensureSynthient();
    
    const learningRate = lr || parseFloat(process.env.TRAIN_LR || '0.05');
    
    const run = await db.trainingRun.create({
      data: {
        synthientId,
        status: 'running',
        lr: learningRate
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
      
      // Trigger consensus evaluation after each step
      if (this.currentRun) {
        evaluateConsensus(this.currentRun).catch(err => {
          console.error('Consensus evaluation failed:', err);
        });
      }
      
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
    // Always use -u flag for unbuffered Python output
    const pythonPath = path.join(ROOT, 'trainer', 'tinygrad_train.py');
    
    // Check if nice is available
    try {
      require('child_process').execSync('which nice', { stdio: 'ignore' });
      return ['nice', '-n', '10', 'python3', '-u', pythonPath];
    } catch {
      // nice not available, check if we should double TRAIN_PAUSE_MS
      const currentPause = parseInt(process.env.TRAIN_PAUSE_MS || '8000');
      const doubledPause = currentPause * 2;
      
      console.log(`nice not available, doubling TRAIN_PAUSE_MS from ${currentPause} to ${doubledPause}ms`);
      process.env.TRAIN_PAUSE_MS = doubledPause.toString();
      
      return ['python3', '-u', pythonPath];
    }
  }

  async start(lr?: number): Promise<{ started: boolean; runId?: string }> {
    if (this.process) {
      return { started: false };
    }

    try {
      this.currentRun = await this.createTrainingRun(lr);
      this.stepCount = 0;

      const cmd = this.getPythonCommand();
      console.log('Starting trainer with command:', cmd.join(' '));

      // If custom LR provided, override env var
      const spawnEnv = {
        ...process.env,
        TRAIN_ENABLED: '1'
      };
      
      if (lr !== undefined) {
        spawnEnv.TRAIN_LR = lr.toString();
      }

      this.process = spawn(cmd[0], cmd.slice(1), {
        env: spawnEnv,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false, // Keep attached for proper cleanup
        encoding: 'utf8' // Ensure UTF-8 encoding
      });

      // Set encoding explicitly for stdout
      this.process.stdout?.setEncoding('utf8');

      console.log(`[TRAINER] [${this.instanceId}] Process spawned with PID: ${this.process.pid}`);

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
        console.log(`[TRAINER] Process exit event - PID: ${this.process?.pid}, code: ${code}`);
        await this.updateRunStatus(code === 0 ? 'completed' : 'failed');
        this.process = null;
        this.currentRun = null;
        console.log(`[TRAINER] Process reference cleared after exit`);
      });

      this.process.on('error', async (error) => {
        console.error(`[TRAINER] Process error - PID: ${this.process?.pid}, error:`, error);
        await this.updateRunStatus('failed');
        this.process = null;
        this.currentRun = null;
        console.log(`[TRAINER] Process reference cleared after error`);
      });

      return { started: true, runId: this.currentRun };

    } catch (error) {
      console.error('Failed to start trainer:', error);
      return { started: false };
    }
  }

  async stop(): Promise<{ stopped: boolean }> {
    console.log(`[TRAINER] [${this.instanceId}] Stop requested, this.process:`, this.process ? `PID ${this.process.pid}` : 'null');
    console.log(`[TRAINER] [${this.instanceId}] Current run:`, this.currentRun);
    console.log(`[TRAINER] [${this.instanceId}] Step count:`, this.stepCount);
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

  private async detectRunningPythonProcess(): Promise<boolean> {
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      const { stdout } = await execAsync('ps aux | grep -E "(tinygrad_train|python3.*trainer)" | grep -v grep');
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  async syncWithDatabase(): Promise<void> {
    try {
      // Check if there's a running training run in database
      const runningRun = await db.trainingRun.findFirst({
        where: { status: 'running' },
        orderBy: { createdAt: 'desc' }
      });

      if (runningRun && !this.process) {
        const pythonRunning = await this.detectRunningPythonProcess();
        
        if (pythonRunning) {
          console.log(`[TRAINER] Found orphaned running run ${runningRun.id} with active Python process, killing Python process`);
          // Kill the orphaned Python process
          const { exec } = require('child_process');
          exec('killall python3 2>/dev/null', (error) => {
            if (error) console.error('Failed to kill Python processes:', error);
          });
        }
        
        console.log(`[TRAINER] Marking orphaned running run ${runningRun.id} as failed`);
        // Mark orphaned running run as failed
        await db.trainingRun.update({
          where: { id: runningRun.id },
          data: {
            status: 'failed',
            finishedAt: new Date()
          }
        });
      }
    } catch (error) {
      console.error('Failed to sync trainer state with database:', error);
    }
  }

  getStatus(): { running: boolean; runId?: string; stepCount: number } {
    const status = {
      running: this.process !== null,
      runId: this.currentRun || undefined,
      stepCount: this.stepCount
    };
    console.log(`[TRAINER] [${this.instanceId}] getStatus called:`, status, `this.process:`, this.process ? `PID ${this.process.pid}` : 'null');
    return status;
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

// Initialize by syncing with database on startup
trainerService.syncWithDatabase().catch(console.error);

// Export functions for API use
export async function startTrainer(lr?: number) {
  return trainerService.start(lr);
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
