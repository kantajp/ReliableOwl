// Hero visual prototype: database failover (reliability / SRE).
// App servers write to a Postgres primary and read from a replica. On a ~12s loop
// the primary fails, the replica is promoted, writes re-route, and the old primary
// rejoins as a replica. Dependency-free SVG, theme-aware via CSS variables, and a
// single static frame when the user prefers reduced motion.
import { useEffect, useState, type CSSProperties } from 'react';

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

// A glowing packet that loops along an SVG path.
function PacketOnPath({ d, color, dur, begin }: { d: string; color: string; dur: number; begin: number }) {
  const timing = { dur: `${dur}s`, begin: `${begin}s`, repeatCount: 'indefinite' };
  return (
    <g opacity={0} style={{ color }}>
      <animateMotion {...timing} path={d} />
      <animate {...timing} attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" />
      <circle r={9} fill="currentColor" opacity={0.18} />
      <circle r={3.5} fill="currentColor" className="hn-packet" />
    </g>
  );
}

// Horizontal S-curve between two points.
function sCurve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

const MONO = 'var(--font-mono)';

// ---- phase state machine -------------------------------------------------
type Phase = 'healthy' | 'fail' | 'promote' | 'promoted' | 'rejoin';
const TICK_MS = 500;
// Duration of each phase in ticks (24 ticks = 12s loop).
const PHASES: { phase: Phase; ticks: number }[] = [
  { phase: 'healthy', ticks: 6 },
  { phase: 'fail', ticks: 4 },
  { phase: 'promote', ticks: 4 },
  { phase: 'promoted', ticks: 6 },
  { phase: 'rejoin', ticks: 4 },
];
const LOOP_TICKS = PHASES.reduce((s, p) => s + p.ticks, 0);

function phaseAt(tick: number): { phase: Phase; step: number } {
  let t = tick % LOOP_TICKS;
  for (const p of PHASES) {
    if (t < p.ticks) return { phase: p.phase, step: t };
    t -= p.ticks;
  }
  return { phase: 'healthy', step: 0 };
}

// ---- layout --------------------------------------------------------------
interface Box { x: number; y: number; w: number; h: number }
const APP_W = 200;
const APP_H = 52;
const APPS: (Box & { id: string })[] = [
  { id: 'app-1', x: 70, y: 120, w: APP_W, h: APP_H },
  { id: 'app-2', x: 70, y: 212, w: APP_W, h: APP_H },
  { id: 'app-3', x: 70, y: 304, w: APP_W, h: APP_H },
];
// Node A starts as primary (top), node B as replica (bottom).
const NODE_A: Box = { x: 620, y: 96, w: 280, h: 64 };
const NODE_B: Box = { x: 620, y: 280, w: 280, h: 64 };
const REPL_X = 760;

const midY = (b: Box) => b.y + b.h / 2;
const right = (b: Box) => b.x + b.w;
const appToNode = (app: Box, node: Box) => sCurve(right(app), midY(app), node.x, midY(node));

// ---- per-phase view model ------------------------------------------------
interface NodeView {
  title: string;
  titleColor: string;
  metric: string;
  tone: string;
  stroke: string;
  fill: string;
  opacity: number;
}

