import type { Topic } from '../data/content';
import { t, useLang, useUi } from '../i18n';

interface Props {
  topic: Topic;
  activeSectionId: string;
  onSelect: (sectionId: string) => void;
}

// "On this page" table of contents for the currently active topic
export function OnThisPage({ topic, activeSectionId, onSelect }: Props) {
  const { lang } = useLang();
  const uiText = useUi();
  return (
    <aside className="toc">
      <div className="toc__label">{uiText('onThisPage')}</div>
      <ul>
        {topic.sections.map((s) => (
          <li key={s.id}>
            <button
              className={`toc__link ${s.id === activeSectionId ? 'toc__link--active' : ''}`}
              onClick={() => onSelect(s.id)}
            >
              {t(s.title, lang)}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
