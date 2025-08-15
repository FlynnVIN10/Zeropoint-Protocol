// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://zeropointprotocol.ai',
  integrations: [tailwind(), mdx(), sitemap()],
  output: 'static'
});
