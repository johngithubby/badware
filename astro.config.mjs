// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://johngithubby.github.io', // your GitHub Pages domain
  base: '/badware',                        // repo name
  integrations: [mdx(), sitemap()],
});
