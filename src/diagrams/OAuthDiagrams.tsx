// OAuth 2.0 / OpenID Connect diagrams.
//  - OAuthCodeFlow: the authorization code flow as a sequence diagram that
//                   plays step by step. Front-channel hops (through the
//                   browser) are dashed amber; back-channel calls are solid.
//  - OAuthPkce:     an attacker steals the authorization code. Without PKCE the
//                   token is issued; with PKCE the missing code_verifier gets
//                   the request rejected.
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

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button className={active ? 'btn' : 'btn btn--ghost'} aria-pressed={active} onClick={onClick}>
      {label}
    </button>
  );
}

// Plays steps 0..max on mount, on replay and whenever `deps` change.
function useSteps(max: number, intervalMs: number, reduced: boolean, deps: unknown[]) {
  const [step, setStep] = useState(max);
  useEffect(() => {
    if (reduced) {
      setStep(max);
      return;
    }
    setStep(0);
    const ids = Array.from({ length: max }, (_, i) => setTimeout(() => setStep(i + 1), (i + 1) * intervalMs));
    return () => ids.forEach(clearTimeout);
  }, [reduced, ...deps]);
  return step;
}

function Arrow({
  x1, y1, x2, y2, color, dashed,
}: {
  x1: number; y1: number; x2: number; y2: number; color: string; dashed?: boolean;
}) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const hx = (a: number) => x2 - 10 * Math.cos(ang + a);
  const hy = (a: number) => y2 - 10 * Math.sin(ang + a);
  return (
    <g stroke={color} strokeWidth={1.75} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={dashed ? '6 5' : undefined} />
      <path d={`M${hx(0.45)} ${hy(0.45)} L${x2} ${y2} L${hx(-0.45)} ${hy(-0.45)}`} />
    </g>
  );
}

// ============================================================================
// 1) OAuthCodeFlow
// ============================================================================
const X_BROWSER = 100;
const X_APP = 300;
const X_AUTH = 520;
const X_API = 720;

const FRONT = 'var(--amber)';
const BACK = 'var(--accent)';

interface Msg {
  from: number;
  to: number;
  y: number;
  label: [string, string];
  sub?: string;
  front: boolean;
}