function nodeViews(phase: Phase, tick: number): { a: NodeView; b: NodeView } {
  const qps = `${(2.4 + ((tick * 5) % 9) / 10).toFixed(1)}k qps`;
  const lag = `lag ${30 + ((tick * 7) % 20)}ms`;
  const base: NodeView = {
    title: '', titleColor: 'var(--text)', metric: '', tone: 'var(--purple)',
    stroke: 'var(--border-strong)', fill: 'var(--surface)', opacity: 1,
  };
  const replica: NodeView = { ...base, title: 'Postgres · replica', metric: lag };
  const promoted: NodeView = {
    ...base, title: 'Postgres · primary (promoted)', titleColor: 'var(--green)',
    metric: qps, tone: 'var(--green)', stroke: 'var(--green)',
  };
  switch (phase) {
    case 'healthy':
      return { a: { ...base, title: 'Postgres · primary', metric: qps }, b: replica };
    case 'fail':
      return {
        a: { ...base, title: 'Postgres · primary', titleColor: 'var(--red)', metric: 'primary down',
          tone: 'var(--red)', stroke: 'var(--red)', fill: 'var(--red-soft)' },
        b: { ...replica, metric: 'lag —' },
      };
    case 'promote':
      return {
        a: { ...base, title: 'Postgres · primary', titleColor: 'var(--red)', metric: 'primary down',
          tone: 'var(--red)', stroke: 'var(--red)', fill: 'var(--red-soft)' },
        b: { ...replica, metric: 'promoting…', tone: 'var(--amber)', stroke: 'var(--amber)', fill: 'var(--amber-soft)' },
      };
    case 'promoted':
      return {
        a: { ...base, title: 'old primary · offline', titleColor: 'var(--text-muted)', metric: 'unreachable',
          tone: 'var(--text-dim)', stroke: 'var(--border)', opacity: 0.5 },
        b: promoted,
      };
    case 'rejoin':
      return {
        a: { ...base, title: 'Postgres · replica', metric: `catching up · ${lag}`, tone: 'var(--cyan)', stroke: 'var(--cyan)' },
        b: promoted,
      };
  }
}

interface StatusView { writes: string; writesTone: string; phaseLabel: string; slo: string }
function statusFor(phase: Phase, step: number): StatusView {
  switch (phase) {
    case 'healthy': return { writes: 'OK', writesTone: 'var(--green)', phaseLabel: 'healthy', slo: 'RPO 0s · RTO —' };
    case 'fail': return { writes: 'FAILING', writesTone: 'var(--red)', phaseLabel: 'primary lost', slo: `RTO ${Math.floor(step / 2) + 1}s…` };
    case 'promote': return { writes: 'FAILING', writesTone: 'var(--red)', phaseLabel: 'election', slo: `RTO ${Math.floor(step / 2) + 3}s…` };
    case 'promoted': return { writes: 'OK', writesTone: 'var(--green)', phaseLabel: 'failover done', slo: 'RPO 0s · RTO 8s' };
    case 'rejoin': return { writes: 'OK', writesTone: 'var(--green)', phaseLabel: 'rejoin', slo: 'RPO 0s · RTO 8s' };
  }
}

// ---- small pieces --------------------------------------------------------
function Pill({ x, y, label, value, tone }: { x: number; y: number; label: string; value?: string; tone: string }) {
  const text = value ? `${label} ${value}` : label;
  const w = text.length * 6.8 + 34;
  return (
    <g style={{ '--tone': tone } as CSSProperties}>
      <rect x={x} y={y} width={w} height={26} rx={13} fill="var(--bg-elevated)" stroke="var(--border)" />
      <circle cx={x + 14} cy={y + 13} r={3.5} className="hn-node__dot" />
      <text x={x + 26} y={y + 17} fontSize={11} fontFamily={MONO} fill="var(--text-muted)">
        {label}
        {value && <tspan fill={tone} fontWeight={600}>{` ${value}`}</tspan>}
      </text>
    </g>
  );
}

function Badge({ cx, y, text, tone, soft }: { cx: number; y: number; text: string; tone: string; soft: string }) {
  const w = text.length * 6.8 + 24;
  return (
    <g>
      <rect x={cx - w / 2} y={y} width={w} height={24} rx={6} fill={soft} stroke={tone} />
      <text x={cx} y={y + 16} textAnchor="middle" fontSize={11} fontFamily={MONO} fontWeight={600} fill={tone}>
        {text}
      </text>
    </g>
  );
}

