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
  _push(`<h1${ssrRenderAttrs(_attrs)}>Metrics</h1>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/metrics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const metrics = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  metrics as default
};
//# sourceMappingURL=metrics-BGCXQ9Pu.js.map