export function OAuthCodeFlow() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [play, setPlay] = useState(0);
  const step = useSteps(9, 750, reduced, [play]);

  const msgs: Msg[] = [
    { from: X_APP, to: X_BROWSER, y: 112, label: ['① 認可サーバーへ', '① redirect'], front: true },
    { from: X_BROWSER, to: X_AUTH, y: 160, label: ['② 認可リクエスト', '② authorization request'], sub: 'scope  state  code_challenge', front: true },
    // ③ is the login/consent box, drawn separately
    { from: X_AUTH, to: X_BROWSER, y: 258, label: ['④ 認可コード', '④ authorization code'], sub: 'code  state', front: true },
    { from: X_BROWSER, to: X_APP, y: 306, label: ['⑤ コールバック', '⑤ callback'], front: true },
    { from: X_APP, to: X_AUTH, y: 354, label: ['⑥ コードを交換', '⑥ exchange code'], sub: 'code + code_verifier', front: false },
    { from: X_AUTH, to: X_APP, y: 406, label: ['⑦ トークンを返す', '⑦ tokens'], sub: 'access + ID token', front: false },
    { from: X_APP, to: X_API, y: 454, label: ['⑧ API を呼ぶ', '⑧ call the API'], sub: 'Bearer <access token>', front: false },
    { from: X_API, to: X_APP, y: 506, label: ['⑨ データ', '⑨ data'], front: false },
  ];
  // step index at which each message appears (③ box is step 3)
  const msgStep = [1, 2, 4, 5, 6, 7, 8, 9];

  const vis = (s: number) => ({
    opacity: step >= s ? 1 : 0,
    transition: reduced ? 'none' : 'opacity 0.35s ease',
  });

  const actors = [
    { x: X_BROWSER, label: tr('ブラウザ', 'Browser'), sub: tr('ユーザー', 'user') },
    { x: X_APP, label: tr('アプリ', 'App'), sub: tr('クライアント', 'client') },
    { x: X_AUTH, label: tr('認可サーバー', 'Auth server'), sub: tr('Google など', 'e.g. Google') },
    { x: X_API, label: 'API', sub: tr('リソース', 'resource') },
  ];

  return (
    <DiagramFrame
      height={460}
      onReplay={() => setPlay((p) => p + 1)}
      caption={tr(
        'ブラウザを通る通信（破線）ではコードだけを渡し、トークンは裏側の通信（実線）で受け取る',
        'Only a short-lived code travels through the browser (dashed); tokens come back over the back channel (solid)',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 580"
        width="100%"
        role="img"
        aria-label={tr(
          'OAuth 2.0 認可コードフロー。ブラウザ経由で認可コードを受け取り、アプリが裏側の通信でトークンに交換して API を呼ぶ',
          'OAuth 2.0 authorization code flow: the code arrives via the browser, the app exchanges it for tokens over the back channel, then calls the API',
        )}
      >
        {/* actors + lifelines */}
        {actors.map((a) => (
          <g key={a.x}>
            <rect x={a.x - 78} y={14} width={156} height={54} rx={10} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.5} />
            <text x={a.x} y={38} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--text)">{a.label}</text>
            <text x={a.x} y={57} textAnchor="middle" fontSize={12} fill="var(--text-dim)">{a.sub}</text>
            <line x1={a.x} y1={68} x2={a.x} y2={522} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="3 5" />
          </g>
        ))}

        {/* messages */}
        {msgs.map((m, i) => {
          const color = m.front ? FRONT : BACK;
          const mid = (m.from + m.to) / 2;
          return (
            <g key={i} style={vis(msgStep[i])}>
              <Arrow x1={m.from} y1={m.y} x2={m.to} y2={m.y} color={color} dashed={m.front} />
              <text x={mid} y={m.y - 9} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--text)">
                {tr(m.label[0], m.label[1])}
              </text>
              {m.sub && (
                <text x={mid} y={m.y + 19} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="var(--text-muted)">
                  {m.sub}
                </text>
              )}
            </g>
          );
        })}

        {/* ③ login + consent at the auth server */}
        <g style={vis(3)}>
          <rect x={X_AUTH - 92} y={192} width={184} height={44} rx={9} fill="var(--accent-soft)" stroke="var(--accent)" />
          <text x={X_AUTH} y={212} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--text)">
            {tr('③ ログインと同意', '③ log in + consent')}
          </text>
          <text x={X_AUTH} y={228} textAnchor="middle" fontSize={11.5} fill="var(--text-muted)">
            {tr('パスワードはアプリに渡らない', 'the app never sees the password')}
          </text>
        </g>

        {/* legend */}
        <g transform="translate(40 552)">
          <line x1={0} y1={0} x2={40} y2={0} stroke={FRONT} strokeWidth={1.75} strokeDasharray="6 5" />
          <text x={50} y={4} fontSize={12.5} fill="var(--text-muted)">{tr('ブラウザ経由（フロントチャネル）', 'via the browser (front channel)')}</text>
          <line x1={330} y1={0} x2={370} y2={0} stroke={BACK} strokeWidth={1.75} />
          <text x={380} y={4} fontSize={12.5} fill="var(--text-muted)">{tr('サーバー同士（バックチャネル）', 'server to server (back channel)')}</text>
        </g>
      </svg>
    </DiagramFrame>
  );
}

