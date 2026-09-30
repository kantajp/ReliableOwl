import { motion } from 'framer-motion';
import { DiagramFrame } from './primitives';
import { useLang } from '../i18n';

const MONO = 'var(--font-mono)';

// ---- Fundamentals: latency ladder (log scale) ----
// Places representative operations on a log time axis so the orders of
// magnitude (ns -> us -> ms) are visible at a glance. Rounded "latency numbers".
export function FundLatency() {
  const { lang } = useLang();
  // value in nanoseconds, label, color
  const items = [
    { ns: 1, label: { ja: 'L1キャッシュ参照', en: 'L1 cache reference' }, tone: 'var(--green)', t: '~1 ns' },
    { ns: 100, label: { ja: 'メインメモリ参照 (RAM)', en: 'Main memory (RAM)' }, tone: 'var(--cyan)', t: '~100 ns' },
    { ns: 100_000, label: { ja: 'SSD ランダム読み取り', en: 'SSD random read' }, tone: 'var(--accent)', t: '~100 μs' },
    { ns: 500_000, label: { ja: '同一DC内ネットワーク往復', en: 'Round trip in a datacenter' }, tone: 'var(--amber)', t: '~0.5 ms' },
    { ns: 10_000_000, label: { ja: 'HDD シーク', en: 'HDD disk seek' }, tone: 'var(--purple)', t: '~10 ms' },
    { ns: 150_000_000, label: { ja: '大陸間ネットワーク往復', en: 'Cross-continent round trip' }, tone: 'var(--red)', t: '~150 ms' },
  ];
  const AX0 = 40, AX1 = 470; // x pixel range for the log axis
  const LOG_MIN = 0, LOG_MAX = 8.5; // log10(ns): 1ns=0 .. ~316ms
  const x = (ns: number) => AX0 + ((Math.log10(ns) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (AX1 - AX0);
  const ticks = [
    { ns: 1, label: '1ns' },
    { ns: 1_000, label: '1μs' },
    { ns: 1_000_000, label: '1ms' },
    { ns: 1_000_000_000, label: '1s' },
  ];

  return (
    <DiagramFrame
      height={300}
      caption={lang === 'ja' ? '対数スケール: 右へ1目盛りで1000倍。桁の感覚をつかむ' : 'Log scale: one step right = 1000×. Build intuition for orders of magnitude'}
    >
      <svg viewBox="0 0 660 300" width="100%" style={{ maxHeight: 300 }}>
        {/* axis */}
        <line x1={AX0} y1={250} x2={AX1 + 20} y2={250} stroke="var(--border-strong)" strokeWidth={1.5} />
        {ticks.map((tk) => (
          <g key={tk.label}>
            <line x1={x(tk.ns)} y1={70} x2={x(tk.ns)} y2={256} stroke="var(--border)" strokeDasharray="2 4" />
            <text x={x(tk.ns)} y={272} textAnchor="middle" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>
              {tk.label}
            </text>
          </g>
        ))}
        {/* points */}
        {items.map((it, i) => {
          const px = x(it.ns);
          const py = 210 - i * 30;
          return (
            <g key={i}>
              <line x1={px} y1={py} x2={px} y2={250} stroke={it.tone} strokeWidth={1} opacity={0.4} />
              <motion.circle
                cx={px} cy={py} r={6} fill={it.tone}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              />
              <text x={px + 12} y={py - 2} fill="var(--text)" fontSize={12} fontWeight={600}>
                {lang === 'ja' ? it.label.ja : it.label.en}
              </text>
              <text x={px + 12} y={py + 12} fill="var(--text-dim)" fontSize={10.5} fontFamily={MONO}>
                {it.t}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

// ---- Fundamentals: memory scale (1000x steps) ----
export function FundMemory() {
  const { lang } = useLang();
  const units = [
    { u: 'B', ex: { ja: '1文字 ≈ 1B', en: '1 char ≈ 1B' }, tone: 'var(--green)' },
    { u: 'KB', ex: { ja: '短いテキスト', en: 'a short text' }, tone: 'var(--cyan)' },
    { u: 'MB', ex: { ja: '写真・小さな動画', en: 'a photo / short clip' }, tone: 'var(--accent)' },
    { u: 'GB', ex: { ja: '映画1本', en: 'a movie' }, tone: 'var(--amber)' },
    { u: 'TB', ex: { ja: '大規模DB', en: 'a large database' }, tone: 'var(--purple)' },
  ];
  return (
    <DiagramFrame
      height={230}
      caption={lang === 'ja' ? '1段上がるごとに約1000倍 (B → KB → MB → GB → TB)' : 'Each step is ~1000× (B → KB → MB → GB → TB)'}
    >
      <svg viewBox="0 0 660 230" width="100%" style={{ maxHeight: 230 }}>
        {units.map((it, i) => {
          const y = 30 + i * 38;
          const w = 60 + i * 110; // visually grows per step
          return (
            <g key={it.u}>
              <text x={20} y={y + 21} fill="var(--text)" fontSize={14} fontWeight={700} fontFamily={MONO}>
                {it.u}
              </text>
              <motion.rect
                x={70} y={y}
                height={28} rx={7} fill={it.tone} fillOpacity={0.85}
                initial={{ width: 0 }}
                whileInView={{ width: w }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: i * 0.12 }}
              />
              <text x={70 + w + 12} y={y + 20} fill="var(--text-dim)" fontSize={11.5}>
                {lang === 'ja' ? it.ex.ja : it.ex.en}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
