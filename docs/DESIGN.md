# Design reference

Reliable Owl uses a quiet, editorial design: **typography and whitespace carry the page, thin rules separate things, and decoration is zero.** This document describes the system so new pages, articles, and diagrams stay consistent.

## Principles

1. **Remove before adding.** When something looks childish it is almost always decoration (gradients, glows, emoji, motion), not a missing feature.
2. **Hierarchy from size and weight, never effects.** Large text gets tighter letter-spacing.
3. **One accent color**, used only for interactive and active states: links, the current nav item, row hover, buttons.
4. **Semantic colors only where they mean something**: diagram states and note labels.
5. **Separate with lines and space**, not boxes, fills, or shadows.
6. **Left-aligned, editorial layouts** (a magazine index or a technical book), not centered marketing heroes.

The one deliberate exception is the owl logo tile, which keeps its blue → purple gradient (`linear-gradient(135deg, var(--accent-strong), var(--purple))`).

## Colors

All colors are CSS custom properties in [`src/theme.css`](../src/theme.css): dark in `:root`, light in `:root[data-theme='light']`. Components and SVG diagrams must use variables, never hardcoded colors.

| Token | Dark | Light | Use |
| --- | --- | --- | --- |
| `--bg` | `#0b0e14` | `#f6f8fc` | Page background |
| `--bg-panel` | `#0f141e` | `#fbfcfe` | Diagram panels |
| `--surface-hover` | `#1b2333` | `#eef2f9` | Hover fills, inline code background |
| `--border` | `#202839` | `#e2e8f2` | Row dividers, frames |
| `--border-strong` | `#2c3648` | `#cdd6e5` | Rule under section heads |
| `--text` | `#e6e9ef` | `#1a2232` | Headings and titles |
| `--text-muted` | `#9aa4b8` | `#4a5568` | Body text and descriptions |
| `--text-dim` | `#6b7488` | `#8a93a6` | Labels, dates, counts, numbers |
| `--accent` | `#7c9cff` | `#4d6dff` | Links, active and hover states |

Semantic tones: `--green` (tip / success), `--amber` (caution), `--red` (failure), `--cyan` and `--purple` (secondary roles in diagrams, e.g. replicas and replication).

## Typography

Fonts: `--font-sans` (Inter + Noto Sans JP) for everything; `--font-mono` only for code and diagram labels.

| Element | Size / weight / letter-spacing | Color |
| --- | --- | --- |
| Home title | `clamp(44px, 6vw, 64px)` / 700 / -0.035em | `--text` |
| Home tagline | `clamp(18px, 2vw, 21px)` / 400 | `--text-muted` |
| Home section head | 13px / 600 / 0.02em | `--text` (count in `--text-dim`) |
| Home row title | 20px / 600 / -0.015em | `--text`, hover `--accent` |
| Article category label | 13px / 500 | `--text-dim` |
| Article title | 40px / 700 / -0.03em | `--text` (solid, no gradient) |
| Article tagline | 18px / 400 | `--text-muted` |
| Section title | 24px / 700 / -0.02em | `--text` |
| Section number | 14px / 500 | `--text-dim` |
| Body text | 16px, line-height 1.75 | `--text-muted` |
| Sidebar category / topic | 12.5px / 600 · 13px / 400 | `--text` · `--text-muted` |

Rules:

- No uppercase labels with wide letter-spacing.
- Numbers and dates use `font-variant-numeric: tabular-nums`.
- Dates are formatted by [`src/formatDate.ts`](../src/formatDate.ts) as `Sep 29, 2026`.

## Layout

### Home

```
[owl]                               ← gradient logo tile
Reliable Owl                        ← large, left-aligned
One-line tagline

System Design  4
────────────────────────────────────────────────  (--border-strong)
Topic title                              Sep 29, 2026  →
Short description
- - - - - - - - - - - - - - - - - - - - - - - - -  (--border)
Topic title                              Sep 12, 2026  →
Short description
```

There is no CTA button, no background animation, and no cards: the rows themselves are the navigation.

### Article

```
System Design                       ← category label (dim)
Article title                       ← 40px, solid
Tagline
Published Sep 1, 2026 · Updated Sep 29, 2026
────────────────────────────────────────────────

01  Section title
    Body text, notes, code, diagrams…

02  Section title
    …

Next
────────────────────────────────────────────────
System Design
Next article title                             →
```

Sections are numbered because they build on each other. **Articles are not numbered** anywhere: they are independent, and numbers would imply a reading order and shift whenever a new article is inserted.

## Components

| Component | Pattern |
| --- | --- |
| Index row (home, "Next") | Full-width button; title over description; date and `→` on the right; hairline divider. Hover turns the title and arrow `--accent` and nudges the arrow 4px. On mobile the date moves under the description and the arrow is hidden. |
| Note | No box, no emoji. A 2px left rule plus a small label: Tip (green), Caution (amber), Note (accent). |
| Diagram frame | `1px var(--border)` on `var(--bg-panel)`. No gradient wash, no shadow. |
| Inline code | `--text` on `var(--surface-hover)`, no border. |
| List bullets | 5px round dot in `--text-dim`. |
| Buttons | Accent border with a soft fill; hover only deepens the fill (no glow ring). |
| Sidebar | Flat background with a right hairline; categories separated by space; active topic and section in `--accent`. |

## Diagrams

- Hand-authored SVG components in [`src/diagrams/`](../src/diagrams/), registered in `src/diagrams/index.tsx` and the `DiagramId` union in `src/data/content.ts`.
- Colors only through CSS variables, with semantic tones for meaning (leader = accent, replica = cyan, failure = red, success = green).
- Text never overlaps shapes or other labels; check both the Japanese and English strings.
- Respect `prefers-reduced-motion`.

## Writing

- Every string has both `ja` and `en`.
- In bullet lists, bold the term before the colon (`**Term**: explanation`). Use bold sparingly elsewhere.
- Use generic example services ("a feed app", "an object store") or well-known ones like YouTube.

## Avoid

These were tried and removed:

- Gradient or shimmering text, floating logos, glows, colored drop shadows
- Animated backgrounds (fluid, aurora, grid, pointer spotlight)
- Emoji and colored filled boxes for notes
- Uppercase, letter-spaced labels
- A centered hero with a CTA button, and carousel cards with spotlight borders
- Full re-skins (an "Apple-style" rewrite, a fully monochrome palette): change things incrementally instead
