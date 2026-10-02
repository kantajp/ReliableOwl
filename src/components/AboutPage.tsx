import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { SocialLinks } from './SocialLinks';
import { useLang } from '../i18n';

// Author profile / About page. DRAFT: the prose below is placeholder text —
// replace the marked spots with the real, accurate wording. Bilingual via `ja`.
export function AboutPage({ onHome }: { onHome: () => void }) {
  const { lang } = useLang();
  const ja = lang === 'ja';
  const tr = (j: string, e: string) => (ja ? j : e);

  const skills = ['SRE', 'System Design', 'AWS', 'Oracle Cloud', 'TypeScript', 'React', 'Observability'];

  const timeline: { role: string; period: string; note?: string }[] = [
    {
      role: tr('（下書き）Oracle — ソフトウェアエンジニア', '(draft) Oracle — Software Engineer'),
      period: '20XX – 20XX',
      note: tr('担当した仕事を1〜2行で。', 'One or two lines about what you did.'),
    },
    {
      role: tr('（下書き）AWS — エンジニア', '(draft) AWS — Engineer'),
      period: '20XX – 20XX',
      note: tr('担当した仕事を1〜2行で。', 'One or two lines about what you did.'),
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
              '（下書き）信頼性の高いシステムをつくるのが好きなエンジニアです。学んだことを「動く図」で説明する学習ノート Reliable Owl を1人で作っています。将来は SRE のスペシャリストを目指しています。',
              '(draft) I am an engineer who enjoys building reliable systems. I build Reliable Owl, a solo learning notebook that explains concepts with interactive diagrams. My goal is to become an SRE specialist.',
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

        {/* ===== Skills ===== */}
        <motion.section className="about__block" {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="about__h2">{tr('扱う技術', 'Skills')}</h2>
          <div className="about__chips">
            {skills.map((s) => (
              <span key={s} className="about__chip">{s}</span>
            ))}
          </div>
        </motion.section>

        {/* ===== About this site ===== */}
        <motion.section className="about__block" {...fadeUp} transition={{ duration: 0.5 }}>
          <h2 className="about__h2">{tr('このサイトについて', 'About this site')}</h2>
          <p className="about__body">
            {tr(
              'Reliable Owl は、システム設計と SRE を「読みながら、図を動かして」学べる学習ノートです。すべての図は依存ライブラリなしで手書きし、日本語・英語とダーク/ライトに対応しています。',
              'Reliable Owl is a learning notebook for system design and SRE — read as you scroll and watch the diagrams move. Every diagram is hand-built with no chart libraries, and the site supports Japanese/English and light/dark themes.',
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
