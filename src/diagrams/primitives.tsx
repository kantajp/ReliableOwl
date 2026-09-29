import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useUi } from '../i18n';

// Shared parts used inside diagrams (node / arrow / flowing packet / label)

export interface NodeBoxProps {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  icon?: ReactNode;
  tone?: 'default' | 'accent' | 'green' | 'red' | 'amber' | 'purple' | 'cyan';
  active?: boolean;
  dimmed?: boolean;
}

const toneColor: Record<NonNullable<NodeBoxProps['tone']>, string> = {
  default: 'var(--text-muted)',
  accent: 'var(--accent)',
  green: 'var(--green)',
  red: 'var(--red)',
  amber: 'var(--amber)',
  purple: 'var(--purple)',
  cyan: 'var(--cyan)',
};

export function NodeBox({
  x,
  y,
  w = 116,
  h = 64,
  label,
  sub,
  icon,
  tone = 'default',
  active = false,
  dimmed = false,
}: NodeBoxProps) {
  const color = toneColor[tone];
  return (
    <motion.g
      animate={{ opacity: dimmed ? 0.28 : 1 }}
      transition={{ duration: 0.4 }}
      style={{ pointerEvents: 'none' }}
    >
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={12}
        fill="var(--surface)"
        stroke={active ? color : 'var(--border-strong)'}
        strokeWidth={active ? 2 : 1.25}
        animate={{
          filter: active
            ? `drop-shadow(0 0 10px ${color})`
            : 'drop-shadow(0 0 0px transparent)',
        }}
        transition={{ duration: 0.3 }}
      />
      {icon && (
        <g transform={`translate(${x + 14}, ${y + h / 2 - 10})`} style={{ color }}>
          {icon}
        </g>
      )}
      <text
        x={icon ? x + 40 : x + w / 2}
        y={sub ? y + h / 2 - 4 : y + h / 2 + 5}
        textAnchor={icon ? 'start' : 'middle'}
        fill="var(--text)"
        fontSize={14}
        fontWeight={600}
        fontFamily="var(--font-sans)"
      >
        {label}
      </text>
      {sub && (
        <text
          x={icon ? x + 40 : x + w / 2}
          y={y + h / 2 + 14}
          textAnchor={icon ? 'start' : 'middle'}
          fill="var(--text-dim)"
          fontSize={11}
          fontFamily="var(--font-mono)"
        >
          {sub}
        </text>
      )}
    </motion.g>
  );
}

export interface EdgeProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  dashed?: boolean;
  color?: string;
  dimmed?: boolean;
}

export function Edge({ x1, y1, x2, y2, dashed, color = 'var(--border-strong)', dimmed }: EdgeProps) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={1.5}
      strokeDasharray={dashed ? '5 5' : undefined}
      markerEnd="url(#arrow)"
      animate={{ opacity: dimmed ? 0.2 : 0.65 }}
      transition={{ duration: 0.4 }}
    />
  );
}

// A packet that travels along a path (array of points)
export interface PacketProps {
  path: { x: number; y: number }[];
  color?: string;
  playKey: number; // changing this re-triggers the animation
  duration?: number;
  delay?: number;
  label?: string;
}

// Linear-interpolate a position along the multi-point path at progress t (0..1).
function pointAt(path: { x: number; y: number }[], t: number) {
  if (path.length === 1) return path[0];
  // Segment lengths so travel speed is uniform along the whole path.
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].x - path[i].x;
    const dy = path[i + 1].y - path[i].y;
    const len = Math.hypot(dx, dy);
    segLen.push(len);
    total += len;
  }
  if (total === 0) return path[0];
  let dist = t * total;
  for (let i = 0; i < segLen.length; i++) {
    if (dist <= segLen[i] || i === segLen.length - 1) {
      const f = segLen[i] === 0 ? 0 : dist / segLen[i];
      return {
        x: path[i].x + (path[i + 1].x - path[i].x) * f,
        y: path[i].y + (path[i + 1].y - path[i].y) * f,
      };
    }
    dist -= segLen[i];
  }
  return path[path.length - 1];
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function Packet({ path, color = 'var(--accent)', playKey, duration = 1.6, delay = 0, label }: PacketProps) {
  // Self-contained rAF animation. We move the group via the SVG `transform`
  // attribute (not a CSS transform), which respects the SVG coordinate system
  // reliably across browsers.
  const [pos, setPos] = useState(path[0]);
  const [opacity, setOpacity] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    let start: number | null = null;
    const durMs = duration * 1000;
    const delayMs = delay * 1000;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;

      if (elapsed < delayMs) {
        setOpacity(0);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const raw = Math.min(1, (elapsed - delayMs) / durMs);
      const t = easeInOut(raw);
      setPos(pointAt(path, t));
      // Fade in over the first 12% and out over the last 12% of the travel.
      setOpacity(raw < 0.12 ? raw / 0.12 : raw > 0.88 ? (1 - raw) / 0.12 : 1);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setOpacity(0);
      }
    };

    setOpacity(0);
    setPos(path[0]);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // Re-run whenever playKey changes (replay) or the path/timing changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`} style={{ opacity }}>
      <circle r={7} fill={color} />
      <circle r={13} fill={color} opacity={0.25} />
      {label && (
        <text x={0} y={-18} textAnchor="middle" fill={color} fontSize={11} fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  );
}

export function ArrowDefs() {
  return (
    <defs>
      <marker
        id="arrow"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong)" />
      </marker>
    </defs>
  );
}

// Shared frame that wraps a diagram (with replay button + caption)
export function DiagramFrame({
  children,
  onReplay,
  caption,
  controls,
  height = 260,
}: {
  children: ReactNode;
  onReplay?: () => void;
  caption?: string;
  controls?: ReactNode;
  height?: number;
}) {
  const uiText = useUi();
  return (
    <div className="diagram">
      <div className="diagram__stage" style={{ minHeight: height }}>
        {children}
      </div>
      <div className="diagram__bar">
        <div className="diagram__controls">
          {onReplay && (
            <button className="btn" onClick={onReplay}>
              <span className="btn__dot" /> {uiText('replay')}
            </button>
          )}
          {controls}
        </div>
        {caption && <span className="diagram__caption">{caption}</span>}
      </div>
    </div>
  );
}

// Commonly used simple icons (SVG paths)
export const icons = {
  client: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
  server: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="13" width="18" height="7" rx="1.5" />
      <path d="M7 7.5h.01M7 16.5h.01" />
    </svg>
  ),
  db: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </svg>
  ),
  cache: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
  gate: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="9" width="16" height="11" rx="2" />
      <path d="M8 9V6a4 4 0 0 1 8 0v3" />
    </svg>
  ),
};
