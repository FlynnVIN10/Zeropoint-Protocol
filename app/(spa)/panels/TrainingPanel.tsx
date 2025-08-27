import { unstable_noStore as noStore } from "next/cache";

async function getData() {
  noStore();
  const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/training/status`, { cache: "no-store" });
  if (!r.ok) throw new Error(`status ${r.status}`);
  return r.json();
}

export default async function TrainingPanel() {
  try {
    const data = await getData();
    return (
      <section aria-labelledby="training">
        <h2 id="training">Training Status</h2>
        <dl>
          <div><dt>Run ID</dt><dd>{data.run_id ?? "—"}</dd></div>
          <div><dt>Epoch</dt><dd>{data.epoch ?? "—"}</dd></div>
          <div><dt>Step</dt><dd>{data.step ?? "—"}</dd></div>
          <div><dt>Loss</dt><dd>{data.metrics?.loss ?? data.loss ?? "—"}</dd></div>
          <div><dt>Commit</dt><dd>{data.commit ?? "—"}</dd></div>
          <div><dt>Timestamp</dt><dd>{data.ended_at ?? data.started_at ?? data.ts ?? "—"}</dd></div>
        </dl>
        <a href="/evidence/training/leaderboard.json">View Leaderboard JSON</a>
      </section>
    );
  } catch (e:any) {
    return <section><h2>Training Status</h2><p>No data: {e.message}</p></section>;
  }
}


