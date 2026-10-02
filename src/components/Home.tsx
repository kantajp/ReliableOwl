import { motion } from 'framer-motion';
import { categories, topics } from '../data/content';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { formatDate } from '../formatDate';
import { t, useLang, useUi } from '../i18n';
import '../home.css';

interface Props {
  onOpenTopic: (topicId: string) => void;
  onOpenAbout: () => void;
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

// Editorial home: left-aligned masthead, then each category as an index of
// rows (title + tagline · updated date). Typography and whitespace
// carry the design; no decorative effects.
export function Home({ onOpenTopic, onOpenAbout }: Props) {
  const { lang } = useLang();
  const uiText = useUi();

  const features = [
    { t: uiText('feat1Title'), b: uiText('feat1Body') },
    { t: uiText('feat2Title'), b: uiText('feat2Body') },
    { t: uiText('feat3Title'), b: uiText('feat3Body') },
  ];

  return (
    <main className="home ed">
      <div className="ed__inner">
        {/* ===== Masthead ===== */}
        <header className="ed-hero">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="ed-hero__mark">
            <Logo size={30} color="#fff" />
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.5, delay: 0.05 }} className="ed-hero__title">
            {uiText('brandTitle')}
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }} className="ed-hero__tagline">
            {uiText('heroTagline')}
          </motion.p>
        </header>

        {/* ===== Topic index, grouped by category ===== */}
        {categories.map((cat) => {
          const catTopics = topics.filter((tp) => tp.category === cat.id);
          if (catTopics.length === 0) return null;
          return (
            <section className="ed-section" key={cat.id}>
              <h2 className="ed-section__head">
                <span>{t(cat.label, lang)}</span>
                <span className="ed-section__count">{catTopics.length}</span>
              </h2>
              <ol className="ed-list">
                {catTopics.map((topic) => (
                  <li key={topic.id}>
                    <button type="button" className="ed-row" onClick={() => onOpenTopic(topic.id)}>
                      <span className="ed-row__main">
                        <span className="ed-row__title">{t(topic.title, lang)}</span>
                        <span className="ed-row__desc">{t(topic.tagline, lang)}</span>
                      </span>
                      <span className="ed-row__date">{formatDate(topic.updatedAt)}</span>
                      <span className="ed-row__arrow" aria-hidden="true">→</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}

        {/* ===== About this site ===== */}
        <section className="ed-section">
          <h2 className="ed-section__head">
            <span>{uiText('featuresHeading')}</span>
          </h2>
          <div className="ed-notes">
            {features.map((f, i) => (
              <div className="ed-note" key={i}>
                <div className="ed-note__title">{f.t}</div>
                <p className="ed-note__body">{f.b}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="ed-footer">
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
}
