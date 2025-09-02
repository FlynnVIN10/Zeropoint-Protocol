type Env = {
	PETALS_STATUS_URL?: string;
	WONDERCRAFT_STATUS_URL?: string;
	TINYGRAD_STATUS_URL?: string;
	CF_PAGES_COMMIT_SHA?: string;
};

export const onRequest = async (ctx: { env: Env; request: Request }) => {
	try {
		const { env } = ctx;

		const started = Date.now();
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 5000);

		async function safeFetchJson(name: string, url?: string) {
			if (!url) return { ok: false, name } as const;
			try {
				const r = await fetch(url, { signal: controller.signal, headers: { 'accept': 'application/json' } });
				if (!r.ok) return { ok: false, name } as const;
				const j = await r.json().catch(() => null);
				return { ok: true, name, data: j } as const;
			} catch {
				return { ok: false, name } as const;
			}
		}

		const [petals, wonder, tiny] = await Promise.all([
			safeFetchJson('petals', env.PETALS_STATUS_URL),
			safeFetchJson('wondercraft', env.WONDERCRAFT_STATUS_URL),
			safeFetchJson('tinygrad', env.TINYGRAD_STATUS_URL)
		]);
		clearTimeout(timeout);

		function pickNumber(...vals: Array<any>): number | undefined {
			for (const v of vals) {
				const n = typeof v === 'number' ? v : Number.isFinite(Number(v)) ? Number(v) : undefined;
				if (Number.isFinite(n as number)) return n as number;
			}
			return undefined;
		}

		const activeFromFields = pickNumber(
			petals.ok ? (petals as any).data?.active_runs : undefined,
			wonder.ok ? (wonder as any).data?.active_runs : undefined,
			tiny.ok ? (tiny as any).data?.active_runs : undefined
		);
		let activeDerived = 0;
		activeDerived += petals.ok && (petals as any).data?.active === true ? 1 : 0;
		activeDerived += wonder.ok && (wonder as any).data?.active === true ? 1 : 0;
		activeDerived += tiny.ok && (tiny as any).data?.active === true ? 1 : 0;
		const activeRuns = activeFromFields ?? activeDerived;

		const completedToday = pickNumber(
			petals.ok ? (petals as any).data?.completed_today : undefined,
			wonder.ok ? (wonder as any).data?.completed_today : undefined,
			tiny.ok ? (tiny as any).data?.completed_today : undefined
		) ?? 0;

		const totalRuns = pickNumber(
			petals.ok ? (petals as any).data?.total_runs : undefined,
			wonder.ok ? (wonder as any).data?.total_runs : undefined,
			tiny.ok ? (tiny as any).data?.total_runs : undefined
		) ?? 0;

		const lastRun = (petals.ok && (petals as any).data?.last_run) || (wonder.ok && (wonder as any).data?.last_run) || (tiny.ok && (tiny as any).data?.last_run) || null;

		const leaderboard = (petals.ok && (petals as any).data?.leaderboard) || (wonder.ok && (wonder as any).data?.leaderboard) || (tiny.ok && (tiny as any).data?.leaderboard) || [];

		const trainingStatus = {
			active_runs: activeRuns,
			completed_today: completedToday,
			total_runs: totalRuns,
			last_run: lastRun || undefined,
			leaderboard,
			commit: env?.CF_PAGES_COMMIT_SHA || 'unknown',
			buildTime: new Date().toISOString(),
			timestamp: new Date().toISOString(),
			environment: 'production',
			source_latency_ms: Date.now() - started,
			sources: {
				petals: {
					state: petals.ok ? 'ok' : 'unavailable',
					active: petals.ok ? !!(petals as any).data?.active : false,
					lastContact: petals.ok ? (petals as any).data?.lastContact || (petals as any).data?.ts : undefined
				},
				wondercraft: {
					state: wonder.ok ? 'ok' : 'unavailable',
					active: wonder.ok ? !!(wonder as any).data?.active : false,
					lastContact: wonder.ok ? (wonder as any).data?.lastContact || (wonder as any).data?.ts : undefined
				},
				tinygrad: {
					state: tiny.ok ? 'ok' : 'unavailable',
					active: tiny.ok ? !!(tiny as any).data?.active : false,
					lastContact: tiny.ok ? (tiny as any).data?.lastContact || (tiny as any).data?.ts : undefined
				}
			}
		};

		return new Response(JSON.stringify(trainingStatus), { headers: jsonHeaders() });
	} catch (error: any) {
		return new Response(JSON.stringify({ 
			error: 'internal', 
			message: error.message,
			commit: (ctx as any).env?.CF_PAGES_COMMIT_SHA || 'unknown',
			buildTime: new Date().toISOString(),
			timestamp: new Date().toISOString(),
			environment: 'production'
		}), { status: 500, headers: jsonHeaders() });
	}
};

function jsonHeaders() {
	return {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff",
		"content-disposition": "inline",
		"access-control-allow-origin": "*",
		// Security headers aligned with Gate requirements
		"strict-transport-security": "max-age=31536000; includeSubDomains; preload",
		"content-security-policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
		"referrer-policy": "strict-origin-when-cross-origin",
		"permissions-policy": "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
	} as Record<string, string>;
}
