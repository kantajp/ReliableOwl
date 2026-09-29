import { AnimatePresence, motion } from 'framer-motion';
import { topics } from '../data/content';
import { ThemeToggle } from './ThemeToggle';
import { LangToggle } from './LangToggle';
import { Logo } from './Logo';
import type { Theme } from '../useTheme';
import { t, useLang, useUi } from '../i18n';

interface Props {
  isHome: boolean;
  activeTopicId: string;
  activeSectionId: string;
  onSelect: (topicId: string, sectionId: string) => void;
  onHome: () => void;
  onCollapse: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Sidebar({
  isHome,
  activeTopicId,
  activeSectionId,
  onSelect,
  onHome,
  onCollapse,
  theme,
  onToggleTheme,
}: Props) {
  const { lang } = useLang();
  const uiText = useUi();

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
      <div className="sidebar__controls">
        <LangToggle />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
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
      </div>
      <nav className="sidebar__nav">
        <button
          className={`nav-home ${isHome ? 'nav-home--active' : ''}`}
          onClick={onHome}
        >
          <span className="nav-home__icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10h14V10" />
            </svg>
          </span>
          {uiText('home')}
        </button>

        {topics.map((topic) => {
          // Only the active topic is expanded (never on the home view).
          const isOpen = !isHome && topic.id === activeTopicId;
          return (
            <div key={topic.id} className="nav-group">
              <button
                className={`nav-group__toggle ${isOpen ? 'nav-group__toggle--active' : ''}`}
                onClick={() => onSelect(topic.id, topic.sections[0].id)}
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
