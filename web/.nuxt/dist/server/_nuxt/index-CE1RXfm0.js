import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/vue/index.mjs";
import { _ as _export_sfc } from "../server.mjs";
import "ofetch";
import "#internal/nuxt/paths";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/hookable/dist/index.mjs";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/unctx/dist/index.mjs";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/h3/dist/index.mjs";
import "vue-router";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/radix3/dist/index.mjs";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/defu/dist/defu.mjs";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/ufo/dist/index.mjs";
import "@vueuse/core";
import "tailwind-merge";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/klona/dist/index.mjs";
import "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/web/node_modules/@unhead/vue/dist/index.mjs";
import "@iconify/vue";
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<section${ssrRenderAttrs(_attrs)}><h1 class="text-4xl font-semibold mb-2">Dual-Consensus Agentic Platform</h1><p class="text-zinc-400 max-w-2xl">Futuristic corporate black. Minimal. Auditable. Truthful.</p></section>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  index as default
};
//# sourceMappingURL=index-CE1RXfm0.js.map
