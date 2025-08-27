import { unstable_noStore as noStore } from "next/cache";

type TrainingStatus = {
  run_id?: string;
  model?: string;
  epoch?: number;
  step?: number;
  loss?: number;
  duration_s?: number;
  metrics?: { loss?: number; accuracy?: number };
  commit?: string;
  started_at?: string;
  ended_at?: string;
  ts?: string;
};

async function getData(): Promise<TrainingStatus> {
  noStore();
  const r = await fetch(`/api/training/status`, { cache: "no-store" });
  if (!r.ok) throw new Error(`status ${r.status}`);
  return r.json();
}

export default async function TrainingPanel() {
  try {
    const data = await getData();
    const lossValue = data.metrics?.loss ?? data.loss;
    const ts = data.ended_at || data.started_at || data.ts;
    return (
      <section aria-labelledby="training" className="p-4">
        <h2 id="training" className="text-xl text-[#6E00FF] mb-3">Training Status</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
          <div><dt className="text-[#ccc]">Run ID</dt><dd className="font-mono">{data.run_id ?? "—"}</dd></div>
          <div><dt className="text-[#ccc]">Model</dt><dd className="font-mono">{data.model ?? "—"}</dd></div>
          <div><dt className="text-[#ccc]">Epoch</dt><dd className="font-mono">{data.epoch ?? "—"}</dd></div>
          <div><dt className="text-[#ccc]">Step</dt><dd className="font-mono">{data.step ?? "—"}</dd></div>
          <div><dt className="text-[#ccc]">Loss</dt><dd className="font-mono">{lossValue ?? "—"}</dd></div>
          <div><dt className="text-[#ccc]">Commit</dt><dd className="font-mono">{data.commit ?? "—"}</dd></div>
          <div><dt className="text-[#ccc]">Timestamp</dt><dd className="font-mono">{ts ?? "—"}</dd></div>
        </dl>
        <a className="inline-block mt-3 text-[#6E00FF] underline" href="/evidence/training/leaderboard.json">View Leaderboard JSON</a>
      </section>
    );
  } catch (e: any) {
    return (
      <section className="p-4">
        <h2 className="text-xl text-[#6E00FF] mb-3">Training Status</h2>
        <p className="text-[#ccc]">No data: {e?.message ?? "unknown error"}</p>
      </section>
    );
  }
}