// ============================================================================
// 2) OAuthPkce
// ============================================================================
export function OAuthPkce() {
  const tr = useTr();
  const reduced = useReducedMotion();
  const [pkce, setPkce] = useState(true);
  const [play, setPlay] = useState(0);
  const step = useSteps(4, 850, reduced, [play, pkce]);

  const vis = (s: number) => ({
    opacity: step >= s ? 1 : 0,
    transition: reduced ? 'none' : 'opacity 0.4s ease',
  });

  const AUTH_X = 580;
  const AUTH_W = 200;
  const AUTH_CX = AUTH_X + AUTH_W / 2;

  return (
    <DiagramFrame
      height={380}
      onReplay={() => setPlay((p) => p + 1)}
      controls={
        <>
          <ToggleButton active={!pkce} onClick={() => setPkce(false)} label={tr('PKCE なし', 'Without PKCE')} />
          <ToggleButton active={pkce} onClick={() => setPkce(true)} label={tr('PKCE あり', 'With PKCE')} />
        </>
      }
      caption={tr(
        'PKCE では、コードを盗まれても、アプリだけが持つ code_verifier がなければトークンに交換できない',
        'With PKCE a stolen code is useless: exchanging it requires the code_verifier only the real app holds',
      )}
    >
      <svg
        className="hero-net"
        viewBox="0 0 820 420"
        width="100%"
        role="img"
        aria-label={tr(
          '攻撃者が認可コードを盗み見てトークンを要求する。PKCE なしでは発行され、PKCE ありでは code_verifier がないため拒否される',
          'An attacker steals the authorization code and requests a token. Without PKCE it is issued; with PKCE it is rejected for lacking the code_verifier',
        )}
      >
        {/* actors */}
        <rect x={40} y={36} width={200} height={60} rx={10} fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.5} />
        <text x={140} y={72} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--text)">{tr('正規のアプリ', 'Real app')}</text>

        <rect x={40} y={262} width={200} height={60} rx={10} fill="var(--red-soft)" stroke="var(--red)" strokeWidth={1.5} />
        <text x={140} y={298} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--red)">{tr('攻撃者', 'Attacker')}</text>

        <rect x={AUTH_X} y={36} width={AUTH_W} height={286} rx={10} fill="var(--surface)" stroke="var(--border-strong)" strokeWidth={1.5} />
        <text x={AUTH_CX} y={64} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--text)">{tr('認可サーバー', 'Auth server')}</text>

        {/* the verifier stays with the real app */}
        {pkce && (
          <g>
            <rect x={40} y={110} width={200} height={30} rx={7} fill="var(--accent-soft)" />
            <text x={140} y={130} textAnchor="middle" fontSize={12.5} fill="var(--text)">
              <tspan fontFamily={MONO} fontWeight={600}>code_verifier</tspan>
              <tspan>{tr(' は手元だけ', ' stays here')}</tspan>
            </text>
          </g>
        )}

        {/* ① request (with challenge) */}
        <g style={vis(1)}>
          <Arrow x1={240} y1={58} x2={AUTH_X - 2} y2={58} color="var(--text-muted)" />
          <text x={410} y={48} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--text)">{tr('① 認可リクエスト', '① authorization request')}</text>
          {pkce && (
            <text x={410} y={78} textAnchor="middle" fontSize={12} fontFamily={MONO} fill="var(--accent)">
              code_challenge = SHA256(verifier)
            </text>
          )}
          {pkce && (
            <text x={AUTH_CX} y={94} textAnchor="middle" fontSize={11.5} fill="var(--text-muted)">
              {tr('ハッシュだけを覚える', 'remembers only the hash')}
            </text>
          )}
        </g>

        {/* ② code returned, intercepted */}
        <g style={vis(2)}>
          <Arrow x1={AUTH_X - 2} y1={168} x2={242} y2={88} color="var(--amber)" dashed />
          <text x={480} y={178} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--text)">{tr('② 認可コード', '② authorization code')}</text>
          <path d="M410 128 Q 360 230 142 260" fill="none" stroke="var(--red)" strokeWidth={1.75} strokeDasharray="4 4" />
          <text x={340} y={214} fontSize={12.5} fontWeight={600} fill="var(--red)">
            {tr('盗み見られる', 'intercepted')}
          </text>
          <text x={340} y={231} fontSize={11.5} fill="var(--text-muted)">
            {tr('（ログ、悪意あるアプリなど）', '(logs, a malicious app…)')}
          </text>
        </g>

        {/* ③ attacker exchanges the stolen code */}
        <g style={vis(3)}>
          <Arrow x1={240} y1={286} x2={AUTH_X - 2} y2={286} color="var(--red)" />
          <text x={410} y={276} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--red)">
            {tr('③ 盗んだコードで交換を要求', '③ exchanges the stolen code')}
          </text>
          <text x={410} y={306} textAnchor="middle" fontSize={12} fill="var(--text-muted)">
            {pkce ? tr('code_verifier を持っていない', 'has no code_verifier') : tr('コードさえあれば通る', 'the code alone is enough')}
          </text>
        </g>

        {/* ④ outcome */}
        <g style={vis(4)}>
          <text x={AUTH_CX} y={230} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={pkce ? 'var(--green)' : 'var(--red)'}>
            {pkce ? tr('ハッシュが合わない', 'hash does not match') : tr('確かめる手段がない', 'no way to check')}
          </text>
          <text x={AUTH_CX} y={252} textAnchor="middle" fontSize={13.5} fontWeight={700} fill={pkce ? 'var(--green)' : 'var(--red)'}>
            {pkce ? tr('→ 拒否', '→ rejected') : tr('→ トークンを発行', '→ token issued')}
          </text>
          {!pkce && <Arrow x1={AUTH_X - 2} y1={316} x2={242} y2={316} color="var(--red)" />}
          <rect x={40} y={350} width={740} height={50} rx={10} fill={pkce ? 'var(--green-soft)' : 'var(--red-soft)'} />
          <text x={410} y={381} textAnchor="middle" fontSize={14.5} fontWeight={600} fill={pkce ? 'var(--green)' : 'var(--red)'}>
            {pkce
              ? tr('コードだけでは役に立たず、攻撃者はトークンを得られない', 'The code alone is useless; the attacker gets no token')
              : tr('攻撃者がユーザーになりすまして API を呼べてしまう', 'The attacker can now call the API as the user')}
          </text>
        </g>
      </svg>
    </DiagramFrame>
  );
}
