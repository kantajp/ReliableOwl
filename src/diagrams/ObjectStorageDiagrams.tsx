// Object-storage diagrams for the generic object store (S3-style) example.
//  - ObjStoreFlow:   metadata/data separation — a gateway writes the big bytes to
//                    data nodes while recording key→location in a small metadata DB,
//                    and reads look up location first, then stream the bytes.
//  - ObjDurability:  replication (3 copies, 3×) vs erasure coding (6+3 shards, 1.5×);
//                    click nodes/shards to fail them and watch durability hold.
//  - ObjArchitecture: the whole picture — clients, a load-balanced gateway tier,
//                    a metadata DB, a storage/data-node tier and a CDN for hot reads.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useMemo, useState, useId, type CSSProperties } from 'react';
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

// A small DB-cylinder glyph drawn at (x,y) with width w and height h.
function DbGlyph({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: string }) {
  const ry = Math.min(7, h * 0.14);
  return (
    <g stroke={color} strokeWidth={1.5} fill="var(--surface)">
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} />
      <path d={`M ${x} ${y + ry} V ${y + h - ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + h - ry} V ${y + ry}`} />
      <path d={`M ${x} ${y + ry} A ${w / 2} ${ry} 0 0 0 ${x + w} ${y + ry}`} fill="none" />
    </g>
  );
}

// ============================================================================
// 1) ObjStoreFlow — metadata / data separation
// ============================================================================
type FlowMode = 'put' | 'get';

const F_VIEW_W = 820;
const F_VIEW_H = 360;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
const boxCenter = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

const F_CLIENT: Box = { x: 36, y: 150, w: 120, h: 64 };
const F_GATEWAY: Box = { x: 300, y: 142, w: 150, h: 80 };
const F_META: Box = { x: 596, y: 60, w: 180, h: 86 };
const F_DATA: Box[] = [
  { x: 596, y: 206, w: 180, h: 44 },
  { x: 596, y: 258, w: 180, h: 44 },
  { x: 596, y: 310, w: 180, h: 44 },
];

