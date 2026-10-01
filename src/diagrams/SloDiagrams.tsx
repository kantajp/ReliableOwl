// SLI / SLO / SLA diagrams for the YouTube video playback example.
//  - SloLadder: one zoomed scale (99.0 … 100%) showing SLA < SLO < actual.
//  - SloNines:  interactive "nines" calculator (downtime + failures per 1B plays).
//  - SloBudget: 30-day error budget burn-down with release-policy bands.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useRef, useState, type CSSProperties } from 'react';
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

// ============================================================================
// 1) SloLadder
// ============================================================================
const L_X0 = 60;
const L_X1 = 770;
const lx = (v: number) => L_X0 + ((v - 99) / 1) * (L_X1 - L_X0);
const L_BAR_Y = 196;
const L_BAR_H = 30;
const L_BAR_BOT = L_BAR_Y + L_BAR_H;
const SLA_X = lx(99.5);
const SLO_X = lx(99.9);
const ACTUAL_SEQ = [99.95, 99.94, 99.96, 99.93, 99.97, 99.95, 99.96, 99.94];

export function SloLadder() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % ACTUAL_SEQ.length), 2400);
    return () => clearInterval(id);
  }, [reduced]);

  const actual = reduced ? 99.95 : ACTUAL_SEQ[idx];
  const pinX = lx(actual);
  const ease = reduced ? 'none' : 'transform 1.6s cubic-bezier(.4,0,.2,1)';

  return (
    <DiagramFrame
      height={320}
      caption={tr(
        'SLA（契約）< SLO（目標）< 実際の値。SLO を守れば SLA 違反の手前で気づける',
        'SLA (contract) < SLO (target) < actual. Keeping the SLO warns you well before an SLA breach',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 360"
        width="100%"
        role="img"
        aria-label={tr(
          '再生開始成功率の目盛り上に SLA 99.5%、SLO 99.9%、実際 99.95% を並べた図',
          'Playback start success rate scale with SLA 99.5%, SLO 99.9% and actual 99.95%',
        )}
      >
        {/* title */}
        <text x={40} y={40} fontSize={17} fontWeight={700} fill="var(--text)">
          <tspan fill="var(--accent)" fontFamily={MONO}>SLI</tspan>
          <tspan>{tr('  再生開始の成功率', '  playback start success rate')}</tspan>
        </text>

        {/* actual pin (above the bar) */}
        <g style={{ transform: `translateX(${pinX}px)`, transition: ease, '--tone': 'var(--green)' } as CSSProperties}>
          <rect x={-66} y={86} width={132} height={30} rx={8} fill="var(--green-soft)" stroke="var(--green)" />
          <text x={0} y={106} textAnchor="middle" fill="var(--green)" fontSize={16} fontWeight={700} fontFamily={MONO}>
            {tr(`実際 ${actual.toFixed(2)}%`, `actual ${actual.toFixed(2)}%`)}
          </text>
          <line x1={0} y1={116} x2={0} y2={L_BAR_Y} stroke="var(--green)" strokeWidth={2} strokeDasharray="4 3" />
          <circle cx={0} cy={L_BAR_Y + L_BAR_H / 2} r={6} className="hn-node__dot" />
        </g>

        {/* error budget left bracket (SLO -> actual) */}
        <g stroke="var(--green)" strokeWidth={2}>
          <line x1={SLO_X} y1={150} x2={pinX} y2={150} style={{ transition: ease }} />
          <line x1={SLO_X} y1={144} x2={SLO_X} y2={156} />
        </g>
        <text x={SLO_X - 12} y={155} textAnchor="end" fill="var(--green)" fontSize={14} fontWeight={600}>
          {tr('エラーバジェットの残り', 'error budget left')}
        </text>

        {/* zone bar */}
        <rect x={L_X0} y={L_BAR_Y} width={SLA_X - L_X0} height={L_BAR_H} fill="var(--red-soft)" />
        <rect x={SLA_X} y={L_BAR_Y} width={SLO_X - SLA_X} height={L_BAR_H} fill="var(--amber-soft)" />
        <rect x={SLO_X} y={L_BAR_Y} width={L_X1 - SLO_X} height={L_BAR_H} fill="var(--green-soft)" />
        <rect x={L_X0} y={L_BAR_Y} width={L_X1 - L_X0} height={L_BAR_H} rx={4} fill="none" stroke="var(--border-strong)" strokeWidth={1.5} />

        {/* ticks */}
        {[
          { v: 99.0, label: '99.0%', anchor: 'start' as const },
          { v: 99.5, label: '99.5%', anchor: 'middle' as const },
          { v: 99.9, label: '99.9%', anchor: 'middle' as const },
          { v: 100, label: '100%', anchor: 'end' as const },
        ].map(({ v, label, anchor }) => (
          <g key={v}>
            <line x1={lx(v)} y1={L_BAR_BOT} x2={lx(v)} y2={L_BAR_BOT + 8} stroke="var(--border-strong)" />
            <text x={lx(v)} y={L_BAR_BOT + 26} textAnchor={anchor} fill="var(--text-dim)" fontSize={13} fontFamily={MONO}>
              {label}
            </text>
          </g>
        ))}

        {/* SLA marker */}
        <line x1={SLA_X} y1={L_BAR_Y - 8} x2={SLA_X} y2={L_BAR_BOT + 6} stroke="var(--red)" strokeWidth={3} />
        <text x={SLA_X} y={L_BAR_BOT + 62} textAnchor="middle" fill="var(--red)" fontSize={17} fontWeight={700} fontFamily={MONO}>SLA 99.5%</text>
        <text x={SLA_X} y={L_BAR_BOT + 84} textAnchor="middle" fill="var(--text-muted)" fontSize={13}>
          {tr('契約（破ると返金）', 'contract — refunds if broken')}
        </text>

        {/* SLO marker */}
        <line x1={SLO_X} y1={L_BAR_Y - 8} x2={SLO_X} y2={L_BAR_BOT + 6} stroke="var(--amber)" strokeWidth={3} />
        <text x={SLO_X} y={L_BAR_BOT + 62} textAnchor="middle" fill="var(--amber)" fontSize={17} fontWeight={700} fontFamily={MONO}>SLO 99.9%</text>
        <text x={SLO_X} y={L_BAR_BOT + 84} textAnchor="middle" fill="var(--text-muted)" fontSize={13}>
          {tr('チームの目標', 'team target')}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) SloNines
// ============================================================================
const NINE_OPTIONS: { pct: number; nines: string }[] = [
  { pct: 99, nines: '2' },
  { pct: 99.5, nines: '2.5' },
  { pct: 99.9, nines: '3' },
  { pct: 99.95, nines: '3.5' },
  { pct: 99.99, nines: '4' },
  { pct: 99.999, nines: '5' },
];
const MIN_30D = 43_200;
const MIN_WEEK = 10_080;
const MIN_DAY = 1_440;

// Unavailability fraction (avoids float noise like 100 - 99.9 = 0.0999…).
const unavail = (pct: number) => Math.round((100 - pct) * 1e6) / 1e8;

function formatDuration(minutes: number, ja: boolean): string {
  if (minutes >= 60) {
    let h = Math.floor(minutes / 60);
    let m = Math.round(minutes - h * 60);
    if (m === 60) {
      h += 1;
      m = 0;
    }
    return ja ? `${h}時間${m}分` : `${h}h ${m}m`;
  }
  if (minutes >= 1) {
    const v = minutes.toFixed(1);
    return ja ? `${v}分` : `${v} min`;
  }
  const s = minutes * 60;
  const v = s >= 10 ? Math.round(s).toString() : s.toFixed(1);
  return ja ? `${v}秒` : `${v} s`;
}

// Smoothly tweens a number toward `target` (instant under reduced motion).
function useTweened(target: number, reduced: boolean, ms = 500) {
  const [val, setVal] = useState(target);
  const valRef = useRef(target);
  useEffect(() => {
    if (reduced) {
      valRef.current = target;
      setVal(target);
      return;
    }
    const from = valRef.current;
    let raf = 0;
    let start: number | null = null;
    const step = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      const v = from + (target - from) * e;
      valRef.current = v;
      setVal(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, ms]);
  return val;
}

const N_BAR_X = 110;
const N_BAR_W = 470;
const N_ROW_Y = 240;
const N_ROW_H = 22;
const N_MIN = MIN_30D * unavail(99.999);
const N_MAX = MIN_30D * unavail(99);
const N_SPAN = Math.log10(N_MAX / N_MIN);
const N_PAD = 0.25; // keeps the smallest bar visible
const barW = (m: number) => (N_BAR_W * (Math.log10(m / N_MIN) + N_PAD)) / (N_SPAN + N_PAD);

export function SloNines() {
  const { lang } = useLang();
  const ja = lang === 'ja';
  const tr = (jaText: string, en: string) => (ja ? jaText : en);
  const reduced = useReducedMotion();
  const [sel, setSel] = useState(2); // 99.9%
  const opt = NINE_OPTIONS[sel];

  // Tween in log space so each step between nines feels uniform.
  const logU = useTweened(Math.log10(unavail(opt.pct)), reduced);
  const u = Math.pow(10, logU);
  const failures = Math.round(u * 1e9);

  const cards = [
    { label: tr('30日あたり', 'per 30 days'), minutes: MIN_30D * u },
    { label: tr('1週間あたり', 'per week'), minutes: MIN_WEEK * u },
    { label: tr('1日あたり', 'per day'), minutes: MIN_DAY * u },
  ];
  const fade = reduced ? 'none' : 'fill 300ms, opacity 300ms';

  return (
    <DiagramFrame
      height={360}
      caption={tr('9 が1つ増えるごとに、許される停止時間は 1/10 になる', 'Each extra nine cuts the allowed downtime by 10×')}
      controls={NINE_OPTIONS.map((o, i) => (
        <ToggleButton key={o.pct} active={i === sel} onClick={() => setSel(i)} label={`${o.pct}%`} />
      ))}
    >
      <svg
        className="hero-net"
        viewBox="0 0 760 400"
        width="100%"
        role="img"
        aria-label={tr(
          `SLO ${opt.pct}% のときに許される停止時間と失敗回数`,
          `Allowed downtime and failed playbacks at an SLO of ${opt.pct}%`,
        )}
      >
        {/* header */}
        <text x={30} y={22} fill="var(--text-dim)" fontSize={11} fontFamily={MONO} letterSpacing={1.5}>
          {tr('SLO（再生開始の成功率）', 'SLO (playback start success)')}
        </text>
        <text x={30} y={50} fill="var(--accent)" fontSize={26} fontWeight={700} fontFamily={MONO}>
          {opt.pct}%
        </text>
        <g>
          <rect x={160} y={30} width={96} height={26} rx={13} fill="var(--accent-soft)" stroke="var(--accent)" />
          <text x={208} y={47} textAnchor="middle" fill="var(--accent)" fontSize={12} fontWeight={700} fontFamily={MONO}>
            {tr(`${opt.nines} ナイン`, `${opt.nines} nines`)}
          </text>
        </g>
        <text x={730} y={47} textAnchor="end" fill="var(--text-muted)" fontSize={12}>
          {tr('許される停止時間', 'allowed downtime')}
        </text>

        {/* downtime cards */}
        {cards.map((c, i) => {
          const x = 30 + i * 240;
          return (
            <g key={i}>
              <rect x={x} y={66} width={220} height={78} rx={12} fill="var(--surface)" stroke="var(--border-strong)" />
              <rect x={x} y={80} width={3} height={50} rx={1.5} fill="var(--accent)" />
              <text x={x + 18} y={90} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>{c.label}</text>
              <text x={x + 18} y={124} fill="var(--text)" fontSize={24} fontWeight={700} fontFamily={MONO}>
                {formatDuration(c.minutes, ja)}
              </text>
            </g>
          );
        })}

        {/* failures per 1B */}
        <rect x={30} y={158} width={700} height={40} rx={10} fill="var(--bg-elevated)" fillOpacity={0.6} stroke="var(--border)" />
        <text x={46} y={183} fill="var(--text-muted)" fontSize={12}>
          {tr('10億回の再生あたり、失敗してよい回数', 'allowed failed playbacks per 1 billion')}
        </text>
        <text x={714} y={185} textAnchor="end" fill="var(--amber)" fontSize={18} fontWeight={700} fontFamily={MONO}>
          {failures.toLocaleString('en-US')}
        </text>

        {/* log-scale comparison */}
        <text x={30} y={226} fill="var(--text-dim)" fontSize={11} fontFamily={MONO} letterSpacing={1}>
          {tr('30日あたりの許容停止時間（対数スケール）', 'allowed downtime per 30 days (log scale)')}
        </text>
        {[1, 10, 100].map((m) => {
          const x = N_BAR_X + barW(m);
          return (
            <g key={m}>
              <line
                x1={x}
                y1={N_ROW_Y - 4}
                x2={x}
                y2={N_ROW_Y + NINE_OPTIONS.length * N_ROW_H + 2}
                className="hn-edge hn-edge--dashed"
                opacity={0.5}
              />
              <text x={x} y={N_ROW_Y + NINE_OPTIONS.length * N_ROW_H + 16} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
                {tr(`${m}分`, `${m} min`)}
              </text>
            </g>
          );
        })}
        {/* sliding highlight */}
        <rect
          x={24}
          y={N_ROW_Y - 3}
          width={712}
          height={N_ROW_H - 2}
          rx={6}
          fill="var(--accent-soft)"
          style={{ transform: `translateY(${sel * N_ROW_H}px)`, transition: reduced ? 'none' : 'transform 400ms cubic-bezier(.4,0,.2,1)' }}
        />
        {NINE_OPTIONS.map((o, i) => {
          const y = N_ROW_Y + i * N_ROW_H;
          const m = MIN_30D * unavail(o.pct);
          const w = barW(m);
          const active = i === sel;
          return (
            <g key={o.pct} style={{ cursor: 'pointer' }} onClick={() => setSel(i)}>
              <text x={34} y={y + 12} fill={active ? 'var(--accent)' : 'var(--text-muted)'} fontSize={12} fontWeight={active ? 700 : 500} fontFamily={MONO}>
                {o.pct}%
              </text>
              <rect
                x={N_BAR_X}
                y={y + 2}
                width={w}
                height={12}
                rx={3}
                fill={active ? 'var(--accent)' : 'var(--border-strong)'}
                opacity={active ? 1 : 0.8}
                style={{ transition: fade }}
              />
              <text x={N_BAR_X + w + 8} y={y + 12} fill={active ? 'var(--text)' : 'var(--text-dim)'} fontSize={11} fontFamily={MONO}>
                {formatDuration(m, ja)}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 3) SloBudget
// ============================================================================
type Scenario = 'normal' | 'outage';

const B_X0 = 70;
const B_X1 = 700;
const B_Y_TOP = 40; // 100%
const B_PX_PER_PCT = 2; // 100% … -20% → 240px
const bx = (day: number) => B_X0 + (day / 30) * (B_X1 - B_X0);
const by = (pct: number) => B_Y_TOP + (100 - pct) * B_PX_PER_PCT;
const B_STEP = 0.1;
const B_N = Math.round(30 / B_STEP) + 1;
const OUTAGE_DAY = 12;
const DRAW_MS = 6000;

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
};

// Cumulative "burn shape": integral of a positive, wobbly daily burn rate.
function burnShape(): number[] {
  const s: number[] = [0];
  for (let i = 1; i < B_N; i++) {
    const d = i * B_STEP;
    const rate = 1 + 0.55 * Math.sin(d * 1.3 + 0.4) + 0.3 * Math.sin(d * 3.7);
    s.push(s[i - 1] + rate * B_STEP);
  }
  return s;
}

function buildSeries(kind: Scenario): number[] {
  const s = burnShape();
  const total = s[B_N - 1];
  if (kind === 'normal') return s.map((v) => 100 - (64.5 * v) / total);
  const iOut = Math.round(OUTAGE_DAY / B_STEP);
  const sOut = s[iOut];
  return s.map((v, i) => {
    const d = i * B_STEP;
    if (i <= iOut) return 100 - (24 * v) / sOut;
    return 100 - 24 - 70 * smooth((d - OUTAGE_DAY) / 0.4) - (14 * (v - sOut)) / (total - sOut);
  });
}

const SERIES: Record<Scenario, number[]> = { normal: buildSeries('normal'), outage: buildSeries('outage') };

function valueAt(series: number[], day: number) {
  const f = day / B_STEP;
  const i = Math.min(B_N - 2, Math.floor(f));
  const t = f - i;
  return series[i] + (series[i + 1] - series[i]) * t;
}

function pathUpTo(series: number[], day: number) {
  const last = Math.floor(day / B_STEP + 1e-9);
  let d = `M ${bx(0)} ${by(series[0])}`;
  for (let i = 1; i <= last && i < B_N; i++) d += ` L ${bx(i * B_STEP).toFixed(1)} ${by(series[i]).toFixed(1)}`;
  d += ` L ${bx(day).toFixed(1)} ${by(valueAt(series, day)).toFixed(1)}`;
  return d;
}

export function SloBudget() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [scenario, setScenario] = useState<Scenario>('outage');
  const [playKey, setPlayKey] = useState(0);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    setProgress(0);
    let raf = 0;
    let start: number | null = null;
    let lastSet = 0;
    const step = (now: number) => {
      if (start === null) start = now;
      const p = Math.min(1, (now - start) / DRAW_MS);
      if (now - lastSet > 33 || p >= 1) {
        lastSet = now;
        setProgress(p);
      }
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduced, playKey, scenario]);

  const series = SERIES[scenario];
  const head = progress * 30;
  const headVal = valueAt(series, head);
  const hx = bx(head);
  const hy = by(headVal);
  const headTone = headVal >= 50 ? 'var(--green)' : headVal >= 0 ? 'var(--amber)' : 'var(--red)';
  const showOutage = scenario === 'outage' && head >= OUTAGE_DAY + 0.2;
  const readout = tr(`残り ${headVal.toFixed(1)}%`, `${headVal.toFixed(1)}% left`);
  const readoutRight = hx > 600;
  const dropX = bx(OUTAGE_DAY + 0.2);

  return (
    <DiagramFrame
      height={300}
      onReplay={() => setPlayKey((k) => k + 1)}
      caption={tr(
        'バジェットが残っていれば攻め、尽きたら守る',
        'Spend the budget on speed while it lasts; protect reliability once it is gone',
      )}
      controls={
        <>
          <ToggleButton active={scenario === 'normal'} onClick={() => setScenario('normal')} label={tr('通常の月', 'normal month')} />
          <ToggleButton active={scenario === 'outage'} onClick={() => setScenario('outage')} label={tr('大きな障害あり', 'with a major outage')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox="0 0 760 320"
        width="100%"
        role="img"
        aria-label={tr(
          'SLO 99.9% の30日間エラーバジェットの消費グラフ',
          '30-day error budget burn-down for an SLO of 99.9%',
        )}
      >
        <defs>
          <marker id="slo-budget-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--red)" />
          </marker>
        </defs>

        {/* status line */}
        <text x={B_X0} y={24} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
          {tr('30日ウィンドウ · SLO 99.9% · バジェット 43.2分', '30-day window · SLO 99.9% · budget 43.2 min')}
        </text>
        <text x={B_X1} y={24} textAnchor="end" fontSize={12} fontFamily={MONO}>
          <tspan fill="var(--text-dim)">{tr(`${Math.floor(head)}日目 · `, `day ${Math.floor(head)} · `)}</tspan>
          <tspan fill={headTone} fontWeight={700}>{readout}</tspan>
        </text>

        {/* policy bands */}
        <rect x={B_X0} y={by(100)} width={B_X1 - B_X0} height={by(50) - by(100)} fill="var(--green-soft)" />
        <rect x={B_X0} y={by(50)} width={B_X1 - B_X0} height={by(0) - by(50)} fill="var(--amber-soft)" />
        <rect x={B_X0} y={by(0)} width={B_X1 - B_X0} height={by(-20) - by(0)} fill="var(--red-soft)" />
        <text x={B_X0 + 10} y={by(50) - 8} fill="var(--green)" fontSize={11}>
          {tr('新機能をどんどん出す', 'ship features freely')}
        </text>
        <text x={B_X0 + 10} y={by(50) + 16} fill="var(--amber)" fontSize={11}>
          {tr('リリースは慎重に', 'release carefully')}
        </text>
        <text x={B_X0 + 10} y={by(0) + 24} fill="var(--red)" fontSize={11}>
          {tr('リリース凍結・信頼性を優先', 'freeze releases, fix reliability')}
        </text>

        {/* axes */}
        <rect x={B_X0} y={by(100)} width={B_X1 - B_X0} height={by(-20) - by(100)} fill="none" stroke="var(--border)" />
        <line x1={B_X0} y1={by(0)} x2={B_X1} y2={by(0)} stroke="var(--border-strong)" strokeWidth={1.5} />
        {[100, 50, 0, -20].map((v) => (
          <text key={v} x={B_X0 - 8} y={by(v) + 4} textAnchor="end" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
            {v}%
          </text>
        ))}
        {[0, 5, 10, 15, 20, 25, 30].map((d) => (
          <g key={d}>
            <line x1={bx(d)} y1={by(-20)} x2={bx(d)} y2={by(-20) + 5} stroke="var(--border-strong)" />
            <text x={bx(d)} y={by(-20) + 18} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
              {d}
            </text>
          </g>
        ))}
        <text x={B_X1} y={by(-20) + 34} textAnchor="end" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
          {tr('日', 'day')}
        </text>

        {/* ideal burn */}
        <line x1={bx(0)} y1={by(100)} x2={bx(30)} y2={by(0)} className="hn-edge hn-edge--dashed" />
        <text x={bx(19.5)} y={by(28)} textAnchor="end" fill="var(--text-muted)" fontSize={11}>
          {tr('理想の消費ペース', 'ideal burn')}
        </text>

        {/* outage annotation */}
        {scenario === 'outage' && (
          <g opacity={showOutage ? 1 : 0} style={{ transition: reduced ? 'none' : 'opacity 400ms' }}>
            <text x={dropX - 22} y={by(24)} textAnchor="end" fill="var(--red)" fontSize={11} fontWeight={600}>
              {tr('障害: 再生開始が', 'outage: playback starts')}
            </text>
            <text x={dropX - 22} y={by(24) + 15} textAnchor="end" fill="var(--red)" fontSize={11} fontWeight={600}>
              {tr('30 分失敗', 'failed for 30 min')}
            </text>
            <line x1={dropX - 18} y1={by(24) - 4} x2={dropX - 4} y2={by(40)} stroke="var(--red)" strokeWidth={1.25} markerEnd="url(#slo-budget-arrow)" />
          </g>
        )}

        {/* burn line */}
        <path d={pathUpTo(series, head)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* today dot */}
        <g style={{ '--tone': headTone } as CSSProperties}>
          <circle cx={hx} cy={hy} r={9} fill={headTone} opacity={0.2} />
          <circle cx={hx} cy={hy} r={4.5} className="hn-node__dot" />
          <text
            x={readoutRight ? hx - 12 : hx + 12}
            y={hy - 10}
            textAnchor={readoutRight ? 'end' : 'start'}
            fill={headTone}
            fontSize={12}
            fontWeight={700}
            fontFamily={MONO}
          >
            {tr(`今日 · ${readout}`, `today · ${readout}`)}
          </text>
        </g>
      </svg>
    </DiagramFrame>
  );
}
