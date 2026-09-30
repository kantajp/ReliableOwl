import { LangToggle } from './LangToggle';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../useTheme';

// Fixed language + theme controls in the top-right corner, shown on every view.
export function TopBar({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <div className="topbar">
      <LangToggle />
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </div>
  );
}
