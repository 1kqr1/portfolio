import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { JetBrains_Mono } from 'next/font/google';
import { profile } from '@/content/site';
import './globals.css';

// next/font がビルド時にセルフホストするため、Google Fonts への実行時リクエストは発生しない。
// ウェイトは各1つに絞る（docs/design.md 2章）。

// 見出しの明朝体は、実際に使う145字だけに絞ったサブセットを読む。
// （next/font/google で日本語サブセットを丸ごと入れると @font-face 130個・
//   フォント約2.7MB・CSS 98KB まで膨らむことを実測したため。
//   サブセットの生成は scripts/build-display-font.mjs）
const display = localFont({
  src: '../assets/fonts/display-subset.woff2',
  display: 'swap',
  variable: '--font-display-loaded',
  // 明朝が来る前と後で行の高さがずれないようにフォールバックを合わせる
  fallback: ['Yu Mincho', 'YuMincho', 'Hiragino Mincho ProN', 'serif'],
});

const mono = JetBrains_Mono({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono-loaded',
});

export const metadata: Metadata = {
  title: `${profile.name}（${profile.handle}）| ポートフォリオ`,
  description: profile.positioning,
  openGraph: {
    title: `${profile.name}（${profile.handle}）`,
    description: profile.positioning,
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
