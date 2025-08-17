export const onRequestGet = ({ env }) =>
  new Response(JSON.stringify({
    ready: true,
    commit: env?.CF_PAGES_COMMIT_SHA || "",
    buildTime: new Date().toISOString()
  }), { headers: { "content-type": "application/json" }});
