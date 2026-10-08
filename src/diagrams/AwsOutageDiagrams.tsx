// Diagrams for the AWS us-east-1 (October 19-20, 2025) outage write-up.
// Every time and mechanism comes from AWS's public Post-Event Summary
// (https://aws.amazon.com/message/101925/). Shapes that the summary does not
// quantify are drawn schematically and say so in their captions.
//  - UaCascade:    the causal chain, from the DNS race to NLB health checks,
//                  revealed one stage at a time.
//  - UaDnsRace:    step-through of the race between two DNS Enactors that left
//                  the regional DynamoDB endpoint with an empty DNS record.
//  - UaCongestion: schematic of DWFM's droplet leases and queued work around
//                  the congestive collapse (02:25-05:28 PDT).
//  - UaTimeline:   per-service impact bars on a real PDT time axis, with a
//                  scrubber that shows the latest event and what is impaired.
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

const MONO = 'var(--font-mono)';

// ============================================================================
// 1) UaCascade
// ============================================================================
export function UaCascade() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(5);
  const [play, setPlay] = useState(0);

  useEffect(() => {
    if (reduced) {
      setShown(5);
      return;
    }
    setShown(0);
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setShown(n);
      if (n >= 5) clearInterval(id);
    }, 1300);
    return () => clearInterval(id);
  }, [play, reduced]);

  const rows = [
    {
      time: '23:48',
      title: tr('DNS 自動化の競合状態', 'A race in the DNS automation'),
      sub: tr('古い計画が新しい計画を上書きし、その後削除された', 'An old plan overwrote the newest one, then got deleted'),
      effect: tr('DynamoDB のエンドポイントが空に', 'DynamoDB endpoint resolves to nothing'),
    },
    {
      time: '23:48',
      title: tr('DynamoDB に接続できない', 'Nothing can reach DynamoDB'),
      sub: tr('顧客だけでなく、AWS の社内サービスも同じ入口を使う', 'Customers and internal AWS services share this endpoint'),
      effect: tr('DynamoDB API エラー（〜02:40）', 'DynamoDB API errors (until 02:40)'),
    },
    {
      time: '02:25',
      title: tr('DWFM の輻輳崩壊', 'Congestive collapse in DWFM'),
      sub: tr('リースの張り直しが、タイムアウトまでに終わらない', 'Re-establishing leases takes longer than their timeout'),
      effect: tr('EC2 の新規起動が失敗', 'New EC2 launches fail'),
    },
    {
      time: '05:28',
      title: tr('Network Manager のバックログ', 'Network Manager backlog'),
      sub: tr('溜まったネットワーク設定の反映が遅れる', 'Delayed network configuration piles up'),
      effect: tr('起動しても通信できない', 'Launched, but no network yet'),
    },
    {
      time: '05:30',
      title: tr('NLB ヘルスチェックの不安定化', 'NLB health checks start flapping'),
      sub: tr('健全なノードまで、サービスから外される', 'Healthy nodes get pulled out of service'),
      effect: tr('NLB の接続エラー（〜14:09）', 'NLB connection errors (until 14:09)'),
    },
  ];

  const BX = 110;
  const BW = 400;
  const BH = 60;
  const Y0 = 44;
  const STEP = 80;
  const EX = 548;

  return (
    <DiagramFrame
      height={420}
      onReplay={() => setPlay((p) => p + 1)}
      caption={tr(
        'きっかけは 1 つでも、溜まった影響が次の段で別の問題になった。時刻は PDT（AWS の発表どおり）',
        'One trigger, but the effects that piled up became a new problem one stage down. Times are PDT, as in AWS\'s summary',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 470"
        width="100%"
        role="img"
        aria-label={tr(
          'DNS 自動化の競合状態から、DynamoDB、DWFM、Network Manager、NLB ヘルスチェックへと障害が連鎖した流れ',
          'The chain of failures: the DNS automation race, then DynamoDB, DWFM, Network Manager and NLB health checks',
        )}
      >
        <text x={24} y={24} fontSize={12} fontFamily={MONO} fill="var(--text-dim)">PDT</text>
        <text x={BX} y={24} fontSize={12} fontWeight={600} fill="var(--text-muted)">
          {tr('起きたこと', 'What happened')}
        </text>
        <text x={EX} y={24} fontSize={12} fontWeight={600} fill="var(--text-muted)">
          {tr('利用者から見た影響', 'What customers saw')}
        </text>

        {rows.map((r, i) => {
          const y = Y0 + i * STEP;
          const on = i < shown;
          const style = { opacity: on ? 1 : 0.22, transition: reduced ? 'none' : 'opacity 0.4s' };
          return (
            <g key={i} style={style}>
              <text x={24} y={y + 35} fontSize={13} fontFamily={MONO} fontWeight={600} fill="var(--text)">
                {r.time}
              </text>
              <rect
                x={BX}
                y={y}
                width={BW}
                height={BH}
                rx={10}
                fill={on ? 'var(--red-soft)' : 'var(--surface)'}
                stroke={on ? 'var(--red)' : 'var(--border-strong)'}
                strokeWidth={1.5}
              />
              <text x={BX + 16} y={y + 25} fontSize={14} fontWeight={700} fill="var(--text)">
                {r.title}
              </text>
              <text x={BX + 16} y={y + 45} fontSize={12} fill="var(--text-muted)">
                {r.sub}
              </text>
              <g stroke="var(--border-strong)" strokeWidth={1.5} fill="none">
                <line x1={BX + BW + 6} y1={y + BH / 2} x2={EX - 10} y2={y + BH / 2} />
                <path d={`M${EX - 16} ${y + BH / 2 - 5} L${EX - 10} ${y + BH / 2} L${EX - 16} ${y + BH / 2 + 5}`} />
              </g>
              <text x={EX} y={y + BH / 2 + 5} fontSize={12.5} fontWeight={600} fill="var(--red)">
                {r.effect}
              </text>
              {i < rows.length - 1 && (
                <g stroke="var(--border-strong)" strokeWidth={1.5} fill="none">
                  <line x1={BX + BW / 2} y1={y + BH + 3} x2={BX + BW / 2} y2={y + STEP - 4} />
                  <path d={`M${BX + BW / 2 - 5} ${y + STEP - 10} L${BX + BW / 2} ${y + STEP - 4} L${BX + BW / 2 + 5} ${y + STEP - 10}`} />
                </g>
              )}
            </g>
          );
        })}

        <text x={BX} y={452} fontSize={12.5} fill="var(--text-muted)">
          {tr(
            'Lambda、STS、Redshift、Amazon Connect なども、これらの段に依存して影響を受けた',
            'Lambda, STS, Redshift, Amazon Connect and others depended on these stages and were hit too',
          )}
        </text>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) UaDnsRace
// ============================================================================
type EnactorState = { text: string; tone: 'idle' | 'busy' | 'slow' | 'bad' };

export function UaDnsRace() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const LAST = 4;

  const steps = [
    {
      title: tr('1. Enactor A が遅れる', '1. Enactor A falls behind'),
      body: tr(
        'Enactor A は計画 v1 を取り、「前に適用した計画より新しい」と一度だけ確認して適用を始めます。ところが更新が他の Enactor とぶつかり、エンドポイントごとにリトライを重ねて、いつになく遅れています。',
        'Enactor A picks up plan v1, checks once that it is newer than the plan already applied, and starts applying it. Its updates keep colliding with other Enactors, so it retries endpoint after endpoint and falls unusually far behind.',
      ),
    },
    {
      title: tr('2. Enactor B が最新の計画を適用', '2. Enactor B applies the newest plan'),
      body: tr(
        'その間も Planner は新しい計画を何世代も作り続けます。Enactor B は最新の v9 を取り、すべてのエンドポイントへ素早く適用し終えます。',
        'Meanwhile the Planner keeps producing newer generations. Enactor B picks up the newest, v9, and quickly applies it to every endpoint.',
      ),
    },
    {
      title: tr('3. 古い計画が上書きする', '3. The old plan overwrites the new one'),
      body: tr(
        'B は適用を終えて、古い計画を消すクリーンアップを始めます。ちょうど同じとき、A が古い v1 を地域エンドポイントに適用し、v9 を上書きします。A の「新しいか」の確認は、遅れのせいでもう古くなっていました。',
        'B finishes and starts its clean-up of old plans. At that same moment, A applies its old v1 to the regional endpoint, overwriting v9. A\'s "is it newer?" check was stale by now because of the delays.',
      ),
    },
    {
      title: tr('4. 適用中の計画が削除される', '4. The active plan is deleted'),
      body: tr(
        'B のクリーンアップは、v9 よりずっと古い v1 を削除します。それが今まさに適用されている計画だったため、エンドポイントの IP アドレスがすべて消えました。',
        'B\'s clean-up deletes v1 for being many generations older than v9. But v1 was the plan in effect, so every IP address for the endpoint disappeared at once.',
      ),
    },
    {
      title: tr('5. 自動では直らない', '5. The automation cannot repair it'),
      body: tr(
        '適用中の計画が消えた不整合な状態になり、どの Enactor も次の計画を適用できなくなりました。復旧には、人の手による修正が必要でした。',
        'With the active plan gone, the system was left inconsistent and no Enactor could apply any later plan. It took manual operator intervention to fix.',
      ),
    },
  ];

  const enactorA: EnactorState[] = [
    { text: tr('v1 を適用中（リトライで遅延）', 'applying v1 (slowed by retries)'), tone: 'slow' },
    { text: tr('v1 を適用中（まだ遅れている）', 'still applying v1, far behind'), tone: 'slow' },
    { text: tr('古い v1 を地域エンドポイントへ', 'writes old v1 to the endpoint'), tone: 'bad' },
    { text: tr('v1 を適用済み', 'v1 applied'), tone: 'idle' },
    { text: tr('次の計画を適用できない', 'cannot apply any plan'), tone: 'bad' },
  ];
  const enactorB: EnactorState[] = [
    { text: tr('待機', 'idle'), tone: 'idle' },
    { text: tr('最新の v9 を素早く適用', 'applies newest v9 quickly'), tone: 'busy' },
    { text: tr('クリーンアップを開始', 'starts clean-up'), tone: 'busy' },
    { text: tr('古い v1 を削除', 'deletes old v1'), tone: 'bad' },
    { text: tr('次の計画を適用できない', 'cannot apply any plan'), tone: 'bad' },
  ];
  const enactorC: EnactorState[] = [
    { text: tr('待機', 'idle'), tone: 'idle' },
    { text: tr('待機', 'idle'), tone: 'idle' },
    { text: tr('待機', 'idle'), tone: 'idle' },
    { text: tr('待機', 'idle'), tone: 'idle' },
    { text: tr('次の計画を適用できない', 'cannot apply any plan'), tone: 'bad' },
  ];

  const record = [
    { plan: tr('以前の計画', 'earlier plan'), ips: true },
    { plan: 'v9', ips: true },
    { plan: tr('v1（古い）', 'v1 (old)'), ips: true },
    { plan: tr('なし', 'none'), ips: false },
    { plan: tr('なし', 'none'), ips: false },
  ][step];

  const toneStroke = { idle: 'var(--border-strong)', busy: 'var(--accent)', slow: 'var(--amber)', bad: 'var(--red)' };
  const toneFill = { idle: 'var(--surface)', busy: 'var(--accent-soft)', slow: 'var(--amber-soft)', bad: 'var(--red-soft)' };
  const tx = reduced ? 'none' : 'fill 0.3s, stroke 0.3s, opacity 0.3s';

  // Which enactor (if any) is writing to Route 53 in this step.
  const writer = step === 1 ? 1 : step === 2 ? 0 : -1;

  const EX = 236;
  const EW = 250;
  const EH = 62;
  const eY = [40, 128, 216];
  const RX = 556;
  const RY = 84;
  const RW = 244;
  const RH = 150;

  const enactors = [
    { name: 'Enactor A', st: enactorA[step] },
    { name: 'Enactor B', st: enactorB[step] },
    { name: 'Enactor C', st: enactorC[step] },
  ];

  const v1Deleted = step >= 3;
  const newPlans = step >= 1;

  return (
    <DiagramFrame
      height={400}
      controls={
        <>
          <button className="btn btn--ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            {tr('← 前へ', '← Back')}
          </button>
          <button className="btn" onClick={() => setStep((s) => Math.min(LAST, s + 1))} disabled={step === LAST}>
            {tr('次へ →', 'Next →')}
          </button>
          <span style={{ fontFamily: MONO, fontSize: 13, color: 'var(--text-muted)' }}>
            {step + 1} / {LAST + 1}
          </span>
        </>
      }
      caption={tr(
        '公開資料をもとにした簡略図。v1・v9 などの世代番号は説明のためのもの',
        'Simplified from the public summary. Generation numbers such as v1 and v9 are for illustration',
      )}
    >
      <div style={{ width: '100%' }}>
        <svg
          className="hero-net"
          viewBox="0 0 820 300"
          width="100%"
          role="img"
          aria-label={tr(
            'DNS Planner と 3 つの DNS Enactor、Route 53 のレコードの関係。遅れた Enactor が古い計画を書き、別の Enactor がそれを削除して、エンドポイントが空になる',
            'The DNS Planner, three DNS Enactors and the Route 53 record. A delayed Enactor writes an old plan, another deletes it, and the endpoint ends up empty',
          )}
        >
          {/* Planner + plan store */}
          <rect x={20} y={40} width={170} height={62} rx={10} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.5} />
          <text x={36} y={66} fontSize={14} fontWeight={700} fill="var(--text)">DNS Planner</text>
          <text x={36} y={86} fontSize={12} fill="var(--text-muted)">{tr('計画を定期的に作る', 'makes plans periodically')}</text>

          <text x={20} y={134} fontSize={12} fontWeight={600} fill="var(--text-muted)">{tr('計画', 'Plans')}</text>
          {[
            { label: tr('v9（最新）', 'v9 (newest)'), y: 146, show: newPlans, deleted: false },
            { label: 'v2 … v8', y: 180, show: newPlans, deleted: false },
            { label: tr('v1（古い）', 'v1 (old)'), y: 214, show: true, deleted: v1Deleted },
          ].map((p) => (
            <g key={p.y} style={{ opacity: p.show ? 1 : 0.15, transition: tx }}>
              <rect
                x={20}
                y={p.y}
                width={170}
                height={28}
                rx={6}
                fill={p.deleted ? 'var(--red-soft)' : 'var(--surface)'}
                stroke={p.deleted ? 'var(--red)' : 'var(--border)'}
                strokeWidth={1.25}
                strokeDasharray={p.deleted ? '5 4' : undefined}
                style={{ transition: tx }}
              />
              <text x={34} y={p.y + 19} fontSize={12.5} fontFamily={MONO} fill={p.deleted ? 'var(--red)' : 'var(--text)'}>
                {p.label}
              </text>
              {p.deleted && (
                <text x={178} y={p.y + 19} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--red)">
                  {tr('削除', 'deleted')}
                </text>
              )}
            </g>
          ))}

          {/* Enactors */}
          {enactors.map((e, i) => {
            const y = eY[i];
            const dim = e.st.tone === 'idle';
            return (
              <g key={e.name} style={{ opacity: dim ? 0.5 : 1, transition: tx }}>
                <rect
                  x={EX}
                  y={y}
                  width={EW}
                  height={EH}
                  rx={10}
                  fill={toneFill[e.st.tone]}
                  stroke={toneStroke[e.st.tone]}
                  strokeWidth={1.5}
                  style={{ transition: tx }}
                />
                <text x={EX + 16} y={y + 25} fontSize={14} fontWeight={700} fill="var(--text)">{e.name}</text>
                <text x={EX + EW - 14} y={y + 25} textAnchor="end" fontSize={11} fontFamily={MONO} fill="var(--text-dim)">
                  AZ {i + 1}
                </text>
                <text x={EX + 16} y={y + 46} fontSize={12} fill={e.st.tone === 'bad' ? 'var(--red)' : 'var(--text-muted)'}>
                  {e.st.text}
                </text>
              </g>
            );
          })}

          {/* writes to Route 53 */}
          {enactors.map((_, i) => {
            const active = writer === i;
            const y1 = eY[i] + EH / 2;
            const y2 = RY + RH / 2;
            const color = active ? (i === 0 ? 'var(--red)' : 'var(--accent)') : 'var(--border)';
            return (
              <g key={i} stroke={color} strokeWidth={active ? 2 : 1.25} fill="none" style={{ transition: tx }}>
                <line x1={EX + EW + 4} y1={y1} x2={RX - 8} y2={y2} />
                {active && (
                  <circle cx={RX - 8} cy={y2} r={3.5} fill={color} stroke="none" />
                )}
              </g>
            );
          })}

          {/* Route 53 record */}
          <rect x={RX} y={RY} width={RW} height={RH} rx={12} fill="var(--surface)" stroke={record.ips ? 'var(--border-strong)' : 'var(--red)'} strokeWidth={1.5} style={{ transition: tx }} />
          <text x={RX + 16} y={RY + 26} fontSize={14} fontWeight={700} fill="var(--text)">Route 53</text>
          <text x={RX + 16} y={RY + 48} fontSize={11} fontFamily={MONO} fill="var(--text-dim)">dynamodb.us-east-1.amazonaws.com</text>
          <text x={RX + 16} y={RY + 76} fontSize={12.5} fill="var(--text-muted)">
            {tr('適用中の計画: ', 'plan in effect: ')}
            <tspan fontFamily={MONO} fontWeight={600} fill={record.ips ? 'var(--text)' : 'var(--red)'}>{record.plan}</tspan>
          </text>
          {record.ips ? (
            <g>
              {Array.from({ length: 8 }).map((_, k) => (
                <rect key={k} x={RX + 16 + k * 26} y={RY + 96} width={18} height={18} rx={4} fill="var(--green-soft)" stroke="var(--green)" strokeWidth={1.25} />
              ))}
              <text x={RX + 16} y={RY + 136} fontSize={12} fill="var(--text-muted)">{tr('ロードバランサーの IP', 'load balancer IPs')}</text>
            </g>
          ) : (
            <g>
              <text x={RX + 16} y={RY + 112} fontSize={14} fontWeight={700} fill="var(--red)">{tr('IP アドレスなし', 'no IP addresses')}</text>
              <text x={RX + 16} y={RY + 136} fontSize={12} fill="var(--red)">{tr('名前解決できない', 'name does not resolve')}</text>
            </g>
          )}
        </svg>
        <div aria-live="polite" style={{ padding: '4px 20px 18px', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{steps[step].title}</div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{steps[step].body}</div>
        </div>
      </div>
    </DiagramFrame>
  );
}

// ============================================================================
// 3) UaCongestion
// ============================================================================
// Time axis: hours after 23:00 PDT on Oct 19.
const C_T0 = 0;
const C_T1 = 7; // 06:00
const C_DDB_DOWN = 48 / 60; // 23:48
const C_DDB_UP = 3 + 25 / 60; // 02:25
const C_INTERVENE = 5 + 14 / 60; // 04:14
const C_ALL = 6 + 28 / 60; // 05:28

const GX0 = 70;
const GX1 = 790;
const GY0 = 84;
const GY1 = 252;
const gx = (t: number) => GX0 + ((t - C_T0) / (C_T1 - C_T0)) * (GX1 - GX0);
const gy = (v: number) => GY1 - v * (GY1 - GY0); // v in 0..1

const smooth = (k: number) => k * k * (3 - 2 * k);
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

// Share of droplets holding a lease (schematic).
function leases(t: number): number {
  if (t < C_DDB_DOWN) return 1;
  if (t < C_DDB_UP) return 1 - 0.78 * smooth(clamp01((t - C_DDB_DOWN) / (C_DDB_UP - C_DDB_DOWN)));
  if (t < C_INTERVENE) return 0.22 + 0.015 * Math.sin(t * 9);
  return 0.22 + 0.78 * smooth(clamp01((t - C_INTERVENE) / (C_ALL - C_INTERVENE)));
}

// Queued lease work waiting in DWFM (schematic).
function queued(t: number): number {
  if (t < C_DDB_UP) return 0.04;
  if (t < C_INTERVENE) return 0.04 + 0.84 * (1 - Math.exp(-(t - C_DDB_UP) * 2.6)) + 0.02 * Math.sin(t * 7);
  const k = clamp01((t - C_INTERVENE) / 0.45);
  const peak = 0.04 + 0.84 * (1 - Math.exp(-(C_INTERVENE - C_DDB_UP) * 2.6));
  return 0.04 + (peak - 0.04) * (1 - smooth(k));
}

export function UaCongestion() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(0);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const DURATION = 7000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    setProgress(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduced]);

  const tNow = C_T0 + progress * (C_T1 - C_T0);
  const series = (f: (t: number) => number) => {
    const pts: string[] = [];
    for (let t = C_T0; t <= tNow + 1e-6; t += 0.02) pts.push(`${gx(t).toFixed(1)},${gy(f(t)).toFixed(1)}`);
    return pts.join(' ');
  };
  const seen = (t: number) => tNow >= t;
  const fade = (t: number) => ({ opacity: seen(t) ? 1 : 0.15, transition: reduced ? 'none' : 'opacity 0.3s' });

  const events = [
    { t: C_DDB_DOWN, time: '23:48', text: tr('DynamoDB に繋がらず、リースの状態確認が失敗。リースが少しずつ切れていく', 'DynamoDB unreachable: lease state checks fail, and leases slowly time out') },
    { t: C_DDB_UP, time: '02:25', text: tr('DynamoDB が復旧。フリート全体でリースの張り直しが始まる', 'DynamoDB recovers, and lease re-establishment starts across the fleet') },
    { t: C_INTERVENE, time: '04:14', text: tr('流入する仕事を絞り、DWFM ホストを選んで再起動。キューが空になる', 'Incoming work is throttled and DWFM hosts selectively restarted, clearing the queues') },
    { t: C_ALL, time: '05:28', text: tr('すべてのドロップレットのリースが復旧', 'Every droplet has a lease again') },
  ];

  return (
    <DiagramFrame
      height={380}
      onReplay={() => setPlay((p) => p + 1)}
      caption={tr(
        '時刻は発表どおり、線の形は模式図（実測値ではない）。DynamoDB が戻った後も、2 時間近く前に進めなかった',
        'Times are from the summary; the curves are schematic, not measured. Even after DynamoDB came back, DWFM made no progress for almost two hours',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 430"
        width="100%"
        role="img"
        aria-label={tr(
          'DWFM のリースを持つドロップレットの割合と、処理待ちの仕事量の模式図。DynamoDB の復旧後も、張り直しがタイムアウトしてキューが膨らみ、流入制限と再起動の後にようやくリースが戻る',
          'Schematic of droplets holding a DWFM lease and the queued work. After DynamoDB recovers, re-establishment keeps timing out and the queue swells; leases only return after throttling and restarts',
        )}
      >
        <text x={GX0} y={26} fontSize={15} fontWeight={700} fill="var(--text)">
          {tr('DWFM とドロップレットのリース（模式図）', 'DWFM droplet leases (schematic)')}
        </text>
        <g fontSize={12.5}>
          <line x1={GX0} y1={50} x2={GX0 + 22} y2={50} stroke="var(--accent)" strokeWidth={2.5} />
          <text x={GX0 + 30} y={54} fill="var(--text-muted)">{tr('リースを持つドロップレット', 'droplets with a lease')}</text>
          <line x1={GX0 + 260} y1={50} x2={GX0 + 282} y2={50} stroke="var(--amber)" strokeWidth={2.5} />
          <text x={GX0 + 290} y={54} fill="var(--text-muted)">{tr('処理待ちのリース作業', 'queued lease work')}</text>
        </g>

        {/* collapse band */}
        <rect
          x={gx(C_DDB_UP)}
          y={GY0}
          width={gx(C_INTERVENE) - gx(C_DDB_UP)}
          height={GY1 - GY0}
          fill="var(--red-soft)"
          style={fade(C_DDB_UP)}
        />
        <text
          x={(gx(C_DDB_UP) + gx(C_INTERVENE)) / 2}
          y={GY1 - 10}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={700}
          fill="var(--red)"
          style={fade(C_DDB_UP)}
        >
          {tr('輻輳崩壊', 'congestive collapse')}
        </text>

        {/* axes */}
        <line x1={GX0} y1={GY1} x2={GX1} y2={GY1} stroke="var(--border-strong)" strokeWidth={1} />
        <line x1={GX0} y1={gy(1)} x2={GX1} y2={gy(1)} stroke="var(--border)" strokeWidth={1} strokeDasharray="4 4" />
        <text x={GX0 - 8} y={gy(1) + 4} textAnchor="end" fontSize={12} fill="var(--text-dim)">{tr('全台', 'all')}</text>
        {[
          { t: 0, l: '23:00' },
          { t: 1, l: '00:00' },
          { t: 2, l: '01:00' },
          { t: 3, l: '02:00' },
          { t: 4, l: '03:00' },
          { t: 5, l: '04:00' },
          { t: 6, l: '05:00' },
          { t: 7, l: '06:00' },
        ].map((a) => (
          <text key={a.t} x={gx(a.t)} y={GY1 + 20} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="var(--text-dim)">
            {a.l}
          </text>
        ))}

        {/* event markers */}
        {events.map((e, i) => (
          <g key={i} style={fade(e.t)}>
            <line x1={gx(e.t)} y1={GY0} x2={gx(e.t)} y2={GY1} stroke="var(--text-dim)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={gx(e.t)} cy={GY0 - 10} r={9} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth={1.25} />
            <text x={gx(e.t)} y={GY0 - 6} textAnchor="middle" fontSize={11} fontFamily={MONO} fontWeight={700} fill="var(--text)">
              {i + 1}
            </text>
          </g>
        ))}

        {/* series */}
        <polyline points={series(queued)} fill="none" stroke="var(--amber)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <polyline points={series(leases)} fill="none" stroke="var(--accent)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

        {/* legend of events */}
        {events.map((e, i) => {
          const y = 310 + i * 28;
          return (
            <g key={i} style={fade(e.t)}>
              <circle cx={GX0 + 2} cy={y - 4} r={9} fill="var(--surface)" stroke="var(--text-muted)" strokeWidth={1.25} />
              <text x={GX0 + 2} y={y} textAnchor="middle" fontSize={11} fontFamily={MONO} fontWeight={700} fill="var(--text)">
                {i + 1}
              </text>
              <text x={GX0 + 22} y={y} fontSize={12.5} fontFamily={MONO} fontWeight={600} fill="var(--text)">
                {e.time}
              </text>
              <text x={GX0 + 72} y={y} fontSize={12.5} fill="var(--text-muted)">
                {e.text}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 4) UaTimeline
// ============================================================================
// Minutes after 23:00 PDT on October 19.
const m = (h: number, mm: number) => (h === 23 ? mm : 60 + h * 60 + mm);
const T_MAX = m(15, 0);

const LX = 130;
const RXT = 800;
const tx2 = (mins: number) => LX + (mins / T_MAX) * (RXT - LX);
const fmt = (mins: number) => {
  const total = (23 * 60 + mins) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export function UaTimeline() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState(T_MAX);
  const [play, setPlay] = useState(0);

  useEffect(() => {
    if (play === 0 || reduced) return;
    let raf = 0;
    const start = performance.now();
    const DURATION = 12000;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      setCursor(Math.round(p * T_MAX));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, reduced]);

  type Seg = { from: number; to: number; tone: 'red' | 'amber' };
  const rows: { label: string; segs: Seg[] }[] = [
    { label: 'DynamoDB', segs: [{ from: m(23, 48), to: m(2, 40), tone: 'red' }] },
    {
      label: 'EC2',
      segs: [
        { from: m(23, 48), to: m(2, 25), tone: 'amber' },
        { from: m(2, 25), to: m(10, 36), tone: 'red' },
        { from: m(10, 36), to: m(13, 50), tone: 'amber' },
      ],
    },
    { label: 'NLB', segs: [{ from: m(5, 30), to: m(14, 9), tone: 'red' }] },
    { label: 'Lambda', segs: [{ from: m(23, 51), to: m(14, 15), tone: 'red' }] },
    {
      label: 'STS',
      segs: [
        { from: m(23, 51), to: m(1, 19), tone: 'red' },
        { from: m(8, 31), to: m(9, 59), tone: 'red' },
      ],
    },
  ];

  const events = [
    { t: m(23, 48), text: tr('DynamoDB の地域エンドポイントの DNS レコードが空になる', 'The regional DynamoDB endpoint\'s DNS record goes empty') },
    { t: m(0, 38), text: tr('原因を DynamoDB の DNS 状態と特定', 'DynamoDB\'s DNS state identified as the source') },
    { t: m(1, 15), text: tr('一時的な緩和策で、一部の社内サービスと社内ツールが回復', 'Temporary mitigations restore some internal services and tooling') },
    { t: m(2, 25), text: tr('DNS 情報がすべて復旧。DWFM がリースの張り直しを始める', 'All DNS information restored; DWFM starts re-establishing leases') },
    { t: m(2, 40), text: tr('DNS キャッシュが切れ、DynamoDB への接続が戻る', 'Cached DNS records expire and DynamoDB connections succeed') },
    { t: m(4, 14), text: tr('DWFM への流入を絞り、ホストを選んで再起動', 'Incoming DWFM work throttled; selective host restarts begin') },
    { t: m(5, 28), text: tr('全ドロップレットのリースが復旧。Network Manager が溜まった設定の反映を始める', 'All droplet leases restored; Network Manager starts on its backlog') },
    { t: m(6, 21), text: tr('Network Manager の反映に遅れが出始める', 'Network Manager propagation latency starts rising') },
    { t: m(6, 52), text: tr('NLB ヘルスチェックの異常を監視が検知', 'Monitoring detects the NLB health check problem') },
    { t: m(9, 36), text: tr('NLB の自動ヘルスチェックフェイルオーバーを無効化', 'Automatic NLB health check failover disabled') },
    { t: m(10, 36), text: tr('ネットワーク設定の反映時間が正常に戻る', 'Network propagation times back to normal') },
    { t: m(11, 23), text: tr('EC2 のリクエスト制限を緩め始める', 'EC2 request throttles start being relaxed') },
    { t: m(13, 50), text: tr('EC2 の API と新規起動が完全に正常化', 'All EC2 APIs and new launches operating normally') },
    { t: m(14, 9), text: tr('NLB の自動フェイルオーバーを再び有効化', 'Automatic NLB failover re-enabled') },
    { t: m(14, 20), text: tr('イベント終了', 'Event ends') },
  ];

  const latest = [...events].reverse().find((e) => e.t <= cursor);
  const impaired = rows.filter((r) => r.segs.some((s) => s.from <= cursor && cursor < s.to)).map((r) => r.label);

  const RY0 = 66;
  const RSTEP = 38;
  const BAR = 18;
  const axisY = RY0 + rows.length * RSTEP + 6;

  return (
    <DiagramFrame
      height={320}
      onReplay={() => setPlay((p) => p + 1)}
      controls={
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          <input
            type="range"
            min={0}
            max={T_MAX}
            step={1}
            value={cursor}
            onChange={(e) => setCursor(Number(e.target.value))}
            aria-label={tr('表示する時刻（PDT）', 'Time to show (PDT)')}
            aria-valuetext={`${fmt(cursor)} PDT`}
            style={{ width: 180, accentColor: 'var(--accent)' }}
          />
          <span style={{ fontFamily: MONO, color: 'var(--text)' }}>{fmt(cursor)}</span>
        </label>
      }
      caption={tr(
        '時刻は PDT（日本時間は +16 時間）。赤はエラーや失敗、黄は遅延や一部の失敗',
        'Times in PDT (UTC−7). Red is errors or failures, amber is latency or partial failures',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 350"
        width="100%"
        role="img"
        aria-label={tr(
          'サービスごとの影響の時間帯。DynamoDB は 23:48 から 02:40、EC2 は 23:48 から 13:50、NLB は 05:30 から 14:09、Lambda は 23:51 から 14:15、STS は 23:51 から 01:19 と 08:31 から 09:59',
          'Impact windows per service: DynamoDB 23:48 to 02:40, EC2 23:48 to 13:50, NLB 05:30 to 14:09, Lambda 23:51 to 14:15, STS 23:51 to 01:19 and 08:31 to 09:59',
        )}
      >
        {/* midnight */}
        <line x1={tx2(60)} y1={34} x2={tx2(60)} y2={axisY} stroke="var(--border)" strokeWidth={1} strokeDasharray="3 3" />
        <text x={tx2(0)} y={30} fontSize={12} fontFamily={MONO} fill="var(--text-dim)">10/19</text>
        <text x={tx2(60) + 6} y={30} fontSize={12} fontFamily={MONO} fill="var(--text-dim)">10/20</text>

        {/* event ticks */}
        {events.map((e, i) => (
          <circle
            key={i}
            cx={tx2(e.t)}
            cy={48}
            r={3.5}
            fill={e.t <= cursor ? 'var(--text-muted)' : 'var(--border-strong)'}
            style={{ transition: reduced ? 'none' : 'fill 0.2s' }}
          />
        ))}

        {rows.map((r, i) => {
          const y = RY0 + i * RSTEP;
          return (
            <g key={r.label}>
              <text x={LX - 14} y={y + 14} textAnchor="end" fontSize={13} fontWeight={600} fill="var(--text)">
                {r.label}
              </text>
              <line x1={LX} y1={y + BAR / 2} x2={RXT} y2={y + BAR / 2} stroke="var(--border)" strokeWidth={1} />
              {r.segs.map((s, k) => {
                const end = Math.min(s.to, cursor);
                const w = Math.max(0, tx2(end) - tx2(s.from));
                return (
                  <rect
                    key={k}
                    x={tx2(s.from)}
                    y={y}
                    width={w}
                    height={BAR}
                    rx={3}
                    fill={s.tone === 'red' ? 'var(--red)' : 'var(--amber)'}
                    opacity={0.85}
                  />
                );
              })}
            </g>
          );
        })}

        {/* axis */}
        {[0, 2, 4, 6, 8, 10, 12, 14, 16].map((h) => {
          const mins = h * 60;
          return (
            <text key={h} x={tx2(mins)} y={axisY + 16} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="var(--text-dim)">
              {fmt(mins)}
            </text>
          );
        })}

        {/* cursor */}
        <line x1={tx2(cursor)} y1={40} x2={tx2(cursor)} y2={axisY} stroke="var(--accent)" strokeWidth={1.5} />

        {/* status */}
        <text x={LX} y={axisY + 50} fontSize={13} fill="var(--text)">
          <tspan fontFamily={MONO} fontWeight={700}>{latest ? fmt(latest.t) : fmt(cursor)}</tspan>
          <tspan dx={10}>{latest ? latest.text : tr('通常どおり', 'Normal operation')}</tspan>
        </text>
        <text x={LX} y={axisY + 74} fontSize={12.5} fill={impaired.length ? 'var(--red)' : 'var(--text-muted)'}>
          {impaired.length
            ? tr(`${fmt(cursor)} に影響が出ているもの: ${impaired.join('、')}`, `Impaired at ${fmt(cursor)}: ${impaired.join(', ')}`)
            : tr(`${fmt(cursor)} の時点で、この図のサービスに影響なし`, `No impact on these services at ${fmt(cursor)}`)}
        </text>
      </svg>
    </DiagramFrame>
  );
}
