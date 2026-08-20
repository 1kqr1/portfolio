// ============================================================
// scripts/strip-hydration.mjs
// ============================================================
// このサイトはクライアントコンポーネントを1つも持たない完全な静的ページで、
// 出力される JS は「同じマークアップをもう一度描き直すだけ」のハイドレーション用。
// 実測では、この JS が Lighthouse の LCP を 4.1秒 まで押し下げていた
// （FCP 0.9秒 / Speed Index 0.9秒 に対して LCP・TTI がともに 4.1秒）。
//
// そのため、ビルド後に <script> を取り除いて素の静的HTMLとして配信する。
// リンクは通常の <a> なので、これで壊れる機能は無い。
//
// !! 重要 !!
// 将来クライアント側の処理（'use client'）を1つでも足したら、この処理は
// その機能を丸ごと殺してしまう。そのため下のガードで 'use client' を検出したら
// 何もせずに終了する。ガードに引っかかったらこのスクリプトを外すこと。

import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const SOURCE_DIRS = ['app', 'components', 'content'];

async function walk(dir, filter) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...(await walk(p, filter)));
    else if (filter(p)) found.push(p);
  }
  return found;
}

// ---- ガード: クライアントコンポーネントが無いことを確認する ----
const sourceFiles = [];
for (const d of SOURCE_DIRS) {
  sourceFiles.push(
    ...(await walk(path.join(ROOT, d), (p) => /\.(tsx?|jsx?)$/.test(p)))
  );
}

const clientFiles = [];
for (const f of sourceFiles) {
  const src = await readFile(f, 'utf8');
  // ファイル先頭の 'use client' ディレクティブだけを見る
  if (/^\s*(['"])use client\1/m.test(src.slice(0, 200))) {
    clientFiles.push(path.relative(ROOT, f));
  }
}

if (clientFiles.length > 0) {
  console.warn(
    '[strip] クライアントコンポーネントを検出したので、JSの除去を中止します:'
  );
  for (const f of clientFiles) console.warn(`  - ${f}`);
  console.warn(
    '[strip] インタラクションが必要になったなら、package.json からこの手順を外してください。'
  );
  process.exit(0);
}

// ---- <script> を取り除く ----
const htmlFiles = await walk(OUT, (p) => p.endsWith('.html'));
let before = 0;
let after = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  before += Buffer.byteLength(html);

  const stripped = html
    // 外部スクリプトとインラインスクリプト（RSCペイロードを含む）を除去
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '')
    // JS を先読みさせる preload / prefetch も不要になる
    .replace(/<link\b[^>]*\bas="script"[^>]*>/gi, '')
    .replace(/<link\b[^>]*\brel="preload"[^>]*\.js"[^>]*>/gi, '');

  after += Buffer.byteLength(stripped);
  await writeFile(file, stripped);
}

// 参考情報として、残った JS ファイルの総量を出す
const jsFiles = await walk(OUT, (p) => p.endsWith('.js'));
let orphanBytes = 0;
for (const f of jsFiles) orphanBytes += (await stat(f)).size;

console.log(
  `[strip] ${htmlFiles.length}個のHTMLから <script> を除去（${before.toLocaleString()} → ${after.toLocaleString()} bytes）`
);
console.log(
  `[strip] 参照されなくなったJS ${jsFiles.length}ファイル（${orphanBytes.toLocaleString()} bytes）はダウンロードされません`
);
