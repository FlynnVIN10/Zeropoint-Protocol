type Env = {
	OPENAI_API_KEY?: string;
	OPENAI_BASE_URL?: string; // optional custom base URL
	WORKERS_AI_MODEL?: string; // e.g., @cf/meta/llama-3.1-8b-instruct
	AI?: any; // Workers AI binding (if configured)
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

async function readQuery(request: Request): Promise<string> {
	const url = new URL(request.url);
	const qFromUrl = url.searchParams.get("q");
	if (qFromUrl) return qFromUrl.trim();
	if (request.method === "POST") {
		try {
			const body = await request.json().catch(() => ({} as any));
			if (typeof body.q === "string") return body.q.trim();
		} catch {}
	}
	return "";
}

async function callOpenAI(env: Env, prompt: string) {
	const apiKey = env.OPENAI_API_KEY as string;
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
		const q = await readQuery(ctx.request);
		if (!q) {
			return new Response(JSON.stringify({ error: "bad_request", message: "Missing query 'q'" }), { status: 400, headers: jsonHeaders() });
		}

		const env = ctx.env || {} as Env;
		let result: any = null;

		if (env.OPENAI_API_KEY) {
			result = await callOpenAI(env, q);
		} else if (env.WORKERS_AI_MODEL && (env as any).AI) {
			result = await callWorkersAI(env, q);
		} else {
			return new Response(JSON.stringify({ 
				error: "not_configured",
				message: "LLM provider not configured. Set OPENAI_API_KEY or bind Workers AI (AI) and WORKERS_AI_MODEL.",
				telemetry: { provider: "none", instance: "none", latencyMs: 0 }
			}), { status: 503, headers: jsonHeaders() });
		}

		if (!result?.ok) {
			return new Response(JSON.stringify({ error: "provider_error", message: result?.message || "unknown", telemetry: result?.telemetry }), { status: result?.status || 502, headers: jsonHeaders() });
		}

		return new Response(JSON.stringify({ response: result.response, telemetry: result.telemetry, timestamp: new Date().toISOString(), query: q, status: "success" }), { headers: jsonHeaders() });
	} catch (error: any) {
		return new Response(JSON.stringify({ error: "internal", message: error?.message || "unknown" }), { status: 500, headers: jsonHeaders() });
	}
};


