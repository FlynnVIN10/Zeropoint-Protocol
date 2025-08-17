import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zeropointprotocol.ai',
  output: 'server',
  adapter: cloudflare({}),
  integrations: [tailwind(), mdx(), sitemap()],
});
