export async function onRequest() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      let i = 0;
      controller.enqueue(encoder.encode(`: consensus start\n\n`));
      const timer = setInterval(() => {
        const payload = { type: "consensus", state: (i % 7 === 0 ? "pending" : "approved"), seq: ++i, ts: new Date().toISOString() };
        controller.enqueue(encoder.encode(`event: consensus\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        if (i >= 50) { clearInterval(timer); controller.close(); }
      }, 3000);
    }
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
      "connection": "keep-alive"
    }
  });
}
