globalThis.process ??= {}; globalThis.process.env ??= {};
/* empty css                                    */
import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C2tHotcq.mjs';
import { $ as $$BaseLayout } from '../../chunks/BaseLayout_CNvbZFOw.mjs';
export { renderers } from '../../renderers.mjs';

const $$Licensing = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Base", $$BaseLayout, { "title": "Zeropoint Protocol" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <h2>Licensing</h2> <p class="lead">Choose the license that fits your use case for Zeropoint Protocol.</p> <div class="grid"> <div class="card"> <h3>Apache-2.0</h3> <p>Open source license for development, modification, and commercial use. Permits patent use, requires license and copyright notices.</p> <a href="/license/LICENSE-OPEN-APACHE-2.0.txt" class="btn">View Full License</a> </div> <div class="card"> <h3>White-Label License</h3> <p>Commercial license for branding, distribution, and enterprise deployment. Includes support and compliance requirements.</p> <a href="/license/LICENSE-ZP-WHITE-LABEL.md" class="btn">View Summary</a> </div> </div> <div class="card"> <h3>License Comparison</h3> <div class="kv"> <div>Apache-2.0</div><div>Open source, permissive, patent protection</div> <div>White-Label</div><div>Commercial, branded, supported</div> <div>Source Access</div><div>Full (Apache) / Limited (WL)</div> <div>Modifications</div><div>Allowed (Apache) / Internal only (WL)</div> </div> </div> </div> ` })}`;
}, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/legal/licensing.astro", void 0);

const $$file = "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/legal/licensing.astro";
const $$url = "/legal/licensing";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Licensing,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
