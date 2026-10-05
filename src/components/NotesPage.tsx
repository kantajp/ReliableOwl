import { useEffect } from 'react';
import type { Note } from '../data/notes';
import { visibleNotes } from '../visibleNotes';
import { BlockView } from './Content';
import { SocialLinks } from './SocialLinks';
import { formatDate } from '../formatDate';
import { t, useLang, useUi } from '../i18n';
import '../home.css';

// One row in a notes list (Notes page and the home page). Same index-row
// pattern as the home topic list, linking to /notes/<id>.
export function NoteRow({ note }: { note: Note }) {
  const { lang } = useLang();
  return (
    <li>
      <a className="ed-row" href={`/notes/${note.id}`}>
        <span className="ed-row__main">
          <span className="ed-row__title">
            {t(note.title, lang)}
            {note.draft && <span className="notes__draft">Draft</span>}
          </span>
          <span className="ed-row__desc">{t(note.summary, lang)}</span>
        </span>
        <span className="ed-row__date">{formatDate(note.date)}</span>
        <span className="ed-row__arrow" aria-hidden="true">→</span>
      </a>
    </li>
  );
}

// Notes: /notes lists all notes, /notes/<id> shows one.
export function NotesPage({
  noteId,
  onHome,
  onOpenAbout,
}: {
  noteId: string | null;
  onHome: () => void;
  onOpenAbout: () => void;
}) {
  const { lang } = useLang();
  const uiText = useUi();
  const tr = (ja: string, en: string) => (lang === 'ja' ? ja : en);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [noteId]);

  const note = noteId ? visibleNotes.find((n) => n.id === noteId) : undefined;

  useEffect(() => {
    document.title = note ? `${t(note.title, lang)} · Reliable Owl` : 'Notes · Reliable Owl';
  }, [note, lang]);

  return (
    <main className="notes">
      <div className="notes__inner">
        {note ? (
          <>
            <a className="notes__back" href="/notes">
              ← {tr('ノート一覧', 'All notes')}
            </a>
            <article>
              <header className="note-post__head">
                <p className="note-post__date">
                  {formatDate(note.date)}
                  {note.draft && <span className="notes__draft">Draft</span>}
                </p>
                <h1 className="note-post__title">{t(note.title, lang)}</h1>
                <p className="note-post__summary">{t(note.summary, lang)}</p>
              </header>
              <div className="note-post__body">
                {note.blocks.map((b, i) => (
                  <BlockView key={i} block={b} lang={lang} />
                ))}
              </div>
            </article>
            <a className="notes__back notes__back--end" href="/notes">
              ← {tr('ノート一覧', 'All notes')}
            </a>
          </>
        ) : (
          <>
            <button className="notes__back" onClick={onHome}>
              ← {tr('ホームに戻る', 'Back to home')}
            </button>
            <header className="notes__head">
              <h1 className="notes__title">Notes</h1>
              <p className="notes__lead">
                {tr(
                  '仕事や暮らしの中で考えたことを、気ままに書き残すノートです。',
                  'Informal writing about things I think about in work and daily life.',
                )}
              </p>
            </header>
            {visibleNotes.length > 0 ? (
              <ol className="ed-list notes__list">
                {visibleNotes.map((n) => (
                  <NoteRow key={n.id} note={n} />
                ))}
              </ol>
            ) : (
              <p className="notes__empty">{tr('まだノートはありません。', 'No notes yet.')}</p>
            )}
          </>
        )}

        <footer className="ed-footer">
          <SocialLinks />
          <p>{uiText('footer')}</p>
          <button type="button" className="about-link" onClick={onOpenAbout}>
            Kanta Nakamura
            <span className="about-link__sep"> · </span>
            {uiText('viewProfile')} <span className="about-link__arrow">→</span>
          </button>
        </footer>
      </div>
    </main>
  );
}
