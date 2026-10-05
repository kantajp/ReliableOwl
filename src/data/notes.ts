// Notes: informal, personal writing (work, career, daily life). Kept separate
// from the technical topics in content.ts: no categories, no numbered
// sections, no diagrams. Newest first is handled by the UI (sorted by date).
//
// `draft: true` notes appear only in local dev (`npm run dev`), marked "Draft".
// They are never shown in production or written to the AI-readable Markdown.
// Remove `draft` when a note is ready to publish.
import type { LocalizedString } from '../i18n';
import type { Block } from './content';

export interface Note {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  title: LocalizedString;
  summary: LocalizedString;
  draft?: boolean;
  blocks: Block[];
}

export const notes: Note[] = [
  {
    id: 'taiwan-europe-japan',
    date: '2026-10-05',
    draft: true,
    title: { ja: '台湾、ヨーロッパ、そして日本へ', en: 'Taiwan, Europe, and back to Japan' },
    summary: {
      ja: '3 つの国で学び、働いてきた道のりと、SRE としてのこれから。',
      en: 'Studying and working across three countries, and what comes next as an SRE.',
    },
    // DRAFT: the bracketed parts are prompts. Replace them with your own words,
    // keep anything about work at the level of your own experience (no internal
    // details), then delete `draft: true` above to publish.
    blocks: [
      {
        type: 'p',
        text: {
          ja: '台湾の大学でコンピュータサイエンスを学び、新卒でヨーロッパに渡ってエンジニアとして働き、いまは日本に戻って Site Reliability Engineer としてのキャリアを始めるところです。振り返ると、国が変わるたびに、仕事の進め方も、当たり前だと思っていたことも少しずつ変わってきました。その道のりで考えたことを、ここに書き残しておきます。',
          en: "I studied computer science at a university in Taiwan, moved to Europe to start my career as an engineer, and am now back in Japan, about to begin my career as a Site Reliability Engineer. Each move changed how I work and what I took for granted. This note is a record of what I've thought about along the way.",
        },
      },
      { type: 'h', text: { ja: '台湾で学んだこと', en: 'Studying in Taiwan' } },
      {
        type: 'p',
        text: {
          ja: '（台湾の大学を選んだ理由と、そこで学んで今も役に立っていることを書く）',
          en: '(Why you chose a university in Taiwan, and what you learned there that still helps you today.)',
        },
      },
      { type: 'h', text: { ja: '新卒でヨーロッパへ', en: 'Starting out in Europe' } },
      {
        type: 'p',
        text: {
          ja: '最初の仕事は、ダブリンでの Cloud Support Engineer でした。（英語で働くこと、チームや文化の違い、障害対応の現場で学んだことなど、印象に残っている経験を書く）',
          en: 'My first job was as a Cloud Support Engineer in Dublin. (What it was like to work in English, differences in teams and culture, and what you learned from handling real incidents.)',
        },
      },
      { type: 'h', text: { ja: '日本に戻って、SRE へ', en: 'Back to Japan, and into SRE' } },
      {
        type: 'p',
        text: {
          ja: '（日本に戻ることにした理由と、SRE を選んだ理由を書く）',
          en: '(Why you decided to move back to Japan, and why you chose SRE.)',
        },
      },
      { type: 'h', text: { ja: 'これから', en: "What's next" } },
      {
        type: 'p',
        text: {
          ja: 'このサイトは、システム設計と信頼性について学んだことを、自分の言葉と図で整理する場所です。このノートでは、そうした技術の話の外側にある、日々の仕事や暮らしの中で感じたことを書いていきます。',
          en: 'This site is where I organize what I learn about system design and reliability, in my own words and diagrams. These notes are for everything around that: what I notice and think about in day-to-day work and life.',
        },
      },
    ],
  },
];
