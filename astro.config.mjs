// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://zeropointprotocol.ai',
  output: 'static',
  integrations: [tailwind(), mdx(), sitemap()]
});
