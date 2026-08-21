import { profile, works } from '@/content/site';
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

        {/* ----- 実績（このサイトの背骨） ----- */}
        <section className="shell section">
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
      </main>

      <Colophon />
    </>
  );
}
