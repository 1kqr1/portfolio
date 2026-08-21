import { profile, works } from '@/content/site';
import manifest from '@/content/image-manifest.json';
import { Masthead, Colophon, Tags } from './_components';

type ImageEntry = { webp: string; avif: string; width: number; height: number };
const images = manifest as Record<string, ImageEntry>;

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
            {works.map((w) => {
              const shot = w.screenshot ? images[w.screenshot.key] : null;
              return (
                <li key={w.slug} className="work-index__item">
                  <a className="work-index__link" href={`/works/${w.slug}/`}>
                    {shot && w.screenshot && (
                      <span className="work-index__thumb">
                        <picture>
                          <source srcSet={shot.avif} type="image/avif" />
                          <source srcSet={shot.webp} type="image/webp" />
                          <img
                            src={shot.webp}
                            width={shot.width}
                            height={shot.height}
                            alt={w.screenshot.alt}
                            loading="lazy"
                            decoding="async"
                          />
                        </picture>
                      </span>
                    )}
                    <span className="work-index__body">
                      {/* 見出しは案件名ではなく、誰のどんな課題だったか */}
                      <span className="work-index__problem">{w.problemHeadline}</span>
                      <span className="work-index__meta">
                        {w.title}
                        <span className="work-index__sep"> — </span>
                        {w.subject}
                      </span>
                      <span className="work-index__summary">{w.summary}</span>
                      <Tags items={w.stack} />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <Colophon />
    </>
  );
}
