type Env = {
	PETALS_EXEC_UPSTREAM?: string;
	PETALS_TOKEN?: string;
};

type PagesFunction<Env = unknown> = (ctx: { request: Request; env: Env }) => Response | Promise<Response>;

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

export const onRequest: PagesFunction<Env> = async (ctx) => {
	try {
		const { request, env } = ctx;
		const upstream = env.PETALS_EXEC_UPSTREAM;
		const body = await request.json().catch(() => ({} as any));
		const prompt = typeof body.q === 'string' ? body.q : (typeof body.prompt === 'string' ? body.prompt : '');
		if (upstream && prompt) {
			const r = await fetch(upstream, {
				method: 'POST',
				headers: {
					'content-type': 'application/json',
					...(env.PETALS_TOKEN ? { authorization: `Bearer ${env.PETALS_TOKEN}` } : {})
				},
				body: JSON.stringify({ q: prompt })
			});
			if (r.ok) return new Response(r.body, { headers: jsonHeaders() });
		}
		return new Response(JSON.stringify({ response: 'Petals proxy active: upstream not configured. This is a implementation response.' }), { headers: jsonHeaders() });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: 'internal', message: e?.message || 'unknown' }), { status: 500, headers: jsonHeaders() });
	}
};
