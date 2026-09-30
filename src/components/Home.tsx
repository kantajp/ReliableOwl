import { type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { categories, topics } from '../data/content';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { HeroFluid } from './HeroFluid';
import { TopicCarousel } from './TopicCarousel';
import { HeroSelfHealing } from './hero/HeroSelfHealing';
import { t, useLang, useUi } from '../i18n';
import '../home.css';

interface Props {
  onOpenTopic: (topicId: string) => void;
}

// Pointer spotlight for the hero and feature cards (writes CSS vars directly).
function trackPointer(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

const featureIcons: ReactNode[] = [
  <path key="a" d="M8 5.5v13l10.5-6.5L8 5.5z" />,
  <g key="b">
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5M10 13h6M10 17h6" />
  </g>,
  <g key="c">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.8 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.8-3.8-9s1.3-6.5 3.8-9z" />
  </g>,
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export function Home({ onOpenTopic }: Props) {
  const { lang } = useLang();
  const uiText = useUi();

  const features = [
    { t: uiText('feat1Title'), b: uiText('feat1Body') },
    { t: uiText('feat2Title'), b: uiText('feat2Body') },
    { t: uiText('feat3Title'), b: uiText('feat3Body') },
  ];

  return (
    <main className="home">
      {/* ===== Hero ===== */}
      <section className="hero" onMouseMove={trackPointer}>
        <HeroFluid />
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__spotlight" aria-hidden="true" />

        <div className="hero__content">
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.05 }} className="hero__logo">
            <Logo size={64} color="#fff" />
          </motion.div>

          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="hero__title">
            {uiText('brandTitle')}
          </motion.h1>

          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.16 }} className="hero__tagline">
            {uiText('heroTagline')}
          </motion.p>

          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.22 }} className="hero__sub">
            {uiText('heroSub')}
          </motion.p>

          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.28 }}>
            <button className="hero__cta" onClick={() => onOpenTopic(topics[0].id)}>
              <span>{uiText('heroCta')}</span>
              <span className="hero__cta-arrow">→</span>
            </button>
          </motion.div>

          {/* Live architecture window */}
          <motion.div
            className="hero-window"
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-window__bar">
              <span className="hero-window__dots">
                <i />
                <i />
                <i />
              </span>
              <span className="hero-window__label">
                <span className="hero__pulse hero__pulse--green" />
                {uiText('liveLabel')}
              </span>
            </div>
            <div className="hero-window__body">
              <HeroSelfHealing owl />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="home__inner">
        {/* ===== Topics, grouped by category ===== */}
        {categories.map((cat) => {
          const catTopics = topics.filter((tp) => tp.category === cat.id);
          if (catTopics.length === 0) return null;
          return (
            <section className="home-section" key={cat.id}>
              <h2 className="home-section__heading">{t(cat.label, lang)}</h2>
              <TopicCarousel items={catTopics} onOpenTopic={onOpenTopic} />
            </section>
          );
        })}

        {/* ===== Features ===== */}
        <section className="home-section">
          <h2 className="home-section__heading">{uiText('featuresHeading')}</h2>
          <div className="feature-grid">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="feature"
                onMouseMove={trackPointer}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="feature__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {featureIcons[i]}
                  </svg>
                </div>
                <div className="feature__title">{f.t}</div>
                <div className="feature__body">{f.b}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="home__footer">
          <SocialLinks />
          <p>{uiText('footer')}</p>
        </footer>
      </div>
    </main>
  );
}
