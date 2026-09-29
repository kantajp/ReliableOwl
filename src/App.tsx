import { useCallback, useEffect, useRef, useState } from 'react';
import { topics } from './data/content';
import { Sidebar } from './components/Sidebar';
import { OnThisPage } from './components/OnThisPage';
import { Content } from './components/Content';
import { Home } from './components/Home';
import { useTheme } from './useTheme';
import './app.css';

// The main view is either the landing page ('home') or a specific topic id.
type View = 'home' | string;

export default function App() {
  const [view, setView] = useState<View>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isHome = view === 'home';
  const activeTopic = topics.find((t) => t.id === view) ?? topics[0];
  const [activeId, setActiveId] = useState(activeTopic.sections[0].id);
  const { theme, toggle } = useTheme();
  const sectionEls = useRef<Map<string, HTMLElement>>(new Map());
  const observer = useRef<IntersectionObserver | null>(null);

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionEls.current.set(id, el);
    else sectionEls.current.delete(id);
  }, []);

  // Detect the current section based on scroll position. Re-run when the view
  // changes so the observer only watches the currently rendered sections.
  useEffect(() => {
    if (isHome) return;
    const visible = new Map<string, number>();
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.intersectionRatio);
          else visible.delete(e.target.id);
        }
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
  }, [view, isHome]);

  const scrollTo = useCallback((id: string) => {
    const el = sectionEls.current.get(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  }, []);

  const goHome = useCallback(() => {
    setView('home');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const openTopic = useCallback((topicId: string) => {
    const topic = topics.find((t) => t.id === topicId) ?? topics[0];
    setView(topicId);
    setActiveId(topic.sections[0].id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Select a section from the nav, switching topics/views first if needed.
  const handleSelect = useCallback(
    (topicId: string, sectionId: string) => {
      if (view !== topicId) {
        setView(topicId);
        setActiveId(sectionId);
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
    [view, scrollTo],
  );

  return (
    <div
      className={`layout ${isHome ? 'layout--home' : ''} ${sidebarOpen ? '' : 'layout--collapsed'
        }`}
    >
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </svg>
      </button>
      <Sidebar
        isHome={isHome}
        activeTopicId={view}
        activeSectionId={activeId}
        onSelect={handleSelect}
        onHome={goHome}
        onCollapse={() => setSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggle}
      />
      {isHome ? (
        <Home onOpenTopic={openTopic} />
      ) : (
        <>
          <Content topic={activeTopic} registerRef={registerRef} />
          <OnThisPage topic={activeTopic} activeSectionId={activeId} onSelect={scrollTo} />
        </>
      )}
    </div>
  );
}
