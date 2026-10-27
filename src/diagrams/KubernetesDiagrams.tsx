// Kubernetes core components diagrams.
//  - K8sArchitecture: control plane (api-server, etcd, scheduler,
//                     controller-manager) and two worker nodes (kubelet,
//                     kube-proxy, runtime, Pods). Each component is highlighted
//                     in turn with a one-line description of its job.
//  - K8sPodLifecycle: sequence of watch-driven messages from `kubectl apply` to
//                     a running Pod. Everyone talks only to the api-server.
//  - K8sReconcile:    a Pod disappears, the ReplicaSet controller notices
//                     desired 3 ≠ current 2 and creates a replacement.
//  - K8sService:      a Service load-balances to Pods by label; when a Pod is
//                     replaced (new IP) the endpoints update and clients keep
//                     using the same name.
// Dependency-free SVG, theme-aware (CSS variables only), bilingual labels, and
// static rendering when the user prefers reduced motion.
import { useEffect, useRef, useState } from 'react';
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

// Advance a counter every `ms` while motion is allowed.
function useTicker(total: number, ms: number, reduced: boolean, playKey = 0) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(0);
    if (reduced) return;
    const id = setInterval(() => setTick((v) => (v + 1) % total), ms);
    return () => clearInterval(id);
  }, [total, ms, reduced, playKey]);
  return tick;
}

const MONO = 'var(--font-mono)';

// A labeled box. `on` highlights it with the given tone.
function Box({
  x, y, w, h, label, sub, on = false, tone = 'var(--accent)', soft = 'var(--accent-soft)', dimmed = false,
}: {
  x: number; y: number; w: number; h: number; label: string; sub?: string;
  on?: boolean; tone?: string; soft?: string; dimmed?: boolean;
}) {
  return (
    <g opacity={dimmed ? 0.3 : 1} style={{ transition: 'opacity 300ms' }}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill={on ? soft : 'var(--surface)'}
        stroke={on ? tone : 'var(--border-strong)'}
        strokeWidth={on ? 1.75 : 1.25}
        style={{ transition: 'fill 300ms, stroke 300ms' }}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 3 : y + h / 2 + 4.5}
        textAnchor="middle"
        fill="var(--text)"
        fontSize={13}
        fontWeight={600}
        fontFamily={MONO}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 14} textAnchor="middle" fill="var(--text-dim)" fontSize={11}>
          {sub}
        </text>
      )}
    </g>
  );
}

// A dashed group frame with a small label in the top-left corner.
function Group({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="none" stroke="var(--border-strong)" strokeDasharray="5 5" />
      <text x={x + 14} y={y + 20} fill="var(--text-dim)" fontSize={11.5} fontWeight={500}>
        {label}
      </text>
    </g>
  );
}

function ArrowMarker({ id, color = 'var(--text-dim)' }: { id: string; color?: string }) {
  return (
    <marker id={id} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
    </marker>
  );
}

// Packet that travels a path once when mounted (begin="indefinite" + beginElement()).
function OneShotPacket({ d, color, dur }: { d: string; color: string; dur: number }) {
  const ref = useRef<SVGGElement>(null);
  useEffect(() => {
    ref.current?.querySelectorAll<SVGAnimationElement>('animate, animateMotion').forEach((a) => a.beginElement());
  }, []);
  const timing = { dur: `${dur}s`, begin: 'indefinite', fill: 'freeze' as const };
  return (
    <g ref={ref} opacity={0} style={{ color }}>
      <animateMotion {...timing} path={d} />
      <animate {...timing} attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.85;1" />
      <circle r={11} fill="currentColor" opacity={0.2} />
      <circle r={4.5} fill="currentColor" className="hn-packet" />
    </g>
  );
}

// ============================================================================
// 1) K8sArchitecture
// ============================================================================
type ArchId = 'api' | 'etcd' | 'sched' | 'cm' | 'kubelet' | 'proxy' | 'runtime' | 'pod';
const ARCH_ORDER: ArchId[] = ['api', 'etcd', 'sched', 'cm', 'kubelet', 'proxy', 'runtime', 'pod'];

const NODE_W = 330;
const NODE_Y = 268;
const NODES = [190, 540];

