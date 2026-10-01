// Scaling-databases diagrams for the social-app example.
//  - DbReplication: read scaling via leader/follower replication — writes to the
//                   leader, reads fanned out across replicas, async replication lag.
//  - DbReplicaLag:  replication lag / read-your-writes — a write, the replication
//                   window, and two reads (stale vs fresh); toggle leader vs replica.
//  - DbSharding:    horizontal partitioning — keys routed into shards by hash
//                   (balanced) or by range (hotspot). Interactive strategy toggle.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useState, useId, type CSSProperties } from 'react';
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
// 1) DbReplication
// ============================================================================
const R_VIEW_W = 820;
const R_VIEW_H = 360;

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

interface RNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

const R_APPS: RNode[] = [
  { x: 40, y: 118, w: 118, h: 50 },
  { x: 40, y: 196, w: 118, h: 50 },
];
const R_LEADER: RNode = { x: 326, y: 150, w: 150, h: 72 };
const R_REPLICAS: RNode[] = [
  { x: 644, y: 92, w: 150, h: 60 },
  { x: 644, y: 178, w: 150, h: 60 },
  { x: 644, y: 264, w: 150, h: 60 },
];

const center = (n: RNode) => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });

// Deterministic read routing: which replica each read packet targets.
const R_READ_ROUTE = [0, 1, 2, 1];

