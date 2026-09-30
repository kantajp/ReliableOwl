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
  | 'cb-state-machine';

export type Block =
  | { type: 'p'; text: LocalizedString }
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

export type CategoryId = 'system-design' | 'sre';

export interface Category {
  id: CategoryId;
  label: LocalizedString;
}

// Display order of categories in the sidebar and on the home page.
export const categories: Category[] = [
  { id: 'system-design', label: { ja: 'システム設計', en: 'System Design' } },
  { id: 'sre', label: { ja: 'SRE（サイト信頼性）', en: 'SRE' } },
];

export interface Topic {
  id: string;
  category: CategoryId;
  title: LocalizedString;
  tagline: LocalizedString;
  sections: Section[];
}

export const topics: Topic[] = [
  {
    id: 'fundamentals',
    category: 'system-design',
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
    id: 'circuit-breaker',
    category: 'sre',
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
];
