import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDefs, DiagramFrame, Edge, NodeBox, Packet, icons } from './primitives';
import { useLang } from '../i18n';

// ---- RL: why you need it (the gate blocks a flood of requests) ----
export function RlWhy() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const gx = 300, sx = 520, y = 90;
  const midY = y + 32;
  const lanes = [40, 90, 140];
  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      caption={lang === 'ja' ? '大量のリクエストを Limiter が選別し、サーバーを守る' : 'The limiter screens a flood of requests and protects the server'}
      height={220}
    >
      <svg viewBox="0 0 660 220" width="100%" style={{ maxHeight: 220 }}>
        <ArrowDefs />
        <Edge x1={gx + 150} y1={midY} x2={sx} y2={midY} />
        <NodeBox x={gx} y={y} w={150} label="Rate Limiter" icon={icons.gate} tone="amber" active />
        <NodeBox x={sx} y={y} label="Server" icon={icons.server} tone="cyan" />
        {lanes.map((ly, idx) => (
          <Packet
            key={idx}
            playKey={play * 100 + idx}
            color={idx === 2 ? 'var(--red)' : 'var(--accent)'}
            duration={1.8}
            delay={idx * 0.25}
            path={
              idx === 2
                ? [{ x: 20, y: ly }, { x: gx, y: midY }]
                : [{ x: 20, y: ly }, { x: gx + 75, y: midY }, { x: sx, y: midY }]
            }
          />
        ))}
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: Token Bucket (tokens refill and get consumed) ----
export function RlTokenBucket() {
  const { lang } = useLang();
  const CAP = 5;
  const [tokens, setTokens] = useState(3);
  const [running, setRunning] = useState(true);
  const [flash, setFlash] = useState<'allow' | 'deny' | null>(null);
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  // Refill: +1 every 1.5s (up to capacity)
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setTokens((v) => Math.min(CAP, v + 1));
    }, 1500);
    return () => clearInterval(t);
  }, [running]);

  const request = () => {
    if (tokensRef.current > 0) {
      setTokens((v) => v - 1);
      setFlash('allow');
    } else {
      setFlash('deny');
    }
    setTimeout(() => setFlash(null), 500);
  };

  const bucketX = 240, bucketY = 40, bucketW = 180, bucketH = 150;
  const slotY = (i: number) => bucketY + bucketH - 26 - i * 26;

  return (
    <DiagramFrame
      caption={lang === 'ja' ? `容量 ${CAP} / 1.5秒ごとに +1 トークン補充` : `Capacity ${CAP} / +1 token every 1.5s`}
      height={240}
      controls={
        <>
          <button className="btn" onClick={request}>
            {lang === 'ja' ? 'リクエスト送信' : 'Send request'}
          </button>
          <button className="btn btn--ghost" onClick={() => setRunning((r) => !r)}>
            {running
              ? lang === 'ja'
                ? '補充を止める'
                : 'Stop refill'
              : lang === 'ja'
                ? '補充を再開'
                : 'Resume refill'}
          </button>
        </>
      }
    >
      <svg viewBox="0 0 660 240" width="100%" style={{ maxHeight: 240 }}>
        <ArrowDefs />
        {/* refill arrow */}
        <text x={330} y={24} textAnchor="middle" fill="var(--green)" fontSize={12} fontWeight={600}>
          {lang === 'ja' ? '↓ 補充 (+1 / 1.5s)' : '↓ refill (+1 / 1.5s)'}
        </text>
        {/* bucket */}
        <rect x={bucketX} y={bucketY} width={bucketW} height={bucketH} rx={12} fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth={1.5} />
        <text x={bucketX + bucketW / 2} y={bucketY - 30} textAnchor="middle" fill="var(--text-muted)" fontSize={13} fontWeight={600}>
          Token Bucket
        </text>
        {/* tokens */}
        <AnimatePresence>
          {Array.from({ length: tokens }).map((_, i) => (
            <motion.circle
              key={i}
              cx={bucketX + bucketW / 2}
              initial={{ cy: bucketY - 10, opacity: 0 }}
              animate={{ cy: slotY(i), opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              r={10}
              fill="var(--green)"
            />
          ))}
        </AnimatePresence>
        <text x={bucketX + bucketW / 2} y={bucketY + bucketH + 22} textAnchor="middle" fill="var(--text-dim)" fontSize={12} fontFamily="var(--font-mono)">
          {tokens} / {CAP} tokens
        </text>

        {/* decision indicator */}
        <AnimatePresence>
          {flash && (
            <motion.g
              key={flash + Math.random()}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              <rect
                x={480}
                y={95}
                width={140}
                height={50}
                rx={10}
                fill={flash === 'allow' ? 'var(--green-soft)' : 'var(--red-soft)'}
                stroke={flash === 'allow' ? 'var(--green)' : 'var(--red)'}
                strokeWidth={1.5}
              />
              <text x={550} y={125} textAnchor="middle" fill={flash === 'allow' ? 'var(--green)' : 'var(--red)'} fontSize={15} fontWeight={700}>
                {flash === 'allow'
                  ? lang === 'ja'
                    ? '許可 (200)'
                    : 'Allow (200)'
                  : lang === 'ja'
                    ? '拒否 (429)'
                    : 'Reject (429)'}
              </text>
            </motion.g>
          )}
        </AnimatePresence>
        <text x={550} y={80} textAnchor="middle" fill="var(--text-dim)" fontSize={11}>
          {lang === 'ja' ? 'リクエスト判定' : 'Decision'}
        </text>
        <NodeBox x={40} y={80} label="Client" icon={icons.client} tone="accent" />
        <Edge x1={156} y1={112} x2={bucketX} y2={112} />
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: allow/reject timeline ----
export function RlAllowDeny() {
  const { lang } = useLang();
  const CAP = 4;
  const seq = [true, true, true, true, false, false, true]; // refill can't keep up, so later ones are rejected
  const [play, setPlay] = useState(0);
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    setVisible(0);
    if (play === 0) return;
    const timers = seq.map((_, i) => setTimeout(() => setVisible(i + 1), i * 500));
    return () => timers.forEach(clearTimeout);
  }, [play]);

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      caption={
        lang === 'ja'
          ? `最初の ${CAP} 件は通り、トークンが尽きると 429 で拒否される`
          : `The first ${CAP} pass; once tokens run out, requests get 429`
      }
      height={180}
    >
      <svg viewBox="0 0 660 180" width="100%" style={{ maxHeight: 180 }}>
        <line x1={40} y1={120} x2={620} y2={120} stroke="var(--border-strong)" strokeWidth={1.5} />
        <text x={40} y={150} fill="var(--text-dim)" fontSize={11}>
          {lang === 'ja' ? '時間 →' : 'time →'}
        </text>
        {seq.map((allow, i) => {
          const x = 70 + i * 78;
          const shown = i < visible;
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, y: -14 }}
              animate={shown ? { opacity: 1, y: 0 } : { opacity: 0.12, y: -14 }}
              transition={{ duration: 0.3 }}
            >
              <circle cx={x} cy={70} r={18} fill={allow ? 'var(--green-soft)' : 'var(--red-soft)'} stroke={allow ? 'var(--green)' : 'var(--red)'} strokeWidth={1.5} />
              <text x={x} y={75} textAnchor="middle" fill={allow ? 'var(--green)' : 'var(--red)'} fontSize={13} fontWeight={700}>
                {allow ? '✓' : '✕'}
              </text>
              <line x1={x} y1={88} x2={x} y2={120} stroke="var(--border)" strokeWidth={1} />
              <circle cx={x} cy={120} r={3} fill={allow ? 'var(--green)' : 'var(--red)'} />
              <text x={x} y={140} textAnchor="middle" fill="var(--text-dim)" fontSize={10}>
                {allow ? '200' : '429'}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: algorithm comparison ----
// Shows HOW each method carves up time. A shared time cursor sweeps left to
// right; each row highlights the span it currently counts over.
export function RlAlgorithms() {
  const { lang } = useLang();

  // Timeline geometry (SVG user units).
  // Labels sit ABOVE each timeline (not to the left), so long EN text never
  // overlaps the track.
  const TL_X = 30; // left edge of the timeline track
  const TL_W = 600; // timeline width
  const TL_RIGHT = TL_X + TL_W;
  const ROW_H = 74; // taller rows to fit the label above the bar
  const ROW_TOP = 40;
  const BAR_H = 24;
  const LABEL_GAP = 26; // vertical gap from label baseline down to the bar

  const WINDOW_W = TL_W / 4; // width of one time window
  const SLIDING_W = WINDOW_W; // sliding window looks back this far

  const [progress, setProgress] = useState(0); // 0..1 cursor position
  const [play, setPlay] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (play === 0) return;
    let start: number | null = null;
    const durMs = 5200;
    const tick = (now: number) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / durMs);
      setProgress(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [play]);

  const cursorX = TL_X + TL_W * progress;

  const rows = [
    {
      name: 'Fixed Window',
      color: 'var(--cyan)',
      desc: { ja: '固定枠ごとにカウントをリセット', en: 'Reset the count each fixed slot' },
    },
    {
      name: 'Sliding Window',
      color: 'var(--purple)',
      desc: { ja: '「直近N秒」の窓が動き続ける', en: 'A "last N seconds" window keeps moving' },
    },
    {
      name: 'Token Bucket',
      color: 'var(--green)',
      desc: { ja: '一定ペースでトークンが流入', en: 'Tokens flow in at a steady pace' },
    },
  ];

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      caption={lang === 'ja' ? '同じ時間軸を、方式ごとにどう区切るか' : 'How each method carves up the same timeline'}
      height={300}
    >
      <svg viewBox="0 0 660 300" width="100%" style={{ maxHeight: 300 }}>
        {rows.map((row, i) => {
          const yTop = ROW_TOP + i * ROW_H;
          const barY = yTop + LABEL_GAP;
          const midY = barY + BAR_H / 2;
          return (
            <g key={row.name}>
              {/* label sits above the timeline: name + description on one line */}
              <text x={TL_X} y={yTop} fill="var(--text)" fontSize={12.5} fontWeight={700}>
                {row.name}
                <tspan fill="var(--text-dim)" fontSize={10} fontWeight={400}>
                  {'  —  '}
                  {lang === 'ja' ? row.desc.ja : row.desc.en}
                </tspan>
              </text>

              {/* timeline track */}
              <rect x={TL_X} y={barY} width={TL_W} height={BAR_H} rx={7} fill="var(--bg-elevated)" stroke="var(--border)" />

              {/* Fixed Window: static slot dividers + highlight the current slot */}
              {i === 0 && (
                <>
                  {[1, 2, 3].map((k) => (
                    <line
                      key={k}
                      x1={TL_X + WINDOW_W * k}
                      y1={barY}
                      x2={TL_X + WINDOW_W * k}
                      y2={barY + BAR_H}
                      stroke="var(--border-strong)"
                      strokeWidth={1.5}
                    />
                  ))}
                  {(() => {
                    const slot = Math.min(3, Math.floor(progress * 4));
                    return (
                      <rect
                        x={TL_X + slot * WINDOW_W}
                        y={barY}
                        width={WINDOW_W}
                        height={BAR_H}
                        rx={7}
                        fill={row.color}
                        opacity={0.28}
                      />
                    );
                  })()}
                </>
              )}

              {/* Sliding Window: a window of fixed width trailing the cursor */}
              {i === 1 && (
                <rect
                  x={Math.max(TL_X, cursorX - SLIDING_W)}
                  y={barY}
                  width={Math.min(SLIDING_W, cursorX - TL_X)}
                  height={BAR_H}
                  rx={7}
                  fill={row.color}
                  opacity={0.3}
                />
              )}

              {/* Token Bucket: tokens flowing in at a steady cadence */}
              {i === 2 &&
                Array.from({ length: 8 }).map((_, k) => {
                  const tokenT = k / 8; // when this token enters
                  const appeared = progress >= tokenT;
                  const tx = TL_X + 26 + k * ((TL_W - 40) / 8);
                  return (
                    <circle
                      key={k}
                      cx={tx}
                      cy={midY}
                      r={6}
                      fill={row.color}
                      opacity={appeared ? 0.9 : 0.12}
                    />
                  );
                })}

              {/* shared moving time cursor */}
              <line x1={cursorX} y1={barY - 6} x2={cursorX} y2={barY + BAR_H + 6} stroke="var(--text)" strokeWidth={1.5} opacity={0.55} />
            </g>
          );
        })}

        {/* time axis */}
        <line x1={TL_X} y1={ROW_TOP + rows.length * ROW_H - 6} x2={TL_RIGHT} y2={ROW_TOP + rows.length * ROW_H - 6} stroke="var(--border)" strokeWidth={1} />
        <text x={TL_X} y={ROW_TOP + rows.length * ROW_H + 12} fill="var(--text-dim)" fontSize={11}>
          {lang === 'ja' ? '時間 →' : 'time →'}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: distributed setup (shared counter) ----
export function RlDistributed() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const [shared, setShared] = useState(true);
  const servers = [50, 110, 170];
  const sx = 250;
  const storeX = 470, storeY = 90;
  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={240}
      caption={
        shared
          ? lang === 'ja'
            ? '共有ストアで全体の上限を守る'
            : 'A shared store enforces one global limit'
          : lang === 'ja'
            ? '各サーバーが個別にカウント → 合計が上限を超える'
            : 'Each server counts alone → the total exceeds the limit'
      }
      controls={
        <div className="toggle">
          <button className={shared ? 'toggle__on' : ''} onClick={() => { setShared(true); setPlay((p) => p + 1); }}>
            {lang === 'ja' ? '共有ストア' : 'Shared store'}
          </button>
          <button className={!shared ? 'toggle__on' : ''} onClick={() => { setShared(false); setPlay((p) => p + 1); }}>
            {lang === 'ja' ? '個別' : 'Per-server'}
          </button>
        </div>
      }
    >
      <svg viewBox="0 0 660 240" width="100%" style={{ maxHeight: 240 }}>
        <ArrowDefs />
        {servers.map((sy, i) => (
          <g key={i}>
            <rect x={sx} y={sy} width={104} height={44} rx={10} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.25} />
            <text x={sx + 52} y={sy + 27} textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={600}>
              Server {i + 1}
            </text>
            {shared ? (
              <Edge x1={sx + 104} y1={sy + 22} x2={storeX} y2={storeY + 40} />
            ) : (
              <text x={sx + 52} y={sy + 42} textAnchor="middle" fill="var(--red)" fontSize={9} fontFamily="var(--font-mono)">
                local count
              </text>
            )}
          </g>
        ))}
        {shared ? (
          <>
            <rect x={storeX} y={storeY} width={140} height={80} rx={12} fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth={1.5} />
            <text x={storeX + 70} y={storeY + 35} textAnchor="middle" fill="var(--amber)" fontSize={13} fontWeight={700}>
              Redis
            </text>
            <text x={storeX + 70} y={storeY + 55} textAnchor="middle" fill="var(--text-muted)" fontSize={11} fontFamily="var(--font-mono)">
              shared count
            </text>
            {servers.map((sy, i) => (
              <Packet key={i} playKey={play * 100 + i} color="var(--amber)" duration={1.5} delay={i * 0.2}
                path={[{ x: sx + 104, y: sy + 22 }, { x: storeX, y: storeY + 40 }]} />
            ))}
          </>
        ) : (
          <g>
            <rect x={storeX} y={storeY + 10} width={150} height={60} rx={10} fill="var(--red-soft)" stroke="var(--red)" strokeWidth={1.25} strokeDasharray="5 5" />
            <text x={storeX + 75} y={storeY + 35} textAnchor="middle" fill="var(--red)" fontSize={12} fontWeight={600}>
              {lang === 'ja' ? '全体で超過!' : 'Over limit!'}
            </text>
            <text x={storeX + 75} y={storeY + 54} textAnchor="middle" fill="var(--text-dim)" fontSize={10}>
              {lang === 'ja' ? '3台 × 上限 = 3倍' : '3 servers × limit = 3x'}
            </text>
          </g>
        )}
        <NodeBox x={40} y={98} label="Clients" icon={icons.client} tone="accent" />
        {servers.map((sy, i) => (
          <Edge key={i} x1={156} y1={120} x2={sx} y2={sy + 22} dimmed />
        ))}
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: where to place the limiter ----
export function RlPlacement() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const cx = 30, gx = 250, sx = 500, y = 90;
  const midY = y + 32;
  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={220}
      caption={
        lang === 'ja'
          ? '上流（ゲートウェイ）で弾くほど、下流のサービスは無駄な処理をせずに済む'
          : 'The earlier (at the gateway) you reject, the less wasted work downstream'
      }
    >
      <svg viewBox="0 0 660 220" width="100%" style={{ maxHeight: 220 }}>
        <ArrowDefs />
        <Edge x1={cx + 116} y1={midY} x2={gx} y2={midY} />
        <Edge x1={gx + 150} y1={midY} x2={sx} y2={midY} />
        <NodeBox x={cx} y={y} label="Client" icon={icons.client} tone="accent" />
        <NodeBox x={gx} y={y} w={150} label="API Gateway" sub="rate limit" icon={icons.gate} tone="amber" active />
        <NodeBox x={sx} y={y} label="Service" icon={icons.server} tone="cyan" />
        {/* allowed request passes through */}
        <Packet playKey={play * 10 + 1} color="var(--accent)" duration={2.2} label="ok"
          path={[{ x: cx + 116, y: midY }, { x: gx, y: midY }, { x: gx + 150, y: midY }, { x: sx, y: midY }]} />
        {/* rejected request stopped at the gateway */}
        <Packet playKey={play * 10 + 2} color="var(--red)" duration={1.4} delay={2.4} label="429"
          path={[{ x: cx + 116, y: midY + 4 }, { x: gx, y: midY + 4 }]} />
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: race condition on a shared counter (naive vs atomic) ----
export function RlRace() {
  const { lang } = useLang();
  const [mode, setMode] = useState<'naive' | 'atomic'>('naive');
  const [play, setPlay] = useState(0);
  const [step, setStep] = useState(0);

  // Drive the sequence: 0(idle) -> 1 -> 2 -> 3(result)
  useEffect(() => {
    setStep(0);
    if (play === 0) return;
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1600),
      setTimeout(() => setStep(3), 2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [play, mode]);

  // Counter value shown at each step
  const counter =
    step === 0
      ? 99
      : mode === 'naive'
        ? step >= 2
          ? 100 // both wrote 100 (one overwrote the other)
          : 99
        : step >= 3
          ? 101
          : step >= 2
            ? 101
            : step >= 1
              ? 100
              : 99;

  const bubble = (server: 'A' | 'B'): string => {
    if (step === 0) return '';
    if (mode === 'naive') {
      if (step === 1) return 'read: 99';
      return 'write: 100';
    }
    // atomic
    if (server === 'A') return step >= 1 ? 'INCR → 100' : '';
    return step >= 2 ? 'INCR → 101' : 'wait…';
  };

  const bad = mode === 'naive' && step >= 3;
  const good = mode === 'atomic' && step >= 3;
  const caption = bad
    ? lang === 'ja'
      ? '取りこぼし! 2回来たのにカウンタは100（本当は101）'
      : 'Lost update! Two requests, but the counter is 100 (should be 101)'
    : good
      ? lang === 'ja'
        ? 'INCR は原子的: 順に処理され 101 で正しい'
        : 'INCR is atomic: processed in order, correctly reaching 101'
      : lang === 'ja'
        ? '同じカウンタに2台が同時アクセス'
        : 'Two servers hit the same counter at once';

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={240}
      caption={caption}
      controls={
        <div className="toggle">
          <button className={mode === 'naive' ? 'toggle__on' : ''} onClick={() => { setMode('naive'); setPlay((p) => p + 1); }}>
            {lang === 'ja' ? '素朴 (read+write)' : 'Naive (read+write)'}
          </button>
          <button className={mode === 'atomic' ? 'toggle__on' : ''} onClick={() => { setMode('atomic'); setPlay((p) => p + 1); }}>
            {lang === 'ja' ? '原子的 (INCR)' : 'Atomic (INCR)'}
          </button>
        </div>
      }
    >
      <svg viewBox="0 0 660 240" width="100%" style={{ maxHeight: 240 }}>
        <ArrowDefs />
        {/* Redis counter */}
        <rect x={250} y={20} width={160} height={64} rx={12} fill="var(--amber-soft)" stroke={bad ? 'var(--red)' : good ? 'var(--green)' : 'var(--amber)'} strokeWidth={2} />
        <text x={330} y={44} textAnchor="middle" fill="var(--text-muted)" fontSize={12} fontFamily="var(--font-mono)">
          Redis counter
        </text>
        <text x={330} y={72} textAnchor="middle" fill={bad ? 'var(--red)' : good ? 'var(--green)' : 'var(--amber)'} fontSize={24} fontWeight={700} fontFamily="var(--font-mono)">
          {counter}
        </text>

        {/* edges from servers to counter */}
        <Edge x1={110} y1={170} x2={270} y2={84} />
        <Edge x1={550} y1={170} x2={390} y2={84} />

        {/* servers */}
        <NodeBox x={40} y={170} label="Server A" icon={icons.server} tone="cyan" />
        <NodeBox x={484} y={170} label="Server B" icon={icons.server} tone="purple" />

        {/* action bubbles */}
        {bubble('A') && (
          <text x={98} y={158} textAnchor="middle" fill="var(--cyan)" fontSize={12} fontWeight={600} fontFamily="var(--font-mono)">
            {bubble('A')}
          </text>
        )}
        {bubble('B') && (
          <text x={542} y={158} textAnchor="middle" fill="var(--purple)" fontSize={12} fontWeight={600} fontFamily="var(--font-mono)">
            {bubble('B')}
          </text>
        )}
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: final overall architecture ----
export function RlArchitecture() {
  const { lang } = useLang();
  const [play, setPlay] = useState(1);
  const clX = 20, gwX = 210, svX = 540;
  const rowY = 120;
  const rowMid = rowY + 32;
  const redisX = 360, redisY = 30;

  return (
    <DiagramFrame
      onReplay={() => setPlay((p) => p + 1)}
      height={300}
      caption={
        lang === 'ja'
          ? '全体像: Gateway が共有カウンタ(Redis)で判定し、許可は Service へ・超過は 429'
          : 'Full picture: the gateway checks a shared counter (Redis); allowed → Service, over limit → 429'
      }
    >
      <svg viewBox="0 0 700 300" width="100%" style={{ maxHeight: 300 }}>
        <ArrowDefs />
        {/* edges */}
        <Edge x1={clX + 116} y1={rowMid} x2={gwX} y2={rowMid} />
        <Edge x1={gwX + 150} y1={rowMid} x2={svX} y2={rowMid} />
        {/* gateway <-> redis (atomic counter check) */}
        <Edge x1={gwX + 75} y1={rowY} x2={redisX + 70} y2={redisY + 64} dashed />

        {/* nodes */}
        <NodeBox x={clX} y={rowY} label="Clients" icon={icons.client} tone="accent" />
        <NodeBox x={gwX} y={rowY} w={150} label="API Gateway" sub="rate limiter" icon={icons.gate} tone="amber" active />
        <NodeBox x={svX} y={rowY} label="Service" icon={icons.server} tone="cyan" />
        {/* redis shared counter */}
        <g>
          <rect x={redisX} y={redisY} width={140} height={64} rx={12} fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth={1.5} />
          <text x={redisX + 70} y={redisY + 28} textAnchor="middle" fill="var(--amber)" fontSize={13} fontWeight={700}>
            Redis
          </text>
          <text x={redisX + 70} y={redisY + 46} textAnchor="middle" fill="var(--text-muted)" fontSize={10.5} fontFamily="var(--font-mono)">
            shared counter
          </text>
        </g>

        {/* allowed request flows through to the service */}
        <Packet playKey={play * 10 + 1} color="var(--green)" duration={2.6} label="allow"
          path={[
            { x: clX + 116, y: rowMid },
            { x: gwX, y: rowMid },
            { x: gwX + 150, y: rowMid },
            { x: svX, y: rowMid },
          ]} />
        {/* rejected request bounced at the gateway */}
        <Packet playKey={play * 10 + 2} color="var(--red)" duration={1.4} delay={2.8} label="429"
          path={[{ x: clX + 116, y: rowMid + 6 }, { x: gwX, y: rowMid + 6 }]} />
      </svg>
    </DiagramFrame>
  );
}

// ---- RL: capacity estimation ----
export function RlCapacity() {
  const { lang } = useLang();
  const barX = 250;
  const barMax = 380;
  // Peak decision QPS equals total traffic; a single Redis handles ~100k ops/s.
  return (
    <DiagramFrame
      caption={lang === 'ja' ? '判定は全リクエストに走る。単一 Redis の余力に十分収まる' : 'A check runs on every request — well within a single Redis'}
      height={230}
    >
      <svg viewBox="0 0 660 230" width="100%" style={{ maxHeight: 230 }}>
        {/* Decision QPS bar */}
        <text x={20} y={54} fill="var(--text)" fontSize={13} fontWeight={600}>
          {lang === 'ja' ? '判定 QPS' : 'Decision QPS'}
        </text>
        <text x={20} y={70} fill="var(--text-dim)" fontSize={11} fontFamily="var(--font-mono)">
          ~10k/s (= all traffic)
        </text>
        <rect x={barX} y={40} width={barMax} height={26} rx={7} fill="var(--bg-elevated)" stroke="var(--border)" />
        <motion.rect
          x={barX}
          y={40}
          height={26}
          rx={7}
          fill="var(--amber)"
          initial={{ width: 0 }}
          whileInView={{ width: barMax * 0.1 }}
          viewport={{ once: false }}
          transition={{ duration: 0.9 }}
        />

        {/* Redis capacity bar */}
        <text x={20} y={124} fill="var(--text)" fontSize={13} fontWeight={600}>
          {lang === 'ja' ? 'Redis 処理能力' : 'Redis capacity'}
        </text>
        <text x={20} y={140} fill="var(--text-dim)" fontSize={11} fontFamily="var(--font-mono)">
          ~100k ops/s
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

        {/* Memory callout */}
        <g>
          <rect x={barX} y={168} width={barMax} height={44} rx={10} fill="var(--purple)" opacity={0.12} stroke="var(--purple)" strokeWidth={1} />
          <text x={barX + 16} y={188} fill="var(--purple)" fontSize={12} fontWeight={700}>
            {lang === 'ja' ? 'メモリ' : 'Memory'}
          </text>
          <text x={barX + 16} y={204} fill="var(--text-muted)" fontSize={11} fontFamily="var(--font-mono)">
            1M keys × ~100B ≈ 100 MB
          </text>
        </g>
        <text x={20} y={192} fill="var(--text-dim)" fontSize={11}>
          {lang === 'ja' ? '状態量' : 'State'}
        </text>
      </svg>
    </DiagramFrame>
  );
}
