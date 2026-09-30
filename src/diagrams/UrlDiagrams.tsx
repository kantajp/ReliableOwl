import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDefs, DiagramFrame, Edge, NodeBox, Packet, icons } from './primitives';
import { useLang } from '../i18n';

// ---- URL: basic flow (Client -> API -> DB -> back) ----
export function UrlBasicFlow() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const cx = 70, ax = 300, dx = 530, y = 100;
  const midY = y + 32;
  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      caption={lang === 'ja' ? 'リクエストが Client → API → DB を往復する' : 'A request round-trips Client → API → DB'}
      height={200}
    >
      <svg viewBox="0 0 660 200" width="100%" style={{ maxHeight: 200 }}>
        <ArrowDefs />
        <Edge x1={cx + 116} y1={midY} x2={ax} y2={midY} />
        <Edge x1={ax + 116} y1={midY} x2={dx} y2={midY} />
        <NodeBox x={cx} y={y} label="Client" icon={icons.client} tone="accent" />
        <NodeBox x={ax} y={y} label="API Server" sub="/redirect" icon={icons.server} tone="cyan" />
        <NodeBox x={dx} y={y} label="Database" sub="key → url" icon={icons.db} tone="purple" />
        {/* forward */}
        <Packet
          playKey={play * 10 + 1}
          color="var(--accent)"
          duration={2.4}
          label="GET aX9k2"
          path={[
            { x: cx + 116, y: midY },
            { x: ax, y: midY },
            { x: ax + 116, y: midY },
            { x: dx, y: midY },
          ]}
        />
        {/* return */}
        <Packet
          playKey={play * 10 + 2}
          color="var(--green)"
          duration={2.4}
          delay={2.4}
          label="301 → url"
          path={[
            { x: dx, y: midY },
            { x: ax + 116, y: midY },
            { x: ax, y: midY },
            { x: cx + 116, y: midY },
          ]}
        />
      </svg>
    </DiagramFrame>
  );
}

// ---- URL: key generation (sequential ID -> Base62) ----
export function UrlKeyGeneration() {
  const { lang } = useLang();
  const samples = [
    { id: 1, key: '1' },
    { id: 125, key: 'cb' },
    { id: 999999, key: '4c91' },
    { id: 3521614606208, key: 'aX9k2Qp' },
  ];
  const [i, setI] = useState(0);
  const cur = samples[i];
  return (
    <DiagramFrame
      caption={lang === 'ja' ? '連番ID を Base62 に変換して短いキーにする' : 'Convert a sequential ID to Base62 for a short key'}
      height={190}
      controls={
        <button className="btn btn--ghost" onClick={() => setI((v) => (v + 1) % samples.length)}>
          {lang === 'ja' ? '次の例 →' : 'Next example →'}
        </button>
      }
    >
      <svg viewBox="0 0 660 190" width="100%" style={{ maxHeight: 190 }}>
        <ArrowDefs />
        <Edge x1={230} y1={95} x2={330} y2={95} />
        <Edge x1={446} y1={95} x2={546} y2={95} />
        <NodeBox x={40} y={63} w={190} h={64} label={lang === 'ja' ? '連番 ID' : 'Sequential ID'} sub={String(cur.id)} tone="amber" active />
        <g>
          <rect x={330} y={70} width={116} height={50} rx={10} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.25} />
          <text x={388} y={100} textAnchor="middle" fill="var(--accent)" fontSize={13} fontWeight={600}>
            Base62
          </text>
        </g>
        <AnimatePresence mode="popLayout">
          <motion.g
            key={cur.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35 }}
          >
            <rect x={546} y={63} width={80} height={64} rx={12} fill="var(--surface)" stroke="var(--green)" strokeWidth={2} />
            <text x={586} y={101} textAnchor="middle" fill="var(--green)" fontSize={18} fontWeight={700} fontFamily="var(--font-mono)">
              {cur.key}
            </text>
          </motion.g>
        </AnimatePresence>
      </svg>
    </DiagramFrame>
  );
}

