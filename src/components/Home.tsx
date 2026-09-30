import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { topics } from '../data/content';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { HeroFluid } from './HeroFluid';
import { HeroTopology } from './HeroTopology';
import { t, useLang, useUi } from '../i18n';
import '../home.css';

interface Props {
  onOpenTopic: (topicId: string) => void;
}

// Track the pointer as CSS variables (--mx / --my) for spotlight effects.
// Writes straight to the element's style, so it never triggers a React re-render.
function trackPointer(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

// Small decorative icon for each topic card.
function TopicGlyph({ index }: { index: number }) {
  const glyphs = [
    // link / chain (URL shortener)
    <g key="a" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 15a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1" />
      <path d="M15 9a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1" />
    </g>,
    // gate / limiter
    <g key="b" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </g>,
  ];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      {glyphs[index % glyphs.length]}
    </svg>
  );
}

const featureIcons: ReactNode[] = [
  // play / motion
  <path key="a" d="M8 5.5v13l10.5-6.5L8 5.5z" />,
  // document / read
  <g key="b">
    <path d="M7 3h7l5 5v13H7z" />
    <path d="M14 3v5h5M10 13h6M10 17h6" />
  </g>,
  // globe / languages
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

  // Topic carousel: show ~3 cards, page through the rest with arrows.
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };
  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.topic-card') as HTMLElement | null;
    const step = card ? card.offsetWidth + 18 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <main className="home">
      {/* ===== Hero ===== */}
      <section className="hero" onMouseMove={trackPointer}>
        <HeroFluid />
        <div className="hero__grid" aria-hidden="true" />
        <div className="hero__spotlight" aria-hidden="true" />

        <div className="hero__content">
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.05 }} className="hero__logo">
            <Logo size={40} color="#fff" />
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
              <HeroTopology />
            </div>
          </motion.div>

        </div>
      </section>

      <div className="home__inner">
        {/* ===== Topic cards (carousel) ===== */}
        <section className="home-section">
          <div className="home-section__head">
            <h2 className="home-section__heading home-section__heading--plain">{uiText('topicsHeading')}</h2>
            <div className="carousel__nav">
              <button
                className="carousel__btn"
                onClick={() => scrollByCards(-1)}
                disabled={!canPrev}
                aria-label="Previous topics"
              >
                ‹
              </button>
              <button
                className="carousel__btn"
                onClick={() => scrollByCards(1)}
                disabled={!canNext}
                aria-label="More topics"
              >
                ›
              </button>
            </div>
          </div>
          <div className="topic-carousel" ref={trackRef}>
            {topics.map((topic, i) => (
              <button
                key={topic.id}
                className="topic-card"
                onClick={() => onOpenTopic(topic.id)}
                onMouseMove={trackPointer}
              >
                <span className="topic-card__glow" aria-hidden="true" />
                <span className="topic-card__top">
                  <span className="topic-card__glyph">
                    <TopicGlyph index={i} />
                  </span>
                  <span className="topic-card__meta">
                    {topic.sections.length} {uiText('sectionsUnit')}
                  </span>
                </span>
                <span className="topic-card__title">{t(topic.title, lang)}</span>
                <span className="topic-card__desc">{t(topic.tagline, lang)}</span>
                <span className="topic-card__cta">
                  {uiText('cardCta')} <span className="topic-card__arrow">→</span>
                </span>
              </button>
            ))}
          </div>
        </section>

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