export function DbReplication() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');

  const leaderC = center(R_LEADER);
  const appR = R_APPS[0];
  const appW = R_APPS[1];

  return (
    <DiagramFrame
      height={340}
      caption={tr(
        'read-heavy なら、読み取りをレプリカに逃がして横に増やせる',
        'For read-heavy workloads, offload reads to replicas and add more of them',
      )}
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${R_VIEW_W} ${R_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          'アプリサーバーがリーダーに書き込み、複数のレプリカから読み取る構成図',
          'App servers writing to a leader DB and reading from several replica DBs',
        )}
      >
        <defs>
          {/* write path: app → leader */}
          {R_APPS.map((a, i) => {
            const c = center(a);
            return (
              <path key={`wp${i}`} id={`${uid}-wp${i}`} d={`M ${c.x} ${c.y} L ${leaderC.x - R_LEADER.w / 2} ${leaderC.y}`} fill="none" />
            );
          })}
          {/* read path: app → replica (via a midpoint near the leader column) */}
          {R_READ_ROUTE.map((rep, i) => {
            const a = i % 2 === 0 ? appR : appW;
            const c = center(a);
            const rc = center(R_REPLICAS[rep]);
            return (
              <path
                key={`rp${i}`}
                id={`${uid}-rp${i}`}
                d={`M ${c.x} ${c.y} C ${leaderC.x} ${c.y}, ${leaderC.x} ${rc.y}, ${rc.x - R_REPLICAS[rep].w / 2} ${rc.y}`}
                fill="none"
              />
            );
          })}
        </defs>

        {/* header note */}
        <text x={40} y={34} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('読み取りはレプリカに分散、書き込みはリーダーだけ', 'reads fan out to replicas, writes go only to the leader')}
        </text>
        <text x={40} y={56} fontSize={12} fill="var(--text-dim)">
          {tr('例: フィード型アプリ · タイムライン取得は読み取り、投稿は書き込み', 'e.g. a feed app · fetching timelines = reads, posting = writes')}
        </text>

        {/* static edges (writes solid, reads cyan) */}
        {R_APPS.map((_, i) => (
          <use key={`we${i}`} href={`#${uid}-wp${i}`} className="hn-edge" stroke="var(--accent)" strokeWidth={1.75} />
        ))}
        {R_READ_ROUTE.map((_, i) => (
          <use key={`re${i}`} href={`#${uid}-rp${i}`} className="hn-edge" stroke="var(--cyan)" strokeWidth={1.25} opacity={0.55} />
        ))}

        {/* replication edges: leader → each replica (dashed) */}
        {R_REPLICAS.map((rep, i) => {
          const rc = center(rep);
          const lx = R_LEADER.x + R_LEADER.w;
          return (
            <g key={`rep${i}`}>
              <path
                id={`${uid}-rep${i}`}
                d={`M ${lx} ${leaderC.y} C ${lx + 60} ${leaderC.y}, ${rep.x - 60} ${rc.y}, ${rep.x} ${rc.y}`}
                className="hn-edge hn-edge--dashed"
                stroke="var(--purple)"
                fill="none"
              />
            </g>
          );
        })}
        {/* replication label + lag metric (parked above the middle replica edge) */}
        {(() => {
          const label = tr('レプリケーション', 'replication');
          const w = textWidth(label) + 24;
          const bx = 500;
          const byTop = 150;
          return (
            <g>
              <rect x={bx} y={byTop} width={w} height={24} rx={6} fill="var(--bg-elevated)" stroke="var(--purple)" />
              <text x={bx + w / 2} y={byTop + 16} textAnchor="middle" fill="var(--purple)" fontSize={12} fontFamily={MONO}>
                {label}
              </text>
              <text x={bx + w / 2} y={byTop + 40} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                {tr('遅延 ~30ms', 'lag ~30ms')}
              </text>
            </g>
          );
        })()}

        {/* app server cards */}
        {R_APPS.map((a, i) => (
          <g key={`app${i}`}>
            <rect x={a.x} y={a.y} width={a.w} height={a.h} rx={10} fill="var(--surface)" stroke="var(--border-strong)" />
            <text x={a.x + a.w / 2} y={a.y + 22} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={600}>
              {tr('アプリ', 'app')}
            </text>
            <text x={a.x + a.w / 2} y={a.y + 39} textAnchor="middle" fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
              {tr(`サーバー ${i + 1}`, `server ${i + 1}`)}
            </text>
          </g>
        ))}

        {/* leader DB */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={R_LEADER.x} y={R_LEADER.y} width={R_LEADER.w} height={R_LEADER.h} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.75} />
          <DbGlyph x={R_LEADER.x + 14} y={R_LEADER.y + 14} w={30} h={44} color="var(--accent)" />
          <text x={R_LEADER.x + 56} y={R_LEADER.y + 32} fill="var(--text)" fontSize={13} fontWeight={700}>
            {tr('リーダー', 'leader')}
          </text>
          <text x={R_LEADER.x + 56} y={R_LEADER.y + 50} fill="var(--accent)" fontSize={12} fontFamily={MONO}>
            {tr('(プライマリ)', '(primary)')}
          </text>
          <text x={R_LEADER.x + R_LEADER.w / 2} y={R_LEADER.y - 10} textAnchor="middle" fill="var(--accent)" fontSize={12} fontWeight={700} fontFamily={MONO}>
            {tr('書き込み', 'writes')}
          </text>
        </g>

        {/* replica DBs */}
        {R_REPLICAS.map((rep, i) => (
          <g key={`rc${i}`} style={{ '--tone': 'var(--cyan)' } as CSSProperties}>
            <rect x={rep.x} y={rep.y} width={rep.w} height={rep.h} rx={11} fill="var(--surface)" stroke="var(--cyan)" strokeWidth={1.5} />
            <DbGlyph x={rep.x + 12} y={rep.y + 12} w={24} h={36} color="var(--cyan)" />
            <text x={rep.x + 46} y={rep.y + 26} fill="var(--text)" fontSize={12} fontWeight={600}>
              {tr('レプリカ', 'replica')}
            </text>
            <text x={rep.x + 46} y={rep.y + 43} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
              {tr(`フォロワー ${i + 1}`, `follower ${i + 1}`)}
            </text>
          </g>
        ))}
        <text x={R_REPLICAS[0].x + R_REPLICAS[0].w / 2} y={R_REPLICAS[0].y - 10} textAnchor="middle" fill="var(--cyan)" fontSize={12} fontWeight={700} fontFamily={MONO}>
          {tr('読み取り', 'reads')}
        </text>

        {/* animated packets (SMIL animateMotion); static when reduced motion */}
        {!reduced && (
          <g>
            {R_APPS.map((_, i) => (
              <circle key={`wpk${i}`} r={5} fill="var(--accent)">
                <animateMotion dur="1.9s" begin={`${i * 0.5}s`} repeatCount="indefinite" rotate="0">
                  <mpath href={`#${uid}-wp${i}`} />
                </animateMotion>
              </circle>
            ))}
            {R_READ_ROUTE.map((_, i) => (
              <circle key={`rpk${i}`} r={4.5} fill="var(--cyan)">
                <animateMotion dur="2.1s" begin={`${0.25 + i * 0.45}s`} repeatCount="indefinite" rotate="0">
                  <mpath href={`#${uid}-rp${i}`} />
                </animateMotion>
              </circle>
            ))}
            {R_REPLICAS.map((_, i) => (
              <circle key={`reppk${i}`} r={3.5} fill="var(--purple)">
                <animateMotion dur="2.4s" begin={`${0.6 + i * 0.3}s`} repeatCount="indefinite" rotate="0">
                  <mpath href={`#${uid}-rep${i}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
        )}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) DbReplicaLag
// ============================================================================
type LagSource = 'replica' | 'leader';

// A phone-screen timeline: shows which tweets a read returns. When reading from
// a replica right after posting, the brand-new tweet has not replicated yet, so
// it is missing. Reading from the leader shows it. One clear before/after.
const G_VIEW_W = 820;
const G_VIEW_H = 360;

function PhoneScreen({ fromReplica, tr }: { fromReplica: boolean; tr: (ja: string, en: string) => string }) {
  const px = 40;
  const py = 70;
  const pw = 250;
  const ph = 262;
  // Newest tweet (just posted) is only visible when reading the leader.
  const newestVisible = !fromReplica;
  const rowY = (i: number) => py + 86 + i * 52;
  const olderTweets = [
    { user: '@alice', text: tr('いい天気☀️', 'nice weather ☀️') },
    { user: '@bob', text: tr('ランチなう🍜', 'lunch time 🍜') },
  ];
  return (
    <g>
      {/* phone frame */}
      <rect x={px} y={py} width={pw} height={ph} rx={20} fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth={2} />
      {/* screen header */}
      <text x={px + 20} y={py + 32} fill="var(--text)" fontSize={14} fontWeight={700}>
        {tr('あなたのタイムライン', 'your timeline')}
      </text>
      <line x1={px + 16} y1={py + 46} x2={px + pw - 16} y2={py + 46} stroke="var(--border)" />

      {/* newest tweet slot (the one you just posted) */}
      {newestVisible ? (
        <g style={{ '--tone': 'var(--green)' } as CSSProperties}>
          <rect x={px + 16} y={rowY(0) - 20} width={pw - 32} height={44} rx={8} fill="var(--green-soft)" stroke="var(--green)" />
          <text x={px + 28} y={rowY(0) - 2} fill="var(--text)" fontSize={12} fontWeight={700}>
            {tr('@you · たった今', '@you · just now')}
          </text>
          <text x={px + 28} y={rowY(0) + 16} fill="var(--text-muted)" fontSize={12}>
            {tr('はじめてのツイート！', 'my first tweet!')}
          </text>
        </g>
      ) : (
        <g>
          <rect x={px + 16} y={rowY(0) - 20} width={pw - 32} height={44} rx={8} fill="none" stroke="var(--red)" strokeDasharray="4 4" />
          <text x={px + pw / 2} y={rowY(0) + 6} textAnchor="middle" fill="var(--red)" fontSize={12} fontWeight={600}>
            {tr('さっきの投稿が出ない…', 'your new tweet is missing…')}
          </text>
        </g>
      )}

      {/* older tweets (always present) */}
      {olderTweets.map((tw, i) => (
        <g key={i}>
          <text x={px + 28} y={rowY(i + 1) - 2} fill="var(--text)" fontSize={12} fontWeight={600}>
            {tw.user}
          </text>
          <text x={px + 28} y={rowY(i + 1) + 16} fill="var(--text-muted)" fontSize={12}>
            {tw.text}
          </text>
          {i < olderTweets.length && (
            <line x1={px + 16} y1={rowY(i + 1) + 28} x2={px + pw - 16} y2={rowY(i + 1) + 28} stroke="var(--border)" />
          )}
        </g>
      ))}
    </g>
  );
}

export function DbReplicaLag() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [source, setSource] = useState<LagSource>('replica');
  const uid = useId().replace(/:/g, '');
  const fromReplica = source === 'replica';

  // Node geometry (right side).
  const leader = { x: 560, y: 92, w: 220, h: 92 };
  const replica = { x: 560, y: 238, w: 220, h: 92 };
  const target = fromReplica ? replica : leader;
  const readTone = fromReplica ? 'var(--cyan)' : 'var(--accent)';
  const readPath = `M 302 ${70 + 262 / 2} C 420 ${70 + 262 / 2}, 440 ${target.y + target.h / 2}, ${target.x} ${target.y + target.h / 2}`;
  const replPath = `M ${leader.x + leader.w / 2} ${leader.y + leader.h} C ${leader.x + leader.w / 2} ${(leader.y + leader.h + replica.y) / 2}, ${replica.x + replica.w / 2} ${(leader.y + leader.h + replica.y) / 2}, ${replica.x + replica.w / 2} ${replica.y}`;

  return (
    <DiagramFrame
      height={340}
      caption={tr(
        '非同期レプリケーションでは、書いた直後にレプリカを読むと、まだ複製されておらず古い結果が返る',
        'With async replication, reading a replica right after a write returns a stale result — it has not replicated yet',
      )}
      controls={
        <>
          <ToggleButton active={fromReplica} onClick={() => setSource('replica')} label={tr('レプリカから読む', 'read from replica')} />
          <ToggleButton active={!fromReplica} onClick={() => setSource('leader')} label={tr('リーダーから読む', 'read from leader')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${G_VIEW_W} ${G_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          '投稿直後にタイムラインを読む図。レプリカから読むと新しい投稿が欠け、リーダーから読むと表示される',
          'Reading the timeline right after posting: the new tweet is missing from the replica but present on the leader',
        )}
      >
        <defs>
          <marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={readTone} />
          </marker>
          <path id={`${uid}-read`} d={readPath} fill="none" />
          <path id={`${uid}-repl`} d={replPath} fill="none" />
        </defs>

        {/* header */}
        <text x={40} y={34} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('ツイートを投稿した直後に、タイムラインを開くと?', 'open your timeline right after posting a tweet?')}
        </text>

        {/* phone */}
        <PhoneScreen fromReplica={fromReplica} tr={tr} />

        {/* read edge: phone → chosen source */}
        <use href={`#${uid}-read`} className="hn-edge" stroke={readTone} strokeWidth={2} markerEnd={`url(#${uid}-arrow)`} />
        {(() => {
          const label = fromReplica ? tr('レプリカから読む', 'read from replica') : tr('リーダーから読む', 'read from leader');
          const w = textWidth(label) + 20;
          return (
            <g>
              <rect x={420 - w / 2} y={150} width={w} height={22} rx={11} fill="var(--surface)" stroke={readTone} />
              <text x={420} y={165} textAnchor="middle" fill={readTone} fontSize={12} fontWeight={700}>
                {label}
              </text>
            </g>
          );
        })()}
        {!reduced && (
          <circle r={5} fill={readTone}>
            <animateMotion dur="1.8s" repeatCount="indefinite">
              <mpath href={`#${uid}-read`} />
            </animateMotion>
          </circle>
        )}

        {/* leader node */}
        <g style={{ '--tone': 'var(--accent)' } as CSSProperties}>
          <rect x={leader.x} y={leader.y} width={leader.w} height={leader.h} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.75} />
          <DbGlyph x={leader.x + 16} y={leader.y + 16} w={28} h={44} color="var(--accent)" />
          <text x={leader.x + 58} y={leader.y + 32} fill="var(--text)" fontSize={13} fontWeight={700}>
            {tr('リーダー', 'leader')}
          </text>
          <text x={leader.x + 58} y={leader.y + 52} fill="var(--green)" fontSize={12} fontWeight={700}>
            {tr('新しい投稿あり ✓', 'has the new tweet ✓')}
          </text>
          <text x={leader.x + 58} y={leader.y + 72} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
            {tr('投稿はここに保存', 'writes land here')}
          </text>
        </g>

        {/* replication edge: leader → replica */}
        <use href={`#${uid}-repl`} className="hn-edge hn-edge--dashed" stroke="var(--purple)" />
        {(() => {
          const label = tr('複製 ~300ms 遅れ', 'replicates ~300ms late');
          const w = textWidth(label, 11) + 16;
          return (
            <g>
              <rect x={leader.x + leader.w / 2 - w / 2} y={leader.y + leader.h + 32} width={w} height={20} rx={6} fill="var(--bg-elevated)" stroke="var(--purple)" />
              <text x={leader.x + leader.w / 2} y={leader.y + leader.h + 46} textAnchor="middle" fill="var(--purple)" fontSize={11} fontFamily={MONO}>
                {label}
              </text>
            </g>
          );
        })()}
        {!reduced && (
          <circle r={3.5} fill="var(--purple)">
            <animateMotion dur="2.6s" repeatCount="indefinite">
              <mpath href={`#${uid}-repl`} />
            </animateMotion>
          </circle>
        )}

        {/* replica node */}
        <g style={{ '--tone': 'var(--cyan)' } as CSSProperties}>
          <rect x={replica.x} y={replica.y} width={replica.w} height={replica.h} rx={12} fill="var(--surface)" stroke="var(--cyan)" strokeWidth={1.5} />
          <DbGlyph x={replica.x + 16} y={replica.y + 16} w={28} h={44} color="var(--cyan)" />
          <text x={replica.x + 58} y={replica.y + 32} fill="var(--text)" fontSize={13} fontWeight={700}>
            {tr('レプリカ', 'replica')}
          </text>
          <text x={replica.x + 58} y={replica.y + 52} fill="var(--red)" fontSize={12} fontWeight={700}>
            {tr('まだ古い（投稿なし）', 'still stale (no tweet)')}
          </text>
          <text x={replica.x + 58} y={replica.y + 72} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
            {tr('複製が届くまで数十ms', 'tens of ms behind')}
          </text>
        </g>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 3) DbSharding
// ============================================================================
type ShardStrategy = 'hash' | 'range';

const H_VIEW_W = 820;
const H_VIEW_H = 360;
const H_N = 4; // shards

// Incoming keys (user_id). Deterministic — precomputed, never Math.random.
const H_KEYS = [42, 1001, 777, 128, 503, 1620, 311, 950];

// Range boundaries for range sharding: [0..499], [500..999], [1000..1499], [1500+].
function rangeShard(key: number): number {
  if (key < 500) return 0;
  if (key < 1000) return 1;
  if (key < 1500) return 2;
  return 3;
}
// Hash sharding: a small deterministic mixing hash, then % N. Looks even.
function hashShard(key: number): number {
  let h = key >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  return h % H_N;
}

// Precompute routing + per-shard counts for both strategies (module constant).
const H_ROUTING: Record<ShardStrategy, { shardOf: number[]; counts: number[] }> = (() => {
  const build = (fn: (k: number) => number) => {
    const shardOf = H_KEYS.map(fn);
    const counts = new Array<number>(H_N).fill(0);
    shardOf.forEach((s) => (counts[s] += 1));
    return { shardOf, counts };
  };
  return { hash: build(hashShard), range: build(rangeShard) };
})();

const H_SHARD_W = 150;
const H_SHARD_H = 118;
const H_SHARD_GAP = 18;
const H_SHARD_X0 = 300;
const H_SHARD_Y = 150;
const H_BAR_MAX_H = 70;

const shardBox = (i: number) => ({
  x: H_SHARD_X0 + i * (H_SHARD_W + H_SHARD_GAP),
  y: H_SHARD_Y,
  w: H_SHARD_W,
  h: H_SHARD_H,
});

const H_RANGE_LABELS = ['0–499', '500–999', '1000–1499', '1500+'];

export function DbSharding() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [strategy, setStrategy] = useState<ShardStrategy>('hash');

  const routing = H_ROUTING[strategy];
  const maxCount = Math.max(...routing.counts, 1);
  const hotspotShard = strategy === 'range'
    ? routing.counts.indexOf(Math.max(...routing.counts))
    : -1;

  // Transition when switching strategy (purely CSS-driven; respects reduced motion).
  const flow = reduced ? 'none' : 'transform 500ms cubic-bezier(.4,0,.2,1), opacity 400ms';

  const incomingX = 54;
  const incomingW = 180;

  return (
    <DiagramFrame
      height={340}
      caption={tr(
        'キーでデータを複数DBに分割する。分け方しだいで偏り（ホットスポット）が出る',
        'Split data across DBs by key; the wrong split creates hotspots',
      )}
      controls={
        <>
          <ToggleButton active={strategy === 'hash'} onClick={() => setStrategy('hash')} label={tr('ハッシュ分割', 'hash')} />
          <ToggleButton active={strategy === 'range'} onClick={() => setStrategy('range')} label={tr('範囲分割', 'range')} />
        </>
      }
    >
      <svg
        className="hero-net"
        viewBox={`0 0 ${H_VIEW_W} ${H_VIEW_H}`}
        width="100%"
        role="img"
        aria-label={tr(
          'user_id をハッシュまたは範囲で複数のシャードに振り分ける図',
          'Routing user_id keys into shards by hash or by range',
        )}
      >
        {/* header + routing rule */}
        <text x={40} y={32} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('ユーザーを複数DBに分割', 'splitting users across DBs')}
        </text>
        <text x={40} y={54} fontSize={13} fill="var(--accent)" fontFamily={MONO}>
          {strategy === 'hash'
            ? 'shard = hash(user_id) % 4'
            : tr('shard = user_id の範囲', 'shard = range of user_id')}
        </text>

        {/* incoming keys list */}
        <text x={incomingX} y={H_SHARD_Y - 14} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
          {tr('受信 (user_id)', 'incoming (user_id)')}
        </text>
        {H_KEYS.map((key, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const kw = 78;
          const kx = incomingX + col * (kw + 10);
          const ky = H_SHARD_Y + 8 + row * 30;
          const target = shardBox(routing.shardOf[i]);
          const hot = routing.shardOf[i] === hotspotShard;
          const tone = hot ? 'var(--amber)' : 'var(--cyan)';
          return (
            <g key={`k${key}`}>
              {/* routing edge from key to its shard (deterministic) */}
              <line
                x1={kx + kw}
                y1={ky + 11}
                x2={target.x}
                y2={target.y + 24}
                className="hn-edge"
                stroke={tone}
                strokeWidth={1}
                opacity={0.35}
                style={{ transition: flow }}
              />
              <rect x={kx} y={ky} width={kw} height={22} rx={6} fill="var(--surface)" stroke="var(--border-strong)" />
              <text x={kx + kw / 2} y={ky + 15} textAnchor="middle" fill="var(--text)" fontSize={12} fontFamily={MONO}>
                {key}
              </text>
            </g>
          );
        })}
        <rect x={incomingX - 12} y={H_SHARD_Y} width={incomingW} height={H_SHARD_H} rx={10} fill="none" stroke="var(--border)" opacity={0.5} />

        {/* shard cards */}
        {Array.from({ length: H_N }).map((_, i) => {
          const b = shardBox(i);
          const count = routing.counts[i];
          const hot = i === hotspotShard;
          const tone = hot ? 'var(--amber)' : 'var(--cyan)';
          const soft = hot ? 'var(--amber-soft)' : 'var(--surface)';
          const barH = (count / maxCount) * H_BAR_MAX_H;
          const barY = b.y + b.h - 14 - barH;
          return (
            <g key={`shard${i}`} style={{ '--tone': tone } as CSSProperties}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={12} fill={soft} stroke={tone} strokeWidth={hot ? 2 : 1.5} />
              <DbGlyph x={b.x + 12} y={b.y + 14} w={22} h={30} color={tone} />
              <text x={b.x + 44} y={b.y + 26} fill="var(--text)" fontSize={12} fontWeight={700}>
                {tr(`シャード ${i}`, `shard ${i}`)}
              </text>
              {strategy === 'range' && (
                <text x={b.x + 44} y={b.y + 42} fill="var(--text-dim)" fontSize={12} fontFamily={MONO}>
                  {H_RANGE_LABELS[i]}
                </text>
              )}

              {/* count fill bar */}
              <rect x={b.x + b.w - 30} y={b.y + 14} width={16} height={b.h - 28} rx={3} fill="var(--bg-elevated)" stroke="var(--border)" />
              <rect
                x={b.x + b.w - 30}
                y={barY}
                width={16}
                height={barH}
                rx={3}
                fill={tone}
                opacity={0.75}
                style={{ transition: flow }}
              />

              <text x={b.x + 16} y={b.y + b.h - 16} fill={tone} fontSize={13} fontWeight={700} fontFamily={MONO}>
                {tr(`${count} 行`, `${count} rows`)}
              </text>

              {/* hotspot badge */}
              {hot && (() => {
                const label = tr('ホットスポット', 'hotspot');
                const w = textWidth(label) + 20;
                return (
                  <g>
                    <rect x={b.x + b.w / 2 - w / 2} y={b.y - 28} width={w} height={22} rx={11} fill="var(--amber-soft)" stroke="var(--amber)" />
                    <circle cx={b.x + b.w / 2 - w / 2 + 12} cy={b.y - 17} r={3.5} className="hn-node__dot" />
                    <text x={b.x + b.w / 2 + 6} y={b.y - 13} textAnchor="middle" fill="var(--amber)" fontSize={12} fontWeight={700}>
                      {label}
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}

        {/* verdict note */}
        <text x={40} y={H_VIEW_H - 24} fill="var(--text-muted)" fontSize={12}>
          {strategy === 'hash'
            ? tr('ハッシュ分割: 分布は均等になりやすい', 'hash: distribution tends to be even')
            : tr('範囲分割: 一部の範囲にアクセスが集中しやすい', 'range: some ranges attract most of the traffic')}
        </text>
      </svg>
    </DiagramFrame>
  );
}
