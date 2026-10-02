import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { useLang } from '../i18n';

// Author profile / About page. Bilingual via `ja`.
// Oracle is listed as an upcoming role: once started, drop "(planned)" and
// change the intro to "now work as a Site Reliability Engineer in Tokyo".
export function AboutPage({ onHome }: { onHome: () => void }) {
  const { lang } = useLang();
  const ja = lang === 'ja';
  const tr = (j: string, e: string) => (ja ? j : e);

  const timeline: { role: string; period: string; note?: string }[] = [
    {
      role: tr('Oracle（東京）— Site Reliability Engineer', 'Oracle (Tokyo) — Site Reliability Engineer'),
      period: tr('2026 –（入社予定）', '2026 – (starting soon)'),
    },
    {
      role: tr('Amazon Web Services（ダブリン）— Cloud Support Engineer', 'Amazon Web Services (Dublin) — Cloud Support Engineer'),
      period: '2024 – 2026',
    },
    {
      role: tr('台湾の大学 — コンピュータサイエンス', 'University in Taiwan — Computer Science'),
      period: tr('– 2024', '– 2024'),
    },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
  };

  return (
    <main className="about">
      <div className="about__inner">
        <button className="about__back" onClick={onHome}>
          ← {tr('ホームに戻る', 'Back to home')}
        </button>

        {/* ===== Header ===== */}
        <motion.header className="about__head" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="about__avatar">
            <Logo size={56} color="#fff" />
          </div>
          <div>
            <h1 className="about__name">Kanta Nakamura</h1>
            <p className="about__role">
              {tr('Site Reliability Engineer', 'Site Reliability Engineer')}
            </p>
            <div className="about__social">
              <SocialLinks />
            </div>
          </div>
        </motion.header>

        {/* ===== Intro ===== */}
        <motion.section className="about__block" {...fadeUp} transition={{ duration: 0.5 }}>
          <p className="about__lead">
            {tr(
              '台湾の大学でコンピュータサイエンスを学び、新卒でヨーロッパに渡ってエンジニアとして働きました。現在は日本に拠点を移し、Site Reliability Engineer としてのキャリアを始めるところです。大規模なシステムを「落ちないように」、そして「落ちても速く戻せるように」設計することに関心があります。',
              "I studied computer science at a university in Taiwan, then moved to Europe to start my career as an engineer. I've since moved back to Japan and am starting my career as a Site Reliability Engineer. I'm interested in how large systems are designed to stay up, and to recover quickly when they don't.",
            )}
          </p>
        </motion.section>

        {/* ===== Experience ===== */}
        <motion.section className="about__block" {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="about__h2">{tr('経歴', 'Experience')}</h2>
          <ul className="about__timeline">
            {timeline.map((t, i) => (
              <li key={i} className="about__item">
                <div className="about__item-role">{t.role}</div>
                <div className="about__item-period">{t.period}</div>
                {t.note && <div className="about__item-note">{t.note}</div>}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ===== About this site ===== */}
        <motion.section className="about__block" {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="about__h2">{tr('このサイトについて', 'About this site')}</h2>
          <p className="about__body">
            {tr(
              'このサイトは、私がシステム設計と SRE を学びながら、その内容を整理して書き残しているノートです。人に説明できる形にまとめることで、自分の理解も確かめています。3 つの国で、規模も文化も違うシステムと現場を見てきた経験も交えながら、文章と動く図でまとめています。学ぶたびに、記事も少しずつ増やし、更新していきます。内容は個人の見解で、所属組織とは関係ありません。',
              "This site is my notebook: I write up system design and SRE as I learn them. Putting each topic into a form I could explain to someone else is how I check my own understanding. Along the way I draw on what I've seen of systems and teams of very different scale and culture across three countries, and explain it with writing and interactive diagrams. As I keep learning, I'll keep adding and updating articles. Views are my own and not those of any employer.",
            )}
          </p>
        </motion.section>

        <footer className="about__footer">
          <SocialLinks />
          <p>Built by Kanta Nakamura · Reliable Owl</p>
        </footer>
      </div>
    </main>
  );
}
