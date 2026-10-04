/**
 * Table-of-contents scroll spy.
 *
 * Uses IntersectionObserver rather than a scroll handler, so the main thread is
 * never busy while the reader scrolls. The observer root margin creates a band
 * near the top of the viewport: whichever heading is inside that band becomes
 * the current item.
 */

export function initToc() {
  const toc = document.querySelector('[data-toc]');
  if (!toc) return;

  const links = new Map();
  for (const link of toc.querySelectorAll('a[href^="#"]')) {
    links.set(decodeURIComponent(link.hash.slice(1)), link);
  }
  if (!links.size) return;

  const headings = [...document.querySelectorAll('.prose h2[id], .prose h3[id], .prose h4[id]')]
    .filter((heading) => links.has(heading.id));
  if (!headings.length) return;

  let current = null;

  function setCurrent(id) {
    if (id === current) return;
    current = id;
    for (const [key, link] of links) {
      if (key === id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        setCurrent(visible[0].target.id);
      }
    },
    { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] },
  );

  headings.forEach((heading) => observer.observe(heading));
  setCurrent(headings[0].id);
}
