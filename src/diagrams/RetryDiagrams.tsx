// Retries, timeouts & backoff diagrams for the YouTube client → backend example.
//  - RetryStorm:   why retries need jitter — a synchronized "retry storm" vs a
//                  jittered, backed-off tail that stays under server capacity.
//  - BackoffLadder: one client's retry sequence — timeout blocks, exponential
//                  jittered waits, a success, and a depleting retry budget.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useRef, useState, useId, type CSSProperties } from 'react';
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

// Toggle button: active = filled accent ".btn", inactive = ".btn btn--ghost".
function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button className={active ? 'btn' : 'btn btn--ghost'} aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
}

// Deterministic PRNG (mulberry32) so jittered layouts are stable across renders.
function makeRng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// 1) RetryStorm
// ============================================================================
type StormMode = 'none' | 'jitter';

const S_VIEW_W = 820;
const S_VIEW_H = 360;
const S_X0 = 64; // chart left
const S_X1 = 788; // chart right
const S_BASE_Y = 286; // baseline (0 req)
const S_TOP_Y = 70; // clamp ceiling for bars
const S_T_MAX = 10; // seconds on the axis
const S_BUCKET = 0.25; // seconds per bar
const S_N_BUCKETS = Math.round(S_T_MAX / S_BUCKET); // 40
const S_CLIENTS = 24;
const S_CAPACITY = 14; // requests/bucket the server can take
const S_NORMAL = 4; // steady background load per bucket
const S_UNIT = 13; // px per request (bar height scale)

const sx = (t: number) => S_X0 + (t / S_T_MAX) * (S_X1 - S_X0);
const sBarW = ((S_X1 - S_X0) / S_N_BUCKETS) * 0.72;
const sHeight = (reqs: number) => Math.min(reqs * S_UNIT, S_BASE_Y - S_TOP_Y);

// Build per-bucket request counts for each mode. Background load everywhere,
// a blip that drops the backend at t≈1s, then first-retry failures bunch up.
const STORM_SERIES: Record<StormMode, number[]> = (() => {
  const none = new Array<number>(S_N_BUCKETS).fill(S_NORMAL);
  const jitter = new Array<number>(S_N_BUCKETS).fill(S_NORMAL);
  const rng = makeRng(0x5e71);

  // "no jitter": every failed client retries at the SAME instants.
  // 1st wave of retries at ~2s, 2nd (survivors) at ~4s — tall synchronized spikes.
  const idx2s = Math.round(2 / S_BUCKET);
  const idx4s = Math.round(4 / S_BUCKET);
  none[idx2s] += S_CLIENTS; // all 24 retry at once
  none[idx4s] += Math.round(S_CLIENTS * 0.55); // ~13 still failing retry together

  // "jitter + backoff": spread each client's retry across a decaying window.
  // Wave 1 over ~2..5s, wave 2 (fewer) over ~4.5..8s — low, smooth tail.
  const spread = (count: number, from: number, to: number) => {
    for (let i = 0; i < count; i++) {
      const t = from + rng() * (to - from);
      const b = Math.min(S_N_BUCKETS - 1, Math.max(0, Math.round(t / S_BUCKET)));
      jitter[b] += 1;
    }
  };
  spread(S_CLIENTS, 2.0, 5.2);
  spread(Math.round(S_CLIENTS * 0.5), 4.4, 8.2);

  return { none, jitter };
})();

