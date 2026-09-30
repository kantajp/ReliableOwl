// Hero visual: an observability-style topology with EDGE / COMPUTE / DATA tiers,
// live metrics on each card, and request packets flowing between the tiers.
// Dependency-free SVG, theme-aware (colors from CSS variables), and it stops
// animating when the user prefers reduced motion.
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
      <circle r={10} fill="currentColor" opacity={0.18} />
      <circle r={4} fill="currentColor" className="hn-packet" />
    </g>
  );
}

// Horizontal S-curve between two points.
function sCurve(x1: number, y1: number, x2: number, y2: number, move: boolean) {
  const mx = (x1 + x2) / 2;
  return `${move ? 'M' : 'L'} ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

const MONO = 'var(--font-mono)';

interface Card {
  id: string;
  col: number;
  y: number;
  title: string;
  tone: string;
}
const COL_X = [150, 490, 830];
const CARD_W = 210;
const CARD_H = 56;
const CARDS: Card[] = [
  { id: 'cdn', col: 0, y: 112, title: 'CDN', tone: 'var(--cyan)' },
  { id: 'lb', col: 0, y: 262, title: 'Load Balancer', tone: 'var(--amber)' },
  { id: 'api1', col: 1, y: 92, title: 'api-1', tone: 'var(--accent)' },
  { id: 'api2', col: 1, y: 192, title: 'api-2', tone: 'var(--accent)' },
  { id: 'api3', col: 1, y: 292, title: 'api-3', tone: 'var(--accent)' },
  { id: 'cache', col: 2, y: 92, title: 'Redis · cache', tone: 'var(--green)' },
  { id: 'db', col: 2, y: 192, title: 'Postgres · primary', tone: 'var(--purple)' },
  { id: 'rep', col: 2, y: 292, title: 'Postgres · replica', tone: 'var(--purple)' },
];
const cardById = Object.fromEntries(CARDS.map((c) => [c.id, c])) as Record<string, Card>;
const cLeft = (c: Card) => COL_X[c.col] - CARD_W / 2;
const cRight = (c: Card) => COL_X[c.col] + CARD_W / 2;
const cMid = (c: Card) => c.y + CARD_H / 2;

// Route that enters from the left edge, then hops card to card.
function topoRoute(ids: string[]) {
  const cards = ids.map((id) => cardById[id]);
  let d = `M 8 ${cMid(cards[0])} L ${cLeft(cards[0])} ${cMid(cards[0])}`;
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i], b = cards[i + 1];
    d += ' ' + sCurve(cRight(a), cMid(a), cLeft(b), cMid(b), false);
  }
  return d;
}

function metricFor(id: string, t: number) {
  switch (id) {
    case 'cdn': return `hit ${92 + (t % 5)}%`;
    case 'lb': return `${(11.8 + ((t * 7) % 13) / 10).toFixed(1)}k rps`;
    case 'api1': return `p99 ${14 + (t % 9)}ms`;
    case 'api2': return `p99 ${14 + ((t + 3) % 9)}ms`;
    case 'api3': return `p99 ${14 + ((t + 6) % 9)}ms`;
    case 'cache': return `hit ${86 + ((t * 3) % 7)}%`;
    case 'db': return `${(2.6 + ((t * 5) % 9) / 10).toFixed(1)}k qps`;
    case 'rep': return `lag ${30 + ((t * 11) % 40)}ms`;
    default: return '';
  }
}

export function HeroTopology() {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((v) => v + 1), 1400);
    return () => clearInterval(id);
  }, [reduced]);

  const links: [string, string][] = [
    ['lb', 'api1'], ['lb', 'api2'], ['lb', 'api3'],
    ['api1', 'cache'], ['api2', 'cache'], ['api2', 'db'], ['api3', 'db'],
  ];
  const routes = [
    { ids: ['lb', 'api1', 'cache'], color: 'var(--accent)', dur: 4.2, begin: 0 },
    { ids: ['lb', 'api2', 'db'], color: 'var(--purple)', dur: 4.6, begin: 0.9 },
    { ids: ['lb', 'api3', 'db'], color: 'var(--cyan)', dur: 4.4, begin: 1.8 },
    { ids: ['lb', 'api2', 'cache'], color: 'var(--green)', dur: 4.0, begin: 2.7 },
    { ids: ['cdn'], color: 'var(--cyan)', dur: 2.2, begin: 0.4 },
  ];
  const db = cardById.db, rep = cardById.rep;

  return (
    <svg className="hero-net" viewBox="0 0 980 440" width="100%" role="img" aria-label="Live topology: edge, compute and data tiers with request flow and metrics">
      {/* tier panels */}
      {['EDGE', 'COMPUTE', 'DATA'].map((name, i) => (
        <g key={name}>
          <rect x={COL_X[i] - 140} y={18} width={280} height={404} rx={16} fill="var(--bg-elevated)" fillOpacity={0.45} stroke="var(--border)" strokeDasharray="4 6" />
          <text x={COL_X[i]} y={46} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO} letterSpacing={2}>
            {name}
          </text>
        </g>
      ))}

      {/* inbound traffic */}
      {['cdn', 'lb'].map((id) => (
        <line key={id} x1={0} y1={cMid(cardById[id])} x2={cLeft(cardById[id])} y2={cMid(cardById[id])} className="hn-edge" />
      ))}
      {/* tier-to-tier links */}
      {links.map(([a, b]) => {
        const d = sCurve(cRight(cardById[a]), cMid(cardById[a]), cLeft(cardById[b]), cMid(cardById[b]), true);
        return (
          <g key={`${a}-${b}`}>
            <path d={d} className="hn-edge" />
            {!reduced && <path d={d} className="hn-edge-flow" />}
          </g>
        );
      })}
      {/* replication (within the data tier) */}
      <line x1={COL_X[2]} y1={db.y + CARD_H} x2={COL_X[2]} y2={rep.y} className="hn-edge hn-edge--dashed" />

      {/* cards */}
      {CARDS.map((c) => {
        const x = cLeft(c);
        return (
          <g key={c.id} style={{ '--tone': c.tone } as CSSProperties}>
            <rect x={x} y={c.y} width={CARD_W} height={CARD_H} rx={12} fill="var(--surface)" stroke="var(--border-strong)" />
            <rect x={x} y={c.y + 12} width={3} height={CARD_H - 24} rx={1.5} fill={c.tone} />
            <text x={x + 18} y={c.y + 23} fill="var(--text)" fontSize={13} fontWeight={600}>
              {c.title}
            </text>
            <text x={x + 18} y={c.y + 41} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
              {metricFor(c.id, tick)}
            </text>
            <circle cx={x + CARD_W - 18} cy={cMid(c)} r={4} className="hn-node__dot" />
          </g>
        );
      })}

      {!reduced && routes.map((r, i) => <PacketOnPath key={i} d={topoRoute(r.ids)} color={r.color} dur={r.dur} begin={r.begin} />)}
    </svg>
  );
}
