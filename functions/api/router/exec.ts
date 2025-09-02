type Env = {
	// Synthient endpoints (full URLs). Optional bearer tokens.
	PETALS_EXEC_URL?: string;
	PETALS_TOKEN?: string;
	WONDERCRAFT_EXEC_URL?: string;
	WONDERCRAFT_TOKEN?: string;
	TINYGRAD_EXEC_URL?: string;
	TINYGRAD_TOKEN?: string;

	OPENAI_API_KEY?: string;
	OPENAI_BASE_URL?: string; // optional custom base URL
	WORKERS_AI_MODEL?: string; // e.g., @cf/meta/llama-3.1-8b-instruct
	AI?: any; // Workers AI binding (if configured)
	[key: string]: any;
};

function jsonHeaders() {
	return {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff",
		"content-disposition": "inline",
		"access-control-allow-origin": "*",
		"strict-transport-security": "max-age=31536000; includeSubDomains; preload",
		"content-security-policy": "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
		"referrer-policy": "strict-origin-when-cross-origin",
		"permissions-policy": "accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
	};
}

function getOpenAIKey(env: Env): string | undefined {
	const candidates = [
		"OPENAI_API_KEY",
		"OPENAI_KEY",
		"OPENAI_TOKEN",
		"OPENAI",
		"OPENAI_API",
		"OPENAI_SECRET",
		"OPENAI_ACCESS_TOKEN"
	];
	for (const name of candidates) {
		const v = env[name];
		if (v && typeof v === "string" && v.trim()) return v.trim();
	}
	return undefined;
}

async function readQuery(request: Request): Promise<{ q: string; provider?: string }> {
	const url = new URL(request.url);
	const qFromUrl = url.searchParams.get("q");
	const provider = url.searchParams.get("provider") || undefined;
	if (qFromUrl) return { q: qFromUrl.trim(), provider };
	if (request.method === "POST") {
		try {
			const body = await request.json().catch(() => ({} as any));
			const q = typeof body.q === "string" ? body.q.trim() : (typeof body.prompt === "string" ? body.prompt.trim() : "");
			return { q, provider: body.provider || provider };
		} catch {}
	}
	return { q: "", provider };
}

async function callSynthient(name: string, execUrl: string, token: string | undefined, prompt: string) {
	const started = Date.now();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 15000);
	try {
		const resp = await fetch(execUrl, {
			method: "POST",
			headers: {
				"content-type": "application/json",
				...(token ? { authorization: `Bearer ${token}` } : {})
			},
			body: JSON.stringify({ q: prompt, prompt }),
			signal: controller.signal
		});
		const latencyMs = Date.now() - started;
		if (!resp.ok) {
			return { ok: false, status: resp.status, message: await resp.text().catch(() => "provider error"), telemetry: { provider: name, instance: execUrl, latencyMs } };
		}
		let responseText = "";
		let json: any = null;
		const ct = resp.headers.get("content-type") || "";
		if (ct.includes("application/json")) {
			json = await resp.json();
			responseText = json?.response || json?.text || json?.output || json?.message || JSON.stringify(json);
		} else {
			responseText = await resp.text();
		}
		return { ok: true, response: responseText, telemetry: { provider: name, instance: execUrl, latencyMs } };
	} catch (e: any) {
		const latencyMs = Date.now() - started;
		return { ok: false, status: 502, message: e?.message || "fetch error", telemetry: { provider: name, instance: execUrl, latencyMs } };
	} finally {
		clearTimeout(timeout);
	}
}

async function callOpenAI(env: Env, prompt: string) {
	const apiKey = getOpenAIKey(env) as string;
	const base = (env.OPENAI_BASE_URL || "https://api.openai.com").replace(/\/$/, "");
	const endpoint = `${base}/v1/chat/completions`;
	const started = Date.now();
	const resp = await fetch(endpoint, {
		method: "POST",
		headers: {
			"authorization": `Bearer ${apiKey}`,
			"content-type": "application/json"
		},
		body: JSON.stringify({
			model: "gpt-4o-mini",
			messages: [
				{ role: "system", content: "You are the Zeropoint Protocol assistant. Be concise, helpful, and accurate." },
				{ role: "user", content: prompt }
			],
			temperature: 0.2,
			max_tokens: 300
		})
	});
	const latencyMs = Date.now() - started;
	if (!resp.ok) {
		return {
			ok: false,
			status: resp.status,
			telemetry: { provider: "openai", instance: "main", latencyMs },
			message: await resp.text().catch(() => "provider error")
		};
	}
	const data = await resp.json();
	const content = data?.choices?.[0]?.message?.content || "";
	return { ok: true, response: content, telemetry: { provider: "openai", instance: "main", latencyMs } };
}

