import { notes } from './data/notes';

// Notes to show in the app: drafts only in local dev, newest first.
export const visibleNotes = notes
  .filter((n) => import.meta.env.DEV || !n.draft)
  .sort((a, b) => b.date.localeCompare(a.date));
