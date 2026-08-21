import type { Metadata } from 'next';
import { profile, sideProjects } from '@/content/site';
import { Masthead, Colophon } from '../_components';

export const metadata: Metadata = {
  title: `その他の制作物 | ${profile.name}`,
};

export default function OtherPage() {
  return (
    <>
      <Masthead />

      <main className="shell page">
        <h1 className="page__title">その他の制作物</h1>
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
      </main>

      <Colophon />
    </>
  );
}
