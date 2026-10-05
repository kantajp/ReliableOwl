// Build-time plugin that makes every page readable without JavaScript.
//
// The app is a client-rendered SPA with path routes (see src/router.ts). Plain
// HTTP fetchers (search engines, AI agents, link previews) would otherwise get
// an empty <div id="root">. From the same content data, this plugin writes:
//   - <page>.html for every route (/, /about, /notes, /notes/<id>, /<topic>)
//     with its own <title>, description, canonical, Open Graph tags and the
//     full text inside #root. React replaces that text when it mounts; it is
//     hidden for the first 3s so normal visitors never see it flash.
//     Vercel serves /<page> from <page>.html via `cleanUrls` (vercel.json).
//   - /articles/<id>(.en).md and /notes/<id>(.en).md — Markdown copies
//   - /llms.txt — an index for LLM agents
//   - /sitemap.xml — every HTML page with its last-updated date
// Draft notes are never published.
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { categories, topics, type Block, type Topic } from './src/data/content';
import { notes as allNotes, type Note } from './src/data/notes';
import { formatDate } from './src/formatDate';

export const SITE = 'https://sysdesign-visual.vercel.app';

const notes = allNotes.filter((n) => !n.draft).sort((a, b) => b.date.localeCompare(a.date));

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

// ---------- URLs ----------
const topicPath = (id: string) => `/${id}`;
const notePath = (id: string) => `/notes/${id}`;
const mdPath = (id: string, lang: Lang) => `articles/${id}${lang === 'en' ? '.en' : ''}.md`;
const noteMdPath = (id: string, lang: Lang) => `notes/${id}${lang === 'en' ? '.en' : ''}.md`;
const abs = (p: string) => `${SITE}${p.startsWith('/') ? p : `/${p}`}`;

