/**
 * Back-to-top button.
 *
 * Hidden until the reader has scrolled past roughly one viewport, then revealed
 * by a data attribute so all styling stays in CSS.
 */

export function initBackToTop() {
  const button = document.querySelector('[data-back-to-top]');
  if (!button) return;

  let ticking = false;

  function update() {
    ticking = false;
    const visible = window.scrollY > window.innerHeight * 0.8;
    button.dataset.visible = String(visible);
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true },
  );

  button.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  update();
}