export function RetryStorm() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<StormMode>('jitter');
  const [playKey, setPlayKey] = useState(0);
  const [progress, setProgress] = useState(reduced ? 1 : 0);
  const uid = useId().replace(/:/g, '');

  // Animate the chart drawing in left→right over ~4s. Restart on mode/replay.
  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    setProgress(0);
    let raf = 0;
    let start: number | null = null;
    const DUR = 4000;
    const step = (now: number) => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / DUR);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, mode, playKey]);

  const series = STORM_SERIES[mode];
  const revealT = progress * S_T_MAX; // seconds revealed so far
  const capY = S_BASE_Y - sHeight(S_CAPACITY);
  const spikesOver = mode === 'none';
  const labelTone = spikesOver ? 'var(--red)' : 'var(--green)';

  return (
    <DiagramFrame
      height={320}
      onReplay={() => setPlayKey((k) => k + 1)}
      caption={tr(
        'ジッターがないと再送が同じ瞬間に重なり、サーバーをもう一度倒す',
        'Without jitter, retries line up at the same instant and knock the server over again',
      )}
      controls={
        <>
          <ToggleButton active={mode === 'none'} onClick={() => setMode('none')} label={tr('ジッターなし', 'no jitter')} />
          <ToggleButton active={mode === 'jitter'} onClick={() => setMode('jitter')} label={tr('ジッター + バックオフ', 'jitter + backoff')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${S_VIEW_W} ${S_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          `${S_CLIENTS}台のクライアントの再送タイミングを、ジッター有無で比較した棒グラフ`,
          `Bar chart comparing retry timing of ${S_CLIENTS} clients with and without jitter`,
        )}
      >
        <defs>
          <clipPath id={`${uid}-reveal`}>
            <rect x={S_X0 - sBarW} y={0} width={Math.max(0, sx(revealT) - (S_X0 - sBarW))} height={S_VIEW_H} />
          </clipPath>
        </defs>

        {/* header */}
        <text x={40} y={34} fontSize={16} fontWeight={700} fill="var(--text)">
          <tspan fill="var(--accent)" fontFamily={MONO}>{S_CLIENTS}</tspan>
          <tspan>{tr(' 台のクライアント · 0.25秒ごとのリクエスト数', ' clients · requests per 0.25s')}</tspan>
        </text>
        <text x={40} y={54} fill="var(--text-dim)" fontSize={12}>
          {tr('t≈1s でバックエンドが一瞬ダウン → 最初の呼び出しが失敗して全員が再送', 't≈1s: the backend blips → first calls fail, so everyone retries')}
        </text>

        {/* y axis frame + baseline */}
        <line x1={S_X0} y1={S_TOP_Y} x2={S_X0} y2={S_BASE_Y} stroke="var(--border)" />
        <line x1={S_X0} y1={S_BASE_Y} x2={S_X1} y2={S_BASE_Y} stroke="var(--border-strong)" strokeWidth={1.5} />

        {/* normal load reference line */}
        <line
          x1={S_X0}
          y1={S_BASE_Y - sHeight(S_NORMAL)}
          x2={S_X1}
          y2={S_BASE_Y - sHeight(S_NORMAL)}
          className="hn-edge hn-edge--dashed"
          opacity={0.5}
        />
        <text x={S_X1} y={S_BASE_Y - sHeight(S_NORMAL) - 6} textAnchor="end" fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
          {tr('通常の負荷', 'normal load')}
        </text>

        {/* server capacity line */}
        <line x1={S_X0} y1={capY} x2={S_X1} y2={capY} stroke="var(--amber)" strokeWidth={2} strokeDasharray="6 4" />
        <text x={S_X0 + 8} y={capY - 7} fill="var(--amber)" fontSize={12} fontWeight={700} fontFamily={MONO}>
          {tr('サーバーの容量', 'server capacity')}
        </text>

        {/* bars (revealed left→right via clip) */}
        <g clipPath={`url(#${uid}-reveal)`}>
          {series.map((reqs, i) => {
            const t = i * S_BUCKET;
            const h = sHeight(reqs);
            const over = reqs > S_CAPACITY;
            const cx = sx(t + S_BUCKET / 2);
            const fill = over ? 'var(--red-soft)' : 'var(--green-soft)';
            const stroke = over ? 'var(--red)' : 'var(--green)';
            return (
              <rect
                key={i}
                x={cx - sBarW / 2}
                y={S_BASE_Y - h}
                width={sBarW}
                height={h}
                rx={2}
                fill={fill}
                stroke={stroke}
                strokeWidth={over ? 1.25 : 1}
              />
            );
          })}
        </g>

        {/* x ticks */}
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={S_BASE_Y} x2={sx(t)} y2={S_BASE_Y + 6} stroke="var(--border-strong)" />
            <text x={sx(t)} y={S_BASE_Y + 22} textAnchor="middle" fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
              {t}s
            </text>
          </g>
        ))}

        {/* mode verdict label — parked in the empty top-right area (after ~5.8s),
            clear of the spikes (which sit at 2s/4s) and the capacity/normal lines */}
        {(() => {
          const text = spikesOver ? tr('再送の集中（雪崩）', 'retry storm') : tr('平準化されて吸収', 'spread out and absorbed');
          // Approximate glyph widths at 13px: full-width (CJK) ≈ 13px, others ≈ 7px.
          const glyphs = [...text].reduce((sum, ch) => sum + (/[\x00-\xff]/.test(ch) ? 7 : 13), 0);
          const w = glyphs + 44;
          const lx0 = S_X1 - w;
          const ly0 = S_TOP_Y - 4;
          return (
            <g style={{ '--tone': labelTone } as CSSProperties}>
              <rect x={lx0} y={ly0} width={w} height={30} rx={8} fill={spikesOver ? 'var(--red-soft)' : 'var(--green-soft)'} stroke={labelTone} />
              <circle cx={lx0 + 16} cy={ly0 + 15} r={4} className="hn-node__dot" />
              <text x={lx0 + 28} y={ly0 + 20} fill={labelTone} fontSize={13} fontWeight={700}>
                {text}
              </text>
            </g>
          );
        })()}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) BackoffLadder