export function K8sArchitecture() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const tick = useTicker(ARCH_ORDER.length, 2200, reduced);
  const active: ArchId | null = reduced ? null : ARCH_ORDER[tick];

  const desc: Record<ArchId, string> = {
    api: tr('kube-apiserver: すべての操作の窓口。認証・検証してから etcd に保存する', 'kube-apiserver: the front door for every operation; authenticates, validates, then stores in etcd'),
    etcd: tr('etcd: クラスタの状態をすべて持つキーバリューストア。API server だけが読み書きする', 'etcd: key-value store holding all cluster state; only the API server talks to it'),
    sched: tr('kube-scheduler: まだノードが決まっていない Pod を、どのノードで動かすか決める', 'kube-scheduler: picks a node for every Pod that does not have one yet'),
    cm: tr('kube-controller-manager: 望ましい状態と現在の状態のズレを直し続けるループの集まり', 'kube-controller-manager: a bundle of loops that keep fixing gaps between desired and current state'),
    kubelet: tr('kubelet: 自分のノードに割り当てられた Pod を起動し、状態を報告する', 'kubelet: starts the Pods assigned to its node and reports their status'),
    proxy: tr('kube-proxy: Service 宛ての通信を Pod に振り分けるルールをノードに書く', 'kube-proxy: writes rules on the node that route Service traffic to Pods'),
    runtime: tr('コンテナランタイム: 実際にコンテナを動かす（containerd など）', 'container runtime: actually runs the containers (e.g. containerd)'),
    pod: tr('Pod: コンテナを動かす最小単位。ノードの上で動く', 'Pod: the smallest unit that runs containers, placed on a node'),
  };

  const on = (id: ArchId) => active === id;
  const dim = (id: ArchId) => active !== null && active !== id;
  const tone = 'var(--accent)';

  // Control plane geometry
  const API = { x: 220, y: 122, w: 170, h: 56 };
  const RIGHT_X = 560;
  const RIGHT_W = 300;
  const RIGHT = [
    { id: 'etcd' as const, y: 84, label: 'etcd', sub: tr('状態の保存先', 'state store') },
    { id: 'sched' as const, y: 132, label: 'kube-scheduler', sub: tr('配置を決める', 'placement') },
    { id: 'cm' as const, y: 180, label: 'kube-controller-manager', sub: tr('調整ループ', 'control loops') },
  ];
  const RH = 40;

  return (
    <DiagramFrame
      height={380}
      caption={tr(
        '部品どうしは直接話さず、すべて API server を通して状態を読み書きする',
        'Components never talk to each other directly; they all read and write state through the API server',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 900 470"
        width="100%"
        role="img"
        aria-label={tr(
          'コントロールプレーン（API server、etcd、scheduler、controller-manager）と、kubelet・kube-proxy・ランタイム・Pod を持つ 2 台のノードの構成図',
          'Control plane (API server, etcd, scheduler, controller-manager) and two worker nodes with kubelet, kube-proxy, runtime and Pods',
        )}
      >
        <defs>
          <ArrowMarker id="k8a-arrow" />
        </defs>

        {/* status strip */}
        <rect x={20} y={14} width={860} height={36} rx={10} fill="var(--bg-elevated)" fillOpacity={0.6} stroke="var(--border)" />
        <text x={40} y={37} fontSize={12.5} fill={active ? 'var(--text)' : 'var(--text-muted)'}>
          {active ? desc[active] : tr('コントロールプレーンが決め、ノードが動かす', 'The control plane decides; the nodes run')}
        </text>

        {/* kubectl */}
        <Box x={30} y={API.y} w={120} h={API.h} label="kubectl" sub={tr('利用者', 'user')} dimmed={active !== null} />
        <line x1={150} y1={150} x2={API.x - 2} y2={150} stroke="var(--text-dim)" strokeWidth={1.5} markerEnd="url(#k8a-arrow)" />

        {/* control plane */}
        <Group x={190} y={66} w={680} h={170} label={tr('コントロールプレーン', 'Control plane')} />
        <Box {...API} label="kube-apiserver" sub={tr('唯一の窓口', 'the only front door')} on={on('api')} dimmed={dim('api')} />
        {RIGHT.map((r) => (
          <g key={r.id}>
            <line
              x1={API.x + API.w}
              y1={150}
              x2={RIGHT_X - 2}
              y2={r.y + RH / 2}
              stroke="var(--text-dim)"
              strokeWidth={1.5}
              markerStart={r.id === 'etcd' ? undefined : 'url(#k8a-arrow)'}
              markerEnd={r.id === 'etcd' ? 'url(#k8a-arrow)' : undefined}
              opacity={0.7}
            />
            <g opacity={dim(r.id) ? 0.3 : 1} style={{ transition: 'opacity 300ms' }}>
              <rect
                x={RIGHT_X}
                y={r.y}
                width={RIGHT_W}
                height={RH}
                rx={10}
                fill={on(r.id) ? 'var(--accent-soft)' : 'var(--surface)'}
                stroke={on(r.id) ? tone : 'var(--border-strong)'}
                strokeWidth={on(r.id) ? 1.75 : 1.25}
                style={{ transition: 'fill 300ms, stroke 300ms' }}
              />
              <text x={RIGHT_X + 16} y={r.y + 25} fill="var(--text)" fontSize={13} fontWeight={600} fontFamily={MONO}>
                {r.label}
              </text>
              <text x={RIGHT_X + RIGHT_W - 16} y={r.y + 25} textAnchor="end" fill="var(--text-dim)" fontSize={11}>
                {r.sub}
              </text>
            </g>
          </g>
        ))}

        {/* nodes */}
        {NODES.map((nx, i) => {
          const kubeletX = nx + 14;
          return (
            <g key={nx}>
              <line
                x1={API.x + API.w / 2}
                y1={API.y + API.h}
                x2={kubeletX + 48}
                y2={NODE_Y + 34}
                stroke="var(--text-dim)"
                strokeWidth={1.5}
                markerStart="url(#k8a-arrow)"
                opacity={0.7}
              />
              <rect x={nx} y={NODE_Y} width={NODE_W} height={180} rx={14} fill="var(--bg-panel)" stroke="var(--border-strong)" strokeDasharray="5 5" />
              <text x={nx + 14} y={NODE_Y + 20} fill="var(--text-dim)" fontSize={11.5} fontWeight={500}>
                {tr(`ワーカーノード ${i + 1}`, `Worker node ${i + 1}`)}
              </text>
              <Box x={kubeletX} y={NODE_Y + 34} w={96} h={40} label="kubelet" on={on('kubelet')} dimmed={dim('kubelet')} />
              <Box x={nx + 117} y={NODE_Y + 34} w={96} h={40} label="kube-proxy" on={on('proxy')} dimmed={dim('proxy')} />
              <Box x={nx + 220} y={NODE_Y + 34} w={96} h={40} label="runtime" on={on('runtime')} dimmed={dim('runtime')} />
              {/* kubelet → runtime (CRI) */}
              <path
                d={`M ${kubeletX + 48} ${NODE_Y + 74} V ${NODE_Y + 88} H ${nx + 268} V ${NODE_Y + 76}`}
                fill="none"
                stroke="var(--text-dim)"
                strokeWidth={1.25}
                markerEnd="url(#k8a-arrow)"
                opacity={0.6}
              />
              <text x={nx + 165} y={NODE_Y + 100} textAnchor="middle" fill="var(--text-dim)" fontSize={10} fontFamily={MONO}>
                CRI
              </text>
              {[0, 1, 2].map((p) => (
                <Box
                  key={p}
                  x={nx + 14 + p * 103}
                  y={NODE_Y + 120}
                  w={96}
                  h={44}
                  label="Pod"
                  sub={i === 0 ? ['web', 'web', 'api'][p] : ['web', 'api', 'db'][p]}
                  on={on('pod')}
                  tone="var(--green)"
                  soft="var(--green-soft)"
                  dimmed={dim('pod')}
                />
              ))}
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) K8sPodLifecycle
// ============================================================================
type Lane = 'kubectl' | 'api' | 'etcd' | 'cm' | 'sched' | 'kubelet' | 'runtime';
const LANES: Lane[] = ['kubectl', 'api', 'etcd', 'cm', 'sched', 'kubelet', 'runtime'];
const LANE_X: Record<Lane, number> = {
  kubectl: 60, api: 190, etcd: 315, cm: 440, sched: 570, kubelet: 705, runtime: 835,
};
const SEQ_TOP = 92;
const SEQ_ROW = 36;

export function K8sPodLifecycle() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(0);

  const steps: { from: Lane; to: Lane; label: string; watch?: boolean }[] = [
    { from: 'kubectl', to: 'api', label: tr('Deployment を送信', 'apply Deployment') },
    { from: 'api', to: 'etcd', label: tr('保存', 'persist') },
    { from: 'api', to: 'cm', label: tr('通知: Deployment 追加', 'watch: new Deployment'), watch: true },
    { from: 'cm', to: 'api', label: tr('Pod を作成（ノード未定）', 'create Pod (no node)') },
    { from: 'api', to: 'sched', label: tr('通知: 未配置の Pod', 'watch: unscheduled Pod'), watch: true },
    { from: 'sched', to: 'api', label: tr('node-1 に割り当て', 'bind to node-1') },
    { from: 'api', to: 'kubelet', label: tr('通知: node-1 の Pod', 'watch: Pod on node-1'), watch: true },
    { from: 'kubelet', to: 'runtime', label: tr('コンテナ起動', 'start containers') },
    { from: 'kubelet', to: 'api', label: tr('状態: Running', 'status: Running') },
  ];
  // Two extra ticks at the end hold the finished picture before looping.
  const tick = useTicker(steps.length + 3, 1300, reduced, play);
  const shown = reduced ? steps.length : Math.min(tick + 1, steps.length);
  const current = reduced ? -1 : tick < steps.length ? tick : -1;

  const laneName: Record<Lane, [string, string]> = {
    kubectl: ['kubectl', ''],
    api: ['apiserver', ''],
    etcd: ['etcd', ''],
    cm: ['controller', 'manager'],
    sched: ['scheduler', ''],
    kubelet: ['kubelet', 'node-1'],
    runtime: ['runtime', 'node-1'],
  };
  const bottom = SEQ_TOP + steps.length * SEQ_ROW + 6;

  return (
    <DiagramFrame
      height={400}
      onReplay={() => setPlay((p) => p + 1)}
      caption={tr(
        '各部品は API server を「watch」して、自分の担当の変化だけに反応する。点線は通知',
        'Each component watches the API server and reacts only to changes it owns. Dashed lines are watch notifications',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 900 440"
        width="100%"
        role="img"
        aria-label={tr(
          'kubectl apply から Pod が Running になるまでの、API server を中心としたメッセージの流れ',
          'Message sequence from kubectl apply until the Pod is Running, all passing through the API server',
        )}
      >
        <defs>
          <ArrowMarker id="k8l-arrow" />
          <ArrowMarker id="k8l-arrow-on" color="var(--accent)" />
        </defs>

        {/* lane headers + lifelines */}
        {LANES.map((l) => {
          const x = LANE_X[l];
          const [a, b] = laneName[l];
          const isApi = l === 'api';
          return (
            <g key={l}>
              <rect
                x={x - 54}
                y={20}
                width={108}
                height={44}
                rx={10}
                fill={isApi ? 'var(--accent-soft)' : 'var(--surface)'}
                stroke={isApi ? 'var(--accent)' : 'var(--border-strong)'}
                strokeWidth={1.25}
              />
              <text x={x} y={b ? 39 : 47} textAnchor="middle" fill="var(--text)" fontSize={12.5} fontWeight={600} fontFamily={MONO}>
                {a}
              </text>
              {b && (
                <text x={x} y={54} textAnchor="middle" fill="var(--text-dim)" fontSize={10.5} fontFamily={MONO}>
                  {b}
                </text>
              )}
              <line x1={x} y1={66} x2={x} y2={bottom} stroke="var(--border)" strokeWidth={1.25} strokeDasharray="3 4" />
            </g>
          );
        })}

        {/* messages */}
        {steps.slice(0, shown).map((s, i) => {
          const y = SEQ_TOP + i * SEQ_ROW + 14;
          const x1 = LANE_X[s.from];
          const x2 = LANE_X[s.to];
          const dir = x2 > x1 ? 1 : -1;
          const isOn = i === current;
          const color = isOn ? 'var(--accent)' : 'var(--text-dim)';
          const mid = (x1 + x2) / 2;
          const textW = [...s.label].reduce((w, c) => w + (c.charCodeAt(0) > 0x2000 ? 11.5 : 7), 0);
          const labelW = Math.min(Math.abs(x2 - x1) - 20, textW + 14);
          return (
            <g key={i} opacity={isOn || current === -1 ? 1 : 0.55} style={{ transition: 'opacity 300ms' }}>
              <text x={14} y={y + 4} fill="var(--text-dim)" fontSize={10.5} fontFamily={MONO}>
                {String(i + 1).padStart(2, '0')}
              </text>
              <line
                x1={x1 + dir * 4}
                y1={y}
                x2={x2 - dir * 6}
                y2={y}
                stroke={color}
                strokeWidth={isOn ? 2 : 1.5}
                strokeDasharray={s.watch ? '5 4' : undefined}
                markerEnd={isOn ? 'url(#k8l-arrow-on)' : 'url(#k8l-arrow)'}
              />
              <rect x={mid - labelW / 2} y={y - 21} width={labelW} height={16} rx={4} fill="var(--bg-panel)" />
              <text x={mid} y={y - 9} textAnchor="middle" fill={isOn ? 'var(--text)' : 'var(--text-muted)'} fontSize={11.5} fontWeight={isOn ? 600 : 400}>
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 3) K8sReconcile
// ============================================================================
const REC_TOTAL = 18;

type PodState = 'running' | 'failed' | 'gone' | 'pending';

export function K8sReconcile() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const tick = useTicker(REC_TOTAL, 700, reduced);
  // Reduced motion: the moment the controller has just spotted the gap.
  const t = reduced ? 8 : tick;

  const podB: PodState = t < 4 ? 'running' : t < 6 ? 'failed' : 'gone';
  const podD: PodState | null = t < 10 ? null : t < 13 ? 'pending' : 'running';
  const pods: { name: string; state: PodState }[] = [
    { name: 'web-a', state: 'running' },
    { name: 'web-b', state: podB },
    { name: 'web-c', state: 'running' },
  ];
  const current = 2 + (podB === 'running' ? 1 : 0) + (podD === 'running' ? 1 : 0);

  // Which step of the loop is active: observe / compare / act.
  const step = t >= 6 && t < 8 ? 0 : t >= 8 && t < 10 ? 1 : t >= 10 && t < 13 ? 2 : -1;
  const loopSteps = [
    { title: tr('観察', 'Observe'), sub: tr('今の Pod を数える', 'count Pods now') },
    { title: tr('比較', 'Compare'), sub: tr('望ましい数と比べる', 'diff with desired') },
    { title: tr('調整', 'Act'), sub: tr('足りない分を作る', 'create the missing') },
  ];

  const status =
    t < 4 ? tr('定常状態: 望ましい 3 = 現在 3', 'Steady: desired 3 = current 3') :
      t < 6 ? tr('web-b が落ちた（ノード障害やプロセスの異常終了）', 'web-b failed (node failure or crash)') :
        t < 10 ? tr('ズレを検知: 望ましい 3 ≠ 現在 2', 'Gap detected: desired 3 ≠ current 2') :
          t < 13 ? tr('新しい Pod web-d を作成。スケジューラが配置し kubelet が起動中', 'Created web-d; scheduler places it, kubelet starts it') :
            tr('元に戻った: 望ましい 3 = 現在 3', 'Back to steady: desired 3 = current 3');
  const mismatch = current !== 3;

  const POD_W = 112;
  const POD_H = 52;
  const POD_Y = 96;
  const POD_X0 = 470;
  const podTone = (s: PodState) =>
    s === 'running' ? { tone: 'var(--green)', soft: 'var(--green-soft)' } :
      s === 'failed' ? { tone: 'var(--red)', soft: 'var(--red-soft)' } :
        { tone: 'var(--amber)', soft: 'var(--amber-soft)' };
  const podLabel = (s: PodState) =>
    s === 'running' ? 'Running' : s === 'failed' ? 'Failed' : 'Pending';

  const slot = (i: number) => POD_X0 + i * (POD_W + 18);
  const LOOP_W = 170;
  const LOOP_GAP = 40;
  const LOOP_X0 = (860 - (3 * LOOP_W + 2 * LOOP_GAP)) / 2;
  const LOOP_Y = 206;
  const LOOP_H = 54;

  return (
    <DiagramFrame
      height={300}
      caption={tr(
        'コントローラは「何が起きたか」ではなく「今どうなっているか」を見て、ズレがなくなるまで直し続ける',
        'A controller looks at what the state is now, not at what happened, and keeps fixing until the gap is gone',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 860 330"
        width="100%"
        role="img"
        aria-label={tr(
          'replicas 3 の ReplicaSet で Pod が 1 つ落ち、コントローラが差分を検知して新しい Pod を作り直す調整ループ',
          'A ReplicaSet with 3 replicas loses a Pod; the controller detects the gap and creates a replacement',
        )}
      >
        {/* status strip */}
        <rect x={20} y={14} width={820} height={36} rx={10} fill="var(--bg-elevated)" fillOpacity={0.6} stroke="var(--border)" />
        <text x={40} y={37} fontSize={12.5} fill={mismatch ? 'var(--amber)' : 'var(--text-muted)'}>
          {status}
        </text>

        {/* desired / current */}
        <g>
          <rect x={30} y={POD_Y} width={170} height={POD_H} rx={10} fill="var(--surface)" stroke="var(--border-strong)" />
          <text x={46} y={POD_Y + 21} fill="var(--text-dim)" fontSize={11}>{tr('望ましい状態', 'Desired')}</text>
          <text x={46} y={POD_Y + 41} fill="var(--text)" fontSize={13} fontFamily={MONO} fontWeight={600}>replicas: 3</text>
        </g>
        <g>
          <rect
            x={220}
            y={POD_Y}
            width={170}
            height={POD_H}
            rx={10}
            fill={mismatch ? 'var(--amber-soft)' : 'var(--surface)'}
            stroke={mismatch ? 'var(--amber)' : 'var(--border-strong)'}
            style={{ transition: 'fill 300ms, stroke 300ms' }}
          />
          <text x={236} y={POD_Y + 21} fill="var(--text-dim)" fontSize={11}>{tr('現在の状態', 'Current')}</text>
          <text x={236} y={POD_Y + 41} fill={mismatch ? 'var(--amber)' : 'var(--text)'} fontSize={13} fontFamily={MONO} fontWeight={600}>
            {tr(`Running: ${current}`, `running: ${current}`)}
          </text>
        </g>
        <text x={210} y={POD_Y + 31} textAnchor="middle" fill={mismatch ? 'var(--amber)' : 'var(--text-dim)'} fontSize={14} fontFamily={MONO}>
          {mismatch ? '≠' : '='}
        </text>
        <line x1={410} y1={POD_Y + POD_H / 2} x2={450} y2={POD_Y + POD_H / 2} stroke="var(--border-strong)" strokeDasharray="3 4" />

        {/* pods */}
        {pods.map((p, i) => {
          const x = slot(i);
          if (p.state === 'gone') {
            if (podD) {
              const { tone, soft } = podTone(podD);
              return (
                <g key="web-d">
                  <rect x={x} y={POD_Y} width={POD_W} height={POD_H} rx={10} fill={soft} stroke={tone} strokeWidth={1.5} style={{ transition: 'fill 300ms, stroke 300ms' }} />
                  <text x={x + POD_W / 2} y={POD_Y + 22} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={600} fontFamily={MONO}>web-d</text>
                  <text x={x + POD_W / 2} y={POD_Y + 40} textAnchor="middle" fill={tone} fontSize={11} fontFamily={MONO}>{podLabel(podD)}</text>
                </g>
              );
            }
            return (
              <rect key="empty" x={x} y={POD_Y} width={POD_W} height={POD_H} rx={10} fill="none" stroke="var(--border-strong)" strokeDasharray="4 4" />
            );
          }
          const { tone, soft } = podTone(p.state);
          return (
            <g key={p.name}>
              <rect x={x} y={POD_Y} width={POD_W} height={POD_H} rx={10} fill={soft} stroke={tone} strokeWidth={1.5} style={{ transition: 'fill 300ms, stroke 300ms' }} />
              <text x={x + POD_W / 2} y={POD_Y + 22} textAnchor="middle" fill="var(--text)" fontSize={13} fontWeight={600} fontFamily={MONO}>{p.name}</text>
              <text x={x + POD_W / 2} y={POD_Y + 40} textAnchor="middle" fill={tone} fontSize={11} fontFamily={MONO}>{podLabel(p.state)}</text>
            </g>
          );
        })}

        {/* the loop */}
        <text x={30} y={LOOP_Y - 14} fill="var(--text-dim)" fontSize={11.5}>
          {tr('ReplicaSet コントローラの調整ループ', 'ReplicaSet controller reconcile loop')}
        </text>
        {loopSteps.map((s, i) => {
          const x = LOOP_X0 + i * (LOOP_W + LOOP_GAP);
          const isOn = step === i;
          return (
            <g key={i}>
              <rect
                x={x}
                y={LOOP_Y}
                width={LOOP_W}
                height={LOOP_H}
                rx={12}
                fill={isOn ? 'var(--accent-soft)' : 'var(--surface)'}
                stroke={isOn ? 'var(--accent)' : 'var(--border-strong)'}
                strokeWidth={1.5}
                style={{ transition: reduced ? 'none' : 'fill 0.3s, stroke 0.3s' }}
              />
              <text x={x + LOOP_W / 2} y={LOOP_Y + 23} textAnchor="middle" fontSize={14} fontWeight={700} fill="var(--text)">{s.title}</text>
              <text x={x + LOOP_W / 2} y={LOOP_Y + 41} textAnchor="middle" fontSize={11.5} fill="var(--text-muted)">{s.sub}</text>
              {i < 2 && (
                <g stroke="var(--border-strong)" strokeWidth={1.5} fill="none">
                  <line x1={x + LOOP_W + 4} y1={LOOP_Y + LOOP_H / 2} x2={x + LOOP_W + LOOP_GAP - 5} y2={LOOP_Y + LOOP_H / 2} />
                  <path d={`M${x + LOOP_W + LOOP_GAP - 11} ${LOOP_Y + LOOP_H / 2 - 5} L${x + LOOP_W + LOOP_GAP - 5} ${LOOP_Y + LOOP_H / 2} L${x + LOOP_W + LOOP_GAP - 11} ${LOOP_Y + LOOP_H / 2 + 5}`} />
                </g>
              )}
            </g>
          );
        })}
        {/* loop back */}
        {(() => {
          const xa = LOOP_X0 + 2 * (LOOP_W + LOOP_GAP) + LOOP_W / 2;
          const xb = LOOP_X0 + LOOP_W / 2;
          const yb = LOOP_Y + LOOP_H;
          return (
            <g stroke="var(--border-strong)" strokeWidth={1.5} fill="none">
              <path d={`M${xa} ${yb + 2} V ${yb + 26} H ${xb} V ${yb + 6}`} strokeDasharray="5 4" />
              <path d={`M${xb - 5} ${yb + 12} L${xb} ${yb + 5} L${xb + 5} ${yb + 12}`} />
            </g>
          );
        })()}
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 4) K8sService
// ============================================================================
const SVC_TOTAL = 16;
const SVC = { x: 300, y: 112, w: 210, h: 104 };
const CLIENT = { x: 30, y: 134, w: 150, h: 60 };
const SVC_POD = { x: 660, w: 210, h: 54 };
const SVC_POD_Y = [44, 137, 230];
const MID_Y = SVC.y + SVC.h / 2;

export function K8sService() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const tick = useTicker(SVC_TOTAL, 900, reduced);
  const t = reduced ? 2 : tick;

  // Slot 2 holds web-c until it is terminated, then web-d with a new IP.
  const slot2 =
    t < 6 ? { name: 'web-c', ip: '10.244.1.9', state: 'ready' as const } :
      t < 9 ? { name: 'web-c', ip: '10.244.1.9', state: 'terminating' as const } :
        t < 11 ? { name: 'web-d', ip: '10.244.2.3', state: 'starting' as const } :
          { name: 'web-d', ip: '10.244.2.3', state: 'ready' as const };
  const pods = [
    { name: 'web-a', ip: '10.244.1.5', state: 'ready' as const },
    { name: 'web-b', ip: '10.244.2.8', state: 'ready' as const },
    slot2,
  ];
  const readyIdx = pods.map((p, i) => (p.state === 'ready' ? i : -1)).filter((i) => i >= 0);
  const target = readyIdx[t % readyIdx.length];
  const endpoints = readyIdx.map((i) => pods[i].ip).join(', ');

  const tone = (s: 'ready' | 'terminating' | 'starting') =>
    s === 'ready' ? { tone: 'var(--green)', soft: 'var(--green-soft)', label: 'Ready' } :
      s === 'terminating' ? { tone: 'var(--red)', soft: 'var(--red-soft)', label: 'Terminating' } :
        { tone: 'var(--amber)', soft: 'var(--amber-soft)', label: tr('起動中', 'Starting') };

  const podMidY = (i: number) => SVC_POD_Y[i] + SVC_POD.h / 2;
  const path = (i: number) =>
    `M ${CLIENT.x + CLIENT.w} ${MID_Y} L ${SVC.x + SVC.w} ${MID_Y} L ${SVC_POD.x} ${podMidY(i)}`;

  return (
    <DiagramFrame
      height={320}
      caption={tr(
        'Pod は作り直されると IP が変わる。Service はラベルで Pod を選び、Ready な Pod だけに振り分ける',
        'A replaced Pod gets a new IP. A Service selects Pods by label and sends traffic only to Ready ones',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 900 350"
        width="100%"
        role="img"
        aria-label={tr(
          'frontend からの通信を Service web が 3 つの Pod に振り分け、Pod が入れ替わってもエンドポイントが自動で更新される図',
          'Service web load-balances frontend traffic across three Pods; when a Pod is replaced its endpoints update automatically',
        )}
      >
        <defs>
          <ArrowMarker id="k8s-arrow" />
        </defs>

        {/* client */}
        <Box {...CLIENT} label="frontend" sub="Pod" />
        <line x1={CLIENT.x + CLIENT.w} y1={MID_Y} x2={SVC.x - 2} y2={MID_Y} stroke="var(--text-dim)" strokeWidth={1.5} markerEnd="url(#k8s-arrow)" opacity={0.7} />
        <text x={(CLIENT.x + CLIENT.w + SVC.x) / 2} y={MID_Y - 10} textAnchor="middle" fill="var(--text-dim)" fontSize={10.5} fontFamily={MONO}>
          http://web
        </text>

        {/* service */}
        <rect x={SVC.x} y={SVC.y} width={SVC.w} height={SVC.h} rx={12} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={1.5} />
        <text x={SVC.x + 16} y={SVC.y + 26} fill="var(--text)" fontSize={14} fontWeight={700} fontFamily={MONO}>Service: web</text>
        <text x={SVC.x + 16} y={SVC.y + 50} fill="var(--text-muted)" fontSize={11.5} fontFamily={MONO}>ClusterIP 10.96.0.12</text>
        <text x={SVC.x + 16} y={SVC.y + 70} fill="var(--text-muted)" fontSize={11.5} fontFamily={MONO}>selector: app=web</text>
        <text x={SVC.x + 16} y={SVC.y + 90} fill="var(--text-dim)" fontSize={11}>{tr('名前と IP は変わらない', 'stable name and IP')}</text>

        {/* service → pods */}
        {pods.map((p, i) => (
          <line
            key={i}
            x1={SVC.x + SVC.w}
            y1={MID_Y}
            x2={SVC_POD.x - 2}
            y2={podMidY(i)}
            stroke="var(--text-dim)"
            strokeWidth={1.5}
            strokeDasharray={p.state === 'ready' ? undefined : '4 5'}
            markerEnd="url(#k8s-arrow)"
            opacity={p.state === 'ready' ? 0.7 : 0.3}
          />
        ))}

        {/* pods */}
        {pods.map((p, i) => {
          const s = tone(p.state);
          const y = SVC_POD_Y[i];
          return (
            <g key={`${i}-${p.name}`}>
              <rect x={SVC_POD.x} y={y} width={SVC_POD.w} height={SVC_POD.h} rx={10} fill={s.soft} stroke={s.tone} strokeWidth={1.5} style={{ transition: 'fill 300ms, stroke 300ms' }} />
              <text x={SVC_POD.x + 14} y={y + 22} fill="var(--text)" fontSize={13} fontWeight={600} fontFamily={MONO}>{p.name}</text>
              <text x={SVC_POD.x + SVC_POD.w - 14} y={y + 22} textAnchor="end" fill={s.tone} fontSize={11} fontFamily={MONO}>{s.label}</text>
              <text x={SVC_POD.x + 14} y={y + 41} fill="var(--text-dim)" fontSize={11} fontFamily={MONO}>{`${p.ip} · app=web`}</text>
            </g>
          );
        })}

        {/* endpoints */}
        <text x={SVC.x} y={SVC.y + SVC.h + 34} fill="var(--text-dim)" fontSize={11}>
          {tr('エンドポイント（Ready な Pod の IP）', 'Endpoints (IPs of Ready Pods)')}
        </text>
        <text x={SVC.x} y={SVC.y + SVC.h + 54} fill="var(--text)" fontSize={11.5} fontFamily={MONO}>
          {endpoints}
        </text>

        {/* packet */}
        {!reduced && <OneShotPacket key={t} d={path(target)} color="var(--accent)" dur={0.85} />}
      </svg>
    </DiagramFrame>
  );
}

