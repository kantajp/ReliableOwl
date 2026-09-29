import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import type { Block, Section, Topic } from '../data/content';
import { Diagram } from '../diagrams';
import { SocialLinks } from './SocialLinks';
import { highlight } from './highlight';
import { t, useLang, useUi, type Lang } from '../i18n';

// Simple inline formatting: `code` -> <code>, **bold** -> strong
function renderInline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
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
    return <span key={i}>{part}</span>;
  });
}

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
          <span className="note__icon">
            {block.tone === 'tip' ? '💡' : block.tone === 'warn' ? '⚠️' : 'ℹ️'}
          </span>
          <span>{renderInline(t(block.text, lang))}</span>
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
    default:
      return null;
  }
}

interface SectionProps {
  topic: Topic;
  section: Section;
  isFirstOfTopic: boolean;
  registerRef: (id: string, el: HTMLElement | null) => void;
}

const SectionView = forwardRef<HTMLElement, SectionProps>(function SectionView(
  { topic, section, isFirstOfTopic, registerRef },
  _ref,
) {
  const { lang } = useLang();
  const uiText = useUi();
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
          <div className="topic-header__eyebrow">{uiText('topicEyebrow')}</div>
          <h1 className="topic-header__title">{t(topic.title, lang)}</h1>
          <p className="topic-header__tagline">{t(topic.tagline, lang)}</p>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section__title">{t(section.title, lang)}</h2>
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
  }
>(function Content({ topic, registerRef }, ref) {
  const uiText = useUi();
  return (
    <main className="content" ref={ref}>
      <div className="content__inner">
        {topic.sections.map((section, idx) => (
          <SectionView
            key={section.id}
            topic={topic}
            section={section}
            isFirstOfTopic={idx === 0}
            registerRef={registerRef}
          />
        ))}
        <footer className="content__footer">
          <SocialLinks />
          <p>{uiText('footer')}</p>
        </footer>
      </div>
    </main>
  );
});
