import { useEffect, useState, type CSSProperties } from 'react';

// A "living" architecture diagram for the landing hero:
// Clients -> Load Balancer -> API servers -> Cache / Primary DB -> Replica.
// Packets travel continuously along request routes using native SVG
// <animateMotion>, which needs no React re-renders and is reliable across browsers.

interface Node {
  id: string;
  x: number; // center x
  y: number; // center y
  label: string;
  tone: string;
  w?: number;
}

const NODE_W = 96;
const NODE_H = 38;

const NODES: Node[] = [
  { id: 'c1', x: 80, y: 100, label: 'Client', tone: 'var(--accent)' },
  { id: 'c2', x: 80, y: 220, label: 'Client', tone: 'var(--accent)' },
  { id: 'c3', x: 80, y: 340, label: 'Client', tone: 'var(--accent)' },
  { id: 'lb', x: 290, y: 220, label: 'Load Balancer', tone: 'var(--amber)', w: 132 },
  { id: 's1', x: 500, y: 100, label: 'API', tone: 'var(--cyan)' },
  { id: 's2', x: 500, y: 220, label: 'API', tone: 'var(--cyan)' },
  { id: 's3', x: 500, y: 340, label: 'API', tone: 'var(--cyan)' },
  { id: 'cache', x: 710, y: 130, label: 'Cache', tone: 'var(--green)' },
  { id: 'db', x: 710, y: 310, label: 'Primary DB', tone: 'var(--purple)', w: 118 },
  { id: 'rep', x: 900, y: 310, label: 'Replica', tone: 'var(--purple)' },
];

const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, Node>;
const widthOf = (n: Node) => n.w ?? NODE_W;

// Smooth horizontal S-curve from the right edge of `a` to the left edge of `b`.
function curve(a: Node, b: Node, withMove: boolean) {
  const x1 = a.x + widthOf(a) / 2;
  const x2 = b.x - widthOf(b) / 2;
  const mx = (x1 + x2) / 2;
  const start = withMove ? `M ${x1} ${a.y} ` : `L ${x1} ${a.y} `;
  return `${start}C ${mx} ${a.y}, ${mx} ${b.y}, ${x2} ${b.y}`;
}

// A multi-hop route: curve into each node, then cross the node to its right edge.
function routePath(ids: string[]) {
  let d = '';
  for (let i = 0; i < ids.length - 1; i++) {
    d += (i === 0 ? '' : ' ') + curve(byId[ids[i]], byId[ids[i + 1]], i === 0);
  }
  return d;
}

const EDGES: [string, string][] = [
  ['c1', 'lb'], ['c2', 'lb'], ['c3', 'lb'],
  ['lb', 's1'], ['lb', 's2'], ['lb', 's3'],
  ['s1', 'cache'], ['s2', 'cache'], ['s2', 'db'], ['s3', 'db'],
  ['db', 'rep'],
];

const ROUTES: { ids: string[]; color: string; dur: number; begin: number }[] = [
  { ids: ['c1', 'lb', 's1', 'cache'], color: 'var(--accent)', dur: 4.6, begin: 0 },
  { ids: ['c3', 'lb', 's1', 'cache'], color: 'var(--green)', dur: 4.8, begin: 0.7 },
  { ids: ['c2', 'lb', 's2', 'db', 'rep'], color: 'var(--purple)', dur: 5.8, begin: 1.3 },
  { ids: ['c3', 'lb', 's3', 'db'], color: 'var(--cyan)', dur: 5.0, begin: 2.2 },
  { ids: ['c2', 'lb', 's2', 'cache'], color: 'var(--green)', dur: 4.4, begin: 3.0 },
  { ids: ['c1', 'lb', 's3', 'db'], color: 'var(--accent)', dur: 5.2, begin: 3.8 },
];

function usePrefersReducedMotion() {
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

export function HeroNetwork() {
  const reduced = usePrefersReducedMotion();

  return (
    <svg className="hero-net" viewBox="0 0 980 440" width="100%" role="img" aria-label="Animated system architecture: clients, load balancer, API servers, cache, database and replica">
      {/* static edges + a slow dashed "current" on top */}
      {EDGES.map(([a, b]) => {
        const d = curve(byId[a], byId[b], true);
        const dashed = a === 'db' && b === 'rep';
        return (
          <g key={`${a}-${b}`}>
            <path d={d} className={`hn-edge ${dashed ? 'hn-edge--dashed' : ''}`} />
            {!reduced && <path d={d} className="hn-edge-flow" />}
          </g>
        );
      })}

      {/* nodes */}
      {NODES.map((n, i) => {
        const w = widthOf(n);
        const style = { '--tone': n.tone, animationDelay: `${(i % 5) * 0.45}s` } as CSSProperties;
        return (
          <g key={n.id} className="hn-node" style={style}>
            <rect x={n.x - w / 2} y={n.y - NODE_H / 2} width={w} height={NODE_H} rx={10} className="hn-node__box" />
            <circle cx={n.x - w / 2 + 15} cy={n.y} r={4} className="hn-node__dot" />
            <text x={n.x - w / 2 + 27} y={n.y + 4} className="hn-node__label">
              {n.label}
            </text>
          </g>
        );
      })}

      {/* flowing request packets */}
      {!reduced &&
        ROUTES.map((r, i) => {
          const d = routePath(r.ids);
          const common = { dur: `${r.dur}s`, begin: `${r.begin}s`, repeatCount: 'indefinite' };
          return (
            <g key={i} opacity={0} style={{ color: r.color }}>
              <animateMotion {...common} path={d} />
              <animate {...common} attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.9;1" />
              <circle r={11} fill="currentColor" opacity={0.18} />
              <circle r={4.5} fill="currentColor" className="hn-packet" />
            </g>
          );
        })}
    </svg>
  );
}
