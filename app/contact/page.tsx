import type { Metadata } from 'next';
import { profile, contact } from '@/content/site';
import { Masthead, Colophon } from '../_components';

export const metadata: Metadata = {
  title: `連絡先 | ${profile.name}`,
};

export default function ContactPage() {
  return (
    <>
      <Masthead />

      <main className="shell page">
        <h1 className="page__title">連絡先</h1>
        <p>
          お仕事のご依頼やご質問は、
          <a href={contact.formUrl} target="_blank" rel="noopener noreferrer">
            お問い合わせフォーム
          </a>
          からお送りください。
        </p>
      </main>

      <Colophon />
    </>
  );
}
