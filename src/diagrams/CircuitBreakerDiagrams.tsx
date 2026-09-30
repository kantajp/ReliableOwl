// Circuit breaker diagram: a breaker between checkout-svc and its payments-api
// dependency. A ~12s scenario loops through CLOSED -> (dependency degrades) ->
// OPEN (fast-fail with fallback) -> HALF-OPEN (one trial request) -> CLOSED,
// with the state machine shown underneath. Dependency-free SVG, theme-aware
// (colors from CSS variables), bilingual labels, and a single static frame when
// the user prefers reduced motion.
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

const MONO = 'var(--font-mono)';

// ---- timeline -------------------------------------------------------------
const TICK_MS = 500;
const TOTAL_TICKS = 24; // 12s loop

type Phase = 'closed' | 'degrading' | 'open' | 'half' | 'recovered';
type BreakerState = 'CLOSED' | 'OPEN' | 'HALF-OPEN';

function phaseAt(t: number): Phase {
  if (t < 6) return 'closed';
  if (t < 11) return 'degrading';
  if (t < 17) return 'open';
  if (t < 21) return 'half';
  return 'recovered';
}

function breakerOf(p: Phase): BreakerState {
  if (p === 'open') return 'OPEN';
  if (p === 'half') return 'HALF-OPEN';
  return 'CLOSED';
}

const STATE_TONE: Record<BreakerState, { tone: string; soft: string }> = {
  CLOSED: { tone: 'var(--green)', soft: 'var(--green-soft)' },
  OPEN: { tone: 'var(--red)', soft: 'var(--red-soft)' },
  'HALF-OPEN': { tone: 'var(--amber)', soft: 'var(--amber-soft)' },
};

// ---- geometry -------------------------------------------------------------
const ROW_Y = 142; // wire height
const CARD_W = 220;
const CARD_H = 84;
const CARD_Y = ROW_Y - CARD_H / 2;
const CALLER_X = 60;
const DEP_X = 700;
const CALLER_R = CALLER_X + CARD_W; // 280
const PIVOT_X = 450;
const CONTACT_X = 530;
const BOX = { x: 400, y: 96, w: 180, h: 92 };

const THROUGH_PATH = `M ${CALLER_R + 2} ${ROW_Y} L ${DEP_X - 2} ${ROW_Y}`;
const BOUNCE_PATH = `M ${CALLER_R + 2} ${ROW_Y} L ${PIVOT_X - 14} ${ROW_Y} C ${PIVOT_X} ${ROW_Y}, ${PIVOT_X} ${ROW_Y + 20}, ${PIVOT_X - 14} ${ROW_Y + 20} L ${CALLER_R + 2} ${ROW_Y + 20}`;
// Fraction of THROUGH_PATH at which a packet crosses the breaker.
const BREAKER_FRACTION = (CONTACT_X - CALLER_R) / (DEP_X - CALLER_R);

// ---- packets --------------------------------------------------------------
// Looping packet; switches from `color` to `color2` at `switchAt` (0..1).
function PacketOnPath({
  d, color, color2, switchAt = 1, dur, begin,
}: { d: string; color: string; color2?: string; switchAt?: number; dur: number; begin: number }) {
  const timing = { dur: `${dur}s`, begin: `${begin}s`, repeatCount: 'indefinite' };
  const dot = (c: string) => (
    <g style={{ color: c }}>
      <circle r={10} fill="currentColor" opacity={0.18} />
      <circle r={4} fill="currentColor" className="hn-packet" />
    </g>
  );
  return (
    <g opacity={0}>
      <animateMotion {...timing} path={d} />
      <animate {...timing} attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" />
      {color2 ? (
        <>
          <g>
            <animate {...timing} attributeName="opacity" values="1;0" keyTimes={`0;${switchAt}`} calcMode="discrete" />
            {dot(color)}
          </g>
          <g opacity={0}>
            <animate {...timing} attributeName="opacity" values="0;1" keyTimes={`0;${switchAt}`} calcMode="discrete" />
            {dot(color2)}
          </g>
        </>
      ) : (
        dot(color)
      )}
    </g>
  );
}

// Packet that plays once when mounted (begin="indefinite" + beginElement()).
function OneShotPacket({ d, color, dur }: { d: string; color: string; dur: number }) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    ref.current?.querySelectorAll<SVGAnimationElement>('animate, animateMotion').forEach((a) => a.beginElement());
  }, []);
  const timing = { dur: `${dur}s`, begin: 'indefinite', fill: 'freeze' as const };
  return (
    <g ref={ref} opacity={0} style={{ color }}>
      <animateMotion {...timing} path={d} />
      <animate {...timing} attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
      <circle r={12} fill="currentColor" opacity={0.2} />
      <circle r={5} fill="currentColor" className="hn-packet" />
    </g>
  );
}

