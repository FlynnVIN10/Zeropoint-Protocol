"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ConsensusPulse } from "@/src/components/governance/ConsensusPulse";
import GovernanceOverlay from "@/src/components/governance/GovernanceOverlay";
import SynthientActionsFeed from "@/src/components/SynthientActionsFeed";

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

// Status dot with three states: red (offline), yellow (idle), green (online)
function Dot({ status }: { status: 'online' | 'idle' | 'offline' }) {
  const getColorClasses = (status: string) => {
    switch (status) {
      case 'online':
        return "bg-emerald-500 shadow-[0_0_12px_#10b981]";
      case 'idle':
        return "bg-amber-500 shadow-[0_0_12px_#f59e0b]";
      case 'offline':
      default:
        return "bg-rose-500 shadow-[0_0_12px_#f43f5e]";
    }
  };

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${getColorClasses(status)}`}
      aria-label={status}
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
            } else if (data.type === 'idle') {
              // Clear training stats when no active training
              setTrainStats(null);
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
        
        // Update trainer status from health response
        if (h?.runStatus === 'running') {
          setTrainerRunning(true);
          setCurrentRunId(h?.runId || "active");
        } else {
          setTrainerRunning(false);
          setCurrentRunId("");
        }
        
        setLoading(false);
      } catch (e) {
        console.warn("Health poll failed:", e);
        setHealth({ ok: false });
        setReady({ ready: false });
        setTrainerRunning(false);
        setLoading(false);
      }
    };
    
    const pollLists = async () => {
      try {
        const [syn, prop] = await Promise.all([
          fetchJSON("/api/synthients"),
          fetchJSON("/api/governance/proposals")
        ]);
        console.log("Lists poll:", syn, prop); // Debug log
        setSynthients(syn?.synthients || []);
        setProposals(prop?.proposals || []);
        setLoading(false);
      } catch (e) {
        console.warn("Lists poll failed:", e);
        setSynthients([]);
        setProposals([]);
        setLoading(false);
      }
    };

    // Initial polls with immediate sync
    pollHealth();
    pollLists();
    
    // Immediate trainer status check on page load
    const checkTrainerStatus = async () => {
      try {
        const health = await fetchJSON("/api/healthz");
        if (health?.runStatus === 'running') {
          setTrainerRunning(true);
          setCurrentRunId(health?.runId || "active");
        } else {
          setTrainerRunning(false);
          setCurrentRunId("");
        }
      } catch (error) {
        console.warn("Failed to check trainer status on load:", error);
      }
    };
    
    checkTrainerStatus();
    
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
                <Dot status={health?.ok ? 'online' : 'offline'} />
                <span className="text-sm text-zinc-400">System</span>
              </div>
              <div className="flex items-center space-x-2">
                <Dot status={ready?.ready ? 'online' : 'offline'} />
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

      {/* Main Dashboard Grid */}
      <main className="dashboard grid grid-cols-4 lg:grid-cols-4 md:grid-cols-2 grid-rows-[auto_auto_1fr] gap-4 h-[100dvh] p-4">
          
          {/* System Health — top-left, spans two columns */}
          <section id="sys-health" className="col-span-2 row-start-1">
            <Kpi 
              label="System Health" 
              value={
                <div className="flex items-center space-x-2">
                  <Dot status={health?.ok ? 'online' : 'offline'} />
                  <span className="text-sm">{health?.ok ? 'Operational' : 'Offline'}</span>
                </div>
              }
              hint="Zeropoint Protocol"
            />
          </section>

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

          {/* Actions Feed — right rail full height */}
          <aside id="actions-feed" className="col-start-3 col-span-2 row-start-1 row-span-3 md:col-span-2 md:col-start-1 md:row-start-auto md:row-span-1 overflow-y-auto">
            <SynthientActionsFeed />
          </aside>

          {/* Service cards stacked below System Health */}
          <section id="svc-tinygrad" className="col-start-1 row-start-2">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] flex flex-col h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-zinc-400 text-[0.65rem] tracking-wide uppercase flex items-center space-x-1">
                  <span>🧠</span>
                  <span>Tinygrad</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Dot status={trainerRunning ? 'online' : 'offline'} />
                  <span className="text-[0.6rem] text-zinc-500">
                    {trainerRunning ? 'Live' : 'Off'}
                  </span>
                </div>
              </div>
              {trainStats ? (
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-zinc-300">
                    Loss: {trainStats.last?.toFixed(4)}
                  </div>
                  <Spark values={trainStats.series?.slice(-10) || []} />
                </div>
              ) : (
                <div className="text-zinc-500 text-xs flex-1">No data</div>
              )}
              <div className="flex gap-1 mt-2">
                <button 
                  onClick={runTrain}
                  disabled={busy || trainerRunning}
                  className="flex-1 px-2 py-1 rounded border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-[0.6rem] transition">
                  {trainerRunning ? 'Run...' : 'Start'}
                </button>
                <button 
                  onClick={stopTrain}
                  disabled={busy || !trainerRunning}
                  className="flex-1 px-2 py-1 rounded border border-amber-500/50 text-amber-300 hover:bg-amber-500/10 disabled:opacity-50 disabled:cursor-not-allowed text-[0.6rem] transition">
                  Stop
                </button>
              </div>
            </div>
          </section>

          <section id="svc-petals" className="col-start-2 row-start-2">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-zinc-400 text-[0.65rem] tracking-wide uppercase flex items-center space-x-1">
                  <span>🌸</span>
                  <span>Petals</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Dot status={inferStatus === 'done' ? 'online' : inferStatus === 'idle' ? 'idle' : 'offline'} />
                  <span className="text-[0.6rem] text-zinc-300 capitalize">{inferStatus}</span>
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                {inferStatus === 'done' ? 'Ready for inference' : 'Standby'}
              </div>
            </div>
          </section>

          <section id="svc-wondercraft" className="col-span-2 row-start-3">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="text-zinc-400 text-[0.65rem] tracking-wide uppercase flex items-center space-x-1">
                  <span>🎮</span>
                  <span>Wondercraft</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Dot status={simTicks > 0 ? 'online' : 'idle'} />
                  <span className="text-[0.6rem] text-zinc-300">
                    {simTicks > 0 ? `${simTicks}/50` : 'Idle'}
                  </span>
                </div>
              </div>
              <div className="text-xs text-zinc-500">
                {simTicks > 0 ? 'Simulation active' : 'Ready'}
              </div>
            </div>
          </section>


          {/* Active Synthients - Bottom Left */}
          <div className="col-span-2 row-start-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.35)] h-full">
              <div className="text-zinc-400 text-[0.75rem] tracking-wide uppercase mb-3">Active Synthients</div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {synthients.slice(0, 4).map((synthient) => (
                  <div key={synthient.id} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-zinc-300">{synthient.name}</span>
                      <Dot status={
                        synthient.isRunning ? 'online' : 
                        synthient.status === 'active' ? 'online' :
                        synthient.status === 'idle' ? 'idle' : 
                        'offline'
                      } />
                    </div>
                    <div className="text-xs text-zinc-500">
                      {synthient.runsCount || 0} runs
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Proposals - Bottom Right */}
          <div className="col-span-2 row-start-6">
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
      </main>

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
