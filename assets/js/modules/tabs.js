/**
 * Tabs (the {{< tabs >}} / {{< tab >}} shortcode pair).
 *
 * Progressive enhancement: the markup already contains every panel, so the
 * content is in the HTML for readers and crawlers. The first panel starts
 * visible; this module adds the ARIA wiring and keyboard navigation.
 */

function activate(list, tabs, panels, index, focus) {
  tabs.forEach((tab, i) => {
    const selected = i === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    panels[i].hidden = !selected;
  });
  if (focus) tabs[index].focus();
}

export function initTabs() {
  for (const group of document.querySelectorAll('[data-tabs]')) {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = [...group.querySelectorAll('[role="tabpanel"]')];
    if (tabs.length !== panels.length || !tabs.length) continue;

    activate(group, tabs, panels, 0, false);

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(group, tabs, panels, index, false));
      tab.addEventListener('keydown', (event) => {
        const last = tabs.length - 1;
        let next = null;
        if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
        if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = last;
        if (next === null) return;
        event.preventDefault();
        activate(group, tabs, panels, next, true);
      });
    });
  }
}
