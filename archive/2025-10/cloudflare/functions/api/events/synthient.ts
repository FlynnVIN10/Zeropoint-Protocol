type Env = {
	// Environment variables for synthient events
};

type PagesFunction<Env = unknown> = (ctx: { request: Request; env: Env }) => Response | Promise<Response>;

export const onRequest: PagesFunction<Env> = async (ctx) => {
	const { request } = ctx;
	const url = new URL(request.url);
	// Optional: allow client to set interval via query (?interval=1500)
	const intervalMs = Math.min(
		Math.max(parseInt(url.searchParams.get('interval') || '1500', 10) || 1500, 300),
		10000
	);

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let seq = 1;
			const encoder = new TextEncoder();

			const send = (event: string, data: unknown) => {
				const payload = typeof data === 'string' ? data : JSON.stringify(data);
				controller.enqueue(encoder.encode(`event: ${event}\n`));
				controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
			};

			// Initial comment
			controller.enqueue(encoder.encode(`: connected ${new Date().toISOString()}\n\n`));

			// Heartbeat
			const heartbeat = setInterval(() => {
				controller.enqueue(encoder.encode(`: ping ${Date.now()}\n\n`));
			}, 25000);

			const messages = [
				'Agent proposal queued',
				'Council vote opened',
				'Provider status: healthy',
				'Consensus threshold reached',
				'Executing action pipeline'
			];

			const timer = setInterval(() => {
				const message = {
					msg: messages[seq % messages.length],
					seq,
					ts: new Date().toISOString()
				};
				send('tick', message);
				seq += 1;
			}, intervalMs);

			const close = () => {
				clearInterval(timer);
				clearInterval(heartbeat);
				controller.close();
			};
		},
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream; charset=utf-8',
			'cache-control': 'no-store',
			'connection': 'keep-alive',
			'x-content-type-options': 'nosniff',
			'content-disposition': 'inline',
			'access-control-allow-origin': '*',
			'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
			'content-security-policy': "default-src 'self'; connect-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; upgrade-insecure-requests",
			'referrer-policy': 'strict-origin-when-cross-origin',
			'permissions-policy': 'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
		}
	});
};
