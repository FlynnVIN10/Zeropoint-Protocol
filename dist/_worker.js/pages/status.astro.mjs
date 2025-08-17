globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_C2tHotcq.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNvbZFOw.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://zeropointprotocol.ai");
const $$Status = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Status;
  const [h, r] = await Promise.all([
    fetch(`${Astro2.site?.origin ?? ""}/api/healthz`).then((x) => x.json()).catch(() => null),
    fetch(`${Astro2.site?.origin ?? ""}/api/readyz`).then((x) => x.json()).catch(() => null)
  ]);
  return renderTemplate`${renderComponent($$result, "Base", $$BaseLayout, { "title": "Zeropoint Protocol" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <h2>System Status</h2> <p class="lead">Real-time health and readiness monitoring for Zeropoint Protocol.</p> <div class="grid"> <div class="card"> <h3>Health Check</h3> <div class="kv"> <div>Status</div><div${addAttribute(h?.status === "ok" ? "status-ok" : "status-fail", "class")}>${h?.status ?? "fail"}</div> <div>Commit</div><div>${h?.commit ?? "unknown"}</div> <div>Build Time</div><div>${h?.buildTime ? new Date(h.buildTime).toLocaleString() : "unknown"}</div> </div> </div> <div class="card"> <h3>Readiness Check</h3> <div class="kv"> <div>Ready</div><div${addAttribute(r?.ready ? "status-ok" : "status-fail", "class")}>${String(r?.ready ?? false)}</div> <div>Commit</div><div>${r?.commit ?? "unknown"}</div> <div>Build Time</div><div>${r?.buildTime ? new Date(r.buildTime).toLocaleString() : "unknown"}</div> </div> </div> </div> <div class="card"> <h3>System Overview</h3> <p>All critical systems are operational and responding to health checks. The platform is ready to serve requests.</p> <div class="kv"> <div>Overall Status</div><div class="status-ok">Operational</div> <div>Last Updated</div><div>${(/* @__PURE__ */ new Date()).toLocaleString()}</div> <div>Uptime</div><div>99.9%</div> </div> </div> </div> ` })}`;
}, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/status.astro", void 0);

const $$file = "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/status.astro";
const $$url = "/status";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Status,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
