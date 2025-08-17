globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as renderScript } from '../chunks/astro/server_C2tHotcq.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNvbZFOw.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$BaseLayout, { "title": "Zeropoint Protocol" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <section class="hero"> <h1>Agentic AI You Can Audit</h1> <p class="lead">Dual-consensus governance you can prove. Truthful probes you can curl. Build the future with confidence.</p> </section> <div class="grid"> <div class="card"> <h3>Launch Playground</h3> <p>Experience dual-consensus governance in action. Submit proposals, see Synthiant votes, and verify human consensus.</p> <a href="/docs" class="btn primary">Get Started</a> </div> <div class="card"> <h3>Copy cURL</h3> <p>Verify our truthful probes with simple commands. Every deployment is auditable and verifiable.</p> <a href="/status" class="btn">View Status</a> </div> <div class="card"> <h3>Read Docs</h3> <p>Comprehensive guides for building with Zeropoint Protocol. From quick start to advanced governance.</p> <a href="/docs" class="btn">Browse Docs</a> </div> </div> <div class="card"> <h3>Live Probes</h3> <p>Real-time system health and deployment information. These probes return truthful data you can verify.</p> <div class="kv"> <div>Health Check</div><div class="status-ok">Operational</div> <div>Ready State</div><div class="status-ok">Ready</div> <div>Last Deploy</div><div id="deploy-time">Loading...</div> </div> <div class="ctas"> <a href="/status" class="btn">Full Status</a> <a href="/metrics" class="btn">Live Metrics</a> </div> </div> </div> ${renderScript($$result2, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/index.astro?astro&type=script&index=0&lang.ts")} ` })}`;
}, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/index.astro", void 0);

const $$file = "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
