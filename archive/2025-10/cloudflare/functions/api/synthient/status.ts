export const onRequestGet: PagesFunction<{
  PETALS_STATUS_URL: string;
  WONDERCRAFT_STATUS_URL: string;
  TINYGRAD_STATUS_URL: string;
}> = async ({ env }) => {
  const urls = [
    ['petals', env.PETALS_STATUS_URL],
    ['wondercraft', env.WONDERCRAFT_STATUS_URL],
    ['tinygrad', env.TINYGRAD_STATUS_URL],
  ] as const;

  const results = await Promise.all(urls.map(async ([name, url]) => {
    try {
      const r = await fetch(url, { headers: { 'accept': 'application/json' }});
      const ok = r.ok;
      const json = ok ? await r.json() : null;
      return { name, ok, url, json, error: ok ? null : await r.text().catch(()=>null) };
    } catch (e:any) {
      return { name, ok:false, url, json:null, error:String(e?.message||e) };
    }
  }));

  // plain language synthesis with enhanced mapping
  const summary = results.map(r=>{
    if (!r.ok) return `${r.name}: offline`;
    
    // Map configured/active to human-readable status
    const configured = r.json?.configured ?? r.json?.status === 'configured';
    const active = r.json?.active ?? r.json?.status === 'active';
    
    let status = 'unknown';
    if (configured && active) status = 'online';
    else if (configured && !active) status = 'configured';
    else if (!configured) status = 'offline';
    
    // Extract metrics
    const ep = r.json?.epochs_completed ?? r.json?.epochs ?? r.json?.epoch ?? null;
    const jobs = r.json?.jobs_running ?? r.json?.runs ?? r.json?.active_jobs ?? null;
    const extra = [
      ep!=null ? `epochs ${ep}` : null,
      jobs!=null ? `jobs ${jobs}` : null,
    ].filter(Boolean).join(', ');
    
    return `${r.name}: ${status}${extra ? ` (${extra})` : ''}`;
  }).join(' | ');

  return new Response(JSON.stringify({
    ok: results.every(r=>r.ok),
    updated_at: new Date().toISOString(),
    services: Object.fromEntries(results.map(r=>[r.name, { ok:r.ok, url:r.url, data:r.json, error:r.error }])),
    summary,
  }), { headers: { 'content-type':'application/json' }});
};
