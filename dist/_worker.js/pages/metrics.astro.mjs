globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C2tHotcq.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNvbZFOw.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://zeropointprotocol.ai");
const $$Metrics = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Metrics;
  const data = await fetch(`${Astro2.site?.origin ?? ""}/api/metrics`).then((r) => r.json()).catch(() => []);
  return renderTemplate`${renderComponent($$result, "Base", $$BaseLayout, { "title": "Zeropoint Protocol" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <h2>Live Metrics</h2> <p class="lead">Real-time system performance and operational data.</p> <div class="card"> <table> <thead> <tr> <th align="left">Metric</th> <th align="right">Value</th> <th>Time</th> </tr> </thead> <tbody> ${data.map(
    (m) => renderTemplate`<tr> <td>${m.name}</td> <td align="right">${m.value}</td> <td>${new Date(m.ts).toLocaleString()}</td> </tr>`
  )} </tbody> </table> </div> ${data.length === 0 && renderTemplate`<div class="card"> <h3>No Metrics Available</h3> <p>System metrics are currently unavailable. This may indicate the metrics service is starting up or experiencing issues.</p> </div>`} </div> ` })}`;
}, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/metrics.astro", void 0);

const $$file = "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/metrics.astro";
const $$url = "/metrics";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Metrics,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
