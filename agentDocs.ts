// Build-time plugin that makes the site readable without JavaScript.
//
// The app is a client-rendered SPA with hash routes (#topic), so plain HTTP
// fetchers (AI agents, link previews, simple crawlers) only ever receive an
// empty <div id="root">. This plugin generates, from the same content data:
//   - /articles/<id>.md and /articles/<id>.en.md  — each article as Markdown
//   - /llms.txt                                    — an index for LLM agents
//   - /sitemap.xml                                 — home + all Markdown pages
//   - a static article list inside #root in index.html (React replaces it on
//     mount; it only becomes visible if JS hasn't rendered after a moment)
import type { Plugin } from 'vite';
import { categories, topics, type Block, type Topic } from './src/data/content';

export const SITE = 'https://sysdesign-visual.vercel.app';

type Lang = 'ja' | 'en';
type L = { ja: string; en: string };
const tx = (s: L, lang: Lang) => s[lang];

const LABELS = {
  published: { ja: '公開', en: 'Published' },
  updated: { ja: '更新', en: 'Updated' },
  category: { ja: 'カテゴリ', en: 'Category' },
  interactive: { ja: 'このページのインタラクティブ版', en: 'Interactive version of this page' },
  diagram: {
    ja: '（インタラクティブな図。サイト上で表示されます）',
    en: '(Interactive diagram, shown on the site)',
  },
  notes: {
    tip: { ja: 'ヒント', en: 'Tip' },
    warn: { ja: '注意', en: 'Caution' },
    info: { ja: 'メモ', en: 'Note' },
  },
} as const;

const mdPath = (id: string, lang: Lang) => `articles/${id}${lang === 'en' ? '.en' : ''}.md`;
const mdUrl = (id: string, lang: Lang) => `${SITE}/${mdPath(id, lang)}`;
const appUrl = (id: string) => `${SITE}/#${id}`;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// In-app links are "#topic" or "#topic/section"; make them absolute so they
// work outside the app.
const absolutizeLinks = (s: string) => s.replace(/\]\(#([\w-]+)(?:\/[\w-]+)?\)/g, (_m, id) => `](${appUrl(id)})`);

function blockToMd(b: Block, lang: Lang): string {
  switch (b.type) {
    case 'p':
      return absolutizeLinks(tx(b.text, lang));
    case 'list':
      return b.items.map((it) => `- ${absolutizeLinks(tx(it, lang))}`).join('\n');
    case 'note':
      return `> **${tx(LABELS.notes[b.tone], lang)}**: ${absolutizeLinks(tx(b.text, lang))}`;
    case 'code': {
      const label = b.label ? `*${tx(b.label, lang)}*\n\n` : '';
      return `${label}\`\`\`\n${b.code}\n\`\`\``;
    }
    case 'diagram':
      return `*${tx(LABELS.diagram, lang)}*`;
    case 'details':
      return [`**${tx(b.summary, lang)}**`, ...b.blocks.map((c) => blockToMd(c, lang))].join('\n\n');
    default:
      return '';
  }
}

function topicToMd(topic: Topic, lang: Lang): string {
  const cat = categories.find((c) => c.id === topic.category);
  const meta = [
    `${tx(LABELS.category, lang)}: ${cat ? tx(cat.label, lang) : topic.category}`,
    `${tx(LABELS.published, lang)}: ${topic.publishedAt}`,
    `${tx(LABELS.updated, lang)}: ${topic.updatedAt}`,
    `${tx(LABELS.interactive, lang)}: ${appUrl(topic.id)}`,
  ];
  const sections = topic.sections.map((s, i) => {
    const body = s.blocks.map((b) => blockToMd(b, lang)).filter(Boolean).join('\n\n');
    return `## ${String(i + 1).padStart(2, '0')} ${tx(s.title, lang)}\n\n${body}`;
  });
  return [`# ${tx(topic.title, lang)}`, `> ${tx(topic.tagline, lang)}`, meta.join('  \n'), ...sections].join('\n\n') + '\n';
}

function llmsTxt(): string {
  const parts = [
    '# Reliable Owl',
    '> A learning notebook on system design, SRE and security, written by Kanta Nakamura. Every article is available as Markdown in Japanese (default) and English (.en.md). The interactive site renders with JavaScript; use these Markdown files to read the content.',
    `Site: ${SITE}/`,
  ];
  for (const cat of categories) {
    const list = topics.filter((tp) => tp.category === cat.id);
    if (list.length === 0) continue;
    parts.push(
      `## ${cat.label.en} / ${cat.label.ja}\n\n` +
        list
          .map(
            (tp) =>
              `- [${tp.title.ja}](${mdUrl(tp.id, 'ja')}): ${tp.tagline.ja}\n` +
              `- [${tp.title.en}](${mdUrl(tp.id, 'en')}): ${tp.tagline.en}`,
          )
          .join('\n'),
    );
  }
  return parts.join('\n\n') + '\n';
}

function sitemapXml(): string {
  const urls = [
    { loc: `${SITE}/`, lastmod: topics.map((tp) => tp.updatedAt).sort().at(-1) },
    { loc: `${SITE}/llms.txt` },
    ...topics.flatMap((tp) => (['ja', 'en'] as Lang[]).map((lang) => ({ loc: mdUrl(tp.id, lang), lastmod: tp.updatedAt }))),
  ];
  const body = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// Static, JS-free article index placed inside #root.
function staticFallback(): string {
  const cats = categories
    .map((cat) => {
      const list = topics.filter((tp) => tp.category === cat.id);
      if (list.length === 0) return '';
      const items = list
        .map(
          (tp) =>
            `<li><a href="/#${tp.id}">${esc(tp.title.ja)}</a> — ${esc(tp.tagline.ja)} ` +
            `(<a href="/${mdPath(tp.id, 'ja')}">Markdown</a> · <a href="/${mdPath(tp.id, 'en')}">English</a>)</li>`,
        )
        .join('');
      return `<h2>${esc(cat.label.ja)}</h2><ul>${items}</ul>`;
    })
    .join('');
  return (
    `<div class="static-fallback">` +
    `<h1>Reliable Owl</h1>` +
    `<p>システム設計・SRE・セキュリティを、文章と動く図で学ぶ学習ノート。各記事は Markdown でも読めます（<a href="/llms.txt">llms.txt</a>）。</p>` +
    cats +
    `</div>`
  );
}

export function agentDocs(): Plugin {
  return {
    name: 'agent-docs',
    transformIndexHtml(html) {
      return html
        .replace('<div id="root"></div>', `<div id="root">${staticFallback()}</div>`)
        .replace(
          '</head>',
          `  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable index (llms.txt)" />\n` +
            // Hide the static index unless JS fails to render within 3s (no flash on normal loads).
            `  <style>.static-fallback{opacity:0;animation:sf-show 0s 3s forwards;max-width:760px;margin:0 auto;padding:48px 20px;font-family:system-ui,sans-serif;line-height:1.7}@keyframes sf-show{to{opacity:1}}</style>\n</head>`,
        );
    },
    generateBundle() {
      const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source });
      for (const tp of topics) {
        emit(mdPath(tp.id, 'ja'), topicToMd(tp, 'ja'));
        emit(mdPath(tp.id, 'en'), topicToMd(tp, 'en'));
      }
      emit('llms.txt', llmsTxt());
      emit('sitemap.xml', sitemapXml());
    },
  };
}
