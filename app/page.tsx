import { profile, flagship, cases, sideProjects, about, contact } from '@/content/site';
import manifest from '@/content/image-manifest.json';

type ImageEntry = { webp: string; avif: string; width: number; height: number };
const images = manifest as Record<string, ImageEntry>;

function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="tags">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export default function Home() {
  const shot = images['/images/tsumugi-shift'];

  return (
    <>
      <header className="masthead">
        <div className="shell masthead__inner">
          <span className="masthead__name">{profile.name}</span>
          <nav className="masthead__nav" aria-label="ページ内の移動">
            <a href="#work">実績</a>
            <a href="#side">制作物</a>
            <a href="#about">私について</a>
            <a href="#contact">連絡先</a>
          </nav>
        </div>
      </header>

      <main>
        {/* ----- 導入 ----- */}
        <section className="shell intro">
          <h1 className="intro__name">{profile.name}</h1>
          <p className="intro__positioning">{profile.positioning}</p>
          <p className="intro__affiliation">{profile.affiliation}</p>
        </section>

        {/* ----- フラッグシップ ----- */}
        <section className="shell section" id="work">
          <p className="section__label">Featured</p>

          <p className="flagship__subject">{flagship.subject}</p>
          <h2 className="flagship__title">{flagship.title}</h2>

          <div className="flagship__block">
            <h3 className="flagship__heading">{flagship.problem.heading}</h3>
            <p className="flagship__body">{flagship.problem.body}</p>
          </div>

          {/* シグネチャ要素。静止画として置くだけで、動きは一切与えない */}
          {shot && (
            <div className="sheet">
              <picture>
                <source srcSet={shot.avif} type="image/avif" />
                <source srcSet={shot.webp} type="image/webp" />
                <img
                  className="sheet__img"
                  src={shot.webp}
                  width={shot.width}
                  height={shot.height}
                  alt={flagship.screenshot.alt}
                  // 最初の画面に入る想定なので lazy にしない（LCPを遅らせないため）
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </div>
          )}

          <div className="flagship__block">
            <h3 className="flagship__heading">{flagship.approach.heading}</h3>
            <p className="flagship__body">{flagship.approach.body}</p>
          </div>

          <ul className="decisions">
            {flagship.decisions.map((d) => (
              <li key={d.heading} className="flagship__block">
                <h3 className="flagship__heading">{d.heading}</h3>
                <p className="flagship__body">{d.body}</p>
              </li>
            ))}
          </ul>

          <div className="flagship__block">
            <h3 className="flagship__heading">{flagship.result.heading}</h3>
            <p className="flagship__body">{flagship.result.body}</p>
          </div>

          <Tags items={flagship.stack} />
          {flagship.liveUrl && (
            <p style={{ marginTop: '1.25rem' }}>
              <a href={flagship.liveUrl} target="_blank" rel="noopener noreferrer">
                紡シフトを見る
              </a>
            </p>
          )}
        </section>

        {/* ----- その他の実績 ----- */}
        <section className="shell section">
          <p className="section__label">Work</p>
          <ul className="cases">
            {cases.map((c) => (
              <li key={c.id}>
                {/* 見出しは案件名ではなく、誰のどんな課題だったか */}
                <h2 className="case__problem">{c.problemHeadline}</h2>
                <p className="case__title">{c.title}</p>
                <p className="case__body">{c.body}</p>
                <p className="case__body">{c.outcome}</p>
                <Tags items={c.stack} />
                {c.liveUrl && (
                  <p style={{ marginTop: '1.25rem' }}>
                    <a href={c.liveUrl} target="_blank" rel="noopener noreferrer">
                      {c.title}を見る
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* ----- その他の制作物 ----- */}
        <section className="shell section" id="side">
          <p className="section__label">Other</p>
          <ul className="side-list">
            {sideProjects.map((p) => (
              <li key={p.name}>
                <a
                  className="side-list__link"
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.name}
                </a>
                <p className="side-list__desc">{p.description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ----- 私について ----- */}
        <section className="shell section" id="about">
          <p className="section__label">About</p>
          <h2 className="about__role">{about.internship.role}</h2>
          <p>{about.internship.body}</p>
          <p className="about__meta">{about.education}</p>
        </section>

        {/* ----- 連絡先 ----- */}
        <section className="shell section" id="contact">
          <p className="section__label">Contact</p>
          <p>お仕事のご依頼やご質問は、フォームからお送りください。</p>
          <a
            className="contact__button"
            href={contact.formUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            お問い合わせフォームを開く
          </a>
        </section>
      </main>

      <footer className="colophon">
        <div className="shell">
          © {new Date().getFullYear()} {profile.name}
        </div>
      </footer>
    </>
  );
}