// ---- URL: Read / Write path ----
export function UrlReadWrite() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const [mode, setMode] = useState<'write' | 'read'>('write');
  const cx = 60, ax = 290, dx = 520;
  const wy = 60, ry = 130;
  const boxY = mode === 'write' ? wy : ry;
  const midY = boxY + 32;
  const caption =
    mode === 'write'
      ? lang === 'ja'
        ? '書き込み: キーを発行して保存'
        : 'Write: issue a key and store it'
      : lang === 'ja'
        ? '読み取り: キーから元URLを引く'
        : 'Read: look up the original URL by key';
  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      caption={caption}
      height={240}
      controls={
        <div className="toggle">
          <button className={mode === 'write' ? 'toggle__on' : ''} onClick={() => { setMode('write'); setPlay((p) => p + 1); }}>
            Write
          </button>
          <button className={mode === 'read' ? 'toggle__on' : ''} onClick={() => { setMode('read'); setPlay((p) => p + 1); }}>
            Read
          </button>
        </div>
      }
    >
      <svg viewBox="0 0 640 240" width="100%" style={{ maxHeight: 240 }}>
        <ArrowDefs />
        <Edge x1={cx + 116} y1={midY} x2={ax} y2={midY} />
        <Edge x1={ax + 116} y1={midY} x2={dx} y2={midY} />
        <NodeBox x={cx} y={boxY} label="Client" icon={icons.client} tone="accent" />
        <NodeBox
          x={ax}
          y={boxY}
          label="API Server"
          sub={mode === 'write' ? (lang === 'ja' ? 'キー発行' : 'issue key') : (lang === 'ja' ? 'キー照会' : 'lookup key')}
          icon={icons.server}
          tone="cyan"
        />
        <NodeBox x={dx} y={boxY} label="Database" icon={icons.db} tone="purple" />
        {mode === 'write' ? (
          <>
            <Packet playKey={play * 10 + 1} color="var(--accent)" duration={2.4} label="POST long-url"
              path={[{ x: cx + 116, y: midY }, { x: ax, y: midY }, { x: ax + 116, y: midY }, { x: dx, y: midY }]} />
            <Packet playKey={play * 10 + 2} color="var(--green)" duration={2.4} delay={2.4} label="saved: aX9k2"
              path={[{ x: dx, y: midY }, { x: ax + 116, y: midY }, { x: ax, y: midY }, { x: cx + 116, y: midY }]} />
          </>
        ) : (
          <>
            <Packet playKey={play * 10 + 3} color="var(--accent)" duration={2.4} label="GET aX9k2"
              path={[{ x: cx + 116, y: midY }, { x: ax, y: midY }, { x: ax + 116, y: midY }, { x: dx, y: midY }]} />
            <Packet playKey={play * 10 + 4} color="var(--green)" duration={2.4} delay={2.4} label="301 → long-url"
              path={[{ x: dx, y: midY }, { x: ax + 116, y: midY }, { x: ax, y: midY }, { x: cx + 116, y: midY }]} />
          </>
        )}
      </svg>
    </DiagramFrame>
  );
}

