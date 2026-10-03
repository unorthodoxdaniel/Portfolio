// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';

// https://astro.build/config
// `site` (canonical origin) and any adapter/output settings are intentionally
// left unset until the production domain and hosting are decided.
export default defineConfig({
  markdown: {
    processor: satteri({
      // Content is migrated verbatim from the legacy site; do not let the renderer
      // rewrite quotes, dashes or ellipses. Every other Markdown default is unchanged.
      features: { smartPunctuation: false },
    }),
  },
});