async function callWorkersAI(env: Env, prompt: string) {
	const model = env.WORKERS_AI_MODEL;
	if (!model || !env.AI) return { ok: false, status: 503, message: "Workers AI not configured" };
	const started = Date.now();
	try {
		const result = await env.AI.run(model, {
			messages: [
				{ role: "system", content: "You are the Zeropoint Protocol assistant. Be concise, helpful, and accurate." },
				{ role: "user", content: prompt }
			]
		});
		const latencyMs = Date.now() - started;
		const content = result?.response || result?.output || "";
		return { ok: true, response: content, telemetry: { provider: "workers-ai", instance: model, latencyMs } };
	} catch (e: any) {
		const latencyMs = Date.now() - started;
		return { ok: false, status: 500, message: e?.message || "Workers AI error", telemetry: { provider: "workers-ai", instance: model, latencyMs } };
	}
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
	try {
		const { q, provider } = await readQuery(ctx.request);
		if (!q) {
			return new Response(JSON.stringify({ error: "bad_request", message: "Missing query 'q'" }), { status: 400, headers: jsonHeaders() });
		}

		const env = ctx.env || {} as Env;

		// Preferred Synthient routing (use internal proxies if env URLs not present)
		const petalsUrl = env.PETALS_EXEC_URL || new URL('/api/providers/petals/exec', ctx.request.url).toString();
		const wonderUrl = env.WONDERCRAFT_EXEC_URL || new URL('/api/providers/wondercraft/exec', ctx.request.url).toString();
		const tinyUrl = env.TINYGRAD_EXEC_URL || new URL('/api/providers/tinygrad/exec', ctx.request.url).toString();

		const synthientCandidates: Array<{name: string; url?: string; token?: string}> = [];
		if (!provider || provider === 'petals') synthientCandidates.push({ name: 'petals', url: petalsUrl, token: env.PETALS_TOKEN });
		if (!provider || provider === 'wondercraft') synthientCandidates.push({ name: 'wondercraft', url: wonderUrl, token: env.WONDERCRAFT_TOKEN });
		if (!provider || provider === 'tinygrad') synthientCandidates.push({ name: 'tinygrad', url: tinyUrl, token: env.TINYGRAD_TOKEN });

		for (const cand of synthientCandidates) {
			if (!cand.url) continue;
			const res = await callSynthient(cand.name, cand.url, cand.token, q);
			if (res.ok) {
				return new Response(JSON.stringify({ response: res.response, telemetry: res.telemetry, timestamp: new Date().toISOString(), query: q, status: 'success' }), { headers: jsonHeaders() });
			}
		}

		// If no Synthient configured or all failed, optionally try external if available
		if (getOpenAIKey(env)) {
			let result: any = await callOpenAI(env, q);
			if (!result?.ok && env.WORKERS_AI_MODEL && (env as any).AI) {
				const fallback = await callWorkersAI(env, q);
				if (fallback?.ok) result = fallback;
			}
			if (result?.ok) {
				return new Response(JSON.stringify({ response: result.response, telemetry: result.telemetry, timestamp: new Date().toISOString(), query: q, status: 'success' }), { headers: jsonHeaders() });
			}
		}
		if (env.WORKERS_AI_MODEL && (env as any).AI) {
			const result = await callWorkersAI(env, q);
			if (result?.ok) {
				return new Response(JSON.stringify({ response: result.response, telemetry: result.telemetry, timestamp: new Date().toISOString(), query: q, status: 'success' }), { headers: jsonHeaders() });
			}
		}

		return new Response(JSON.stringify({ 
			error: 'not_configured',
			message: 'No Synthient endpoints configured. Set PETALS_EXEC_URL, WONDERCRAFT_EXEC_URL, or TINYGRAD_EXEC_URL.',
			telemetry: { provider: 'none', instance: 'none', latencyMs: 0 }
		}), { status: 503, headers: jsonHeaders() });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: "internal", message: error?.message || "unknown" }), { status: 500, headers: jsonHeaders() });
	}
};


