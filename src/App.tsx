import { useCallback, useEffect, useRef, useState } from 'react';
import { topics } from './data/content';
import { t, useLang } from './i18n';
import { Sidebar } from './components/Sidebar';
import { OnThisPage } from './components/OnThisPage';
import { Content } from './components/Content';
import { Home } from './components/Home';
import { AboutPage } from './components/AboutPage';
import { NotesPage } from './components/NotesPage';
import { TopBar } from './components/TopBar';
import { SearchModal } from './components/SearchModal';
import { useTheme } from './useTheme';
import { navigate, routeFromPath, useRoute } from './router';
import './app.css';

export default function App() {
  const route = useRoute();
  // 'home' | 'about' | 'notes' | <topicId>
  const view = route.view === 'topic' ? route.topicId : route.view;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = view === 'home';
  const isAbout = view === 'about';
  const isNotes = view === 'notes';
  // Pages without the docs sidebar/TOC layout.
  const isPage = isHome || isAbout || isNotes;

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

  const activeTopic = topics.find((t) => t.id === view) ?? topics[0];
  const [activeId, setActiveId] = useState(activeTopic.sections[0].id);
  const { theme, toggle } = useTheme();
  const { lang } = useLang();

  // Keep the document title in sync with the current topic and language (helps
  // search results, browser history and bookmarks).
  useEffect(() => {
    if (isNotes) return; // NotesPage sets its own title (list vs. post)
    const base =
      lang === 'ja'
        ? 'Reliable Owl — 図で学ぶシステム設計と SRE'
        : 'Reliable Owl — Learn system design & SRE with interactive diagrams';
    document.title = isHome
      ? base
      : isAbout
        ? (lang === 'ja' ? 'About · Reliable Owl' : 'About · Reliable Owl')
        : `${t(activeTopic.title, lang)} · Reliable Owl`;
  }, [isHome, isAbout, isNotes, activeTopic, lang]);

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

  // Scroll to a section once the target topic has rendered.
  const scrollToSectionSoon = useCallback((id: string, behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = sectionEls.current.get(id);
        if (el) {
          el.scrollIntoView({ behavior, block: 'start' });
          setActiveId(id);
        }
      }),
    );
  }, []);

  // A "#section" in the URL (deep link, back/forward) scrolls to that section.
  useEffect(() => {
    if (route.view !== 'topic') return;
    const section = window.location.hash.slice(1);
    if (section) scrollToSectionSoon(section, 'auto');
  }, [route, scrollToSectionSoon]);

  // Same-origin <a href="/..."> links (content, notes, footers) navigate in-app
  // instead of reloading. Files (.md, .txt …), new tabs and modified clicks are left alone.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a');
      if (!(a instanceof HTMLAnchorElement) || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || /\.\w+$/.test(url.pathname)) return;
      if (!routeFromPath(url.pathname)) return;
      e.preventDefault();
      const samePage = url.pathname.replace(/\/+$/, '') === window.location.pathname.replace(/\/+$/, '');
      if (samePage && url.hash) {
        window.history.replaceState(null, '', url.pathname + url.hash);
        scrollToSectionSoon(url.hash.slice(1));
        return;
      }
      navigate(url.pathname + url.hash);
      if (!url.hash) window.scrollTo({ top: 0, behavior: 'auto' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [scrollToSectionSoon]);

  const goHome = useCallback(() => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const goAbout = useCallback(() => {
    navigate('/about');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const openTopic = useCallback((topicId: string) => {
    const topic = topics.find((t) => t.id === topicId) ?? topics[0];
    navigate(`/${topicId}`);
    setActiveId(topic.sections[0].id);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Select a section from the nav or search, switching topics first if needed.
  const handleSelect = useCallback(
    (topicId: string, sectionId: string) => {
      if (view !== topicId) {
        setActiveId(sectionId);
        navigate(`/${topicId}#${sectionId}`);
      } else {
        window.history.replaceState(null, '', `/${topicId}#${sectionId}`);
        scrollTo(sectionId);
      }
    },
    [view, scrollTo],
  );

  return (
    <div
      className={`layout ${isPage ? 'layout--home' : ''} ${!isPage && !sidebarOpen ? 'layout--collapsed' : ''
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
      ) : isNotes ? (
        <NotesPage noteId={route.view === 'notes' ? route.noteId : null} onHome={goHome} onOpenAbout={goAbout} />
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
