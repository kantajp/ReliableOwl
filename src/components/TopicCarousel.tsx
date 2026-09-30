import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Topic } from '../data/content';
import { t, useLang, useUi } from '../i18n';

// Pointer spotlight (writes CSS vars directly; no re-render).
function trackPointer(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function TopicGlyph({ index }: { index: number }) {
  const glyphs = [
    <g key="a" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 15a4 4 0 0 1 0-6l2-2a4 4 0 0 1 6 6l-1 1" />
      <path d="M15 9a4 4 0 0 1 0 6l-2 2a4 4 0 0 1-6-6l1-1" />
    </g>,
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

const GAP = 18;

// A single category's topic carousel with seamless infinite looping,
// arrow buttons, pointer drag and horizontal wheel/trackpad support.
export function TopicCarousel({
  items,
  onOpenTopic,
}: {
  items: Topic[];
  onOpenTopic: (topicId: string) => void;
}) {
  const { lang } = useLang();
  const uiText = useUi();

  const LEN = items.length;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(0);
  const [index, setIndex] = useState(LEN); // start on the middle copy
  const [animate, setAnimate] = useState(true);
  const [drag, setDrag] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVw(el.clientWidth));
    ro.observe(el);
    setVw(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (animate) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  // Horizontal wheel / trackpad paging.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let accum = 0;
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (dx === 0) return;
      e.preventDefault();
      if (lock) return;
      accum += dx;
      if (Math.abs(accum) > 40) {
        setAnimate(true);
        setIndex((i) => i + (accum > 0 ? 1 : -1));
        accum = 0;
        lock = true;
        setTimeout(() => {
          lock = false;
        }, 450);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const VISIBLE = vw < 560 ? 1 : vw < 720 ? 2 : 3;
  const cardW = vw > 0 ? (vw - GAP * (VISIBLE - 1)) / VISIBLE : 0;
  const step = cardW + GAP;
  // Only loop when there are more topics than fit on screen.
  const looping = LEN > VISIBLE;
  const display = looping ? [...items, ...items, ...items] : items;
  const baseOffset = looping ? index * step : 0;

  const go = (dir: 1 | -1) => {
    if (!looping) return;
    setAnimate(true);
    setIndex((i) => i + dir);
  };

  const onPointerDown = (e: { clientX: number }) => {
    if (!looping) return;
    const startX = e.clientX;
    setAnimate(false);
    let last = 0;
    const move = (ev: PointerEvent) => {
      last = ev.clientX - startX;
      setDrag(last);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      setDrag(0);
      setAnimate(true);
      if (step > 0 && Math.abs(last) > step / 4) {
        setIndex((i) => i + (last < 0 ? 1 : -1));
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const onTrackTransitionEnd = () => {
    if (!looping) return;
    if (index >= LEN * 2) {
      setAnimate(false);
      setIndex((i) => i - LEN);
    } else if (index < LEN) {
      setAnimate(false);
      setIndex((i) => i + LEN);
    }
  };

  return (
    <div className="carousel">
      {looping && (
        <button className="carousel__btn carousel__btn--prev" onClick={() => go(-1)} aria-label="Previous topics">
          ‹
        </button>
      )}
      <div className="carousel__viewport" ref={viewportRef} onPointerDown={onPointerDown}>
        <div
          className="carousel__track"
          style={{
            gap: GAP,
            transform: `translateX(${-baseOffset + drag}px)`,
            transition: animate ? 'transform 0.45s ease' : 'none',
          }}
          onTransitionEnd={onTrackTransitionEnd}
        >
          {display.map((topic, i) => (
            <button
              key={i}
              className="topic-card"
              style={{ flex: `0 0 ${cardW}px`, width: cardW }}
              onClick={() => onOpenTopic(topic.id)}
              onMouseMove={trackPointer}
            >
              <span className="topic-card__glow" aria-hidden="true" />
              <span className="topic-card__top">
                <span className="topic-card__glyph">
                  <TopicGlyph index={i % LEN} />
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
      </div>
      {looping && (
        <button className="carousel__btn carousel__btn--next" onClick={() => go(1)} aria-label="More topics">
          ›
        </button>
      )}
    </div>
  );
}
