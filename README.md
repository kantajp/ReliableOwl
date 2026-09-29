# SysDesign Visual

An interactive, AWS-docs-style learning app for system design. Scroll through
written explanations while animated SVG diagrams bring each concept to life.
Ships with two topics — **URL Shortener** and **Rate Limiter** — and supports
light/dark themes and Japanese/English.

## Features

- **Three-column docs layout** — left topic nav, center content, right "on this page" TOC
- **Animated diagrams** — request flows, Base62 key generation, cache hit/miss, and an interactive Token Bucket you can drain and refill
- **Scroll-spy navigation** — the active section is highlighted as you scroll (via `IntersectionObserver`), and nav clicks smooth-scroll
- **Light / dark theme** — persisted to `localStorage`, defaults to the OS setting
- **i18n (JA / EN)** — content and UI (including in-diagram text) switch languages; persisted to `localStorage`, defaults to the browser language
- **Data-driven content** — add topics, sections, and diagrams by editing data, no layout code required

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Animation | Framer Motion |
| Diagrams | Hand-authored SVG |
| Styling | Plain CSS with custom properties (design tokens) |

## Getting started

Requires Node.js 18+ (developed on Node 22).

```bash
npm install     # install dependencies
npm run dev     # start the dev server at http://localhost:5173
npm run build   # type-check (tsc -b) + production build to dist/
npm run preview # preview the production build locally
```

> **Note on the npm registry**
> This project pins the public npm registry via a local `.npmrc`
> (`registry=https://registry.npmjs.org/`) so `npm install` works regardless of
> any global registry configuration.

## Project structure

```
src/
  main.tsx                  # entry; wraps <App/> in <LangProvider/>
  App.tsx                   # 3-column layout + scroll-spy (IntersectionObserver)
  theme.css                 # design tokens (colors, spacing) + light/dark themes
  app.css                   # component styles (layout, sidebar, diagrams, toggles)
  i18n.tsx                  # Lang context, localized-string helper t(), UI dictionary
  useTheme.ts               # theme state hook (localStorage + OS preference)
  data/
    content.ts              # all content: topics -> sections -> blocks (the data model)
  components/
    Sidebar.tsx             # left nav: collapsible topics + theme/lang toggles
    Content.tsx             # renders sections and blocks (prose, list, note, code, diagram)
    OnThisPage.tsx          # right-hand table of contents
    ThemeToggle.tsx         # dark/light switch
    LangToggle.tsx          # globe button that toggles JA/EN
  diagrams/
    index.tsx               # DiagramId -> component registry
    primitives.tsx          # shared SVG parts: NodeBox, Edge, Packet, DiagramFrame, icons
    UrlDiagrams.tsx         # URL Shortener diagrams
    RateLimiterDiagrams.tsx # Rate Limiter diagrams
```

## How content works

Content is a plain data structure in `src/data/content.ts`:

```
Topic
  id, title, tagline
  sections: Section[]
    id, title
    blocks: Block[]
```

A `Block` is one of:

| Type | Purpose |
| --- | --- |
| `p` | A paragraph. Supports inline `` `code` `` and `**bold**`. |
| `list` | A bulleted list. |
| `note` | A callout with tone `info` \| `tip` \| `warn`. |
| `code` | A code block with an optional label. |
| `diagram` | Renders an animated diagram by its `DiagramId`. |

All user-facing text is a `LocalizedString` — a `{ ja, en }` pair. Rendering
resolves it via `t(str, lang)`, so every string is bilingual by construction.

### Add a new section

Add a `Section` to a topic's `sections` array in `content.ts`. Give it a unique
`id` (used as the scroll anchor and nav key), a bilingual `title`, and blocks.

### Add a new topic

Append a `Topic` to the `topics` array. It automatically appears in the left
nav, the right TOC, and the scroll-spy — no other wiring needed.

## How diagrams work

Diagrams are React components built from the SVG primitives in
`diagrams/primitives.tsx` (`NodeBox`, `Edge`, `Packet`, `DiagramFrame`).
`DiagramFrame` provides the framed stage, an optional replay button, and a
caption. Colors are pulled from CSS variables, so diagrams follow the active
theme automatically.

### Add a new diagram

1. Write a component (e.g. in `UrlDiagrams.tsx` or a new file under `diagrams/`).
2. Add its id to the `DiagramId` union in `data/content.ts`.
3. Register it in the `diagramRegistry` map in `diagrams/index.tsx`.
4. Reference it from a section with a `{ type: 'diagram', id: '<your-id>' }` block.

Keep in-diagram text bilingual by branching on `lang` from `useLang()`.

## Theming and i18n

- **Theme:** `useTheme()` sets `data-theme="light|dark"` on `<html>`. Add or
  tweak colors in `theme.css` under `:root` (dark) and `:root[data-theme='light']`.
- **Language:** `useLang()` (from `i18n.tsx`) exposes `lang`, `setLang`, and
  `toggle`. UI strings live in the `ui` dictionary in `i18n.tsx`; content strings
  live in `content.ts`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |

---

Built by Kanta Nakamura.
