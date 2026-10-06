// Chaos engineering diagrams.
//  - ChaosLoop:       the experiment cycle (steady state → hypothesis → inject →
//                     observe → learn), with the step being worked on highlighted.
//  - ChaosExperiment: inject 2s of latency into payments-api and watch the
//                     product-page success rate. Without a circuit breaker the
//                     rate falls to the abort line and the experiment stops
//                     itself; with one, it holds and runs to the planned end.
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

// ============================================================================
// 1) ChaosLoop
// ============================================================================
export function ChaosLoop() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActive((a) => (a + 1) % 5), 1600);
    return () => clearInterval(id);
  }, [reduced]);

  const steps = [
    { title: tr('定常状態', 'Steady state'), sub: tr('普段の値を決める', 'define normal') },
    { title: tr('仮説', 'Hypothesis'), sub: tr('「変わらないはず」', '"it won\'t change"') },
    { title: tr('注入', 'Inject'), sub: tr('障害を小さく起こす', 'a small fault') },
    { title: tr('観察', 'Observe'), sub: tr('指標を見比べる', 'compare metrics') },
    { title: tr('学ぶ', 'Learn'), sub: tr('弱点を直す', 'fix weaknesses') },
  ];

  const W = 132;
  const GAP = 24;
  const X0 = (820 - (5 * W + 4 * GAP)) / 2;
  const Y = 70;
  const H = 74;
  const cx = (i: number) => X0 + i * (W + GAP) + W / 2;

  return (
    <DiagramFrame
      height={260}
      caption={tr(
        'テストではなく実験。仮説が外れたところが、本番で起きる前に見つかった弱点になる',
        'An experiment, not a test: wherever the hypothesis fails is a weakness found before it hits production',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 250"
        width="100%"
        role="img"
        aria-label={tr(
          '定常状態、仮説、注入、観察、学ぶ、を繰り返すカオスエンジニアリングの実験サイクル',
          'The chaos engineering cycle: steady state, hypothesis, inject, observe, learn, repeated',
        )}
      >
        {steps.map((s, i) => {
          const on = reduced || active === i;
          const x = X0 + i * (W + GAP);
          return (
            <g key={i}>
              <rect
                x={x}
                y={Y}
                width={W}
                height={H}
                rx={12}
                fill={on ? 'var(--accent-soft)' : 'var(--surface)'}
                stroke={on ? 'var(--accent)' : 'var(--border-strong)'}
                strokeWidth={1.5}
                style={{ transition: reduced ? 'none' : 'fill 0.3s, stroke 0.3s' }}
              />
              <text x={x + 14} y={Y + 24} fontSize={12} fontFamily={MONO} fill="var(--text-dim)">
                {String(i + 1).padStart(2, '0')}
              </text>
              <text x={x + W / 2} y={Y + 44} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--text)">
                {s.title}
              </text>
              <text x={x + W / 2} y={Y + 63} textAnchor="middle" fontSize={12} fill="var(--text-muted)">
                {s.sub}
              </text>
              {i < 4 && (
                <g stroke="var(--border-strong)" strokeWidth={1.5} fill="none">
                  <line x1={x + W + 3} y1={Y + H / 2} x2={x + W + GAP - 4} y2={Y + H / 2} />
                  <path d={`M${x + W + GAP - 10} ${Y + H / 2 - 5} L${x + W + GAP - 4} ${Y + H / 2} L${x + W + GAP - 10} ${Y + H / 2 + 5}`} />
                </g>
              )}
            </g>
          );
        })}

        {/* loop back: learn → steady state */}
        <path
          d={`M${cx(4)} ${Y + H + 2} V ${Y + H + 44} H ${cx(0)} V ${Y + H + 8}`}
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <path d={`M${cx(0) - 5} ${Y + H + 14} L${cx(0)} ${Y + H + 6} L${cx(0) + 5} ${Y + H + 14}`} fill="none" stroke="var(--border-strong)" strokeWidth={1.5} />
        <text x={410} y={Y + H + 64} textAnchor="middle" fontSize={12.5} fill="var(--text-muted)">
          {tr('直したら、もう一度確かめる。少しずつ範囲を広げる', 'After fixing, test again, and widen the scope little by little')}
        </text>

        {/* abort branch from observe */}
        <text x={cx(3)} y={Y - 20} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="var(--red)">
          {tr('中止条件に届いたら即停止', 'stop at once on the abort condition')}
        </text>
        <line x1={cx(3)} y1={Y - 14} x2={cx(3)} y2={Y - 2} stroke="var(--red)" strokeWidth={1.5} />
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) ChaosExperiment
// ============================================================================
const T_END = 60; // seconds shown
const T_INJECT = 15; // fault injected
const T_PLANNED_END = 45; // planned end of injection
const T_ABORT = 21; // no-breaker run hits the abort line here
const T_OPEN = 17; // breaker opens here
const Y_MIN = 98.4;
const Y_MAX = 100;
const SLO = 99.9;
const ABORT = 99.0;

const CX0 = 76;
const CX1 = 780;
const CY0 = 64; // top (100%)
const CY1 = 290; // bottom (98.4%)
const px = (t: number) => CX0 + (t / T_END) * (CX1 - CX0);
const py = (v: number) => CY0 + ((Y_MAX - v) / (Y_MAX - Y_MIN)) * (CY1 - CY0);

const wobble = (t: number) => 0.015 * Math.sin(t * 1.7) + 0.01 * Math.sin(t * 4.3);

// Success rate (%) of product-page requests at time t.
function rate(t: number, breaker: boolean): number {
  const base = 99.95 + wobble(t);
  if (t < T_INJECT) return base;
  if (breaker) {
    if (t < T_OPEN) return base - ((t - T_INJECT) / (T_OPEN - T_INJECT)) * 0.22;
    if (t < T_OPEN + 2) return base - 0.22 + ((t - T_OPEN) / 2) * 0.2;
    return base - 0.02;
  }
  if (t < T_ABORT) {
    const k = (t - T_INJECT) / (T_ABORT - T_INJECT);
    return base - k * k * 1.05;
  }
  // injection stopped: recover over ~8s
  const k = Math.min(1, (t - T_ABORT) / 8);
  return base - 1.05 * (1 - k) * (1 - k);
}

export function ChaosExperiment() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [breaker, setBreaker] = useState(false);
  const [play, setPlay] = useState(0);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const DURATION = 7000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setProgress(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, breaker, reduced]);

  const tNow = progress * T_END;
  const injectEnd = breaker ? T_PLANNED_END : T_ABORT;

  const points: string[] = [];
  for (let t = 0; t <= tNow + 1e-6; t += 0.25) points.push(`${px(t).toFixed(1)},${py(rate(t, breaker)).toFixed(1)}`);
  const lineColor = breaker ? 'var(--green)' : 'var(--accent)';

  const seen = (t: number) => tNow >= t;
  const fade = (t: number) => ({ opacity: seen(t) ? 1 : 0, transition: reduced ? 'none' : 'opacity 0.3s' });

  const finished = progress >= 1;

  return (
    <DiagramFrame
      height={400}
      onReplay={() => setPlay((p) => p + 1)}
      controls={
        <>
          <ToggleButton active={!breaker} onClick={() => setBreaker(false)} label={tr('ブレーカーなし', 'No circuit breaker')} />
          <ToggleButton active={breaker} onClick={() => setBreaker(true)} label={tr('ブレーカーあり', 'With circuit breaker')} />
        </>
      }
      caption={tr(
        'payments-api に 2 秒の遅延を注入。中止ラインを決めておけば、弱点が見つかった時点で被害を広げずに止められる',
        'Injecting 2s of latency into payments-api. With an abort line set in advance, the experiment stops the moment a weakness shows, before it spreads',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 420"
        width="100%"
        role="img"
        aria-label={tr(
          'payments-api に遅延を注入したときの商品ページ成功率の推移。ブレーカーなしでは中止ラインに届いて実験が自動停止し、ブレーカーありでは SLO を保ったまま予定どおり終わる',
          'Product-page success rate while latency is injected into payments-api. Without a breaker it reaches the abort line and the experiment stops itself; with a breaker it holds the SLO and ends as planned',
        )}
      >
        {/* title */}
        <text x={CX0} y={30} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('商品ページの成功率', 'Product page success rate')}
        </text>
        <text x={CX0} y={50} fontSize={12.5} fill="var(--text-muted)">
          <tspan fontFamily={MONO}>checkout-svc → payments-api</tspan>
          <tspan>{tr('  に遅延 +2s を注入', '  with +2s latency injected')}</tspan>
        </text>

        {/* injection window */}
        <rect
          x={px(T_INJECT)}
          y={CY0}
          width={Math.max(0, px(Math.min(tNow, injectEnd)) - px(T_INJECT))}
          height={CY1 - CY0}
          fill="var(--amber-soft)"
          style={fade(T_INJECT)}
        />
        <g style={fade(T_INJECT)}>
          <line x1={px(T_INJECT)} y1={CY0} x2={px(T_INJECT)} y2={CY1} stroke="var(--amber)" strokeWidth={1.5} />
          <text x={px(T_INJECT) + 6} y={CY0 + 16} fontSize={12} fontWeight={600} fill="var(--amber)">
            {tr('注入開始', 'inject')}
          </text>
        </g>

        {/* y grid + labels */}
        {[100, 99.5, 99.0, 98.5].map((v) => (
          <g key={v}>
            <line x1={CX0} y1={py(v)} x2={CX1} y2={py(v)} stroke="var(--border)" strokeWidth={1} />
            <text x={CX0 - 10} y={py(v) + 4} textAnchor="end" fontSize={12} fontFamily={MONO} fill="var(--text-dim)">
              {v.toFixed(1)}%
            </text>
          </g>
        ))}

        {/* SLO + abort lines */}
        <line x1={CX0} y1={py(SLO)} x2={CX1} y2={py(SLO)} stroke="var(--green)" strokeWidth={1.25} strokeDasharray="6 5" />
        <text x={CX1} y={py(SLO) - 7} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--green)">
          SLO 99.9%
        </text>
        <line x1={CX0} y1={py(ABORT)} x2={CX1} y2={py(ABORT)} stroke="var(--red)" strokeWidth={1.5} strokeDasharray="6 5" />
        <text x={CX1} y={py(ABORT) - 7} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--red)">
          {tr('中止ライン 99.0%', 'abort line 99.0%')}
        </text>

        {/* series */}
        {points.length > 1 && (
          <polyline points={points.join(' ')} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        )}
        {!finished && points.length > 0 && (
          <circle cx={px(tNow)} cy={py(rate(tNow, breaker))} r={5} fill={lineColor} />
        )}

        {/* events */}
        {breaker ? (
          <>
            <g style={fade(T_OPEN)}>
              <circle cx={px(T_OPEN)} cy={py(rate(T_OPEN, true))} r={4.5} fill="var(--green)" />
              <text x={px(T_OPEN) + 10} y={py(rate(T_OPEN, true)) + 22} fontSize={12.5} fontWeight={600} fill="var(--green)">
                {tr('ブレーカーが開き、すぐ失敗を返す', 'breaker opens and fails fast')}
              </text>
            </g>
            <g style={fade(T_PLANNED_END)}>
              <line x1={px(T_PLANNED_END)} y1={CY0} x2={px(T_PLANNED_END)} y2={CY1} stroke="var(--amber)" strokeWidth={1.5} />
              <text x={px(T_PLANNED_END) + 6} y={CY0 + 16} fontSize={12} fontWeight={600} fill="var(--amber)">
                {tr('予定どおり終了', 'planned end')}
              </text>
            </g>
          </>
        ) : (
          <g style={fade(T_ABORT)}>
            <line x1={px(T_ABORT)} y1={CY0} x2={px(T_ABORT)} y2={CY1} stroke="var(--red)" strokeWidth={1.5} />
            <circle cx={px(T_ABORT)} cy={py(rate(T_ABORT, false))} r={4.5} fill="var(--red)" />
            <text x={px(T_ABORT) + 10} y={py(rate(T_ABORT, false)) + 24} fontSize={12.5} fontWeight={600} fill="var(--red)">
              {tr('中止ラインに到達 → 注入を自動停止', 'hit the abort line → injection stopped')}
            </text>
          </g>
        )}

        {/* x axis */}
        {[0, 15, 30, 45, 60].map((t) => (
          <text key={t} x={px(t)} y={CY1 + 22} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="var(--text-dim)">
            {t}s
          </text>
        ))}

        {/* verdict */}
        <g style={{ opacity: finished ? 1 : 0, transition: reduced ? 'none' : 'opacity 0.4s' }}>
          <rect x={CX0 - 36} y={346} width={CX1 - CX0 + 36} height={56} rx={10} fill={breaker ? 'var(--green-soft)' : 'var(--red-soft)'} />
          <text x={(CX0 - 36 + CX1) / 2} y={370} textAnchor="middle" fontSize={14} fontWeight={700} fill={breaker ? 'var(--green)' : 'var(--red)'}>
            {breaker ? tr('仮説どおり：SLO を保ったまま耐えた', 'Hypothesis held: the SLO stayed intact') : tr('仮説が外れた：弱点が見つかった', 'Hypothesis failed: a weakness was found')}
          </text>
          <text x={(CX0 - 36 + CX1) / 2} y={391} textAnchor="middle" fontSize={12.5} fill="var(--text)">
            {breaker
              ? tr('決済だけが一時的に使えず、商品ページは影響を受けなかった', 'Only payments were briefly unavailable; product pages were unaffected')
              : tr('決済の遅れが商品ページまで巻き込んだ。被害は 6 秒・少数のユーザーで止まった', 'Slow payments dragged product pages down too, but the damage stopped at 6s and a few users')}
          </text>
        </g>
      </svg>
    </DiagramFrame>
  );
}
