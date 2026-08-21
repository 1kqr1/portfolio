import type { Metadata } from 'next';
import { profile, about } from '@/content/site';
import { Masthead, Colophon } from '../_components';

export const metadata: Metadata = {
  title: `私について | ${profile.name}`,
};

export default function AboutPage() {
  return (
    <>
      <Masthead />

      <main className="shell page">
        <h1 className="page__title">私について</h1>
        <h2 className="about__role">{about.internship.role}</h2>
        <p>{about.internship.body}</p>
        <p className="about__meta">{about.education}</p>
      </main>

      <Colophon />
    </>
  );
}