function NodeCard({ box, view }: { box: Box; view: NodeView }) {
  return (
    <g style={{ '--tone': view.tone, transition: 'opacity 400ms' } as CSSProperties} opacity={view.opacity}>
      <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={12} fill={view.fill} stroke={view.stroke} strokeWidth={1.5} />
      <rect x={box.x} y={box.y + 14} width={3} height={box.h - 28} rx={1.5} fill={view.tone} />
      <text x={box.x + 18} y={box.y + 27} fill={view.titleColor} fontSize={13} fontWeight={600}>
        {view.title}
      </text>
      <text x={box.x + 18} y={box.y + 46} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
        {view.metric}
      </text>
      <circle cx={right(box) - 18} cy={midY(box)} r={4} className="hn-node__dot" />
    </g>
  );
}

// ---- component -----------------------------------------------------------
export function HeroDbFailover() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((v) => v + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  // Reduced motion: one static representative frame.
  const { phase, step } = reduced ? { phase: 'promoted' as Phase, step: 0 } : phaseAt(tick);
  const { a, b } = nodeViews(phase, tick);
  const status = statusFor(phase, step);

  const aIsPrimary = phase === 'healthy' || phase === 'fail' || phase === 'promote';
  const writeTarget: Box | null = phase === 'healthy' || phase === 'fail' ? NODE_A : phase === 'promote' ? null : NODE_B;
  const writesFailing = phase === 'fail' || phase === 'promote';
  // Reads stay on B until the old primary rejoins as a replica.
  const readTarget: Box = phase === 'rejoin' ? NODE_A : NODE_B;

  // Replication: A -> B while healthy, B -> A during rejoin, none otherwise.
  const replication: 'down' | 'up' | null = phase === 'healthy' ? 'down' : phase === 'rejoin' ? 'up' : null;
  const replPath = replication === 'down'
    ? `M ${REPL_X} ${NODE_A.y + NODE_A.h} L ${REPL_X} ${NODE_B.y}`
    : `M ${REPL_X} ${NODE_B.y} L ${REPL_X} ${NODE_A.y + NODE_A.h}`;
  const replLag = `lag ${30 + ((tick * 7) % 20)}ms`;

  const writeApps = [APPS[0], APPS[1]];
  const readApps = [APPS[1], APPS[2]];

  return (
    <svg
      className="hero-net"
      viewBox="0 0 980 440"
      width="100%"
      role="img"
      aria-label="Database failover: the primary fails, a replica is promoted, writes re-route, and the old primary rejoins as a replica"
    >
      {/* status strip */}
      <g>
        <Pill x={40} y={16} label="writes:" value={status.writes} tone={status.writesTone} />
        <Pill x={210} y={16} label="phase:" value={status.phaseLabel} tone="var(--accent)" />
        <Pill x={420} y={16} label={status.slo} tone="var(--cyan)" />
      </g>

      {/* tier panels */}
      {[
        { name: 'APP SERVERS', x: 40, w: 260 },
        { name: 'DATA TIER', x: 600, w: 320 },
      ].map((p) => (
        <g key={p.name}>
          <rect x={p.x} y={64} width={p.w} height={360} rx={16} fill="var(--bg-elevated)" fillOpacity={0.45} stroke="var(--border)" strokeDasharray="4 6" />
          <text x={p.x + p.w / 2} y={92} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO} letterSpacing={2}>
            {p.name}
          </text>
        </g>
      ))}

      {/* static links: every app can reach both nodes */}
      {APPS.flatMap((app) => [NODE_A, NODE_B].map((node, i) => (
        <path key={`${app.id}-${i}`} d={appToNode(app, node)} className="hn-edge" opacity={0.6} />
      )))}

      {/* active links (key includes phase so flow re-mounts on re-route) */}
      {!reduced && writeTarget && writeApps.map((app) => (
        <path key={`wf-${phase}-${app.id}`} d={appToNode(app, writeTarget)} className="hn-edge-flow"
          style={writesFailing ? { stroke: 'var(--red)' } : undefined} />
      ))}
      {!reduced && readApps.map((app) => (
        <path key={`rf-${phase}-${app.id}`} d={appToNode(app, readTarget)} className="hn-edge-flow" />
      ))}

      {/* replication line + lag */}
      <line x1={REPL_X} y1={NODE_A.y + NODE_A.h} x2={REPL_X} y2={NODE_B.y}
        className="hn-edge hn-edge--dashed" opacity={replication ? 1 : 0.35} />
      <text x={REPL_X + 12} y={(NODE_A.y + NODE_A.h + NODE_B.y) / 2 - 4} fontSize={11} fontFamily={MONO} fill="var(--text-dim)">
        {replication ? `replication ${replication === 'down' ? '↓' : '↑'}` : 'replication ✕'}
      </text>
      <text x={REPL_X + 12} y={(NODE_A.y + NODE_A.h + NODE_B.y) / 2 + 12} fontSize={11} fontFamily={MONO}
        fill={replication ? 'var(--purple)' : 'var(--text-dim)'}>
        {replication ? replLag : 'paused'}
      </text>

      {/* cards */}
      {APPS.map((app) => (
        <g key={app.id} style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={app.x} y={app.y} width={app.w} height={app.h} rx={12} fill="var(--surface)" stroke="var(--border-strong)" />
          <rect x={app.x} y={app.y + 12} width={3} height={app.h - 24} rx={1.5} fill="var(--accent)" />
          <text x={app.x + 18} y={app.y + 22} fill="var(--text)" fontSize={13} fontWeight={600}>{app.id}</text>
          <text x={app.x + 18} y={app.y + 39} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
            {app.id === 'app-3' ? 'reads' : app.id === 'app-2' ? 'reads + writes' : 'writes'}
          </text>
          <circle cx={right(app) - 18} cy={midY(app)} r={4} className="hn-node__dot" />
        </g>
      ))}
      <NodeCard box={NODE_A} view={a} />
      <NodeCard box={NODE_B} view={b} />

      {/* role hint on the left edge of the data nodes */}
      <text x={NODE_A.x - 8} y={NODE_A.y - 8} textAnchor="start" fontSize={10} fontFamily={MONO} fill="var(--text-dim)">
        {aIsPrimary ? 'W' : phase === 'rejoin' ? 'R' : '—'}
      </text>
      <text x={NODE_B.x - 8} y={NODE_B.y - 8} textAnchor="start" fontSize={10} fontFamily={MONO} fill="var(--text-dim)">
        {aIsPrimary ? 'R' : phase === 'rejoin' ? 'W' : 'R/W'}
      </text>

      {/* failed-write markers while no primary accepts writes */}
      {writesFailing && writeApps.map((app) => (
        <text key={`x-${app.id}`} x={NODE_A.x - 16} y={midY(NODE_A) + (app === APPS[0] ? -8 : 12)}
          textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--red)">✕</text>
      ))}

      {/* event badges */}
      {writesFailing && <Badge cx={455} y={70} text="writes failing" tone="var(--red)" soft="var(--red-soft)" />}
      {phase === 'promote' && <Badge cx={760} y={362} text="promoting replica…" tone="var(--amber)" soft="var(--amber-soft)" />}
      {phase === 'promoted' && <Badge cx={760} y={362} text="failover complete" tone="var(--green)" soft="var(--green-soft)" />}
      {phase === 'rejoin' && <Badge cx={760} y={362} text="old primary rejoined" tone="var(--cyan)" soft="var(--accent-soft)" />}

      {/* packets (keys include phase so SMIL routes re-mount) */}
      {!reduced && writeTarget && writeApps.map((app, i) => (
        <PacketOnPath key={`w-${phase}-${app.id}`} d={appToNode(app, writeTarget)}
          color={writesFailing ? 'var(--red)' : 'var(--accent)'} dur={2.2} begin={i * 0.7} />
      ))}
      {!reduced && readApps.map((app, i) => (
        <PacketOnPath key={`r-${phase}-${app.id}`} d={appToNode(app, readTarget)} color="var(--cyan)" dur={2.4} begin={0.35 + i * 0.8} />
      ))}
      {!reduced && replication && [0, 0.6].map((begin) => (
        <PacketOnPath key={`repl-${phase}-${begin}`} d={replPath} color="var(--purple)" dur={1.2} begin={begin} />
      ))}
    </svg>
  );
}