// ---- cards ----------------------------------------------------------------
function ServiceCard({
  x, title, tag, metric, tone, metricTone,
}: { x: number; title: string; tag: string; metric: string; tone: string; metricTone: string }) {
  return (
    <g style={{ '--tone': tone } as CSSProperties}>
      <text x={x + 4} y={CARD_Y - 10} fill="var(--text-dim)" fontSize={10} fontFamily={MONO} letterSpacing={1.5}>
        {tag}
      </text>
      <rect x={x} y={CARD_Y} width={CARD_W} height={CARD_H} rx={12} fill="var(--surface)" stroke="var(--border-strong)" />
      <rect x={x} y={CARD_Y + 14} width={3} height={CARD_H - 28} rx={1.5} fill={tone} style={{ transition: 'fill 300ms' }} />
      <text x={x + 18} y={CARD_Y + 34} fill="var(--text)" fontSize={14} fontWeight={600}>
        {title}
      </text>
      <text x={x + 18} y={CARD_Y + 56} fill={metricTone} fontSize={11} fontFamily={MONO}>
        {metric}
      </text>
      <circle cx={x + CARD_W - 18} cy={ROW_Y} r={4} className="hn-node__dot" />
    </g>
  );
}

// ---- state machine pills --------------------------------------------------
const PILL_W = 150;
const PILL_H = 34;
const PILL_Y = 340;
const PILL_MID = PILL_Y + PILL_H / 2;
const PILLS: { state: BreakerState; cx: number }[] = [
  { state: 'CLOSED', cx: 250 },
  { state: 'OPEN', cx: 490 },
  { state: 'HALF-OPEN', cx: 730 },
];

