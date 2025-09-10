type Env = {
	PETALS_STATUS_UPSTREAM?: string;
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
		const upstream = ctx.env.PETALS_STATUS_UPSTREAM;
		if (upstream) {
			const r = await fetch(upstream, { headers: { accept: 'application/json' } });
			if (r.ok) {
				return new Response(r.body, { headers: jsonHeaders() });
			}
		}
		// Fallback to local evidence file
		const localUrl = new URL('/petals/status.json', ctx.request.url).toString();
		const lr = await fetch(localUrl, { headers: { accept: 'application/json' } });
		if (lr.ok) return new Response(lr.body, { headers: jsonHeaders() });
		return new Response(JSON.stringify({ configured: false, active: false, ts: new Date().toISOString() }), { headers: jsonHeaders() });
	} catch (e: any) {
		return new Response(JSON.stringify({ error: 'internal', message: e?.message || 'unknown' }), { status: 500, headers: jsonHeaders() });
	}
};
