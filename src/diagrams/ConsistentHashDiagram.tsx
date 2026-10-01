// Consistent-hashing diagram for the "consistent hashing" deep-dive.
//  - ConsistentHashRing: a hash ring with 3 nodes (shards) owning clockwise arcs
//    and 8 keys mapped to their first node clockwise. A toggle adds a 4th node D
//    between two existing nodes; only the keys that fall into D's new arc change
//    owner, demonstrating that adding a node moves ~1/N of the keys instead of
//    nearly all of them (as a plain `% N` scheme would).
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useMemo, useEffect, useState, type CSSProperties } from 'react';
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

// Approximate rendered text width: full-width (CJK) ≈ 13px, ASCII ≈ 7px at 13px font.
function textWidth(text: string, fontPx = 13): number {
  const scale = fontPx / 13;
  const px = [...text].reduce((sum, ch) => sum + (/[\x00-\xff]/.test(ch) ? 7 : 13), 0);
  return px * scale;
}

// ============================================================================
// Geometry
// ============================================================================
const VIEW_W = 760;
const VIEW_H = 420;
const CX = 250;
const CY = 210;
const R = 130;

// Angle 0 = top (12 o'clock), increasing clockwise. Point on the ring at `deg`.
function ringPoint(deg: number, radius = R) {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + radius * Math.sin(rad), y: CY - radius * Math.cos(rad) };
}

interface RingNode {
  id: string;
  labelJa: string;
  labelEn: string;
  deg: number; // position on the ring (0..360, clockwise from top)
  color: string; // CSS variable
  soft: string; // soft fill variable for the owned arc
}

// 3 base nodes at fixed angles, plus node D (added between A and B).
const NODE_A: RingNode = { id: 'A', labelJa: 'ノードA', labelEn: 'node A', deg: 20, color: 'var(--accent)', soft: 'var(--accent-soft)' };
const NODE_B: RingNode = { id: 'B', labelJa: 'ノードB', labelEn: 'node B', deg: 150, color: 'var(--cyan)', soft: 'var(--surface)' };
const NODE_C: RingNode = { id: 'C', labelJa: 'ノードC', labelEn: 'node C', deg: 265, color: 'var(--purple)', soft: 'var(--surface)' };
const NODE_D: RingNode = { id: 'D', labelJa: 'ノードD', labelEn: 'node D', deg: 85, color: 'var(--green)', soft: 'var(--green-soft)' };

const BASE_NODES: RingNode[] = [NODE_A, NODE_B, NODE_C];
const WITH_D_NODES: RingNode[] = [NODE_A, NODE_D, NODE_B, NODE_C];

// 8 keys at fixed angles. Chosen so a couple fall in the A→D arc (20°..85°).
const KEYS: { id: string; deg: number }[] = [
  { id: 'k1', deg: 42 },
  { id: 'k2', deg: 70 },
  { id: 'k3', deg: 110 },
  { id: 'k4', deg: 175 },
  { id: 'k5', deg: 205 },
  { id: 'k6', deg: 240 },
  { id: 'k7', deg: 300 },
  { id: 'k8', deg: 345 },
];

// Owner of a key = first node clockwise from the key's angle (wrapping at 360).
function ownerOf(keyDeg: number, nodes: RingNode[]): RingNode {
  const sorted = [...nodes].sort((a, b) => a.deg - b.deg);
  for (const n of sorted) {
    if (n.deg >= keyDeg) return n;
  }
  // Wrapped past the last node → owned by the first node clockwise (smallest deg).
  return sorted[0];
}

// Owned arc for a node = from the previous node clockwise up to this node.
// Returns [startDeg, endDeg] where the arc sweeps clockwise start→end.
function ownedArc(node: RingNode, nodes: RingNode[]): [number, number] {
  const sorted = [...nodes].sort((a, b) => a.deg - b.deg);
  const i = sorted.findIndex((n) => n.id === node.id);
  const prev = sorted[(i - 1 + sorted.length) % sorted.length];
  return [prev.deg, node.deg];
}

