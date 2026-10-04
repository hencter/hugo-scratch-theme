/**
 * Colour theme: light / dark / system.
 *
 * The *initial* value is applied by a tiny inline script in <head> (it must run
 * before first paint, and a bundled module is deferred by definition). This
 * module only owns the interactive switch, its persistence and the OS
 * preference listener.
 *
 * The resolved value is written to BOTH `data-theme` (our design tokens) and a
 * `light`/`dark` class (the Chroma stylesheets generated with --modeSelector).
 */

const STORAGE_KEY = 'hugo-scratch:theme';
const MODES = ['light', 'dark', 'system'];

/** Read the stored preference, tolerating private-mode storage failures. */
export function getMode() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return MODES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** Turn a mode into the concrete theme actually shown. */
export function resolveMode(mode) {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode === 'dark' ? 'dark' : 'light';
}

/** Apply a resolved theme to <html>. */
export function applyTheme(resolved) {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.classList.toggle('dark', resolved === 'dark');
  root.classList.toggle('light', resolved === 'light');
}

function storeMode(mode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* Storage is unavailable; the choice simply will not survive a reload. */
  }
}

export function initTheme() {
  const button = document.querySelector('[data-theme-toggle]');
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function sync(mode) {
    applyTheme(resolveMode(mode));

    if (!button) return;
    const next = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
    const labels = {
      light: button.dataset.labelLight || 'Light',
      dark: button.dataset.labelDark || 'Dark',
      system: button.dataset.labelSystem || 'System',
    };
    const label = `${button.dataset.labelTheme || 'Theme'}: ${labels[next]}`;
    button.dataset.themeValue = mode;
    button.dataset.themeNext = next;
    button.dataset.resolved = resolveMode(mode);
    button.setAttribute('aria-label', label);
    button.setAttribute('title', label);
  }

  sync(getMode());

  if (button) {
    button.addEventListener('click', () => {
      const mode = MODES[(MODES.indexOf(getMode()) + 1) % MODES.length];
      storeMode(mode);
      sync(mode);
    });
  }

  // Follow the OS only while the user has not chosen an explicit theme.
  media.addEventListener('change', () => {
    if (getMode() === 'system') sync('system');
  });
}
