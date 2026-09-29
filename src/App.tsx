import { useCallback, useEffect, useRef, useState } from 'react';
import { topics } from './data/content';
import { Sidebar } from './components/Sidebar';
import { OnThisPage } from './components/OnThisPage';
import { Content } from './components/Content';
import { useTheme } from './useTheme';
import './app.css';

export default function App() {
  const [activeTopicId, setActiveTopicId] = useState(topics[0].id);
  const activeTopic = topics.find((t) => t.id === activeTopicId) ?? topics[0];
  const [activeId, setActiveId] = useState(activeTopic.sections[0].id);
  const { theme, toggle } = useTheme();
  const sectionEls = useRef<Map<string, HTMLElement>>(new Map());
  const observer = useRef<IntersectionObserver | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionEls.current.set(id, el);
    else sectionEls.current.delete(id);
  }, []);

  // Detect the current section based on scroll position. Re-run when the active
  // topic changes so the observer only watches the currently rendered sections.
  useEffect(() => {
    const visible = new Map<string, number>();
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
        // Mark the most visible section as active
        let best: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });
        if (best) setActiveId(best);
      },
      { rootMargin: '-15% 0px -55% 0px', threshold: [0.1, 0.25, 0.5, 0.75, 1] },
    );
    sectionEls.current.forEach((el) => observer.current?.observe(el));
    return () => observer.current?.disconnect();
  }, [activeTopicId]);

  const scrollTo = useCallback((id: string) => {
    const el = sectionEls.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, []);

  // Select a section, switching topics first if needed.
  const handleSelect = useCallback(
    (topicId: string, sectionId: string) => {
      if (topicId !== activeTopicId) {
        setActiveTopicId(topicId);
        setActiveId(sectionId);
        // Wait for the new topic to render, then scroll to the section.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const el = sectionEls.current.get(sectionId);
            if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
            else window.scrollTo({ top: 0, behavior: 'auto' });
          });
        });
      } else {
        scrollTo(sectionId);
      }
    },
    [activeTopicId, scrollTo],
  );

  return (
    <div className="layout">
      <Sidebar
        activeTopicId={activeTopicId}
        activeSectionId={activeId}
        onSelect={handleSelect}
        theme={theme}
        onToggleTheme={toggle}
      />
      <Content ref={mainRef} topic={activeTopic} registerRef={registerRef} />
      <OnThisPage
        topic={activeTopic}
        activeSectionId={activeId}
        onSelect={scrollTo}
      />
    </div>
  );
}
