// Content definition: topic -> section (prose + diagram)
// Text is a { ja, en } localized pair. Edit here to add more pages.

import type { LocalizedString } from '../i18n';

export type DiagramId =
  | 'fund-latency'
  | 'fund-memory'
  | 'iv-timeline'
  | 'url-basic-flow'
  | 'url-capacity'
  | 'url-key-generation'
  | 'url-key-uniqueness'
  | 'url-read-write'
  | 'url-cache-scale'
  | 'url-cache-eviction'
  | 'url-architecture'
  | 'rl-why'
  | 'rl-capacity'
  | 'rl-token-bucket'
  | 'rl-allow-deny'
  | 'rl-algorithms'
  | 'rl-distributed'
  | 'rl-placement'
  | 'rl-race'
  | 'rl-architecture'
  | 'cb-state-machine'
  | 'slo-ladder'
  | 'slo-nines'
  | 'slo-budget'
  | 'retry-storm'
  | 'retry-backoff'
  | 'db-replication'
  | 'db-replica-lag'
  | 'db-sharding'
  | 'db-consistent-hash'
  | 'sqli-concat'
  | 'sqli-placeholder'
  | 'pi-indirect'
  | 'pi-channels'
  | 'oauth-code-flow'
  | 'oauth-pkce'
  | 'chaos-loop'
  | 'chaos-experiment'
  | 'ua-timeline'
  | 'ua-cascade'
  | 'ua-dns-race'
  | 'ua-congestion';

export type Block =
  | { type: 'p'; text: LocalizedString }
  | { type: 'h'; text: LocalizedString }
  | { type: 'list'; items: LocalizedString[] }
  | { type: 'note'; tone: 'info' | 'tip' | 'warn'; text: LocalizedString }
  | { type: 'code'; code: string; label?: LocalizedString }
  | { type: 'diagram'; id: DiagramId }
  | { type: 'details'; summary: LocalizedString; blocks: Block[] };

export interface Section {
  id: string;
  title: LocalizedString;
  blocks: Block[];
}

export type CategoryId = 'system-design' | 'sre' | 'security';

export interface Category {
  id: CategoryId;
  label: LocalizedString;
}

// Display order of categories in the sidebar and on the home page.
export const categories: Category[] = [
  { id: 'system-design', label: { ja: 'システム設計', en: 'System Design' } },
  { id: 'sre', label: { ja: 'SRE（サイト信頼性）', en: 'SRE' } },
  { id: 'security', label: { ja: 'セキュリティ', en: 'Security' } },
];

export interface Topic {
  id: string;
  category: CategoryId;
  title: LocalizedString;
  tagline: LocalizedString;
  // ISO dates (YYYY-MM-DD) derived from git history, shown in the topic header.
  publishedAt: string;
  updatedAt: string;
  sections: Section[];
}

