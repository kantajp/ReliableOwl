// Hero visual: a "self-healing topology". An EDGE / COMPUTE / DATA tier
// topology driven by a looping ~12s incident scenario:
// healthy -> api-2 fails -> health check detects it -> LB reroutes -> api-2
// restarts and rejoins the pool. A watchman owl keeps an eye on things.
// Dependency-free SVG, theme-aware (CSS variables only), reduced-motion safe.
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
function PacketOnPath({ d, color, dur, begin, r = 4 }: { d: string; color: string; dur: number; begin: number; r?: number }) {
  const timing = { dur: `${dur}s`, begin: `${begin}s`, repeatCount: 'indefinite' };
  return (
    <g opacity={0} style={{ color }}>
      <animateMotion {...timing} path={d} />
      <animate {...timing} attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.85;1" />
      <circle r={r * 2.5} fill="currentColor" opacity={0.18} />
      <circle r={r} fill="currentColor" className="hn-packet" />
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
  { id: 'cdn', col: 0, y: 132, title: 'CDN', tone: 'var(--cyan)' },
  { id: 'lb', col: 0, y: 290, title: 'Load Balancer', tone: 'var(--amber)' },
  { id: 'api1', col: 1, y: 104, title: 'api-1', tone: 'var(--green)' },
  { id: 'api2', col: 1, y: 212, title: 'api-2', tone: 'var(--green)' },
  { id: 'api3', col: 1, y: 320, title: 'api-3', tone: 'var(--green)' },
  { id: 'cache', col: 2, y: 104, title: 'Redis · cache', tone: 'var(--green)' },
  { id: 'db', col: 2, y: 212, title: 'Postgres · primary', tone: 'var(--green)' },
  { id: 'rep', col: 2, y: 320, title: 'Postgres · replica', tone: 'var(--green)' },
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

// ---- scenario -------------------------------------------------------------
type Phase = 'healthy' | 'failing' | 'detected' | 'rerouted' | 'recovering';

const TICK_MS = 500;
const LOOP_STEPS = 24; // 24 * 500ms = 12s

function phaseAt(step: number): Phase {
  if (step < 6) return 'healthy';
  if (step < 10) return 'failing';
  if (step < 13) return 'detected';
  if (step < 18) return 'rerouted';
  if (step < 22) return 'recovering';
  return 'healthy';
}

const STATUS: Record<Phase, { label: string; color: string; event: string; budget: number }> = {
  healthy: { label: 'healthy', color: 'var(--green)', event: 'all checks passing', budget: 72.0 },
  failing: { label: 'degraded', color: 'var(--red)', event: 'api-2 5xx spike', budget: 71.8 },
  detected: { label: 'degraded', color: 'var(--red)', event: 'health check failed · api-2', budget: 71.6 },
  rerouted: { label: 'recovering', color: 'var(--amber)', event: 'api-2 drained from pool', budget: 71.5 },
  recovering: { label: 'recovering', color: 'var(--amber)', event: 'api-2 restarting', budget: 71.5 },
};

// Static frame for reduced motion: the rerouted state still tells the story.
const STATIC_STEP = 15;

function metricFor(id: string, t: number, phase: Phase) {
  const s = Math.floor(t / 2);
  const hot = phase === 'rerouted' || phase === 'recovering';
  switch (id) {
    case 'cdn': return `hit ${92 + (s % 5)}%`;
    case 'lb': return `${(11.8 + ((s * 7) % 13) / 10).toFixed(1)}k rps`;
    case 'api1': return `p99 ${(hot ? 22 : 14) + (s % 9)}ms`;
    case 'api2':
      if (phase === 'failing' || phase === 'detected') return `5xx ↑ ${31 + ((s * 7) % 12)}%`;
      if (phase === 'rerouted') return 'out of rotation';
      if (phase === 'recovering') return 'restarting…';
      return `p99 ${14 + ((s + 3) % 9)}ms`;
    case 'api3': return `p99 ${(hot ? 23 : 14) + ((s + 6) % 9)}ms`;
    case 'cache': return `hit ${86 + ((s * 3) % 7)}%`;
    case 'db': return `${(2.6 + ((s * 5) % 9) / 10).toFixed(1)}k qps`;
    case 'rep': return `lag ${30 + ((s * 11) % 40)}ms`;
    default: return '';
  }
}

interface Route {
  d: string;
  color: string;
  dur: number;
  begin: number;
  r?: number;
}

function routesFor(phase: Phase): Route[] {
  const cdn: Route = { d: topoRoute(['cdn']), color: 'var(--cyan)', dur: 2.2, begin: 0.4 };
  const api2 = cardById.api2;
  // Request that reaches api-2, errors out and falls away.
  const drop = `${topoRoute(['lb', 'api2'])} L ${cLeft(api2) + 4} ${cMid(api2) + 30}`;
  switch (phase) {
    case 'healthy':
      return [
        { d: topoRoute(['lb', 'api1', 'cache']), color: 'var(--accent)', dur: 4.2, begin: 0 },
        { d: topoRoute(['lb', 'api2', 'db']), color: 'var(--purple)', dur: 4.6, begin: 0.9 },
        { d: topoRoute(['lb', 'api3', 'db']), color: 'var(--cyan)', dur: 4.4, begin: 1.8 },
        { d: topoRoute(['lb', 'api2', 'cache']), color: 'var(--green)', dur: 4.0, begin: 2.7 },
        cdn,
      ];
    case 'failing':
    case 'detected':
      return [
        { d: topoRoute(['lb', 'api1', 'cache']), color: 'var(--accent)', dur: 4.2, begin: 0 },
        { d: topoRoute(['lb', 'api3', 'db']), color: 'var(--cyan)', dur: 4.4, begin: 1.8 },
        { d: drop, color: 'var(--red)', dur: 2.4, begin: 0.3 },
        { d: drop, color: 'var(--red)', dur: 2.4, begin: 1.5 },
        cdn,
      ];
    case 'rerouted':
    case 'recovering': {
      const rs: Route[] = [
        { d: topoRoute(['lb', 'api1', 'cache']), color: 'var(--accent)', dur: 4.2, begin: 0 },
        { d: topoRoute(['lb', 'api1', 'cache']), color: 'var(--green)', dur: 4.2, begin: 2.1 },
        { d: topoRoute(['lb', 'api3', 'db']), color: 'var(--cyan)', dur: 4.4, begin: 1.0 },
        { d: topoRoute(['lb', 'api3', 'db']), color: 'var(--purple)', dur: 4.4, begin: 3.2 },
        cdn,
      ];
      // Small health-check probe while api-2 comes back.
      if (phase === 'recovering') rs.push({ d: topoRoute(['lb', 'api2']), color: 'var(--amber)', dur: 1.6, begin: 0, r: 2.5 });
      return rs;
    }
  }
}

// ---- watchman owl -----------------------------------------------------------
function WatchOwl({ alarm, animate }: { alarm: boolean; animate: boolean }) {
  const pupilStyle: CSSProperties = {
    transform: alarm ? 'translate(-1.4px, 1.2px)' : 'translate(0px, 0px)',
    transition: animate ? 'transform 0.35s ease' : undefined,
  };
  const pupil = alarm ? 'var(--red)' : 'var(--accent)';
  return (
    <g transform="translate(918 2) scale(1.72)" aria-hidden="true">
      <path d="M4.5 8.5L16 13.2L27.5 8.5" fill="none" stroke="var(--text)" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={10.6} cy={18} r={5.6} fill="var(--surface)" stroke="var(--text)" strokeWidth={1.8} />
      <circle cx={21.4} cy={18} r={5.6} fill="var(--surface)" stroke="var(--text)" strokeWidth={1.8} />
      <g style={pupilStyle}>
        <circle cx={11.4} cy={18.2} r={2.5} fill={pupil} />
        <circle cx={22.2} cy={18.2} r={2.5} fill={pupil} />
      </g>
      <path d="M14.6 24.2H17.4L16 26.4Z" fill="var(--text)" stroke="var(--text)" strokeWidth={0.8} strokeLinejoin="round" />
      {alarm && (
        <text x={-1} y={9} textAnchor="middle" fill="var(--red)" fontSize={9} fontWeight={700} fontFamily={MONO}>
          !
        </text>
      )}
    </g>
  );
}

// ---- component --------------------------------------------------------------
export function HeroSelfHealing({ owl = true }: { owl?: boolean }) {
  const reduced = useReducedMotion();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setTick((v) => v + 1), TICK_MS);
    return () => clearInterval(id);
  }, [reduced]);

  const step = reduced ? STATIC_STEP : tick % LOOP_STEPS;
  const phase = phaseAt(step);
  const status = STATUS[phase];
  const api2Down = phase !== 'healthy';
  const api2Out = phase === 'rerouted' || phase === 'recovering';
  const api2Red = phase === 'failing' || phase === 'detected';
  const api2Tone = api2Red ? 'var(--red)' : phase === 'recovering' ? 'var(--amber)' : phase === 'rerouted' ? 'var(--text-dim)' : 'var(--green)';

  const links: [string, string][] = [
    ['lb', 'api1'], ['lb', 'api2'], ['lb', 'api3'],
    ['api1', 'cache'], ['api2', 'cache'], ['api2', 'db'], ['api3', 'db'],
  ];
  const db = cardById.db, rep = cardById.rep, lb = cardById.lb;
  const routes = reduced ? [] : routesFor(phase);

  const badge =
    phase === 'detected' ? { text: 'health check failed', color: 'var(--red)', soft: 'var(--red-soft)' }
      : phase === 'rerouted' ? { text: 'rerouted · api-2 out', color: 'var(--amber)', soft: 'var(--amber-soft)' }
        : phase === 'recovering' ? { text: 'probing api-2…', color: 'var(--amber)', soft: 'var(--amber-soft)' }
          : null;

  return (
    <svg
      className="hero-net"
      viewBox="0 0 980 440"
      width="100%"
      role="img"
      aria-label="Self-healing topology: an API instance fails, health checks detect it, the load balancer reroutes traffic, and the instance recovers"
    >
      {/* status strip */}
      <g fontFamily={MONO} fontSize={12}>
        <rect x={10} y={10} width={890} height={34} rx={10} fill="var(--surface)" stroke="var(--border)" />
        <circle cx={30} cy={27} r={4} fill={status.color} />
        <text x={44} y={31} fill="var(--text)">
          SLO 99.95% <tspan fill="var(--green)">✓</tspan>
        </text>
        <text x={190} y={31} fill="var(--text-muted)">
          error budget <tspan fill="var(--text)">{status.budget.toFixed(1)}%</tspan>
        </text>
        <text x={380} y={31} fill="var(--text-muted)">
          status: <tspan fill={status.color} fontWeight={700}>{status.label}</tspan>
        </text>
        <text x={886} y={31} textAnchor="end" fill="var(--text-dim)">
          {status.event}
        </text>
      </g>

      {/* tier panels */}
      {['EDGE', 'COMPUTE', 'DATA'].map((name, i) => (
        <g key={name}>
          <rect x={COL_X[i] - 140} y={58} width={280} height={374} rx={16} fill="var(--bg-elevated)" fillOpacity={0.45} stroke="var(--border)" strokeDasharray="4 6" />
          <text x={COL_X[i]} y={84} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO} letterSpacing={2}>
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
        const touchesApi2 = a === 'api2' || b === 'api2';
        const dimmed = touchesApi2 && api2Out;
        const hot = touchesApi2 && api2Red && a === 'lb';
        const style: CSSProperties | undefined = dimmed
          ? { opacity: 0.35 }
          : hot
            ? { stroke: 'var(--red)', opacity: 0.7 }
            : touchesApi2 && api2Down
              ? { opacity: 0.5 }
              : undefined;
        return (
          <g key={`${a}-${b}`}>
            <path d={d} className={dimmed ? 'hn-edge hn-edge--dashed' : 'hn-edge'} style={style} />
            {!reduced && !(touchesApi2 && api2Down) && <path d={d} className="hn-edge-flow" />}
          </g>
        );
      })}

      {/* replication (within the data tier) */}
      <line x1={COL_X[2]} y1={db.y + CARD_H} x2={COL_X[2]} y2={rep.y} className="hn-edge hn-edge--dashed" />

      {/* LB detection badge */}
      {badge && (
        <g fontFamily={MONO} fontSize={11}>
          <rect x={cLeft(lb)} y={lb.y - 30} width={CARD_W} height={22} rx={11} fill={badge.soft} stroke={badge.color} strokeOpacity={0.6} />
          <text x={COL_X[0]} y={lb.y - 15} textAnchor="middle" fill={badge.color} fontWeight={600}>
            {badge.text}
          </text>
        </g>
      )}

      {/* cards */}
      {CARDS.map((c) => {
        const x = cLeft(c);
        const isApi2 = c.id === 'api2';
        const tone = isApi2 ? api2Tone : c.tone;
        const border = isApi2 && api2Red ? 'var(--red)' : isApi2 && phase === 'recovering' ? 'var(--amber)' : 'var(--border-strong)';
        const pill = isApi2 && api2Red ? { text: 'unhealthy', color: 'var(--red)', soft: 'var(--red-soft)' }
          : isApi2 && phase === 'recovering' ? { text: 'restarting', color: 'var(--amber)', soft: 'var(--amber-soft)' }
            : null;
        return (
          <g key={c.id} style={{ '--tone': tone } as CSSProperties} opacity={isApi2 && phase === 'rerouted' ? 0.7 : 1}>
            <rect x={x} y={c.y} width={CARD_W} height={CARD_H} rx={12} fill="var(--surface)" stroke={border} strokeWidth={isApi2 && pill ? 1.5 : 1} />
            <rect x={x} y={c.y + 12} width={3} height={CARD_H - 24} rx={1.5} fill={tone} />
            <text x={x + 18} y={c.y + 23} fill="var(--text)" fontSize={13} fontWeight={600}>
              {c.title}
            </text>
            {pill && (
              <g fontFamily={MONO} fontSize={10}>
                <rect x={x + 66} y={c.y + 10} width={78} height={17} rx={8.5} fill={pill.soft} />
                <text x={x + 105} y={c.y + 22} textAnchor="middle" fill={pill.color} fontWeight={600}>
                  {pill.text}
                </text>
              </g>
            )}
            <text x={x + 18} y={c.y + 41} fill={isApi2 && api2Red ? 'var(--red)' : 'var(--text-dim)'} fontSize={11} fontFamily={MONO}>
              {metricFor(c.id, reduced ? 0 : tick, phase)}
            </text>
            <circle cx={x + CARD_W - 18} cy={cMid(c)} r={4} className="hn-node__dot" />
          </g>
        );
      })}

      {routes.map((r, i) => (
        <PacketOnPath key={`${api2Red ? 'down' : api2Out ? 'out' : 'ok'}-${i}`} d={r.d} color={r.color} dur={r.dur} begin={r.begin} r={r.r} />
      ))}

      {owl && <WatchOwl alarm={api2Red} animate={!reduced} />}
    </svg>
  );
}
