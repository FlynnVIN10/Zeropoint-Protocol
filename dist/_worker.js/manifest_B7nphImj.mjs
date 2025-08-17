globalThis.process ??= {}; globalThis.process.env ??= {};
import { h as decodeKey } from './chunks/astro/server_C2tHotcq.mjs';
import './chunks/astro-designed-error-pages_DTksPC61.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_hRxC-k9m.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/","cacheDir":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/node_modules/.astro/","outDir":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/dist/","srcDir":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/","publicDir":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/public/","buildClientDir":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/dist/","buildServerDir":"file:///Users/Flynn/Documents/GitHub/Zeropoint-Protocol/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.Bsfxuyfa.css"}],"routeData":{"route":"/legal/licensing","isIndex":false,"type":"page","pattern":"^\\/legal\\/licensing\\/?$","segments":[[{"content":"legal","dynamic":false,"spread":false}],[{"content":"licensing","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/legal/licensing.astro","pathname":"/legal/licensing","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.Bsfxuyfa.css"}],"routeData":{"route":"/metrics","isIndex":false,"type":"page","pattern":"^\\/metrics\\/?$","segments":[[{"content":"metrics","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/metrics.astro","pathname":"/metrics","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.Bsfxuyfa.css"}],"routeData":{"route":"/status","isIndex":false,"type":"page","pattern":"^\\/status\\/?$","segments":[[{"content":"status","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/status.astro","pathname":"/status","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.Bsfxuyfa.css"}],"routeData":{"route":"/synthiants","isIndex":false,"type":"page","pattern":"^\\/synthiants\\/?$","segments":[[{"content":"synthiants","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/synthiants.astro","pathname":"/synthiants","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/index.Bsfxuyfa.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://zeropointprotocol.ai","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/legal/licensing.astro",{"propagation":"none","containsHead":true}],["/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/metrics.astro",{"propagation":"none","containsHead":true}],["/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/status.astro",{"propagation":"none","containsHead":true}],["/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/synthiants.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/legal/licensing@_@astro":"pages/legal/licensing.astro.mjs","\u0000@astro-page:src/pages/metrics@_@astro":"pages/metrics.astro.mjs","\u0000@astro-page:src/pages/status@_@astro":"pages/status.astro.mjs","\u0000@astro-page:src/pages/synthiants@_@astro":"pages/synthiants.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_B7nphImj.mjs","/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.BHmiwIu6.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/pages/index.astro?astro&type=script&index=0&lang.ts","fetch(\"/api/healthz\").then(e=>e.json()).then(e=>{const t=document.getElementById(\"deploy-time\");t&&e.buildTime&&(t.textContent=new Date(e.buildTime).toLocaleString())}).catch(()=>{const e=document.getElementById(\"deploy-time\");e&&(e.textContent=\"Unavailable\")});"]],"assets":["/_astro/index.Bsfxuyfa.css","/_headers","/favicon.ico","/favicon.svg","/index.html","/robots.txt","/security.txt","/style.css","/styles.css","/tokens.css","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/_noop-actions.mjs","/_worker.js/index.js","/_worker.js/renderers.mjs","/api/healthz.json","/api/readyz.json","/audits/index.html","/consensus/index.html","/governance/index.html","/library/index.html","/license/LICENSE-OPEN-APACHE-2.0.txt","/license/LICENSE-ZP-WHITE-LABEL.md","/metrics/index.html","/status/index.html","/status/version.json","/_worker.js/_astro/index.Bsfxuyfa.css","/_worker.js/chunks/BaseLayout_CNvbZFOw.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_DOjK3O9Q.mjs","/_worker.js/chunks/astro-designed-error-pages_DTksPC61.mjs","/_worker.js/chunks/astro_CgnnL8a-.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/index_5YLIBp2Y.mjs","/_worker.js/chunks/noop-middleware_hRxC-k9m.mjs","/legal/acceptable-use/index.html","/_worker.js/pages/_image.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/metrics.astro.mjs","/_worker.js/pages/status.astro.mjs","/_worker.js/pages/synthiants.astro.mjs","/legal/accessibility/index.html","/legal/attributions/index.html","/legal/cookies/index.html","/legal/dpa/index.html","/legal/privacy/index.html","/legal/terms/index.html","/legal/security/index.html","/_worker.js/chunks/astro/server_C2tHotcq.mjs","/_worker.js/pages/legal/licensing.astro.mjs"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"abwKuaeDJyQHSZuVIgZIgPFVtQ1SkSFuP4hgNulmj+g=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
