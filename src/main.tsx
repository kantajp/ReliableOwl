import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';
import App from './App.tsx';
import { LangProvider } from './i18n.tsx';
import { migrateLegacyHash } from './router';

// Turn old "/#topic" links into "/topic" before the first render.
migrateLegacyHash();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </StrictMode>,
);
