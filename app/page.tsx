"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ConsensusPulse } from "@/src/components/governance/ConsensusPulse";
import GovernanceOverlay from "@/src/components/governance/GovernanceOverlay";

// Single-screen, no-scroll, black UI dashboard for Next.js App Router.
// Drop this as app/page.tsx or app/(dashboard)/page.tsx.
// Assumes TailwindCSS is configured. No external UI deps required.

// ---------- Helpers ----------
const fetchJSON = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
};

const postJSON = (url: string, body: unknown) =>
  fetchJSON(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Compact KPI tile
function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
      <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase">{label}</div>
      <div className="mt-1 text-zinc-100 text-[clamp(1.2rem,1.2vw+0.8rem,2rem)] font-semibold leading-tight">{value}</div>
      {hint && <div className="mt-1 text-zinc-500 text-xs">{hint}</div>}
    </div>
  );
}

// Status dot
function Dot({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        "inline-block h-2.5 w-2.5 rounded-full " + (ok ? "bg-emerald-500 shadow-[0_0_12px_#10b981]" : "bg-rose-500 shadow-[0_0_12px_#f43f5e]")
      }
      aria-label={ok ? "ok" : "fail"}
    />
  );
}

// Minimal sparkline from values
function Spark({ values }: { values: number[] }) {
  const path = useMemo(() => {
    if (!values?.length) return "";
    const w = 120, h = 36;
    const min = Math.min(...values), max = Math.max(...values);
    const norm = (v: number) => (max - min === 0 ? h / 2 : h - ((v - min) / (max - min)) * h);
    const step = w / (values.length - 1 || 1);
    return values.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${norm(v)}`).join(" ");
  }, [values]);
  return (
    <svg viewBox="0 0 120 36" className="w-full h-9">
      <path d={path} fill="none" stroke="currentColor" className="text-emerald-400" strokeWidth={2} />
    </svg>
  );
}

export default function Dashboard() {
  // ---------- State ----------
  const [health, setHealth] = useState<{ ok?: boolean } | null>(null);
  const [ready, setReady] = useState<{ ready?: boolean } | null>(null);
  const [status, setStatus] = useState<any>(null);
  
  // Governance state
  const [govOpen, setGovOpen] = useState<boolean>(false);

  const [trainStats, setTrainStats] = useState<{ first?: number; last?: number; delta?: number; series?: number[] } | null>(null);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [sseReconnectDelay, setSseReconnectDelay] = useState<number>(1000);
  const [trainerRunning, setTrainerRunning] = useState<boolean>(false);
  const [currentRunId, setCurrentRunId] = useState<string>("");
  const [trainEnv, setTrainEnv] = useState<{lr?:string; batch?:string; pause?:string}>({});
  const [inferStatus, setInferStatus] = useState<string>("idle");
  const [simTicks, setSimTicks] = useState<number>(0);

  const [synthients, setSynthients] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [busy, setBusy] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // ---------- SSE Connection with Exponential Backoff ----------
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/synthients/feed');
        
        eventSource.onopen = () => {
          console.log('SSE connected');
          setSseConnected(true);
          setSseReconnectDelay(1000); // Reset delay on successful connection
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'step') {
              setTrainStats(prev => {
                const series = prev?.series || [];
                const newSeries = [...series, data.loss].slice(-20); // Keep last 20 values
                
                return {
                  first: series.length > 0 ? series[0] : data.loss,
                  last: data.loss,
                  delta: series.length > 0 ? series[0] - data.loss : 0,
                  series: newSeries
                };
              });
            }
          } catch (error) {
            console.error('SSE message parse error:', error);
          }
        };

        eventSource.onerror = () => {
          console.log('SSE connection error, reconnecting...');
          setSseConnected(false);
          
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Exponential backoff: 1s → 2s → 4s → 8s (max)
          reconnectTimeout = setTimeout(() => {
            setSseReconnectDelay(prev => Math.min(prev * 2, 8000));
            connectSSE();
          }, sseReconnectDelay);
        };

      } catch (error) {
        console.error('SSE connection failed:', error);
        setSseConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [sseReconnectDelay]);

  // ---------- Pollers ----------
  useEffect(() => {
    const pollHealth = async () => {
      try {
        const [h, r] = await Promise.all([
          fetchJSON("/api/healthz"),
          fetchJSON("/api/readyz")
        ]);
        console.log("Health poll:", h, r); // Debug log
        setHealth(h);
        setReady(r);
        setLoading(false);
      } catch (e) {
        console.warn("Health poll failed:", e);
        setHealth({ ok: false });
        setReady({ ready: false });
        setLoading(false);
      }
    };
    
    const pollLists = async () => {
      try {
        const [syn, prop] = await Promise.all([
          fetchJSON("/api/synthients"),
          fetchJSON("/api/proposals")
        ]);
        console.log("Lists poll:", syn, prop); // Debug log
        setSynthients(syn);
        setProposals(prop);
        setLoading(false);
      } catch (e) {
        console.warn("Lists poll failed:", e);
        setSynthients([]);
        setProposals([]);
        setLoading(false);
      }
    };

    // Initial polls
    pollHealth();
    pollLists();
    
    // Health polling every 5s
    const healthInterval = setInterval(pollHealth, 5000);
    // Lists polling every 10s
    const listsInterval = setInterval(pollLists, 10000);
    
    return () => {
      clearInterval(healthInterval);
      clearInterval(listsInterval);
    };
  }, []);

  // ---------- Actions ----------
  const runTrain = async () => {
    if (busy || trainerRunning) return;
    setBusy(true);
    try {
      const res = await postJSON("/api/trainer/start", {});
      setToast(`Training started: ${res.runId?.substring(0,8)}`);
      setTrainerRunning(true);
      setCurrentRunId(res.runId || '');
    } catch (e) {
      setToast(`Train failed: ${e}`);
    } finally {
      setBusy(false);
    }
  };
  
  const stopTrain = async () => {
    if (busy || !trainerRunning) return;
    setBusy(true);
    try {
      await postJSON("/api/trainer/stop", {});
      setToast(`Training stopped`);
      setTrainerRunning(false);
      setCurrentRunId('');
    } catch (e) {
      setToast(`Stop failed: ${e}`);
    } finally {
      setBusy(false);
    }
  };

  const runInfer = async () => {
    if (busy) return;
    setBusy(true);
    setInferStatus("running");
    try {
      const res = await postJSON("/api/infer", { prompt: "Analyze system performance" });
      setToast(`Inference: ${res.runId}`);
      setInferStatus("done");
    } catch (e) {
      setToast(`Infer failed: ${e}`);
      setInferStatus("error");
    } finally {
      setBusy(false);
    }
  };

  const runSim = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await postJSON("/api/sim/start", { scenario: "smoke", ticks: 50 });
      setToast(`Simulation: ${res.runId}`);
      // Simulate tick progression
      let ticks = 0;
      const interval = setInterval(() => {
        ticks += Math.floor(Math.random() * 3) + 1;
        setSimTicks(ticks);
        if (ticks >= 50) {
          clearInterval(interval);
          setSimTicks(0);
        }
      }, 200);
    } catch (e) {
      setToast(`Sim failed: ${e}`);
    } finally {
      setBusy(false);
    }
  };

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-sm">Z</span>
          </div>
          <h1 className="text-xl font-bold text-zinc-100 mb-2">Zeropoint Protocol</h1>
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-black text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">Z</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-100">Zeropoint Protocol</h1>
                <p className="text-sm text-zinc-400">Local Agentic AI Appliance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Dot ok={health?.ok ?? false} />
                <span className="text-sm text-zinc-400">System</span>
              </div>
              <div className="flex items-center space-x-2">
                <Dot ok={ready?.ready ?? false} />
                <span className="text-sm text-zinc-400">Database</span>
              </div>
              <ConsensusPulse onClick={() => setGovOpen(true)} />
              <div className="text-xs text-zinc-500">
                {health ? new Date().toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 grid-rows-6 gap-4 h-[calc(100vh-120px)] transition-all duration-300">
          
          {/* System Status - Top Left */}
          <div className="col-span-3 row-span-2">
            <Kpi 
              label="System Health" 
              value={
                <div className="flex items-center space-x-2">
                  <Dot ok={health?.ok ?? false} />
                  <span className="text-sm">{health?.ok ? 'Operational' : 'Offline'}</span>
                </div>
              }
              hint="Zeropoint Protocol"
            />
          </div>

          {/* Metrics - Top Center */}
          <div className="col-span-6 row-span-2">
            <div className="grid grid-cols-3 gap-4 h-full">
              <Kpi 
                label="Synthients" 
                value={synthients.length} 
                hint={`${synthients.filter(s => s.status === 'training').length} training`}
              />
              <Kpi 
                label="Proposals" 
                value={proposals.length} 
                hint={`${proposals.filter(p => p.status === 'open').length} open`}
              />
              <Kpi 
                label="Total Runs" 
                value={synthients.reduce((acc, s) => acc + (s.TrainingRun?.length || 0), 0)} 
                hint="Active"
              />
            </div>
          </div>

          {/* AI Services - Top Right */}
          <div className="col-span-3 row-span-2">
            <div className="space-y-3 h-full">
              <button
                onClick={runTrain}
                disabled={busy}
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 rounded-xl p-3 transition-all duration-200 hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(251,146,60,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500/60"
                aria-label="Start Tinygrad training"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">🧠</span>
                  <span className="font-medium text-sm">Tinygrad Training</span>
                </div>
              </button>
              <button
                onClick={runInfer}
                disabled={busy}
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 rounded-xl p-3 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500/60"
                aria-label="Start Petals inference"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">🌸</span>
                  <span className="font-medium text-sm">Petals Inference</span>
                </div>
              </button>
              <button
                onClick={runSim}
                disabled={busy}
                className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700 rounded-xl p-3 transition-all duration-200 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500/60"
                aria-label="Start Wondercraft simulation"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">🎮</span>
                  <span className="font-medium text-sm">Wondercraft Simulation</span>
                </div>
              </button>
            </div>
          </div>

          {/* Training Stats - Middle Left */}
          <div className="col-span-6 row-span-2">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase">Training Progress</div>
                <div className="flex items-center space-x-2">
                  <Dot ok={sseConnected} />
                  <span className="text-xs text-zinc-500">{sseConnected ? 'Live' : 'Offline'}</span>
                </div>
              </div>
              {trainStats ? (
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-300">Loss: {trainStats.first?.toFixed(6)} → {trainStats.last?.toFixed(6)}</span>
                    <span className="text-emerald-400">Δ {trainStats.delta?.toFixed(6)}</span>
                  </div>
                  <Spark values={trainStats.series || []} />
                </div>
              ) : (
                <div className="text-zinc-500 text-sm flex-1">No training data</div>
              )}
              <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2">
                <div className="text-xs text-zinc-500 font-mono">
                  LR={trainEnv.lr || '0.05'} • Batch={trainEnv.batch || '64'} • Pause={trainEnv.pause || '8000'}ms
                  {currentRunId && <div className="mt-1">Run: {currentRunId.substring(0,6)}</div>}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={runTrain}
                    disabled={busy || trainerRunning}
                    className="flex-1 px-3 py-1.5 rounded border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition">
                    {trainerRunning ? 'Running...' : 'Start'}
                  </button>
                  <button 
                    onClick={stopTrain}
                    disabled={busy || !trainerRunning}
                    className="flex-1 px-3 py-1.5 rounded border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition">
                    Stop
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicators - Middle Right */}
          <div className="col-span-6 row-span-2">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
                <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase mb-2">Inference</div>
                <div className="flex items-center space-x-2">
                  <Dot ok={inferStatus === 'done'} />
                  <span className="text-sm text-zinc-300 capitalize">{inferStatus}</span>
                </div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)]">
                <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase mb-2">Simulation</div>
                <div className="text-sm text-zinc-300">
                  {simTicks > 0 ? `${simTicks}/50 ticks` : 'Idle'}
                </div>
              </div>
            </div>
          </div>

          {/* Active Synthients - Bottom Left */}
          <div className="col-span-6 row-span-2">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full">
              <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase mb-3">Active Synthients</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {synthients.slice(0, 4).map((synthient) => (
                  <div key={synthient.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-zinc-300">{synthient.name}</span>
                      <Dot ok={synthient.status === 'ready'} />
                    </div>
                    <div className="text-xs text-zinc-500">
                      {synthient.TrainingRun?.length || 0} runs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proposals - Bottom Right */}
          <div className="col-span-6 row-span-2">
            <button
              onClick={() => setGovOpen(true)}
              className="w-full h-full bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] text-left cursor-pointer"
              aria-label="Open Governance"
            >
              <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase mb-3">Governance</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {proposals.slice(0, 3).map((proposal) => (
                  <div 
                    key={proposal.id} 
                    className="bg-zinc-800/50 rounded-lg p-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-zinc-300 truncate">{proposal.title}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        proposal.status === 'open' ? 'bg-green-500/20 text-green-400' : 
                        proposal.status === 'approved' ? 'bg-blue-500/20 text-blue-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {proposal.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {proposal.Vote?.length || 0} votes
                    </div>
                  </div>
                ))}
              </div>
            </button>
          </div>
        </div>
      </div>

      <GovernanceOverlay open={govOpen} onClose={() => setGovOpen(false)} />

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-zinc-800 border border-zinc-700 text-zinc-100 px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
