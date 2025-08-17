globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DOjK3O9Q.mjs';
import { manifest } from './manifest_B7nphImj.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/legal/licensing.astro.mjs');
const _page2 = () => import('./pages/metrics.astro.mjs');
const _page3 = () => import('./pages/status.astro.mjs');
const _page4 = () => import('./pages/synthiants.astro.mjs');
const _page5 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/legal/licensing.astro", _page1],
    ["src/pages/metrics.astro", _page2],
    ["src/pages/status.astro", _page3],
    ["src/pages/synthiants.astro", _page4],
    ["src/pages/index.astro", _page5]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
