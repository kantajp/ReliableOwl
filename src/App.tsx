import { useCallback, useEffect, useRef, useState } from 'react';
import { topics } from './data/content';
import { t, useLang } from './i18n';
import { Sidebar } from './components/Sidebar';
import { OnThisPage } from './components/OnThisPage';
import { Content } from './components/Content';
import { Home } from './components/Home';
import { AboutPage } from './components/AboutPage';
import { TopBar } from './components/TopBar';
import { SearchModal } from './components/SearchModal';
import { useTheme } from './useTheme';
import './app.css';

// The main view is either the landing page ('home') or a specific topic id.
type View = 'home' | string;

// Parse the URL hash into a topic and optional section, e.g.
// "#url-shortener" or "#url-shortener/capacity".
function parseHash(): { topic: string; section: string | null } {
  const raw = window.location.hash.replace(/^#/, '');
  const [topic, section] = raw.split('/');
  return { topic, section: section ?? null };
}

// Derive the initial view from the URL hash, so a reload or a shared link lands
// on the same screen. Unknown/empty hash → home.
function viewFromHash(): View {
  const { topic } = parseHash();
  if (topic === 'about') return 'about';
  return topics.some((t) => t.id === topic) ? topic : 'home';
}

export default function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = view === 'home';
  const isAbout = view === 'about';

  // Open the search palette with ⌘K / Ctrl+K from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keep the URL hash in sync with the current view. If the hash already points
  // at the current topic (possibly with a #topic/section suffix), leave it be so
  // section anchors survive.
  useEffect(() => {
    const currentTopic = parseHash().topic;
    if (view === 'home') {
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    } else if (currentTopic !== view) {
      window.history.replaceState(null, '', `#${view}`);
    }
  }, [view]);

  // Respond to back/forward navigation, manual hash edits and in-app anchor
  // links. Switch to the target topic and, if a section was given, scroll to it.
  useEffect(() => {
    const onHashChange = () => {
      const { topic, section } = parseHash();
      setView(topic === 'about' ? 'about' : topics.some((t) => t.id === topic) ? topic : 'home');
      if (section) {
        // Wait for the new topic to render, then scroll to the section.
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            const el = sectionEls.current.get(section);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }),
        );
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const activeTopic = topics.find((t) => t.id === view) ?? topics[0];
  const [activeId, setActiveId] = useState(activeTopic.sections[0].id);
  const { theme, toggle } = useTheme();
  const { lang } = useLang();

  // Keep the document title in sync with the current topic and language (helps
  // search results, browser history and bookmarks).
  useEffect(() => {
    const base =
      lang === 'ja'
        ? 'Reliable Owl — 図で学ぶシステム設計と SRE'
        : 'Reliable Owl — Learn system design & SRE with interactive diagrams';
    document.title = isHome
      ? base
      : isAbout
        ? (lang === 'ja' ? 'About · Reliable Owl' : 'About · Reliable Owl')
        : `${t(activeTopic.title, lang)} · Reliable Owl`;
  }, [isHome, isAbout, activeTopic, lang]);

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

  const goAbout = useCallback(() => {
    setView('about');
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
      className={`layout ${isHome || isAbout ? 'layout--home' : ''} ${!isHome && !isAbout && !sidebarOpen ? 'layout--collapsed' : ''
        }`}
    >
      {/* Search + language + theme controls, fixed top-right on every view */}
      <TopBar theme={theme} onToggleTheme={toggle} onOpenSearch={() => setSearchOpen(true)} />

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleSelect}
      />

      {isHome ? (
        <Home onOpenTopic={openTopic} onOpenAbout={goAbout} />
      ) : isAbout ? (
        <AboutPage onHome={goHome} />
      ) : (
        <>
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
          />
          <Content topic={activeTopic} registerRef={registerRef} onOpenAbout={goAbout} onOpenTopic={openTopic} />
          <OnThisPage topic={activeTopic} activeSectionId={activeId} onSelect={scrollTo} />
        </>
      )}
    </div>
  );
}