export function ObjStoreFlow() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<FlowMode>('put');
  const uid = useId().replace(/:/g, '');
  const isPut = mode === 'put';

  const cC = boxCenter(F_CLIENT);
  const gC = boxCenter(F_GATEWAY);
  const mC = boxCenter(F_META);
  const dC = boxCenter(F_DATA[1]); // middle data node

  // Paths (re-keyed on mode so animateMotion routes re-mount).
  const clientGw = `M ${F_CLIENT.x + F_CLIENT.w} ${cC.y} L ${F_GATEWAY.x} ${gC.y}`;
  const gwMeta = `M ${F_GATEWAY.x + F_GATEWAY.w} ${gC.y - 14} C ${F_GATEWAY.x + F_GATEWAY.w + 60} ${gC.y - 14}, ${F_META.x - 60} ${mC.y}, ${F_META.x} ${mC.y}`;
  const gwData = `M ${F_GATEWAY.x + F_GATEWAY.w} ${gC.y + 14} C ${F_GATEWAY.x + F_GATEWAY.w + 60} ${gC.y + 14}, ${F_DATA[1].x - 60} ${dC.y}, ${F_DATA[1].x} ${dC.y}`;

  const metaTone = 'var(--purple)';
  const dataTone = 'var(--cyan)';

  return (
    <DiagramFrame
      height={340}
      caption={tr(
        '鍵→場所はメタデータDBで速く引き、本体はデータノードから取る',
        'look up key→location in the metadata DB, then fetch the bytes from data nodes',
      )}
      controls={
        <>
          <ToggleButton active={isPut} onClick={() => setMode('put')} label={tr('PUT (保存)', 'PUT (write)')} />
          <ToggleButton active={!isPut} onClick={() => setMode('get')} label={tr('GET (取得)', 'GET (read)')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${F_VIEW_W} ${F_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          'クライアントがゲートウェイ経由でメタデータDBとデータノードに読み書きする構成図',
          'A client reading and writing through a gateway to a metadata DB and data nodes',
        )}
      >
        <defs>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
          </marker>
          <path key={`cg-${mode}`} id={`${uid}-cg`} d={clientGw} fill="none" />
          <path key={`gm-${mode}`} id={`${uid}-gm`} d={gwMeta} fill="none" />
          <path key={`gd-${mode}`} id={`${uid}-gd`} d={gwData} fill="none" />
        </defs>

        {/* header note */}
        <text x={36} y={34} fontSize={15} fontWeight={700} fill="var(--text)">
          {isPut
            ? tr('PUT: 本体はデータノード、場所はメタデータDBへ', 'PUT: bytes to data nodes, location to the metadata DB')
            : tr('GET: まず場所を引き、次に本体を取る', 'GET: look up the location first, then fetch the bytes')}
        </text>
        <text x={36} y={56} fontSize={12} fill="var(--text-dim)">
          {tr('小さなメタデータと大きなデータ本体を分けて保存する', 'store the small metadata separately from the large object bytes')}
        </text>

        {/* edges */}
        <use href={`#${uid}-cg`} className="hn-edge" stroke="var(--accent)" strokeWidth={2} markerEnd={`url(#${uid}-arrow)`} />
        <use href={`#${uid}-gm`} className="hn-edge" stroke={metaTone} strokeWidth={1.75} opacity={0.8} />
        <use href={`#${uid}-gd`} className="hn-edge" stroke={dataTone} strokeWidth={1.75} opacity={0.8} />
        {/* link gateway → the other two data nodes (static, so they look like a cluster) */}
        {[0, 2].map((i) => {
          const t = boxCenter(F_DATA[i]);
          return (
            <path
              key={`gd-extra${i}`}
              d={`M ${F_GATEWAY.x + F_GATEWAY.w} ${gC.y + 14} C ${F_GATEWAY.x + F_GATEWAY.w + 50} ${gC.y + 14}, ${F_DATA[i].x - 50} ${t.y}, ${F_DATA[i].x} ${t.y}`}
              className="hn-edge"
              stroke={dataTone}
              strokeWidth={1}
              opacity={0.3}
              fill="none"
            />
          );
        })}

        {/* step order badges for GET */}
        {!isPut && (
          <>
            <g>
              <circle cx={F_META.x - 70} cy={mC.y - 20} r={11} fill="var(--purple-soft, var(--bg-elevated))" stroke={metaTone} />
              <text x={F_META.x - 70} y={mC.y - 16} textAnchor="middle" fill={metaTone} fontSize={13} fontWeight={700} fontFamily={MONO}>1</text>
              <text x={F_META.x - 54} y={mC.y - 16} fill={metaTone} fontSize={12}>{tr('場所を引く', 'look up location')}</text>
            </g>
            <g>
              <circle cx={F_DATA[1].x - 70} cy={dC.y + 20} r={11} fill="var(--bg-elevated)" stroke={dataTone} />
              <text x={F_DATA[1].x - 70} y={dC.y + 24} textAnchor="middle" fill={dataTone} fontSize={13} fontWeight={700} fontFamily={MONO}>2</text>
              <text x={F_DATA[1].x - 54} y={dC.y + 24} fill={dataTone} fontSize={12}>{tr('本体を取る', 'fetch bytes')}</text>
            </g>
          </>
        )}
        {/* write labels for PUT */}
        {isPut && (
          <>
            {(() => {
              const label = tr('場所を記録', 'record location');
              const w = textWidth(label) + 16;
              const px = (F_GATEWAY.x + F_GATEWAY.w + F_META.x) / 2 - w / 2;
              return (
                <g>
                  <rect x={px} y={mC.y - 34} width={w} height={20} rx={6} fill="var(--bg-elevated)" stroke={metaTone} />
                  <text x={px + w / 2} y={mC.y - 20} textAnchor="middle" fill={metaTone} fontSize={12} fontFamily={MONO}>{label}</text>
                </g>
              );
            })()}
            {(() => {
              const label = tr('本体を書く', 'write bytes');
              const w = textWidth(label) + 16;
              const px = (F_GATEWAY.x + F_GATEWAY.w + F_DATA[1].x) / 2 - w / 2;
              return (
                <g>
                  <rect x={px} y={dC.y + 14} width={w} height={20} rx={6} fill="var(--bg-elevated)" stroke={dataTone} />
                  <text x={px + w / 2} y={dC.y + 28} textAnchor="middle" fill={dataTone} fontSize={12} fontFamily={MONO}>{label}</text>
                </g>
              );
            })()}
          </>
        )}

        {/* client */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={F_CLIENT.x} y={F_CLIENT.y} width={F_CLIENT.w} height={F_CLIENT.h} rx={10} fill="var(--surface)" stroke="var(--border-strong)" />
          <text x={cC.x} y={cC.y - 4} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={600}>{tr('クライアント', 'client')}</text>
          <text x={cC.x} y={cC.y + 14} textAnchor="middle" fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>{isPut ? 'PUT /obj' : 'GET /obj'}</text>
        </g>

        {/* gateway */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={F_GATEWAY.x} y={F_GATEWAY.y} width={F_GATEWAY.w} height={F_GATEWAY.h} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.75} />
          <text x={gC.x} y={gC.y - 6} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={700}>{tr('ゲートウェイ', 'gateway')}</text>
          <text x={gC.x} y={gC.y + 12} textAnchor="middle" fill="var(--accent)" fontSize={12} fontFamily={MONO}>API</text>
        </g>

        {/* metadata DB */}
        <g style={{ '--tone': metaTone } as CSSProperties}>
          <rect x={F_META.x} y={F_META.y} width={F_META.w} height={F_META.h} rx={11} fill="var(--surface)" stroke={metaTone} strokeWidth={1.5} />
          <DbGlyph x={F_META.x + 14} y={F_META.y + 16} w={26} h={40} color={metaTone} />
          <text x={F_META.x + 50} y={F_META.y + 26} fill="var(--text)" fontSize={13} fontWeight={700}>{tr('メタデータDB', 'metadata DB')}</text>
          <text x={F_META.x + 50} y={F_META.y + 44} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>key → location</text>
          <text x={F_META.x + 50} y={F_META.y + 62} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>{tr('size · etag · 小', 'size · etag · small')}</text>
        </g>

        {/* data nodes */}
        {F_DATA.map((d, i) => (
          <g key={`data${i}`} style={{ '--tone': dataTone } as CSSProperties}>
            <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={9} fill="var(--surface)" stroke={dataTone} strokeWidth={1.5} />
            <circle cx={d.x + 18} cy={d.y + d.h / 2} r={4} className="hn-node__dot" />
            <text x={d.x + 34} y={d.y + 20} fill="var(--text)" fontSize={12} fontWeight={600}>{tr(`データノード ${i + 1}`, `data node ${i + 1}`)}</text>
            <text x={d.x + 34} y={d.y + 36} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>{tr('本体バイト', 'object bytes')}</text>
          </g>
        ))}

        {/* animated packets, keyed by mode so routes re-mount */}
        {!reduced && isPut && (
          <g key="put-pkt">
            <circle r={5} fill="var(--accent)">
              <animateMotion dur="1.6s" repeatCount="indefinite">
                <mpath href={`#${uid}-cg`} />
              </animateMotion>
            </circle>
            <circle r={4.5} fill={metaTone}>
              <animateMotion dur="1.8s" begin="0.5s" repeatCount="indefinite">
                <mpath href={`#${uid}-gm`} />
              </animateMotion>
            </circle>
            <circle r={4.5} fill={dataTone}>
              <animateMotion dur="1.8s" begin="0.5s" repeatCount="indefinite">
                <mpath href={`#${uid}-gd`} />
              </animateMotion>
            </circle>
          </g>
        )}
        {!reduced && !isPut && (
          <g key="get-pkt">
            <circle r={5} fill="var(--accent)">
              <animateMotion dur="1.5s" repeatCount="indefinite">
                <mpath href={`#${uid}-cg`} />
              </animateMotion>
            </circle>
            {/* step 1: gateway → metadata */}
            <circle r={4.5} fill={metaTone}>
              <animateMotion dur="1.4s" begin="0.4s" repeatCount="indefinite">
                <mpath href={`#${uid}-gm`} />
              </animateMotion>
            </circle>
            {/* step 2: data node → gateway (reverse) */}
            <circle r={4.5} fill={dataTone}>
              <animateMotion dur="1.4s" begin="1.1s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
                <mpath href={`#${uid}-gd`} />
              </animateMotion>
            </circle>
          </g>
        )}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) ObjDurability — replication vs erasure coding
// ============================================================================
type DurMode = 'replication' | 'erasure';

const D_VIEW_W = 820;
const D_VIEW_H = 360;

// Replication: 3 copies on 3 nodes.
const REP_NODES: { x: number; y: number }[] = [
  { x: 300, y: 120 },
  { x: 300, y: 196 },
  { x: 300, y: 272 },
];
const REP_W = 220;
const REP_H = 56;
// Deterministic default failure scenario: node index 2 fails.
const REP_DEFAULT_FAIL = [2];

// Erasure coding: 9 shards in a 3×3 grid.
const EC_LABELS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'P1', 'P2', 'P3'];
const EC_COLS = 3;
const EC_W = 92;
const EC_H = 64;
const EC_GAP_X = 20;
const EC_GAP_Y = 18;
const EC_X0 = 286;
const EC_Y0 = 108;
const ecBox = (i: number) => ({
  x: EC_X0 + (i % EC_COLS) * (EC_W + EC_GAP_X),
  y: EC_Y0 + Math.floor(i / EC_COLS) * (EC_H + EC_GAP_Y),
  w: EC_W,
  h: EC_H,
});
// Deterministic default: fail 3 nodes (D2, D5, P1) — still 6 survive.
const EC_DEFAULT_FAIL = [1, 4, 6];

export function ObjDurability() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<DurMode>('replication');

  // Failed sets per mode. Seed from the deterministic default scenario.
  const [repFailed, setRepFailed] = useState<Set<number>>(() => new Set(REP_DEFAULT_FAIL));
  const [ecFailed, setEcFailed] = useState<Set<number>>(() => new Set(EC_DEFAULT_FAIL));
  const isRep = mode === 'replication';

  const toggleRep = (i: number) => {
    if (reduced) return;
    setRepFailed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const toggleEc = (i: number) => {
    if (reduced) return;
    setEcFailed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < 3) next.add(i); // can fail up to 3
      return next;
    });
  };

  const repSurvivors = REP_NODES.length - repFailed.size;
  const repSafe = repSurvivors >= 1;
  const ecSurvivors = EC_LABELS.length - ecFailed.size;
  const ecSafe = ecSurvivors >= 6;

  return (
    <DiagramFrame
      height={340}
      caption={tr(
        'レプリケーションは単純だが容量3倍、EC は1.5倍で3台まで故障に耐える',
        'replication is simple but 3×; erasure coding is 1.5× and tolerates 3 failures',
      )}
      controls={
        <>
          <ToggleButton active={isRep} onClick={() => setMode('replication')} label={tr('レプリケーション (3コピー)', 'replication (3 copies)')} />
          <ToggleButton active={!isRep} onClick={() => setMode('erasure')} label={tr('イレイジャーコーディング (6+3)', 'erasure coding (6+3)')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${D_VIEW_W} ${D_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          isRep ? '1つのオブジェクトを3台に複製する図' : '1つのオブジェクトを6データ+3パリティのシャードに分割する図',
          isRep ? 'One object replicated as 3 copies across 3 nodes' : 'One object split into 6 data and 3 parity shards',
        )}
      >
        {/* header */}
        <text x={36} y={34} fontSize={15} fontWeight={700} fill="var(--text)">
          {isRep
            ? tr('1つのオブジェクト → 3つの同じコピー', 'one object → 3 identical copies')
            : tr('1つのオブジェクト → 6データ + 3パリティ', 'one object → 6 data + 3 parity shards')}
        </text>
        <text x={36} y={56} fontSize={12} fill="var(--text-dim)">
          {reduced ? tr('(既定の故障シナリオを表示中)', '(showing the default failure scenario)') : tr('ノードをクリックして故障させる', 'click a node to fail it')}
        </text>

        {/* source object */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={60} y={168} width={150} height={64} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.75} />
          <text x={135} y={196} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={700}>{tr('オブジェクト', 'object')}</text>
          <text x={135} y={214} textAnchor="middle" fill="var(--accent)" fontSize={12} fontFamily={MONO}>photo.jpg</text>
        </g>

        {/* overhead badge (top-right) */}
        {(() => {
          const label = isRep ? tr('3.0× の容量', '3.0× storage') : tr('1.5× の容量', '1.5× storage');
          const tone = isRep ? 'var(--red)' : 'var(--green)';
          const w = textWidth(label) + 24;
          return (
            <g>
              <rect x={D_VIEW_W - w - 36} y={24} width={w} height={26} rx={13} fill={isRep ? 'var(--red-soft)' : 'var(--green-soft)'} stroke={tone} />
              <text x={D_VIEW_W - w / 2 - 36} y={41} textAnchor="middle" fill={tone} fontSize={13} fontWeight={700} fontFamily={MONO}>{label}</text>
            </g>
          );
        })()}

        {isRep ? (
          <>
            {REP_NODES.map((n, i) => {
              const failed = repFailed.has(i);
              const tone = failed ? 'var(--red)' : 'var(--cyan)';
              const soft = failed ? 'var(--red-soft)' : 'var(--surface)';
              const srcC = { x: 210, y: 200 };
              return (
                <g key={`rep${i}`} style={{ '--tone': tone, cursor: reduced ? 'default' : 'pointer' } as CSSProperties} onClick={() => toggleRep(i)}>
                  <path d={`M ${srcC.x} ${srcC.y} C 258 ${srcC.y}, 258 ${n.y + REP_H / 2}, ${n.x} ${n.y + REP_H / 2}`} className="hn-edge" stroke={tone} strokeWidth={1.5} fill="none" opacity={failed ? 0.4 : 0.8} />
                  <rect x={n.x} y={n.y} width={REP_W} height={REP_H} rx={10} fill={soft} stroke={tone} strokeWidth={failed ? 2 : 1.5} strokeDasharray={failed ? '5 4' : undefined} />
                  <DbGlyph x={n.x + 14} y={n.y + 12} w={22} h={32} color={tone} />
                  <text x={n.x + 46} y={n.y + 24} fill="var(--text)" fontSize={12} fontWeight={700}>{tr(`ノード ${i + 1}`, `node ${i + 1}`)}</text>
                  <text x={n.x + 46} y={n.y + 42} fill={failed ? 'var(--red)' : 'var(--text-dim)'} fontSize={12} fontFamily={MONO}>
                    {failed ? tr('故障', 'failed') : tr('コピー: photo.jpg', 'copy: photo.jpg')}
                  </text>
                </g>
              );
            })}
            {/* verdict */}
            {(() => {
              const label = repSafe ? tr('まだ安全', 'still safe') : tr('全コピー喪失', 'all copies lost');
              const tone = repSafe ? 'var(--green)' : 'var(--red)';
              const w = textWidth(label) + 28;
              return (
                <g>
                  <rect x={560 - w / 2} y={300} width={w} height={30} rx={15} fill={repSafe ? 'var(--green-soft)' : 'var(--red-soft)'} stroke={tone} strokeWidth={1.5} />
                  <text x={560} y={320} textAnchor="middle" fill={tone} fontSize={14} fontWeight={700}>{label}</text>
                  <text x={560} y={300 - 8} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                    {tr(`残り ${repSurvivors} / 3 コピー`, `${repSurvivors} / 3 copies left`)}
                  </text>
                </g>
              );
            })()}
          </>
        ) : (
          <>
            {EC_LABELS.map((lbl, i) => {
              const b = ecBox(i);
              const failed = ecFailed.has(i);
              const isParity = lbl.startsWith('P');
              const base = isParity ? 'var(--amber)' : 'var(--cyan)';
              const tone = failed ? 'var(--red)' : base;
              const soft = failed ? 'var(--red-soft)' : isParity ? 'var(--amber-soft)' : 'var(--surface)';
              return (
                <g key={`ec${i}`} style={{ '--tone': tone, cursor: reduced ? 'default' : 'pointer' } as CSSProperties} onClick={() => toggleEc(i)}>
                  <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={9} fill={soft} stroke={tone} strokeWidth={failed ? 2 : 1.5} strokeDasharray={failed ? '5 4' : undefined} />
                  <text x={b.x + b.w / 2} y={b.y + 26} textAnchor="middle" fill={failed ? 'var(--red)' : 'var(--text)'} fontSize={14} fontWeight={700} fontFamily={MONO}>{lbl}</text>
                  <text x={b.x + b.w / 2} y={b.y + 46} textAnchor="middle" fill={failed ? 'var(--red)' : 'var(--text-dim)'} fontSize={11} fontFamily={MONO}>
                    {failed ? tr('故障', 'failed') : isParity ? tr('パリティ', 'parity') : tr('データ', 'data')}
                  </text>
                </g>
              );
            })}
            {/* verdict */}
            {(() => {
              const label = ecSafe ? tr('任意の6個から復元できる', 'any 6 of 9 can rebuild it') : tr('6個未満 → 復元不可', 'fewer than 6 → cannot rebuild');
              const tone = ecSafe ? 'var(--green)' : 'var(--red)';
              const w = textWidth(label) + 28;
              return (
                <g>
                  <rect x={D_VIEW_W / 2 - w / 2} y={318} width={w} height={28} rx={14} fill={ecSafe ? 'var(--green-soft)' : 'var(--red-soft)'} stroke={tone} strokeWidth={1.5} />
                  <text x={D_VIEW_W / 2} y={337} textAnchor="middle" fill={tone} fontSize={13} fontWeight={700}>{label}</text>
                </g>
              );
            })()}
            <text x={D_VIEW_W - 36} y={300} textAnchor="end" fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
              {tr(`生存 ${ecSurvivors} / 9 シャード`, `${ecSurvivors} / 9 shards alive`)}
            </text>
          </>
        )}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 3) ObjArchitecture — the whole picture (static, labeled)
// ============================================================================
const A_VIEW_W = 820;
const A_VIEW_H = 380;

const A_CLIENTS: Box = { x: 30, y: 150, w: 110, h: 80 };
const A_CDN: Box = { x: 196, y: 44, w: 150, h: 64 };
const A_GATEWAY: { x: number; y: number; w: number; h: number } = { x: 196, y: 158, w: 150, h: 88 };
const A_META: Box = { x: 420, y: 48, w: 180, h: 76 };
const A_STORAGE: Box = { x: 420, y: 170, w: 360, h: 180 };
// Data-node mini-boxes inside the storage tier (deterministic 3×3 grid).
const A_NODE_W = 92;
const A_NODE_H = 40;
// Deterministic data-node layout inside the storage tier (module constant).
const A_NODES: { x: number; y: number; shard: string }[] = (() => {
  const out: { x: number; y: number; shard: string }[] = [];
  const shards = ['D1', 'D2', 'D3', 'P1', 'D4', 'D5'];
  const cols = 3;
  const x0 = A_STORAGE.x + 20;
  const y0 = A_STORAGE.y + 56;
  for (let i = 0; i < 6; i++) {
    out.push({
      x: x0 + (i % cols) * (A_NODE_W + 16),
      y: y0 + Math.floor(i / cols) * (A_NODE_H + 16),
      shard: shards[i],
    });
  }
  return out;
})();

export function ObjArchitecture() {
  const tr = useTr();
  // useMemo over a module constant keeps layout deterministic + satisfies the import.
  const nodes = useMemo(() => A_NODES, []);

  const clientsC = boxCenter(A_CLIENTS);
  const cdnC = boxCenter(A_CDN);
  const gwC = boxCenter(A_GATEWAY);
  const metaC = boxCenter(A_META);

  return (
    <DiagramFrame
      height={360}
      caption={tr(
        'ゲートウェイ・メタデータDB・データノード・CDN を組み合わせた全体像',
        'the whole system: gateway, metadata DB, data nodes and a CDN',
      )}
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${A_VIEW_W} ${A_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          'クライアント・CDN・APIゲートウェイ・メタデータDB・ストレージノードの全体構成図',
          'Overall architecture: clients, CDN, API gateway, metadata DB and storage nodes',
        )}
      >
        <defs>
          <marker id="objarch-arrow" viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* header */}
        <text x={30} y={30} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('オブジェクトストレージの全体像', 'the object store, end to end')}
        </text>

        {/* edges */}
        {/* clients → CDN (hot reads, top path) */}
        <path d={`M ${A_CLIENTS.x + A_CLIENTS.w} ${clientsC.y - 10} C 170 ${clientsC.y - 10}, 170 ${cdnC.y}, ${A_CDN.x} ${cdnC.y}`} className="hn-edge hn-edge--dashed" stroke="var(--text-muted)" strokeWidth={1.5} fill="none" markerEnd="url(#objarch-arrow)" />
        {/* clients → gateway */}
        <path d={`M ${A_CLIENTS.x + A_CLIENTS.w} ${clientsC.y + 10} C 170 ${clientsC.y + 10}, 170 ${gwC.y}, ${A_GATEWAY.x} ${gwC.y}`} className="hn-edge" stroke="var(--accent)" strokeWidth={2} fill="none" markerEnd="url(#objarch-arrow)" />
        {/* CDN → storage (miss → origin) */}
        <path d={`M ${A_CDN.x + A_CDN.w} ${cdnC.y} C ${A_CDN.x + A_CDN.w + 60} ${cdnC.y}, ${A_STORAGE.x - 20} ${A_STORAGE.y + 20}, ${A_STORAGE.x} ${A_STORAGE.y + 20}`} className="hn-edge hn-edge--dashed" stroke="var(--cyan)" strokeWidth={1.5} fill="none" markerEnd="url(#objarch-arrow)" />
        {/* gateway → metadata */}
        <path d={`M ${A_GATEWAY.x + A_GATEWAY.w} ${gwC.y - 16} C ${A_GATEWAY.x + A_GATEWAY.w + 40} ${gwC.y - 16}, ${A_META.x - 40} ${metaC.y}, ${A_META.x} ${metaC.y}`} className="hn-edge" stroke="var(--purple)" strokeWidth={1.75} fill="none" markerEnd="url(#objarch-arrow)" />
        {/* gateway → storage */}
        <path d={`M ${A_GATEWAY.x + A_GATEWAY.w} ${gwC.y + 16} C ${A_GATEWAY.x + A_GATEWAY.w + 40} ${gwC.y + 16}, ${A_STORAGE.x - 40} ${A_STORAGE.y + 70}, ${A_STORAGE.x} ${A_STORAGE.y + 70}`} className="hn-edge" stroke="var(--cyan)" strokeWidth={1.75} fill="none" markerEnd="url(#objarch-arrow)" />

        {/* edge labels */}
        <text x={360} y={cdnC.y - 8} fill="var(--text-muted)" fontSize={11} fontFamily={MONO}>{tr('ミス→オリジン', 'miss → origin')}</text>
        <text x={A_META.x - 36} y={metaC.y + 44} fill="var(--purple)" fontSize={11} fontFamily={MONO}>key→loc</text>

        {/* clients */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={A_CLIENTS.x} y={A_CLIENTS.y} width={A_CLIENTS.w} height={A_CLIENTS.h} rx={10} fill="var(--surface)" stroke="var(--border-strong)" />
          <text x={clientsC.x} y={clientsC.y - 4} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={600}>{tr('クライアント', 'clients')}</text>
          <text x={clientsC.x} y={clientsC.y + 14} textAnchor="middle" fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>GET / PUT</text>
        </g>

        {/* CDN */}
        <g style={{ '--tone': 'var(--cyan)' } as CSSProperties}>
          <rect x={A_CDN.x} y={A_CDN.y} width={A_CDN.w} height={A_CDN.h} rx={11} fill="var(--surface)" stroke="var(--cyan)" strokeWidth={1.5} />
          <circle cx={A_CDN.x + 18} cy={cdnC.y} r={4} className="hn-node__dot" />
          <text x={A_CDN.x + 34} y={cdnC.y - 4} fill="var(--text)" fontSize={13} fontWeight={700}>{tr('CDN / キャッシュ', 'CDN / cache')}</text>
          <text x={A_CDN.x + 34} y={cdnC.y + 14} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>{tr('人気の本体', 'hot objects')}</text>
        </g>

        {/* API gateway tier (load balanced) */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={A_GATEWAY.x} y={A_GATEWAY.y} width={A_GATEWAY.w} height={A_GATEWAY.h} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.75} />
          <text x={gwC.x} y={A_GATEWAY.y + 24} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={700}>{tr('APIゲートウェイ', 'API gateway')}</text>
          <text x={gwC.x} y={A_GATEWAY.y + 42} textAnchor="middle" fill="var(--accent)" fontSize={11} fontFamily={MONO}>{tr('負荷分散', 'load balanced')}</text>
          {/* stacked tier hint */}
          <rect x={A_GATEWAY.x + 16} y={A_GATEWAY.y + 54} width={A_GATEWAY.w - 32} height={10} rx={3} fill="var(--surface)" stroke="var(--accent)" opacity={0.7} />
          <rect x={A_GATEWAY.x + 24} y={A_GATEWAY.y + 68} width={A_GATEWAY.w - 48} height={10} rx={3} fill="var(--surface)" stroke="var(--accent)" opacity={0.45} />
        </g>

        {/* metadata DB */}
        <g style={{ '--tone': 'var(--purple)' } as CSSProperties}>
          <rect x={A_META.x} y={A_META.y} width={A_META.w} height={A_META.h} rx={11} fill="var(--surface)" stroke="var(--purple)" strokeWidth={1.5} />
          <DbGlyph x={A_META.x + 14} y={A_META.y + 14} w={24} h={36} color="var(--purple)" />
          <text x={A_META.x + 48} y={A_META.y + 26} fill="var(--text)" fontSize={13} fontWeight={700}>{tr('メタデータDB', 'metadata DB')}</text>
          <text x={A_META.x + 48} y={A_META.y + 44} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>{tr('シャード+複製 · 小', 'sharded + replicated · small')}</text>
        </g>

        {/* storage / data-node tier */}
        <g style={{ '--tone': 'var(--cyan)' } as CSSProperties}>
          <rect x={A_STORAGE.x} y={A_STORAGE.y} width={A_STORAGE.w} height={A_STORAGE.h} rx={12} fill="var(--surface)" stroke="var(--cyan)" strokeWidth={1.5} />
          <text x={A_STORAGE.x + 16} y={A_STORAGE.y + 26} fill="var(--text)" fontSize={13} fontWeight={700}>{tr('ストレージ / データノード', 'storage / data nodes')}</text>
          <text x={A_STORAGE.x + 16} y={A_STORAGE.y + 44} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>{tr('シャードを保持 · 多数', 'holds shards · many nodes')}</text>
          {nodes.map((n, i) => (
            <g key={`anode${i}`}>
              <rect x={n.x} y={n.y} width={A_NODE_W} height={A_NODE_H} rx={7} fill="var(--bg-elevated)" stroke="var(--cyan)" strokeWidth={1} opacity={0.9} />
              <text x={n.x + A_NODE_W / 2} y={n.y + 25} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>{n.shard}</text>
            </g>
          ))}
          {/* durability annotation over the storage tier */}
          {(() => {
            const label = tr('耐久性: 複製 / EC', 'durability: replication / erasure coding');
            const w = textWidth(label, 11) + 20;
            return (
              <g>
                <rect x={A_STORAGE.x + A_STORAGE.w - w - 14} y={A_STORAGE.y + 14} width={w} height={22} rx={11} fill="var(--green-soft)" stroke="var(--green)" />
                <text x={A_STORAGE.x + A_STORAGE.w - w / 2 - 14} y={A_STORAGE.y + 29} textAnchor="middle" fill="var(--green)" fontSize={11} fontWeight={700} fontFamily={MONO}>{label}</text>
              </g>
            );
          })()}
        </g>

        {/* bottom notes */}
        <text x={30} y={A_VIEW_H - 20} fill="var(--text-muted)" fontSize={12}>
          {tr('• オブジェクトは不変（上書きせず置き換え）', '• objects are immutable (replaced, never edited in place)')}
        </text>
        <text x={420} y={A_VIEW_H - 20} fill="var(--text-muted)" fontSize={12}>
          {tr('• 大きなファイルはチャンクに分割', '• large files are split into chunks')}
        </text>
      </svg>
    </DiagramFrame>
  );
}
