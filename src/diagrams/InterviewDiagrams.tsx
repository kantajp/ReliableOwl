import { motion } from 'framer-motion';
import { DiagramFrame } from './primitives';
import { useLang } from '../i18n';

const MONO = 'var(--font-mono)';

// ---- Interview: 45-minute time allocation across the 5 steps ----
export function IvTimeline() {
  const { lang } = useLang();
  const steps = [
    { min: 5, tone: 'var(--accent)', ja: '要件確認', en: 'Clarify' },
    { min: 5, tone: 'var(--amber)', ja: '見積もり', en: 'Estimate' },
    { min: 5, tone: 'var(--cyan)', ja: 'API/データ', en: 'API / Data' },
    { min: 15, tone: 'var(--green)', ja: '高レベル設計', en: 'High-level design' },
    { min: 15, tone: 'var(--purple)', ja: '深掘り', en: 'Deep dive' },
  ];
  const total = steps.reduce((s, x) => s + x.min, 0); // 45
  const AX0 = 30, AX1 = 630;
  const scale = (AX1 - AX0) / total;
  let acc = 0;
  const segs = steps.map((s) => {
    const x = AX0 + acc * scale;
    const w = s.min * scale;
    acc += s.min;
    return { ...s, x, w };
  });

  return (
    <DiagramFrame
      height={190}
      caption={lang === 'ja' ? '45分の時間配分の目安。設計と深掘りに時間を厚く' : 'A rough 45-minute budget — weight design and deep dive'}
    >
      <svg viewBox="0 0 660 190" width="100%" style={{ maxHeight: 190 }}>
        {/* the bar */}
        {segs.map((s, i) => (
          <g key={i}>
            <motion.rect
              x={s.x}
              y={54}
              height={40}
              rx={i === 0 ? 8 : 0}
              fill={s.tone}
              fillOpacity={0.85}
              initial={{ width: 0 }}
              whileInView={{ width: s.w - 2 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: i * 0.25 }}
            />
            <text x={s.x + s.w / 2} y={79} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={700} fontFamily={MONO}>
              {s.min}m
            </text>
            {/* label below, angled to fit */}
            <text x={s.x + s.w / 2} y={116} textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={600}>
              {lang === 'ja' ? s.ja : s.en}
            </text>
          </g>
        ))}
        {/* axis ends */}
        <text x={AX0} y={44} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>0m</text>
        <text x={AX1} y={44} textAnchor="end" fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>~45m</text>
        {/* note line */}
        <text x={330} y={158} textAnchor="middle" fill="var(--text-dim)" fontSize={11}>
          {lang === 'ja' ? '※ 課題や面接官により前後します' : '※ Varies with the problem and interviewer'}
        </text>
      </svg>
    </DiagramFrame>
  );
}
