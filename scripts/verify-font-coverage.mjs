// ============================================================
// scripts/verify-font-coverage.mjs
// ============================================================
// 見出し用サブセットに、実際に出力された全ページの見出し文字が
// すべて含まれているかをビルド後に検証する。
// 含まれていない文字はその字だけフォールバック（游明朝等）で描画され、
// 見出しの中で書体が混ざるため、見逃さないようにビルドを失敗させる。

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const OUT_DIR = path.join(process.cwd(), 'out');
const STATE = path.join(process.cwd(), 'content', 'display-font.json');

const strip = (s) => s.replace(/<[^>]+>/g, '');

async function walkHtml(dir) {
  const found = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...(await walkHtml(p)));
    else if (p.endsWith('.html')) found.push(p);
  }
  return found;
}

const htmlFiles = await walkHtml(OUT_DIR);
const subset = new Set(JSON.parse(await readFile(STATE, 'utf8')).chars);

const missing = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const texts = [];

  for (const m of html.matchAll(/<(h1|h2|h3)[^>]*>(.*?)<\/\1>/gs)) {
    texts.push(strip(m[2]));
  }
  // 見出しタグ以外で --font-display を当てているクラス
  for (const m of html.matchAll(
    /class="[^"]*(?:masthead__name|side-list__link|work-index__problem)[^"]*"[^>]*>(.*?)</gs
  )) {
    texts.push(strip(m[1]));
  }

  for (const text of texts) {
    for (const ch of text) {
      if (ch.trim() && !subset.has(ch)) {
        if (!missing.has(ch)) {
          missing.set(ch, `${text.slice(0, 30)} (${path.relative(OUT_DIR, file)})`);
        }
      }
    }
  }
}

if (missing.size > 0) {
  console.error(
    `[font] 見出しサブセットに無い文字が ${missing.size} 種類あります:`
  );
  for (const [ch, ctx] of missing) {
    console.error(`  '${ch}'  （例: ${ctx}）`);
  }
  console.error(
    '[font] content/display-font.json を消して再ビルドすると取り直します。'
  );
  process.exit(1);
}

console.log(
  `[font] OK: ${htmlFiles.length}ページの見出しはすべてサブセット（${subset.size}字）に含まれています`
);
