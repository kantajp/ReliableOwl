// LLM basics diagrams.
//  - LlmNextToken:     the autoregressive loop. The model outputs a probability
//                      for each candidate token, one is picked and appended to
//                      the input, and the model predicts again.
//  - LlmTokens:        the same sentence in Japanese and English split into
//                      tokens, with character and token counts.
//  - LlmTemperature:   a temperature slider reshapes the next-token
//                      distribution; a top-p toggle cuts the low-probability tail.
//  - LlmContextWindow: a conversation fills a fixed window; every request sends
//                      the whole window and old turns are pushed out.
//  - LlmAttention:     which earlier tokens the last token attends to, for two
//                      sentences that differ in one word.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useState } from 'react';
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

// Advance a counter every `ms` while motion is allowed; `resetKey` restarts it.
function useTicker(total: number, ms: number, reduced: boolean, resetKey: unknown = 0) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(0);
    if (reduced) return;
    const id = setInterval(() => setTick((v) => (v + 1) % total), ms);
    return () => clearInterval(id);
  }, [total, ms, reduced, resetKey]);
  return tick;
}

const MONO = 'var(--font-mono)';

// Rough rendered width of a string at the given font size (CJK ≈ 1em, other ≈ 0.55em).
function textWidth(s: string, size: number) {
  let w = 0;
  for (const c of s) w += c.charCodeAt(0) > 0x2000 ? size : size * 0.56;
  return w;
}

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button className={active ? 'btn' : 'btn btn--ghost'} aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
}

// Show a token's leading space as a visible middle dot.
const showSpace = (s: string) => s.replace(/^ /, '·');

// A row of token chips starting at x. Returns the chips and the end x.
function chipRow(
  tokens: string[],
  x0: number,
  y: number,
  opts: { size?: number; gap?: number; tone?: (i: number) => { stroke: string; fill: string; text: string } } = {},
) {
  const size = opts.size ?? 14;
  const gap = opts.gap ?? 6;
  let x = x0;
  const out = tokens.map((t, i) => {
    const label = showSpace(t);
    const w = textWidth(label, size) + 16;
    const tone = opts.tone?.(i) ?? { stroke: 'var(--border-strong)', fill: 'var(--surface)', text: 'var(--text)' };
    const el = (
      <g key={i}>
        <rect x={x} y={y} width={w} height={size + 16} rx={6} fill={tone.fill} stroke={tone.stroke} strokeWidth={1.25} />
        <text x={x + w / 2} y={y + size + 3} textAnchor="middle" fill={tone.text} fontSize={size}>
          {label}
        </text>
      </g>
    );
    x += w + gap;
    return el;
  });
  return { chips: out, end: x - gap };
}

// ============================================================================
// 1) LlmNextToken
// ============================================================================
interface Step {
  cands: { t: string; p: number }[];
}

const NT_JA = {
  prompt: ['日本', 'の', '首都', 'は'],
  steps: [
    { cands: [{ t: '東京', p: 0.92 }, { t: '京都', p: 0.04 }, { t: 'どこ', p: 0.02 }, { t: '大阪', p: 0.01 }] },
    { cands: [{ t: 'です', p: 0.71 }, { t: '。', p: 0.18 }, { t: 'で', p: 0.06 }, { t: '都', p: 0.03 }] },
    { cands: [{ t: '。', p: 0.94 }, { t: 'よ', p: 0.03 }, { t: 'ね', p: 0.02 }, { t: '！', p: 0.01 }] },
    { cands: [{ t: '<終了>', p: 0.88 }, { t: '人口', p: 0.05 }, { t: '東京', p: 0.03 }, { t: 'また', p: 0.02 }] },
  ] as Step[],
};
const NT_EN = {
  prompt: ['The', ' capital', ' of', ' Japan', ' is'],
  steps: [
    { cands: [{ t: ' Tokyo', p: 0.93 }, { t: ' Kyoto', p: 0.03 }, { t: ' a', p: 0.02 }, { t: ' located', p: 0.01 }] },
    { cands: [{ t: '.', p: 0.85 }, { t: ',', p: 0.08 }, { t: ' and', p: 0.04 }, { t: ' City', p: 0.02 }] },
    { cands: [{ t: '<end>', p: 0.86 }, { t: ' It', p: 0.07 }, { t: ' Tokyo', p: 0.03 }, { t: ' The', p: 0.02 }] },
  ] as Step[],
};

