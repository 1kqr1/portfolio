// ============================================================
// scripts/optimize-images.mjs
// ============================================================
// 静的エクスポートでは next/image の最適化サーバーが動かないため、
// ビルド前にここで WebP / AVIF を生成しておく。
// 生成物の実寸は content/image-manifest.json に書き出し、
// <img> の width / height に使って CLS を防ぐ。

import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = path.join(process.cwd(), 'assets', 'images');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images');
const MANIFEST = path.join(process.cwd(), 'content', 'image-manifest.json');

// 表示上必要な最大幅。シグネチャ要素でも実表示は 800px 程度なので、
// Retina 分を見込んで 2 倍の 1600px を上限にする。
const MAX_WIDTH = 1600;

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.log(`[images] ${SOURCE_DIR} が無いのでスキップ`);
    await writeFile(MANIFEST, JSON.stringify({}, null, 2));
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR)).filter((f) =>
    /\.(png|jpe?g)$/i.test(f)
  );

  const manifest = {};

  for (const file of files) {
    const inputPath = path.join(SOURCE_DIR, file);
    const base = file.replace(/\.(png|jpe?g)$/i, '');

    const image = sharp(inputPath);
    const meta = await image.metadata();

    // 大きすぎる場合だけ縮小する（拡大はしない）
    const targetWidth = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);
    const resized = image.resize({ width: targetWidth, withoutEnlargement: true });

    const webpPath = path.join(OUTPUT_DIR, `${base}.webp`);
    const avifPath = path.join(OUTPUT_DIR, `${base}.avif`);

    await resized.clone().webp({ quality: 82 }).toFile(webpPath);
    await resized.clone().avif({ quality: 62 }).toFile(avifPath);

    // 出力後の実寸を読み直して記録する（推測値を書かない）
    const outMeta = await sharp(webpPath).metadata();
    manifest[`/images/${base}`] = {
      webp: `/images/${base}.webp`,
      avif: `/images/${base}.avif`,
      width: outMeta.width,
      height: outMeta.height,
    };

    console.log(
      `[images] ${file} -> ${base}.webp / ${base}.avif (${outMeta.width}x${outMeta.height})`
    );
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`[images] マニフェストを書き出した: ${MANIFEST}`);
}

main().catch((err) => {
  console.error('[images] 失敗:', err);
  process.exit(1);
});
