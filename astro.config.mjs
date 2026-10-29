import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://kkc.github.io',
  output: 'static',
  build: {inlineStylesheets: 'always'},
  trailingSlash: 'always',
  integrations: [sitemap({filter: (page) => !page.endsWith('/404/')})],
  markdown: {shikiConfig: {theme: 'github-light'}},
  server: {host: '127.0.0.1',port: 4321},
  devToolbar: {enabled: false}
});
