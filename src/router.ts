// Path-based routing (History API). URLs:
//   /                     home
//   /about                profile
//   /notes                notes list
//   /notes/<id>           one note
//   /<topicId>            article
//   /<topicId>#<section>  article, scrolled to a section
// Every route is also pre-rendered to static HTML at build time (agentDocs.ts),
// so search engines and plain HTTP fetchers get real content.
import { useEffect, useState } from 'react';
import { topics } from './data/content';

export type Route =
  | { view: 'home' }
  | { view: 'about' }
  | { view: 'notes'; noteId: string | null }
  | { view: 'topic'; topicId: string };

const NAV_EVENT = 'popstate';

export function routeFromPath(pathname: string): Route | null {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { view: 'home' };
  if (parts.length === 1 && parts[0] === 'about') return { view: 'about' };
  if (parts[0] === 'notes' && parts.length <= 2) return { view: 'notes', noteId: parts[1] ?? null };
  if (parts.length === 1 && topics.some((t) => t.id === parts[0])) return { view: 'topic', topicId: parts[0] };
  return null; // unknown
}

/** Move to `path` (may include "#section") without reloading the page. */
export function navigate(path: string, { replace = false } = {}) {
  if (path === window.location.pathname + window.location.hash) return;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
  window.dispatchEvent(new PopStateEvent(NAV_EVENT));
}

/** Current route; re-renders on navigate() and back/forward. Unknown paths go home. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => routeFromPath(window.location.pathname) ?? { view: 'home' });
  useEffect(() => {
    const onNav = () => {
      const r = routeFromPath(window.location.pathname);
      if (!r) {
        window.history.replaceState(null, '', '/');
        setRoute({ view: 'home' });
      } else {
        setRoute(r);
      }
    };
    onNav(); // also normalizes an unknown initial path
    window.addEventListener(NAV_EVENT, onNav);
    return () => window.removeEventListener(NAV_EVENT, onNav);
  }, []);
  return route;
}

/**
 * Old links used hash routes ("/#topic", "/#topic/section", "/#notes/id").
 * Rewrite them to the new paths before the app renders, so shared links keep working.
 */
export function migrateLegacyHash() {
  if (window.location.pathname !== '/' || !window.location.hash) return;
  const [page, sub] = window.location.hash.replace(/^#/, '').split('/');
  let path: string | null = null;
  if (page === 'about') path = '/about';
  else if (page === 'notes') path = sub ? `/notes/${sub}` : '/notes';
  else if (topics.some((t) => t.id === page)) path = sub ? `/${page}#${sub}` : `/${page}`;
  if (path) window.history.replaceState(null, '', path);
}

/** In-content links are written as "#topic" or "#topic/section"; turn them into paths. */
export function contentHref(href: string): string {
  if (!href.startsWith('#')) return href;
  const [topic, section] = href.slice(1).split('/');
  return section ? `/${topic}#${section}` : `/${topic}`;
}
