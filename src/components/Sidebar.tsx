import { AnimatePresence, motion } from 'framer-motion';
import { topics } from '../data/content';
import { ThemeToggle } from './ThemeToggle';
import { LangToggle } from './LangToggle';
import { Logo } from './Logo';
import type { Theme } from '../useTheme';
import { t, useLang, useUi } from '../i18n';

interface Props {
  activeTopicId: string;
  activeSectionId: string;
  onSelect: (topicId: string, sectionId: string) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export function Sidebar({ activeTopicId, activeSectionId, onSelect, theme, onToggleTheme }: Props) {
  const { lang } = useLang();
  const uiText = useUi();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <Logo size={24} color="#fff" />
        </div>
        <div className="sidebar__brand-text">
          <div className="sidebar__title">{uiText('brandTitle')}</div>
          <div className="sidebar__subtitle">{uiText('brandSubtitle')}</div>
        </div>
      </div>
      <div className="sidebar__controls">
        <LangToggle />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <nav className="sidebar__nav">
        {topics.map((topic) => {
          // Only the active topic is expanded; the rest are collapsed.
          const isOpen = topic.id === activeTopicId;
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
