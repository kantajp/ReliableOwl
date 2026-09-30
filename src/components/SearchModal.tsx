import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { categories, topics } from '../data/content';
import { t, useLang, useUi } from '../i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (topicId: string, sectionId: string) => void;
}

interface Entry {
  topicId: string;
  firstSectionId: string;
  title: string;
  categoryId: string;
  categoryLabel: string;
  haystack: string;
}

export function SearchModal({ open, onClose, onNavigate }: Props) {
  const { lang } = useLang();
  const uiText = useUi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  // -1 = nothing highlighted yet (so typing alone never selects a row).
  const [active, setActive] = useState(-1);

  // One entry per topic; we match on the topic title only.
  const entries = useMemo<Entry[]>(() => {
    const catLabel = (catId: string) => {
      const cat = categories.find((c) => c.id === catId);
      return cat ? t(cat.label, lang) : '';
    };
    return topics.map((topic) => {
      const title = t(topic.title, lang);
      return {
        topicId: topic.id,
        firstSectionId: topic.sections[0].id,
        title,
        categoryId: topic.category,
        categoryLabel: catLabel(topic.category),
        haystack: title.toLowerCase(),
      };
    });
  }, [lang]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    const terms = q.split(/\s+/);
    return entries.filter((e) => terms.every((term) => e.haystack.includes(term)));
  }, [query, entries]);

  // Reset state each time the modal opens and focus the input.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(-1);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Typing changes the result set: clear any highlight so nothing is preselected.
  useEffect(() => {
    setActive(-1);
  }, [query]);

  const choose = (e: Entry) => {
    onNavigate(e.topicId, e.firstSectionId);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Only open when a row is explicitly highlighted (via arrows or hover).
      if (active >= 0 && results[active]) choose(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={onClose}
        >
          <motion.div
            className="search-modal"
            role="dialog"
            aria-modal="true"
            aria-label={uiText('search')}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="search-modal__field">
              <svg className="search-modal__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                className="search-modal__input"
                type="text"
                value={query}
                placeholder={uiText('searchPlaceholder')}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="search-modal__esc">Esc</kbd>
            </div>

            <div className="search-modal__results">
              {results.length === 0 ? (
                <div className="search-modal__empty">{uiText('searchEmpty')}</div>
              ) : (
                <ul>
                  {results.map((e, i) => (
                    <li key={e.topicId}>
                      <button
                        className={`search-result ${i === active ? 'search-result--active' : ''}`}
                        onMouseEnter={() => setActive(i)}
                        onMouseLeave={() => setActive(-1)}
                        onClick={() => choose(e)}
                      >
                        <span className="search-result__main">{e.title}</span>
                        <span className={`search-result__tag search-result__tag--${e.categoryId}`}>
                          {e.categoryLabel}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