// ---- URL: scaling with a cache ----
export function UrlCacheScale() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const [cacheOn, setCacheOn] = useState(true);
  const [hit, setHit] = useState(true);
  const cx = 50, ax = 250, chx = 470, dx = 470;
  const rowY = 60;
  const midY = rowY + 32;
  const cacheY = 60;
  const dbY = 150;

  const caption = !cacheOn
    ? lang === 'ja'
      ? 'キャッシュ無し: 毎回DBへ'
      : 'No cache: hit the DB every time'
    : hit
      ? lang === 'ja'
        ? 'キャッシュヒット: DBに行かず即返す'
        : 'Cache hit: return instantly without the DB'
      : lang === 'ja'
        ? 'キャッシュミス: DBから引いて載せる'
        : 'Cache miss: read from DB and populate';

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={260}
      caption={caption}
      controls={
        <>
          <div className="toggle">
            <button className={cacheOn ? 'toggle__on' : ''} onClick={() => { setCacheOn(true); setPlay((p) => p + 1); }}>
              {lang === 'ja' ? 'キャッシュ有' : 'Cache on'}
            </button>
            <button className={!cacheOn ? 'toggle__on' : ''} onClick={() => { setCacheOn(false); setPlay((p) => p + 1); }}>
              {lang === 'ja' ? '無し' : 'Off'}
            </button>
          </div>
          {cacheOn && (
            <button className="btn btn--ghost" onClick={() => { setHit((h) => !h); setPlay((p) => p + 1); }}>
              {hit ? (lang === 'ja' ? 'ミスにする' : 'Make it miss') : (lang === 'ja' ? 'ヒットにする' : 'Make it hit')}
            </button>
          )}
        </>
      }
    >
      <svg viewBox="0 0 640 260" width="100%" style={{ maxHeight: 260 }}>
        <ArrowDefs />
        <Edge x1={cx + 116} y1={midY} x2={ax} y2={midY} />
        {cacheOn ? (
          <>
            <Edge x1={ax + 116} y1={midY} x2={chx} y2={cacheY + 32} />
            <Edge x1={ax + 90} y1={rowY + 64} x2={dx} y2={dbY} dashed dimmed={hit} />
            <NodeBox x={chx} y={cacheY} label="Cache" sub="Redis" icon={icons.cache} tone="amber" active={hit} />
            <NodeBox x={dx} y={dbY} label="Database" icon={icons.db} tone="purple" dimmed={hit} />
          </>
        ) : (
          <>
            <Edge x1={ax + 116} y1={midY} x2={dx} y2={midY} />
            <NodeBox x={dx} y={rowY} label="Database" icon={icons.db} tone="purple" active />
          </>
        )}
        <NodeBox x={cx} y={rowY} label="Client" icon={icons.client} tone="accent" />
        <NodeBox x={ax} y={rowY} label="API" icon={icons.server} tone="cyan" />

        {cacheOn ? (
          hit ? (
            <>
              <Packet playKey={play * 10 + 1} color="var(--accent)" duration={1.8}
                path={[{ x: cx + 116, y: midY }, { x: ax, y: midY }]} />
              <Packet playKey={play * 10 + 2} color="var(--accent)" duration={1.6} delay={1.8}
                path={[{ x: ax + 116, y: midY }, { x: chx, y: cacheY + 32 }]} />
              <Packet playKey={play * 10 + 3} color="var(--green)" duration={1.6} delay={3.4} label="HIT"
                path={[{ x: chx, y: cacheY + 32 }, { x: ax + 116, y: midY }, { x: ax, y: midY }, { x: cx + 116, y: midY }]} />
            </>
          ) : (
            <>
              <Packet playKey={play * 10 + 4} color="var(--accent)" duration={1.6}
                path={[{ x: cx + 116, y: midY }, { x: ax, y: midY }, { x: ax + 116, y: midY }, { x: chx, y: cacheY + 32 }]} />
              <Packet playKey={play * 10 + 5} color="var(--red)" duration={1.8} delay={1.6} label="MISS"
                path={[{ x: ax + 60, y: rowY + 64 }, { x: dx + 30, y: dbY }]} />
              <Packet playKey={play * 10 + 6} color="var(--green)" duration={1.8} delay={3.4}
                path={[{ x: dx + 30, y: dbY }, { x: chx + 40, y: cacheY + 64 }]} />
            </>
          )
        ) : (
          <>
            <Packet playKey={play * 10 + 7} color="var(--accent)" duration={2.2}
              path={[{ x: cx + 116, y: midY }, { x: ax, y: midY }, { x: ax + 116, y: midY }, { x: dx, y: rowY + 32 }]} />
            <Packet playKey={play * 10 + 8} color="var(--green)" duration={2.2} delay={2.2}
              path={[{ x: dx, y: rowY + 32 }, { x: ax + 116, y: midY }, { x: ax, y: midY }, { x: cx + 116, y: midY }]} />
          </>
        )}
      </svg>
    </DiagramFrame>
  );
}

