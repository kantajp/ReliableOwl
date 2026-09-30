import { LangToggle } from './LangToggle';
import { ThemeToggle } from './ThemeToggle';
import { useUi } from '../i18n';
import type { Theme } from '../useTheme';

// Fixed language + theme controls in the top-right corner, shown on every view.
export function TopBar({
  theme,
  onToggleTheme,
  onOpenSearch,
}: {
  theme: Theme;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
}) {
  const uiText = useUi();
  return (
    <div className="topbar">
      <button
        className="topbar__search"
        onClick={onOpenSearch}
        aria-label={uiText('search')}
        title={`${uiText('search')} (⌘K)`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>
      <LangToggle />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </div>
  );
}