// ============================================================================
const B_VIEW_W = 820;
const B_VIEW_H = 300;
const B_X0 = 60;
const B_X1 = 788;
const B_T_MAX = 6; // seconds (sequence ends ~4.7s; a tighter axis widens the blocks)
const bx = (t: number) => B_X0 + (t / B_T_MAX) * (B_X1 - B_X0);
const B_LANE_Y = 150;
const B_LANE_H = 54;
const B_BUDGET_TOTAL = 3;

interface Attempt {
  n: number;
  start: number; // seconds
  dur: number; // timeout window length (seconds)
  outcome: 'timeout' | 'success';
  successAt?: number; // fraction of dur where ✓ lands
}
interface Wait {
  from: number;
  to: number;
  label: string; // base label like "~0.5s"
}

// Fixed, jittered sequence (seeded) — stable across renders.
const BACKOFF = (() => {
  const timeout = 1; // 1s timeout window
  const attempts: Attempt[] = [];
  const waits: Wait[] = [];
  let t = 0;
  // Attempt 1 → timeout; wait ~0.5s; Attempt 2 → timeout; wait ~1s; Attempt 3 → success.
  attempts.push({ n: 1, start: t, dur: timeout, outcome: 'timeout' });
  t += timeout;
  waits.push({ from: t, to: t + 0.5, label: '~0.5s' });
  t += 0.5;
  attempts.push({ n: 2, start: t, dur: timeout, outcome: 'timeout' });
  t += timeout;
  waits.push({ from: t, to: t + 1, label: '~1s' });
  t += 1;
  attempts.push({ n: 3, start: t, dur: timeout, outcome: 'success', successAt: 0.6 });
  return { attempts, waits, timeout };
})();

// Playhead end = a little past the success point.
const B_END_T = (() => {
  const a = BACKOFF.attempts[BACKOFF.attempts.length - 1];
  return a.start + a.dur * (a.successAt ?? 1) + 0.6;
})();

