export async function onRequest() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`: stream start\n\n`));
      let i = 0;
      const timer = setInterval(() => {
        const payload = { type: "synthiant", msg: "activity", seq: ++i, ts: new Date().toISOString() };
        controller.enqueue(encoder.encode(`event: tick\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        if (i >= 50) {
          clearInterval(timer);
          controller.enqueue(encoder.encode(`: stream end\n\n`));
          controller.close();
        }
      }, 1000);
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
