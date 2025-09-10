export const onRequest = async () => {
  return new Response(JSON.stringify({ message: "API test successful" }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
};
