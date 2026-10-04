/**
 * Mobile navigation disclosure.
 *
 * The header markup ships a real <nav> and a real <ul>; this module only
 * toggles visibility, so the navigation is fully usable (and crawlable) with
 * JavaScript disabled.
 */

export function initNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
  }

  setOpen(false);

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close on Escape, and after following a link inside the panel.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // A resize out of the mobile breakpoint must never leave the panel "open".
  const wide = window.matchMedia('(min-width: 48rem)');
  wide.addEventListener('change', (event) => {
    if (event.matches) nav.removeAttribute('data-open');
  });
}
