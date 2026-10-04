/**
 * Client-side search over the JSON index Hugo writes at /search.json.
 *
 * The index is fetched only when the reader first opens the dialog, so it never
 * competes with the page for bandwidth. Matching is deliberately simple and
 * language-neutral: case-folded substring matching, which is the only thing that
 * works for Chinese, Japanese and Korean where word splitting does not apply.
 */

const state = {
  index: null,
  loading: null,
};

function normalise(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/\s+/g, '');
}

function fieldScore(field, needle) {
  if (!field) return 0;
  const haystack = normalise(field);
  if (!haystack.includes(needle)) return 0;
  return haystack === needle ? 3 : haystack.startsWith(needle) ? 2 : 1;
}

function scoreEntry(entry, needles) {
  let total = 0;
  for (const needle of needles) {
    const title = fieldScore(entry.title, needle) * 12;
    const description = fieldScore(entry.description, needle) * 5;
    const tags = (entry.tags || []).reduce(
      (sum, tag) => sum + fieldScore(tag, needle) * 6,
      0,
    );
    const body = fieldScore(entry.body, needle) * 2;
    const section = fieldScore(entry.section, needle) * 3;
    const hit = title + description + tags + body + section;
    if (hit === 0) return 0; // every token must match somewhere
    total += hit;
  }
  return total;
}

async function load(params) {
  if (state.index) return state.index;
  if (state.loading) return state.loading;

  state.loading = fetch(params.searchIndex, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`search index: HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      state.index = Array.isArray(data) ? data : [];
      return state.index;
    })
    .catch((error) => {
      console.error('[search]', error);
      state.index = [];
      return state.index;
    })
    .finally(() => {
      state.loading = null;
    });

  return state.loading;
}

function renderResults(list, params, container, status) {
  container.replaceChildren();

  if (!list.length) {
    const empty = document.createElement('li');
    empty.className = 'search-results__empty';
    empty.textContent = params.i18n.searchNoResults;
    container.append(empty);
    status.textContent = params.i18n.searchNoResults;
    return;
  }

  status.textContent = params.i18n.searchResults.replace('%d', String(list.length));

  const fragment = document.createDocumentFragment();
  for (const entry of list) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.className = 'search-results__link';
    link.href = entry.url;

    const title = document.createElement('span');
    title.className = 'search-results__title';
    title.textContent = entry.title;

    const meta = document.createElement('span');
    meta.className = 'search-results__meta';
    meta.textContent = [entry.section, entry.description].filter(Boolean).join(' · ');

    link.append(title, meta);
    item.append(link);
    fragment.append(item);
  }
  container.append(fragment);
}

export function initSearch(params) {
  const dialog = document.querySelector('dialog[data-search-dialog]');
  if (!dialog || !params || !params.searchIndex) return;

  const input = dialog.querySelector('[data-search-input]');
  const results = dialog.querySelector('[data-search-results]');
  const status = dialog.querySelector('[data-search-status]');

  let timer = 0;

  async function run(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      results.replaceChildren();
      status.textContent = '';
      return;
    }
    status.textContent = params.i18n.searchLoading;
    const index = await load(params);
    const needles = trimmed.split(/\s+/).map(normalise).filter(Boolean);
    const scored = [];
    for (const entry of index) {
      const score = scoreEntry(entry, needles);
      if (score > 0) scored.push({ score, entry });
    }
    scored.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
    renderResults(scored.slice(0, 20).map((row) => row.entry), params, results, status);
  }

  function open() {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    input.value = '';
    results.replaceChildren();
    status.textContent = params.i18n.searchHint;
    input.focus();
    load(params);
  }

  function close() {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  for (const trigger of document.querySelectorAll('[data-search-open]')) {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  }

  for (const closer of dialog.querySelectorAll('[data-search-close]')) {
    closer.addEventListener('click', close);
  }

  input.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => run(input.value), 120);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = results.querySelector('a');
      if (first) window.location.assign(first.href);
    }
  });

  document.addEventListener('keydown', (event) => {
    const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (isShortcut) {
      event.preventDefault();
      if (dialog.open) close();
      else open();
    }
  });
}
