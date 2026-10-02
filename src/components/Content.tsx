import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { categories, topics, type Block, type Section, type Topic } from '../data/content';
import { Diagram } from '../diagrams';
import { SocialLinks } from './SocialLinks';
import { highlight } from './highlight';
import { formatDate } from '../formatDate';
import { t, useLang, useUi, type Lang } from '../i18n';

// Simple inline formatting: `code` -> <code>, **bold** -> strong,
// [label](https://url) -> external link (new tab), [label](#topic) -> internal link.
const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|#[\w/-]+)\)/;
function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\((?:https?:\/\/[^)\s]+|#[\w/-]+)\))/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const link = part.match(LINK_RE);
    if (link && link[0] === part) {
      const href = link[2];
      // Internal links (#topic) navigate within the app via the hash router;
      // external links open in a new tab.
      const internal = href.startsWith('#');
      return (
        <a
          key={i}
          href={href}
          className="prose-link"
          {...(internal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {link[1]}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Format an ISO date (YYYY-MM-DD) as e.g. "Sep 29, 2026".

function BlockView({ block, lang }: { block: Block; lang: Lang }) {
  switch (block.type) {
    case 'p':
      return <p className="prose-p">{renderInline(t(block.text, lang))}</p>;
    case 'list':
      return (
        <ul className="prose-list">
          {block.items.map((it, i) => (
            <li key={i}>{renderInline(t(it, lang))}</li>
          ))}
        </ul>
      );
    case 'note':
      return (
        <div className={`note note--${block.tone}`}>
          <span className="note__label">
            {t(NOTE_LABELS[block.tone] ?? NOTE_LABELS.info, lang)}
          </span>
          <span className="note__text">{renderInline(t(block.text, lang))}</span>
        </div>
      );
    case 'code':
      return (
        <div className="code-block">
          {block.label && <div className="code-block__label">{t(block.label, lang)}</div>}
          <pre>
            <code>{highlight(block.code)}</code>
          </pre>
        </div>
      );
    case 'diagram':
      return <Diagram id={block.id} />;
    case 'details':
      return (
        <details className="details">
          <summary className="details__summary">
            <span className="details__chevron" aria-hidden="true">▸</span>
            {t(block.summary, lang)}
          </summary>
          <div className="details__body">
            {block.blocks.map((b, i) => (
              <BlockView key={i} block={b} lang={lang} />
            ))}
          </div>
        </details>
      );
    default:
      return null;
  }
}

interface SectionProps {
  topic: Topic;
  section: Section;
  index: number;
  isFirstOfTopic: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

const NOTE_LABELS: Record<string, { ja: string; en: string }> = {
  tip: { ja: 'ヒント', en: 'Tip' },
  warn: { ja: '注意', en: 'Caution' },
  info: { ja: 'メモ', en: 'Note' },
};

const NEXT_LABEL = { ja: '次の記事', en: 'Next' };

const SectionView = forwardRef<HTMLElement, SectionProps>(function SectionView(
  { topic, section, index, isFirstOfTopic, registerRef },
  _ref,
) {
  const { lang } = useLang();
  // Eyebrow: the topic's category, e.g. "System Design".
  const category = categories.find((c) => c.id === topic.category);
  return (
    <section
      id={section.id}
      ref={(el) => registerRef(section.id, el)}
      className="section"
    >
      {isFirstOfTopic && (
        <motion.div
          className="topic-header"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="topic-header__eyebrow">
            {category ? t(category.label, lang) : ''}
          </div>
          <h1 className="topic-header__title">{t(topic.title, lang)}</h1>
          <p className="topic-header__tagline">{t(topic.tagline, lang)}</p>
          <p className="topic-header__dates">
            <span>Published {formatDate(topic.publishedAt)}</span>
            {topic.updatedAt !== topic.publishedAt && (
              <span className="topic-header__dates-sep"> · Updated {formatDate(topic.updatedAt)}</span>
            )}
          </p>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section__title">
          <span className="section__num" aria-hidden="true">{pad2(index + 1)}</span>
          {t(section.title, lang)}
        </h2>
        {section.blocks.map((b, i) => (
          <BlockView key={i} block={b} lang={lang} />
        ))}
      </motion.div>
    </section>
  );
});

export const Content = forwardRef<
  HTMLElement,
  {
    topic: Topic;
    registerRef: (id: string, el: HTMLElement | null) => void;
    onOpenAbout: () => void;
    onOpenTopic: (topicId: string) => void;
  }
>(function Content({ topic, registerRef, onOpenAbout, onOpenTopic }, ref) {
  const { lang } = useLang();
  const uiText = useUi();
  // Next article in reading order (same order as the home index).
  const ordered = categories.flatMap((c) => topics.filter((tp) => tp.category === c.id));
  const next = ordered[ordered.findIndex((tp) => tp.id === topic.id) + 1];
  const nextCategory = next && categories.find((c) => c.id === next.category);
  return (
    <main className="content" ref={ref}>
      <div className="content__inner">
        {topic.sections.map((section, idx) => (
          <SectionView
            key={section.id}
            topic={topic}
            section={section}
            index={idx}
            isFirstOfTopic={idx === 0}
            registerRef={registerRef}
          />
        ))}
        {next && (
          <nav className="next-topic" aria-label={t(NEXT_LABEL, lang)}>
            <div className="next-topic__label">{t(NEXT_LABEL, lang)}</div>
            <button type="button" className="next-topic__row" onClick={() => onOpenTopic(next.id)}>
              <span className="next-topic__main">
                <span className="next-topic__eyebrow">{nextCategory ? t(nextCategory.label, lang) : ''}</span>
                <span className="next-topic__title">{t(next.title, lang)}</span>
                <span className="next-topic__desc">{t(next.tagline, lang)}</span>
              </span>
              <span className="next-topic__arrow" aria-hidden="true">→</span>
            </button>
          </nav>
        )}
        <footer className="content__footer">
          <SocialLinks />
          <p>{uiText('footer')}</p>
          <button type="button" className="about-link" onClick={onOpenAbout}>
            Kanta Nakamura
            <span className="about-link__sep"> · </span>
            {uiText('viewProfile')} <span className="about-link__arrow">→</span>
          </button>
        </footer>
      </div>
    </main>
  );
});