const NT_PHASES = 3; // bars appear → pick highlighted → appended

export function LlmNextToken() {
  const { lang } = useLang();
  const tr = useTr();
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(0);
  const data = lang === 'ja' ? NT_JA : NT_EN;
  const total = data.steps.length * NT_PHASES + 2;
  const tick = useTicker(total, 900, reduced, `${lang}-${play}`);

  // Reduced motion: the first step with its pick highlighted.
  const t = reduced ? 1 : Math.min(tick, data.steps.length * NT_PHASES - 1);
  const stepIdx = Math.floor(t / NT_PHASES);
  const phase = t % NT_PHASES;
  const step = data.steps[stepIdx];
  const isEnd = stepIdx === data.steps.length - 1;

  // Tokens generated so far (the current pick is appended in phase 2).
  const generated = data.steps.slice(0, stepIdx + (phase === 2 && !isEnd ? 1 : 0)).map((s) => s.cands[0].t);
  const context = [...data.prompt, ...generated];
  const { chips, end } = chipRow(context, 30, 52, {
    tone: (i) =>
      i < data.prompt.length
        ? { stroke: 'var(--border-strong)', fill: 'var(--surface)', text: 'var(--text)' }
        : i === context.length - 1 && phase === 2
          ? { stroke: 'var(--accent)', fill: 'var(--accent-soft)', text: 'var(--text)' }
          : { stroke: 'var(--accent)', fill: 'var(--surface)', text: 'var(--text)' },
  });

  const BAR_X = 430;
  const BAR_MAX = 330;
  const ROW_Y0 = 132;
  const ROW_H = 34;

  const status =
    phase === 0
      ? tr(`ステップ ${stepIdx + 1}: 入力全体から、次のトークンの確率を出す`, `Step ${stepIdx + 1}: from the whole input, output a probability for each next token`)
      : phase === 1
        ? isEnd
          ? tr('終了トークンが選ばれたら、生成をやめる', 'Once the end token is picked, generation stops')
          : tr(`「${step.cands[0].t.trim()}」を選ぶ`, `Pick "${step.cands[0].t.trim()}"`)
        : isEnd
          ? tr('終了トークンが選ばれたら、生成をやめる', 'Once the end token is picked, generation stops')
          : tr('選んだトークンを入力の最後に足して、もう一度予測する', 'Append the picked token to the input and predict again');

  return (
    <DiagramFrame
      height={310}
      onReplay={() => setPlay((p) => p + 1)}
      caption={tr(
        'LLM が 1 回で出すのは「次の 1 トークンの確率」だけ。それを選んで足す、を繰り返して文章になる',
        'One pass of an LLM yields only the probabilities of the next token. Pick one, append it, repeat: that is how text comes out',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 860 330"
        width="100%"
        role="img"
        aria-label={tr(
          'LLM が次のトークンの確率を出し、1 つ選んで入力に足し、また予測する流れ',
          'An LLM outputs next-token probabilities, one token is picked and appended to the input, and it predicts again',
        )}
      >
        <defs>
          <marker id="llmnt-arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-dim)" />
          </marker>
        </defs>

        <text x={30} y={38} fill="var(--text-dim)" fontSize={11.5}>
          {tr('入力（プロンプト + ここまでに生成したトークン）', 'Input (prompt + tokens generated so far)')}
        </text>
        {chips}
        {!isEnd || phase === 0 ? (
          <rect x={end + 6} y={52} width={34} height={30} rx={6} fill="none" stroke="var(--border-strong)" strokeDasharray="4 4" />
        ) : null}

        {/* model */}
        <rect x={30} y={150} width={200} height={70} rx={12} fill="var(--surface)" stroke={phase === 0 ? 'var(--accent)' : 'var(--border-strong)'} strokeWidth={1.5} style={{ transition: 'stroke 300ms' }} />
        <text x={130} y={180} textAnchor="middle" fill="var(--text)" fontSize={15} fontWeight={700}>LLM</text>
        <text x={130} y={200} textAnchor="middle" fill="var(--text-dim)" fontSize={11}>
          {tr('次のトークンを予測', 'predicts the next token')}
        </text>
        <line x1={130} y1={86} x2={130} y2={148} stroke="var(--text-dim)" strokeWidth={1.5} markerEnd="url(#llmnt-arrow)" opacity={0.7} />
        <line x1={232} y1={185} x2={300} y2={185} stroke="var(--text-dim)" strokeWidth={1.5} markerEnd="url(#llmnt-arrow)" opacity={0.7} />

        {/* candidates */}
        <text x={310} y={ROW_Y0 - 12} fill="var(--text-dim)" fontSize={11.5}>
          {tr('次のトークンの候補と確率', 'Next-token candidates and probabilities')}
        </text>
        {step.cands.map((c, i) => {
          const y = ROW_Y0 + i * ROW_H;
          const picked = i === 0 && phase >= 1;
          return (
            <g key={`${stepIdx}-${i}`}>
              <text x={420} y={y + 17} textAnchor="end" fill={picked ? 'var(--accent)' : 'var(--text)'} fontSize={13.5} fontWeight={picked ? 700 : 400}>
                {showSpace(c.t)}
              </text>
              <rect x={BAR_X} y={y + 4} width={BAR_MAX} height={18} rx={4} fill="var(--surface-hover)" opacity={0.6} />
              <rect
                x={BAR_X}
                y={y + 4}
                width={Math.max(2, c.p * BAR_MAX)}
                height={18}
                rx={4}
                fill={picked ? 'var(--accent)' : 'var(--text-dim)'}
                opacity={picked ? 0.9 : 0.5}
                style={{ transition: 'fill 300ms, opacity 300ms' }}
              />
              <text x={BAR_X + BAR_MAX + 12} y={y + 18} fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                {`${Math.round(c.p * 100)}%`}
              </text>
            </g>
          );
        })}

        <text x={30} y={312} fill="var(--text)" fontSize={12.5}>
          {status}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) LlmTokens
// ============================================================================
const TOK_JA = ['K', 'ubern', 'etes', 'は', 'オープン', 'ソース', 'の', 'コン', 'テナ', '管理', 'システム', 'です', '。'];
const TOK_EN = ['K', 'ubern', 'etes', ' is', ' an', ' open', '-source', ' container', ' management', ' system', '.'];

export function LlmTokens() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const longest = Math.max(TOK_JA.length, TOK_EN.length);
  const tick = useTicker(longest + 4, 450, reduced);
  const shown = reduced ? longest : Math.min(tick + 1, longest);

  const tone = (i: number) =>
    i % 2 === 0
      ? { stroke: 'var(--accent)', fill: 'var(--accent-soft)', text: 'var(--text)' }
      : { stroke: 'var(--purple)', fill: 'var(--surface)', text: 'var(--text)' };

  const rows = [
    { label: tr('英語', 'English'), tokens: TOK_EN, y: 52 },
    { label: tr('日本語', 'Japanese'), tokens: TOK_JA, y: 152 },
  ];

  return (
    <DiagramFrame
      height={260}
      caption={tr(
        '区切り方はモデル（トークナイザ）ごとに違う。これは一例。よく出る文字列ほど 1 トークンにまとまりやすい',
        'Every model (tokenizer) splits differently; this is one example. Common strings tend to become a single token',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 860 270"
        width="100%"
        role="img"
        aria-label={tr(
          '同じ意味の英語と日本語の文をトークンに区切った例。日本語の方がトークン数が多い',
          'The same sentence in English and Japanese split into tokens; the Japanese one uses more tokens',
        )}
      >
        {rows.map((r) => {
          const chars = r.tokens.join('').length;
          const { chips } = chipRow(r.tokens.slice(0, shown), 30, r.y + 12, { size: 14, gap: 4, tone });
          return (
            <g key={r.label}>
              <text x={30} y={r.y} fill="var(--text-dim)" fontSize={11.5}>
                {r.label}
              </text>
              <text x={830} y={r.y} textAnchor="end" fontSize={12} fontFamily={MONO}>
                <tspan fill="var(--text-dim)">{tr('文字 ', 'chars ')}</tspan>
                <tspan fill="var(--text)">{chars}</tspan>
                <tspan fill="var(--text-dim)">{tr('  トークン ', '  tokens ')}</tspan>
                <tspan fill="var(--accent)" fontWeight={700}>{Math.min(shown, r.tokens.length)}</tspan>
              </text>
              {chips}
            </g>
          );
        })}
        <text x={30} y={252} fill="var(--text-muted)" fontSize={12}>
          {tr(
            '「·」は単語の前のスペース。スペースもトークンの一部になる',
            '"·" marks a leading space; spaces are part of the token',
          )}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 3) LlmTemperature
// ============================================================================
const TEMP_LOGITS = [3.0, 2.2, 1.8, 0.6, 0.2, -1.5];
const TEMP_JA = ['晴れ', '曇り', '雨', '雪', '最高', 'バナナ'];
const TEMP_EN = [' sunny', ' cloudy', ' rainy', ' snowy', ' great', ' banana'];
const TOP_P = 0.9;

function softmax(logits: number[], temp: number) {
  if (temp <= 0) {
    const max = Math.max(...logits);
    return logits.map((l) => (l === max ? 1 : 0));
  }
  const scaled = logits.map((l) => l / temp);
  const m = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - m));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function LlmTemperature() {
  const { lang } = useLang();
  const tr = useTr();
  const [temp, setTemp] = useState(1);
  const [topP, setTopP] = useState(false);
  const labels = lang === 'ja' ? TEMP_JA : TEMP_EN;
  const probs = softmax(TEMP_LOGITS, temp);

  // Candidates are already sorted by probability; keep the smallest prefix
  // whose cumulative probability reaches TOP_P.
  let cum = 0;
  const kept = probs.map((p) => {
    const keep = cum < TOP_P;
    cum += p;
    return keep;
  });
  const keptSum = probs.reduce((a, p, i) => a + (kept[i] ? p : 0), 0);
  const finalP = probs.map((p, i) => (topP ? (kept[i] ? p / keptSum : 0) : p));

  const BAR_X = 150;
  const BAR_MAX = 560;
  const ROW_Y0 = 64;
  const ROW_H = 36;

  const note =
    temp === 0
      ? tr('temperature 0: いつも一番確率の高いトークンを選ぶ（ほぼ毎回同じ答え）', 'temperature 0: always pick the most likely token (nearly the same answer every time)')
      : temp < 0.7
        ? tr('低い: 分布が尖る。答えが安定し、無難になる', 'Low: a sharper distribution. Answers are stable and safe')
        : temp <= 1.2
          ? tr('1 前後: モデルが学んだ分布のまま選ぶ', 'Around 1: sample from the distribution as the model learned it')
          : tr('高い: 分布が平らになる。多様になるが、変な候補も選ばれやすい', 'High: a flatter distribution. More variety, but odd tokens get picked too');

  return (
    <DiagramFrame
      height={330}
      controls={
        <>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            temperature
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              aria-label="temperature"
              aria-valuetext={temp.toFixed(1)}
              style={{ width: 160, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontFamily: MONO, color: 'var(--text)', minWidth: 28 }}>{temp.toFixed(1)}</span>
          </label>
          <ToggleButton active={topP} onClick={() => setTopP((v) => !v)} label={`top-p ${TOP_P}`} />
        </>
      }
      caption={tr(
        'モデルが出すのはスコア（ロジット）。temperature で割ってから確率にするので、分布の形が変わる',
        'The model outputs scores (logits). Dividing them by the temperature before turning them into probabilities reshapes the distribution',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 860 320"
        width="100%"
        role="img"
        aria-label={tr(
          `「今日の天気は」の次のトークンの確率。temperature ${temp.toFixed(1)}`,
          `Next-token probabilities after "Today's weather is", temperature ${temp.toFixed(1)}`,
        )}
      >
        <text x={30} y={36} fontSize={13}>
          <tspan fill="var(--text-dim)">{tr('入力: ', 'Input: ')}</tspan>
          <tspan fill="var(--text)" fontWeight={600}>{tr('今日の天気は', "Today's weather is")}</tspan>
          <tspan fill="var(--text-dim)">{tr('  → 次のトークンは？', '  → next token?')}</tspan>
        </text>

        {labels.map((l, i) => {
          const y = ROW_Y0 + i * ROW_H;
          const cut = topP && !kept[i];
          const p = finalP[i];
          return (
            <g key={i} opacity={cut ? 0.4 : 1} style={{ transition: 'opacity 300ms' }}>
              <text x={BAR_X - 12} y={y + 18} textAnchor="end" fill="var(--text)" fontSize={13.5}>
                {showSpace(l)}
              </text>
              <rect x={BAR_X} y={y + 5} width={BAR_MAX} height={18} rx={4} fill="var(--surface-hover)" opacity={0.6} />
              <rect
                x={BAR_X}
                y={y + 5}
                width={Math.max(p > 0 ? 2 : 0, p * BAR_MAX)}
                height={18}
                rx={4}
                fill={i === 0 ? 'var(--accent)' : 'var(--text-dim)'}
                opacity={i === 0 ? 0.9 : 0.55}
                style={{ transition: 'width 250ms' }}
              />
              <text x={BAR_X + BAR_MAX + 12} y={y + 19} fill="var(--text-muted)" fontSize={12} fontFamily={MONO}>
                {cut ? tr('除外', 'cut') : `${(p * 100).toFixed(p < 0.1 ? 1 : 0)}%`}
              </text>
            </g>
          );
        })}

        <text x={30} y={300} fill="var(--text)" fontSize={12.5}>
          {topP
            ? tr(
              `top-p ${TOP_P}: 確率の高い順に足して ${TOP_P * 100}% に届くまでの候補だけを残し、その中から選ぶ`,
              `top-p ${TOP_P}: keep the most likely candidates until they add up to ${TOP_P * 100}%, then pick among those`,
            )
            : note}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 4) LlmContextWindow
// ============================================================================
type Role = 'system' | 'user' | 'ai';
interface Msg { id: string; role: Role; n: number; u: number }

const CW_MSGS: Msg[] = [
  { id: 's', role: 'system', n: 0, u: 2 },
  { id: 'u1', role: 'user', n: 1, u: 2 },
  { id: 'a1', role: 'ai', n: 1, u: 3 },
  { id: 'u2', role: 'user', n: 2, u: 1 },
  { id: 'a2', role: 'ai', n: 2, u: 3 },
  { id: 'u3', role: 'user', n: 3, u: 2 },
  { id: 'a3', role: 'ai', n: 3, u: 2 },
  { id: 'u4', role: 'user', n: 4, u: 2 },
];
const CW_CAP = 16; // whole window, in units
const CW_RESERVE = 3; // reserved for the reply
const CW_INPUT = CW_CAP - CW_RESERVE;

// Window contents after the first k messages arrive, plus what was dropped at step k.
function windowAt(k: number) {
  let msgs = CW_MSGS.slice(0, k);
  const dropped: Msg[] = [];
  const size = (m: Msg[]) => m.reduce((a, x) => a + x.u, 0);
  while (size(msgs) > CW_INPUT) {
    const i = msgs.findIndex((m) => m.role !== 'system');
    dropped.push(msgs[i]);
    msgs = [...msgs.slice(0, i), ...msgs.slice(i + 1)];
  }
  return { msgs, dropped, used: size(msgs) };
}

export function LlmContextWindow() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const tick = useTicker(CW_MSGS.length + 2, 1500, reduced);
  // Reduced motion: the step where the first turn is pushed out.
  const k = reduced ? 7 : Math.min(tick + 1, CW_MSGS.length);
  const { msgs, dropped, used } = windowAt(k);
  // A request is sent each time a user message arrives.
  const requestNo = CW_MSGS.slice(0, k).filter((m) => m.role === 'user').length;

  const X0 = 30;
  const W = 800;
  const unit = W / CW_CAP;
  const Y = 96;
  const H = 64;

  const tone: Record<Role, { stroke: string; fill: string }> = {
    system: { stroke: 'var(--purple)', fill: 'var(--surface)' },
    user: { stroke: 'var(--accent)', fill: 'var(--accent-soft)' },
    ai: { stroke: 'var(--green)', fill: 'var(--green-soft)' },
  };
  const name = (m: Msg) =>
    m.role === 'system' ? tr('システム', 'System') : m.role === 'user' ? tr(`ユーザー ${m.n}`, `User ${m.n}`) : `AI ${m.n}`;

  let x = X0;
  const last = msgs[msgs.length - 1];

  return (
    <DiagramFrame
      height={290}
      caption={tr(
        'モデルは会話を覚えていない。毎回、枠に入る分の履歴を全部送り直している',
        'The model remembers nothing between calls. Every request resends as much history as fits in the window',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 860 300"
        width="100%"
        role="img"
        aria-label={tr(
          '会話が積み上がってコンテキストウィンドウが埋まり、古い発言から押し出される様子',
          'A conversation fills the context window and the oldest turns are pushed out',
        )}
      >
        <text x={X0} y={38} fontSize={12.5} fontFamily={MONO}>
          <tspan fill="var(--text-dim)">{tr('リクエスト ', 'request ')}</tspan>
          <tspan fill="var(--text)" fontWeight={700}>{`#${Math.max(1, requestNo)}`}</tspan>
          <tspan fill="var(--text-dim)" dx={24}>{tr('入力 ', 'input ')}</tspan>
          <tspan fill={used >= CW_INPUT ? 'var(--amber)' : 'var(--text)'}>{`${used}k / ${CW_INPUT}k`}</tspan>
          <tspan fill="var(--text-dim)" dx={24}>{tr('出力用 ', 'reply ')}</tspan>
          <tspan fill="var(--text)">{`${CW_RESERVE}k`}</tspan>
          <tspan fill="var(--text-dim)" dx={24}>{tr('ウィンドウ ', 'window ')}</tspan>
          <tspan fill="var(--text)">{`${CW_CAP}k tokens`}</tspan>
        </text>
        <text x={X0} y={Y - 14} fill="var(--text-dim)" fontSize={11.5}>
          {tr('コンテキストウィンドウ（この中身を毎回まるごと送る）', 'Context window (sent in full on every request)')}
        </text>

        {/* frame */}
        <rect x={X0} y={Y} width={W} height={H} rx={10} fill="none" stroke="var(--border-strong)" strokeWidth={1.5} />

        {/* messages */}
        {msgs.map((m) => {
          const w = m.u * unit;
          const el = (
            <g key={m.id}>
              <rect
                x={x + 3}
                y={Y + 6}
                width={w - 6}
                height={H - 12}
                rx={7}
                fill={tone[m.role].fill}
                stroke={tone[m.role].stroke}
                strokeWidth={m === last && !reduced ? 2 : 1.25}
              />
              <text x={x + w / 2} y={Y + H / 2 + 4} textAnchor="middle" fill="var(--text)" fontSize={12} fontWeight={600}>
                {name(m)}
              </text>
            </g>
          );
          x += w;
          return el;
        })}

        {/* reserved for output */}
        <rect x={X0 + CW_INPUT * unit + 3} y={Y + 6} width={CW_RESERVE * unit - 6} height={H - 12} rx={7} fill="none" stroke="var(--border-strong)" strokeDasharray="4 4" />
        <text x={X0 + (CW_INPUT + CW_RESERVE / 2) * unit} y={Y + H / 2 + 4} textAnchor="middle" fill="var(--text-dim)" fontSize={11.5}>
          {tr('返答の分', 'for the reply')}
        </text>

        {/* dropped */}
        {dropped.length > 0 && (
          <g>
            <text x={X0} y={Y + H + 36} fill="var(--red)" fontSize={11.5}>
              {tr('入りきらないので、古い発言から外す', 'Does not fit, so the oldest turns are dropped')}
            </text>
            {dropped.map((m, i) => {
              const w = m.u * unit - 6;
              const dx = X0 + dropped.slice(0, i).reduce((a, d) => a + d.u * unit + 8, 0);
              return (
                <g key={m.id} opacity={0.75}>
                  <rect x={dx} y={Y + H + 46} width={w} height={34} rx={7} fill="var(--red-soft)" stroke="var(--red)" strokeDasharray="4 3" />
                  <text x={dx + w / 2} y={Y + H + 68} textAnchor="middle" fill="var(--red)" fontSize={11.5} textDecoration="line-through">
                    {name(m)}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        <text x={X0} y={288} fill="var(--text-muted)" fontSize={12}>
          {tr(
            'システムプロンプトは残し、古いやり取りから削る。要約して詰め直す方法もある',
            'Keep the system prompt and trim the oldest turns, or summarize them to make room',
          )}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 5) LlmAttention
// ============================================================================
interface AttnCase { tokens: string[]; weights: number[] }

const ATTN: Record<'ja' | 'en', Record<'fresh' | 'hungry', AttnCase>> = {
  ja: {
    fresh: { tokens: ['猫', 'が', '魚', 'を', '食べ', 'た', '。', 'それ', 'は', '新鮮'], weights: [0.08, 0.02, 0.52, 0.03, 0.1, 0.02, 0.01, 0.16, 0.06] },
    hungry: { tokens: ['猫', 'が', '魚', 'を', '食べ', 'た', '。', 'それ', 'は', '空腹'], weights: [0.5, 0.04, 0.08, 0.02, 0.12, 0.02, 0.01, 0.15, 0.06] },
  },
  en: {
    fresh: { tokens: ['The', ' cat', ' ate', ' the', ' fish', '.', ' It', ' was', ' fresh'], weights: [0.02, 0.08, 0.1, 0.03, 0.53, 0.01, 0.17, 0.06] },
    hungry: { tokens: ['The', ' cat', ' ate', ' the', ' fish', '.', ' It', ' was', ' hungry'], weights: [0.02, 0.51, 0.12, 0.03, 0.08, 0.01, 0.17, 0.06] },
  },
};

export function LlmAttention() {
  const { lang } = useLang();
  const tr = useTr();
  const [which, setWhich] = useState<'fresh' | 'hungry'>('fresh');
  const c = ATTN[lang === 'ja' ? 'ja' : 'en'][which];

  const SIZE = 15;
  const GAP = 10;
  const Y = 200;
  const widths = c.tokens.map((t) => textWidth(showSpace(t), SIZE) + 18);
  const totalW = widths.reduce((a, b) => a + b, 0) + GAP * (widths.length - 1);
  let x = (860 - totalW) / 2;
  const pos = widths.map((w) => {
    const p = { x, w, cx: x + w / 2 };
    x += w + GAP;
    return p;
  });
  const focus = c.tokens.length - 1;
  const fx = pos[focus].cx;
  const top = Math.max(...c.weights);

  return (
    <DiagramFrame
      height={280}
      controls={
        <>
          <ToggleButton active={which === 'fresh'} onClick={() => setWhich('fresh')} label={tr('…新鮮', '…fresh')} />
          <ToggleButton active={which === 'hungry'} onClick={() => setWhich('hungry')} label={tr('…空腹', '…hungry')} />
        </>
      }
      caption={tr(
        '線の太さが参照の強さ（例の値）。同じ「それ」でも、最後の単語によって強く見る相手が変わる',
        'Line width shows how strongly each token is attended to (illustrative values). The last word changes what "it" is linked to',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 860 260"
        width="100%"
        role="img"
        aria-label={tr(
          `最後のトークン「${c.tokens[focus]}」が、前のトークンをどれだけ参照しているかを線の太さで表した図`,
          `How strongly the last token "${c.tokens[focus].trim()}" attends to each earlier token, shown by line width`,
        )}
      >
        <text x={30} y={34} fill="var(--text-dim)" fontSize={11.5}>
          {tr('最後のトークンから、前のトークンへの Attention', 'Attention from the last token to earlier tokens')}
        </text>

        {/* arcs */}
        {c.weights.map((w, i) => {
          const tx = pos[i].cx;
          const h = 30 + (fx - tx) * 0.24;
          const strong = w === top;
          return (
            <g key={`${which}-${i}`}>
              <path
                d={`M ${fx} ${Y - 4} C ${fx} ${Y - 4 - h}, ${tx} ${Y - 4 - h}, ${tx} ${Y - 4}`}
                fill="none"
                stroke={strong ? 'var(--accent)' : 'var(--text-dim)'}
                strokeWidth={1 + w * 14}
                opacity={strong ? 0.85 : 0.25 + w * 1.5}
                strokeLinecap="round"
                style={{ transition: 'stroke-width 300ms, opacity 300ms' }}
              />
              {w >= 0.15 && (
                <text x={tx} y={Y - 12 - h * 0.75} textAnchor="middle" fill={strong ? 'var(--accent)' : 'var(--text-muted)'} fontSize={11.5} fontFamily={MONO} fontWeight={strong ? 700 : 400}>
                  {`${Math.round(w * 100)}%`}
                </text>
              )}
            </g>
          );
        })}

        {/* tokens */}
        {c.tokens.map((t, i) => {
          const p = pos[i];
          const isFocus = i === focus;
          const strong = !isFocus && c.weights[i] === top;
          return (
            <g key={`${which}-t${i}`}>
              <rect
                x={p.x}
                y={Y}
                width={p.w}
                height={34}
                rx={7}
                fill={isFocus ? 'var(--accent-soft)' : 'var(--surface)'}
                stroke={isFocus || strong ? 'var(--accent)' : 'var(--border-strong)'}
                strokeWidth={isFocus || strong ? 1.75 : 1.25}
              />
              <text x={p.cx} y={Y + 22} textAnchor="middle" fill="var(--text)" fontSize={SIZE} fontWeight={isFocus || strong ? 700 : 400}>
                {showSpace(t)}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}