export const topics: Topic[] = [
  {
    id: 'fundamentals',
    category: 'system-design',
    publishedAt: '2026-09-30',
    updatedAt: '2026-09-30',
    title: { ja: '基礎: 時間とメモリの単位', en: 'Basics: units of time & memory' },
    tagline: {
      ja: '設計の見積もりに欠かせない、時間とデータ量の「桁の感覚」。',
      en: 'The sense of scale for time and data that every estimation relies on.',
    },
    sections: [
      {
        id: 'units-time',
        title: { ja: '時間の単位と考え方', en: 'Units of time' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'システム設計では「この操作は速いのか遅いのか」を**桁で捉える**ことが重要です。時間の単位は、1つ小さくなるごとに1000分の1になります。',
              en: 'In system design, what matters is grasping whether an operation is fast or slow **by order of magnitude**. Each smaller unit of time is 1/1000 of the previous.',
            },
          },
          {
            type: 'list',
            items: [
              { ja: '1 s（秒） = 1,000 ms（ミリ秒）', en: '1 s (second) = 1,000 ms (milliseconds)' },
              { ja: '1 ms = 1,000 μs（マイクロ秒）', en: '1 ms = 1,000 μs (microseconds)' },
              { ja: '1 μs = 1,000 ns（ナノ秒）', en: '1 μs = 1,000 ns (nanoseconds)' },
            ],
          },
          { type: 'diagram', id: 'fund-latency' },
          {
            type: 'p',
            text: {
              ja: 'ポイントは「メモリは ns、ディスクや SSD は μs、ネットワーク往復は ms」というように、**装置ごとに桁が違う**こと。同じ処理でも、メモリで済むかネットワークを越えるかで100万倍近く変わります。',
              en: 'The key insight: different layers live at **different orders of magnitude** — memory in ns, SSD/disk in μs, network round trips in ms. The same logical step can vary by nearly a million times depending on whether it stays in memory or crosses the network.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'だから設計では「メモリ(キャッシュ)で返せるか、ネットワークやディスクを越えるか」を意識します。レイテンシ予算（例: p99 < 100ms）は、これらの積み重ねで決まります。代表的な数字は [Latency Numbers Every Programmer Should Know](https://gist.github.com/jboner/2841832) や [インタラクティブ版](https://people.eecs.berkeley.edu/~rcs/research/interactive_latency.html) が定番です。',
              en: 'This is why design focuses on whether you can serve from memory (cache) versus crossing the network or disk. A latency budget (e.g. p99 < 100ms) is the sum of these costs. The classic references are [Latency Numbers Every Programmer Should Know](https://gist.github.com/jboner/2841832) and its [interactive version](https://people.eecs.berkeley.edu/~rcs/research/interactive_latency.html).',
            },
          },
        ],
      },
      {
        id: 'units-memory',
        title: { ja: 'メモリ / データ量の単位と考え方', en: 'Units of memory & data' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'データ量も時間と同じく桁で捉えます。こちらは1段上がるごとに約1000倍です。「1文字 ≈ 1バイト(B)」を出発点にすると見積もりが楽になります。',
              en: 'Data size is also about orders of magnitude — here each step up is about 1000×. Starting from "1 character ≈ 1 byte (B)" makes estimation easy.',
            },
          },
          {
            type: 'list',
            items: [
              { ja: '1 KB ≈ 1,000 B（短いテキスト）', en: '1 KB ≈ 1,000 B (a short text)' },
              { ja: '1 MB ≈ 1,000 KB（写真1枚くらい）', en: '1 MB ≈ 1,000 KB (about one photo)' },
              { ja: '1 GB ≈ 1,000 MB（映画1本くらい）', en: '1 GB ≈ 1,000 MB (about one movie)' },
              { ja: '1 TB ≈ 1,000 GB（大規模DB）', en: '1 TB ≈ 1,000 GB (a large database)' },
            ],
          },
          { type: 'diagram', id: 'fund-memory' },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '正確には「2進(1024)」と「10進(1000)」の2系統があります。KiB/MiB は1024倍(2進)、KB/MB は1000倍(10進)。設計の"概算"では1000倍で計算して十分です（桁が合えばよい）。詳しくは [Binary prefix (Wikipedia)](https://en.wikipedia.org/wiki/Binary_prefix) を参照。',
              en: 'Strictly, there are two systems: binary (1024) and decimal (1000). KiB/MiB are 1024× (binary); KB/MB are 1000× (decimal). For back-of-the-envelope estimates, using 1000× is fine — you only need the right order of magnitude. See [Binary prefix (Wikipedia)](https://en.wikipedia.org/wiki/Binary_prefix) for details.',
            },
          },
          {
            type: 'details',
            summary: { ja: '見積もりでの使い方（掛け算のコツ）', en: 'Using it in estimates (the multiplication trick)' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '見積もりは「1件のサイズ × 件数」「QPS × 1件のサイズ」「日次 × 保持年数」という掛け算に分解します。1件のサイズをざっくり置くのがコツです。',
                  en: 'Estimates break down into multiplications: size-per-item × count, QPS × size-per-item, daily × retention-years. The trick is to roughly fix the size of one item.',
                },
              },
              {
                type: 'code',
                label: { ja: '例: URL短縮の5年ストレージ', en: 'Example: 5-year storage for a URL shortener' },
                code: `1 record  ≈ 500 B         // key + url + metadata
per day   = 1,000,000 records
per year  = 1M × 365 ≈ 365M records
5 years   = 365M × 5 ≈ 1.8B records
storage   = 1.8B × 500B ≈ 0.9 TB`,
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: '秒に直すときは「1日 ≈ 86,400秒 ≈ 約10万秒」と覚えると暗算が速いです。1日100万件なら 100万 ÷ 10万 = 約12/秒、とすぐ出せます。',
                  en: 'To convert to per-second, remember "1 day ≈ 86,400 s ≈ ~100k s." So 1M/day ÷ 100k ≈ ~12/s, computed in your head instantly.',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'interview',
    category: 'system-design',
    publishedAt: '2026-09-30',
    updatedAt: '2026-09-30',
    title: { ja: 'システムデザイン面接のフレームワーク', en: 'System design interview framework' },
    tagline: {
      ja: '45分の面接を、迷わず進めるための型。',
      en: 'A repeatable structure for navigating the 45-minute interview.',
    },
    sections: [
      {
        id: 'iv-overview',
        title: { ja: '面接の全体像', en: 'The big picture' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'システムデザイン面接は、正解を1つ当てるテストではありません。曖昧な課題を、**要件確認 → 見積もり → 設計 → 深掘り**、という順で構造的に進め、判断とトレードオフを声に出して説明する力を見られます。',
              en: 'A system design interview is not a test with one right answer. You are assessed on how you take a vague problem and work through it structurally — clarify, estimate, design, deep dive — while narrating your decisions and trade-offs out loud.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '最大の失敗は「いきなり設計図を描き始める」こと。まず型（ステップ）に沿って進めると、抜け漏れなく、面接官にも考えが伝わります。下は45分の時間配分の目安です。',
              en: 'The biggest mistake is jumping straight into drawing boxes. Following the steps keeps you thorough and makes your thinking legible to the interviewer. Below is a rough 45-minute budget.',
            },
          },
          { type: 'diagram', id: 'iv-timeline' },
          {
            type: 'list',
            items: [
              { ja: '1. 要件確認 — 何を作るか、スコープを絞る', en: '1. Clarify — decide what to build and narrow the scope' },
              { ja: '2. 見積もり — 規模感（QPS・容量）を数字で置く', en: '2. Estimate — put numbers on scale (QPS, storage)' },
              { ja: '3. API / データモデル — インターフェースを定義', en: '3. API / data model — define the interface' },
              { ja: '4. 高レベル設計 — 主要コンポーネントを配置', en: '4. High-level design — lay out the main components' },
              { ja: '5. 深掘り — ボトルネックとトレードオフを議論', en: '5. Deep dive — discuss bottlenecks and trade-offs' },
            ],
          },
        ],
      },
      {
        id: 'iv-clarify',
        title: { ja: 'Step 1: 要件を明確にする', en: 'Step 1: Clarify requirements' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '課題はわざと曖昧に出されます。いきなり作らず、質問でスコープを絞ります。**「何を作らないか」を決める**のも同じくらい重要です。',
              en: 'The prompt is intentionally vague. Do not start building — narrow the scope with questions. **Deciding what NOT to build** matters just as much.',
            },
          },
          {
            type: 'list',
            items: [
              { ja: '**機能要件**: 誰が何をできるか（例: URLを短縮する、リダイレクトする）', en: '**Functional**: who can do what (e.g. shorten a URL, redirect)' },
              { ja: '**非機能要件**: 規模・可用性・レイテンシ・一貫性の要求', en: '**Non-functional**: scale, availability, latency, consistency needs' },
              { ja: '**スコープ外**: 今回作らない機能を明言して合意する', en: '**Out of scope**: state and agree on what you will not build' },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '例（URL短縮）: 「カスタムエイリアスは必要?」「分析機能は要る?」「リンクに期限は?」と確認し、まずは “短縮とリダイレクト” にスコープを絞る。読み取りが書き込みより圧倒的に多い、という前提もここで握ります。',
              en: 'Example (URL shortener): ask "Do we need custom aliases?", "Any analytics?", "Do links expire?" and scope down to just shorten + redirect. This is also where you establish that reads far outnumber writes.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '「読み取りと書き込みの比率は?」「想定ユーザー数は?」など、後の見積もりに効く質問を優先しましょう。',
              en: 'Prioritize questions that feed later estimates: "What is the read/write ratio?", "How many users?"',
            },
          },
        ],
      },
      {
        id: 'iv-estimate',
        title: { ja: 'Step 2: 規模を見積もる', en: 'Step 2: Estimate the scale' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '見積もりは「桁感」を掴むため。正確さより、設計判断の根拠になる数字を素早く出します。QPS・ストレージ・帯域が定番です。',
              en: 'Estimation is about order of magnitude. Speed over precision — produce numbers that justify design choices. QPS, storage and bandwidth are the usual ones.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '単位の桁感は [基礎: 時間とメモリの単位](#fundamentals) を、具体的な見積もりの例は [URL短縮の規模見積もり](#url-shortener/capacity) を参照。',
              en: 'For unit intuition see [Basics: units of time & memory](#fundamentals); for a worked example see [the URL shortener capacity section](#url-shortener/capacity).',
            },
          },
          {
            type: 'p',
            text: {
              ja: '例（URL短縮）: 1日100万件の書き込みと仮定すると、次のように桁を出せます。',
              en: 'Example (URL shortener): assuming 1M writes per day, you can produce the orders of magnitude like this.',
            },
          },
          {
            type: 'code',
            label: { ja: 'ざっくり見積もり', en: 'Back-of-the-envelope' },
            code: `writes = 1M / day ÷ 86,400s ≈ 12 /s
reads  = ~100x writes    ≈ 1,160 /s   // read-heavy
storage(5y) = 1M × 500B × 365 × 5 ≈ 0.9 TB`,
          },
          {
            type: 'p',
            text: {
              ja: 'この「読み取りが桁違いに多い」という結果が、後の “キャッシュとレプリカ” という設計判断に直結します。',
              en: 'The takeaway "reads dominate" directly drives the later design choice of caching and replicas.',
            },
          },
        ],
      },
      {
        id: 'iv-api',
        title: { ja: 'Step 3: API とデータモデル', en: 'Step 3: API & data model' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '主要な操作を API として定義すると、システムの境界がはっきりします。あわせて、保存するデータの形（スキーマ）を簡単に示します。',
              en: 'Defining the key operations as an API makes the system boundary concrete. Sketch the shape of the stored data (schema) alongside it.',
            },
          },
          {
            type: 'list',
            items: [
              { ja: '**エンドポイント**: メソッド・パス・入出力（例: POST /shorten）', en: '**Endpoints**: method, path, request/response (e.g. POST /shorten)' },
              { ja: '**データモデル**: 主要なテーブル/コレクションと主キー', en: '**Data model**: the main tables/collections and their primary keys' },
            ],
          },
          {
            type: 'code',
            label: { ja: '例（URL短縮）: API とデータモデル', en: 'Example (URL shortener): API & data model' },
            code: `POST /api/shorten { url, alias? }  ->  201 { key, shortUrl }
GET  /{key}                       ->  301 Location: <long url>

table urls (key PK, long_url, created_at, expires_at?)`,
          },
        ],
      },
      {
        id: 'iv-hld',
        title: { ja: 'Step 4: 高レベル設計', en: 'Step 4: High-level design' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'まず「正しく動く最小構成」を、主要コンポーネント（クライアント・LB・サービス・DB・キャッシュ等）を箱と線で描きます。ここで完璧を目指さず、動く土台を作るのが目的です。',
              en: 'Start with a minimal design that works: draw the main components (client, LB, service, DB, cache) as boxes and lines. Aim for a working baseline, not perfection.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '例（URL短縮）: Client → API Gateway → App Server → Database、という最小構成をまず描く。読み取りは「キーで引いてリダイレクト」、書き込みは「キーを発行して保存」。この時点ではキャッシュも入れず、まず正しく動く形を示します。',
              en: 'Example (URL shortener): first draw the minimal path Client → API Gateway → App Server → Database. Read = look up by key and redirect; write = issue a key and store. No cache yet — just show a correct baseline.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'リクエストが端から端までどう流れるかを1本、口で追って説明すると、設計の妥当性が伝わります。',
              en: 'Trace one request end to end out loud — it demonstrates that the design actually holds together.',
            },
          },
        ],
      },
      {
        id: 'iv-deepdive',
        title: { ja: 'Step 5: 深掘りとスケール', en: 'Step 5: Deep dive & scale' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '最小構成のボトルネックを見つけ、順に潰します。ここが差のつく本番。各改善は必ず**トレードオフとセットで語ります**。',
              en: 'Find the bottlenecks in the baseline and address them one by one. This is where you stand out — always **pair each improvement with its trade-off**.',
            },
          },
          {
            type: 'list',
            items: [
              { ja: '**キャッシュ**: 読み取りを高速化（一貫性とのトレードオフ）', en: '**Caching**: speed up reads (trade-off with consistency)' },
              { ja: '**レプリケーション / シャーディング**: 負荷とデータを分散', en: '**Replication / sharding**: spread load and data' },
              { ja: '**単一障害点の解消**: 冗長化で可用性を上げる', en: '**Remove single points of failure**: add redundancy for availability' },
              { ja: '**ボトルネック**: DB・帯域・ホットキーなどを特定して対処', en: '**Bottlenecks**: identify and address DB, bandwidth, hot keys' },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '例（URL短縮）: 「読み取りが多い」→ API と DB の間に Redis キャッシュを挟む（トレードオフ: 一貫性）。次に「キー採番が複数サーバーで衝突する」→ KGS で範囲を配る。このように、見つけたボトルネックを1つずつトレードオフ付きで潰します。',
              en: 'Example (URL shortener): "reads dominate" → add a Redis cache between API and DB (trade-off: consistency). Then "key issuance collides across servers" → hand out ranges via a KGS. Address each bottleneck one at a time, with its trade-off.',
            },
          },
          {
            type: 'details',
            summary: { ja: 'よくある失敗集', en: 'Common mistakes' },
            blocks: [
              {
                type: 'list',
                items: [
                  { ja: '要件を確認せず、いきなり設計を描き始める', en: 'Jumping into design without clarifying requirements' },
                  { ja: '黙って考え込む。考えを声に出さないと評価されない', en: 'Going quiet — if you do not think out loud, it cannot be assessed' },
                  { ja: 'トレードオフを言わず「これが正解」と断言する', en: 'Asserting "this is the answer" without stating trade-offs' },
                  { ja: '1つの論点に時間を使いすぎ、全体を描き切れない', en: 'Spending too long on one point and never covering the whole design' },
                  { ja: '過剰設計。要件にない機能まで作り込む', en: 'Over-engineering — building features the requirements never asked for' },
                ],
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: '迷ったら「要件に立ち返る」。すべての判断は要件（規模・一貫性・レイテンシ）から導けます。',
                  en: 'When in doubt, return to the requirements. Every decision should trace back to them (scale, consistency, latency).',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'url-shortener',
    category: 'system-design',
    publishedAt: '2026-09-29',
    updatedAt: '2026-09-30',
    title: { ja: 'URL短縮サービス', en: 'URL Shortener' },
    tagline: {
      ja: '長いURLを短いキーに変換してリダイレクトする、定番の設計課題。',
      en: 'A classic design problem: turn long URLs into short keys and redirect.',
    },
    sections: [
      {
        id: 'overview',
        title: { ja: '何を作るのか', en: 'What are we building' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'URL短縮サービスは、`https://example.com/very/long/path?...` のような長いURLを `sho.rt/aX9k2` のような短いURLに変換し、アクセスされたら元のURLへリダイレクトする仕組みです。TinyURL や Bitly が代表例です。',
              en: 'A URL shortener turns a long URL like `https://example.com/very/long/path?...` into a short one like `sho.rt/aX9k2`, and redirects to the original when visited. TinyURL and Bitly are well-known examples.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '一見シンプルですが、「短いキーをどう発行するか」「膨大な読み取りをどう捌くか」というスケールの論点が詰まっていて、システム設計の入門にちょうど良い題材です。',
              en: 'It looks simple, but it packs real scaling questions: how to issue short keys, and how to serve a huge volume of reads. That makes it a great intro to system design.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**書き込み（Write）**: 長いURLを受け取り、短いキーを発行して保存する',
                en: '**Write**: accept a long URL, issue a short key, and store it',
              },
              {
                ja: '**読み取り（Read）**: 短いキーを受け取り、元のURLを引いてリダイレクトする',
                en: '**Read**: take a short key, look up the original URL, and redirect',
              },
              {
                ja: '**特性**: 読み取りが書き込みより圧倒的に多い（Read-heavy）',
                en: '**Trait**: reads vastly outnumber writes (read-heavy)',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '読み取りが書き込みの100倍以上になることも珍しくありません。この「Read-heavy」という性質が、後半のキャッシュ設計につながります。',
              en: 'Reads often exceed writes by 100x or more. This read-heavy nature drives the caching design later on.',
            },
          },
        ],
      },
      {
        id: 'capacity',
        title: { ja: '規模の見積もり', en: 'Capacity estimation' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '設計に入る前に、ざっくりした数字を置きます。細かい正確さより「桁感」が大事です。ここでは新規URLを1日100万件、読み取りは書き込みの約100倍と仮定します。',
              en: 'Before designing, pin down rough numbers. The order of magnitude matters more than precision. Assume 1M new URLs per day, with reads about 100x writes.',
            },
          },
          { type: 'diagram', id: 'url-capacity' },
          {
            type: 'list',
            items: [
              {
                ja: '**書き込み**: 100万 / 日 ÷ 86,400秒 ≈ 12 writes/秒',
                en: '**Writes**: 1M / day ÷ 86,400s ≈ 12 writes/sec',
              },
              {
                ja: '**読み取り**: その約100倍 ≈ 1,160 reads/秒（ここが本当の負荷）',
                en: '**Reads**: ~100x that ≈ 1,160 reads/sec (this is the real load)',
              },
              {
                ja: '**ストレージ**: 1件≈500B、5年保持 → 100万×500B×365×5 ≈ 0.9 TB',
                en: '**Storage**: ~500B per record, 5-year retention → 1M×500B×365×5 ≈ 0.9 TB',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'この見積もりが後の判断を決めます。「読み取りが桁違いに多い」→ キャッシュとレプリカが要る。「書き込みは秒10程度」→ 単一DBで余裕だが、採番の衝突対策は依然として要る。',
              en: 'These numbers drive later choices. "Reads dominate" → you need caching and replicas. "Writes are ~10/s" → a single DB handles it easily, but key generation still needs collision handling.',
            },
          },
        ],
      },
      {
        id: 'api',
        title: { ja: 'API 設計', en: 'API design' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '外部に見せるインターフェースは2つだけです。短縮する（書き込み）と、解決してリダイレクトする（読み取り）。',
              en: 'The public interface is just two operations: shorten (write) and resolve-then-redirect (read).',
            },
          },
          {
            type: 'code',
            label: { ja: '短縮 (Write)', en: 'Shorten (write)' },
            code: `POST /api/shorten
{
  "url": "https://example.com/very/long/path",
  "alias": "my-link"   // optional custom key
}

201 Created
{
  "key": "aX9k2",
  "shortUrl": "https://sho.rt/aX9k2"
}`,
          },
          {
            type: 'code',
            label: { ja: '解決 (Read / Redirect)', en: 'Resolve (read / redirect)' },
            code: `GET /aX9k2

301 Moved Permanently
Location: https://example.com/very/long/path`,
          },
          {
            type: 'list',
            items: [
              {
                ja: 'リダイレクトは 301（恒久）か 302（一時）。301はブラウザがキャッシュして高速だが、クリック計測はしにくい。計測重視なら302',
                en: 'Redirect with 301 (permanent) or 302 (temporary). 301 is cached by browsers (fast) but hides click analytics; use 302 if you need to count clicks',
              },
              {
                ja: 'カスタムエイリアスは任意。既に使われていれば 409 Conflict を返す',
                en: 'Custom alias is optional; return 409 Conflict if it is already taken',
              },
              {
                ja: '存在しないキーは 404。不正なURLは 400',
                en: 'Unknown key → 404; malformed URL → 400',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '301 vs 302 は面接での定番の掘りどころです。「速度（キャッシュ）を取るか、計測を取るか」というトレードオフを言えると良いです。詳細は MDN の [301 Moved Permanently](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/301) と [302 Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/302) を参照。',
              en: 'The 301-vs-302 choice is a classic interview follow-up. Be ready to frame it as a trade-off: caching speed versus click analytics. See MDN on [301 Moved Permanently](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/301) and [302 Found](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/302).',
            },
          },
        ],
      },
      {
        id: 'basic-flow',
        title: { ja: '基本フロー', en: 'Basic flow' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'まずは最小構成のリクエストの流れを見てみましょう。クライアントからのリクエストが、APIサーバーを経由してデータベースにたどり着き、結果が返ってくる。下の図の「再生」を押すと、リクエストが流れる様子が見えます。',
              en: 'Start with the minimal request flow. A client request reaches the database via an API server, and the result comes back. Press "Replay" below to watch the request travel.',
            },
          },
          { type: 'diagram', id: 'url-basic-flow' },
          {
            type: 'p',
            text: {
              ja: 'この構成はシンプルで正しく動きますが、アクセスが増えると毎回データベースに問い合わせるのがボトルネックになります。そこを後で改善します。',
              en: 'This setup is simple and correct, but hitting the database on every request becomes a bottleneck as traffic grows. We fix that later.',
            },
          },
        ],
      },
      {
        id: 'key-generation',
        title: { ja: '短縮キーの生成', en: 'Generating short keys' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '設計のキモが「短いキーの発行方法」です。代表的なのは、連番のIDを Base62（0-9, a-z, A-Z の62文字）に変換する方法です。数値が短い文字列に圧縮されます。',
              en: 'The core design choice is how to issue short keys. A common approach converts a sequential ID into Base62 (the 62 characters 0-9, a-z, A-Z), compressing a number into a short string.',
            },
          },
          { type: 'diagram', id: 'url-key-generation' },
          {
            type: 'code',
            label: { ja: 'Base62 エンコードのイメージ', en: 'Base62 encoding, illustrated' },
            code: `// Convert sequential ID 125 to Base62
// In base 62 it becomes a short string like "cb"
function toBase62(n) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let s = "";
  while (n > 0) {
    s = chars[n % 62] + s;
    n = Math.floor(n / 62);
  }
  return s;
}`,
          },
          {
            type: 'list',
            items: [
              {
                ja: '**連番+Base62**: 短く衝突しない。ただしIDが連番だと推測されやすい',
                en: '**Sequential + Base62**: short and collision-free, but sequential IDs are easy to guess',
              },
              {
                ja: '**ランダム生成**: 推測されにくいが、衝突チェックが必要',
                en: '**Random generation**: hard to guess, but needs collision checks',
              },
              {
                ja: '**ハッシュ(MD5など)の先頭数文字**: 手軽だが衝突対策が要る',
                en: '**First few chars of a hash (e.g. MD5)**: easy, but still needs collision handling',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '62^7 ≈ 3.5兆通り。7文字あれば当面キーが枯渇する心配はありません。',
              en: '62^7 ≈ 3.5 trillion combinations. Seven characters is plenty before you run out of keys.',
            },
          },
        ],
      },
      {
        id: 'key-uniqueness',
        title: { ja: 'キーの一意性をどう担保するか', en: 'Guaranteeing key uniqueness' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'サーバーが1台なら連番で採番すれば自明に一意です。問題は複数台に増えたとき。各サーバーが独立に連番を振ると、同じIDを別のURLに割り当ててしまい衝突します。ここが分散設計の勘所です。',
              en: 'With a single server, a sequential counter is trivially unique. The problem appears with multiple servers: if each increments its own counter, two servers can assign the same ID to different URLs. This is the crux of the distributed design.',
            },
          },
          { type: 'diagram', id: 'url-key-uniqueness' },
          {
            type: 'list',
            items: [
              {
                ja: '**中央採番（チケットサーバー）**: ID発行を1箇所に集約。単純で確実だが、単一障害点・スループットのボトルネックになりやすい',
                en: '**Central counter (ticket server)**: funnel all ID issuance through one place. Simple and correct, but a single point of failure and a throughput bottleneck',
              },
              {
                ja: '**範囲分割 / KGS**: Key Generation Service が各サーバーに重ならないID範囲（例: 0-999, 1000-1999）を配る。各サーバーは範囲内で自由に採番でき衝突しない。事前生成しておけば発行も高速',
                en: '**Range partitioning / KGS**: a Key Generation Service hands each server a non-overlapping range (e.g. 0-999, 1000-1999). Each issues freely within its range with no collisions; pre-generating keys makes issuance fast',
              },
              {
                ja: '**ランダム / ハッシュ + 衝突検知**: ランダムキーを生成し、DBの一意制約（UNIQUE）で重複を弾いてリトライ。空間が広ければ衝突は稀',
                en: '**Random / hash + collision check**: generate a random key and rely on a DB UNIQUE constraint to reject duplicates and retry. With a large key space, collisions are rare',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'カスタムエイリアスは別枠で扱います。ユーザー指定のキーは自動採番と衝突しうるので、書き込み時に一意制約でチェックし、重複なら 409 を返します。',
              en: 'Custom aliases are handled separately. A user-chosen key can clash with auto-generated ones, so check the UNIQUE constraint on write and return 409 on a duplicate.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '面接では「単一サーバーなら連番で自明」→「複数台で衝突」→「KGSで範囲を配れば衝突せずスケールもする」という筋道で話すと、問題の本質を理解していることが伝わります。',
              en: 'In an interview, walk the path: "single server → trivial", "multiple servers → collisions", "a KGS hands out ranges → no collisions and it scales." It shows you grasp the core problem.',
            },
          },
          {
            type: 'details',
            summary: { ja: '深掘り: KGS はどうやって範囲を振り分ける?', en: 'Deep dive: how does the KGS hand out ranges?' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: 'KGS は自分自身が1つのカウンター（next）を持ち、それを「1個ずつ」ではなく「ブロック（塊）」で切り出して配ります。頼まれるたびに、現在の next から一定個数ぶんの範囲を返し、next をその先へ進めます。',
                  en: 'The KGS keeps a single counter (next) and hands it out in blocks, not one at a time. On each request it returns a fixed-size range starting at the current next, then advances next past it.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: 'サーバーA起動 → KGS が [0–999] を返し next=1000 に',
                    en: 'Server A starts → KGS returns [0–999] and sets next=1000',
                  },
                  {
                    ja: 'サーバーB起動 → [1000–1999] を返し next=2000 に',
                    en: 'Server B starts → returns [1000–1999], next=2000',
                  },
                  {
                    ja: 'next を1箇所で単調増加させるので、範囲は絶対に重ならない',
                    en: 'next increases monotonically in one place, so ranges never overlap',
                  },
                ],
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: '宝くじの番号を配るイメージ: 本部（KGS）が各店に連番の束を渡す。店は束の中で順に売るので、全国で番号がかぶらない。',
                  en: 'Like handing out lottery numbers: HQ (the KGS) gives each store a block of consecutive numbers; each store sells within its block, so no number collides nationwide.',
                },
              },
            ],
          },
          {
            type: 'details',
            summary: { ja: '深掘り: リクエストは毎回 KGS を通る?', en: 'Deep dive: does every request go through the KGS?' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '通りません。ユーザーの短縮リクエストは Client → API → DB で完結し、API は「手元（メモリ）に配られた範囲」から次の番号を使うだけです。KGS への問い合わせは発生しません。',
                  en: 'No. A shorten request completes as Client → API → DB, and the API just uses the next number from the range it already holds in memory. It does not call the KGS.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: 'KGS が呼ばれるのは「手元の範囲を使い切りそうになったとき」だけ。範囲が1000個なら、およそ1000リクエストに1回の補充だけです。',
                  en: 'The KGS is called only when a server is about to exhaust its range. With a range of 1000, that is roughly one refill per 1000 requests.',
                },
              },
              {
                type: 'note',
                tone: 'info',
                text: {
                  ja: 'だから KGS はホットパス（毎回の経路）に居ません。中央採番（毎回1個ずつ中央に聞く方式）と違い、KGS がボトルネックや単一障害点になりにくいのが利点です。',
                  en: 'So the KGS is off the hot path. Unlike a central counter (asking one place per request), the KGS is far less likely to be a bottleneck or single point of failure.',
                },
              },
            ],
          },
          {
            type: 'details',
            summary: { ja: '深掘り: オートスケールで増減したら?', en: 'Deep dive: what about auto-scaling up and down?' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '増えるとき: 新サーバーは KGS に範囲を頼むだけ。next は単調増加なので、何台増えても重複しません。',
                  en: 'Scaling up: a new server just requests a range. Since next only increases, more servers never cause overlap.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '止まるとき: 配られた範囲を使い切らずに消えると、その範囲に「穴」があきます（連番が飛ぶ）。ただし誰もその番号を使わないだけなので、一意性は壊れません。',
                  en: 'Scaling down: if a server dies before using its whole range, that range becomes a gap (numbers are skipped). But nobody reuses those numbers, so uniqueness is never broken.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: 'キー空間は膨大（Base62 7桁 ≈ 3.5兆）なので、穴が空いても枯渇にはほど遠い → 通常は許容する',
                    en: 'The key space is huge (Base62 7 chars ≈ 3.5T), so gaps are nowhere near exhausting it → usually acceptable',
                  },
                  {
                    ja: '**無駄を減らすなら**: ブロックを小さくする（停止時の損失↓）。ただし KGS への補充頻度↑ とのトレードオフ',
                    en: '**To waste less**: use smaller blocks (less lost on shutdown), trading off more frequent KGS refills',
                  },
                  {
                    ja: '正常終了なら未使用範囲を KGS に返却して再利用する手もあるが、クラッシュ時は返せず実装も複雑',
                    en: 'On graceful shutdown a server can return its unused range for reuse, but crashes cannot return it and it adds complexity',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'read-write',
        title: { ja: '書き込みと読み取りの流れ', en: 'Write path and read path' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '書き込み（Write path）と読み取り（Read path）は流れが違います。書き込みはキーを発行して保存、読み取りはキーから元URLを引く。分けて見ると理解しやすいです。',
              en: 'The write path and read path differ. Writes issue a key and store it; reads look up the original URL from a key. Viewing them separately makes it clearer.',
            },
          },
          { type: 'diagram', id: 'url-read-write' },
          {
            type: 'p',
            text: {
              ja: '読み取りは「引くだけ」なので速いはずですが、アクセスが集中すると毎回のDB問い合わせが積み重なって遅くなります。次でキャッシュを入れて改善します。',
              en: 'Reads are just lookups, so they should be fast, but under heavy traffic the repeated DB queries add up. Next we add a cache to improve it.',
            },
          },
        ],
      },
      {
        id: 'database',
        title: { ja: 'データベースの選択（SQL / NoSQL）', en: 'Choosing the database (SQL / NoSQL)' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'このサービスのデータアクセスは驚くほど単純です。「キーで1件引く」「1件書く」だけ。テーブル間の結合も複雑なトランザクションもありません。この形は Key-Value ストアや NoSQL と非常に相性が良いです。',
              en: 'The data access here is remarkably simple: look up one record by key, and write one record. No joins across tables, no complex transactions. That shape fits key-value stores and NoSQL very well.',
            },
          },
          {
            type: 'code',
            label: { ja: 'データモデル（1テーブル / 1コレクション）', en: 'Data model (one table / collection)' },
            code: `key        VARCHAR  PRIMARY KEY   // "aX9k2"
long_url   TEXT
created_at TIMESTAMP
expires_at TIMESTAMP  NULL         // optional TTL
owner_id   VARCHAR    NULL         // optional`,
          },
          {
            type: 'list',
            items: [
              {
                ja: '**NoSQL / KVS (DynamoDB, Cassandra, Redis 永続化)**: キー引きが O(1) で速い、水平スケールが容易。read-heavy に強い',
                en: '**NoSQL / KV (DynamoDB, Cassandra, persisted Redis)**: O(1) key lookups, easy horizontal scaling — great for read-heavy loads',
              },
              {
                ja: '**SQL (PostgreSQL, MySQL)**: トランザクションや二次インデックス（owner別一覧など）が要るなら有利。単一テーブルなら十分捌ける',
                en: '**SQL (PostgreSQL, MySQL)**: better if you need transactions or secondary indexes (e.g. list by owner); a single table scales fine here',
              },
              {
                ja: '結局は「アクセスパターン」で選ぶ。キー引き中心なら NoSQL、リレーションや集計が増えるなら SQL',
                en: '**Choose by access pattern**: key lookups favor NoSQL; relations and aggregations favor SQL',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'もう一つの判断軸が「一貫性の強さ」、つまり ACID をどこまで求めるかです。ここが SQL と NoSQL の思想の違いに直結します。',
              en: 'Another axis is how strong you need consistency to be — that is, how much ACID you require. This maps directly onto the philosophical split between SQL and NoSQL.',
            },
          },
          {
            type: 'details',
            summary: { ja: '深掘り: ACID と BASE（SQL / NoSQL の一貫性）', en: 'Deep dive: ACID vs BASE (SQL / NoSQL consistency)' },
            blocks: [
              {
                type: 'list',
                items: [
                  {
                    ja: '**Atomicity（原子性）**: トランザクション内の操作は全部成功か全部失敗か',
                    en: '**Atomicity**: all operations in a transaction succeed, or none do',
                  },
                  {
                    ja: '**Consistency（一貫性）**: 制約を破る状態には遷移しない',
                    en: '**Consistency**: the DB never moves into a state that violates its constraints',
                  },
                  {
                    ja: '**Isolation（分離性）**: 並行トランザクションが互いに干渉しない',
                    en: '**Isolation**: concurrent transactions do not interfere with each other',
                  },
                  {
                    ja: '**Durability（永続性）**: コミットしたら電源が落ちても残る',
                    en: '**Durability**: once committed, data survives crashes',
                  },
                ],
              },
              {
                type: 'p',
                text: {
                  ja: 'SQL（RDB）は伝統的に ACID を強く保証します。トランザクションや一意制約が堅いので、「絶対に重複させたくない」「複数行を一括で正しく更新したい」ケースに向きます。',
                  en: 'SQL (RDBMS) traditionally offers strong ACID guarantees. Transactions and unique constraints are solid, which suits cases where you must never allow duplicates or must update multiple rows correctly together.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '多くの NoSQL は可用性・スケールを優先し、ACID を緩めた BASE（Basically Available, Soft state, Eventual consistency）に寄ります。書き込み直後に全レプリカへ反映されず、少し遅れて揃う「結果整合」が典型です。近年は DynamoDB のように条件付き書き込みや項目単位トランザクションを持つものも増えています。',
                  en: 'Many NoSQL stores prioritize availability and scale, leaning toward BASE (Basically Available, Soft state, Eventual consistency) with relaxed ACID. Writes are typically eventually consistent — replicas converge shortly after, not instantly. That said, modern stores like DynamoDB add conditional writes and per-item transactions.',
                },
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'URL短縮での判断: 保存はほぼ「1件書いて1件読む」だけなので、強い ACID は必須ではありません。読み取りが結果整合でも、作成直後のごく短時間に古い値を返しうる程度で実害は小さい。ただし「キー（特にカスタムエイリアス）の一意性」だけは強く守りたいので、そこは一意制約や条件付き書き込みで保証します。',
                  en: 'For a URL shortener: storage is basically "write one, read one," so strong ACID is not required. Eventual consistency on reads only risks a stale value for a brief moment right after creation — low impact. The one thing you do want to guarantee is key uniqueness (especially custom aliases), enforced with a unique constraint or conditional write.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '「NoSQL は一意性が弱いのでは?」という疑問はよくありますが、正確には「主キーの一意性は保証される。主キー以外の一意性は自動では効かない」です。NoSQL でも短縮キーを主キー（パーティションキー）にすれば一意性は守れ、[条件付き書き込み](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html)（存在しなければ書く = attribute_not_exists）で上書き事故も防げます。',
                  en: 'A common worry is "isn\'t uniqueness weak in NoSQL?" More precisely: the primary key is guaranteed unique, but uniqueness on non-key fields is not automatic. In NoSQL you still get uniqueness by making the short key the primary (partition) key, and a [conditional write](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ConditionExpressions.html) (write if not exists, via attribute_not_exists) prevents accidental overwrites.',
                },
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'URL短縮で一意にしたいのは実質「短縮キー」だけで、それは主キーで守れます。だから基本要件なら NoSQL で問題ありません。SQL が欲しくなるのは「long_url を一意にしたい（主キー以外の一意性）」「ユーザー別に集計・検索したい」など要件が増えたときです。',
                  en: 'The only thing a URL shortener really needs unique is the short key, which the primary key covers. So for the base requirements, NoSQL is fine. You reach for SQL when requirements grow — e.g. making long_url unique (a non-key uniqueness) or rich per-user aggregation and search.',
                },
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '面接では「単純なキー引きなので NoSQL が自然。ただしカスタムエイリアスの一意性保証やユーザー別集計が要件に入るなら SQL も検討」と、要件と結びつけて答えると強いです。',
              en: 'In an interview, tie it to requirements: "Simple key lookups make NoSQL a natural fit, but if unique custom aliases or per-user analytics are required, SQL is worth considering."',
            },
          },
        ],
      },
      {
        id: 'cache-scale',
        title: { ja: 'キャッシュでスケールさせる', en: 'Scaling with a cache' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'Read-heavy なサービスの定石は「よく読まれるデータをキャッシュに載せる」ことです。APIサーバーとDBの間にキャッシュ（Redisなど）を挟みます。下の図で、キャッシュ有り/無しを切り替えて流れの違いを見てください。',
              en: 'The standard move for a read-heavy service is caching frequently read data. Put a cache (like Redis) between the API server and the DB. Toggle cache on/off below to compare the flows.',
            },
          },
          { type: 'diagram', id: 'url-cache-scale' },
          {
            type: 'list',
            items: [
              {
                ja: '**キャッシュヒット**: DBに行かずキャッシュから即返す（速い）',
                en: '**Cache hit**: return straight from cache without touching the DB (fast)',
              },
              {
                ja: '**キャッシュミス**: DBから引いてキャッシュに載せ、次回に備える',
                en: '**Cache miss**: read from the DB, then populate the cache for next time',
              },
              {
                ja: '人気URLほどキャッシュに残りやすく、DB負荷が大きく下がる',
                en: 'Popular URLs stay cached, dramatically cutting DB load',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'キャッシュには「元データと食い違う」リスクが付きもの。URL短縮は一度作ると変わらないデータが多いので相性が良いですが、更新があるデータでは無効化戦略が重要になります。',
              en: 'Caches carry the risk of going stale versus the source. URL shorteners suit caching well since entries rarely change, but for mutable data an invalidation strategy is crucial.',
            },
          },
        ],
      },
      {
        id: 'cache-eviction',
        title: { ja: 'キャッシュの追い出し戦略', en: 'Cache eviction strategies' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'キャッシュの容量は有限です。埋まったら、新しいデータを入れるために何かを追い出す（eviction）必要があります。「何を捨てるか」を決めるのが追い出しアルゴリズムです。下の図は最も一般的な LRU の動きです。',
              en: 'Cache capacity is finite. When it fills up, something must be evicted to make room. The eviction algorithm decides what to drop. The diagram below shows the most common one, LRU.',
            },
          },
          { type: 'diagram', id: 'url-cache-eviction' },
          {
            type: 'list',
            items: [
              {
                ja: '**LRU (Least Recently Used)**: 最も長く使われていない項目を捨てる。時間的局所性に強く、最も広く使われる',
                en: '**LRU (Least Recently Used)**: drop the item unused for the longest time. Strong for temporal locality and the most widely used',
              },
              {
                ja: '**LFU (Least Frequently Used)**: アクセス回数が最も少ない項目を捨てる。人気の偏りが強いデータに向く',
                en: '**LFU (Least Frequently Used)**: drop the least-accessed item. Good when popularity is heavily skewed',
              },
              {
                ja: '**FIFO**: 入れた順に捨てる。実装は簡単だが「よく使われている」を考慮しない',
                en: '**FIFO**: evict in insertion order. Simple, but ignores how often an item is used',
              },
              {
                ja: '**TTL (Time To Live)**: 一定時間で自動失効。URL短縮の「期限付きリンク」と相性が良い',
                en: '**TTL (Time To Live)**: auto-expire after a set time. Pairs well with expiring short links',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'Redis は [maxmemory-policy](https://redis.io/docs/latest/develop/reference/eviction/) でこれらを選べます（allkeys-lru, allkeys-lfu, volatile-ttl など）。URL短縮では「人気リンクを残したい」ので LRU か LFU が基本、期限付きなら TTL を併用します。',
              en: 'Redis lets you pick via [maxmemory-policy](https://redis.io/docs/latest/develop/reference/eviction/) (allkeys-lru, allkeys-lfu, volatile-ttl, etc.). For a URL shortener you want to keep popular links, so LRU or LFU is the default, combined with TTL for expiring links.',
            },
          },
        ],
      },
      {
        id: 'architecture',
        title: { ja: '全体アーキテクチャ', en: 'Putting it all together' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ここまでの部品を1枚にまとめると、URL短縮サービスの全体像はこうなります。読み取りが圧倒的に多いので、キャッシュ優先で読み、DB はミス時だけ。キーの一意性は KGS の範囲配布で担保します。',
              en: 'Combining everything so far, here is the full picture of the URL shortener. Reads dominate, so we read cache-first and hit the DB only on a miss. Key uniqueness comes from the KGS handing out ranges.',
            },
          },
          { type: 'diagram', id: 'url-architecture' },
          {
            type: 'list',
            items: [
              {
                ja: '**API Gateway / LB**: リクエストの入口。負荷分散と、必要ならレート制限もここで',
                en: '**API Gateway / LB**: the entry point for load balancing (and rate limiting if needed)',
              },
              {
                ja: '**App Server**: キー発行（KGSの範囲を消費）とリダイレクト処理。ステートレスで水平スケール',
                en: '**App Server**: issues keys (consuming the KGS range) and handles redirects; stateless and horizontally scalable',
              },
              {
                ja: '**Cache (Redis)**: Read path の主役。人気URLを載せて DB 負荷を大きく下げる',
                en: '**Cache (Redis)**: the star of the read path; keeps popular URLs to slash DB load',
              },
              {
                ja: '**Database**: 真実の保管場所。key → url を単純に保存。NoSQL が自然だが要件次第で SQL も',
                en: '**Database**: the source of truth, storing key → url; NoSQL is natural, SQL if requirements demand',
              },
              {
                ja: '**KGS**: 各 App Server に重ならないキー範囲を配り、分散でも衝突しないようにする',
                en: '**KGS**: hands each App Server a non-overlapping key range so distributed issuance never collides',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '面接では、この全体図を描きながら「読み取りが多いのでキャッシュとレプリカ、キー衝突を KGS で回避、DB はキー引きに最適な選択」と各判断の理由を要件に結びつけて説明できると強いです。',
              en: 'In an interview, sketch this diagram and tie each choice to requirements: "reads dominate → cache and replicas, KGS avoids key collisions, DB chosen to fit key lookups." Explaining the why is what stands out.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'rate-limiter',
    category: 'system-design',
    publishedAt: '2026-09-29',
    updatedAt: '2026-09-30',
    title: { ja: 'レートリミッター', en: 'Rate Limiter' },
    tagline: {
      ja: '過剰なリクエストを制限して、システムを守る仕組み。',
      en: 'Throttle excess requests to protect your system.',
    },
    sections: [
      {
        id: 'why',
        title: { ja: 'なぜ必要か', en: 'Why you need it' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'Rate Limiter（レート制限）は、一定時間内に受け付けるリクエスト数に上限を設ける仕組みです。特定のクライアントが大量にリクエストを送ってきても、システム全体が巻き込まれないように守ります。',
              en: 'A rate limiter caps how many requests are accepted in a given time window. It shields the whole system even when one client floods it with requests.',
            },
          },
          { type: 'diagram', id: 'rl-why' },
          {
            type: 'list',
            items: [
              {
                ja: '**DoS/乱用の防止**: 悪意ある大量アクセスを弾く',
                en: '**Prevent DoS/abuse**: block malicious floods of traffic',
              },
              {
                ja: '**コスト保護**: 過剰な処理による費用増を防ぐ',
                en: '**Protect cost**: avoid runaway spend from excess processing',
              },
              {
                ja: '**公平性**: 一部のユーザーがリソースを独占しないようにする',
                en: '**Fairness**: keep a few users from hogging resources',
              },
            ],
          },
        ],
      },
      {
        id: 'rl-capacity',
        title: { ja: '規模の見積もり', en: 'Capacity estimation' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'レートリミッターの特徴は「全リクエストに対して判定が走る」こと。つまり判定のスループットは、そのサービスの総トラフィックとほぼ同じになります。ここではピーク 10,000 req/s を仮定します。',
              en: 'The defining trait of a rate limiter is that a check runs on every request. So its decision throughput is essentially the total traffic of the service. Here we assume a peak of 10,000 req/s.',
            },
          },
          { type: 'diagram', id: 'rl-capacity' },
          {
            type: 'list',
            items: [
              {
                ja: '**判定 QPS**: 全リクエスト分 ≈ 10,000/s。各判定は Redis への 1〜2 操作（INCR など）',
                en: '**Decision QPS**: equals all traffic ≈ 10,000/s; each check is 1–2 Redis ops (INCR, etc.)',
              },
              {
                ja: '**処理能力**: 単一 Redis は約 100,000 ops/s を捌ける → 10k/s なら余力十分（可用性のための冗長化は別途）',
                en: '**Capacity**: a single Redis handles ~100,000 ops/s → 10k/s leaves plenty of headroom (redundancy for availability is separate)',
              },
              {
                ja: '**メモリ**: アクティブなキー数 × 1エントリ。100万ユーザー × 約100B ≈ 100MB。TTL で古い窓は自動で消える',
                en: '**Memory**: active keys × entry size. 1M users × ~100B ≈ 100MB; TTL auto-drops old windows',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '判定はホットパス上にあるので、レイテンシ予算は 1ms 未満が目安。だから永続DBではなくインメモリの Redis を使い、原子的な1コマンドで済ませます。「全トラフィックが通るが、インメモリなら軽く捌ける」と言えると良いです。',
              en: 'The check sits on the hot path, so budget well under 1ms per decision. That is why you use in-memory Redis (not a persistent DB) and a single atomic command. Frame it as: "all traffic flows through it, but in-memory handling makes it cheap."',
            },
          },
        ],
      },
      {
        id: 'placement',
        title: { ja: 'どこに置くか（配置）', en: 'Where to place it' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'レートリミッターは複数の層に置けます。原則は「なるべく上流（エッジ）で弾く」こと。早い段階で不要なリクエストを落とせば、その先のサービスは無駄な処理をせずに済みます。',
              en: 'A rate limiter can live at several layers. The principle: reject as early (as close to the edge) as possible. Dropping unwanted requests early means downstream services never waste work on them.',
            },
          },
          { type: 'diagram', id: 'rl-placement' },
          {
            type: 'list',
            items: [
              {
                ja: '**クライアント側**: リクエスト自体を抑制できるが、改ざん可能なので信頼できない。補助的な位置づけ',
                en: '**Client-side**: can throttle requests before they leave, but is tamperable and untrusted — only a supplement',
              },
              {
                ja: '**API Gateway / ロードバランサ**: 最も一般的。全サービス共通の制限をエッジで一括適用でき、下流を守れる',
                en: '**API gateway / load balancer**: the most common spot. Applies shared limits at the edge and shields everything downstream',
              },
              {
                ja: '**専用のミドルウェア / サービス**: 細かい制御や独自ロジックが必要なときに、専用の層として切り出す',
                en: '**Dedicated middleware / service**: split out as its own layer when you need fine-grained control or custom logic',
              },
              {
                ja: '**各サービス内**: サービス固有の制限に向くが、全サービスに実装が要り重複しがち',
                en: '**Inside each service**: good for service-specific limits, but must be implemented everywhere and tends to duplicate',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '多くの実システムは「API Gateway に共通の制限」＋「必要なサービスだけ内部で追加制限」の二段構えにします。',
              en: 'Many real systems use two tiers: shared limits at the API gateway, plus extra per-service limits inside the services that need them.',
            },
          },
        ],
      },
      {
        id: 'identifier',
        title: { ja: '何をキーに制限するか', en: 'What to key the limit on' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '「1分間に100回まで」の"誰の"回数か、を決めるのが識別子（キー）です。何を基準にカウントするかで、公平性と副作用が変わります。',
              en: 'The identifier (key) decides whose count "100 per minute" applies to. What you count by changes both fairness and side effects.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**IPアドレス**: 認証前でも使える手軽さ。ただし NAT や社内ネットワーク配下の多数ユーザーを1つのIPで巻き込む（誤爆）',
                en: '**IP address**: works even before auth. But NAT/corporate networks put many users behind one IP, causing collateral blocking',
              },
              {
                ja: '**ユーザーID**: 認証後なら最も公平。ログインユーザー単位で正確に制限できる',
                en: '**User ID**: the fairest once authenticated — limits precisely per logged-in user',
              },
              {
                ja: '**APIキー / クライアントID**: 外部API向け。プラン（無料/有料）ごとに上限を変える課金モデルと相性が良い',
                en: '**API key / client ID**: for public APIs; pairs well with per-plan (free/paid) quotas',
              },
              {
                ja: '**エンドポイント単位**: 高価な操作（検索・エクスポート等）だけ厳しくする、といった組み合わせも有効',
                en: '**Per-endpoint**: combine with the above to throttle only expensive operations (search, export, etc.)',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'IPだけに頼ると「共有IPの巻き込み」と「IPを変えれば回避できる」という両方の弱点があります。認証があるならユーザーID/APIキーを主に、IPは補助にするのが定石です。',
              en: 'Relying on IP alone has two weaknesses: it collaterally blocks shared IPs, and attackers can rotate IPs to evade it. When you have auth, key on user ID / API key primarily and use IP as a supplement.',
            },
          },
        ],
      },
      {
        id: 'token-bucket',
        title: { ja: 'Token Bucket アルゴリズム', en: 'Token Bucket algorithm' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '最も広く使われるのが Token Bucket です。「バケツ（バケット）に一定のペースでトークンが補充され、リクエストが来るたびにトークンを1つ消費する。トークンが無ければ拒否する」というモデルです。',
              en: 'The most widely used approach is the Token Bucket. Tokens refill into a bucket at a steady rate; each request consumes one token, and if none are left the request is rejected.',
            },
          },
          { type: 'diagram', id: 'rl-token-bucket' },
          {
            type: 'list',
            items: [
              {
                ja: '**補充レート**: 1秒あたり何個トークンを足すか（平常時の許容ペース）',
                en: '**Refill rate**: tokens added per second (the steady-state allowed pace)',
              },
              {
                ja: '**バケツ容量**: 最大何個までトークンを貯められるか（バースト許容量）',
                en: '**Bucket capacity**: max tokens that can accumulate (burst allowance)',
              },
              {
                ja: 'トークンがある = 許可 / トークンが無い = 拒否',
                en: 'Tokens available = allow / no tokens = reject',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'Token Bucket の強みは「バースト（一時的な集中）を容量まで許容しつつ、平均レートは補充ペースに抑えられる」点です。',
              en: "The Token Bucket's strength: it allows bursts up to the capacity while keeping the average rate bounded by the refill pace.",
            },
          },
        ],
      },
      {
        id: 'allow-deny',
        title: { ja: 'リクエストが通る / 弾かれる', en: 'Requests: allowed / rejected' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '実際にリクエストが連続で来たとき、どれが通ってどれが弾かれるのかを見てみましょう。緑が許可、赤が拒否です。トークンが尽きた瞬間から拒否に変わります。',
              en: 'Watch which requests pass and which get blocked when they arrive in a burst. Green is allowed, red is rejected. The moment tokens run out, requests start getting rejected.',
            },
          },
          { type: 'diagram', id: 'rl-allow-deny' },
          {
            type: 'p',
            text: {
              ja: '拒否されたリクエストには、HTTP 429 (Too Many Requests) を返すのが一般的です。あわせて「いつ再試行できるか」を示す Retry-After ヘッダを返すと親切です。',
              en: 'Rejected requests typically get HTTP 429 (Too Many Requests). Adding a Retry-After header to indicate when to try again is a nice touch.',
            },
          },
        ],
      },
      {
        id: 'response',
        title: { ja: '制限を超えたときのレスポンス', en: 'What to return when the limit is hit' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '制限に達したリクエストには [HTTP 429 (Too Many Requests)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429) を返すのが標準です。さらに「いつ再試行できるか」「残り何回か」をヘッダで伝えると、クライアントが賢く振る舞えます。',
              en: 'When a request hits the limit, the standard response is [HTTP 429 (Too Many Requests)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/429). Adding headers for "when to retry" and "how many remain" lets clients behave intelligently.',
            },
          },
          {
            type: 'code',
            label: { ja: '429 レスポンス例', en: 'Example 429 response' },
            code: `HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1712345678`,
          },
          {
            type: 'list',
            items: [
              {
                ja: '**Retry-After**: 何秒後に再試行してよいか。クライアントの無駄な連打を防ぐ',
                en: '**Retry-After**: how many seconds until a retry is allowed — stops clients from hammering',
              },
              {
                ja: '**X-RateLimit-Limit / Remaining / Reset**: 上限・残り回数・リセット時刻。クライアントが自分で流量を調整できる',
                en: '**X-RateLimit-Limit / Remaining / Reset**: the cap, remaining calls, and reset time — clients can self-pace',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '超過分の扱いには2通りあります。「即エラーで落とす（shed）」か「キューで待たせて後で処理する（throttle）」。APIは前者、バッチ的な処理は後者が向くことが多いです。',
              en: 'There are two ways to handle excess: reject immediately (shed) or queue and process later (throttle). APIs usually prefer shedding; batch-like workloads often prefer throttling.',
            },
          },
        ],
      },
      {
        id: 'algorithms',
        title: { ja: '他のアルゴリズムとの比較', en: 'Comparing algorithms' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'Token Bucket 以外にも方式があります。それぞれ「時間の区切り方」が違います。',
              en: 'There are other approaches besides Token Bucket. Each divides up time differently.',
            },
          },
          { type: 'diagram', id: 'rl-algorithms' },
          {
            type: 'list',
            items: [
              {
                ja: '**Fixed Window**: 固定の時間枠ごとにカウント。シンプルだが枠の境界で急増を許してしまう',
                en: '**Fixed Window**: count per fixed time slot. Simple, but allows spikes at slot boundaries',
              },
              {
                ja: '**Sliding Window**: 直近N秒を滑らせて数える。境界問題を緩和できる',
                en: '**Sliding Window**: count over a moving last-N-seconds window, easing the boundary problem',
              },
              {
                ja: '**Token Bucket**: バーストを許容しつつ平均レートを抑える。柔軟で人気',
                en: '**Token Bucket**: allow bursts while bounding the average rate. Flexible and popular',
              },
            ],
          },
          {
            type: 'details',
            summary: { ja: '深掘り: Fixed Window の「境界問題」', en: 'Deep dive: the Fixed Window "boundary problem"' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: 'Fixed Window（例: 毎分100回まで）は実装が簡単ですが、窓の「境目」で上限の2倍が通ってしまう弱点があります。',
                  en: 'Fixed Window (e.g. 100/min) is simple to implement, but it can let through twice the limit right at the window boundary.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '例: 「12:00:59 に100回」＋「12:01:00 に100回」。それぞれ別の窓なので両方とも許可されますが、実質1秒間に200回通っています。上限は100/分のはずなのに、境界をまたぐと守れていません。',
                  en: 'Example: 100 calls at 12:00:59 and 100 more at 12:01:00. Each falls in a different window, so both are allowed — yet 200 calls went through in ~1 second. The 100/min cap is violated across the boundary.',
                },
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'Sliding Window（直近N秒を滑らせて数える）はこの境界問題を緩和します。Sliding Window Log は全リクエスト時刻を保持して厳密、Sliding Window Counter は前後の窓を加重平均して近似し、メモリを節約します。',
                  en: 'Sliding Window (counting over a moving last-N-seconds range) mitigates this. A Sliding Window Log keeps every request timestamp for exactness; a Sliding Window Counter approximates by weighting the current and previous windows, saving memory.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: 'では「直近」をどう数えるのか。Log 方式はシンプルで、リクエストのたびに時刻を記録し、N秒より古いものを捨てて残った件数を数えます（Redis なら Sorted Set + ZREMRANGEBYSCORE + ZCARD）。正確ですが全時刻を持つのでメモリを食います。',
                  en: 'So how do you count "recent"? The Log approach is straightforward: record each request time, drop anything older than N seconds, and count what remains (in Redis: a Sorted Set with ZREMRANGEBYSCORE + ZCARD). Accurate, but it holds every timestamp, so it uses more memory.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: 'Counter 方式は、時刻を全部持つ代わりに「固定窓のカウンタ2つ（現在の窓＋1つ前の窓）」だけを保持し、現在窓が前窓にどれだけ重なっているかの割合で前窓を加重して足します。',
                  en: 'The Counter approach keeps just two fixed-window counters (the current window and the previous one) instead of all timestamps, then weights the previous window by how much the current window still overlaps it.',
                },
              },
              {
                type: 'code',
                label: { ja: 'Sliding Window Counter の計算例（窓=1分, 上限=100）', en: 'Sliding Window Counter example (window = 1 min, limit = 100)' },
                code: `previous window (12:00–12:01): 80 requests
current  window (12:01–12:02): 15 requests so far
now = 12:01:15  ->  15s into the current window
  = 25% elapsed, so 75% of the previous window still overlaps

estimate = current + previous * overlap
         = 15 + 80 * 0.75
         = 75      // < 100  -> allow`,
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'Counter は「トラフィックが窓内で均等」と仮定した近似ですが、実用上は十分正確で、メモリはカウンタ2つだけ。だから実務では Counter 方式が最もよく使われます。',
                  en: 'The Counter assumes traffic is spread evenly within a window — an approximation — but it is accurate enough in practice and costs only two counters. That is why it is the most commonly used approach in production.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'distributed',
        title: { ja: '分散環境での課題', en: 'The distributed challenge' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'サーバーが1台なら簡単ですが、複数台に増えると「カウンタをどこで管理するか」が問題になります。各サーバーが個別にカウントすると、全体の上限を超えてしまいます。',
              en: 'With one server it is easy, but across many servers the question becomes where to keep the counter. If each server counts on its own, the overall limit gets exceeded.',
            },
          },
          { type: 'diagram', id: 'rl-distributed' },
          {
            type: 'p',
            text: {
              ja: '解決策は、Redis などの共有ストアにカウンタを置き、全サーバーがそこを参照することです。これで全体で1つの上限を守れます。ただしストアへのアクセスがボトルネックや単一障害点にならないよう配慮が必要です。',
              en: 'The fix is to keep the counter in a shared store like Redis that all servers consult, enforcing a single global limit. Just be careful the store does not become a bottleneck or single point of failure.',
            },
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '共有ストアへの往復はレイテンシを生みます。厳密さと速度はトレードオフ。用途によっては各サーバーで概算し、緩めに制限する設計も選ばれます。',
              en: 'A round trip to the shared store adds latency. Accuracy versus speed is a trade-off; some designs approximate per server and limit more loosely.',
            },
          },
          {
            type: 'details',
            summary: { ja: '深掘り: カウンタを安全に更新する（原子性）', en: 'Deep dive: updating the counter safely (atomicity)' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '複数サーバーが同じカウンタを触るので、「読み取って+1して書き戻す」を素朴にやるとレースコンディションが起きます。2台が同時に「99」を読み、両方「100」に書くと、実際は101回目なのに通してしまう、といった取りこぼしです。',
                  en: 'Since many servers touch the same counter, a naive "read, add 1, write back" causes race conditions. Two servers read "99" at once and both write "100" — the 101st call slips through when it should have been blocked.',
                },
              },
              { type: 'diagram', id: 'rl-race' },
              {
                type: 'p',
                text: {
                  ja: '解決は「読み取りと更新を分けない = 原子的（atomic）に行う」こと。Redis の [INCR](https://redis.io/docs/latest/commands/incr/) は1コマンドで加算するので原子的です。ウィンドウの初回だけ EXPIRE で有効期限を付けます。',
                  en: 'The fix is to make read-and-update atomic — not two steps. Redis [INCR](https://redis.io/docs/latest/commands/incr/) increments in a single atomic command; set an EXPIRE on the first hit of the window.',
                },
              },
              {
                type: 'code',
                label: { ja: 'Redis での原子的カウント', en: 'Atomic counting in Redis' },
                code: `// per key like "rl:user:123:MINUTE"
count = INCR(key)
if count == 1:
    EXPIRE(key, 60)   // start the window
if count > LIMIT:
    reject (429)`,
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'INCR + EXPIRE の間に落ちる隙間や、より複雑なロジック（Token Bucket の補充計算など）を厳密に原子化したいときは、[Lua スクリプト](https://redis.io/docs/latest/develop/programmability/eval-intro/)で複数コマンドを1つの原子的な単位として実行します。',
                  en: 'To close the tiny gap between INCR and EXPIRE, or to make more complex logic (like Token Bucket refill math) strictly atomic, run the commands as one atomic unit via a [Lua script](https://redis.io/docs/latest/develop/programmability/eval-intro/).',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'storage',
        title: { ja: 'カウンタをどこに保存するか', en: 'Where to store the counters' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'レートリミッターが保存するデータは、主に「カウンタ（＝いま何回来たか）」という状態です。このデータには2つの強い特性があります: リクエストのたびに読み書きされる超高頻度なこと、そして一定時間で消える一時的なものであること。',
              en: 'The data a rate limiter stores is mostly state: the counters (how many hits so far). This data has two strong traits — it is read and written on every request (very high frequency), and it is transient (it expires after a time window).',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**インメモリ KVS（Redis / Memcached）が最適**: メモリ上なので μs 級に速く、毎リクエストの判定に耐える',
                en: '**In-memory KV (Redis / Memcached) is the best fit**: memory-speed (microseconds), fast enough for a per-request check',
              },
              {
                ja: '**TTL で自動失効**: 窓が終わればカウンタを自動削除でき、掃除が不要',
                en: '**TTL auto-expiry**: counters vanish when the window ends, so no manual cleanup',
              },
              {
                ja: '**原子的操作**: INCR や Lua で、複数ノードからの同時更新を安全に扱える',
                en: '**Atomic ops**: INCR and Lua safely handle concurrent updates from multiple nodes',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'SQL などの永続DBはカウンタ保存には不向きです。毎リクエストでディスクI/Oが発生し、レート制限の判定自体がボトルネックになります。レート制限は「速く判定する」ことが目的なので、そこが遅いと本末転倒です。',
              en: 'A persistent SQL database is a poor fit for the counters: disk I/O on every request makes the rate-limit check itself a bottleneck. The whole point of a limiter is a fast decision, so a slow store defeats the purpose.',
            },
          },
          {
            type: 'details',
            summary: { ja: '深掘り: 設定（ルール）データと、消失の許容', en: 'Deep dive: config (rules) data, and tolerating loss' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: 'カウンタ（状態）とは別に、「誰が・どのエンドポイントで・何回まで」というルール設定も保存します。これは変更頻度が低く、消えては困る永続データなので、通常のDBや設定ストアに置き、起動時に読み込んでメモリにキャッシュするのが定石です。状態は Redis、設定は永続DB、と役割を分けます。',
                  en: 'Separate from the counters (state), you also store the rules: who, on which endpoint, up to how many. Rules change rarely and must not be lost, so they live in a regular database or config store, loaded at startup and cached in memory. Split the roles: state in Redis, rules in a persistent DB.',
                },
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'カウンタが消えても実害は小さい: Redis が再起動してカウンタを失っても、一時的に制限が緩むだけで、致命的なデータ損失にはなりません。だから永続性より速度を優先できます。厳密さが要るなら AOF/レプリカで補強します。',
                  en: 'Losing counters is low-impact: if Redis restarts and loses them, limits just loosen briefly — not a critical data loss. So you can favor speed over durability, and add AOF/replicas if you need more strictness.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'rl-architecture',
        title: { ja: '全体アーキテクチャ', en: 'Putting it all together' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'これまでの要素をまとめると、レートリミッターの全体像はこうなります。リクエストは API Gateway で受け、共有カウンタ（Redis）を原子的に更新して判定。許可なら Service へ通し、超過なら 429 で即座に弾きます。',
              en: 'Combining everything, here is the full picture of the rate limiter. Requests arrive at the API Gateway, which atomically updates a shared counter (Redis) to decide: allow through to the Service, or reject immediately with 429.',
            },
          },
          { type: 'diagram', id: 'rl-architecture' },
          {
            type: 'list',
            items: [
              {
                ja: '**配置**: エッジ（API Gateway）で判定し、下流の Service を無駄な負荷から守る',
                en: '**Placement**: decide at the edge (API Gateway) to shield downstream services from wasted load',
              },
              {
                ja: '**識別子**: 認証済みなら user ID / API キー単位、未認証なら IP を補助的に',
                en: '**Identifier**: key on user ID / API key when authenticated, with IP as a fallback',
              },
              {
                ja: '**アルゴリズム**: バーストを許容しつつ平均を抑える Token Bucket が定番。境界問題を避けたいなら Sliding Window',
                en: '**Algorithm**: Token Bucket is the default (allows bursts, bounds average); Sliding Window if you want to avoid the boundary problem',
              },
              {
                ja: '**共有ストア**: 複数 Gateway で1つの上限を守るため Redis を共有。INCR / Lua で原子的に更新',
                en: '**Shared store**: Redis shared across gateways to enforce one global limit; updated atomically with INCR / Lua',
              },
              {
                ja: '**レスポンス**: 超過は 429 + Retry-After / X-RateLimit-* ヘッダでクライアントに伝える',
                en: '**Response**: signal excess with 429 plus Retry-After / X-RateLimit-* headers',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '面接では「どこで・何を基準に・どのアルゴリズムで・分散でどう一貫性を保ち・超過時に何を返すか」の5点を全体図の上で一貫して説明できると、設計を俯瞰できていることが伝わります。',
              en: 'In an interview, walk this diagram covering five points coherently — where, keyed on what, which algorithm, how consistency holds across nodes, and what you return on excess — to show you can see the whole design.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'sli-slo-sla',
    category: 'sre',
    publishedAt: '2026-10-01',
    updatedAt: '2026-10-01',
    title: { ja: 'SLI / SLO / SLA', en: 'SLI / SLO / SLA' },
    tagline: {
      ja: '信頼性を数字で決めて、守り、上手に使う。YouTube の動画再生を例に。',
      en: 'Define reliability in numbers, defend it, and spend it wisely, using YouTube video playback as the example.',
    },
    sections: [
      {
        id: 'slo-intro',
        title: { ja: 'なぜ必要か', en: 'Why it matters' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '「YouTube は絶対に止まってはいけない」と言いたくなりますが、**100% の信頼性は目指すべき目標ではありません**。視聴者のスマホの回線や Wi-Fi のほうが、よほど頻繁に途切れます。その差は誰にも気づかれないのに、99.99% を 99.999% にするには、費用も手間も桁違いにかかります。',
              en: 'It is tempting to say "YouTube must never go down", but **100% reliability is the wrong target**. A viewer\'s phone network or Wi-Fi drops far more often than that. Nobody would notice the difference, yet going from 99.99% to 99.999% costs an order of magnitude more money and effort.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'しかも信頼性を上げるほど、新機能を出すスピードは落ちます。変更はいつも障害のきっかけになるからです。そこで「どこまで信頼できれば十分か」を数字で決めて、開発と運用で合意します。その道具が SLI・SLO・SLA です。',
              en: 'On top of that, the more reliability you demand, the slower you can ship features, because every change is a chance to break something. So you decide in numbers how reliable is "reliable enough", and agree on it across development and operations. SLIs, SLOs and SLAs are the tools for that.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'この記事の数字は、説明のための仮の値です。YouTube の実際の SLO は公開されていません。',
              en: 'The numbers in this article are illustrative. YouTube\'s real SLOs are not public.',
            },
          },
        ],
      },
      {
        id: 'slo-terms',
        title: { ja: '3つの違い', en: 'How the three differ' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**SLI（Service Level Indicator）**: 実際に測る指標。例: 再生ボタンを押した回数のうち、動画が実際に再生開始した割合',
                en: '**SLI (Service Level Indicator)**: the metric you actually measure. Example: of all presses of the play button, the share where the video actually started',
              },
              {
                ja: '**SLO（Service Level Objective）**: SLI の目標値。チームの中の約束。例: 30 日間で 99.9% 以上',
                en: '**SLO (Service Level Objective)**: the target for an SLI, a promise inside the team. Example: at least 99.9% over 30 days',
              },
              {
                ja: '**SLA（Service Level Agreement）**: 顧客との契約。破ると返金などのペナルティがある。例: 99.5% を下回ったら月額料金の一部を返金',
                en: '**SLA (Service Level Agreement)**: a contract with customers, with penalties such as refunds when broken. Example: refund part of the monthly fee if it drops below 99.5%',
              },
            ],
          },
          { type: 'diagram', id: 'slo-ladder' },
          {
            type: 'p',
            text: {
              ja: '大事なのは並び順です。**SLA は SLO より緩く**しておきます。SLO を守るよう運用していれば、SLA 違反の手前で異変に気づいて手を打てるからです。SLO と SLA を同じ値にすると、目標を外した瞬間に返金が発生してしまいます。',
              en: 'The order is what matters. **Keep the SLA looser than the SLO.** If you operate to the SLO, you notice trouble and act before you get anywhere near an SLA breach. If the SLO and SLA are the same number, missing your target means paying refunds on the spot.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '無料で見ている視聴者との間に、ふつう SLA はありません。SLA が登場するのは、動画配信の仕組みを企業に有料で提供する場合のように、契約がある場面です。一方 SLI と SLO は、契約がなくても社内の信頼性の管理に使います。',
              en: 'There is usually no SLA with viewers who watch for free. SLAs appear where there is a paid contract, for example when a company buys video delivery as a service. SLIs and SLOs, on the other hand, are used internally to manage reliability whether or not a contract exists.',
            },
          },
        ],
      },
      {
        id: 'slo-sli',
        title: { ja: 'SLI の選び方', en: 'Choosing SLIs' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'SLI は**ユーザーが感じることを測る**のが原則です。基本の形は「良いイベント ÷ 全イベント」の割合です。割合にしておくと 0〜100% にそろい、サービスや時間帯が違っても比べやすくなります。',
              en: 'The rule for SLIs is to **measure what users actually feel**. The basic shape is a ratio: good events ÷ all events. As a ratio it always falls between 0 and 100%, which makes it easy to compare across services and times of day.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'YouTube なら、ユーザーの行動（ユーザージャーニー）ごとに SLI を立てます。',
              en: 'For YouTube, you set SLIs per user journey.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**再生開始の成功率（可用性）**: 再生を試みた回数のうち、動画が再生開始した割合。目標 99.9%',
                en: '**Playback start success (availability)**: of all playback attempts, the share where the video started. Target 99.9%',
              },
              {
                ja: '**再生開始までの速さ（レイテンシ）**: 再生開始のうち、2 秒以内に最初の映像が出た割合。目標 99%',
                en: '**Time to start (latency)**: of all playback starts, the share where the first frame appeared within 2 seconds. Target 99%',
              },
              {
                ja: '**再生の滑らかさ（品質）**: 再生のうち、読み込み待ちで止まった時間が再生時間の 1% 未満だった割合。目標 98%',
                en: '**Smooth playback (quality)**: of all plays, the share where time spent stalled while buffering was under 1% of the watch time. Target 98%',
              },
              {
                ja: '**アップロード後の処理（鮮度）**: アップロードされた動画のうち、10 分以内に視聴できるようになった割合。目標 99%',
                en: '**Upload processing (freshness)**: of all uploaded videos, the share that became watchable within 10 minutes. Target 99%',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '目標はジャーニーごとに変えてかまいません。再生開始は一番大事なので厳しく、コメントの表示などはもう少し緩くてもよい、という具合です。',
              en: 'Targets can differ per journey. Playback starting is the most important, so it gets the strictest target; something like loading comments can be a bit looser.',
            },
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'CPU 使用率やメモリ使用量は SLI に向きません。CPU が 90% でも動画が問題なく再生されていればユーザーは困りませんし、逆に CPU が低くても再生が失敗していることがあります。こうした値は、原因を調べるための指標として別に見ます。',
              en: 'CPU and memory usage make poor SLIs. Users are fine if CPU is at 90% and videos still play, and playback can fail while CPU is low. Watch those numbers separately, as tools for finding causes.',
            },
          },
        ],
      },
      {
        id: 'slo-measure',
        title: { ja: 'どこで測るか', en: 'Where to measure' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '同じ「再生開始の成功率」でも、どこで測るかで見えるものが変わります。',
              en: 'Even for the same "playback start success" SLI, where you measure it changes what you can see.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**サーバーのログ**: 一番手軽。ただし、リクエストがサーバーに届かなかった失敗（回線や DNS の問題）は記録されない',
                en: '**Server logs**: the easiest option, but failures where the request never reached the server (network or DNS problems) are never recorded',
              },
              {
                ja: '**CDN やロードバランサー**: 動画を配る入口で測る。サーバーが落ちて返せなかった分も数えられる',
                en: '**CDN or load balancer**: measure at the edge that serves video. Requests that failed because a server was down are counted too',
              },
              {
                ja: '**外からの定期チェック（合成監視）**: 世界各地から決まった動画を定期的に再生してみる。トラフィックが少ない時間帯でも異常に気づける',
                en: '**Probes from outside (synthetic monitoring)**: play a known video on a schedule from locations around the world. You catch problems even when real traffic is low',
              },
              {
                ja: '**プレイヤー側の計測**: アプリやブラウザのプレイヤーが「再生開始できたか」を報告する。ユーザーの体験に一番近いが、集計の仕組みづくりに手間がかかる',
                en: '**Player-side telemetry**: the app or browser player reports whether playback started. Closest to what users experience, but building the reporting pipeline takes effort',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'ユーザーに近いほど正確で、サーバーに近いほど手軽です。最初はロードバランサーで測り始めて、余力ができたらプレイヤー側の計測を足す、という順番が現実的です。',
              en: 'The closer to the user, the more accurate; the closer to the server, the easier. A realistic path is to start at the load balancer and add player-side telemetry once you have the capacity.',
            },
          },
        ],
      },
      {
        id: 'slo-target',
        title: { ja: 'SLO の決め方', en: 'Setting SLOs' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**測る期間**: 「直近 30 日」のように、毎日少しずつずれていく期間（ローリングウィンドウ）で見るのが一般的。月初にリセットされる「暦の月」より、ユーザーの体感に近い',
                en: '**Measurement window**: a rolling window such as "the last 30 days" is the usual choice. It matches how users experience the service better than a calendar month that resets on the 1st',
              },
              {
                ja: '**目標値**: 今の実績から決める。過去 1 か月が 99.95% なら、まずは 99.9% あたりから始める',
                en: '**Target**: start from what you achieve today. If the last month was at 99.95%, begin around 99.9%',
              },
              {
                ja: '**レイテンシの書き方**: 平均ではなく「2 秒以内に始まった割合」のように閾値で書く。平均は一部の極端に遅い再生を隠してしまう',
                en: '**Writing latency targets**: use a threshold such as "the share that started within 2 seconds", not an average. An average hides the few extremely slow plays',
              },
              {
                ja: '**見直し**: SLO は一度決めて終わりではない。四半期ごとなどに、ユーザーの不満や障害の振り返りと照らして調整する',
                en: '**Review**: an SLO is not set once and forgotten. Revisit it, for example every quarter, against user complaints and incident reviews',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '最初から高すぎる目標にしないこと。守れない SLO は誰も気にしなくなり、意味を失います。**緩めに始めて、少しずつ締める**ほうがうまくいきます。',
              en: 'Do not start with a target that is too high. An SLO nobody can meet is soon ignored and loses its meaning. **Start loose and tighten gradually.**',
            },
          },
        ],
      },
      {
        id: 'slo-nines',
        title: { ja: '9 の数と許される停止時間', en: 'Counting nines and allowed downtime' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '可用性は「99.9%（スリーナイン）」のように 9 の数で呼ばれます。数字の差は小さく見えますが、**9 が1つ増えるごとに、許される停止時間は 1/10 になります**。下の計算機で目標を切り替えてみてください。',
              en: 'Availability is often described by its count of nines, as in "99.9% (three nines)". The numbers look close together, but **each extra nine cuts the allowed downtime to a tenth**. Try switching targets in the calculator below.',
            },
          },
          { type: 'diagram', id: 'slo-nines' },
          {
            type: 'list',
            items: [
              {
                ja: '**99.9%**: 30 日で 43.2 分、1 日なら約 1 分 26 秒まで止まってよい',
                en: '**99.9%**: up to 43.2 minutes per 30 days, or about 1 minute 26 seconds per day',
              },
              {
                ja: '**99.99%**: 30 日で約 4 分 19 秒。人が呼び出されてから対応を始めるだけで、使い切ってしまう長さ',
                en: '**99.99%**: about 4 minutes 19 seconds per 30 days, gone in the time it takes an on-call engineer to start responding',
              },
              {
                ja: '**規模で考える**: YouTube のように再生回数が膨大だと、99.9% でも 10 億回の再生のうち 100 万回の失敗を許すことになる。割合が同じでも、影響を受ける人の数は大きい',
                en: '**Think in scale**: with YouTube\'s volume, even 99.9% allows 1 million failures per billion plays. The same percentage still affects a large number of people',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'もう1つ大事なのが、**依存先の可用性は掛け算になる**ことです。再生には認証・動画情報・配信（CDN）の 3 つが必要で、それぞれが 99.9% なら、全体は `0.999 × 0.999 × 0.999 ≈ 99.7%` まで下がります。全体の SLO は、依存先の SLO より高くできません。',
              en: 'One more key point: **the availability of dependencies multiplies**. If playback needs auth, video metadata and delivery (CDN), each at 99.9%, the whole drops to `0.999 × 0.999 × 0.999 ≈ 99.7%`. Your overall SLO cannot be higher than what your dependencies provide.',
            },
          },
        ],
      },
      {
        id: 'slo-budget',
        title: { ja: 'エラーバジェット', en: 'Error budgets' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '`100% − SLO` が、失敗してよい量になります。これを**エラーバジェット（失敗の予算）**と呼びます。SLO 99.9% なら予算は 0.1% で、30 日間なら 43.2 分ぶんの停止にあたります。',
              en: '`100% − SLO` is the amount of failure you are allowed. This is the **error budget**. With an SLO of 99.9% the budget is 0.1%, which over 30 days is worth 43.2 minutes of downtime.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '予算は「使ってよいもの」です。残っているうちは新機能のリリースや実験に使い、使い切ったら信頼性の改善を優先します。こうすると「早く出したい開発」と「止めたくない運用」の言い争いが、**残りの予算という1つの数字の話**に変わります。',
              en: 'The budget is meant to be spent. While some is left, spend it on feature releases and experiments; once it runs out, put reliability work first. This turns the argument between "developers who want to ship" and "operators who want stability" into **a conversation about one number: the budget left**.',
            },
          },
          { type: 'diagram', id: 'slo-budget' },
          {
            type: 'p',
            text: {
              ja: '図の「大きな障害あり」では、12 日目に 30 分ほど再生開始が失敗し、1 回で予算の約 7 割を使っています。残りの日数で予算が尽きると、リリースを止めて信頼性の作業に切り替える判断になります。',
              en: 'In the "with a major outage" scenario, playback starts fail for about 30 minutes on day 12, using roughly 70% of the budget in one go. When the budget runs out before the window ends, the call is to stop releases and switch to reliability work.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '予算が尽きたときに何をするかは、事前に文書で決めておきます（エラーバジェットポリシー）。例は [SRE Workbook の Error Budget Policy](https://sre.google/workbook/error-budget-policy/) にあります。',
              en: 'Decide in writing ahead of time what happens when the budget runs out (an error budget policy). There is an example in [the SRE Workbook\'s Error Budget Policy](https://sre.google/workbook/error-budget-policy/).',
            },
          },
          {
            type: 'details',
            summary: {
              ja: '深掘り: エラーバジェットポリシーには何を書くか',
              en: 'Deep dive: what goes into an error budget policy',
            },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: 'エラーバジェットポリシーは、「予算が尽きたら何をするか」を障害が起きる前に合意しておく短い文書です。狙いは2つ。SLO 違反の繰り返しから顧客を守ることと、信頼性と機能開発のバランスを取る動機づけです。**罰ではありません**。「今は機能より信頼性が大事」とデータが示したときに、堂々と信頼性に集中してよいという許可証です。',
                  en: 'An error budget policy is a short document that agrees, before any incident, on what happens when the budget runs out. It has two goals: protect customers from repeated SLO misses, and create an incentive to balance reliability against feature work. **It is not a punishment.** It is permission to focus on reliability without guilt when the data says reliability now matters more than features.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '基本のルールはシンプルです。',
                  en: 'The core rule is simple.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**SLO 以上なら**: 通常どおりリリースを進めてよい',
                    en: '**At or above the SLO**: releases proceed as normal',
                  },
                  {
                    ja: '**予算を使い切ったら**: SLO に戻るまで、最優先の不具合（P0）とセキュリティ修正を除いて、変更とリリースをすべて止める',
                    en: '**Budget exhausted**: halt all changes and releases, except top-priority (P0) bugs and security fixes, until the service is back within SLO',
                  },
                ],
              },
              {
                type: 'p',
                text: {
                  ja: 'ただし、予算を使い切った原因によって対応は変わります。',
                  en: 'What the team does next, though, depends on why the budget was spent.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**信頼性作業を優先すべき**: 自分たちのコードのバグや手順ミスが原因だったとき。ポストモーテムで「固い依存を緩められる」と分かったとき',
                    en: '**Must work on reliability**: when the team\'s own code bug or procedural error caused the miss, or a postmortem reveals a chance to soften a hard dependency',
                  },
                  {
                    ja: '**機能開発を続けてよい**: 全社的なネットワーク障害が原因のとき。他チームのサービスが原因で、そのチームが既にリリースを凍結して対応しているとき。負荷試験など SLO の対象外のトラフィックが予算を消費したとき',
                    en: '**May keep building features**: when the cause was a company-wide network problem, or another team\'s service (and they have already frozen their own releases), or when out-of-scope traffic such as load tests consumed the budget',
                  },
                ],
              },
              {
                type: 'p',
                text: {
                  ja: '大きな障害には、追加のルールを決めておきます。',
                  en: 'Larger incidents get extra rules.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**1回の障害が予算の 20% 超を使ったら**: ポストモーテムを必ず書き、根本原因に対する P0 のアクションを最低1つ入れる',
                    en: '**A single incident spends more than 20% of the budget**: a postmortem is required, with at least one P0 action item addressing the root cause',
                  },
                  {
                    ja: '**同じ種類の障害が四半期で予算の 20% 超を使ったら**: 翌四半期の計画に、その問題を直す P0 項目を入れる',
                    en: '**One class of outage spends more than 20% over a quarter**: put a P0 item in next quarter\'s plan to fix it',
                  },
                ],
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: '予算の計算やルールの適用でもめたとき、誰が最終判断をするか（例: CTO にエスカレーション）も先に決めておくと、障害対応中の言い争いを避けられます。',
                  en: 'Decide in advance who makes the final call when people disagree about the budget math or the policy (for example, escalate to the CTO). It avoids arguments in the middle of an incident.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'slo-alerting',
        title: { ja: 'SLO にもとづくアラート', en: 'Alerting on SLOs' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '「エラー率が 1% を超えたら通知」のような決め方だと、一瞬の山で夜中に起こされたり、逆に低いエラー率が何日も続いて予算を使い切るのを見逃したりします。そこで、**予算を消費する速さ（バーンレート）**で通知します。',
              en: 'A rule like "alert when the error rate goes over 1%" either wakes people up for a brief spike, or misses a low error rate that quietly burns the whole budget over several days. So you alert on **how fast the budget is being spent (the burn rate)** instead.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**バーンレート 1**: ちょうど 30 日で予算を使い切るペース。SLO 99.9% なら、エラー率 0.1% が続いている状態',
                en: '**Burn rate 1**: the pace that uses up the budget in exactly 30 days. With an SLO of 99.9%, that is a steady 0.1% error rate',
              },
              {
                ja: '**バーンレート 14.4**: 1 時間で予算の 2% を使うペース。このままだと約 2 日で尽きるので、すぐ人を呼ぶ',
                en: '**Burn rate 14.4**: the pace that spends 2% of the budget in one hour. At that rate it is gone in about 2 days, so page someone right away',
              },
              {
                ja: '**バーンレート 6**: 6 時間で予算の 5% を使うペース。これも呼び出し',
                en: '**Burn rate 6**: the pace that spends 5% of the budget in six hours. This also pages',
              },
              {
                ja: '**バーンレート 1 が 3 日続く**: 予算の 10% を使う。急ぎではないので、翌営業日に対応するチケットにする',
                en: '**Burn rate 1 for 3 days**: spends 10% of the budget. Not urgent, so file a ticket for the next working day',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'さらに、長い窓（1 時間）と短い窓（5 分）の両方で条件を満たしたときだけ通知すると、すでに収まった障害で鳴り続けるのを防げます。これを**マルチウィンドウ・マルチバーンレート**のアラートと呼びます。',
              en: 'On top of that, alerting only when both a long window (1 hour) and a short window (5 minutes) meet the condition stops alerts from firing for an incident that is already over. This is called **multiwindow, multi-burn-rate** alerting.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'ここで使った数値は [SRE Workbook の Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) が勧める出発点です。',
              en: 'The numbers here are the starting points recommended in [Alerting on SLOs from the SRE Workbook](https://sre.google/workbook/alerting-on-slos/).',
            },
          },
          {
            type: 'details',
            summary: {
              ja: '深掘り: マルチウィンドウ・マルチバーンレートの作り方',
              en: 'Deep dive: building multiwindow, multi-burn-rate alerts',
            },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '1つのバーンレートだけで通知すると、必ずどこかで困ります。速いバーンレートだけを見ると、低いエラー率がじわじわ予算を食う障害を見逃します。逆に遅いバーンレートだけを見ると、障害がもう収まっているのにアラートが鳴り続けます（リセットが遅い）。そこで**速さの違う複数のルールを並べ**、さらに各ルールを**長い窓と短い窓の AND**にします。',
                  en: 'Alerting on a single burn rate always hurts somewhere. Watch only a fast burn rate and you miss a low error rate that quietly eats the budget. Watch only a slow one and the alert keeps firing long after the incident is over (slow to reset). So you **run several rules at different speeds**, and make each rule an **AND of a long window and a short window**.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '99.9% の SLO での出発点として、SRE Workbook はこの3段を勧めています。',
                  en: 'As a starting point for a 99.9% SLO, the SRE Workbook recommends these three tiers.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**ページ（即対応）**: 長い窓 1 時間・短い窓 5 分、バーンレート 14.4。1 時間で予算の 2% を使うペース',
                    en: '**Page (respond now)**: long window 1h, short window 5m, burn rate 14.4 — the pace that spends 2% of the budget in an hour',
                  },
                  {
                    ja: '**ページ（即対応）**: 長い窓 6 時間・短い窓 30 分、バーンレート 6。6 時間で予算の 5% を使うペース',
                    en: '**Page (respond now)**: long window 6h, short window 30m, burn rate 6 — spends 5% of the budget in six hours',
                  },
                  {
                    ja: '**チケット（翌営業日）**: 長い窓 3 日・短い窓 6 時間、バーンレート 1。3 日で予算の 10% を使うペース',
                    en: '**Ticket (next working day)**: long window 3d, short window 6h, burn rate 1 — spends 10% of the budget in three days',
                  },
                ],
              },
              {
                type: 'code',
                label: { ja: 'ページ用アラートの例（擬似）', en: 'Example paging alert (pseudo)' },
                code: `# fire only when BOTH windows exceed the threshold
page if ( burn_rate(1h) > 14.4 and burn_rate(5m) > 14.4 )
     or ( burn_rate(6h) > 6    and burn_rate(30m) > 6   )

ticket if ( burn_rate(3d) > 1  and burn_rate(6h) > 1  )`,
              },
              {
                type: 'p',
                text: {
                  ja: '短い窓は、長い窓のだいたい **1/12** にします。短い窓の役割は「まだ燃えているか」の確認です。障害が収まると短い窓の値が先に下がるので、アラートが数分で自動的に解除されます。長い窓だけだと、解除まで 1 時間待つことになります。',
                  en: 'Make the short window about **1/12** of the long one. Its job is to check "is it still burning?" When the incident ends, the short window drops first, so the alert clears itself within minutes. With only the long window, you would wait an hour for it to reset.',
                },
              },
              {
                type: 'note',
                tone: 'warn',
                text: {
                  ja: '低トラフィックのサービスでは、この方式が暴れます。1 時間に 10 リクエストしかないと、1 回の失敗で瞬間エラー率が 10% になり、巨大なバーンレートとして即ページしてしまいます。対策は、合成トラフィックで下駄を履かせる、小さなサービスをまとめて監視する、1 回の失敗の重みを下げる、などです。',
                  en: 'On low-traffic services this approach misbehaves. At 10 requests per hour, a single failure makes the instantaneous error rate 10%, which looks like a huge burn rate and pages immediately. Remedies include adding synthetic traffic, grouping small services together for monitoring, or reducing the weight of a single failure.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'slo-pitfalls',
        title: { ja: 'よくある落とし穴', en: 'Common pitfalls' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**SLI が多すぎる**: 指標が 20 個あると、どれも見られなくなる。大事なユーザージャーニーごとに数個に絞る',
                en: '**Too many SLIs**: with 20 indicators, nobody watches any of them. Keep a few per important user journey',
              },
              {
                ja: '**内部の数字を SLO にする**: CPU やキューの長さは、ユーザーの体験を表さない',
                en: '**Making internal numbers SLOs**: CPU or queue length do not describe what users experience',
              },
              {
                ja: '**SLO と SLA を同じ値にする**: 余裕がなくなり、目標を外すとすぐ契約違反になる',
                en: '**Setting the SLO equal to the SLA**: there is no margin left, so missing the target is instantly a contract breach',
              },
              {
                ja: '**決めただけで使わない**: 予算が尽きてもリリースが続くなら、SLO はただの飾り。エラーバジェットポリシーとセットで運用する',
                en: '**Setting them and never using them**: if releases continue after the budget is gone, the SLO is just decoration. Pair it with an error budget policy',
              },
              {
                ja: '**平均で測る**: 平均レイテンシは、一部の遅い再生に苦しむユーザーを隠す。閾値を超えた割合で測る',
                en: '**Measuring with averages**: average latency hides the users stuck with slow playback. Measure the share that crossed a threshold',
              },
            ],
          },
        ],
      },
      {
        id: 'slo-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '100% は目指さない。どこまでで十分かを数字で決めて合意する',
                en: 'Do not aim for 100%. Decide and agree in numbers on what is good enough',
              },
              {
                ja: 'SLI は測る指標、SLO はチームの目標、SLA は顧客との契約。SLA ＜ SLO ＜ 実際の値の順に余裕を持たせる',
                en: 'An SLI is what you measure, an SLO is the team target, an SLA is the customer contract. Leave headroom in the order SLA < SLO < actual',
              },
              {
                ja: 'SLI はユーザーが感じることを「良いイベント ÷ 全イベント」で測る',
                en: 'Measure what users feel, as good events ÷ all events',
              },
              {
                ja: '9 が1つ増えると許される停止時間は 1/10。依存先の可用性は掛け算になる',
                en: 'Each extra nine cuts allowed downtime to a tenth, and dependency availability multiplies',
              },
              {
                ja: 'エラーバジェットで開発の速さと信頼性のバランスを取り、アラートはバーンレートで出す',
                en: 'Use the error budget to balance speed and reliability, and alert on burn rate',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '基本となる考え方は Google SRE 本の [Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) と [Embracing Risk](https://sre.google/sre-book/embracing-risk/)、実践の手順は [SRE Workbook の Implementing SLOs](https://sre.google/workbook/implementing-slos/) にまとまっています。',
              en: 'The core ideas are in the Google SRE book chapters [Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) and [Embracing Risk](https://sre.google/sre-book/embracing-risk/); the practical steps are in [Implementing SLOs from the SRE Workbook](https://sre.google/workbook/implementing-slos/).',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'database-scaling',
    category: 'system-design',
    publishedAt: '2026-10-01',
    updatedAt: '2026-10-01',
    title: { ja: 'データベースのスケール', en: 'Scaling Databases' },
    tagline: {
      ja: '1台から始めて、読み取り・書き込みを横に広げる。フィード型アプリを例に。',
      en: 'Start with one box, then scale reads and writes outward. With a feed app as the example.',
    },
    sections: [
      {
        id: 'ds-intro',
        title: { ja: 'なぜスケールが要るか', en: 'Why scale at all' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'どんなサービスも、最初は **DB 1台** で十分です。フィード型アプリも、ユーザーが数千人のうちは1台で投稿もタイムライン取得もさばけます。問題はユーザーが増えてから。ある日、1台では受けきれなくなります。',
              en: 'Every service starts with **one database**, and that is fine. A feed app can serve posts and timelines from a single box while it has a few thousand users. The trouble starts as it grows: one day, one box can no longer keep up.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'まず「何が」限界なのかを見極めます。闇雲に分散させるのは、複雑さを一気に増やすので最後の手段です。',
              en: 'First, pin down **what** is actually hitting its limit. Jumping straight to a distributed setup adds a lot of complexity, so it is a last resort.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**接続数**: 同時接続が多すぎて、新しいクエリが待たされる',
                en: '**Connections**: too many concurrent connections, so new queries queue up',
              },
              {
                ja: '**CPU**: 複雑なクエリや集計で計算が追いつかない',
                en: '**CPU**: complex queries and aggregations outrun the processor',
              },
              {
                ja: '**ディスク / IOPS**: 読み書きの入出力が頭打ちになる',
                en: '**Disk / IOPS**: read/write throughput plateaus',
              },
              {
                ja: '**データ量**: データが1台のディスクやメモリに乗らなくなる',
                en: '**Data size**: the data no longer fits on one disk or in memory',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'まず計測し、インデックスやクエリの見直し、[キャッシュ](#url-shortener/cache-scale)で済むなら、そのほうが安くて簡単です。スケールの手段は、順に試すのが鉄則です。',
              en: 'Measure first. If better indexes, query tuning, or [caching](#url-shortener/cache-scale) solve it, that is cheaper and simpler. Reach for scaling techniques in order, not all at once.',
            },
          },
        ],
      },
      {
        id: 'ds-vertical',
        title: { ja: '垂直スケール（スケールアップ）', en: 'Scaling up (vertical)' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '一番簡単なのは、サーバーを**大きくする**ことです。CPU・メモリ・ディスクを増やす。コードもデータの持ち方も変えずに済むので、最初の一手として優秀です。多くのサービスは、これだけでかなり長く戦えます。',
              en: 'The simplest move is to make the server **bigger**: more CPU, memory and disk. It needs no change to your code or data layout, which makes it an excellent first step. Many services get surprisingly far on this alone.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**限界がある**: 1台のマシンの上限（最大のインスタンス）に達したら、それ以上は大きくできない',
                en: '**It has a ceiling**: once you reach the biggest machine available, you cannot go further',
              },
              {
                ja: '**コストが跳ねる**: 大きいマシンほど、性能あたりの値段が割高になりがち',
                en: '**Cost jumps**: the biggest machines cost disproportionately more per unit of performance',
              },
              {
                ja: '**単一障害点のまま**: 1台なので、落ちたら全部止まる。可用性は上がらない',
                en: '**Still a single point of failure**: it is one box, so if it dies, everything stops — availability does not improve',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'この「限界」「可用性」の2点が、次の**水平スケール（台数を増やす）**に進む理由になります。',
              en: 'Those two issues — the ceiling and availability — are what push you toward **scaling out (adding machines)** next.',
            },
          },
        ],
      },
      {
        id: 'ds-replication',
        title: { ja: '読み取りをスケールする: レプリケーション', en: 'Scaling reads: replication' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'フィード型アプリは、投稿（書き込み）よりタイムライン取得（読み取り）が圧倒的に多い **read-heavy** です。この場合の定石が**レプリケーション**。書き込みを受ける1台の**リーダー（primary）**と、その複製を持つ複数の**レプリカ（follower）**を用意し、読み取りをレプリカに分散します。',
              en: 'A feed app is **read-heavy**: fetching timelines (reads) vastly outnumbers posting (writes). The standard answer here is **replication**: one **leader (primary)** takes the writes, and several **replicas (followers)** hold copies, so reads are spread across the replicas.',
            },
          },
          { type: 'diagram', id: 'db-replication' },
          {
            type: 'list',
            items: [
              {
                ja: '**書き込みはリーダーだけ**: 更新は必ずリーダーに送り、リーダーが各レプリカへ複製する',
                en: '**Writes go only to the leader**: all updates go to the leader, which replicates them to the followers',
              },
              {
                ja: '**読み取りはレプリカへ**: タイムラインやプロフィールの取得をレプリカに振り分ける。レプリカを足せば読み取り性能が上がる',
                en: '**Reads go to replicas**: route timeline and profile fetches to replicas; add more replicas to add read capacity',
              },
              {
                ja: '**可用性も上がる**: リーダーが落ちても、レプリカの1台を新リーダーに昇格できる（フェイルオーバー）',
                en: '**Availability improves too**: if the leader dies, a replica can be promoted to become the new leader (failover)',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'これは読み取りの対策です。**書き込みはリーダー1台のまま**なので、書き込みが増えすぎると別の手（後述のシャーディング）が要ります。PostgreSQL のレプリケーションは [High Availability のドキュメント](https://www.postgresql.org/docs/current/high-availability.html) が詳しいです。',
              en: 'This scales reads only. **Writes still go through a single leader**, so once writes grow too large you need another technique (sharding, below). PostgreSQL\'s replication is covered in its [High Availability docs](https://www.postgresql.org/docs/current/high-availability.html).',
            },
          },
        ],
      },
      {
        id: 'ds-lag',
        title: { ja: 'レプリケーションラグと一貫性', en: 'Replication lag and consistency' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'レプリケーションはふつう**非同期**です。リーダーは書き込みを受けたらすぐ成功を返し、レプリカへの反映は少し遅れて届きます。この遅れを**レプリケーションラグ**と呼びます。ふだんは数ミリ秒〜数十ミリ秒ですが、負荷が高いと秒単位に伸びることもあります。',
              en: 'Replication is usually **asynchronous**: the leader returns success as soon as it commits, and the change reaches the replicas a little later. That delay is **replication lag** — typically a few to tens of milliseconds, but it can stretch to seconds under load.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'このラグが、分かりにくいバグを生みます。ツイートを投稿した直後に自分のタイムラインを開くと、**まだレプリカに届いておらず、自分の投稿が表示されない**ことがあります。これが「自分の書き込みが読めない（read-your-writes）」問題です。',
              en: 'This lag causes a subtle bug. Right after posting a tweet, you open your own timeline and **your tweet is missing, because it has not reached the replica yet**. This is the "read-your-writes" problem.',
            },
          },
          { type: 'diagram', id: 'db-replica-lag' },
          {
            type: 'list',
            items: [
              {
                ja: '**自分の書き込みは、しばらくリーダーから読む**: 投稿直後のそのユーザーだけ、少しの間だけリーダーを読ませる',
                en: '**Read your own writes from the leader for a while**: for the user who just posted, read from the leader for a short window',
              },
              {
                ja: '**最新を要求する読み取りだけ強い一貫性**: 全部ではなく「今すぐ正確であるべき」読み取りに限ってリーダーへ',
                en: '**Strong consistency only where it matters**: send only the reads that must be exactly current to the leader, not all of them',
              },
              {
                ja: '**ラグを監視する**: ラグが大きいレプリカは読み取りから一時的に外す',
                en: '**Monitor the lag**: temporarily pull replicas with high lag out of the read pool',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'この「少し古くても最終的には揃う」考え方が**結果整合性（eventual consistency）**です。SQL / NoSQL と ACID / BASE の対比は [URL短縮の DB の節](#url-shortener/database) でも触れています。',
              en: 'This "slightly stale but it converges" idea is **eventual consistency**. The SQL/NoSQL and ACID/BASE contrast also appears in the [URL shortener\'s database section](#url-shortener/database).',
            },
          },
        ],
      },
      {
        id: 'ds-sharding',
        title: { ja: '書き込みをスケールする: シャーディング', en: 'Scaling writes: sharding' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'レプリカをいくら足しても、**書き込みはリーダー1台**のままです。書き込み自体が1台の限界を超えたら、データを**複数の DB に分割**します。これが**シャーディング（水平分割）**です。各 DB（シャード）が、データの一部だけを持ちます。',
              en: 'No matter how many replicas you add, **writes still funnel through one leader**. When the write load itself exceeds one box, you **split the data across multiple databases**. This is **sharding (horizontal partitioning)**: each database (shard) holds only a slice of the data.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'どのデータをどのシャードに置くかは、**シャードキー**で決めます。フィード型アプリなら user_id が自然な候補です。分け方は主に2つ。下の図で切り替えてみてください。',
              en: 'Which data lands on which shard is decided by a **shard key**. For a feed app, user_id is a natural choice. There are two main ways to split; toggle between them in the diagram below.',
            },
          },
          { type: 'diagram', id: 'db-sharding' },
          {
            type: 'list',
            items: [
              {
                ja: '**ハッシュ分割**: `shard = hash(user_id) % N`。分布が均等になりやすい。ただしシャードを増やすと、多くのキーの置き場所が変わる（再配置が大きい）',
                en: '**Hash sharding**: `shard = hash(user_id) % N`. The distribution tends to be even, but adding a shard moves most keys (a large reshuffle)',
              },
              {
                ja: '**範囲分割**: user_id の範囲でシャードを分ける。範囲指定の検索はしやすいが、特定の範囲にアクセスが集中する**ホットスポット**が起きやすい',
                en: '**Range sharding**: split by ranges of user_id. Range scans are easy, but one range can attract most of the traffic — a **hotspot**',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'ホットスポットを避けるには、偏りにくいシャードキーを選びます。たとえば「有名人の user_id」のような一部に偏る値より、分布が均一なキーが向きます。',
              en: 'To avoid hotspots, pick a shard key that spreads evenly — a uniformly distributed key beats one that clusters, like "celebrity user_ids".',
            },
          },
          {
            type: 'details',
            summary: {
              ja: '深掘り: コンシステントハッシュ（ノード追加時の再配置を減らす）',
              en: 'Deep dive: consistent hashing (less reshuffling when you add a node)',
            },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '`shard = hash(user_id) % N` には弱点があります。シャードを増やして **N が変わると、割り算の余りがほぼ全キーで変わり、データのほとんどが別のシャードに引っ越し**になります。たとえば 4 台から 5 台にすると、約 80% のキーが移動します。移動中は負荷も跳ね上がり、現実的ではありません。',
                  en: '`shard = hash(user_id) % N` has a weakness. When you add a shard and **N changes, almost every key gets a new remainder, so most of the data has to move** to a different shard. Going from 4 to 5 shards moves about 80% of the keys. The load spikes during the move, which is impractical.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: 'これを解くのが**コンシステントハッシュ**です。考え方はこうです。',
                  en: 'Consistent hashing solves this. The idea goes like this.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**リングを作る**: ハッシュ値の範囲（0 〜 最大値）を、端と端をつないだ円（リング）として考える',
                    en: '**Make a ring**: treat the range of hash values (0 to max) as a circle, with the ends joined into a ring',
                  },
                  {
                    ja: '**キーもノードもリング上に置く**: 各シャードを `hash(ノード名)` の位置に、各データを `hash(user_id)` の位置に配置する',
                    en: '**Place both keys and nodes on the ring**: each shard sits at `hash(node name)`, each row sits at `hash(user_id)`',
                  },
                  {
                    ja: '**時計回りで担当を決める**: あるキーは、リング上を時計回りに進んで最初に出会ったノードが担当する',
                    en: '**Walk clockwise to find the owner**: a key belongs to the first node found going clockwise around the ring',
                  },
                ],
              },
              { type: 'diagram', id: 'db-consistent-hash' },
              {
                type: 'p',
                text: {
                  ja: 'こうすると、**ノードを1台足したとき、動くのは「追加した点と、その手前のノードの間」にあるキーだけ**です。残りのキーは担当が変わりません。移動量は全体の約 `1/N` に抑えられます。ノードを外すときも、その範囲を隣のノードが引き継ぐだけで済みます。',
                  en: 'Now, **adding one node only moves the keys that fall between the new point and the node just before it** on the ring. Every other key keeps its owner. The data that moves is only about `1/N` of the total. Removing a node is just as cheap: its neighbor takes over that stretch.',
                },
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'ノードをリング上に1点だけ置くと、担当範囲に偏りが出ます。そこで各ノードを**仮想ノード**として多数の点に分けてリングにばらまき、担当範囲を均一にします。',
                  en: 'Placing each node at a single point leaves uneven ranges. So each node is split into many **virtual nodes** scattered around the ring, which evens out the ranges.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: 'DynamoDB や Cassandra などの分散データベース、分散キャッシュ、ロードバランサーで広く使われています。詳しくは [Consistent hashing (Wikipedia)](https://en.wikipedia.org/wiki/Consistent_hashing) を参照。',
                  en: 'It is widely used in distributed databases like DynamoDB and Cassandra, in distributed caches, and in load balancers. See [Consistent hashing (Wikipedia)](https://en.wikipedia.org/wiki/Consistent_hashing) for more.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'ds-sharding-cost',
        title: { ja: 'シャーディングの代償', en: 'The cost of sharding' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'シャーディングは強力ですが、**一気に複雑さが増えます**。だから「最後の手段」です。データが複数の DB に散るせいで、今まで当たり前だった操作が難しくなります。',
              en: 'Sharding is powerful, but it **adds a lot of complexity all at once**, which is why it is a last resort. Because the data is now spread across databases, operations that used to be trivial become hard.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**複数シャードにまたがる検索**: 「フォロー中の全員の最新投稿」のような問い合わせが、全シャードに問い合わせて結果を集める必要がある',
                en: '**Cross-shard queries**: a query like "latest posts from everyone I follow" must hit every shard and merge the results',
              },
              {
                ja: '**JOIN が難しい**: 別シャードにあるテーブル同士は、DB の JOIN では結合できない',
                en: '**JOINs get hard**: tables that live on different shards cannot be joined by the database',
              },
              {
                ja: '**トランザクションが効きにくい**: 複数シャードをまたぐ更新を、1つの原子的な操作にするのは難しい',
                en: '**Transactions weaken**: making an update across shards one atomic operation is difficult',
              },
              {
                ja: '**リバランスが大変**: シャードを足すとき、データの引っ越しが発生する',
                en: '**Rebalancing is painful**: adding a shard means physically moving data',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'だから順番が大切です。**まず垂直スケール → キャッシュ → レプリケーション → それでも書き込みが足りなければシャーディング**。シャーディングは、必要になるまで入れないのが賢明です。',
              en: 'So the order matters: **vertical scale → caching → replication → and only if writes still overflow, sharding**. It is wise not to shard until you truly need to.',
            },
          },
        ],
      },
      {
        id: 'ds-sql-nosql',
        title: { ja: 'SQL と NoSQL（スケールの観点）', en: 'SQL and NoSQL (for scaling)' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '多くの NoSQL（DynamoDB・Cassandra など）が「水平スケールしやすい」と言われるのは、**最初からシャーディング前提で設計されている**からです。JOIN や複数行トランザクションのような、分割すると難しくなる機能を、あえて捨てる（制限する）ことで、台数を増やしやすくしています。',
              en: 'Many NoSQL stores (DynamoDB, Cassandra, etc.) are called "easy to scale horizontally" because they are **designed for sharding from day one**. They deliberately drop or limit the features that get hard once you split — JOINs, multi-row transactions — which makes adding machines easier.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**SQL（リレーショナル）**: JOIN や強いトランザクション（ACID）が得意。1台では強力だが、水平分割は自前で設計することが多い',
                en: '**SQL (relational)**: strong at JOINs and transactions (ACID). Powerful on one box, but you often design the horizontal split yourself',
              },
              {
                ja: '**NoSQL（KVS / ドキュメント / ワイドカラム）**: シャーディングが組み込み。キー引きが速く横に伸びるが、複雑な検索や結合は苦手',
                en: '**NoSQL (key-value / document / wide-column)**: sharding is built in. Fast key lookups that scale out, but weak at complex queries and joins',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '「SQL か NoSQL か」より「このデータに、どんなアクセスパターンと一貫性が要るか」で選ぶのが実践的です。1つのサービスで両方を使い分けることもよくあります。',
              en: 'In practice, choose by "what access pattern and consistency does this data need?" rather than "SQL vs NoSQL". A single service often uses both for different data.',
            },
          },
        ],
      },
      {
        id: 'ds-cache',
        title: { ja: 'キャッシュで DB を守る', en: 'Protecting the DB with caching' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'スケールの話に戻ると、**一番効く読み取り対策は、そもそも DB を読まないこと**です。よく読まれるデータ（人気ツイート、プロフィール）をキャッシュ（Redis など）に載せれば、読み取りの大半を DB の手前で返せます。レプリカを足すより安く効くことが多いです。',
              en: 'Coming back to scaling, **the most effective read optimization is to not read the DB at all**. Put frequently read data (popular tweets, profiles) in a cache (Redis) and most reads are served before they reach the DB — often cheaper and more effective than adding replicas.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**キャッシュの考え方は別記事に**: cache-aside などの戦略は [URL短縮のキャッシュの節](#url-shortener/cache-scale) で図付きで説明しています',
                en: '**Cache strategies are covered elsewhere**: cache-aside and friends are explained with a diagram in the [URL shortener\'s cache section](#url-shortener/cache-scale)',
              },
              {
                ja: '**キャッシュスタンピードに注意**: 人気データのキャッシュが同時に失効すると、全リクエストが一斉に DB へ殺到する。TTL をずらす・事前更新するなどで防ぐ',
                en: '**Beware cache stampedes**: when a hot item\'s cache expires, all requests rush the DB at once. Prevent it by jittering TTLs or refreshing ahead of expiry',
              },
            ],
          },
        ],
      },
      {
        id: 'ds-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: 'まず計測し、安易に分散しない。垂直スケール → キャッシュ → レプリケーション → シャーディングの順で考える',
                en: 'Measure first and do not distribute lightly. Think in the order: vertical scale → caching → replication → sharding',
              },
              {
                ja: 'read-heavy はレプリケーションで読み取りを横に広げる。書き込みはリーダー1台のまま',
                en: 'For read-heavy loads, replication scales reads outward; writes still go through one leader',
              },
              {
                ja: '非同期レプリケーションにはラグがある。書いた直後の読み取りはリーダーから読むなどで補う',
                en: 'Async replication has lag; cover the just-after-write read by reading from the leader',
              },
              {
                ja: '書き込みが限界ならシャーディング。シャードキーの選び方でホットスポットが決まる',
                en: 'When writes hit the limit, shard; the shard key choice decides whether you get hotspots',
              },
              {
                ja: 'シャーディングは複雑さの代償が大きい。クロスシャード検索・JOIN・トランザクションが難しくなる',
                en: 'Sharding is costly in complexity: cross-shard queries, JOINs and transactions all get harder',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '用語の整理には [Shard (Wikipedia)](https://en.wikipedia.org/wiki/Shard_%28database_architecture%29) と [Consistent hashing (Wikipedia)](https://en.wikipedia.org/wiki/Consistent_hashing)、実装例には [MongoDB の Sharding](https://www.mongodb.com/docs/manual/sharding/) が参考になります。',
              en: 'For terminology, [Shard (Wikipedia)](https://en.wikipedia.org/wiki/Shard_%28database_architecture%29) and [Consistent hashing (Wikipedia)](https://en.wikipedia.org/wiki/Consistent_hashing) help; for an implementation, see [MongoDB\'s Sharding](https://www.mongodb.com/docs/manual/sharding/).',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'retries',
    category: 'sre',
    publishedAt: '2026-10-01',
    updatedAt: '2026-10-01',
    title: { ja: 'リトライ・タイムアウト・バックオフ', en: 'Retries, Timeouts & Backoff' },
    tagline: {
      ja: '一時的な失敗を上手に拾い、やりすぎて障害を広げない。YouTube を例に。',
      en: 'Recover from transient failures without making outages worse. With YouTube as the example.',
    },
    sections: [
      {
        id: 'rt-intro',
        title: { ja: 'なぜ必要か', en: 'Why it matters' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ネットワーク越しの呼び出しは、ときどき失敗します。パケットの取りこぼし、一瞬の過負荷、サーバーの再起動などです。こうした**一時的な失敗（transient failure）**の多くは、少し待ってもう一度試すと成功します。YouTube アプリが動画情報の取得に一度失敗しても、すぐ再取得できれば、ユーザーは何も気づきません。',
              en: 'Calls over the network fail from time to time: a dropped packet, a brief overload, a server restarting. Many of these **transient failures** succeed if you simply wait a moment and try again. If the YouTube app fails once to fetch video metadata but refetches right away, the user never notices.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'ただしリトライは、使い方を間違えると**障害を広げる凶器**になります。弱ったサーバーに全員が一斉に再送すると、とどめを刺してしまうからです。この記事では、リトライを安全にするための3点セット、**タイムアウト・バックオフ・ジッター**を見ていきます。',
              en: 'But done wrong, retries become a **weapon that spreads the outage**: if everyone resends to a struggling server at once, the retries finish it off. This article walks through the trio that makes retries safe — **timeouts, backoff and jitter**.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'リトライは「一時的な失敗」にだけ有効です。404 や 400 のような、何度試しても結果が変わらない失敗はリトライしてはいけません（判断の仕方は後の節で）。',
              en: 'Retries only help with transient failures. Do not retry failures like 404 or 400 that will never change no matter how often you try (how to tell them apart is covered later).',
            },
          },
        ],
      },
      {
        id: 'rt-timeout',
        title: { ja: 'まずタイムアウト', en: 'Start with timeouts' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'リトライの前に、そもそも**いつ「失敗」と判断するか**を決める必要があります。それがタイムアウトです。応答が返ってこない呼び出しを待ち続けると、スレッドや接続がふさがり、[サーキットブレーカー](#circuit-breaker)の記事で見たような連鎖障害につながります。',
              en: 'Before retrying, you must decide **when a call counts as "failed"**. That is the timeout. Waiting forever on a call that never responds ties up threads and connections, leading to the kind of cascading failure covered in the [circuit breaker](#circuit-breaker) article.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**短すぎると**: まだ処理中の正常なリクエストまで失敗扱いにし、無駄なリトライを生む',
                en: '**Too short**: healthy requests that are still processing get marked as failures, generating pointless retries',
              },
              {
                ja: '**長すぎると**: 落ちている相手を長時間待ち、リソースを握り続ける',
                en: '**Too long**: you wait on a dead dependency for ages, holding resources the whole time',
              },
              {
                ja: '**決め方**: 正常時の応答時間の分布を見て、p99 より少し上に置くのが目安。平均ではなく裾（遅い側）で決める',
                en: '**How to set it**: look at the healthy response-time distribution and place it a bit above p99 — decide on the tail, not the average',
              },
              {
                ja: '**全体の予算から配分する**: ユーザーへの応答が 2 秒以内なら、その内側で各依存先のタイムアウトを割り振る（deadline の伝播）',
                en: '**Budget it from the whole**: if the user-facing response must be within 2s, allocate each dependency\'s timeout inside that budget (deadline propagation)',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'タイムアウトは「接続まで」と「応答全体まで」を分けて設定します。接続はすぐできるはずなので短く、処理を含む全体は少し長く、という具合です。',
              en: 'Set separate timeouts for "establishing the connection" and "the whole response". The connection should be quick, so keep it short; the full response, including processing, can be a little longer.',
            },
          },
        ],
      },
      {
        id: 'rt-storm',
        title: { ja: 'リトライの落とし穴（再送の雪崩）', en: 'The trap: retry storms' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'サーバーが一瞬だけ不調になり、多くのクライアントの呼び出しが同時に失敗したとします。全員が「1 秒後にリトライ」と決め打ちしていると、ちょうど 1 秒後に**全リトライが同じ瞬間に殺到**します。回復しかけたサーバーは、この波でまた倒れます。これが再送の雪崩（thundering herd / retry storm）です。下の図で、ジッターあり/なしを切り替えてみてください。',
              en: 'Suppose the server has a brief blip and many clients\' calls fail at the same time. If they all hardcode "retry after 1 second", then exactly 1 second later **all the retries hit at the same instant**. The barely-recovering server is knocked over again by that wave. This is the retry storm (thundering herd). Toggle jitter on and off in the diagram below.',
            },
          },
          { type: 'diagram', id: 'retry-storm' },
          {
            type: 'p',
            text: {
              ja: '対策は2つを組み合わせます。**バックオフ**で待ち時間を少しずつ延ばし、**ジッター**でその待ち時間をクライアントごとにばらけさせます。これで再送が時間軸に散らばり、サーバーが吸収できる低い波になります。',
              en: 'The fix combines two things. **Backoff** stretches the wait a little more each time, and **jitter** scatters that wait randomly across clients. Together they spread the retries over time into a low wave the server can absorb.',
            },
          },
        ],
      },
      {
        id: 'rt-backoff',
        title: { ja: 'バックオフとジッター', en: 'Backoff and jitter' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '**指数バックオフ**は、試行ごとに待ち時間を倍にしていく方法です。基本の式はこうです。',
              en: '**Exponential backoff** doubles the wait after each attempt. The basic formula is:',
            },
          },
          {
            type: 'code',
            label: { ja: '指数バックオフ + ジッター', en: 'Exponential backoff + jitter' },
            code: `wait = min(cap, base * 2^attempt)   // 0.5s, 1s, 2s, 4s, … (capped)
wait = random(0, wait)              // full jitter: spread 0..wait`,
          },
          {
            type: 'list',
            items: [
              {
                ja: '**base**: 最初の待ち時間（例: 0.5 秒）',
                en: '**base**: the first wait (e.g. 0.5s)',
              },
              {
                ja: '**cap（上限）**: 待ち時間が無限に伸びないよう頭打ちにする（例: 30 秒）',
                en: '**cap**: an upper bound so the wait does not grow forever (e.g. 30s)',
              },
              {
                ja: '**ジッター**: 計算した待ち時間を「0〜その値」の乱数にする（フルジッター）。これがばらけさせる肝',
                en: '**jitter**: replace the computed wait with a random value in 0..wait (full jitter) — this is what spreads them out',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'ジッターなしの指数バックオフだけでは不十分です。全員が同時に失敗すると、2 倍にしても「全員が同じ 2 秒後」に再送するだけだからです。AWS の実験でも、**フルジッターが競合と総リクエスト数を大きく減らす**と示されています（[Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)）。',
              en: 'Exponential backoff without jitter is not enough: if everyone fails at the same time, doubling just means everyone retries "2 seconds later" together. AWS\'s own experiments show that **full jitter sharply reduces contention and total request count** ([Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)).',
            },
          },
          { type: 'diagram', id: 'retry-backoff' },
          {
            type: 'details',
            summary: {
              ja: '深掘り: 数秒ずらすだけで、なぜ効くのか',
              en: 'Deep dive: why shifting by a few seconds actually works',
            },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '「たった数秒」でも効くのは、サーバーが落ちるかどうかを決めるのが**総リクエスト数ではなく、一瞬のピーク（同時に来る数）**だからです。効き方は2つに分けて考えると分かりやすいです。',
                  en: 'A few seconds matters because whether a server falls over is decided by **the instantaneous peak (how many arrive at once), not the total count**. It helps to split the effect into two parts.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '**① ジッターがピークを下げる（これが本命）**',
                  en: '**(1) Jitter lowers the peak — this is the main effect**',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '24 台が同時に失敗し、全員きっかり 2 秒後に再送すると、その瞬間に 24 件が1点に集中します。サーバーの容量が「0.25 秒あたり 14 件」なら、軽く超えて再び落ちます。ここで待ち時間を 0〜2 秒の乱数にばらすと、24 件が 2 秒間（＝0.25 秒のバケット 8 個）に散り、1 バケットあたり平均 `24 ÷ 8 = 3 件`。ピークが 24 → 3 前後に下がり、容量 14 の内側に収まります。**延ばした長さより、「同じ瞬間をなくした」ことが効いています。**',
                  en: 'If 24 clients fail together and all retry exactly 2 seconds later, 24 requests pile onto a single instant. If the server\'s capacity is "14 per 0.25s", that spike blows past it and it falls again. Spread the wait randomly over 0–2 seconds and those 24 requests scatter across 2 seconds (eight 0.25s buckets), about `24 ÷ 8 = 3` per bucket. The peak drops from 24 to around 3, comfortably under the capacity of 14. **What helped was removing the shared instant, not the length of the delay.**',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '**② 指数バックオフが総量を抑える**',
                  en: '**(2) Exponential backoff holds down the total**',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '相手が長く不調なとき、固定間隔（毎秒リトライ）だと一定ペースで叩き続けます。10 秒ダウンすれば 1 台につき約 10 回。指数バックオフ（0.5 → 1 → 2 → 4 秒…）なら、同じ 10 秒で約 4 回に減ります。待つほど呼び出し頻度が自動で下がるので、弱った相手に浴びせる総負荷が小さくなり、回復する時間を与えられます。',
                  en: 'When the dependency stays unhealthy, a fixed interval (retry every second) keeps hammering at a constant pace: about 10 tries per client over a 10-second outage. Exponential backoff (0.5 → 1 → 2 → 4 s…) cuts that to about 4 tries in the same 10 seconds. The longer you wait, the less often you call, so the total load on the struggling dependency shrinks and it gets room to recover.',
                },
              },
              {
                type: 'note',
                tone: 'tip',
                text: {
                  ja: 'どちらか片方では足りません。バックオフだけだと「全員が同じ 2 秒後」に揃うのでピークは下がりません。ジッターだけだと総量は減りません。**両方そろって初めて、ピークを下げつつ総量も抑えられます。**',
                  en: 'Neither half is enough alone. Backoff without jitter still lines everyone up at "2 seconds later", so the peak stays high. Jitter without backoff does not reduce the total. **Only together do they both lower the peak and hold down the total.**',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'rt-budget',
        title: { ja: 'リトライの回数を制限する', en: 'Capping how much you retry' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'バックオフとジッターで波を平すだけでは足りません。相手が本当に落ちているなら、リトライは**いつか必ず打ち切る**必要があります。打ち切らないと、無駄な負荷をかけ続けます。',
              en: 'Smoothing the wave with backoff and jitter is not enough. If the dependency is truly down, retries **must eventually stop**. Otherwise you just keep piling on useless load.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**回数の上限**: 「最大 3 回まで」のように単純に打ち切る。一番簡単',
                en: '**A max attempt count**: simply stop after, say, 3 tries. The simplest option',
              },
              {
                ja: '**リトライ予算（retry budget）**: 「全リクエストのうちリトライは 10% まで」のように、システム全体でリトライの総量を制限する。1 件ずつの上限より、過負荷時の暴走を防げる',
                en: '**A retry budget**: cap total retries system-wide, e.g. "retries may be at most 10% of all requests". Better than a per-call limit at preventing runaway load under stress',
              },
              {
                ja: '**多層でリトライしない**: 各層がそれぞれ 3 回リトライすると、3 層で最大 27 倍になる。リトライするのは原則1つの層だけにする',
                en: '**Do not retry at every layer**: if each of 3 layers retries 3 times, that is up to 27× the load. As a rule, retry at only one layer',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'リトライとサーキットブレーカーは組み合わせます。ブレーカーが OPEN の間はリトライしません（即フォールバック）。多層リトライの増幅は、過負荷対策の定番論点です（[Google SRE 本 · Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)）。',
              en: 'Combine retries with a circuit breaker: do not retry while the breaker is OPEN (fall back immediately). The amplification from retrying at multiple layers is a classic overload topic ([Google SRE book · Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/)).',
            },
          },
        ],
      },
      {
        id: 'rt-what',
        title: { ja: '何をリトライしてよいか', en: 'What is safe to retry' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'すべての失敗をリトライしてよいわけではありません。2つの軸で判断します。「一時的な失敗か」と「同じ操作を2回やって安全か」です。',
              en: 'Not every failure should be retried. Judge on two axes: "is it transient?" and "is doing the operation twice safe?"',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**リトライしてよい**: タイムアウト、接続エラー、[503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503)、429（レート制限）。これらは待てば変わる可能性がある',
                en: '**Safe to retry**: timeouts, connection errors, [503 Service Unavailable](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503), 429 (rate limited). These may change if you wait',
              },
              {
                ja: '**リトライしてはいけない**: 400（不正なリクエスト）、404（存在しない）、401/403（認証・認可）。何度試しても同じ結果',
                en: '**Do not retry**: 400 (bad request), 404 (not found), 401/403 (auth). The result will be the same no matter how often you try',
              },
              {
                ja: '**サーバーの指示に従う**: 429 や 503 が [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After) ヘッダを返したら、自分のバックオフより優先してその時間だけ待つ',
                en: '**Obey the server**: when a 429 or 503 includes a [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After) header, wait that long instead of your own backoff',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'もう1つの軸が**冪等性（べきとうせい / idempotency）**です。同じリクエストを2回処理しても結果が変わらない操作は、安全にリトライできます。読み取り（GET）はもともと安全です。書き込みは、**冪等キー**（リクエストごとに一意な ID）を付けて、サーバー側で「この ID は処理済み」と重複を弾けるようにします。',
              en: 'The other axis is **idempotency**: an operation you can process twice with the same result is safe to retry. Reads (GET) are naturally safe. For writes, attach an **idempotency key** (a unique ID per request) so the server can reject a duplicate as "already processed".',
            },
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '冪等でない書き込みを素朴にリトライすると、二重課金や二重投稿が起きます。「視聴回数 +1」のような操作も、リトライで二重に数えないよう冪等キーで守ります。',
              en: 'Naively retrying a non-idempotent write causes double charges or double posts. Even an operation like "+1 view count" needs an idempotency key so a retry does not count it twice.',
            },
          },
        ],
      },
      {
        id: 'rt-server',
        title: { ja: 'サーバー側の備え', en: 'The server\'s side' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'リトライはクライアントだけの話ではありません。サーバー側も、リトライされる前提で振る舞うと全体が安定します。',
              en: 'Retries are not only a client concern. The whole system is steadier when the server behaves as if it will be retried.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**早く正しく断る**: 過負荷なら、遅く処理するより [503](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503) + [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After) で早く断るほうが、クライアントのリトライを制御できる',
                en: '**Reject fast and clearly**: under overload, returning [503](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/503) + [Retry-After](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Retry-After) quickly beats processing slowly — it lets you steer the client\'s retries',
              },
              {
                ja: '**負荷を落とす（load shedding）**: 全部を遅くするより、一部を早く断って残りを守る。これも過負荷対策の基本（[Google SRE 本 · Handling Overload](https://sre.google/sre-book/handling-overload/)）',
                en: '**Shed load**: rather than slowing everything, reject some requests fast to protect the rest — a core overload tactic ([Google SRE book · Handling Overload](https://sre.google/sre-book/handling-overload/))',
              },
              {
                ja: '**冪等キーを尊重する**: 同じキーの再送は、処理済みの結果をそのまま返す',
                en: '**Honor idempotency keys**: for a resend with the same key, return the already-computed result',
              },
            ],
          },
        ],
      },
      {
        id: 'rt-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: 'まずタイムアウトで「失敗」を素早く判定する。全体の時間予算から各依存先に配分する',
                en: 'Start with timeouts to decide "failed" quickly, allocated to each dependency from an overall time budget',
              },
              {
                ja: '一時的な失敗だけをリトライする。404 や 400 はリトライしない',
                en: 'Retry only transient failures; never retry 404 or 400',
              },
              {
                ja: '指数バックオフで待ちを倍にし、フルジッターでばらす。これで再送の雪崩を防ぐ',
                en: 'Double the wait with exponential backoff and scatter it with full jitter to prevent retry storms',
              },
              {
                ja: 'リトライは必ず上限で打ち切る。回数・リトライ予算・単層リトライで総量を抑える',
                en: 'Always cap retries: use a max count, a retry budget, and retry at a single layer to bound the total',
              },
              {
                ja: '書き込みは冪等キーで安全にする。サーバーは早く正しく断り、ブレーカーが OPEN ならリトライしない',
                en: 'Make writes safe with idempotency keys; the server rejects fast and clearly, and do not retry while the breaker is OPEN',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'circuit-breaker',
    category: 'sre',
    publishedAt: '2026-09-30',
    updatedAt: '2026-09-30',
    title: { ja: 'サーキットブレーカー', en: 'Circuit Breaker' },
    tagline: {
      ja: '障害の連鎖を止める、回復性パターンの定番。',
      en: 'A classic resilience pattern that stops failures from cascading.',
    },
    sections: [
      {
        id: 'cb-intro',
        title: { ja: 'なぜ必要か', en: 'Why it matters' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'マイクロサービスでは、1つのリクエストの裏で決済・在庫・推薦など複数のサービスを呼び出します。そのうち1つが遅くなったり落ちたりしたとき、何も対策がないと呼び出し側まで巻き込まれて止まってしまいます。',
              en: 'In a microservice system, one request fans out to several services behind the scenes: payments, inventory, recommendations. When one of them slows down or fails, a caller with no protection gets dragged down with it.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'サーキットブレーカーは、家の分電盤のブレーカーと同じ発想です。失敗が一定以上続いたら「回路を開いて」呼び出しを止め、しばらく待ってから少しだけ試して、直っていれば元に戻します。壊れている相手を叩き続けないことで、**自分を守り、相手が回復する時間も作ります**。',
              en: 'A circuit breaker works like the breaker in your home\'s electrical panel. When failures keep piling up, it "opens the circuit" and stops calling; after a while it tries a little, and if things are fixed it closes again. By not hammering a broken dependency, it **protects the caller and gives the dependency room to recover**.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'このパターンは Michael Nygard の『Release It!』で広まりました。短い解説として [Martin Fowler の CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html) が定番です。',
              en: 'The pattern was popularized by Michael Nygard\'s book "Release It!". For a short introduction, [Martin Fowler\'s CircuitBreaker](https://martinfowler.com/bliki/CircuitBreaker.html) is the classic read.',
            },
          },
        ],
      },
      {
        id: 'cb-cascade',
        title: { ja: '障害はどう連鎖するか', en: 'How failures cascade' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '実は、依存先が**完全に落ちる**より**遅くなる**方が危険です。すぐエラーが返れば呼び出し側はすぐ次へ進めますが、応答が返ってこないとタイムアウトまでスレッドや接続を握ったまま待ち続けるからです。',
              en: 'A dependency that is **slow** is actually more dangerous than one that is **down**. A fast error lets the caller move on immediately, but a missing response keeps a thread or connection tied up until the timeout fires.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '例: checkout-svc が毎秒 100 件のリクエストを受け、それぞれが payments-api を呼ぶとします。payments-api が応答しなくなりタイムアウトが 5 秒だと、同時に待っているリクエストは `100 件/秒 × 5 秒 = 500 件` に膨らみます。スレッドプールが 200 なら 2 秒で埋まり、**決済と関係ない商品ページまで返せなくなります**。',
              en: 'Example: checkout-svc handles 100 requests per second and each one calls payments-api. If payments-api stops responding and the timeout is 5 seconds, the number of requests waiting at once grows to `100 req/s × 5 s = 500`. With a thread pool of 200, it fills up in 2 seconds, and **even product pages that never touch payments stop responding**.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '待ち時間が伸びる → 処理中のリクエストが溜まる → スレッド・メモリ・接続が枯渇する',
                en: 'Latency grows → in-flight requests pile up → threads, memory and connections run out',
              },
              {
                ja: 'リトライが負荷を増やす: 失敗した呼び出しを全員がやり直すと、弱った依存先へのトラフィックが何倍にもなる',
                en: 'Retries add load: when every caller retries failed calls, traffic to the struggling dependency multiplies',
              },
              {
                ja: '呼び出し側も遅くなり、さらにその上流も巻き込まれる。こうして障害がドミノ倒しのように広がる',
                en: 'The caller slows down too and drags its own upstream callers with it; the failure spreads like dominoes',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '連鎖障害の原因と対策は [Google SRE 本の Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) に詳しくまとまっています。',
              en: 'The causes and remedies of cascading failures are covered in depth in [Addressing Cascading Failures from the Google SRE book](https://sre.google/sre-book/addressing-cascading-failures/).',
            },
          },
        ],
      },
      {
        id: 'cb-states',
        title: { ja: '3つの状態', en: 'The three states' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'サーキットブレーカーは、依存先への呼び出しを包む小さな状態機械です。下の図では、payments-api が遅くなってから回復するまでの流れがループします。',
              en: 'A circuit breaker is a small state machine wrapped around calls to a dependency. The diagram below loops through what happens as payments-api slows down and then recovers.',
            },
          },
          { type: 'diagram', id: 'cb-state-machine' },
          {
            type: 'list',
            items: [
              {
                ja: '**CLOSED（閉）**: 通常の状態。呼び出しはそのまま通し、成功と失敗を数え続ける。失敗が閾値を超えたら OPEN へ',
                en: '**CLOSED**: the normal state. Calls pass through while successes and failures are counted. When failures cross the threshold, it moves to OPEN',
              },
              {
                ja: '**OPEN（開）**: 依存先を呼ばずに、すぐ失敗かフォールバックを返す（fail fast）。一定の待機時間が過ぎたら HALF-OPEN へ',
                en: '**OPEN**: the dependency is not called at all; the breaker immediately returns an error or a fallback (fail fast). After a wait duration, it moves to HALF-OPEN',
              },
              {
                ja: '**HALF-OPEN（半開）**: 少数の試しの呼び出しだけを通す。成功すれば CLOSED に戻り、失敗すれば OPEN に戻って待機をやり直す',
                en: '**HALF-OPEN**: only a small number of trial calls get through. If they succeed it goes back to CLOSED; if they fail it returns to OPEN and the wait starts over',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: 'ブレーカーは**依存先ごと**に持ちます。payments-api が壊れても、inventory-api への呼び出しまで止める必要はありません。',
              en: 'Keep one breaker **per dependency**. When payments-api breaks, there is no reason to stop calling inventory-api.',
            },
          },
        ],
      },
      {
        id: 'cb-thresholds',
        title: { ja: 'いつ開くか（閾値の決め方）', en: 'When to open (choosing thresholds)' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '「どれくらい失敗したら開くか」の決め方は大きく2つです。',
              en: 'There are two main ways to decide how much failure should open the breaker.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**連続失敗数**: 「5 回続けて失敗したら開く」。一番シンプルで、上の図もこの方式。ただしトラフィックが多いと、たまたまの失敗で開きやすい',
                en: '**Consecutive failures**: "open after 5 failures in a row". The simplest option, and the one the diagram uses. With heavy traffic, though, a streak of unlucky failures can open it too easily',
              },
              {
                ja: '**失敗率（スライディングウィンドウ）**: 「直近 20 回（または直近 10 秒）のうち 50% 以上が失敗したら開く」。流量に左右されにくく、実運用ではこちらが主流',
                en: '**Failure rate over a sliding window**: "open when 50% or more of the last 20 calls (or the last 10 seconds) failed". Less sensitive to traffic volume, and the usual choice in production',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '失敗率を使うときは、あわせて次の2つも決めます。',
              en: 'When you use a failure rate, you also set two more things.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**最小呼び出し数**: 呼び出しが 2 回で 1 回失敗しただけで「50%」にならないよう、たとえば 10 回に満たないうちは判定しない',
                en: '**Minimum number of calls**: so that 1 failure out of 2 calls does not count as "50%", skip the check until, say, 10 calls have been recorded',
              },
              {
                ja: '**遅い呼び出しの扱い**: エラーにならなくても「2 秒以上かかった呼び出し」を失敗と同じように数える。完全に落ちる前の「遅くなった」段階で開けるので、連鎖を早めに止められる',
                en: '**Slow calls**: count calls that took longer than, say, 2 seconds as failures even if they succeeded. This lets the breaker open at the "getting slow" stage, before a full outage, and stop the cascade earlier',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '**何を失敗として数えるか**が重要です。タイムアウト・接続エラー・5xx は依存先の不調なので数えます。400 や 404 のようなクライアント側の誤り（4xx）は依存先が正常に答えているだけなので、数えてはいけません。',
              en: '**What counts as a failure** matters. Timeouts, connection errors and 5xx responses mean the dependency is unhealthy, so count them. Client errors like 400 or 404 (4xx) mean the dependency answered correctly, so do not count them.',
            },
          },
          {
            type: 'details',
            summary: { ja: '設定の例を見る', en: 'See an example configuration' },
            blocks: [
              {
                type: 'code',
                label: { ja: 'payments-api 用ブレーカーの設定例', en: 'Example breaker settings for payments-api' },
                code: `payments-api:
  slidingWindowType: COUNT      # judge on the last N calls
  slidingWindowSize: 20
  minimumNumberOfCalls: 10      # no decision before 10 calls
  failureRateThreshold: 50      # open at >= 50% failures
  slowCallDurationThreshold: 2s # calls slower than 2s ...
  slowCallRateThreshold: 50     # ... also open it at >= 50%
  waitDurationInOpenState: 10s  # stay OPEN for 10s
  permittedCallsInHalfOpen: 3   # then allow 3 trial calls
  recordFailures: [Timeout, ConnectError, Http5xx]
  ignoreFailures: [Http4xx]`,
              },
              {
                type: 'p',
                text: {
                  ja: '項目名は Java の定番ライブラリ [Resilience4j の CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker) を参考にしています。ほかのライブラリでも、ほぼ同じ項目を設定します。',
                  en: 'The setting names follow [Resilience4j\'s CircuitBreaker](https://resilience4j.readme.io/docs/circuitbreaker), a popular Java library. Other libraries expose nearly the same knobs.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'cb-fallback',
        title: { ja: '開いている間どう返すか', en: 'What to return while it is open' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'OPEN の間は依存先を呼ばないので、5 秒待つはずだった失敗が数ミリ秒で返ります。これだけでもスレッドが解放され、呼び出し側は生き残れます。そのうえで「エラーの代わりに何を返すか（フォールバック）」を決めておくと、ユーザーへの影響をさらに小さくできます。',
              en: 'While OPEN, the dependency is not called, so a failure that would have taken 5 seconds comes back in milliseconds. That alone frees up threads and keeps the caller alive. On top of that, deciding what to return instead of an error (a fallback) shrinks the impact on users even further.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**キャッシュや古いデータを返す**: 商品の在庫数など、少し古くても表示できれば十分なもの',
                en: '**Serve cached or stale data**: things like stock counts, where a slightly old value is good enough to show',
              },
              {
                ja: '**既定値を返す**: 推薦が取れなければ「人気ランキング」を出す',
                en: '**Return a default**: if recommendations are unavailable, show the "most popular" list instead',
              },
              {
                ja: '**機能を一時的に隠す**: レビュー欄が取れなければ、その欄だけ表示しない。ページ全体は出せる',
                en: '**Hide the feature for now**: if reviews cannot be fetched, drop just that section and still render the page',
              },
              {
                ja: '**後で処理する**: 決済の承認などはキューに積んで、回復してから処理する',
                en: '**Process it later**: put things like payment authorizations on a queue and handle them after recovery',
              },
              {
                ja: '**はっきり失敗を返す**: 代わりがない処理は 503 と `Retry-After` を返す（考え方は [レートリミッターの 429 レスポンス](#rate-limiter/response) と同じ）',
                en: '**Fail explicitly**: when there is no substitute, return 503 with `Retry-After` (the same idea as the [rate limiter\'s 429 response](#rate-limiter/response))',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'フォールバック自体が、壊れた依存先や同じ DB に頼っていないか確認しましょう。フォールバックが重い処理だと、今度はそれが新しいボトルネックになります。',
              en: 'Check that the fallback itself does not rely on the broken dependency or the same database. A heavy fallback just becomes the next bottleneck.',
            },
          },
        ],
      },
      {
        id: 'cb-half-open',
        title: { ja: '回復をどう確かめるか', en: 'How to detect recovery' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '待機時間が過ぎると HALF-OPEN になり、決めた件数（たとえば 3 件）だけ本物の呼び出しを通します。その件数を超えたリクエストは、まだフォールバックで返します。試しの呼び出しが成功すれば CLOSED に戻り、1 件でも失敗すれば OPEN に戻って待機をやり直します。',
              en: 'Once the wait duration passes, the breaker goes HALF-OPEN and lets a set number of real calls through (say, 3). Requests beyond that still get the fallback. If the trial calls succeed it returns to CLOSED; if any of them fail it goes back to OPEN and the wait starts over.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**試しの件数を絞る**: いきなり全トラフィックを戻すと、回復しかけの依存先をまた倒してしまう',
                en: '**Keep trial calls few**: sending all traffic back at once can knock over a dependency that is only just recovering',
              },
              {
                ja: '**待機時間を伸ばしていく**: 何度も OPEN に戻るなら、10 秒 → 20 秒 → 40 秒と待機を伸ばす（指数バックオフ）',
                en: '**Grow the wait**: if it keeps falling back to OPEN, stretch the wait from 10s to 20s to 40s (exponential backoff)',
              },
              {
                ja: '**タイミングをずらす**: 数百台のインスタンスが同じ瞬間に試すと、それ自体が負荷の山になる。待機時間にランダムなゆらぎ（ジッター）を足す',
                en: '**Spread out the timing**: hundreds of instances probing at the same instant create a load spike of their own, so add random jitter to the wait',
              },
            ],
          },
        ],
      },
      {
        id: 'cb-combine',
        title: { ja: '他の仕組みとの組み合わせ', en: 'Combining it with other patterns' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'サーキットブレーカーは単体では完成しません。次の仕組みと組み合わせて使います。',
              en: 'A circuit breaker is not complete on its own. It is used together with these patterns.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**タイムアウト**: ブレーカーが失敗を数えられるのは、呼び出しがいつか終わるから。すべての外部呼び出しに必ずタイムアウトを付ける',
                en: '**Timeouts**: the breaker can only count failures because calls eventually end. Put a timeout on every remote call',
              },
              {
                ja: '**リトライ（指数バックオフ＋ジッター）**: 一時的なエラーはリトライで救う。ただしブレーカーが OPEN のときはリトライしない',
                en: '**Retries (exponential backoff + jitter)**: retries rescue transient errors, but do not retry while the breaker is OPEN',
              },
              {
                ja: '**バルクヘッド**: 依存先ごとにスレッドや接続の枠を分け、1 つが詰まっても他を巻き込まないようにする（[Azure の Bulkhead パターン](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)）',
                en: '**Bulkheads**: give each dependency its own pool of threads or connections so one clog does not drag down the rest ([Azure\'s Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead))',
              },
              {
                ja: '**レートリミッター**: 向きが逆の仕組み。[レートリミッター](#rate-limiter) は呼び出し元が多すぎるときに**自分**を守り、ブレーカーは依存先が弱っているときに**相手と自分**を守る',
                en: '**Rate limiters**: the opposite direction. A [rate limiter](#rate-limiter) protects **you** from too many callers; a breaker protects **both sides** when a dependency is weak',
              },
              {
                ja: '**ヘルスチェックと外れ値検出**: ロードバランサーやプロキシが、エラーの多いインスタンスだけを振り分け先から外す。ブレーカーが「サービス全体」を見るのに対し、こちらは「1 台ごと」を見る',
                en: '**Health checks and outlier detection**: the load balancer or proxy removes only the instances that are erroring. A breaker looks at the whole service; these look at one host at a time',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'リトライとブレーカーの役割の違いは [Azure の Circuit Breaker パターン](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) にも整理されています。',
              en: 'The difference between retries and breakers is also laid out in [Azure\'s Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker).',
            },
          },
        ],
      },
      {
        id: 'cb-placement',
        title: { ja: 'どこに実装するか', en: 'Where to implement it' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**アプリ内のライブラリ**: Resilience4j などを使い、依存先の呼び出しごとに包む。フォールバックをコードで細かく書けるのが強み',
                en: '**A library in the app**: wrap each dependency call with something like Resilience4j. The strength is that you can write fine-grained fallbacks in code',
              },
              {
                ja: '**サービスメッシュやプロキシ**: Envoy などがネットワークの層で肩代わりする。アプリのコードを変えずに全サービスへ適用できるが、フォールバックの中身までは書けない',
                en: '**A service mesh or proxy**: Envoy and similar tools handle it at the network layer. You can apply it to every service without code changes, but you cannot write the fallback logic there',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '名前に注意: Envoy の [circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking) は「最大接続数・最大リクエスト数」の上限で、この記事の状態機械とは別物です（どちらかというとバルクヘッドに近い）。失敗したホストを一時的に外す動きは [outlier detection](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier) が担います。',
              en: 'Watch the naming: Envoy\'s [circuit breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking) is a set of limits on connections and requests, not the state machine in this article (it is closer to a bulkhead). Temporarily ejecting failing hosts is done by [outlier detection](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier).',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'ブレーカーの状態は、ふつうインスタンスごとにメモリで持ちます。台数が多いと各台が別々のタイミングで開きますが、それで問題ありません。状態を Redis などで共有すると、その共有先が新しい障害点になるからです。',
              en: 'Breaker state is usually kept in memory on each instance. With many instances, each one opens at a slightly different moment, and that is fine: sharing the state through something like Redis would just add a new point of failure.',
            },
          },
        ],
      },
      {
        id: 'cb-code',
        title: { ja: '実装イメージ', en: 'What the code looks like' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '失敗率で判定するブレーカーの流れを、疑似コードで書くとこうなります。',
              en: 'Here is the flow of a failure-rate breaker, written as pseudocode.',
            },
          },
          {
            type: 'code',
            label: { ja: '失敗率で判定するブレーカー（疑似コード）', en: 'A failure-rate breaker (pseudocode)' },
            code: `state = CLOSED
window = SlidingWindow(size = 20)   // results of the last 20 calls
openedAt = null

call(request):
    if state == OPEN:
        if now() - openedAt < WAIT:      // still cooling down
            return fallback(request)      // fail fast, no remote call
        state = HALF_OPEN                 // time to test the dependency

    try:
        response = dependency.call(request, timeout = 800ms)
        window.record(SUCCESS)
        if state == HALF_OPEN:
            state = CLOSED                // it recovered
            window.clear()
        return response

    catch Timeout, ConnectionError, ServerError:
        window.record(FAILURE)
        if state == HALF_OPEN
           or (window.count() >= 10 and window.failureRate() >= 0.5):
            state = OPEN
            openedAt = now()
        return fallback(request)`,
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '実際のライブラリでは、HALF-OPEN で通す件数の上限や、複数スレッドから同時に呼ばれたときの排他もここに加わります。自作するより、定番ライブラリを使うのが安全です。',
              en: 'Real libraries also cap the number of calls allowed in HALF-OPEN and handle concurrent callers safely. Using a well-known library is safer than writing your own.',
            },
          },
        ],
      },
      {
        id: 'cb-observe',
        title: { ja: '監視と運用', en: 'Monitoring and operations' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ブレーカーが開いたということは、どこかで問題が起きているということです。SRE の視点では、ブレーカーは「早期警報」の役割も果たします。',
              en: 'An open breaker means something is wrong somewhere. From an SRE point of view, breakers double as an early warning system.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**状態の変化をすべて記録する**: いつ、どの依存先のブレーカーが開いて閉じたかをログとメトリクスに残す',
                en: '**Record every state change**: log and emit metrics for when each dependency\'s breaker opened and closed',
              },
              {
                ja: '**開いたらアラート**: OPEN が続いている、または何度も開閉を繰り返しているならオンコール担当に知らせる',
                en: '**Alert when it opens**: page on-call if a breaker stays OPEN or keeps flapping between states',
              },
              {
                ja: '**見るべき数字**: 失敗率、遅い呼び出しの割合、拒否した（fail fast した）件数、フォールバックを返した件数',
                en: '**Numbers to watch**: failure rate, slow-call rate, calls rejected by fail fast, and fallbacks served',
              },
              {
                ja: '**手動で操作できるようにする**: 障害対応中に強制的に開く・閉じるスイッチがあると、切り分けや段階的な復旧に使える',
                en: '**Allow manual control**: a switch to force a breaker open or closed during an incident helps with isolating the problem and recovering step by step',
              },
            ],
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'フォールバックが働いている間は、ユーザーからはエラーに見えません。だからこそ、ブレーカーのメトリクスを見ていないと「実は依存先が 1 時間落ちていた」に気づけません。',
              en: 'While fallbacks are working, users do not see errors. That is exactly why, without breaker metrics, you might not notice that a dependency has been down for an hour.',
            },
          },
        ],
      },
      {
        id: 'cb-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '目的は、壊れた依存先に待たされ続けて、自分まで止まる連鎖障害を防ぐこと',
                en: 'The goal is to stop cascading failures, where waiting on a broken dependency takes you down too',
              },
              {
                ja: 'CLOSED → OPEN → HALF-OPEN → CLOSED の 3 状態。ブレーカーは依存先ごとに持つ',
                en: 'Three states: CLOSED → OPEN → HALF-OPEN → CLOSED, with one breaker per dependency',
              },
              {
                ja: '開く条件は失敗率＋最小呼び出し数＋遅い呼び出し。4xx は失敗に数えない',
                en: 'Open on failure rate, with a minimum number of calls and slow calls counted; do not count 4xx',
              },
              {
                ja: 'OPEN の間はフォールバックを返し、HALF-OPEN では少数の試行で回復を確かめる',
                en: 'Serve fallbacks while OPEN, and confirm recovery in HALF-OPEN with a few trial calls',
              },
              {
                ja: 'タイムアウト・リトライ・バルクヘッドと組み合わせ、状態の変化は監視してアラートにする',
                en: 'Combine it with timeouts, retries and bulkheads, and monitor state changes with alerts',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'chaos-engineering',
    category: 'sre',
    publishedAt: '2026-10-06',
    updatedAt: '2026-10-06',
    title: { ja: 'カオスエンジニアリング', en: 'Chaos Engineering' },
    tagline: {
      ja: 'わざと小さく壊して、障害への備えが本当に効くかを確かめる。',
      en: 'Break things on purpose, in small ways, to prove your safeguards actually work.',
    },
    sections: [
      {
        id: 'ce-intro',
        title: { ja: 'なぜ必要か', en: 'Why it matters' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'これまでの記事で、[リトライとタイムアウト](#retries)、[サーキットブレーカー](#circuit-breaker)、[レートリミッター](#rate-limiter) など、障害に備える仕組みを見てきました。でも、それが**本番で本当に効くか**は、実際に障害が起きるまでわかりません。タイムアウトの値が大きすぎた、ブレーカーの設定が誤っていた、フォールバックが一度も動いたことがなかった、と本番障害のさなかに気づくのは一番つらい形です。',
              en: 'Earlier articles covered safeguards against failure: [retries and timeouts](#retries), [circuit breakers](#circuit-breaker), [rate limiters](#rate-limiter). But whether they **actually work in production** is unknown until something breaks. Finding out mid-incident that a timeout was too long, a breaker was misconfigured, or a fallback had never run is the worst way to learn.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'カオスエンジニアリングは、**障害をわざと、小さく、管理された形で起こして**、システムがどう振る舞うかを確かめる取り組みです。本番で起きる前に弱点を見つけ、直しておくことが目的です。',
              en: 'Chaos engineering means **causing failures on purpose, in small and controlled ways**, to see how the system behaves. The goal is to find weaknesses and fix them before production finds them for you.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '単体テストや結合テストでは見つかりにくい弱点があります。実際のトラフィック量、ネットワークの遅延、サービス同士の依存の重なり、設定の食い違いなどは、本番に近い環境でしか表に出ません。',
              en: 'Some weaknesses are hard to catch in unit or integration tests. Real traffic volume, network latency, layered dependencies between services and configuration drift only show up in production-like conditions.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '「本番でランダムにサーバーを落とす危ないこと」と思われがちですが、実際は**仮説を立てて、影響範囲を絞り、止める条件を決めて行う実験**です。Netflix がクラウド移行のときに広めた手法で、原則は [Principles of Chaos Engineering](https://principlesofchaos.org/) にまとまっています。',
              en: 'It is often pictured as "randomly killing servers in production", but in practice it is **an experiment with a hypothesis, a limited blast radius and a defined stop condition**. Netflix popularized it during its move to the cloud, and the principles are summarized at [Principles of Chaos Engineering](https://principlesofchaos.org/).',
            },
          },
        ],
      },
      {
        id: 'ce-loop',
        title: { ja: '実験の進め方', en: 'Running an experiment' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'カオスエンジニアリングは、科学の実験と同じ手順で進めます。',
              en: 'A chaos experiment follows the same steps as a science experiment.',
            },
          },
          { type: 'diagram', id: 'chaos-loop' },
          {
            type: 'list',
            items: [
              {
                ja: '**定常状態を決める**: 「正常」とは何かを、ユーザーから見える指標で決める。CPU 使用率のような内部の値より、成功率や応答時間のような [SLI](#sli-slo-sla/slo-sli) が向いている',
                en: '**Define the steady state**: decide what "normal" means using metrics users can feel. User-facing [SLIs](#sli-slo-sla/slo-sli) such as success rate and latency work better than internal values like CPU usage',
              },
              {
                ja: '**仮説を立てる**: 「payments-api が 2 秒遅くなっても、商品ページの成功率は 99.9% を保つはずだ」のように、変わらないはずのことを書く',
                en: '**Form a hypothesis**: write down what should not change, e.g. "even if payments-api slows down by 2 seconds, product pages stay at 99.9% success"',
              },
              {
                ja: '**障害を注入する**: 遅延、エラー、停止など、現実に起きうる障害を、小さな範囲に起こす',
                en: '**Inject a fault**: introduce something that really happens (latency, errors, outages) within a small scope',
              },
              {
                ja: '**観察する**: 定常状態の指標を、注入していない比較対象と見比べる。中止条件に届いたらすぐ止める',
                en: '**Observe**: compare the steady-state metrics against an untouched control group, and stop immediately if the abort condition is reached',
              },
              {
                ja: '**学んで直す**: 仮説が外れたところが弱点。直したらもう一度確かめ、少しずつ範囲を広げる',
                en: '**Learn and fix**: wherever the hypothesis failed is a weakness. Fix it, test again, and widen the scope little by little',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '**仮説が外れるのは失敗ではありません**。それこそが、本番障害になる前に見つけたかった弱点です。逆に、何も起きなかった実験も「備えが効いている」という確かな根拠になります。',
              en: '**A failed hypothesis is not a failed experiment.** It is exactly the weakness you wanted to find before it became an incident. And an experiment where nothing happens is solid evidence that your safeguards work.',
            },
          },
        ],
      },
      {
        id: 'ce-example',
        title: { ja: '実験の例：依存先が遅くなったら', en: 'Example: a slow dependency' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '[サーキットブレーカーの記事](#circuit-breaker/cb-cascade) と同じ例で考えます。checkout-svc が payments-api を呼んでいて、payments-api が遅くなると、スレッドが埋まって決済と関係ない商品ページまで返せなくなる、という話でした。ブレーカーを入れたなら、それが本当に効くかを確かめます。',
              en: 'Take the same setup as the [circuit breaker article](#circuit-breaker/cb-cascade): checkout-svc calls payments-api, and when payments-api slows down, threads fill up until even product pages that never touch payments stop responding. Having added a breaker, you now check that it really works.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**定常状態**: 商品ページの成功率 99.95% 前後',
                en: '**Steady state**: product page success rate around 99.95%',
              },
              {
                ja: '**仮説**: payments-api に 2 秒の遅延を足しても、商品ページの成功率は SLO の 99.9% を保つ',
                en: '**Hypothesis**: adding 2 seconds of latency to payments-api keeps product pages at the 99.9% SLO',
              },
              {
                ja: '**注入**: payments-api への呼び出しの一部に、2 秒の遅延を 30 秒間入れる',
                en: '**Injection**: add 2 seconds of latency to a portion of calls to payments-api for 30 seconds',
              },
              {
                ja: '**中止条件**: 商品ページの成功率が 99.0% を下回ったら、注入を自動で止める',
                en: '**Abort condition**: if the product page success rate drops below 99.0%, stop the injection automatically',
              },
            ],
          },
          { type: 'diagram', id: 'chaos-experiment' },
          {
            type: 'p',
            text: {
              ja: 'ブレーカーがない（または正しく効いていない）と、遅延がスレッドを埋めて成功率が落ち、中止ラインに届いた時点で実験は自動で止まります。これは「仮説が外れた」＝弱点が見つかった、という結果です。中止条件を決めておいたおかげで、影響は数秒・一部のユーザーにとどまります。ブレーカーが効いていれば、決済だけがすぐ失敗を返し、商品ページは SLO を保ったまま耐えます。',
              en: 'Without a breaker (or with one that is not working), the latency fills up threads, the success rate falls, and the experiment stops itself as soon as it hits the abort line. The hypothesis failed: a weakness was found. Because the abort condition was set in advance, the impact stays at a few seconds and a few users. With a working breaker, only payments fail fast, and product pages hold the SLO.',
            },
          },
        ],
      },
      {
        id: 'ce-safety',
        title: { ja: '安全に行うために', en: 'Doing it safely' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'カオスエンジニアリングで一番大事なのは、**実験そのものが障害にならない**ことです。',
              en: 'The most important rule is that **the experiment itself must not become the incident**.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**影響範囲（ブラストラジアス）を小さく始める**: 1 台のインスタンス、1% のトラフィック、社内ユーザーだけ、のように絞る。結果を見てから少しずつ広げる',
                en: '**Start with a small blast radius**: one instance, 1% of traffic, or internal users only. Widen it gradually once you have results',
              },
              {
                ja: '**中止条件を先に決めて、自動で止める**: SLO や成功率に基準を置き、届いたら人を待たずに注入を止める',
                en: '**Define abort conditions up front and automate them**: tie them to the SLO or success rate, and stop the injection without waiting for a person',
              },
              {
                ja: '**すぐ止められるようにする**: 実験を一括で取り消すスイッチを用意し、全員が場所を知っている状態にする',
                en: '**Be able to stop instantly**: have a single switch that cancels the experiment, and make sure everyone knows where it is',
              },
              {
                ja: '**ステージングから始める**: まず本番に近い検証環境で試し、手順と中止の仕組みが動くことを確かめてから本番へ',
                en: '**Start in staging**: try it in a production-like environment first, and move to production only after the procedure and abort mechanism are proven',
              },
              {
                ja: '**エラーバジェットの範囲で行う**: [エラーバジェット](#sli-slo-sla/slo-budget) が残り少ないときは実験しない。実験もバジェットを使う',
                en: '**Stay within the error budget**: don\'t experiment when the [error budget](#sli-slo-sla/slo-budget) is nearly spent. Experiments spend budget too',
              },
              {
                ja: '**事前に知らせ、見ている人を置く**: 時間帯を選び、関係するチームに伝え、監視画面を見ている担当者がいる状態で行う',
                en: '**Announce it and have someone watching**: pick a sensible time, tell the affected teams, and have someone watching the dashboards',
              },
            ],
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '監視やアラートが整っていない状態でのカオス実験は、ただの障害です。**先に「壊れたことに気づける」状態を作る**のが前提です。',
              en: 'Running chaos experiments without good monitoring and alerting is just causing an outage. **Being able to notice when something breaks** comes first.',
            },
          },
        ],
      },
      {
        id: 'ce-faults',
        title: { ja: '何を注入するか', en: 'What to inject' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '注入する障害は、**実際に起きたこと、起きうること**から選びます。過去の障害報告（ポストモーテム）は、実験のアイデアの宝庫です。',
              en: 'Pick faults from **what has happened or realistically could**. Past incident reports (postmortems) are a great source of experiment ideas.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**遅延**: 依存先の応答を遅くする。タイムアウトとサーキットブレーカーの確認に向く。完全に落ちるより、遅くなる方が危ないことが多い',
                en: '**Latency**: slow a dependency down. Good for testing timeouts and circuit breakers, and often more dangerous than a clean outage',
              },
              {
                ja: '**エラー**: 一定の割合で 500 エラーや接続失敗を返させる。リトライとフォールバックの確認に向く',
                en: '**Errors**: return 500s or connection failures for a share of requests. Good for testing retries and fallbacks',
              },
              {
                ja: '**インスタンスやコンテナの停止**: 1 台が落ちても自動で入れ替わり、トラフィックが逃げるかを確かめる',
                en: '**Killing instances or containers**: check that a lost node is replaced automatically and traffic moves away from it',
              },
              {
                ja: '**依存先やゾーンの停止**: DB の切り替え、キャッシュの喪失、アベイラビリティゾーン単位の障害など',
                en: '**Losing a dependency or zone**: database failover, a wiped cache, an entire availability zone going down',
              },
              {
                ja: '**リソースの枯渇**: CPU、メモリ、ディスク、接続数を使い切らせる',
                en: '**Resource exhaustion**: use up CPU, memory, disk or connections',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '道具としては、Netflix の [Chaos Monkey](https://netflix.github.io/chaosmonkey/) のようなオープンソースや、[AWS Fault Injection Service](https://docs.aws.amazon.com/fis/latest/userguide/what-is.html) のようなクラウドのマネージドサービスがあります。ただし、最初はツールより**手順と中止条件を決めること**の方が大事です。',
              en: 'Tools range from open source such as Netflix\'s [Chaos Monkey](https://netflix.github.io/chaosmonkey/) to managed cloud services such as [AWS Fault Injection Service](https://docs.aws.amazon.com/fis/latest/userguide/what-is.html). At the start, though, **agreeing on the procedure and stop conditions** matters more than the tool.',
            },
          },
        ],
      },
      {
        id: 'ce-gameday',
        title: { ja: 'ゲームデイ：人と手順を鍛える', en: 'Game days: training people and process' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ゲームデイは、チームで時間を決めて障害を起こし、**対応する練習**をする日です。システムだけでなく、人と手順の弱点も見つかります。',
              en: 'A game day is a scheduled session where a team causes a failure and **practices responding to it**. It finds weaknesses in people and process, not just systems.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: 'アラートは鳴ったか。鳴るまでに何分かかったか',
                en: 'Did the alert fire, and how many minutes did it take?',
              },
              {
                ja: '担当者は手順書（ランブック）を見つけられたか。手順書は今のシステムに合っていたか',
                en: 'Could the on-call engineer find the runbook, and did it match the current system?',
              },
              {
                ja: '誰が判断し、誰に連絡するかは明確だったか',
                en: 'Was it clear who decides and who gets contacted?',
              },
              {
                ja: 'ダッシュボードだけで原因の見当がついたか',
                en: 'Could the dashboards alone point toward the cause?',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '終わったら、本物の障害と同じように振り返りを書き、見つかった課題を直します。何度も練習しておくと、本番の障害で慌てずに動けるようになります。',
              en: 'Afterwards, write a review just like for a real incident and fix what you found. Practicing repeatedly is what lets a team stay calm during a real outage.',
            },
          },
        ],
      },
      {
        id: 'ce-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**カオスエンジニアリングは実験**。定常状態、仮説、注入、観察、学ぶ、を繰り返す',
                en: '**Chaos engineering is experimentation**: steady state, hypothesis, inject, observe, learn, repeated',
              },
              {
                ja: '**障害への備えは、確かめて初めて信頼できる**。リトライ、タイムアウト、ブレーカーが本当に効くかを、本番で起きる前に見る',
                en: '**Safeguards are only trustworthy once tested.** Check that retries, timeouts and breakers really work before production tests them for you',
              },
              {
                ja: '**小さく始めて、中止条件を自動にする**。実験そのものを障害にしない',
                en: '**Start small and automate the abort.** Never let the experiment become the incident',
              },
              {
                ja: '**監視が先、エラーバジェットの範囲で**。気づけない状態や、バジェットが尽きかけているときは行わない',
                en: '**Monitoring first, within the error budget.** Don\'t experiment if you can\'t see failures or the budget is nearly gone',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'さらに詳しくは、[Principles of Chaos Engineering](https://principlesofchaos.org/) と、Google の SRE 本の [Testing for Reliability](https://sre.google/sre-book/testing-reliability/) がまとまっています。',
              en: 'For more, see [Principles of Chaos Engineering](https://principlesofchaos.org/) and the [Testing for Reliability](https://sre.google/sre-book/testing-reliability/) chapter of Google\'s SRE book.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'aws-us-east-1-2025',
    category: 'sre',
    publishedAt: '2026-10-08',
    updatedAt: '2026-10-08',
    title: { ja: '障害を読む: AWS us-east-1（2025年10月）', en: 'Reading an outage: AWS us-east-1 (October 2025)' },
    tagline: {
      ja: 'DNS の競合状態ひとつから、14 時間半の連鎖障害へ。きっかけを直しても戻らなかった理由を図で追う。',
      en: 'From one DNS race condition to a 14½-hour cascade, and why fixing the trigger did not end it.',
    },
    sections: [
      {
        id: 'ua-intro',
        title: { ja: '何が起きたか', en: 'What happened' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'この記事は、AWS が公開した障害報告 [Summary of the Amazon DynamoDB Service Disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/101925/) を読み解くものです。2025 年 10 月 19 日の夜から 20 日の午後にかけて、AWS の北バージニアリージョン（us-east-1）で大規模な障害が起きました。始まりは 19 日 23:48、終わりは 20 日 14:20（どちらも PDT）で、約 14 時間半続きました。',
              en: 'This article walks through AWS\'s published incident report, [Summary of the Amazon DynamoDB Service Disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/101925/). From the night of October 19 to the afternoon of October 20, 2025, AWS\'s Northern Virginia Region (us-east-1) had a major outage. It began at 23:48 on the 19th and ended at 14:20 on the 20th (both PDT), lasting about 14½ hours.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'AWS の発表では、利用者への影響は大きく **3 つの時間帯**に分かれます。',
              en: 'According to AWS, customer impact came in **three distinct periods**.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**DynamoDB（23:48〜02:40）**: API のエラー率が上がり、新しい接続を張れなくなった',
                en: '**DynamoDB (23:48 to 02:40)**: elevated API error rates, and new connections could not be established',
              },
              {
                ja: '**EC2（02:25〜10:36、通信の問題は 13:50 まで）**: 新しいインスタンスの起動が失敗した。10:37 から起動できるようになったが、一部は通信できない状態が続いた',
                en: '**EC2 (02:25 to 10:36, connectivity issues until 13:50)**: new instance launches failed. Launches worked again from 10:37, but some new instances still had no connectivity',
              },
              {
                ja: '**NLB（05:30〜14:09）**: 一部のロードバランサーで接続エラーが増えた',
                en: '**NLB (05:30 to 14:09)**: some load balancers saw increased connection errors',
              },
            ],
          },
          { type: 'diagram', id: 'ua-timeline' },
          {
            type: 'p',
            text: {
              ja: '注目したいのは、**きっかけの DynamoDB は 02:40 には戻っていた**ことです。それなのに障害はそこから 11 時間以上続きました。きっかけを直した後に、別の仕組みが次々と詰まっていったからです。この記事では、その連鎖を順に追います。',
              en: 'The striking part is that **DynamoDB, the trigger, was back by 02:40**, yet the outage went on for more than 11 more hours. After the trigger was fixed, one system after another got stuck. This article follows that chain step by step.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '事実関係は、冒頭の AWS の公開報告だけを根拠にしています。時刻は原文どおり PDT（太平洋夏時間）で、日本時間はこれに 16 時間を足します（始まりは 10 月 20 日 15:48 JST）。図は説明のために簡略化しています。',
              en: 'All facts come solely from AWS\'s public report linked above. Times are PDT as in the original (UTC−7). The diagrams are simplified for explanation.',
            },
          },
        ],
      },
      {
        id: 'ua-chain',
        title: { ja: '連鎖の全体像', en: 'The chain at a glance' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '細部に入る前に、何が何を引き起こしたかを並べます。上の段の問題の間に溜まった影響が下の段へ流れ込み、今度はそこが詰まる、という形が繰り返されています。',
              en: 'Before the details, here is what caused what. The effects that built up while an upper stage was broken flowed into the stage below, which then got stuck in turn.',
            },
          },
          { type: 'diagram', id: 'ua-cascade' },
          {
            type: 'p',
            text: {
              ja: 'もう 1 つ大事な点として、**すでに動いていた EC2 インスタンスは、障害の間ずっと正常**でした。EC2 で止まったのは、新しいインスタンスを起動し、ネットワークにつなぐ、という**変更の経路**です。',
              en: 'Another key point: **EC2 instances that were already running stayed healthy throughout**. What broke in EC2 was the **path for change**: launching new instances and connecting them to the network.',
            },
          },
        ],
      },
      {
        id: 'ua-dns',
        title: { ja: 'DynamoDB の DNS 管理の仕組み', en: 'How DynamoDB manages its DNS' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'DynamoDB のような大きなサービスは、**DNS を使って負荷を分散し、障害を切り離しています**。各リージョンには非常に多くのロードバランサーがあり、DNS レコードは数十万に上ります。容量の追加やハードウェア障害に合わせて、これを自動で更新し続けています。',
              en: 'Large services like DynamoDB **rely on DNS to spread load and isolate failures**. Each Region runs a very large fleet of load balancers with hundreds of thousands of DNS records, and automation keeps updating them as capacity is added or hardware fails.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'この自動化は、可用性のために 2 つの独立した部品に分かれています。',
              en: 'For availability, this automation is split into two independent components.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**DNS Planner**: ロードバランサーの状態と容量を見て、エンドポイントごとに「どのロードバランサーにどの重みで振るか」という**計画**を定期的に作る',
                en: '**DNS Planner**: watches load balancer health and capacity, and periodically creates a **plan** for each endpoint: which load balancers, with what weights',
              },
              {
                ja: '**DNS Enactor**: 計画を [Route 53](https://aws.amazon.com/route53/) に適用する。どんな状況でも復旧に使えるよう依存を最小限にしてあり、3 つのアベイラビリティゾーンで 1 つずつ、互いに独立して動く',
                en: '**DNS Enactor**: applies plans to [Route 53](https://aws.amazon.com/route53/). It is built with minimal dependencies so it can help recover in any scenario, and runs redundantly and independently in three Availability Zones',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '各 Enactor は新しい計画を見つけると、Route 53 のトランザクションで現在の計画を新しい計画に置き換えます。複数の Enactor が同時に同じエンドポイントを更新しても、各エンドポイントには一貫した計画が入るようになっていました。',
              en: 'When an Enactor finds a new plan, it replaces the current plan with it using a Route 53 transaction. Even if several Enactors update the same endpoint at once, each endpoint ends up with a consistent plan.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '計画を作る側と適用する側を分け、適用する側を 3 つの AZ で冗長化する。これ自体は**障害に強くするための、筋の良い設計**です。今回の問題は、この冗長な Enactor 同士の、まれなタイミングのずれから生まれました。',
              en: 'Separating plan creation from plan application, with the applier redundant across three AZs, is **a sound design for resilience**. The problem came from a rare timing interaction between those redundant Enactors.',
            },
          },
        ],
      },
      {
        id: 'ua-race',
        title: { ja: 'きっかけ: Enactor 同士の競合状態', en: 'The trigger: a race between Enactors' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'Enactor は、計画の適用を**始める前に一度だけ**、「この計画は前に適用した計画より新しいか」を確認します。その後、エンドポイントを 1 つずつ更新していきます。他の Enactor と同じエンドポイントでぶつかったら、成功するまでリトライします。',
              en: 'Before it starts applying a plan, an Enactor checks **once** that the plan is newer than the one previously applied. It then works through the endpoints one by one, retrying any endpoint where it collides with another Enactor until it succeeds.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '障害の直前、1 つの Enactor でこのリトライがいつになく重なり、大きく遅れていました。そこから起きたことを、順に見てください。',
              en: 'Right before the event, one Enactor hit unusually heavy retries and fell far behind. Step through what happened next.',
            },
          },
          { type: 'diagram', id: 'ua-dns-race' },
          {
            type: 'p',
            text: {
              ja: '原因は、**確認してから実行するまでの間に、前提が変わってしまった**ことです。最初の「新しいか」の確認は、遅れている間に古くなっていました。さらに、別の Enactor のクリーンアップが「古い計画」として消したものが、実は今まさに使われている計画でした。',
              en: 'The root problem is that **the assumption changed between checking and acting**. The initial "is it newer?" check had gone stale during the delay. On top of that, the "old plan" another Enactor\'s clean-up deleted was the very plan in effect.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'これは [レートリミッターの記事](#rate-limiter/distributed) で見た「読み取って、判断して、書き戻す」の間に割り込まれるレースコンディションと、同じ形の問題です。違うのは影響の大きさで、ここではリージョン全体の入口となるエンドポイントのレコードが空になりました。',
              en: 'It has the same shape as the race in the [rate limiter article](#rate-limiter/distributed), where something slips in between read, decide and write back. The difference is the impact: here, the record for the endpoint that serves as the whole Region\'s front door went empty.',
            },
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '空になっただけでなく、**適用中の計画が消えたせいで、どの Enactor も次の計画を適用できない状態**になりました。復旧のための自動化そのものが止まり、人の手で直す必要がありました。',
              en: 'Beyond going empty, **deleting the active plan left the system unable to apply any later plan from any Enactor**. The automation meant for recovery was itself stuck, and it took manual intervention to fix.',
            },
          },
        ],
      },
      {
        id: 'ua-dynamodb',
        title: { ja: 'DynamoDB の停止と復旧', en: 'DynamoDB goes dark, then returns' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '23:48、地域エンドポイント `dynamodb.us-east-1.amazonaws.com` の名前解決が失敗し始めました。影響を受けたのは顧客だけではありません。**AWS の社内サービスも同じ DynamoDB に依存している**ため、そこから先の連鎖が始まります。',
              en: 'At 23:48, resolving the regional endpoint `dynamodb.us-east-1.amazonaws.com` started failing. Customers were not the only ones affected: **internal AWS services depend on the same DynamoDB**, and that is where the cascade began.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**00:38**: 原因を DynamoDB の DNS 状態と特定',
                en: '**00:38**: DynamoDB\'s DNS state identified as the source',
              },
              {
                ja: '**01:15**: 一時的な緩和策で、一部の社内サービスが DynamoDB につながり、復旧に必要な社内ツールが直る',
                en: '**01:15**: temporary mitigations let some internal services reach DynamoDB and repaired key internal tooling',
              },
              {
                ja: '**02:25**: DNS 情報がすべて復旧。02:32 にはグローバルテーブルのレプリカも追いつく',
                en: '**02:25**: all DNS information restored; by 02:32, global table replicas had caught up',
              },
              {
                ja: '**02:25〜02:40**: 各所にキャッシュされた古い DNS レコードの期限が切れた順に、接続が戻る',
                en: '**02:25 to 02:40**: connections came back as cached DNS records expired',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '[グローバルテーブル](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html) を使っていた顧客は、他のリージョンのレプリカには問題なく読み書きできました。ただし us-east-1 との間の複製は大きく遅れました。[DB スケールの記事](#database-scaling/ds-lag) で見たレプリケーションラグが、リージョン単位で起きた形です。',
              en: 'Customers using [global tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/GlobalTables.html) could still read and write their replicas in other Regions, but replication to and from us-east-1 lagged badly. It is the replication lag from the [database scaling article](#database-scaling/ds-lag), at the scale of a Region.',
            },
          },
        ],
      },
      {
        id: 'ua-ec2',
        title: { ja: '直しても戻らない: EC2 の輻輳崩壊', en: 'Fixed, yet still broken: congestive collapse in EC2' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'DynamoDB が戻った後も、EC2 の新規起動は失敗し続けました。理由を知るには、EC2 の裏側にある 2 つの仕組みが必要です。',
              en: 'Even after DynamoDB returned, new EC2 launches kept failing. Two systems behind EC2 explain why.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**DropletWorkflow Manager（DWFM）**: EC2 インスタンスを載せる物理サーバー（AWS は「ドロップレット」と呼ぶ）を管理する。ドロップレットごとに**リース**を持ち、数分おきに状態を確認してリースを保つ',
                en: '**DropletWorkflow Manager (DWFM)**: manages the physical servers that host EC2 instances (AWS calls them "droplets"). It holds a **lease** on each droplet, and keeps it alive by checking in every few minutes',
              },
              {
                ja: '**Network Manager**: 新しいインスタンスが VPC やインターネットと通信できるよう、ネットワークの設定を配って回る',
                en: '**Network Manager**: propagates the network configuration that lets new instances talk to their VPC and the Internet',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'DWFM の状態確認は DynamoDB に依存していました。23:48 以降この確認が失敗し、リースが少しずつ切れていきます。動いているインスタンスには影響しませんが、**リースのないドロップレットは新しいインスタンスの置き場所の候補から外れます**。',
              en: 'DWFM\'s state checks depended on DynamoDB. From 23:48 they failed, and leases slowly timed out. Running instances were unaffected, but **a droplet without a lease is not a candidate for new launches**.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '02:25 に DynamoDB が戻ると、DWFM はフリート全体でリースを張り直し始めました。ところがドロップレットの数が多すぎて、**1 つの張り直しが終わる前にタイムアウトしてしまう**。失敗した分は再試行としてキューに積まれ、キューはさらに長くなる。AWS はこれを**輻輳崩壊（congestive collapse）**と呼び、前に進めない状態に陥ったと説明しています。',
              en: 'When DynamoDB returned at 02:25, DWFM began re-establishing leases across the whole fleet. But with so many droplets, **each attempt took long enough to time out before it finished**. Failed attempts were queued to retry, making the queue even longer. AWS describes this as **congestive collapse**: DWFM could make no forward progress.',
            },
          },
          { type: 'diagram', id: 'ua-congestion' },
          {
            type: 'p',
            text: {
              ja: 'この状態には確立された復旧手順がなく、エンジニアは状況を悪化させないよう慎重に対応しました。いくつかの対策を試した後、04:14 に**流入する仕事を絞り、DWFM ホストを選んで再起動**します。再起動でキューが空になり、処理時間が短くなって、リースが張れるようになりました。05:28 には全ドロップレットのリースが戻ります。',
              en: 'There was no established recovery procedure for this, so engineers moved carefully to avoid making it worse. After trying several mitigations, at 04:14 they **throttled incoming work and selectively restarted DWFM hosts**. Restarts cleared the queues, processing times dropped, and leases could be established. By 05:28 every droplet had a lease again.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '[リトライの記事](#retries/rt-storm) で見た「再送の雪崩」と同じ構図です。**仕事が遅れるほど再試行が増え、再試行が増えるほど仕事が遅れる**。いったんこのループに入ると、元の原因が消えても自然には抜け出せません。抜け出す方法も同じで、[流入を絞り](#retries/rt-server)、溜まった仕事を捨てることでした。',
              en: 'It is the same picture as the [retry storm](#retries/rt-storm): **the slower the work, the more retries; the more retries, the slower the work**. Once in that loop, the system does not climb out on its own even after the original cause is gone. The way out was the same too: [shed incoming load](#retries/rt-server) and throw away the backlog.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'このように、きっかけが消えた後も悪い状態が自分を保ち続ける障害は、一般に**メタステーブル障害**とも呼ばれます。AWS の発表ではこの言葉は使われておらず、ここでは考え方を紹介するために挙げています。',
              en: 'Failures that sustain themselves after the trigger is gone are often called **metastable failures** in general. AWS\'s summary does not use that term; it is mentioned here only to name the idea.',
            },
          },
        ],
      },
      {
        id: 'ua-network',
        title: { ja: '次の段: Network Manager のバックログ', en: 'Next stage: the Network Manager backlog' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'DWFM が戻った 05:28、今度は Network Manager の番です。DWFM の問題で止まっていた**ネットワーク設定の反映が、大量に溜まっていました**。06:21 から反映に時間がかかるようになり、インスタンスは起動できても、ネットワークの設定が届かず通信できない、という状態になります。',
              en: 'Once DWFM recovered at 05:28, it was Network Manager\'s turn. **Network state changes delayed by the DWFM issue had piled up into a large backlog**. From 06:21 propagation slowed, so instances could launch but had no connectivity until their configuration arrived.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'エンジニアは Network Manager の負荷を下げ、10:36 に反映時間が正常に戻りました。その後 11:23 から、各所の負荷を守るために入れていた EC2 のリクエスト制限を少しずつ緩め、13:50 に EC2 は完全に復旧します。',
              en: 'Engineers reduced the load on Network Manager, and propagation times were back to normal by 10:36. From 11:23 they gradually relaxed the EC2 request throttles that had been protecting the subsystems, and EC2 fully recovered at 13:50.',
            },
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '制限を**一気に外さず、少しずつ緩めている**点に注目してください。溜まった需要が一度に戻ると、直したばかりの仕組みをもう一度詰まらせかねません。',
              en: 'Notice that the throttles were **relaxed gradually rather than removed at once**. Letting all the pent-up demand back in together could have jammed the systems that had just been fixed.',
            },
          },
        ],
      },
      {
        id: 'ua-nlb',
        title: { ja: 'NLB: ヘルスチェックが容量を削る', en: 'NLB: health checks that removed capacity' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'Network Manager の遅れは、Network Load Balancer（NLB）にも波及しました。NLB には、ノードを定期的に検査して、不健全なものをサービスから外すヘルスチェックの仕組みがあります。',
              en: 'Network Manager\'s delays also hit Network Load Balancer (NLB). NLB has a health check subsystem that regularly checks every node and removes unhealthy ones from service.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**健全なのに失敗する**: ヘルスチェックの仕組みが、ネットワーク設定がまだ届いていない新しい EC2 インスタンスをサービスに入れた。そのため、ノードもバックエンドも健全なのに検査が失敗することがあった',
                en: '**Failing while healthy**: the health checker brought new EC2 instances into service before their network state had propagated, so checks sometimes failed even though the nodes and targets were fine',
              },
              {
                ja: '**外れては戻る**: 検査結果が失敗と成功を行き来し、ノードが DNS から外されては、次の成功で戻された',
                en: '**Out, then back in**: results flipped between failing and healthy, so nodes were pulled from DNS and then returned on the next success',
              },
              {
                ja: '**検査の仕組み自体が弱る**: 行き来のせいでヘルスチェックの仕組みの負荷が上がり、検査が遅れ、AZ 単位の DNS 自動フェイルオーバーが働いた。複数 AZ にまたがるロードバランサーでは容量がサービスから外れ、残った容量で負荷を支えきれないアプリでは接続エラーが増えた',
                en: '**The checker itself degrades**: the flapping overloaded the health check subsystem, checks were delayed, and automatic AZ DNS failover kicked in. For multi-AZ load balancers this took capacity out of service, and applications whose remaining capacity could not carry the load saw connection errors',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '06:52 に監視が検知し、09:36 にエンジニアが**NLB の自動ヘルスチェックフェイルオーバーを無効化**しました。これで健全なノードがすべてサービスに戻り、接続エラーは解消します。EC2 の復旧後、14:09 に自動フェイルオーバーを再び有効にしました。',
              en: 'Monitoring caught it at 06:52, and at 09:36 engineers **disabled automatic health check failover for NLB**, bringing all healthy nodes back into service and resolving the connection errors. After EC2 recovered, they re-enabled automatic failover at 14:09.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '守るための仕組みが、条件次第で害になる例です。[サーキットブレーカーの記事](#circuit-breaker/cb-cascade) のように、自動の切り離しは普段は障害を局所化しますが、**検査そのものが信用できないときは、健全な容量まで削ってしまいます**。07:04 からは NLB のヘルスチェック失敗がインスタンスの終了も引き起こし、Lambda の内部システムの一部が容量不足になりました。',
              en: 'This is a safeguard turning harmful under the wrong conditions. As in the [circuit breaker article](#circuit-breaker/cb-cascade), automatic isolation usually contains failures, but **when the check itself is unreliable, it removes healthy capacity too**. From 07:04, NLB health check failures also triggered instance terminations that left a subset of Lambda\'s internal systems under-scaled.',
            },
          },
        ],
      },
      {
        id: 'ua-others',
        title: { ja: '他のサービスへの広がり', en: 'How it spread to other services' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'DynamoDB、EC2 の起動、NLB は多くのサービスの土台です。そのため影響は、それぞれの段に合わせた形で広がりました。',
              en: 'DynamoDB, EC2 launches and NLB sit underneath many services, so the impact spread in shapes that matched each stage.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**Lambda（23:51〜14:15）**: 最初は DynamoDB の影響で関数の作成や SQS・Kinesis のイベント処理が遅れた。SQS をポーリングする内部の仕組みは自動で戻らず、04:40 に手で復旧。07:04 以降は NLB の影響で容量が不足し、同期呼び出しを優先するため非同期の処理を絞った',
                en: '**Lambda (23:51 to 14:15)**: DynamoDB issues first blocked function changes and delayed SQS and Kinesis event processing. The internal SQS polling subsystem did not recover on its own and was restored at 04:40. From 07:04, NLB issues left it under-scaled, so asynchronous work was throttled to prioritize synchronous invocations',
              },
              {
                ja: '**STS（23:51〜09:59）**: DynamoDB の復旧で 01:19 に一度戻ったが、08:31 から NLB の影響で再びエラーが増えた。**原因が違う 2 回目の波**があった',
                en: '**STS (23:51 to 09:59)**: recovered at 01:19 with DynamoDB, then errors rose again from 08:31 because of NLB. **A second wave with a different cause**',
              },
              {
                ja: '**IAM のサインイン（23:51〜01:25）**: IAM ユーザーでのコンソールへのサインインが失敗した',
                en: '**IAM sign-in (23:51 to 01:25)**: console sign-in with IAM users failed',
              },
              {
                ja: '**Redshift**: クエリは 02:21 に戻ったが、認証情報が切れたクラスターのノードを入れ替える処理が EC2 の起動障害で止まり、一部のクラスターの完全な復旧は 21 日 04:05 までかかった',
                en: '**Redshift**: queries resumed by 02:21, but workflows replacing nodes with expired credentials were blocked by the EC2 launch failures, and some clusters were not fully restored until 04:05 on October 21',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'ほかにも ECS、EKS、Fargate、Amazon Connect、サポートセンターなどが影響を受けました。全体の一覧は、元の発表から AWS のイベント履歴をたどれます。',
              en: 'ECS, EKS, Fargate, Amazon Connect, the Support Center and others were affected too. The original summary points to AWS\'s event history for the full list.',
            },
          },
        ],
      },
      {
        id: 'ua-fixes',
        title: { ja: 'AWS が挙げた再発防止策', en: 'What AWS is changing' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '発表では、次の対策が挙げられています。',
              en: 'The summary lists the following changes.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**DNS 自動化**: DynamoDB の DNS Planner と DNS Enactor の自動化を全世界で停止済み。再開の前に、競合状態を修正し、誤った計画が適用されるのを防ぐ保護を追加する',
                en: '**DNS automation**: the DynamoDB DNS Planner and Enactor automation has been disabled worldwide. Before re-enabling it, the race condition will be fixed and protections added against applying incorrect plans',
              },
              {
                ja: '**NLB**: ヘルスチェックの失敗で AZ フェイルオーバーが起きたとき、1 つの NLB が外せる容量を制限する仕組み（velocity control）を追加する',
                en: '**NLB**: a velocity control mechanism to limit how much capacity a single NLB can remove when health check failures cause AZ failover',
              },
              {
                ja: '**EC2**: 既存のスケールテストに加え、DWFM の復旧の流れを実際に動かすテストを作り、将来の後退を見つけられるようにする',
                en: '**EC2**: an additional test suite, on top of existing scale tests, that exercises the DWFM recovery workflow to catch future regressions',
              },
              {
                ja: '**EC2 のデータ反映**: 待ち行列の長さに応じて、入ってくる仕事を制限するよう、スロットリングの仕組みを改善する',
                en: '**EC2 data propagation**: improved throttling that rate-limits incoming work based on the size of the waiting queue',
              },
            ],
          },
        ],
      },
      {
        id: 'ua-lessons',
        title: { ja: '自分のシステムに持ち帰る教訓', en: 'Lessons to take home' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ここからは AWS の発表ではなく、この記事としての読み解きです。規模は違っても、同じ形の弱点はどのシステムにもありえます。',
              en: 'From here on, this is this article\'s reading, not AWS\'s statement. The scale is different, but weaknesses of the same shape can exist in any system.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**確認は、書き込む瞬間にもう一度**: 「始める前に一度確認」は、処理が遅れるほど古くなる。バージョン付きの条件付き書き込みのように、確認と書き込みを 1 つの操作にできないかを考える',
                en: '**Check again at the moment you write**: a one-time check before starting goes stale as processing slows. See whether the check and the write can be one operation, such as a conditional write on a version',
              },
              {
                ja: '**消す処理は、使用中のものを消せないように**: クリーンアップのような「掃除」は、今使われているものを絶対に消さない、という保護を持たせる',
                en: '**Clean-up must never delete what is in use**: give housekeeping jobs a hard guard against removing anything currently active',
              },
              {
                ja: '**キューには上限と、捨てる判断を**: タイムアウトした仕事を無制限に再投入すると、回復を自分で妨げる。[リトライの回数を制限](#retries/rt-budget) し、待ち行列の長さで流入を絞る',
                en: '**Bound your queues, and be willing to drop work**: requeueing timed-out work without limit blocks your own recovery. [Cap retries](#retries/rt-budget) and throttle intake based on queue length',
              },
              {
                ja: '**全台が一斉に戻る場面を試す**: 障害からの復旧は、普段は起きない規模の仕事を一度に生む。復旧の流れそのものを、本番に近い規模で [試しておく](#chaos-engineering/ce-gameday)',
                en: '**Test the moment everything comes back at once**: recovery creates a burst of work far beyond normal. [Exercise the recovery path itself](#chaos-engineering/ce-gameday) at realistic scale',
              },
              {
                ja: '**自動の切り離しに速度制限を**: ヘルスチェックが信用できないときに容量を削りすぎないよう、一度に外せる量に上限を置く。手で止められるスイッチも用意する',
                en: '**Rate-limit automatic removal**: cap how much capacity can be pulled at once, so an unreliable health check cannot strip too much. Keep a manual switch to turn it off',
              },
              {
                ja: '**見えない依存を洗い出す**: EC2 の起動が DynamoDB に依存していたように、土台のサービスにも依存がある。自分のサービスが止まるとき、何が一緒に止まるかを把握しておく',
                en: '**Map the hidden dependencies**: just as EC2 launches depended on DynamoDB, foundations have foundations. Know what else goes down when your service does',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '[SLO の記事](#sli-slo-sla/slo-nines) で見たとおり、99.9% の月間の許容停止時間は約 43 分です。依存しているリージョンの土台が半日不安定になると、影響を受けた機能はそれだけでその月の予算を何倍も超えます。自分のサービスがどの程度の停止に耐える必要があるのか、リージョンをまたぐ構成が必要かは、SLO から逆算して決めます。',
              en: 'As in the [SLO article](#sli-slo-sla/slo-nines), 99.9% allows about 43 minutes of downtime a month. If the foundations of the Region you depend on are unstable for half a day, any affected feature blows through that budget many times over. How much disruption your service must survive, and whether you need a multi-Region setup, should be worked backward from your SLO.',
            },
          },
        ],
      },
      {
        id: 'ua-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**きっかけは、まれな競合状態**。確認してから書くまでの間に前提が変わり、使用中の計画が消えて DynamoDB の入口が空になった',
                en: '**The trigger was a rare race.** The assumption changed between check and write, the active plan was deleted, and DynamoDB\'s front door went empty',
              },
              {
                ja: '**きっかけを直しても終わらなかった**。DWFM は再試行の積み重ねで輻輳崩壊し、流入制限と再起動でようやく抜け出した',
                en: '**Fixing the trigger did not end it.** DWFM fell into congestive collapse from piled-up retries and only escaped through throttling and restarts',
              },
              {
                ja: '**影響は次の段へ移っていった**。Network Manager のバックログ、NLB のヘルスチェックと、溜まった仕事が順に詰まらせた',
                en: '**The impact kept moving down a stage.** Backlogs jammed Network Manager, then NLB health checks, in turn',
              },
              {
                ja: '**守る仕組みも、条件次第で害になる**。ヘルスチェックによる自動の切り離しが、健全な容量まで削った',
                en: '**Safeguards can hurt under the wrong conditions.** Automatic health-check removal pulled healthy capacity out of service',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '一次資料は AWS の [Summary of the Amazon DynamoDB Service Disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/101925/) です。過負荷からの回復については、Google の SRE 本の [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) もあわせて読むと理解が深まります。',
              en: 'The primary source is AWS\'s [Summary of the Amazon DynamoDB Service Disruption in the Northern Virginia (US-EAST-1) Region](https://aws.amazon.com/message/101925/). For recovering from overload, the [Addressing Cascading Failures](https://sre.google/sre-book/addressing-cascading-failures/) chapter of Google\'s SRE book is a good companion.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'sql-injection',
    category: 'security',
    publishedAt: '2026-10-02',
    updatedAt: '2026-10-02',
    title: { ja: 'SQL インジェクション', en: 'SQL Injection' },
    tagline: {
      ja: '入力が「値」ではなく「命令」として実行されてしまう脆弱性と、その防ぎ方。',
      en: 'When user input runs as a command instead of a value, and how to prevent it.',
    },
    sections: [
      {
        id: 'sqli-intro',
        title: { ja: '何が起きるのか', en: 'What goes wrong' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'SQL インジェクションは、**ユーザーの入力が「データ」ではなく「SQL の命令の一部」として実行されてしまう**脆弱性です。原因はほとんどの場合ひとつで、SQL 文を**文字列の連結**で組み立てていることです。',
              en: 'SQL injection is a vulnerability where **user input runs as part of a SQL command instead of being treated as data**. It almost always has one cause: building SQL statements by **concatenating strings**.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '古くから知られている脆弱性ですが、今でも Web アプリの代表的な脆弱性のひとつです。ログイン画面や検索フォームのような、入力を受け取って DB に問い合わせる場所ならどこでも起こりえます。',
              en: 'It has been known for decades, yet it remains one of the most common web vulnerabilities. It can happen anywhere input is taken and used to query a database: login screens, search boxes, filters.',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: 'この記事は、仕組みを理解して**自分のシステムを守る**ためのものです。自分が管理していないシステムで試すことは、法律で禁止されている行為にあたります。',
              en: 'This article is about understanding the mechanism so you can **protect your own systems**. Trying it against systems you do not own or have permission to test is illegal.',
            },
          },
        ],
      },
      {
        id: 'sqli-how',
        title: { ja: '入力が命令に化ける仕組み', en: 'How input turns into a command' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ログイン処理を、入力をそのまま SQL に埋め込んで書いたとします。',
              en: 'Suppose a login handler builds its SQL by embedding the input directly.',
            },
          },
          {
            type: 'code',
            label: { ja: '危険: 入力を文字列で連結している', en: 'Unsafe: input concatenated into the string' },
            code: `query = (
    "SELECT * FROM users WHERE name = '" + name +
    "' AND password = '" + password + "'"
)
cursor.execute(query)`,
          },
          {
            type: 'p',
            text: {
              ja: "普通に `alice` と `s3cret` を入力すれば、入力は `' '` の中に収まり、ただの値として比べられます。ところがパスワード欄に `' OR '1'='1` と入れられると、入力の先頭の `'` が文字列を途中で閉じ、その後ろが SQL の命令として解釈されます。",
              en: "With a normal input like `alice` and `s3cret`, the input stays inside the quotes and is compared as a plain value. But if someone types `' OR '1'='1` into the password field, the leading `'` closes the string early and everything after it is parsed as SQL.",
            },
          },
          { type: 'diagram', id: 'sqli-concat' },
          {
            type: 'p',
            text: {
              ja: "`'1'='1'` は常に真なので、WHERE の条件全体が真になります。結果として全ユーザーの行が返り、アプリは先頭の行（多くの場合、最初に作られた管理者アカウント）としてログインさせてしまいます。",
              en: "Since `'1'='1'` is always true, the whole WHERE clause becomes true. Every user row comes back, and the app logs the attacker in as the first one, which is often the first account created: an admin.",
            },
          },
          {
            type: 'details',
            summary: { ja: 'なぜ name の条件まで無視されるのか', en: 'Why the name check gets ignored too' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '**SQL では AND が OR より先に評価されます**。なので組み立てられた条件は、次のように区切られます。',
                  en: '**In SQL, AND binds more tightly than OR.** So the resulting condition groups like this:',
                },
              },
              {
                type: 'code',
                code: `WHERE (name = 'alice' AND password = '')
   OR '1'='1'`,
              },
              {
                type: 'p',
                text: {
                  ja: '左側のかっこは偽でも、右側の OR 以降が常に真なので、行ごとに見て全部の行が条件を満たします。name に何を入れても結果は同じです。',
                  en: 'Even when the left group is false, the right side after OR is always true, so every row satisfies the condition. Whatever goes into name makes no difference.',
                },
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '例を単純にするためにパスワードを平文で比べていますが、実際のシステムではパスワードはハッシュで保存し、ハッシュ同士を比べます。それでも、連結で SQL を組み立てていれば同じように破られます。',
              en: 'The example compares plain-text passwords to keep it simple. Real systems store and compare password hashes, but string-built SQL is just as breakable either way.',
            },
          },
        ],
      },
      {
        id: 'sqli-impact',
        title: { ja: '起こりうる被害', en: 'What an attacker can do' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'ログインを破るのは入り口にすぎません。入力が命令になるということは、**その DB ユーザーにできることは何でもできてしまう**ということです。',
              en: 'Bypassing login is only the start. If input can become a command, **an attacker can do anything the database user is allowed to do**.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**認証の回避**: パスワードを知らずに、他人や管理者としてログインする',
                en: '**Authentication bypass**: logging in as another user, or as an admin, without the password',
              },
              {
                ja: '**データの抜き取り**: `UNION` で別のテーブルの結果をつなげ、個人情報やパスワードハッシュを読み出す',
                en: '**Data theft**: using `UNION` to append results from other tables and read personal data or password hashes',
              },
              {
                ja: '**改ざん・削除**: `UPDATE` や `DELETE` を実行させて、データを書き換えたり消したりする',
                en: '**Tampering and deletion**: getting `UPDATE` or `DELETE` statements to run',
              },
              {
                ja: '**被害の拡大**: DB ユーザーの権限が強いと、サーバー上のファイルの読み書きや、別のシステムへの足がかりにまで広がる',
                en: '**Escalation**: with a powerful database user, the damage can extend to reading or writing files on the server, or reaching other systems',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '画面に結果が表示されない場所でも安全とは限りません。エラーが出るかどうかや、応答にかかる時間の違いから、少しずつ中身を推測される手口（ブラインド SQL インジェクション）もあります。',
              en: 'A query whose result never appears on screen is not safe either. Attackers can infer data bit by bit from whether an error occurs or how long a response takes (blind SQL injection).',
            },
          },
        ],
      },
      {
        id: 'sqli-prevent',
        title: { ja: '防ぎ方', en: 'How to prevent it' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '本質的な対策は、**プレースホルダ（パラメータ化クエリ）**を使うことです。SQL の「形」と「値」を分けて DB に渡します。',
              en: 'The real fix is **placeholders (parameterized queries)**: send the shape of the SQL and the values to the database separately.',
            },
          },
          {
            type: 'code',
            label: { ja: '安全: 値はプレースホルダで渡す', en: 'Safe: values passed as parameters' },
            code: `cursor.execute(
    "SELECT * FROM users WHERE name = %s AND password_hash = %s",
    (name, password_hash),
)`,
          },
          {
            type: 'p',
            text: {
              ja: 'DB はまず `?`（ドライバによっては `%s` や `$1`）を含む SQL を解析して、命令の形を確定させます。値はそのあとで別に届き、`?` の位置に**ただの文字列として**入るだけです。入力に `\'` が含まれていても、形はもう決まっているので命令にはなりません。',
              en: 'The database first parses the SQL containing `?` (or `%s` or `$1`, depending on the driver) and fixes the shape of the command. The values arrive afterwards and only fill those slots **as plain strings**. Even if the input contains a `\'`, the shape is already set, so it cannot become a command.',
            },
          },
          { type: 'diagram', id: 'sqli-placeholder' },
          {
            type: 'p',
            text: {
              ja: 'プレースホルダを基本にしたうえで、次の対策を重ねます。',
              en: 'With placeholders as the foundation, layer these on top:',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**ORM やクエリビルダーを正しく使う**: 普通の書き方なら内部でプレースホルダを使ってくれます。ただし `raw()` のような生 SQL や、文字列を組み立てて渡した部分は同じように危険です',
                en: '**Use your ORM or query builder properly**: the normal API uses placeholders internally. Raw SQL escapes such as `raw()`, or strings you build and pass in, are just as dangerous',
              },
              {
                ja: '**識別子は許可リストで選ぶ**: テーブル名・列名・`ORDER BY` の向きはプレースホルダにできないので、決まった候補の中から選ばせる',
                en: '**Pick identifiers from an allowlist**: table names, column names and sort direction cannot be placeholders, so choose them from a fixed set',
              },
              {
                ja: '**DB ユーザーの権限を最小にする**: アプリ用のユーザーには必要なテーブルへの読み書きだけを許し、`DROP` や他のスキーマへのアクセスは与えない',
                en: '**Give the database user the least privilege**: allow only the reads and writes the app needs, with no `DROP` or access to other schemas',
              },
              {
                ja: '**入力チェックは補助として使う**: 数値のはずの値が数値かを確かめるのは有効です。ただし「危ない文字を消す」処理やエスケープだけに頼ると漏れが出るので、本命の対策にはしない',
                en: '**Treat input validation as a backup**: checking that a number is a number helps, but stripping "dangerous" characters or escaping alone leaks, so never rely on it as the main defense',
              },
            ],
          },
          {
            type: 'code',
            label: { ja: '並び替えの列は許可リストから選ぶ', en: 'Choose the sort column from an allowlist' },
            code: `SORTABLE = {"name": "name", "created": "created_at"}

column = SORTABLE.get(sort_param, "created_at")  # unknown -> default
cursor.execute(
    f"SELECT * FROM users WHERE team_id = %s ORDER BY {column}",
    (team_id,),
)`,
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'この例で f-string に入るのは、コードに書いた候補の値だけです。ユーザーの入力そのものは決して SQL に入りません。値（`team_id`）はプレースホルダのままです。',
              en: 'Here only a value written in your own code goes into the f-string; the user input itself never reaches the SQL. The actual value (`team_id`) still goes through a placeholder.',
            },
          },
        ],
      },
      {
        id: 'sqli-ops',
        title: { ja: '運用で被害を抑える', en: 'Limiting damage in operations' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'コードで防ぐのが第一ですが、どこか1か所の見落としで破られることもあります。SRE の視点では、**破られたときに早く気づき、被害を小さく保つ**仕組みも合わせて用意します。',
              en: 'Preventing it in code comes first, but a single missed spot is enough. From an SRE point of view, you also want ways to **notice quickly and keep the blast radius small** if it does happen.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**エラーの詳細を返さない**: SQL のエラー文や構造をそのまま画面に出すと、攻撃のヒントになる。利用者には一般的なメッセージだけを返し、詳細はログに残す',
                en: '**Hide error details**: raw SQL errors on screen give attackers hints. Show users a generic message and keep the details in your logs',
              },
              {
                ja: '**ログとアラート**: DB エラー率の急増や、普段と違うクエリの形・量を監視すると、試行の段階で気づける',
                en: '**Logs and alerts**: watching for spikes in database errors, or unusual query shapes and volumes, can catch probing early',
              },
              {
                ja: '**WAF は追加の層として**: 典型的な攻撃文字列を止められるが、すり抜けもあるので、コードの対策の代わりにはしない',
                en: '**A WAF as an extra layer**: it blocks common payloads but can be bypassed, so it never replaces fixing the code',
              },
              {
                ja: '**静的解析とコードレビュー**: 文字列で SQL を組み立てている箇所は、ツールやレビューで機械的に見つけられる',
                en: '**Static analysis and code review**: string-built SQL is easy to flag automatically with tools and in review',
              },
            ],
          },
        ],
      },
      {
        id: 'sqli-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '覚えておくことはひとつです。**SQL の形はコードが決め、入力は値としてしか渡さない。** これを守れば SQL インジェクションはほぼ防げます。権限の最小化と監視は、それでも何かあったときの保険です。',
              en: 'One rule covers it: **your code decides the shape of the SQL, and input is only ever passed as a value.** Follow it and SQL injection is essentially prevented. Least privilege and monitoring are the insurance for when something slips through.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'さらに詳しくは、[OWASP の SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) がまとまっています。',
              en: 'For more depth, the [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html) is the standard reference.',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'prompt-injection',
    category: 'security',
    publishedAt: '2026-10-03',
    updatedAt: '2026-10-03',
    title: { ja: 'プロンプトインジェクション', en: 'Prompt Injection' },
    tagline: {
      ja: 'AI が読んだ文章の中の指示に従ってしまう問題と、被害を抑える設計。',
      en: 'When an AI follows instructions hidden in what it reads, and how to design for it.',
    },
    sections: [
      {
        id: 'pi-intro',
        title: { ja: '何が起きるのか', en: 'What goes wrong' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'LLM を使ったアプリでは、開発者が書いた指示（システムプロンプト）、ユーザーの入力、Web ページやメールなど外から取ってきた文章が、**ひとつの文章としてまとめて**モデルに渡されます。',
              en: 'In an LLM app, the developer\'s instructions (the system prompt), the user\'s input and text pulled in from outside, such as web pages and emails, are all handed to the model **as one combined text**.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'プロンプトインジェクションは、その中に紛れ込んだ文章が**「データ」ではなく「指示」として受け取られ、モデルが従ってしまう**問題です。データのはずのものが命令として実行される、という形は [SQL インジェクション](#sql-injection) と同じです。',
              en: 'Prompt injection is when text slipped into that mix is **taken as an instruction instead of data, and the model follows it**. Data being executed as a command is the same shape of problem as [SQL injection](#sql-injection).',
            },
          },
          {
            type: 'note',
            tone: 'info',
            text: {
              ja: '変化の速い分野なので、この記事は 2026 年 10 月時点での理解をまとめたものです。自分が管理していない AI サービスへの攻撃を試すことは、利用規約や法律に反する場合があります。',
              en: 'This field moves fast, so this article reflects the understanding as of October 2026. Attacking AI services you do not own may violate their terms or the law.',
            },
          },
        ],
      },
      {
        id: 'pi-types',
        title: { ja: '直接と間接', en: 'Direct and indirect' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**直接プロンプトインジェクション**: ユーザー自身が「前の指示は無視して〜」のような入力で、アプリの決まりを破らせようとする。被害は多くの場合、そのユーザー自身の画面の中にとどまる',
                en: '**Direct prompt injection**: the user types something like "ignore the previous instructions and…" to break the app\'s rules. The damage usually stays within that user\'s own session',
              },
              {
                ja: '**間接プロンプトインジェクション**: 攻撃者が Web ページ・メール・ドキュメント・コードのコメントなどに指示を仕込み、**AI がそれを読んだときに**従ってしまう。ユーザーは攻撃者ではなく被害者になる',
                en: '**Indirect prompt injection**: an attacker plants instructions in a web page, email, document or code comment, and the AI follows them **when it reads that content**. The user is not the attacker but the victim',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '危ないのは間接の方です。AI エージェントがメール送信やファイル操作のような**ツールを使える**と、読んだ文章ひとつで、ユーザーが頼んでいない操作まで実行されてしまいます。',
              en: 'The indirect kind is the dangerous one. Once an AI agent can **use tools** such as sending email or editing files, a single piece of text it reads can trigger actions the user never asked for.',
            },
          },
          { type: 'diagram', id: 'pi-indirect' },
          {
            type: 'p',
            text: {
              ja: '指示は人間には見えない形で仕込めます。背景と同じ色の文字、画像の中の文字、HTML のコメント、ドキュメントのメタデータなどです。ユーザーが画面で確認しても気づけないことがあります。',
              en: 'The instruction can be invisible to people: text the same color as the background, text inside an image, HTML comments, document metadata. A user looking at the page may see nothing wrong.',
            },
          },
        ],
      },
      {
        id: 'pi-why',
        title: { ja: 'なぜ SQL のように直せないのか', en: 'Why it can\'t be fixed like SQL' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'SQL インジェクションには、プレースホルダという根本的な解決策がありました。命令の形と値を**別々の経路で**渡すので、値がどんな文字列でも命令にはなりません。',
              en: 'SQL injection has a root-cause fix: placeholders. The command shape and the values travel **on separate paths**, so no value can ever become a command.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'LLM には、これに当たるものがありません。指示もデータも同じ自然言語の文章として 1 本にまとめて読まれ、どこまでが指示かを決めるのはモデル自身の判断だからです。',
              en: 'LLMs have no equivalent. Instructions and data are read together as one stream of natural language, and deciding which part is an instruction is left to the model itself.',
            },
          },
          { type: 'diagram', id: 'pi-channels' },
          {
            type: 'p',
            text: {
              ja: '外部の文章を区切り記号で囲む、システムプロンプトに「読んだ文章の指示には従わない」と書く、怪しい入力を検出するモデルを挟む、といった工夫は効果があります。ただしどれも**確率的に減らす**もので、プレースホルダのように「絶対に起きない」とは言えません。',
              en: 'Wrapping outside text in delimiters, telling the model in the system prompt not to follow instructions it reads, and adding a classifier that flags suspicious input all help. But each only **lowers the odds**; none can guarantee it never happens the way placeholders do.',
            },
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: '「モデルが賢くなれば解決する」と考えて設計すると危険です。**モデルはいつか騙される**という前提で、騙されても被害が出ないシステムにします。',
              en: 'Designing on the assumption that smarter models will solve this is risky. Assume **the model will be fooled eventually**, and build a system where being fooled does no harm.',
            },
          },
        ],
      },
      {
        id: 'pi-design',
        title: { ja: '被害を抑える設計', en: 'Designing to limit the damage' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'モデルの中で完全に防げない以上、守る場所は**モデルの外側**です。被害が出るかどうかは、モデルが騙されたかではなく、**騙されたモデルに何ができるか**で決まります。',
              en: 'Since it can\'t be fully stopped inside the model, the defenses live **outside the model**. Whether harm happens depends not on whether the model was fooled, but on **what a fooled model is able to do**.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**ツールと権限を最小にする**: その作業に必要なツールだけを渡し、可能なら読み取り専用にする。トークンもユーザーやタスクごとに範囲を絞る',
                en: '**Minimize tools and permissions**: give only the tools the task needs, read-only where possible, with tokens scoped to the user and the task',
              },
              {
                ja: '**取り返しのつかない操作は人が確認する**: 外部への送信、削除、支払い、権限の変更などは、実行前に内容を見せて承認をもらう',
                en: '**Have a human confirm irreversible actions**: show the details and ask for approval before sending externally, deleting, paying or changing permissions',
              },
              {
                ja: '**外から来た文章を信用しない**: Web ページ、メール、ファイル、ツールの結果は「信頼できない入力」として扱う。それを読んだあとは、使えるツールを減らすなどして権限を落とす',
                en: '**Distrust outside text**: treat web pages, emails, files and tool results as untrusted input. After reading them, drop privileges, for example by narrowing the available tools',
              },
              {
                ja: '**出力をそのまま実行しない**: モデルの出力も信頼できない入力として扱う。SQL やシェルに直接流さず、HTML として表示するときはエスケープする',
                en: '**Never execute output directly**: model output is untrusted input too. Don\'t pipe it into SQL or a shell, and escape it before rendering it as HTML',
              },
              {
                ja: '**外に出る経路を絞る**: 通信先を許可リストにし、サンドボックスの中で動かす。URL や画像の読み込みを通じてデータを持ち出される経路もふさぐ',
                en: '**Restrict the ways out**: allowlist network destinations and run in a sandbox. Close side channels too, such as leaking data through URLs or image loads',
              },
            ],
          },
          {
            type: 'code',
            label: { ja: 'ツールごとに危険度を決め、外に出る操作は確認する', en: 'Rate each tool by risk and confirm outbound actions' },
            code: `TOOLS = {
    "search_docs": {"risk": "read"},
    "send_email":  {"risk": "external",    "confirm": True},
    "delete_file": {"risk": "destructive", "confirm": True},
}

def call_tool(name, args, user):
    policy = TOOLS.get(name)
    if policy is None:
        raise PermissionError(f"unknown tool: {name}")
    if policy.get("confirm") and not user.approve(name, args):
        return "cancelled by the user"
    audit_log(user, name, args)  # who, what, with which arguments
    return run(name, args)`,
          },
          {
            type: 'details',
            summary: { ja: '画像や URL からデータが漏れる仕組み', en: 'How data leaks through images and URLs' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: 'チャット画面がモデルの出力を Markdown として表示する場合、出力に外部の画像が含まれていると、画面はその URL に自動でアクセスします。URL のクエリに会話の内容が埋め込まれていれば、ユーザーが何もクリックしなくても、その内容が攻撃者のサーバーに届きます。',
                  en: 'If a chat UI renders model output as Markdown, an external image in that output makes the UI fetch its URL automatically. If the URL\'s query string contains parts of the conversation, they reach the attacker\'s server without the user clicking anything.',
                },
              },
              {
                type: 'p',
                text: {
                  ja: '対策は、表示してよい画像やリンクの送り先を許可リストに限ること、または外部の画像を自動で読み込まないことです。「送信ツールを渡していないから安全」とは限らない、という例です。',
                  en: 'The fix is to allowlist where images and links may point, or to never auto-load external images. It shows that "we gave it no send tool" does not mean "it cannot send".',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'pi-ops',
        title: { ja: '気づくための運用', en: 'Operations: noticing it' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '設計で被害を小さくしたうえで、SRE の視点では**起きたときに気づけること**も大事です。',
              en: 'With the blast radius contained by design, the SRE side is about **noticing when it happens**.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**ツール呼び出しを記録する**: いつ、誰の依頼で、どのツールを、どんな引数で呼んだかを残す。あとから原因をたどれるようにする',
                en: '**Log every tool call**: when, on whose behalf, which tool and with what arguments, so incidents can be traced afterwards',
              },
              {
                ja: '**普段と違う動きにアラートを出す**: 初めて見る送信先、短時間の大量の読み取り、依頼の内容と関係ないツールの呼び出しなど',
                en: '**Alert on unusual behavior**: a never-before-seen destination, a burst of reads, or tool calls unrelated to the request',
              },
              {
                ja: '**ツールにもレート制限をかける**: 騙されても、一度に動かせる量を小さく保つ',
                en: '**Rate-limit tools too**: even when fooled, keep how much can happen at once small',
              },
              {
                ja: '**攻撃パターンをテストに入れる**: 既知のインジェクションの例を評価用のテストにし、モデルやプロンプトを変えるたびに CI で確かめる',
                en: '**Test against known attacks**: turn known injection samples into an evaluation suite and run it in CI whenever the model or prompts change',
              },
              {
                ja: '**すぐ止められるようにする**: 問題が起きたときに、特定のツールやエージェント全体を一括で無効にできるスイッチを用意しておく',
                en: '**Keep a kill switch**: be able to disable a specific tool, or the whole agent, at once when something goes wrong',
              },
            ],
          },
        ],
      },
      {
        id: 'pi-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'SQL インジェクションは「値として渡す」ことで根本から防げました。プロンプトインジェクションは、今のところモデルの中で根本から防ぐ方法がありません。だから考え方を変えて、**モデルが騙されても被害が出ないように、権限と確認と監視で外側を固めます**。',
              en: 'SQL injection is fixed at the root by passing input as values. Prompt injection, for now, has no root fix inside the model. So the approach changes: **lock down the outside with permissions, confirmations and monitoring, so that a fooled model can\'t do harm**.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '詳しくは [OWASP Top 10 for LLM Applications の LLM01: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) と、[LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) がまとまっています。',
              en: 'For more, see [LLM01: Prompt Injection in the OWASP Top 10 for LLM Applications](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) and the [LLM Prompt Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).',
            },
          },
        ],
      },
    ],
  },
  {
    id: 'oauth-oidc',
    category: 'security',
    publishedAt: '2026-10-03',
    updatedAt: '2026-10-05',
    title: { ja: '認証と認可（OAuth 2.0 / OpenID Connect）', en: 'Authentication & Authorization (OAuth 2.0 / OpenID Connect)' },
    tagline: {
      ja: '「誰か」と「何をしてよいか」を分けて考え、パスワードを渡さずに安全につなぐ。',
      en: 'Separate "who you are" from "what you may do", and connect apps safely without sharing passwords.',
    },
    sections: [
      {
        id: 'oa-authn-authz',
        title: { ja: '認証と認可の違い', en: 'Authentication vs. authorization' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**認証（Authentication, AuthN）**: 相手が**誰か**を確かめること。パスワード、パスキー、多要素認証など',
                en: '**Authentication (AuthN)**: verifying **who** someone is, with passwords, passkeys, multi-factor and so on',
              },
              {
                ja: '**認可（Authorization, AuthZ）**: その相手が**何をしてよいか**を決めること。「このユーザーはこの請求書を読めるが、消せない」など',
                en: '**Authorization (AuthZ)**: deciding **what** that someone may do, e.g. "this user can read this invoice but not delete it"',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: 'ホテルにたとえると、フロントで身分証を見せるのが認証、渡されたカードキーで入れる部屋が決まっているのが認可です。順番は必ず認証が先で、誰かがわからなければ、何を許すかも決められません。',
              en: 'Think of a hotel: showing your ID at the front desk is authentication; the key card that only opens your room is authorization. Authentication always comes first, since you cannot decide what to allow until you know who it is.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'HTTP のステータスコードもこの区別に沿っています。`401 Unauthorized` は「誰かわからない（認証が必要）」、`403 Forbidden` は「誰かはわかったが、その操作は許されていない」です。名前が紛らわしいですが、401 は実質「未認証」です。',
              en: 'HTTP status codes follow the same split. `401 Unauthorized` means "I don\'t know who you are (authenticate first)", and `403 Forbidden` means "I know who you are, but you may not do this". Despite the name, 401 really means unauthenticated.',
            },
          },
        ],
      },
      {
        id: 'oa-session-token',
        title: { ja: 'ログイン状態をどう覚えるか', en: 'Remembering who is logged in' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: '一度ログインしたあと、毎回パスワードを送るわけにはいきません。そこで「ログイン済み」の証明を持たせます。代表的なのは次の 2 つです。',
              en: 'After logging in once, you don\'t want to send the password on every request. Instead the client carries proof that it is logged in. There are two common styles.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**セッション**: サーバーがログイン情報を保存し、ブラウザには推測できないセッション ID だけを Cookie で渡す。サーバー側で消せばすぐにログアウトさせられる',
                en: '**Sessions**: the server stores the login state and gives the browser only an unguessable session ID in a cookie. Deleting it on the server logs the user out immediately',
              },
              {
                ja: '**トークン（JWT など）**: ユーザー ID や有効期限を書き込み、署名したものを渡す。サーバーは保存しなくても署名を確かめるだけで信用できるが、期限が切れるまで取り消しにくい',
                en: '**Tokens (e.g. JWT)**: the user ID and expiry are written into the token and signed. The server can trust it just by checking the signature, without storing anything, but it is hard to revoke before it expires',
              },
            ],
          },
          {
            type: 'code',
            label: { ja: 'JWT の中身（ヘッダー.ペイロード.署名）', en: 'Inside a JWT (header.payload.signature)' },
            code: `// header
{ "alg": "RS256", "kid": "2026-10-key" }
// payload (claims)
{ "sub": "user-123", "iss": "https://auth.example.com",
  "aud": "my-app", "exp": 1791000000 }
// signature = sign(header + "." + payload, private key)`,
          },
          {
            type: 'note',
            tone: 'warn',
            text: {
              ja: 'JWT のペイロードは Base64 で**符号化されているだけで、暗号化はされていません**。誰でも中身を読めるので、秘密の情報は入れないこと。署名が守るのは「改ざんされていないこと」だけです。',
              en: 'A JWT payload is only **Base64-encoded, not encrypted**. Anyone can read it, so never put secrets in it. The signature only guarantees it hasn\'t been tampered with.',
            },
          },
        ],
      },
      {
        id: 'oa-why-oauth',
        title: { ja: 'OAuth 2.0 が解く問題', en: 'The problem OAuth 2.0 solves' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'たとえば、写真の印刷サービスに、Google フォトの写真を読ませたいとします。昔は、印刷サービスに Google のパスワードそのものを渡すしかありませんでした。これでは印刷サービスがメールも含めて何でもできてしまい、やめさせるにはパスワードを変えるしかありません。',
              en: 'Say a photo-printing service wants to read your Google Photos. In the old days the only way was to give it your actual Google password. Then the service could do anything, email included, and the only way to stop it was to change your password.',
            },
          },
          {
            type: 'p',
            text: {
              ja: 'OAuth 2.0 は、**パスワードを渡さずに、範囲と期限を限った権限だけを渡す**ための仕組みです。印刷サービスが受け取るのは「写真を読むことだけ」が許された**アクセストークン**で、ユーザーはいつでもその許可を取り消せます。許す範囲は**スコープ**（例: `photos.read`）で表します。',
              en: 'OAuth 2.0 is a way to **hand over limited, expiring permission without sharing the password**. The printing service receives an **access token** that only allows reading photos, and the user can revoke it any time. The allowed range is expressed as **scopes** (e.g. `photos.read`).',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**リソースオーナー**: データの持ち主（ユーザー）',
                en: '**Resource owner**: the person who owns the data (the user)',
              },
              {
                ja: '**クライアント**: データを使いたいアプリ（印刷サービス）',
                en: '**Client**: the app that wants to use the data (the printing service)',
              },
              {
                ja: '**認可サーバー**: ユーザーを認証し、同意を取ってトークンを発行する（Google のアカウント画面）',
                en: '**Authorization server**: authenticates the user, collects consent and issues tokens (Google\'s account screens)',
              },
              {
                ja: '**リソースサーバー**: トークンを確かめてデータを返す API（Google フォトの API）',
                en: '**Resource server**: the API that checks the token and returns data (the Google Photos API)',
              },
            ],
          },
        ],
      },
      {
        id: 'oa-code-flow',
        title: { ja: '認可コードフロー', en: 'The authorization code flow' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'Web アプリでもスマホアプリでも、今の標準は**認可コードフロー（+ PKCE）**です。ポイントは、ブラウザを通る経路では短命の「認可コード」だけを渡し、本物のトークンはサーバー同士の通信で受け取ることです。',
              en: 'For web and mobile apps alike, the standard today is the **authorization code flow (with PKCE)**. The key idea: only a short-lived "authorization code" travels through the browser, and the real tokens are fetched server to server.',
            },
          },
          { type: 'diagram', id: 'oauth-code-flow' },
          {
            type: 'list',
            items: [
              {
                ja: '**①〜②**: アプリはユーザーを認可サーバーへリダイレクトする。URL には欲しいスコープ、`state`（あとで照合する乱数）、`code_challenge`（PKCE 用）を付ける',
                en: '**①–②**: the app redirects the user to the auth server, with the requested scopes, a `state` (a random value checked later) and a `code_challenge` (for PKCE) in the URL',
              },
              {
                ja: '**③**: ユーザーは認可サーバーの画面でログインし、許可する範囲に同意する。パスワードを入力するのは認可サーバーだけで、アプリには渡らない',
                en: '**③**: the user logs in on the auth server\'s own page and consents to the scopes. The password is entered only there and never reaches the app',
              },
              {
                ja: '**④〜⑤**: 認可サーバーは認可コードを付けて、アプリのコールバック URL へブラウザを戻す。アプリは `state` が自分の送った値と一致するかを確かめる',
                en: '**④–⑤**: the auth server sends the browser back to the app\'s callback URL with an authorization code. The app checks that `state` matches what it sent',
              },
              {
                ja: '**⑥〜⑦**: アプリはサーバー同士の通信で、コードと `code_verifier` をトークンに交換する。ここで初めてアクセストークン（と ID トークン）を受け取る',
                en: '**⑥–⑦**: over a server-to-server call, the app exchanges the code plus `code_verifier` for tokens. Only now does it receive the access token (and ID token)',
              },
              {
                ja: '**⑧〜⑨**: アプリはアクセストークンを `Authorization: Bearer` ヘッダーに付けて API を呼ぶ。API はトークンの署名・期限・スコープを確かめて応える',
                en: '**⑧–⑨**: the app calls the API with the access token in an `Authorization: Bearer` header. The API checks its signature, expiry and scopes before answering',
              },
            ],
          },
          {
            type: 'details',
            summary: { ja: 'PKCE は何を守っているのか', en: 'What PKCE protects against' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '認可コードはブラウザを通るので、ログやスマホ上の悪意あるアプリなどから盗み見られる可能性があります。PKCE（ピクシー）では、アプリが最初に乱数（`code_verifier`）を作り、そのハッシュ（`code_challenge`）だけを認可リクエストに付けます。コードを交換するときは元の乱数を見せる必要があるので、コードだけを盗んでもトークンには交換できません。',
                  en: 'Because the authorization code passes through the browser, it can leak through logs or a malicious app on the device. With PKCE ("pixy"), the app first creates a random `code_verifier` and sends only its hash, the `code_challenge`, with the authorization request. Exchanging the code requires presenting the original value, so a stolen code alone cannot be turned into a token.',
                },
              },
              { type: 'diagram', id: 'oauth-pkce' },
              {
                type: 'p',
                text: {
                  ja: 'もともとはスマホアプリのように秘密の鍵（クライアントシークレット）を安全に持てないアプリのための仕組みでしたが、今は**すべてのクライアントで使うこと**が推奨されています。',
                  en: 'It was originally designed for apps like mobile clients that can\'t keep a client secret safe, but current guidance is to **use it for every client**.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'oa-oidc',
        title: { ja: 'OpenID Connect：ログインのための仕組み', en: 'OpenID Connect: built for login' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'OAuth 2.0 は**認可**の仕組みです。アクセストークンは「この API を呼んでよい」という許可証で、「誰がログインしたか」を伝えるものではありません。アクセストークンをログインの証明として使うのは、よくある間違いです。',
              en: 'OAuth 2.0 is about **authorization**. An access token is a permit to call an API; it does not say who logged in. Treating an access token as proof of login is a common mistake.',
            },
          },
          {
            type: 'p',
            text: {
              ja: '**OpenID Connect（OIDC）**は、OAuth 2.0 の上に**認証**を足した仕組みです。「Google でログイン」のようなボタンは、たいていこれです。認可コードフローに `openid` スコープを付けると、アクセストークンと一緒に **ID トークン**（JWT）が返り、そこに「誰が、いつ、どのアプリのためにログインしたか」が書かれています。',
              en: '**OpenID Connect (OIDC)** adds **authentication** on top of OAuth 2.0. Buttons like "Sign in with Google" are usually OIDC. Add the `openid` scope to the authorization code flow and you get an **ID token** (a JWT) alongside the access token, stating who logged in, when, and for which app.',
            },
          },
          {
            type: 'code',
            label: { ja: 'ID トークンのペイロードの例', en: 'Example ID token payload' },
            code: `{
  "iss": "https://accounts.google.com",  // who issued it
  "sub": "1078...4512",                  // stable user ID
  "aud": "my-app-client-id",             // which app it is for
  "exp": 1791003600,                     // expiry
  "iat": 1791000000,                     // issued at
  "nonce": "n-0S6_WzA2Mj",               // ties it to this login
  "email": "alice@example.com"
}`,
          },
          {
            type: 'p',
            text: {
              ja: 'ID トークンを受け取ったら、次をすべて確かめてからログインさせます。',
              en: 'Before logging the user in, verify all of the following:',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**署名**: 認可サーバーが公開している鍵（JWKS）で検証する。`alg` が `none` のものは受け付けない',
                en: '**Signature**: verify it with the keys the auth server publishes (JWKS), and reject any token with `alg` set to `none`',
              },
              {
                ja: '**`iss` と `aud`**: 期待した発行元か、自分のアプリ宛てか',
                en: '**`iss` and `aud`**: the expected issuer, addressed to your app',
              },
              {
                ja: '**`exp`**: 期限が切れていないか',
                en: '**`exp`**: it hasn\'t expired',
              },
              {
                ja: '**`nonce`**: 自分が今回のログインで送った値と一致するか（使い回しを防ぐ）',
                en: '**`nonce`**: it matches the value you sent for this login (prevents replay)',
              },
            ],
          },
          {
            type: 'note',
            tone: 'tip',
            text: {
              ja: '使い分けは「**ID トークンはアプリが自分で読むもの、アクセストークンは API に渡すもの**」と覚えると迷いません。ユーザーを識別するときは、メールアドレスではなく、変わらない `sub` を使います。',
              en: 'A simple rule: **the ID token is for your app to read; the access token is for the API.** To identify a user, use the stable `sub`, not the email address, which can change.',
            },
          },
          {
            type: 'details',
            summary: { ja: 'ID トークンとアクセストークンの期限は同じ？', en: 'Do the ID token and access token expire at the same time?' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '**同じとは限りません。** 期限は認可サーバーがそれぞれ別に決めます。両方とも約 1 時間で発行するサービスもありますが、それはたまたまそろっているだけです。そもそも、期限が意味するものが違います。',
                  en: '**Not necessarily.** The auth server sets each lifetime separately. Some providers issue both for about an hour, but that is a coincidence. More importantly, the two expiries mean different things.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**ID トークンの期限**: 「このログインの証明がまだ新しいか」を表す。ログインの瞬間に一度検証すれば役目は終わりで、その後のログイン状態はアプリ自身のセッション（Cookie など）で管理する。なので **ID トークンが切れてもログアウトにはならない**',
                    en: '**ID token expiry**: whether the proof of login is still fresh. You verify it once, at login; after that your app\'s own session (a cookie, for example) tracks who is logged in. So **an expired ID token does not log the user out**',
                  },
                  {
                    ja: '**アクセストークンの期限**: その許可証で API を呼べる期間。API が呼び出しのたびに確かめるので、実際に効く。漏れたときの被害を小さくするため短く（数分〜1 時間）する',
                    en: '**Access token expiry**: how long the permit can be used to call APIs. The API checks it on every call, so it actually matters. Keep it short (minutes to an hour) to limit the damage if it leaks',
                  },
                  {
                    ja: '**リフレッシュトークン**: 切れたアクセストークンを取り直すためのもの。数日〜数か月と長めにすることが多い',
                    en: '**Refresh token**: used to get a new access token once the old one expires. It usually lives much longer, from days to months',
                  },
                ],
              },
              {
                type: 'p',
                text: {
                  ja: 'ありがちな間違いは、ID トークンをセッションの代わりに持ち続けて、期限が来るたびにユーザーをログアウトさせてしまうことです。逆に、期限切れの ID トークンをログインの証明として受け付けるのも誤りです。**ID トークンはログイン時に一度だけ使い、その後は自分のセッションで管理する**と覚えておくと迷いません。',
                  en: 'A common mistake is keeping the ID token around as the session and logging users out whenever it expires. Accepting an expired ID token as proof of login is wrong too. Remember: **use the ID token once at login, then manage login state with your own session.**',
                },
              },
            ],
          },
          {
            type: 'details',
            summary: { ja: 'ログイン後はセッション？ トークン？', en: 'After login: session or token?' },
            blocks: [
              {
                type: 'p',
                text: {
                  ja: '**アプリ次第です。** OIDC の仕様は、ID トークンを検証したあとにログイン状態をどう保つかを決めていません。アプリの形に合わせて選びます。',
                  en: '**It\'s up to the app.** The OIDC spec doesn\'t say how to keep the user logged in after the ID token is verified, so you choose what fits your app.',
                },
              },
              {
                type: 'list',
                items: [
                  {
                    ja: '**ブラウザで使う Web アプリ**: サーバー側のセッション + HttpOnly Cookie が定番。JavaScript から読めないので XSS で盗まれにくく、サーバーで消せばすぐにログアウトさせられる。SPA でも、裏にサーバー（BFF）を置いてこの形にするのがおすすめ',
                    en: '**Web apps in the browser**: a server-side session with an HttpOnly cookie is the standard. JavaScript can\'t read it, so XSS can\'t steal it easily, and deleting it on the server logs the user out at once. For SPAs, putting a server (a BFF) behind them to get this setup is recommended',
                  },
                  {
                    ja: '**スマホアプリや、複数の API をまたぐ構成**: アプリ自身が発行するトークン（JWT など）を使うことが多い。サーバーが状態を保存しなくて済み、台数を増やしやすい。ただし途中で取り消しにくいので、期限を短くしてリフレッシュで更新する',
                    en: '**Mobile apps, or setups spanning many APIs**: tokens your own system issues (e.g. JWTs) are common. The server stores no state, which makes scaling out easy, but they are hard to revoke early, so keep them short-lived and renew them with refresh tokens',
                  },
                ],
              },
              {
                type: 'p',
                text: {
                  ja: '考え方は前の「ログイン状態をどう覚えるか」と同じで、**すぐ取り消せるのがセッション、保存がいらず広げやすいのがトークン**です。',
                  en: 'The trade-off is the same as in "Remembering who is logged in" above: **sessions are easy to revoke; tokens need no storage and scale out easily.**',
                },
              },
              {
                type: 'note',
                tone: 'warn',
                text: {
                  ja: 'どちらを選んでも、**認可サーバーから受け取った ID トークンやアクセストークンを、そのまま自分のアプリのセッション代わりにしない**こと。ID トークンはログイン時に一度検証するためのもの、アクセストークンは認可サーバー側の API を呼ぶためのものです。自分のアプリのログイン状態には、自分のセッションか、自分で発行したトークンを使います。',
                  en: 'Either way, **don\'t reuse the ID token or access token from the auth server as your own app\'s session.** The ID token is for verifying the login once; the access token is for calling the provider\'s APIs. Track your app\'s login state with your own session, or a token you issue yourself.',
                },
              },
            ],
          },
        ],
      },
      {
        id: 'oa-pitfalls',
        title: { ja: 'よくある落とし穴', en: 'Common pitfalls' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**古いフローを使う**: トークンを URL で直接受け取る Implicit フローや、アプリにパスワードを入力させる Password フローは、今は非推奨。認可コードフロー + PKCE を使う',
                en: '**Using legacy flows**: the Implicit flow (tokens returned in the URL) and the Password flow (the app collects the password) are deprecated. Use the authorization code flow with PKCE',
              },
              {
                ja: '**リダイレクト先を厳密に照合しない**: 登録したコールバック URL と完全一致で比べる。前方一致やワイルドカードにすると、コードを攻撃者のサイトへ送らされる',
                en: '**Loose redirect URI matching**: compare against the registered callback URL exactly. Prefix or wildcard matching lets attackers have codes sent to their own site',
              },
              {
                ja: '**`state` を確かめない**: 照合しないと、攻撃者のアカウントにログインさせられる CSRF が起こる',
                en: '**Not checking `state`**: without it, a CSRF attack can log the victim into the attacker\'s account',
              },
              {
                ja: '**トークンを `localStorage` に置く**: XSS があると JavaScript から読み出される。ブラウザでは HttpOnly Cookie と、トークンをサーバー側で持つ構成（BFF）が安全',
                en: '**Storing tokens in `localStorage`**: any XSS can read them from JavaScript. In browsers, HttpOnly cookies with tokens held server-side (a BFF) are safer',
              },
              {
                ja: '**権限と期限を大きくしすぎる**: スコープは必要なものだけ、アクセストークンは短命（数分〜1 時間）にし、長く使うときはリフレッシュトークンで更新する',
                en: '**Too much scope, too long a lifetime**: request only the scopes you need, keep access tokens short-lived (minutes to an hour), and renew with refresh tokens',
              },
              {
                ja: '**API 側で検証を省く**: API はトークンの署名・期限・`aud`・スコープを毎回確かめる。「アプリが確認したはず」は理由にならない',
                en: '**Skipping checks in the API**: the API must verify signature, expiry, `aud` and scopes on every call. "The app already checked" is not a reason',
              },
            ],
          },
        ],
      },
      {
        id: 'oa-ops',
        title: { ja: '運用で気をつけること', en: 'Operating it reliably' },
        blocks: [
          {
            type: 'p',
            text: {
              ja: 'SRE の視点では、認可サーバーは**全員のログインが通る重要な依存先**です。ここが止まると、ほかが元気でもサービス全体が使えなくなります。',
              en: 'From an SRE point of view, the auth server is a **critical dependency every login passes through**. If it goes down, the whole service is unusable even when everything else is healthy.',
            },
          },
          {
            type: 'list',
            items: [
              {
                ja: '**公開鍵をキャッシュする**: JWT の検証に使う JWKS を毎回取りに行かず、キャッシュする。鍵の更新（ローテーション）に備えて、知らない `kid` が来たときだけ取り直す',
                en: '**Cache the public keys**: don\'t fetch the JWKS on every request. Cache it, and refetch only when a token arrives with an unknown `kid`, so key rotation still works',
              },
              {
                ja: '**時計のずれ**: `exp` の判定はサーバーの時計に頼るので、NTP で合わせ、数十秒の許容幅を持たせる',
                en: '**Clock skew**: `exp` checks depend on server clocks, so keep them in sync with NTP and allow a small leeway of tens of seconds',
              },
              {
                ja: '**更新の集中を避ける**: 全員のトークンが同じ時刻に切れると、リフレッシュが一斉に押し寄せる。期限にゆらぎを入れて分散させる',
                en: '**Avoid refresh stampedes**: if everyone\'s tokens expire at the same moment, refreshes arrive all at once. Add jitter to lifetimes to spread them out',
              },
              {
                ja: '**監視**: ログイン成功率、401 / 403 の急増、トークン発行の遅延を見る。401 の急増は鍵の更新ミスの兆候のことが多い',
                en: '**Monitoring**: watch login success rate, spikes in 401/403, and token issuance latency. A sudden jump in 401s is often a botched key rotation',
              },
              {
                ja: '**取り消しと監査**: 漏えいに備えて、トークンやセッションをまとめて無効にする手段と、誰がいつ何を許可したかの記録を用意する',
                en: '**Revocation and audit**: have a way to invalidate tokens and sessions in bulk after a leak, and keep records of who granted what and when',
              },
            ],
          },
        ],
      },
      {
        id: 'oa-summary',
        title: { ja: 'まとめ', en: 'Summary' },
        blocks: [
          {
            type: 'list',
            items: [
              {
                ja: '**認証は「誰か」、認可は「何をしてよいか」**。いつも認証が先',
                en: '**Authentication is "who", authorization is "what"**, and authentication always comes first',
              },
              {
                ja: '**OAuth 2.0 は認可、OpenID Connect は認証**。ログインには ID トークンを使い、API にはアクセストークンを渡す',
                en: '**OAuth 2.0 is authorization; OpenID Connect is authentication.** Log users in with the ID token and give the access token to APIs',
              },
              {
                ja: '**認可コードフロー + PKCE が標準**。ブラウザにはコードだけを通し、トークンは裏側で受け取る',
                en: '**Authorization code flow with PKCE is the standard.** Only the code goes through the browser; tokens come over the back channel',
              },
              {
                ja: '**トークンは必ず検証し、短命・最小権限にする**',
                en: '**Always verify tokens, and keep them short-lived and narrowly scoped**',
              },
            ],
          },
          {
            type: 'p',
            text: {
              ja: '仕様は [RFC 6749（OAuth 2.0）](https://datatracker.ietf.org/doc/html/rfc6749)、[RFC 7636（PKCE）](https://datatracker.ietf.org/doc/html/rfc7636)、[OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html) です。実装の注意点は [RFC 9700（OAuth 2.0 Security Best Current Practice）](https://datatracker.ietf.org/doc/html/rfc9700) と [OWASP の OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html) にまとまっています。',
              en: 'The specs are [RFC 6749 (OAuth 2.0)](https://datatracker.ietf.org/doc/html/rfc6749), [RFC 7636 (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636) and [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html). For implementation guidance, see [RFC 9700 (OAuth 2.0 Security Best Current Practice)](https://datatracker.ietf.org/doc/html/rfc9700) and the [OWASP OAuth 2.0 Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html).',
            },
          },
        ],
      },
    ],
  },
];
