import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { topics } from '../data/content';
import { Logo } from './Logo';
import { t, useLang, useUi } from '../i18n';

interface Props {
  isHome: boolean;
  activeTopicId: string;
  activeSectionId: string;
  onSelect: (topicId: string, sectionId: string) => void;
  onHome: () => void;
  onCollapse: () => void;
}

export function Sidebar({
  isHome,
  activeTopicId,
  activeSectionId,
  onSelect,
  onHome,
  onCollapse,
}: Props) {
  const { lang } = useLang();
  const uiText = useUi();

  // Topics the user has manually collapsed even though they are active.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // When the active topic changes (e.g. via a card or hash link), expand it.
  useEffect(() => {
    setCollapsed((prev) => {
      if (!prev.has(activeTopicId)) return prev;
      const next = new Set(prev);
      next.delete(activeTopicId);
      return next;
    });
  }, [activeTopicId]);

  const handleToggle = (topicId: string, firstSectionId: string) => {
    if (!isHome && topicId === activeTopicId) {
      // Active topic: toggle its expanded/collapsed state (content stays put).
      setCollapsed((prev) => {
        const next = new Set(prev);
        if (next.has(topicId)) next.delete(topicId);
        else next.add(topicId);
        return next;
      });
    } else {
      // Different topic: switch to it and make sure it is expanded.
      onSelect(topicId, firstSectionId);
      setCollapsed((prev) => {
        if (!prev.has(topicId)) return prev;
        const next = new Set(prev);
        next.delete(topicId);
        return next;
      });
    }
  };

  return (
    <aside className="sidebar">
      <button className="sidebar__brand" onClick={onHome} aria-label={uiText('home')}>
        <div className="sidebar__logo">
          <Logo size={24} color="#fff" />
        </div>
        <div className="sidebar__brand-text">
          <div className="sidebar__title">{uiText('brandTitle')}</div>
          <div className="sidebar__subtitle">{uiText('brandSubtitle')}</div>
        </div>
      </button>
      <button
        className="sidebar__collapse"
        onClick={onCollapse}
        aria-label="Hide sidebar"
        title="Hide sidebar"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <nav className="sidebar__nav">
        {topics.map((topic) => {
          // The active topic is expanded unless the user manually collapsed it.
          const isActive = !isHome && topic.id === activeTopicId;
          const isOpen = isActive && !collapsed.has(topic.id);
          return (
            <div key={topic.id} className="nav-group">
              <button
                className={`nav-group__toggle ${isActive ? 'nav-group__toggle--active' : ''}`}
                onClick={() => handleToggle(topic.id, topic.sections[0].id)}
                aria-expanded={isOpen}
              >
                <motion.span
                  className="nav-group__chevron"
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  ▸
                </motion.span>
                <span className="nav-group__label">{t(topic.title, lang)}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    key="list"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    {topic.sections.map((s) => {
                      const isActive = s.id === activeSectionId;
                      return (
                        <li key={s.id}>
                          <button
                            className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                            onClick={() => onSelect(topic.id, s.id)}
                          >
                            <span className="nav-link__bar" />
                            {t(s.title, lang)}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
