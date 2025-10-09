import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const RUNS_ROOT = path.join(process.cwd(), "public", "evidence", "runs");

export async function GET(req: NextRequest) {
  try {
    const run_id = req.nextUrl.searchParams.get("run_id");
    if (!run_id) return NextResponse.json({ error: "run_id required" }, { status: 400 });

    // runs/<YYYY-MM-DD>/<run_id>/metrics.jsonl
    const days = fs.readdirSync(RUNS_ROOT).sort().reverse();
    let metricsPath: string | null = null;
    for (const day of days) {
      const p = path.join(RUNS_ROOT, day, run_id, "metrics.jsonl");
      if (fs.existsSync(p)) { metricsPath = p; break; }
    }
    if (!metricsPath) return NextResponse.json({ error: "metrics not found" }, { status: 404 });

    const lines = fs.readFileSync(metricsPath, "utf8").trim().split(/\r?\n/).filter(Boolean);
    const series = lines.map(l => JSON.parse(l).loss).filter((x: unknown) => typeof x === "number");
    if (!series.length) return NextResponse.json({ error: "no metrics" }, { status: 422 });

    const first = series[0], last = series[series.length - 1];
    return NextResponse.json({ first, last, delta: first - last, series });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "error" }, { status: 500 });
  }
}
