// 複数ページで共有する小さな部品。
// クライアント側の処理は持たない（'use client' を付けない）。

import { profile } from '@/content/site';

export function Tags({ items }: { items: readonly string[] }) {
  return (
    <ul className="tags">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

export function Masthead() {
  return (
    <header className="masthead">
      <div className="shell masthead__inner">
        <a className="masthead__name" href="/">
          {profile.name}
        </a>
        <nav className="masthead__nav" aria-label="ページ内の移動">
          <a href="/#works">実績</a>
          <a href="/#side">制作物</a>
          <a href="/#about">私について</a>
          <a href="/#contact">連絡先</a>
        </nav>
      </div>
    </header>
  );
}

export function Colophon() {
  return (
    <footer className="colophon">
      <div className="shell">
        © {new Date().getFullYear()} {profile.name}
      </div>
    </footer>
  );
}