// SVG arc path along the ring from startDeg clockwise to endDeg (both from top).
function arcPath(startDeg: number, endDeg: number, radius = R): string {
  const sweep = (endDeg - startDeg + 360) % 360;
  const p0 = ringPoint(startDeg, radius);
  const p1 = ringPoint(endDeg, radius);
  const largeArc = sweep > 180 ? 1 : 0;
  // clockwise in screen space (y down) corresponds to SVG sweep-flag 1.
  return `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

// Precomputed ownership for both states + the set of keys that move when D joins.
interface Precomputed {
  baseOwner: Record<string, string>; // keyId -> nodeId (3 nodes)
  withDOwner: Record<string, string>; // keyId -> nodeId (4 nodes)
  movedKeys: Set<string>; // keys whose owner changed when D joined
}

const PRECOMPUTED: Precomputed = (() => {
  const baseOwner: Record<string, string> = {};
  const withDOwner: Record<string, string> = {};
  const movedKeys = new Set<string>();
  for (const k of KEYS) {
    const base = ownerOf(k.deg, BASE_NODES).id;
    const withD = ownerOf(k.deg, WITH_D_NODES).id;
    baseOwner[k.id] = base;
    withDOwner[k.id] = withD;
    if (base !== withD) movedKeys.add(k.id);
  }
  return { baseOwner, withDOwner, movedKeys };
})();

function nodeById(id: string): RingNode {
  return WITH_D_NODES.find((n) => n.id === id) ?? NODE_A;
}

// ============================================================================
// ConsistentHashRing
// ============================================================================
export function ConsistentHashRing() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [added, setAdded] = useState(false);

  const nodes = added ? WITH_D_NODES : BASE_NODES;
  const owner = added ? PRECOMPUTED.withDOwner : PRECOMPUTED.baseOwner;
  const movedCount = PRECOMPUTED.movedKeys.size;
  const totalKeys = KEYS.length;

  // Fade timing for the newly added node / arc; instant under reduced motion.
  const fade = reduced ? 'none' : 'opacity 500ms ease, fill-opacity 500ms ease';

  // Precompute owned arcs for the active node set.
  const arcs = useMemo(
    () => nodes.map((n) => ({ node: n, span: ownedArc(n, nodes) })),
    [nodes],
  );

  // Legend layout (right side).
  const legendX = 540;
  const legendTop = 70;

  return (
    <DiagramFrame
      height={400}
      caption={tr(
        'ノードを足すと、動くのは一部のキーだけ（約 1/N）。`% N` のように全体がずれない。',
        'Adding a node moves only a slice of the keys (~1/N) — unlike `% N`, where nearly everything shifts.',
      )}
      controls={
        <>
          <ToggleButton active={!added} onClick={() => setAdded(false)} label={tr('3 ノード', '3 nodes')} />
          <ToggleButton active={added} onClick={() => setAdded(true)} label={tr('ノードを追加 (D)', 'add a node (D)')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          'ハッシュリング上に3つのノードと8つのキーを配置し、ノードDを追加すると一部のキーだけが再配置される図',
          'A hash ring with 3 nodes and 8 keys; adding node D reassigns only a few keys',
        )}
      >
        {/* owned arcs (shaded faintly in each owner's color) */}
        {arcs.map(({ node, span }) => {
          const isD = node.id === 'D';
          return (
            <path
              key={`arc-${node.id}`}
              d={arcPath(span[0], span[1])}
              fill="none"
              stroke={node.color}
              strokeWidth={16}
              strokeLinecap="round"
              opacity={isD ? (added ? 0.4 : 0) : 0.22}
              style={{ transition: fade }}
            />
          );
        })}

        {/* the ring itself */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--border-strong)" strokeWidth={1.5} />

        {/* 0 / max wrap mark at the top */}
        {(() => {
          const top = ringPoint(0);
          const label = tr('0 / 最大', '0 / max');
          const w = textWidth(label, 11) + 14;
          return (
            <g>
              <line x1={top.x} y1={top.y - 10} x2={top.x} y2={top.y + 10} stroke="var(--text-dim)" strokeWidth={1.5} />
              <rect x={top.x - w / 2} y={top.y - 34} width={w} height={18} rx={6} fill="var(--bg-elevated)" stroke="var(--border)" />
              <text x={top.x} y={top.y - 21} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
                {label}
              </text>
            </g>
          );
        })()}
        {/* clockwise hint arrow mark near the top-right */}
        {(() => {
          const p = ringPoint(32, R);
          return (
            <text x={p.x + 10} y={p.y} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
              {tr('時計回り ↻', 'clockwise ↻')}
            </text>
          );
        })()}

        {/* keys: small dots, colored by their owner, with a short tick toward the ring */}
        {KEYS.map((k) => {
          const ownerNode = nodeById(owner[k.id]);
          const moved = added && PRECOMPUTED.movedKeys.has(k.id);
          const onRing = ringPoint(k.deg, R);
          const outer = ringPoint(k.deg, R + 26);
          return (
            <g key={k.id} style={{ transition: fade }}>
              {/* indicator line from key to its owner's arc on the ring */}
              <line x1={outer.x} y1={outer.y} x2={onRing.x} y2={onRing.y} stroke={ownerNode.color} strokeWidth={1.25} opacity={0.5} />
              {/* key dot on the ring, colored by current owner */}
              <circle cx={onRing.x} cy={onRing.y} r={5} fill={ownerNode.color} stroke="var(--surface)" strokeWidth={1} style={{ transition: reduced ? 'none' : 'fill 450ms ease' }} />
              {/* "moved" highlight ring in green */}
              {moved && (
                <circle cx={onRing.x} cy={onRing.y} r={9} fill="none" stroke="var(--green)" strokeWidth={2} opacity={0.95} />
              )}
              {/* key label just outside the ring */}
              <text
                x={outer.x}
                y={outer.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={moved ? 'var(--green)' : 'var(--text-muted)'}
                fontSize={11}
                fontWeight={moved ? 700 : 500}
                fontFamily={MONO}
              >
                {k.id}
              </text>
            </g>
          );
        })}

        {/* nodes: labeled dots in distinct colors */}
        {WITH_D_NODES.map((n) => {
          const isD = n.id === 'D';
          const visible = isD ? added : true;
          const p = ringPoint(n.deg, R);
          const label = tr(n.labelJa, n.labelEn);
          const lw = textWidth(label, 11) + 16;
          // Push the label pill outward along the radius so it sits off the ring.
          const lp = ringPoint(n.deg, R + (n.deg > 90 && n.deg < 270 ? 24 : 20));
          const below = n.deg > 90 && n.deg < 270;
          const pillY = below ? lp.y + 6 : lp.y - 24;
          return (
            <g
              key={`node-${n.id}`}
              style={{ '--tone': n.color, opacity: visible ? 1 : 0, transition: fade } as CSSProperties}
            >
              <circle cx={p.x} cy={p.y} r={11} fill={n.color} opacity={0.2} />
              <circle cx={p.x} cy={p.y} r={6} className="hn-node__dot" />
              <rect x={p.x - lw / 2} y={pillY} width={lw} height={18} rx={9} fill={n.soft} stroke={n.color} />
              <text x={p.x} y={pillY + 13} textAnchor="middle" fill={n.color} fontSize={11} fontWeight={700} fontFamily={MONO}>
                {label}
              </text>
            </g>
          );
        })}

        {/* ===== legend / readout (right side) ===== */}
        <text x={legendX} y={legendTop - 18} fill="var(--text)" fontSize={14} fontWeight={700}>
          {tr('ハッシュリング', 'hash ring')}
        </text>

        {/* node legend rows */}
        {WITH_D_NODES.map((n, i) => {
          const isD = n.id === 'D';
          const y = legendTop + i * 26;
          const visible = isD ? added : true;
          return (
            <g key={`leg-${n.id}`} style={{ opacity: visible ? 1 : 0.25, transition: fade }}>
              <circle cx={legendX + 7} cy={y} r={6} fill={n.color} />
              <text x={legendX + 22} y={y + 4} fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                {tr(n.labelJa, n.labelEn)}
              </text>
              {isD && (
                <text x={legendX + 90} y={y + 4} fill="var(--green)" fontSize={11} fontWeight={700} fontFamily={MONO}>
                  {added ? tr('新規', 'new') : tr('未追加', 'not yet')}
                </text>
              )}
            </g>
          );
        })}

        {/* moved-keys readout */}
        {(() => {
          const y = legendTop + WITH_D_NODES.length * 26 + 20;
          const line1 = tr('再配置されたキー:', 'keys moved:');
          const value = added
            ? tr(`${movedCount} / ${totalKeys} （約 1/N）`, `${movedCount} / ${totalKeys} (~1/N)`)
            : tr(`0 / ${totalKeys}`, `0 / ${totalKeys}`);
          const boxW = 196;
          return (
            <g>
              <rect x={legendX} y={y} width={boxW} height={54} rx={10} fill="var(--bg-elevated)" stroke="var(--green)" opacity={added ? 1 : 0.6} style={{ transition: fade }} />
              <text x={legendX + 14} y={y + 22} fill="var(--text-muted)" fontSize={12}>
                {line1}
              </text>
              <text x={legendX + 14} y={y + 42} fill={added ? 'var(--green)' : 'var(--text-dim)'} fontSize={15} fontWeight={700} fontFamily={MONO}>
                {value}
              </text>
            </g>
          );
        })()}

        {/* contrast note: % N vs ring */}
        {(() => {
          const y = legendTop + WITH_D_NODES.length * 26 + 92;
          return (
            <g>
              <text x={legendX} y={y} fill="var(--text-dim)" fontSize={11}>
                <tspan fontFamily={MONO} fill="var(--red)">% N</tspan>
                <tspan>{tr(' だと N が変われば', ': change N and')}</tspan>
              </text>
              <text x={legendX} y={y + 16} fill="var(--text-dim)" fontSize={11}>
                {tr('ほぼ全キーが移動。', 'almost every key moves.')}
              </text>
              <text x={legendX} y={y + 36} fill="var(--text-dim)" fontSize={11}>
                {tr('リングなら一部だけ。', 'the ring moves only a slice.')}
              </text>
            </g>
          );
        })()}
      </svg>
    </DiagramFrame>
  );
}
