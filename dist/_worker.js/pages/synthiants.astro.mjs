globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                 */
import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_C2tHotcq.mjs';
import { $ as $$BaseLayout } from '../chunks/BaseLayout_CNvbZFOw.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro("https://zeropointprotocol.ai");
const $$Synthiants = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Synthiants;
  const feed = await fetch(`${Astro2.site?.origin ?? ""}/api/synthiants/feed`).then((r) => r.json()).catch(() => []);
  return renderTemplate`${renderComponent($$result, "Base", $$BaseLayout, { "title": "Zeropoint Protocol" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <h2>Synthiant Feed</h2> <p class="lead">Human consensus interface for agentic proposals and decisions.</p> <div class="grid"> ${feed.length ? feed.map(
    (p) => renderTemplate`<div class="card"> <h3>${p.title}</h3> <p>${p.summary}</p> <div class="kv"> <div>Agent</div><div>${p.agent}</div> <div>Risk</div><div>${p.risk}</div> <div>Confidence</div><div>${Math.round(p.confidence * 100)}%</div> <div>Status</div><div>${p.status}</div> </div> </div>`
  ) : renderTemplate`<div class="card"> <h3>No Proposals Yet</h3> <p>The synthiant feed is currently empty. Proposals will appear here as they are submitted by the agentic systems.</p> <div class="kv"> <div>Status</div><div class="status-ok">Ready</div> <div>Queue</div><div>Empty</div> <div>Last Check</div><div>${(/* @__PURE__ */ new Date()).toISOString()}</div> </div> </div>`} </div> </div> ` })}`;
}, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/synthiants.astro", void 0);

const $$file = "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/synthiants.astro";
const $$url = "/synthiants";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Synthiants,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
