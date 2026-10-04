/**
 * main.js — the single JavaScript entry point.
 *
 * Built with Hugo Pipes:
 *   resources.Get "js/main.js" | js.Build | minify | fingerprint
 *
 * `js.Build` bundles every `import` below with esbuild into ONE file, so the
 * browser makes a single request and no module loader is required. `@params`
 * is a virtual module Hugo injects from the theme template's `params` option —
 * that is how site configuration and translations reach the client without a
 * second network request.
 */

import * as params from '@params';

import { initTheme } from './modules/theme.js';
import { initNav } from './modules/nav.js';
import { initSearch } from './modules/search.js';
import { initToc } from './modules/toc.js';
import { initCopyButtons } from './modules/copy.js';
import { initTabs } from './modules/tabs.js';
import { initBackToTop } from './modules/back-to-top.js';

/** Run `fn` once the DOM is parsed, however late the bundle loaded. */
function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

ready(() => {
  initTheme();
  initNav();
  initSearch(params);
  initToc();
  initCopyButtons(params.i18n || {});
  initTabs();
  initBackToTop();
});
