globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, f as renderHead, g as renderSlot, a as renderTemplate } from './astro/server_C2tHotcq.mjs';

const $$Astro = createAstro("https://zeropointprotocol.ai");
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "Zeropoint Protocol" } = Astro2.props;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><link rel="stylesheet" href="/styles.css">${renderHead()}</head> <body> <header class="nav"> <div class="nav-container"> <div class="brand"> <div class="dot"></div> <strong>Zeropoint</strong> <span class="badge">prod</span> </div> <nav class="nav-links"> <a href="/">Home</a> <a href="/docs">Docs</a> <a href="/status">Status</a> <a href="/metrics">Metrics</a> <a href="/synthiants">Synthiants</a> <a href="/library">Library</a> <a href="/governance">Governance</a> <a href="/legal/licensing">Licensing</a> </nav> </div> </header> <main class="main-content"> ${renderSlot($$result, $$slots["default"])} </main> <footer class="footer"> <div class="footer-container"> <div class="footer-content"> <div class="footer-brand"> <div class="dot"></div> <strong>Zeropoint Protocol</strong> </div> <div class="footer-links"> <a href="https://github.com/FlynnVIN10/Zeropoint-Protocol">GitHub</a> <a href="/changelog">Changelog</a> <a href="/security">Security</a> <a href="/legal/privacy">Privacy</a> <a href="/contact">Contact</a> </div> </div> <div class="footer-copyright">
© 2025 Zeropoint Protocol. GOD FIRST.
</div> </div> </footer> </body></html>`;
}, "/Users/Flynn/Documents/GitHub/Zeropoint-Protocol/src/layouts/BaseLayout.astro", void 0);

export { $$BaseLayout as $ };
