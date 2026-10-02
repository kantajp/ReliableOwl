// SQL injection diagrams.
//  - SqliConcat:      login input concatenated into a SQL string. Toggle a normal
//                     input vs. a malicious one and see the quote close the string
//                     so the rest of the input runs as SQL.
//  - SqliPlaceholder: parameterized query as a sequence: the SQL shape is sent
//                     first, values are sent separately and only ever fill `?`.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useState } from 'react';
import { DiagramFrame } from './primitives';
import { useLang } from '../i18n';

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useTr() {
  const { lang } = useLang();
  return (ja: string, en: string) => (lang === 'ja' ? ja : en);
}

const MONO = 'var(--font-mono)';

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button className={active ? 'btn' : 'btn btn--ghost'} aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
}

// Mono text is laid out by character count so highlight boxes line up with it.
// JetBrains Mono / SF Mono advance ≈ 0.6em.
const charW = (fontSize: number) => fontSize * 0.6;

type SegKind = 'code' | 'value' | 'inject';
interface Seg {
  text: string;
  kind: SegKind;
}

const SEG_FILL: Record<SegKind, string> = {
  code: 'none',
  value: 'var(--accent-soft)',
  inject: 'var(--red-soft)',
};

const SEG_TEXT: Record<SegKind, string> = {
  code: 'var(--text-muted)',
  value: 'var(--text)',
  inject: 'var(--red)',
};

