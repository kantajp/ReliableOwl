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
            <Edge x1={ax + 116} y1={midY} x2={dx} y2={dbY + 32 - 32} />
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
