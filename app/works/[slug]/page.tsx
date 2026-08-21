import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { works, profile } from '@/content/site';
import manifest from '@/content/image-manifest.json';
import { Masthead, Colophon, Tags } from '../../_components';

type ImageEntry = { webp: string; avif: string; width: number; height: number };
const images = manifest as Record<string, ImageEntry>;

// 静的エクスポートのため、全ページをビルド時に生成する
export function generateStaticParams() {
  return works.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = works.find((w) => w.slug === slug);
  if (!work) return {};
  return {
    title: `${work.title} | ${profile.name}`,
    description: work.summary,
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = works.find((w) => w.slug === slug);
  if (!work) notFound();

  const shot = work.screenshot ? images[work.screenshot.key] : null;
  const { detail } = work;

  return (
    <>
      <Masthead />

      <main className="shell work">
        <p className="work__back">
          <a href="/#works">← 実績一覧</a>
        </p>

        <p className="work__subject">{work.subject}</p>
        <h1 className="work__title">{work.title}</h1>

        <section className="work__block">
          <h2 className="work__heading">{detail.problem.heading}</h2>
          <p>{detail.problem.body}</p>
        </section>

        {/* シグネチャ要素。静止画として置くだけで、動きは一切与えない */}
        {shot && work.screenshot && (
          <div className="sheet">
            <picture>
              <source srcSet={shot.avif} type="image/avif" />
              <source srcSet={shot.webp} type="image/webp" />
              <img
                className="sheet__img"
                src={shot.webp}
                width={shot.width}
                height={shot.height}
                alt={work.screenshot.alt}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
        )}

        <section className="work__block">
          <h2 className="work__heading">{detail.approach.heading}</h2>
          <p>{detail.approach.body}</p>
        </section>

        {detail.decisions.length > 0 && (
          <ul className="decisions">
            {detail.decisions.map((d) => (
              <li key={d.heading} className="work__block">
                <h2 className="work__heading">{d.heading}</h2>
                <p>{d.body}</p>
              </li>
            ))}
          </ul>
        )}

        <section className="work__block">
          <h2 className="work__heading">{detail.result.heading}</h2>
          <p>{detail.result.body}</p>
        </section>

        <Tags items={work.stack} />

        {work.liveUrl && (
          <p className="work__live">
            <a href={work.liveUrl} target="_blank" rel="noopener noreferrer">
              {work.title}を見る
            </a>
          </p>
        )}
      </main>

      <Colophon />
    </>
  );
}
