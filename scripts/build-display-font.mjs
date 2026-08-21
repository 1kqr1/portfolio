// ============================================================
// scripts/build-display-font.mjs
// ============================================================
// 見出し用の明朝体（Zen Old Mincho）を、実際にページで使う文字だけに絞って
// ダウンロードし、self-host 用に public/fonts へ置く。
//
// なぜこうするか:
//   next/font で日本語サブセットを丸ごと取り込むと、@font-face が130個・
//   フォントファイルが約2.7MB・CSSが98KBまで膨らむことを実測で確認した。
//   見出しに使う文字は数十字しかないため、その字だけを含む1ファイルにする。
//
// 決定性のため、文字集合が前回と同じならネットワークアクセスをスキップする。
// content を編集して新しい文字が増えたときだけ取り直す。

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const FONT_FAMILY = 'Zen Old Mincho';
// next/font/local に読ませるため public/ ではなく assets/ に置く
// （public/ 直下だと basePath 付きの URL 解決を自前でやる必要が出る）
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');
const FONT_FILE = path.join(FONT_DIR, 'display-subset.woff2');
const STATE_FILE = path.join(process.cwd(), 'content', 'display-font.json');

/**
 * 見出し（--font-display）で表示される文字を content から集める。
 * ここに挙げ漏れると、その文字だけフォールバック（游明朝等）で表示される。
 */
async function collectDisplayText() {
  const src = await readFile(path.join(process.cwd(), 'content', 'site.ts'), 'utf8');

  // 見出しに流し込んでいるフィールドだけを対象にする
  const keys = [
    'name',
    'title',
    'subject',
    'heading',
    'problemHeadline',
    'role',
  ];
  let text = '';
  for (const key of keys) {
    const re = new RegExp(`\\b${key}:\\s*(['\`])([\\s\\S]*?)\\1`, 'g');
    for (const m of src.matchAll(re)) text += m[2];
  }

  // sideProjects の name は --font-display で表示される
  for (const m of src.matchAll(/name:\s*'([^']*)'/g)) text += m[1];

  // 画面に固定で置いている見出し文言（app/page.tsx 側）
  text += 'Featured Work Other About Contact';

  return text;
}

function uniqueChars(text) {
  return [...new Set([...text])].filter((c) => c.trim() !== '').sort().join('');
}

async function main() {
  const chars = uniqueChars(await collectDisplayText());
  const hash = createHash('sha256').update(chars).digest('hex').slice(0, 16);

  if (existsSync(FONT_FILE) && existsSync(STATE_FILE)) {
    const prev = JSON.parse(await readFile(STATE_FILE, 'utf8'));
    if (prev.hash === hash) {
      console.log(`[font] 文字集合に変化なし（${chars.length}字）。再取得をスキップ`);
      return;
    }
    console.log('[font] 文字集合が変わったので取り直す');
  }

  console.log(`[font] ${chars.length}字ぶんのサブセットを取得する`);

  // text= を付けると、その文字だけを含む単一ファイルが返る
  const cssUrl =
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(FONT_FAMILY)}:wght@400` +
    `&text=${encodeURIComponent(chars)}&display=swap`;

  const cssRes = await fetch(cssUrl, {
    headers: {
      // woff2 を返させるために最近のブラウザの UA を名乗る
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });
  if (!cssRes.ok) throw new Error(`CSSの取得に失敗: ${cssRes.status}`);
  const css = await cssRes.text();

  const fontUrl = css.match(/src:\s*url\((https:\/\/[^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error('CSSからフォントURLを取り出せなかった');

  const fontRes = await fetch(fontUrl);
  if (!fontRes.ok) throw new Error(`フォントの取得に失敗: ${fontRes.status}`);
  const buf = Buffer.from(await fontRes.arrayBuffer());

  await mkdir(FONT_DIR, { recursive: true });
  await writeFile(FONT_FILE, buf);
  await writeFile(
    STATE_FILE,
    JSON.stringify({ hash, charCount: chars.length, bytes: buf.length, chars }, null, 2) + '\n'
  );

  console.log(`[font] assets/fonts/display-subset.woff2 を書き出した（${buf.length.toLocaleString()} bytes）`);
}

main().catch((err) => {
  console.error('[font] 失敗:', err.message);
  process.exit(1);
});
