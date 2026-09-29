import { useLang } from '../i18n';

const GlobeIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.5 3.8 5.8 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.8-3.8-9s1.3-6.5 3.8-9z" />
  </svg>
);

export function LangToggle() {
  const { lang, toggle } = useLang();
  const next = lang === 'ja' ? 'English' : '日本語';
  return (
    <button
      className="lang-globe"
      onClick={toggle}
      aria-label={`Switch to ${next}`}
      title={`Switch to ${next}`}
    >
      {GlobeIcon}
    </button>
  );
}