// ---- URL: capacity estimation (read-heavy) ----
export function UrlCapacity() {
  const { lang } = useLang();
  // Assumptions: 1M new URLs/day, read:write = 100:1
  const writePerS = 12; // 1M / 86400 ≈ 11.6
  const readPerS = 1160; // 100x
  const barX = 210;
  const barMax = 400;
  return (
    <DiagramFrame
      caption={lang === 'ja' ? '読み取りが書き込みを圧倒する（約100:1）' : 'Reads dominate writes (~100:1)'}
      height={230}
    >
      <svg viewBox="0 0 660 230" width="100%" style={{ maxHeight: 230 }}>
        {/* Write bar */}
        <text x={20} y={54} fill="var(--text)" fontSize={13} fontWeight={600}>
          {lang === 'ja' ? '書き込み' : 'Writes'}
        </text>
        <text x={20} y={70} fill="var(--text-dim)" fontSize={11} fontFamily="var(--font-mono)">
          ~{writePerS.toLocaleString()}/s
        </text>
        <rect x={barX} y={40} width={barMax} height={26} rx={7} fill="var(--bg-elevated)" stroke="var(--border)" />
        <motion.rect
          x={barX}
          y={40}
          height={26}
          rx={7}
          fill="var(--cyan)"
          initial={{ width: 0 }}
          whileInView={{ width: 6 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
        />

        {/* Read bar */}
        <text x={20} y={124} fill="var(--text)" fontSize={13} fontWeight={600}>
          {lang === 'ja' ? '読み取り' : 'Reads'}
        </text>
        <text x={20} y={140} fill="var(--text-dim)" fontSize={11} fontFamily="var(--font-mono)">
          ~{readPerS.toLocaleString()}/s
        </text>
        <rect x={barX} y={110} width={barMax} height={26} rx={7} fill="var(--bg-elevated)" stroke="var(--border)" />
        <motion.rect
          x={barX}
          y={110}
          height={26}
          rx={7}
          fill="var(--green)"
          initial={{ width: 0 }}
          whileInView={{ width: barMax }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        {/* Storage callout */}
        <g>
          <rect x={barX} y={168} width={barMax} height={44} rx={10} fill="var(--purple)" opacity={0.12} stroke="var(--purple)" strokeWidth={1} />
          <text x={barX + 16} y={188} fill="var(--purple)" fontSize={12} fontWeight={700}>
            {lang === 'ja' ? 'ストレージ (5年)' : 'Storage (5 yrs)'}
          </text>
          <text x={barX + 16} y={204} fill="var(--text-muted)" fontSize={11} fontFamily="var(--font-mono)">
            1M/day × 500B × 365 × 5 ≈ 0.9 TB
          </text>
        </g>
        <text x={20} y={192} fill="var(--text-dim)" fontSize={11}>
          {lang === 'ja' ? 'データ量' : 'Data'}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ---- URL: cache eviction (LRU) ----
export function UrlCacheEviction() {
  const { lang } = useLang();
  const CAP = 4;
  // items[0] = most recently used, items[last] = least recently used
  const [items, setItems] = useState<string[]>(['aX9', 'bK2', 'cQ7', 'dM4']);
  const [flash, setFlash] = useState<{ key: string; type: 'hit' | 'evict' | 'add' } | null>(null);
  const pool = ['eR5', 'fT8', 'gW1', 'hY6', 'aX9', 'cQ7'];
  const [n, setN] = useState(0);

  const access = () => {
    const key = pool[n % pool.length];
    setN((v) => v + 1);
    setItems((prev) => {
      if (prev.includes(key)) {
        // hit: move to front
        setFlash({ key, type: 'hit' });
        return [key, ...prev.filter((k) => k !== key)];
      }
      // miss: insert at front, evict least-recently-used if full
      let next = [key, ...prev];
      if (next.length > CAP) {
        next = next.slice(0, CAP);
        setFlash({ key, type: 'evict' });
      } else {
        setFlash({ key, type: 'add' });
      }
      return next;
    });
    setTimeout(() => setFlash(null), 900);
  };

  const nextKey = pool[n % pool.length];
  const caption =
    flash?.type === 'hit'
      ? lang === 'ja'
        ? `ヒット: ${flash.key} を先頭へ`
        : `Hit: move ${flash.key} to front`
      : flash?.type === 'evict'
        ? lang === 'ja'
          ? '満杯: 最も使われていない項目を追い出す'
          : 'Full: evict the least-recently-used item'
        : lang === 'ja'
          ? '左が最新・右が最古（LRU）'
          : 'Left = most recent, right = least recent (LRU)';

  return (
    <DiagramFrame
      caption={caption}
      height={200}
      controls={
        <button className="btn" onClick={access}>
          {lang === 'ja' ? `アクセス: ${nextKey}` : `Access: ${nextKey}`}
        </button>
      }
    >
      <div style={{ width: '100%', padding: '8px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 520, margin: '0 auto 10px', fontSize: 11, color: 'var(--text-dim)' }}>
          <span>{lang === 'ja' ? '← 最近使った' : '← most recent'}</span>
          <span>{lang === 'ja' ? '最も使ってない →' : 'least recent →'}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', maxWidth: 520, margin: '0 auto', minHeight: 84 }}>
          <AnimatePresence mode="popLayout">
            {items.map((key) => {
              const isFlash = flash?.key === key;
              const color =
                isFlash && flash?.type === 'hit'
                  ? 'var(--green)'
                  : isFlash && flash?.type === 'add'
                    ? 'var(--accent)'
                    : 'var(--border-strong)';
              return (
                <motion.div
                  key={key}
                  layout
                  initial={{ opacity: 0, scale: 0.7, y: -16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.6, y: 20 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  style={{
                    width: 92,
                    height: 72,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 12,
                    border: `1.5px solid ${color}`,
                    background: 'var(--surface)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    fontWeight: 600,
                    color: 'var(--text)',
                    boxShadow: isFlash ? `0 0 12px ${color}` : 'none',
                  }}
                >
                  {key}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </DiagramFrame>
  );
}

// ---- URL: key uniqueness in a distributed setup (range partitioning) ----
export function UrlKeyUniqueness() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const kx = 40, ky = 96; // KGS node
  const sx = 400; // servers column
  const rows = [40, 130, 220];
  const ranges = ['[0 – 999]', '[1000 – 1999]', '[2000 – 2999]'];
  const kgsMidY = ky + 32;

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={290}
      caption={
        lang === 'ja'
          ? 'KGS が重ならないキー範囲を各サーバーへ配る → 採番が衝突しない'
          : 'A KGS hands each server a non-overlapping key range → no collisions'
      }
    >
      <svg viewBox="0 0 660 290" width="100%" style={{ maxHeight: 290 }}>
        <ArrowDefs />
        {rows.map((ry, i) => (
          <Edge key={i} x1={kx + 172} y1={kgsMidY} x2={sx} y2={ry + 22} />
        ))}
        <NodeBox x={kx} y={ky} w={172} label="Key Gen Service" sub="ranges" icon={icons.gate} tone="amber" active />
        {rows.map((ry, i) => (
          <g key={i}>
            <rect x={sx} y={ry} width={120} height={44} rx={10} fill="var(--surface)" stroke="var(--cyan)" strokeWidth={1.25} strokeOpacity={0.6} />
            <text x={sx + 60} y={ry + 20} textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={600}>
              Server {i + 1}
            </text>
            <text x={sx + 60} y={ry + 36} textAnchor="middle" fill="var(--cyan)" fontSize={10.5} fontFamily="var(--font-mono)">
              {ranges[i]}
            </text>
          </g>
        ))}
        {rows.map((ry, i) => (
          <Packet
            key={i}
            playKey={play * 100 + i}
            color="var(--amber)"
            duration={1.8}
            delay={i * 0.25}
            label={ranges[i]}
            path={[{ x: kx + 172, y: kgsMidY }, { x: sx, y: ry + 22 }]}
          />
        ))}
      </svg>
    </DiagramFrame>
  );
}

// ---- URL: final overall architecture ----
export function UrlArchitecture() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  // columns & node widths
  const GW_W = 150, AP_W = 132, KGS_W = 172;
  const clX = 20, gwX = 180, apX = 350, rightX = 540;
  const rowY = 110; // main row
  const rowMid = rowY + 32;
  const cacheY = 40, dbY = 180, kgsY = 240;
  const apMid = apX + AP_W / 2; // App Server horizontal center
  const kgsX = apMid - KGS_W / 2; // center KGS under App Server

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={320}
      caption={
        lang === 'ja'
          ? '全体像: Gateway → App → キャッシュ優先で読み、ミス時のみ DB。KGS が範囲を配る'
          : 'Full picture: Gateway → App → read from cache first, DB only on miss. KGS hands out ranges'
      }
    >
      <svg viewBox="0 0 720 320" width="100%" style={{ maxHeight: 320 }}>
        <ArrowDefs />
        {/* edges */}
        <Edge x1={clX + 116} y1={rowMid} x2={gwX} y2={rowMid} />
        <Edge x1={gwX + GW_W} y1={rowMid} x2={apX} y2={rowMid} />
        <Edge x1={apX + AP_W} y1={rowMid} x2={rightX} y2={cacheY + 32} />
        <Edge x1={apMid} y1={rowY + 64} x2={rightX} y2={dbY} dashed />
        {/* KGS dashed range distribution */}
        <Edge x1={apMid} y1={rowY + 64} x2={apMid} y2={kgsY} dashed />

        {/* nodes */}
        <NodeBox x={clX} y={rowY} label="Client" icon={icons.client} tone="accent" />
        <NodeBox x={gwX} y={rowY} w={GW_W} label="API Gateway" sub="LB" icon={icons.gate} tone="amber" />
        <NodeBox x={apX} y={rowY} w={AP_W} label="App Server" icon={icons.server} tone="cyan" />
        <NodeBox x={rightX} y={cacheY} label="Cache" sub="Redis" icon={icons.cache} tone="green" active />
        <NodeBox x={rightX} y={dbY} label="Database" sub="key → url" icon={icons.db} tone="purple" />
        <NodeBox x={kgsX} y={kgsY} w={KGS_W} label="Key Gen Service" icon={icons.gate} tone="amber" />

        {/* flowing request: client -> gateway -> app -> cache */}
        <Packet playKey={play * 10 + 1} color="var(--accent)" duration={3.2}
          path={[
            { x: clX + 116, y: rowMid },
            { x: gwX, y: rowMid },
            { x: gwX + GW_W, y: rowMid },
            { x: apX, y: rowMid },
            { x: apX + AP_W, y: rowMid },
            { x: rightX, y: cacheY + 32 },
          ]} />
        <Packet playKey={play * 10 + 2} color="var(--green)" duration={2.4} delay={3.2} label="hit"
          path={[
            { x: rightX, y: cacheY + 32 },
            { x: apX + AP_W, y: rowMid },
            { x: apX, y: rowMid },
            { x: gwX, y: rowMid },
            { x: clX + 116, y: rowMid },
          ]} />
      </svg>
    </DiagramFrame>
  );
}
