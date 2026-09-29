import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Lang = 'ja' | 'en';

const STORAGE_KEY = 'sysdesign-lang';

// Localized string: a { ja, en } pair
export type LocalizedString = Record<Lang, string>;

export function t(s: LocalizedString, lang: Lang): string {
  return s[lang];
}

function getInitialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'ja' || saved === 'en') return saved;
  // Infer from the browser language when nothing is saved
  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === 'ja' ? 'en' : 'ja'));

  return <LangContext.Provider value={{ lang, setLang, toggle }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

// ===== UI string dictionary =====
export const ui = {
  brandTitle: { ja: 'SysDesign Visual', en: 'SysDesign Visual' },
  brandSubtitle: { ja: '図で学ぶ設計', en: 'Learn by Diagrams' },
  onThisPage: { ja: 'このページ', en: 'On this page' },
  footer: {
    ja: 'Built by Kanta Nakamura · SysDesign Visual',
    en: 'Built by Kanta Nakamura · SysDesign Visual',
  },
  topicEyebrow: { ja: 'トピック', en: 'TOPIC' },
  home: { ja: 'ホーム', en: 'Home' },
  heroTagline: {
    ja: 'システム設計を、図で動かして学ぶ。',
    en: 'Learn system design by watching it move.',
  },
  heroSub: {
    ja: '定番の設計課題を、スクロールしながら読み、図を動かして理解する学習ノート。',
    en: 'A learning notebook for classic design problems — read as you scroll, and watch the diagrams move.',
  },
  heroCta: { ja: '学び始める', en: 'Start learning' },
  liveLabel: { ja: 'ライブ · リクエストの流れ', en: 'live · request flow' },
  statTopics: { ja: 'トピック', en: 'Topics' },
  statDiagrams: { ja: '動く図', en: 'Interactive diagrams' },
  statLangs: { ja: '言語', en: 'Languages' },
  sectionsUnit: { ja: 'セクション', en: 'sections' },
  topicsHeading: { ja: 'トピック', en: 'Topics' },
  cardCta: { ja: '学ぶ', en: 'Learn' },
  featuresHeading: { ja: 'このノートの特徴', en: 'What makes it click' },
  feat1Title: { ja: '動く図で理解', en: 'Diagrams that move' },
  feat1Body: {
    ja: 'リクエストの流れやトークンの消費を、アニメーションで直感的に。',
    en: 'Request flows and token usage, shown as intuitive animations.',
  },
  feat2Title: { ja: '読みながら学ぶ', en: 'Read as you go' },
  feat2Body: {
    ja: 'ドキュメント形式で、文章と図を行き来しながら着実に理解。',
    en: 'A docs-style layout that moves between prose and diagrams.',
  },
  feat3Title: { ja: '日英 & ダーク対応', en: 'Bilingual & themed' },
  feat3Body: {
    ja: '日本語・英語、ライト・ダークをワンタップで切り替え。',
    en: 'Switch Japanese/English and light/dark in one tap.',
  },
  replay: { ja: '再生', en: 'Replay' },
  nextExample: { ja: '次の例 →', en: 'Next example →' },
  sendRequest: { ja: 'リクエスト送信', en: 'Send request' },
  stopRefill: { ja: '補充を止める', en: 'Stop refill' },
  resumeRefill: { ja: '補充を再開', en: 'Resume refill' },
  write: { ja: 'Write', en: 'Write' },
  read: { ja: 'Read', en: 'Read' },
  cacheOn: { ja: 'キャッシュ有', en: 'Cache on' },
  cacheOff: { ja: '無し', en: 'Off' },
  makeMiss: { ja: 'ミスにする', en: 'Make it miss' },
  makeHit: { ja: 'ヒットにする', en: 'Make it hit' },
  sharedStore: { ja: '共有ストア', en: 'Shared store' },
  perServer: { ja: '個別', en: 'Per-server' },
} satisfies Record<string, LocalizedString>;

export function useUi() {
  const { lang } = useLang();
  return (key: keyof typeof ui) => ui[key][lang];
}
