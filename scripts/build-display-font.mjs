// ============================================================
// scripts/build-display-font.mjs
// ============================================================
// 見出し用の明朝体（Zen Old Mincho）を、実際にページで使う文字だけに絞って
// ダウンロードし、self-host 用に assets/fonts へ置く。
//
// なぜこうするか:
//   next/font で日本語サブセットを丸ごと取り込むと、@font-face が130個・
//   フォントファイルが約2.7MB・CSSが98KBまで膨らむことを実測で確認した。
//   見出しに使う文字は数十字しかないため、その字だけを含む1ファイルにする。
//
// 文字の集め方:
//   content/site.ts は全文をそのまま対象にする（データそのものなので
//   キー名で絞り込む必要が無い）。
//   app/**/*.tsx はコード中に直接書かれた見出し文言（「実績」「私について」等）
//   を拾うため、JSX のテキストノードと文字列リテラルを機械的に抜き出す。
//   多少ノイズ（コード上の記号等）が混ざっても実害は無い
//   （文字集合が少し増えるだけ）ので、厳密な構文解析はしない。
//
// 決定性のため、文字集合が前回と同じならネットワークアクセスをスキップする。
// content や見出し文言を編集して新しい文字が増えたときだけ取り直す。

import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const FONT_FAMILY = 'Zen Old Mincho';
// next/font/local に読ませるため public/ ではなく assets/ に置く
const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');
const FONT_FILE = path.join(FONT_DIR, 'display-subset.woff2');
const STATE_FILE = path.join(process.cwd(), 'content', 'display-font.json');

async function walkTsx(dir) {
  const found = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) found.push(...(await walkTsx(p)));
    else if (/\.tsx$/.test(p)) found.push(p);
  }
  return found;
}

async function collectDisplayText() {
  let text = '';

  // content/site.ts: 全文が対象（データファイルなので構文ノイズはほぼ無い）
  text += await readFile(path.join(process.cwd(), 'content', 'site.ts'), 'utf8');

  // app/**/*.tsx: JSXのテキストノードと文字列リテラルを機械的に抜き出す
  const tsxFiles = await walkTsx(path.join(process.cwd(), 'app'));
  for (const f of tsxFiles) {
    const src = await readFile(f, 'utf8');
    // JSXのテキストノード（>...< の間）
    for (const m of src.matchAll(/>([^<>{}\n][^<>{}]*)</g)) text += m[1];
    // 文字列リテラル（'...' "..." `...`）
    for (const m of src.matchAll(/'([^'\\]*)'|"([^"\\]*)"|`([^`\\]*)`/g)) {
      text += m[1] || m[2] || m[3] || '';
    }
  }

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
