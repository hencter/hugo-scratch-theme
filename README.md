# Hugo Scratch Theme

A batteries-included example Hugo theme: semantic HTML, a complete SEO head, bilingual
navigation, client-side search, flash-free light/dark themes, a shortcode library, seven render
hooks, and a CSS/JS pipeline built from Hugo Pipes plus Hugo's **official Tailwind CSS v4
integration**.

It is the theme behind <https://hencter.github.io/hugo-scratch/>, and it is deliberately a
*teaching* theme: every non-obvious decision is explained in a comment next to the code, and
[`AGENTS.md`](https://github.com/hencter/hugo-scratch/blob/main/AGENTS.md) in the demo site
records the traps that cost real debugging cycles.

- Licence: MIT
- Hugo floor: **0.146.0** (`[module.hugoVersion]` below)
- Editions: built with the **standard** and the extended binary; the theme itself needs no
  Sass/SCSS/PostCSS
- Demo repository: <https://github.com/hencter/hugo-scratch>

---

## Install

As a submodule (what the demo site does):

```bash
git submodule add https://github.com/hencter/hugo-scratch-theme.git themes/hugo-scratch-theme
```

Or with Hugo Modules:

```bash
hugo mod init github.com/<you>/<your-site>
hugo mod get github.com/hencter/hugo-scratch-theme
```

Then, in your site config: `theme = ['hugo-scratch-theme']`.

If you use the submodule route, remember `git clone --recurse-submodules`, or
`git submodule update --init --recursive` afterwards. Without the theme, Hugo reports
`found no layout file for "html" for kind "page"` for every page.

---

## Required site setup

A theme configuration may only set `params`, `menu`, `outputformats` and `mediatypes`. It
therefore **cannot** declare the things this pipeline needs, so the site has to. Copy these
blocks verbatim:

### 1. The Tailwind CLI

```bash
npm install --save-dev tailwindcss @tailwindcss/cli
```

`css.TailwindCSS` runs the Tailwind CLI. Since Hugo 0.161 the standalone binary is no longer
supported, so the packages must be installed with npm at the **site root**. A site that has not
run `npm ci` fails with a missing `tailwindcss` executable, and the message names no page.

### 2. Build statistics and the mounts

Tailwind generates only the utilities that actually appeared in the rendered output, and
`hugo_stats.json` is how it knows. The last mount exposes that file to the asset pipeline under
a `notwatching` prefix so the file watcher does not rebuild in a loop when it is written.

```toml
[build]
  [build.buildStats]
    enable = true
  [[build.cachebusters]]
    source = 'assets/notwatching/hugo_stats\.json'
    target = 'css'
  [[build.cachebusters]]
    source = '(postcss|tailwind)\.config\.(js|mjs|cjs)'
    target = 'css'

[module]
  [[module.mounts]]
    source = 'content'
    target = 'content'
  [[module.mounts]]
    source = 'static'
    target = 'static'
  [[module.mounts]]
    source = 'assets'
    target = 'assets'
  [[module.mounts]]
    source = 'layouts'
    target = 'layouts'
  [[module.mounts]]
    source = 'i18n'
    target = 'i18n'
  [[module.mounts]]
    source = 'data'
    target = 'data'
  [[module.mounts]]
    source = 'archetypes'
    target = 'archetypes'
  [[module.mounts]]
    disableWatch = true
    source = 'hugo_stats.json'
    target = 'assets/notwatching/hugo_stats.json'
```

Declaring any mount replaces Hugo's defaults, which is why all of them are listed. Drop the
`layouts` mount and the theme's templates stop being found.

### 3. Let Hugo run the CLI

```toml
[security]
  [security.exec]
    allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^tailwindcss$']
```

Setting this key **replaces** the default list rather than extending it, so the defaults are
repeated here. Run `hugo config` to print the current defaults.

### 4. Switch on the output formats

The theme declares the formats; only the site can decide which pages emit them:

```toml
[outputs]
  home = ['html', 'rss', 'md', 'llms', 'search', 'pages']
  section = ['html', 'rss', 'md']
  taxonomy = ['html', 'rss', 'md']
  term = ['html', 'rss', 'md']
  page = ['html', 'md']
```

### 5. Set a real baseURL

`baseURL` must be the production origin. Canonical URLs, Open Graph tags, the sitemap and the
`robots.txt` `Sitemap:` line are all absolute; a placeholder origin leaks into every one of
them. A GitHub Pages project site keeps its subpath here.

---

## The CSS pipeline, in one picture

```
assets/css/design-system.css   +   site assets/css/custom.css
        │  resources.Concat
        │  css.Build                     (inlines every @import, via the asset tree)
        │  wrapped in @layer components { … }
        ▼
assets/css/tailwind.css
        │  css.TailwindCSS               (official integration: scans sources,
        │                                 expands tailwindcss/theme.css and
        ▼                                 tailwindcss/utilities.css)
@layer theme, components, utilities;     ← prepended, so the order is fixed
        │  resources.Concat → minify → fingerprint "sha384"
        ▼
   one <link> with an integrity attribute
```

Two compiled parts rather than one entry file, because the two resolvers disagree about
imports: Tailwind resolves relative to **the directory Hugo runs in** (so it understands a bare
specifier such as `tailwindcss/theme.css`), while Hugo's own inliner resolves against the asset
tree (so it understands `tokens.css`, and can find a file your site supplies). Mixing both kinds
in one file fails with `Can't resolve 'tokens.css' in '<project root>'` — which is also how the
resolution base was identified.

The stylesheet is built from a **deferred** template, because `hugo_stats.json` only exists once
every page has been rendered.

Tailwind's `preflight` is deliberately not imported: the theme ships its own reset
(`base.css`), and preflight would silently strip list markers, button styling and form styling
the design relies on. Adding it back is one line in `assets/css/tailwind.css`.

---

## What the theme provides

**Layouts** — `baseof.html` defines the document contract; page kinds supply only `main`.

```
layouts/
├── baseof.html                 blocks: main, head-extra, scripts
├── home.html  page.html  section.html  taxonomy.html  term.html  404.html
├── list.md  page.md            Markdown output formats
├── home.llms.txt  home.search.json  home.pages.json
├── rss.xml  sitemap.xml  robots.txt
├── _partials/
│   ├── head.html  head/{meta,alternates,opengraph,schema,css,js,verification,theme-init}.html
│   ├── header.html  menu.html  sidebar.html  toc.html  breadcrumbs.html  footer.html
│   ├── page-meta.html  page-nav.html  pagination.html  page-list.html  card.html
│   ├── terms.html  facts.html  banner.html  search.html  theme-toggle.html
│   ├── lang-switcher.html  analytics.html  comments.html  scripts.html  icon.html
│   ├── layout/flags.html       returns {sidebar, toc}
│   ├── resolve-image.html      returns {url, width, height, resource}
│   └── shortcodes/callout.html
├── _shortcodes/                note tip warning danger details tabs tab steps step
│                               columns column badge kbd version filetree mermaid
│                               video youtube figure toc changelog
└── _markup/                    render-heading image link codeblock blockquote table passthrough
```

**Params** (all optional; these are the theme's defaults, a site's values win):

| Key | Default | Meaning |
| --- | --- | --- |
| `params.description` | — | site description, used as the meta/OG fallback |
| `params.titleSeparator` | `·` | between page title and site title |
| `params.dateFormat` | `:date_long` | Go layout for visible dates; set it per language, because the localised token falls back to English for some locales |
| `params.images` | `['images/og-default.png']` | social-card fallback, resolved through `assets/` then `static/` |
| `params.ui.*` | most `true` | `stickyHeader`, `showBreadcrumbs`, `showTableOfContents`, `tocMinHeadings`, `showSidebar`, `showReadingTime`, `showWordCount`, `showDate`, `showPrevNext`, `showRelated`, `showTags`, `showSearch`, `showThemeToggle`, `showLanguageSwitcher`, `showEditLink`, `showBackToTop` |
| `params.nav.sidebarSections` | `['docs']` | which top-level sections get the in-section sidebar |
| `params.seo.organization` | — | JSON-LD publisher name |
| `params.seo.logo` | `images/logo.svg` | JSON-LD logo |
| `params.seo.xDefaultLang` | — | which language is advertised as `hreflang="x-default"` |
| `params.verification.google` / `.bing` | — | search-console meta tags; empty emits nothing |
| `params.analytics.googleAnalytics` / `.plausibleDomain` | — | production-only, opt-in |
| `params.comments.repository` | — | renders a script-free link to a new issue |
| `params.mermaid.enabled` | `false` | when off, the shortcode falls back to a highlighted code block |
| `params.editURL` | — | base URL for the "edit this page" link |
| `params.repoURL` | — | "view source" link in the footer |
| `params.home.latestCount` | `5` | posts listed on the home page |
| `params.validateInternalLinks` | `true` | fail the build on a site-relative link that resolves to nothing |

**Front matter the theme reads**: `title`, `linkTitle`, `description`, `date`, `lastmod`,
`weight`, `difficulty`, `estimatedTime`, `prerequisites`, `outcomes`, `tags`, `categories`,
`series`, `images`, `notice`, `toc`, `robots`, `noindex`, `subtitle`, `license`, `authors`,
`groupByYear` (on a section), `hidden` (hides a section from the home page cards).

**Shortcodes** — `note`, `tip`, `warning`, `danger` (standard notation, `.Inner` is
`markdownify`-ed); `details`, `badge`, `kbd`, `version`, `filetree`, `mermaid`, `video`,
`youtube`, `figure`, `toc`; `tabs`/`tab`, `steps`/`step`, `columns`/`column` (**Markdown
notation**, so headings inside them reach the table of contents).

---

## Overriding

Theme and project merge at **file level**: a project file at the same path replaces the theme's.
So keep project additions in differently-named files — that is why the stylesheet override is
`assets/css/custom.css` and not `assets/css/design-system.css`.

Copy any theme file into your project's `layouts/`, `assets/` or `static/` at the same relative
path to replace it, or add a new partial/shortcode of a new name to add behaviour. Layouts
support `type` and `layout` front matter, so a single section can use its own page template:
`layouts/<type>/page.html`.

---

## Regenerating committed assets

Both are generated and committed, so this is optional:

```bash
# code colours, following the light/dark switch through Hugo's --modeSelector
hugo gen chromastyles --style=github      --mode light --modeSelector --classLight light --classDark dark > assets/css/chroma-light.css
hugo gen chromastyles --style=github-dark --mode dark  --modeSelector --classLight light --classDark dark > assets/css/chroma-dark.css

# social card and touch icons (needs Pillow)
python scripts/generate-assets.py
```

`scripts/generate-assets.py` exists so the raster brand images are reproducible rather than
mystery binaries. Nothing in the build pipeline needs Python.

---

## Licence

MIT — see [LICENSE](LICENSE).