export function CbStateMachine() {
  const { lang } = useLang();
  const tr = (ja: string, en: string) => (lang === 'ja' ? ja : en);
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((v) => (v + 1) % TOTAL_TICKS), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  // Reduced motion: a static representative OPEN frame.
  const t = reduced ? 13 : tick;
  const phase = phaseAt(t);
  const state = breakerOf(phase);
  const { tone: stateTone } = STATE_TONE[state];

  const failures = phase === 'closed' || phase === 'recovered' ? 0 : phase === 'degrading' ? Math.min(5, t - 5) : 5;
  const userErrors = phase === 'degrading' ? failures : 0;
  const countdown = Math.max(1, Math.ceil((17 - t) / 2));
  const fallbackOn = phase === 'open' || phase === 'half';

  const depHealthy = phase === 'closed' || phase === 'recovered' || phase === 'half';
  const depTone = depHealthy ? 'var(--green)' : 'var(--red)';
  const depMetric =
    phase === 'degrading' ? tr('タイムアウト · 5秒', 'timeouts · 5s') :
      phase === 'open' ? tr('通信なし · 回復中', 'no traffic · recovering') :
        phase === 'half' ? tr('試行 → 200 OK', 'trial → 200 OK') : tr('p99 42ms · 正常', 'p99 42ms · healthy');
  const callerMetric =
    phase === 'degrading' ? tr('応答が遅い', 'slow responses') :
      fallbackOn ? tr('フォールバックを返却', 'fallback served') : '200 OK · 38ms';
  const callerMetricTone = phase === 'degrading' ? 'var(--red)' : fallbackOn ? 'var(--amber)' : 'var(--text-dim)';

  const leverAngle = phase === 'open' ? -35 : 0;
  const open = phase === 'open';

  return (
    <DiagramFrame
      height={320}
      caption={tr(
        '失敗が閾値を超えると OPEN（即失敗＋フォールバック）→ 待機後 HALF-OPEN で試行 → 成功で CLOSED',
        'Failures cross a threshold → OPEN (fail fast + fallback) → after a cooldown, HALF-OPEN tries once → success → CLOSED',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 980 440"
        width="100%"
        role="img"
        aria-label={tr(
          'checkout-svc と payments-api の間のサーキットブレーカーが CLOSED・OPEN・HALF-OPEN を順に遷移する図',
          'Circuit breaker between checkout-svc and payments-api cycling through closed, open and half-open states',
        )}
      >
        <defs>
          <marker id="hcb-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
          </marker>
        </defs>

        {/* status strip */}
        <rect x={20} y={14} width={940} height={36} rx={10} fill="var(--bg-elevated)" fillOpacity={0.6} stroke="var(--border)" />
        <text y={37} fontSize={12} fontFamily={MONO}>
          <tspan x={40} fill="var(--text-dim)">{tr('ブレーカー: ', 'breaker: ')}</tspan>
          <tspan fill={stateTone} fontWeight={700}>{state}</tspan>
          <tspan x={260} fill="var(--text-dim)">{tr('失敗 ', 'failures ')}</tspan>
          <tspan fill={failures > 0 ? 'var(--red)' : 'var(--text)'}>{failures}/5</tspan>
          <tspan x={440} fill="var(--text-dim)">{tr('ユーザーへのエラー: ', 'errors to users: ')}</tspan>
          <tspan fill={userErrors > 0 ? 'var(--red)' : 'var(--green)'}>{userErrors}</tspan>
          <tspan x={700} fill="var(--text-dim)">{tr('フォールバック: ', 'fallback: ')}</tspan>
          <tspan fill={fallbackOn ? 'var(--amber)' : 'var(--text-muted)'}>{fallbackOn ? tr('オン', 'on') : tr('オフ', 'off')}</tspan>
        </text>

        {/* wires */}
        <line x1={CALLER_R} y1={ROW_Y} x2={PIVOT_X} y2={ROW_Y} className="hn-edge" />
        {!reduced && <path d={`M ${CALLER_R} ${ROW_Y} L ${PIVOT_X} ${ROW_Y}`} className="hn-edge-flow" />}
        <line x1={CONTACT_X} y1={ROW_Y} x2={DEP_X} y2={ROW_Y} className={open ? 'hn-edge hn-edge--dashed' : 'hn-edge'} opacity={open ? 0.5 : 1} />
        {!reduced && !open && <path d={`M ${CONTACT_X} ${ROW_Y} L ${DEP_X} ${ROW_Y}`} className="hn-edge-flow" />}

        {/* cards */}
        <ServiceCard x={CALLER_X} tag={tr('呼び出し元', 'CALLER')} title="checkout-svc" metric={callerMetric} tone="var(--accent)" metricTone={callerMetricTone} />
        <ServiceCard x={DEP_X} tag={tr('依存先', 'DEPENDENCY')} title="payments-api" metric={depMetric} tone={depTone} metricTone={depHealthy ? 'var(--text-dim)' : 'var(--red)'} />

        {/* breaker (electrical switch) */}
        <g style={{ '--tone': stateTone } as CSSProperties}>
          <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={14} fill="var(--surface)" stroke={stateTone} strokeOpacity={0.7} style={{ transition: 'stroke 300ms' }} />
          <text x={BOX.x + BOX.w / 2} y={BOX.y + 18} textAnchor="middle" fill="var(--text-dim)" fontSize={10} fontFamily={MONO} letterSpacing={1.5}>
            {tr('ブレーカー', 'BREAKER')}
          </text>
          <circle cx={PIVOT_X} cy={ROW_Y} r={6} fill="var(--surface)" stroke={stateTone} strokeWidth={2.5} />
          <circle cx={CONTACT_X} cy={ROW_Y} r={6} fill="var(--surface)" stroke={open ? 'var(--border-strong)' : stateTone} strokeWidth={2.5} />
          <g
            style={{
              transform: `rotate(${leverAngle}deg)`,
              transformOrigin: `${PIVOT_X}px ${ROW_Y}px`,
              transition: reduced ? 'none' : 'transform 450ms cubic-bezier(.3,1.4,.5,1)',
            }}
          >
            <line x1={PIVOT_X} y1={ROW_Y} x2={CONTACT_X - 4} y2={ROW_Y} stroke={stateTone} strokeWidth={4} strokeLinecap="round" style={{ transition: 'stroke 300ms' }} />
            <circle cx={CONTACT_X - 4} cy={ROW_Y} r={3.5} fill={stateTone} />
          </g>
          <text x={BOX.x + BOX.w / 2} y={BOX.y + BOX.h - 12} textAnchor="middle" fontSize={11} fontFamily={MONO} fill={open || failures > 0 ? 'var(--red)' : 'var(--text-muted)'}>
            {open ? tr(`あと${countdown}秒で試行…`, `retry in ${countdown}s…`) : phase === 'half' ? tr('試行 1/1', 'trial 1/1') : tr(`失敗 ${failures}/5`, `failures ${failures}/5`)}
          </text>
          <circle cx={BOX.x + BOX.w - 16} cy={BOX.y + 15} r={3.5} className="hn-node__dot" />
        </g>

        {/* fast-fail label */}
        {open && (
          <g>
            <text x={PIVOT_X - 80} y={ROW_Y + 54} textAnchor="middle" fill="var(--amber)" fontSize={11} fontFamily={MONO}>
              {tr('↩ 即失敗（フォールバック）', '↩ fast-fail (fallback)')}
            </text>
            {reduced && (
              <g style={{ color: 'var(--amber)' }}>
                <circle cx={PIVOT_X - 22} cy={ROW_Y + 10} r={10} fill="currentColor" opacity={0.18} />
                <circle cx={PIVOT_X - 22} cy={ROW_Y + 10} r={4} fill="currentColor" />
              </g>
            )}
          </g>
        )}

        {/* packets (keyed by phase so SMIL routes re-mount) */}
        {!reduced && (phase === 'closed' || phase === 'recovered') &&
          [0, 0.8, 1.6].map((b) => (
            <PacketOnPath key={`${phase}-${b}`} d={THROUGH_PATH} color="var(--accent)" color2="var(--green)" switchAt={BREAKER_FRACTION} dur={2.4} begin={b} />
          ))}
        {!reduced && phase === 'degrading' &&
          [0, 0.8, 1.6].map((b) => (
            <PacketOnPath key={`${phase}-${b}`} d={THROUGH_PATH} color="var(--accent)" color2="var(--red)" switchAt={BREAKER_FRACTION} dur={2.4} begin={b} />
          ))}
        {!reduced && phase === 'open' &&
          [0, 0.5, 1.0].map((b) => (
            <PacketOnPath key={`${phase}-${b}`} d={BOUNCE_PATH} color="var(--accent)" color2="var(--amber)" switchAt={0.5} dur={1.5} begin={b} />
          ))}
        {!reduced && phase === 'half' && <OneShotPacket key={`${phase}-trial`} d={THROUGH_PATH} color="var(--green)" dur={1.6} />}

        {/* state machine */}
        <text x={490} y={318} textAnchor="middle" fill="var(--text-dim)" fontSize={10} fontFamily={MONO} letterSpacing={2}>
          {tr('状態遷移', 'STATE MACHINE')}
        </text>
        <line x1={250 + PILL_W / 2 + 4} y1={PILL_MID} x2={490 - PILL_W / 2 - 4} y2={PILL_MID} stroke="var(--text-dim)" strokeWidth={1.5} markerEnd="url(#hcb-arrow)" />
        <text x={370} y={PILL_MID - 8} textAnchor="middle" fill="var(--text-dim)" fontSize={10} fontFamily={MONO}>{tr('失敗 5 回', '5 failures')}</text>
        <line x1={490 + PILL_W / 2 + 4} y1={PILL_MID} x2={730 - PILL_W / 2 - 4} y2={PILL_MID} stroke="var(--text-dim)" strokeWidth={1.5} markerEnd="url(#hcb-arrow)" />
        <text x={610} y={PILL_MID - 8} textAnchor="middle" fill="var(--text-dim)" fontSize={10} fontFamily={MONO}>{tr('待機時間', 'cooldown')}</text>
        <path
          d={`M 730 ${PILL_Y + PILL_H + 2} C 730 ${PILL_Y + PILL_H + 50}, 250 ${PILL_Y + PILL_H + 50}, 250 ${PILL_Y + PILL_H + 6}`}
          fill="none"
          stroke="var(--text-dim)"
          strokeWidth={1.5}
          markerEnd="url(#hcb-arrow)"
        />
        <text x={490} y={PILL_Y + PILL_H + 58} textAnchor="middle" fill="var(--text-dim)" fontSize={10} fontFamily={MONO}>{tr('試行が成功', 'trial ok')}</text>

        {PILLS.map(({ state: s, cx }) => {
          const active = s === state;
          const { tone, soft } = STATE_TONE[s];
          return (
            <g key={s} style={{ '--tone': tone } as CSSProperties}>
              <rect
                x={cx - PILL_W / 2}
                y={PILL_Y}
                width={PILL_W}
                height={PILL_H}
                rx={PILL_H / 2}
                fill={active ? soft : 'var(--surface)'}
                stroke={active ? tone : 'var(--border)'}
                strokeWidth={active ? 2 : 1}
                style={{ transition: 'fill 300ms, stroke 300ms' }}
              />
              {active && <circle cx={cx - PILL_W / 2 + 18} cy={PILL_MID} r={4} className="hn-node__dot" />}
              <text x={cx} y={PILL_MID + 4} textAnchor="middle" fill={active ? tone : 'var(--text-dim)'} fontSize={12} fontWeight={active ? 700 : 500} fontFamily={MONO} letterSpacing={1}>
                {s}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