// Content links are written "#topic" or "#topic/section".
const contentHref = (href: string) => {
  if (!href.startsWith('#')) return href;
  const [topic, section] = href.slice(1).split('/');
  return section ? `/${topic}#${section}` : `/${topic}`;
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// =====================================================================
// Markdown
// =====================================================================
const mdLinks = (s: string) =>
  s.replace(/\]\((#[\w/-]+)\)/g, (_m, href: string) => `](${abs(contentHref(href))})`);

function blockToMd(b: Block, lang: Lang): string {
  switch (b.type) {
    case 'p':
      return mdLinks(tx(b.text, lang));
    case 'h':
      return `### ${tx(b.text, lang)}`;
    case 'list':
      return b.items.map((it) => `- ${mdLinks(tx(it, lang))}`).join('\n');
    case 'note':
      return `> **${tx(LABELS.notes[b.tone], lang)}**: ${mdLinks(tx(b.text, lang))}`;
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
    `${tx(LABELS.interactive, lang)}: ${abs(topicPath(topic.id))}`,
  ];
  const sections = topic.sections.map((s, i) => {
    const body = s.blocks.map((b) => blockToMd(b, lang)).filter(Boolean).join('\n\n');
    return `## ${String(i + 1).padStart(2, '0')} ${tx(s.title, lang)}\n\n${body}`;
  });
  return [`# ${tx(topic.title, lang)}`, `> ${tx(topic.tagline, lang)}`, meta.join('  \n'), ...sections].join('\n\n') + '\n';
}

function noteToMd(note: Note, lang: Lang): string {
  const body = note.blocks.map((b) => blockToMd(b, lang)).filter(Boolean).join('\n\n');
  const meta = `${note.date}  \n${tx(LABELS.interactive, lang)}: ${abs(notePath(note.id))}`;
  return [`# ${tx(note.title, lang)}`, `> ${tx(note.summary, lang)}`, meta, body].join('\n\n') + '\n';
}

function llmsTxt(): string {
  const parts = [
    '# Reliable Owl',
    '> A learning notebook on system design, SRE and security, written by Kanta Nakamura. Every page is plain HTML at its URL; every article and note is also available as Markdown in Japanese (default) and English (.en.md).',
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
            `- [${tp.title.ja}](${abs(mdPath(tp.id, 'ja'))}): ${tp.tagline.ja}\n` +
            `- [${tp.title.en}](${abs(mdPath(tp.id, 'en'))}): ${tp.tagline.en}`,
        )
        .join('\n'),
    );
  }
  if (notes.length > 0) {
    parts.push(
      '## Notes / ノート\n\n' +
      notes
        .map(
          (n) =>
            `- [${n.title.ja}](${abs(noteMdPath(n.id, 'ja'))}): ${n.summary.ja} (${n.date})\n` +
            `- [${n.title.en}](${abs(noteMdPath(n.id, 'en'))}): ${n.summary.en} (${n.date})`,
        )
        .join('\n'),
    );
  }
  return parts.join('\n\n') + '\n';
}

function sitemapXml(): string {
  const latest = [...topics.map((tp) => tp.updatedAt), ...notes.map((n) => n.date)].sort().at(-1);
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: `${SITE}/`, lastmod: latest },
    { loc: abs('/about') },
    ...(notes.length > 0 ? [{ loc: abs('/notes'), lastmod: notes[0].date }] : []),
    ...topics.map((tp) => ({ loc: abs(topicPath(tp.id)), lastmod: tp.updatedAt })),
    ...notes.map((n) => ({ loc: abs(notePath(n.id)), lastmod: n.date })),
  ];
  const body = urls
    .map((u) => `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

// =====================================================================
// Static HTML (inside #root; Japanese, the site's default language)
// =====================================================================
// Same inline syntax as the app: `code`, **bold**, [label](url).
function inlineHtml(s: string): string {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, href: string) => `<a href="${contentHref(href)}">${label}</a>`);
}

function blockToHtml(b: Block): string {
  switch (b.type) {
    case 'p':
      return `<p>${inlineHtml(b.text.ja)}</p>`;
    case 'h':
      return `<h3>${esc(b.text.ja)}</h3>`;
    case 'list':
      return `<ul>${b.items.map((it) => `<li>${inlineHtml(it.ja)}</li>`).join('')}</ul>`;
    case 'note':
      return `<aside><strong>${LABELS.notes[b.tone].ja}</strong>: ${inlineHtml(b.text.ja)}</aside>`;
    case 'code':
      return `${b.label ? `<p><em>${esc(b.label.ja)}</em></p>` : ''}<pre><code>${esc(b.code)}</code></pre>`;
    case 'diagram':
      return `<p><em>${LABELS.diagram.ja}</em></p>`;
    case 'details':
      return `<details><summary>${esc(b.summary.ja)}</summary>${b.blocks.map(blockToHtml).join('')}</details>`;
    default:
      return '';
  }
}

const siteNav = () =>
  `<nav><p><a href="/">Reliable Owl</a> · <a href="/notes">Notes</a> · <a href="/about">About</a> · <a href="/llms.txt">llms.txt</a></p></nav>`;

function topicIndexHtml(excludeId?: string): string {
  return categories
    .map((cat) => {
      const list = topics.filter((tp) => tp.category === cat.id && tp.id !== excludeId);
      if (list.length === 0) return '';
      const items = list
        .map((tp) => `<li><a href="${topicPath(tp.id)}">${esc(tp.title.ja)}</a> — ${esc(tp.tagline.ja)}</li>`)
        .join('');
      return `<h2>${esc(cat.label.ja)}</h2><ul>${items}</ul>`;
    })
    .join('');
}

function homeBody(): string {
  const noteList =
    notes.length > 0
      ? `<h2>Notes</h2><ul>${notes.map((n) => `<li><a href="${notePath(n.id)}">${esc(n.title.ja)}</a> — ${esc(n.summary.ja)}</li>`).join('')}</ul>`
      : '';
  return (
    `<h1>Reliable Owl</h1>` +
    `<p>システム設計・SRE・セキュリティを、文章と動く図で学ぶ学習ノート。各記事は Markdown でも読めます（<a href="/llms.txt">llms.txt</a>）。</p>` +
    topicIndexHtml() +
    noteList +
    siteNav()
  );
}

function topicBody(topic: Topic): string {
  const cat = categories.find((c) => c.id === topic.category);
  const dates =
    `Published ${formatDate(topic.publishedAt)}` +
    (topic.updatedAt !== topic.publishedAt ? ` · Updated ${formatDate(topic.updatedAt)}` : '');
  const sections = topic.sections
    .map(
      (s, i) =>
        `<section id="${s.id}"><h2>${String(i + 1).padStart(2, '0')} ${esc(s.title.ja)}</h2>${s.blocks.map(blockToHtml).join('')}</section>`,
    )
    .join('');
  return (
    `<article><p>${esc(cat ? cat.label.ja : '')}</p><h1>${esc(topic.title.ja)}</h1>` +
    `<p>${esc(topic.tagline.ja)}</p><p>${dates}</p>${sections}</article>` +
    `<p>Markdown: <a href="/${mdPath(topic.id, 'ja')}">日本語</a> · <a href="/${mdPath(topic.id, 'en')}">English</a></p>` +
    `<h2>他の記事</h2>${topicIndexHtml(topic.id)}` +
    siteNav()
  );
}

function noteBody(note: Note): string {
  return (
    `<article><p>${formatDate(note.date)}</p><h1>${esc(note.title.ja)}</h1><p>${esc(note.summary.ja)}</p>` +
    `${note.blocks.map(blockToHtml).join('')}</article>` +
    `<p>Markdown: <a href="/${noteMdPath(note.id, 'ja')}">日本語</a> · <a href="/${noteMdPath(note.id, 'en')}">English</a></p>` +
    siteNav()
  );
}

function notesBody(): string {
  const list =
    notes.length > 0
      ? `<ul>${notes.map((n) => `<li><a href="${notePath(n.id)}">${esc(n.title.ja)}</a> — ${esc(n.summary.ja)} (${formatDate(n.date)})</li>`).join('')}</ul>`
      : '<p>まだノートはありません。</p>';
  return `<h1>Notes</h1><p>仕事や暮らしの中で考えたことを、気ままに書き残すノートです。</p>${list}${siteNav()}`;
}

const ABOUT_DESC =
  'Kanta Nakamura のプロフィール。台湾の大学でコンピュータサイエンスを学び、ヨーロッパでエンジニアとして働いたのち、日本で Site Reliability Engineer としてのキャリアを始める。';

function aboutBody(): string {
  return `<h1>Kanta Nakamura</h1><p>Site Reliability Engineer</p><p>${esc(ABOUT_DESC)}</p>${siteNav()}`;
}

// ---------- page shell ----------
interface Page {
  file: string; // relative to outDir
  url: string; // canonical path
  title: string;
  description: string;
  type: 'website' | 'article';
  body: string;
}

const ROOT_OPEN = '<div id="root">';
const SF_START = '<!--sf-->';
const SF_END = '<!--/sf-->';
const wrapFallback = (body: string) => `${SF_START}<div class="static-fallback">${body}</div>${SF_END}`;

// Replace the content attribute of a <meta> or the href of the canonical link.
function setMeta(html: string, key: 'name' | 'property', name: string, value: string): string {
  const re = new RegExp(`(<meta\\s+${key}="${name}"\\s+content=")[^"]*(")`);
  return html.replace(re, `$1${esc(value)}$2`);
}

function renderPage(shell: string, p: Page): string {
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${abs(p.url)}$2`);
  html = setMeta(html, 'name', 'description', p.description);
  html = setMeta(html, 'property', 'og:type', p.type);
  html = setMeta(html, 'property', 'og:title', p.title);
  html = setMeta(html, 'property', 'og:description', p.description);
  html = setMeta(html, 'property', 'og:url', abs(p.url));
  html = setMeta(html, 'name', 'twitter:title', p.title);
  html = setMeta(html, 'name', 'twitter:description', p.description);
  const start = html.indexOf(SF_START);
  const end = html.indexOf(SF_END) + SF_END.length;
  return html.slice(0, start) + wrapFallback(p.body) + html.slice(end);
}

function pages(): Page[] {
  const list: Page[] = [
    {
      file: 'about.html',
      url: '/about',
      title: 'About · Reliable Owl',
      description: ABOUT_DESC,
      type: 'website',
      body: aboutBody(),
    },
    {
      file: 'notes.html',
      url: '/notes',
      title: 'Notes · Reliable Owl',
      description: '仕事や暮らしの中で考えたことを、気ままに書き残すノート。',
      type: 'website',
      body: notesBody(),
    },
    ...topics.map((tp) => ({
      file: `${tp.id}.html`,
      url: topicPath(tp.id),
      title: `${tp.title.ja} · Reliable Owl`,
      description: tp.tagline.ja,
      type: 'article' as const,
      body: topicBody(tp),
    })),
    ...notes.map((n) => ({
      file: `notes/${n.id}.html`,
      url: notePath(n.id),
      title: `${n.title.ja} · Reliable Owl`,
      description: n.summary.ja,
      type: 'article' as const,
      body: noteBody(n),
    })),
  ];
  return list;
}

export function agentDocs(): Plugin {
  let outDir = 'dist';
  let isBuild = false;
  return {
    name: 'agent-docs',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      isBuild = config.command === 'build';
    },
    transformIndexHtml(html) {
      return html
        .replace(`${ROOT_OPEN}</div>`, `${ROOT_OPEN}${wrapFallback(homeBody())}</div>`)
        .replace(
          '</head>',
          `  <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-readable index (llms.txt)" />\n` +
          // Hide the static text unless JS fails to render within 3s (no flash on normal loads).
          `  <style>.static-fallback{opacity:0;animation:sf-show 0s 3s forwards;max-width:760px;margin:0 auto;padding:48px 20px;font-family:system-ui,sans-serif;line-height:1.7}@keyframes sf-show{to{opacity:1}}</style>\n</head>`,
        );
    },
    generateBundle() {
      const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source });
      for (const tp of topics) {
        emit(mdPath(tp.id, 'ja'), topicToMd(tp, 'ja'));
        emit(mdPath(tp.id, 'en'), topicToMd(tp, 'en'));
      }
      for (const n of notes) {
        emit(noteMdPath(n.id, 'ja'), noteToMd(n, 'ja'));
        emit(noteMdPath(n.id, 'en'), noteToMd(n, 'en'));
      }
      emit('llms.txt', llmsTxt());
      emit('sitemap.xml', sitemapXml());
    },
    // The final index.html (with hashed asset links) only exists once the bundle
    // is written, so per-page HTML is derived from it here.
    closeBundle() {
      if (!isBuild) return;
      const shell = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8');
      for (const p of pages()) {
        const file = path.join(outDir, p.file);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, renderPage(shell, p));
      }
    },
  };
}
