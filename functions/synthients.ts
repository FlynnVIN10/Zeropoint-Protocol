// Cloudflare Pages Function -> /synthients redirect
export const onRequest = async () => {
  return new Response(null, {
    status: 301,
    headers: {
      'Location': '/synthients/',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    },
  });
};