// One line of mono SQL with highlighted segments. Returns x positions of each
// segment's start so callers can anchor annotations.
function SqlLine({ x, y, size, segs }: { x: number; y: number; size: number; segs: Seg[] }) {
  const cw = charW(size);
  let cursor = x;
  return (
    <g>
      {segs.map((s, i) => {
        const sx = cursor;
        const w = s.text.length * cw;
        cursor += w;
        return (
          <g key={i}>
            {s.kind !== 'code' && s.text.length > 0 && (
              <rect x={sx - 2} y={y - size - 1} width={w + 4} height={size + 9} rx={4} fill={SEG_FILL[s.kind]} />
            )}
            <text
              x={sx}
              y={y}
              fontSize={size}
              fontFamily={MONO}
              fill={SEG_TEXT[s.kind]}
              fontWeight={s.kind === 'code' ? 400 : 600}
              style={{ whiteSpace: 'pre' }}
              xmlSpace="preserve"
            >
              {s.text}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const segsWidth = (segs: Seg[], size: number) => segs.reduce((n, s) => n + s.text.length, 0) * charW(size);

// ============================================================================
// 1) SqliConcat
// ============================================================================
const C_SIZE = 16;
const C_X = 56;
const ATTACK_PW = "' OR '1'='1";
const NORMAL_PW = 's3cret';

export function SqliConcat() {
  const tr = useTr();
  const [attack, setAttack] = useState(true);
  const pw = attack ? ATTACK_PW : NORMAL_PW;

  const line1: Seg[] = [{ text: 'SELECT * FROM users', kind: 'code' }];
  const linePrefix: Seg[] = [
    { text: "WHERE name = '", kind: 'code' },
    { text: 'alice', kind: 'value' },
    { text: "' AND password = '", kind: 'code' },
  ];
  const line2: Seg[] = [
    ...linePrefix,
    { text: pw, kind: attack ? 'inject' : 'value' },
    { text: "'", kind: 'code' },
  ];
  // x where the password input starts in line 2 (annotation anchor)
  const pwX = C_X + segsWidth(linePrefix, C_SIZE);
  const tone = attack ? 'var(--red)' : 'var(--green)';

  return (
    <DiagramFrame
      height={360}
      controls={
        <>
          <ToggleButton active={!attack} onClick={() => setAttack(false)} label={tr('普通の入力', 'Normal input')} />
          <ToggleButton active={attack} onClick={() => setAttack(true)} label={tr('攻撃の入力', 'Malicious input')} />
        </>
      }
      caption={tr(
        '入力を文字列で連結すると、入力の中の \' が文字列を閉じ、残りが SQL の命令になる',
        "Concatenating input lets a ' inside it close the string, so the rest runs as SQL",
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 420"
        width="100%"
        role="img"
        aria-label={tr(
          'ログインフォームの入力が SQL 文字列に連結され、攻撃の入力では条件が常に真になる図',
          'Login form input concatenated into a SQL string; with malicious input the condition is always true',
        )}
      >
        {/* ---- login form ---- */}
        <text x={40} y={36} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('ログインフォーム', 'Login form')}
        </text>
        <text x={40} y={78} fontSize={14} fill="var(--text-dim)" fontFamily={MONO}>name</text>
        <rect x={110} y={56} width={200} height={34} rx={8} fill="var(--surface)" stroke="var(--border-strong)" />
        <text x={124} y={79} fontSize={15} fontFamily={MONO} fill="var(--text)">alice</text>

        <text x={350} y={78} fontSize={14} fill="var(--text-dim)" fontFamily={MONO}>password</text>
        <rect x={446} y={56} width={334} height={34} rx={8} fill="var(--surface)" stroke={attack ? 'var(--red)' : 'var(--border-strong)'} strokeWidth={attack ? 1.5 : 1} />
        <text x={460} y={79} fontSize={15} fontFamily={MONO} fill={attack ? 'var(--red)' : 'var(--text)'} fontWeight={600} xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
          {pw}
        </text>

        {/* ---- concat arrow ---- */}
        <line x1={410} y1={102} x2={410} y2={138} stroke="var(--border-strong)" strokeWidth={1.5} />
        <path d="M404 132 L410 142 L416 132" fill="none" stroke="var(--border-strong)" strokeWidth={1.5} />
        <text x={426} y={126} fontSize={13} fill="var(--text-muted)">
          {tr('そのまま文字列として連結', 'concatenated as plain text')}
        </text>

        {/* ---- built SQL ---- */}
        <rect x={32} y={150} width={756} height={112} rx={12} fill="var(--bg-panel)" stroke="var(--border)" />
        <text x={44} y={170} fontSize={12} fill="var(--text-dim)">{tr('組み立てられた SQL', 'resulting SQL')}</text>
        <SqlLine x={C_X} y={204} size={C_SIZE} segs={line1} />
        <SqlLine x={C_X} y={240} size={C_SIZE} segs={line2} />

        {/* ---- annotation under the password part ---- */}
        <line x1={pwX} y1={268} x2={pwX} y2={284} stroke={tone} strokeWidth={1.5} />
        <text x={pwX} y={302} fontSize={14} fontWeight={600} fill={tone} textAnchor="middle">
          {attack
            ? tr("最初の ' で文字列が閉じ、残りが命令になる", "the first ' closes the string; the rest becomes SQL")
            : tr("入力は ' ' の中に値として収まる", "the input stays inside the quotes as a value")}
        </text>

        {/* ---- evaluation ---- */}
        <rect x={32} y={326} width={756} height={78} rx={12} fill={attack ? 'var(--red-soft)' : 'var(--green-soft)'} />
        <text x={52} y={356} fontSize={15} fontFamily={MONO} fill={tone} fontWeight={600} xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
          {attack ? "(… AND password = '') OR '1'='1'  →  " : "name = 'alice' AND password = 's3cret'  →  "}
          <tspan fontFamily="var(--font-sans)">{attack ? tr('常に真', 'always true') : tr('両方一致した行だけ', 'only the matching row')}</tspan>
        </text>
        <text x={52} y={386} fontSize={14} fill="var(--text)">
          {attack
            ? tr('全ユーザーの行が一致し、パスワードを知らなくてもログインできてしまう', 'Every user row matches, so anyone can log in without the password')
            : tr('パスワードが正しいときだけログインできる', 'Login succeeds only with the correct password')}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) SqliPlaceholder
// ============================================================================
const P_APP_X = 110;
const P_DB_X = 710;
const P_MID = (P_APP_X + P_DB_X) / 2;
const P_SIZE = 14;

function Arrow({ y, from, to, color }: { y: number; from: number; to: number; color: string }) {
  const dir = to > from ? 1 : -1;
  return (
    <g stroke={color} strokeWidth={1.75} fill="none">
      <line x1={from} y1={y} x2={to - dir * 2} y2={y} />
      <path d={`M${to - dir * 10} ${y - 6} L${to} ${y} L${to - dir * 10} ${y + 6}`} />
    </g>
  );
}

// A value chip: always drawn as a literal, never as code.
function Chip({ x, y, text, size = P_SIZE }: { x: number; y: number; text: string; size?: number }) {
  const w = text.length * charW(size) + 20;
  return (
    <g>
      <rect x={x} y={y - size - 4} width={w} height={size + 14} rx={7} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1} />
      <text x={x + 10} y={y + 1} fontSize={size} fontFamily={MONO} fill="var(--text)" fontWeight={600} xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
        {text}
      </text>
    </g>
  );
}
const chipW = (text: string, size = P_SIZE) => text.length * charW(size) + 20;

export function SqliPlaceholder() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [attack, setAttack] = useState(true);
  const [step, setStep] = useState(4);
  const [play, setPlay] = useState(0);
  const pw = attack ? ATTACK_PW : NORMAL_PW;

  useEffect(() => {
    if (reduced) {
      setStep(4);
      return;
    }
    setStep(0);
    const ids = [1, 2, 3, 4].map((s) => setTimeout(() => setStep(s), s * 900));
    return () => ids.forEach(clearTimeout);
  }, [play, attack, reduced]);

  const show = (s: number) => ({
    opacity: step >= s ? 1 : 0,
    transition: reduced ? 'none' : 'opacity 0.45s ease',
  });

  const template = 'SELECT * FROM users WHERE name = ? AND password = ?';
  const templateW = template.length * charW(P_SIZE);

  // ③ filled view: name = [alice] AND password = [pw]
  const fillA = 'name = ';
  const fillB = ' AND password = ';
  const fillW =
    (fillA.length + fillB.length) * charW(P_SIZE) + chipW('alice') + chipW(pw);
  const fillX = P_MID - fillW / 2;
  const chip1X = fillX + fillA.length * charW(P_SIZE);
  const midTextX = chip1X + chipW('alice');
  const chip2X = midTextX + fillB.length * charW(P_SIZE);

  const valuesW = chipW('alice') + 16 + chipW(pw);
  const valuesX = P_MID - valuesW / 2;

  const resultTone = attack ? 'var(--green)' : 'var(--accent)';

  return (
    <DiagramFrame
      height={380}
      onReplay={() => setPlay((p) => p + 1)}
      controls={
        <>
          <ToggleButton active={!attack} onClick={() => setAttack(false)} label={tr('普通の入力', 'Normal input')} />
          <ToggleButton active={attack} onClick={() => setAttack(true)} label={tr('攻撃の入力', 'Malicious input')} />
        </>
      }
      caption={tr(
        'SQL の形が先に確定するので、あとから来る入力は ? に入る「値」としてしか扱われない',
        'The SQL shape is fixed first, so input that arrives later can only ever fill a ? as a value',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 440"
        width="100%"
        role="img"
        aria-label={tr(
          'アプリがまず ? 付きの SQL を送り、次に値だけを別に送る。攻撃の入力もただの文字列として扱われ、ログインは失敗する',
          'The app first sends SQL with ? placeholders, then sends the values separately. Malicious input is treated as a plain string and the login fails',
        )}
      >
        {/* participants */}
        {[
          { x: P_APP_X, label: tr('アプリ', 'App') },
          { x: P_DB_X, label: tr('データベース', 'Database') },
        ].map((p) => (
          <g key={p.x}>
            <rect x={p.x - 70} y={20} width={140} height={42} rx={10} fill="var(--surface)" stroke="var(--border-strong)" />
            <text x={p.x} y={47} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--text)">{p.label}</text>
            <line x1={p.x} y1={62} x2={p.x} y2={420} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="4 5" />
          </g>
        ))}

        {/* ① shape */}
        <g style={show(1)}>
          <text x={P_APP_X + 16} y={98} fontSize={14} fontWeight={600} fill="var(--text)">
            {tr('① SQL の形だけを送る', '① send only the shape of the SQL')}
          </text>
          <Arrow y={112} from={P_APP_X} to={P_DB_X} color="var(--text-muted)" />
          <text x={P_MID - templateW / 2} y={140} fontSize={P_SIZE} fontFamily={MONO} fill="var(--text-muted)">
            {template}
          </text>
        </g>

        {/* DB fixes the shape */}
        <g style={show(2)}>
          <text x={P_DB_X - 14} y={172} textAnchor="end" fontSize={13} fontWeight={600} fill="var(--green)">
            {tr('構文を解析し、命令の形をここで確定', 'parsed: the command is fixed here')}
          </text>
        </g>

        {/* ② values */}
        <g style={show(3)}>
          <text x={P_APP_X + 16} y={216} fontSize={14} fontWeight={600} fill="var(--text)">
            {tr('② 値は別に送る', '② send the values separately')}
          </text>
          <Arrow y={230} from={P_APP_X} to={P_DB_X} color="var(--accent)" />
          <Chip x={valuesX} y={262} text="alice" />
          <Chip x={valuesX + chipW('alice') + 16} y={262} text={pw} />
        </g>

        {/* ③ filled + ④ result */}
        <g style={show(4)}>
          <text x={P_DB_X - 14} y={306} textAnchor="end" fontSize={13} fill="var(--text-muted)">
            {tr('③ 値は ? にただの文字として入る', '③ each value fills a ? as plain text')}
          </text>
          <text x={fillX} y={338} fontSize={P_SIZE} fontFamily={MONO} fill="var(--text-muted)" xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
            {fillA}
          </text>
          <Chip x={chip1X} y={338} text="alice" />
          <text x={midTextX} y={338} fontSize={P_SIZE} fontFamily={MONO} fill="var(--text-muted)" xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>
            {fillB}
          </text>
          <Chip x={chip2X} y={338} text={pw} />

          <Arrow y={384} from={P_DB_X} to={P_APP_X} color={resultTone} />
          <text x={P_MID} y={410} textAnchor="middle" fontSize={14} fontWeight={600} fill={resultTone}>
            {attack
              ? tr(`パスワードが「${ATTACK_PW}」の行はない → ログイン失敗（安全）`, `no row has the password "${ATTACK_PW}" → login fails (safe)`)
              : tr('両方一致した行を返す → ログイン成功', 'returns the matching row → login succeeds')}
          </text>
        </g>
      </svg>
    </DiagramFrame>
  );
}