export function BackoffLadder() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [playKey, setPlayKey] = useState(0);
  const [progress, setProgress] = useState(reduced ? 1 : 0);
  const uid = useId().replace(/:/g, '');
  const headRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    setProgress(0);
    let raf = 0;
    let start: number | null = null;
    const DUR = 5000;
    const step = (now: number) => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / DUR);
      headRef.current = p;
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, playKey]);

  const headT = progress * B_END_T;

  // Retries used so far = number of RE-tries (attempts after the first) that
  // have started by the playhead.
  const retriesUsed = BACKOFF.attempts.filter((a) => a.n > 1 && a.start <= headT + 1e-6).length;
  const retriesLeft = B_BUDGET_TOTAL - retriesUsed;

  const laneMid = B_LANE_Y + B_LANE_H / 2;

  return (
    <DiagramFrame
      height={300}
      onReplay={() => setPlayKey((k) => k + 1)}
      caption={tr(
        '試行ごとに待ち時間を倍にし、ジッターでばらす。回数は必ず上限で打ち切る',
        'Double the wait each attempt, scatter it with jitter, and always cap the number of retries',
      )}
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${B_VIEW_W} ${B_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          '1台のクライアントの再試行列。タイムアウト、指数バックオフの待機、成功、リトライ予算を示す',
          "One client's retry sequence showing timeouts, exponential backoff waits, success and a retry budget",
        )}
      >
        <defs>
          <clipPath id={`${uid}-play`}>
            <rect x={0} y={0} width={bx(headT)} height={B_VIEW_H} />
          </clipPath>
        </defs>

        {/* header + backoff formula */}
        <text x={40} y={32} fontSize={16} fontWeight={700} fill="var(--text)">
          {tr('1台のクライアント → バックエンド', 'one client → backend')}
        </text>
        <text x={40} y={56} fill="var(--text-muted)" fontSize={13} fontFamily={MONO}>
          wait = min(cap, base · 2^attempt) ± jitter
        </text>

        {/* retry budget meter */}
        <g>
          <text x={B_X1} y={32} textAnchor="end" fill="var(--text-dim)" fontSize={12}>
            {tr('リトライ予算', 'retry budget')}
          </text>
          {Array.from({ length: B_BUDGET_TOTAL }).map((_, i) => {
            const spent = i >= retriesLeft;
            const w = 22;
            const gap = 7;
            const x = B_X1 - (B_BUDGET_TOTAL - i) * (w + gap) + gap;
            return (
              <rect
                key={i}
                x={x}
                y={42}
                width={w}
                height={12}
                rx={3}
                fill={spent ? 'var(--surface)' : 'var(--accent)'}
                stroke={spent ? 'var(--border-strong)' : 'var(--accent)'}
                opacity={spent ? 0.6 : 1}
                style={{ transition: reduced ? 'none' : 'fill 300ms, opacity 300ms' }}
              />
            );
          })}
          <text x={B_X1} y={74} textAnchor="end" fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
            {tr(`残り ${retriesLeft} / ${B_BUDGET_TOTAL}`, `retries: ${retriesLeft} / ${B_BUDGET_TOTAL}`)}
          </text>
        </g>

        {/* lane baseline */}
        <line x1={B_X0} y1={laneMid} x2={B_X1} y2={laneMid} stroke="var(--border)" />

        <g clipPath={`url(#${uid}-play)`}>
          {/* waits (gaps) */}
          {BACKOFF.waits.map((w, i) => {
            const x1 = bx(w.from);
            const x2 = bx(w.to);
            const midX = (x1 + x2) / 2;
            return (
              <g key={`w${i}`}>
                <line x1={x1} y1={laneMid} x2={x2} y2={laneMid} stroke="var(--text-dim)" strokeWidth={2} strokeDasharray="3 4" />
                <path d={`M ${x1} ${laneMid - 5} V ${laneMid + 5} M ${x2} ${laneMid - 5} V ${laneMid + 5}`} stroke="var(--text-dim)" strokeWidth={1.5} />
                <text x={midX} y={B_LANE_Y + B_LANE_H + 40} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                  {tr(`待機 ${w.label}`, `wait ${w.label}`)}
                </text>
              </g>
            );
          })}

          {/* attempt blocks */}
          {BACKOFF.attempts.map((a) => {
            const x = bx(a.start);
            const w = bx(a.start + a.dur) - x;
            const ok = a.outcome === 'success';
            const endFrac = ok ? (a.successAt ?? 1) : 1;
            const endX = bx(a.start + a.dur * endFrac);
            const tone = ok ? 'var(--green)' : 'var(--red)';
            const soft = ok ? 'var(--green-soft)' : 'var(--red-soft)';
            return (
              <g key={`a${a.n}`}>
                {/* full timeout window outline */}
                <rect x={x} y={B_LANE_Y} width={w} height={B_LANE_H} rx={8} fill={soft} stroke={tone} strokeWidth={1.5} />
                <text x={x + 10} y={B_LANE_Y + 20} fill="var(--text)" fontSize={12} fontWeight={700} fontFamily={MONO}>
                  {tr(`試行 ${a.n}`, `attempt ${a.n}`)}
                </text>
                <text x={x + 10} y={B_LANE_Y + 38} fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                  {tr('タイムアウト 1s', 'timeout 1s')}
                </text>

                {/* outcome marker */}
                <g style={{ '--tone': tone } as CSSProperties}>
                  <circle cx={endX} cy={B_LANE_Y - 14} r={11} fill={soft} stroke={tone} strokeWidth={1.5} />
                  <text x={endX} y={B_LANE_Y - 10} textAnchor="middle" fill={tone} fontSize={14} fontWeight={700}>
                    {ok ? '✓' : '✕'}
                  </text>
                  <circle cx={endX} cy={B_LANE_Y + B_LANE_H + 2} r={3.5} className="hn-node__dot" />
                  <text x={endX} y={B_LANE_Y + B_LANE_H + 22} textAnchor="middle" fill={tone} fontSize={12} fontWeight={700} fontFamily={MONO}>
                    {ok ? tr('成功 200 OK', 'success 200 OK') : tr('timeout', 'timeout')}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* time axis */}
        <line x1={B_X0} y1={B_VIEW_H - 42} x2={B_X1} y2={B_VIEW_H - 42} stroke="var(--border-strong)" />
        {[0, 1, 2, 3, 4, 5, 6].map((t) => (
          <g key={t}>
            <line x1={bx(t)} y1={B_VIEW_H - 42} x2={bx(t)} y2={B_VIEW_H - 36} stroke="var(--border-strong)" />
            <text x={bx(t)} y={B_VIEW_H - 22} textAnchor="middle" fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
              {t}s
            </text>
          </g>
        ))}

        {/* playhead */}
        {!reduced && progress < 1 && (
          <line x1={bx(headT)} y1={70} x2={bx(headT)} y2={B_VIEW_H - 42} stroke="var(--accent)" strokeWidth={1.5} opacity={0.8} />
        )}
      </svg>
    </DiagramFrame>
  );
}
