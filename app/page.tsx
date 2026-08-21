import { profile, works, sideProjects, about, contact } from '@/content/site';
import { Masthead, Colophon, Tags } from './_components';

export default function Home() {
  return (
    <>
      <Masthead />

      <main>
        {/* ----- 導入 ----- */}
        <section className="shell intro">
          <h1 className="intro__name">{profile.name}</h1>
          <p className="intro__positioning">{profile.positioning}</p>
          <p className="intro__affiliation">{profile.affiliation}</p>
        </section>

        {/* ----- 実績（この一覧がこのサイトの背骨） ----- */}
        <section className="shell section" id="works">
          <h2 className="section__label">実績</h2>
          <ul className="work-index">
            {works.map((w) => (
              <li key={w.slug} className="work-index__item">
                <a className="work-index__link" href={`/works/${w.slug}/`}>
                  {/* 見出しは案件名ではなく、誰のどんな課題だったか */}
                  <span className="work-index__problem">{w.problemHeadline}</span>
                </a>
                <p className="work-index__meta">
                  {w.title}
                  <span className="work-index__sep"> — </span>
                  {w.subject}
                </p>
                <p className="work-index__summary">{w.summary}</p>
                <Tags items={w.stack} />
              </li>
            ))}
          </ul>
        </section>

        {/* ----- その他の制作物 ----- */}
        <section className="shell section" id="side">
          <h2 className="section__label">その他の制作物</h2>
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
          <h2 className="section__label">私について</h2>
          <h3 className="about__role">{about.internship.role}</h3>
          <p>{about.internship.body}</p>
          <p className="about__meta">{about.education}</p>
        </section>

        {/* ----- 連絡先 ----- */}
        <section className="shell section" id="contact">
          <h2 className="section__label">連絡先</h2>
          <p>
            お仕事のご依頼やご質問は、
            <a href={contact.formUrl} target="_blank" rel="noopener noreferrer">
              お問い合わせフォーム
            </a>
            からお送りください。
          </p>
        </section>
      </main>

      <Colophon />
    </>
  );
}
