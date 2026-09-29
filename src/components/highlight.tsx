// Minimal, dependency-free JS/TS syntax highlighter.
// Tokenizes in a single pass and returns React spans (no dangerouslySetInnerHTML).
// Scoped to the small JavaScript snippets used in this app.
import type { ReactNode } from 'react';

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'new', 'class', 'extends',
  'this', 'typeof', 'instanceof', 'in', 'of', 'null', 'undefined', 'true',
  'false', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'import',
  'export', 'from', 'default',
]);

// Ordered token patterns. `func` is a name immediately followed by "(".
const TOKEN_RE = new RegExp(
  [
    '(?<comment>//[^\\n]*|/\\*[\\s\\S]*?\\*/)', // line or block comment
    '(?<string>"(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`)', // strings
    '(?<number>\\b\\d+(?:\\.\\d+)?\\b)', // numbers
    '(?<func>[A-Za-z_$][\\w$]*)(?=\\s*\\()', // identifier before (
    '(?<ident>[A-Za-z_$][\\w$]*)', // other identifiers (may be keywords)
    '(?<ws>\\s+)', // whitespace
    '(?<other>[^]{1})', // any single remaining char
  ].join('|'),
  'gy',
);

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;

  while ((m = TOKEN_RE.exec(code)) !== null) {
    const g = m.groups!;
    if (g.comment !== undefined) {
      out.push(<span key={key++} className="tok-comment">{g.comment}</span>);
    } else if (g.string !== undefined) {
      out.push(<span key={key++} className="tok-string">{g.string}</span>);
    } else if (g.number !== undefined) {
      out.push(<span key={key++} className="tok-number">{g.number}</span>);
    } else if (g.func !== undefined) {
      // A function-call name, unless it's actually a keyword like `if (`.
      if (KEYWORDS.has(g.func)) {
        out.push(<span key={key++} className="tok-keyword">{g.func}</span>);
      } else {
        out.push(<span key={key++} className="tok-func">{g.func}</span>);
      }
    } else if (g.ident !== undefined) {
      if (KEYWORDS.has(g.ident)) {
        out.push(<span key={key++} className="tok-keyword">{g.ident}</span>);
      } else {
        out.push(g.ident);
      }
    } else {
      // whitespace or other punctuation — emit as plain text
      out.push(m[0]);
    }
    // Guard against zero-length matches (shouldn't happen with the `other` fallback)
    if (m.index === TOKEN_RE.lastIndex) TOKEN_RE.lastIndex++;
  }
  return out;
}
