// Content definition: topic -> section (prose + diagram)
// Text is a { ja, en } localized pair. Edit here to add more pages.

import type { LocalizedString } from '../i18n';

export type DiagramId =
  | 'url-basic-flow'
  | 'url-key-generation'
  | 'url-read-write'
  | 'url-cache-scale'
  | 'rl-why'
  | 'rl-token-bucket'
  | 'rl-allow-deny'
  | 'rl-algorithms'
  | 'rl-distributed';

export type Block =
  | { type: 'p'; text: LocalizedString }
  | { type: 'list'; items: LocalizedString[] }
  | { type: 'note'; tone: 'info' | 'tip' | 'warn'; text: LocalizedString }
  | { type: 'code'; code: string; label?: LocalizedString }
  | { type: 'diagram'; id: DiagramId };

export interface Section {
  id: string;
  title: LocalizedString;
  blocks: Block[];
}

export interface Topic {
  id: string;
  title: LocalizedString;
  tagline: LocalizedString;
  sections: Section[];
}

export const topics: Topic[] = [
  {
    id: 'url-shortener',
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
                ja: '書き込み（Write）: 長いURLを受け取り、短いキーを発行して保存する',
                en: 'Write: accept a long URL, issue a short key, and store it',
              },
              {
                ja: '読み取り（Read）: 短いキーを受け取り、元のURLを引いてリダイレクトする',
                en: 'Read: take a short key, look up the original URL, and redirect',
              },
              {
                ja: '特性: 読み取りが書き込みより圧倒的に多い（Read-heavy）',
                en: 'Trait: reads vastly outnumber writes (read-heavy)',
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
                ja: '連番+Base62: 短く衝突しない。ただしIDが連番だと推測されやすい',
                en: 'Sequential + Base62: short and collision-free, but sequential IDs are easy to guess',
              },
              {
                ja: 'ランダム生成: 推測されにくいが、衝突チェックが必要',
                en: 'Random generation: hard to guess, but needs collision checks',
              },
              {
                ja: 'ハッシュ(MD5など)の先頭数文字: 手軽だが衝突対策が要る',
                en: 'First few chars of a hash (e.g. MD5): easy, but still needs collision handling',
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
                ja: 'キャッシュヒット: DBに行かずキャッシュから即返す（速い）',
                en: 'Cache hit: return straight from cache without touching the DB (fast)',
              },
              {
                ja: 'キャッシュミス: DBから引いてキャッシュに載せ、次回に備える',
                en: 'Cache miss: read from the DB, then populate the cache for next time',
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
    ],
  },
  {
    id: 'rate-limiter',
    title: { ja: 'Rate Limiter', en: 'Rate Limiter' },
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
                ja: 'DoS/乱用の防止: 悪意ある大量アクセスを弾く',
                en: 'Prevent DoS/abuse: block malicious floods of traffic',
              },
              {
                ja: 'コスト保護: 過剰な処理による費用増を防ぐ',
                en: 'Protect cost: avoid runaway spend from excess processing',
              },
              {
                ja: '公平性: 一部のユーザーがリソースを独占しないようにする',
                en: 'Fairness: keep a few users from hogging resources',
              },
            ],
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
                ja: '補充レート: 1秒あたり何個トークンを足すか（平常時の許容ペース）',
                en: 'Refill rate: tokens added per second (the steady-state allowed pace)',
              },
              {
                ja: 'バケツ容量: 最大何個までトークンを貯められるか（バースト許容量）',
                en: 'Bucket capacity: max tokens that can accumulate (burst allowance)',
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
                ja: 'Fixed Window: 固定の時間枠ごとにカウント。シンプルだが枠の境界で急増を許してしまう',
                en: 'Fixed Window: count per fixed time slot. Simple, but allows spikes at slot boundaries',
              },
              {
                ja: 'Sliding Window: 直近N秒を滑らせて数える。境界問題を緩和できる',
                en: 'Sliding Window: count over a moving last-N-seconds window, easing the boundary problem',
              },
              {
                ja: 'Token Bucket: バーストを許容しつつ平均レートを抑える。柔軟で人気',
                en: 'Token Bucket: allow bursts while bounding the average rate. Flexible and popular',
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
        ],
      },
    ],
  },
];
