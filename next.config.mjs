/** @type {import('next').NextConfig} */

// デプロイ先は Cloudflare Pages のみ（GitHub はコード管理専用）。
// ルート配信なので basePath / assetPrefix は不要。
const nextConfig = {
  // Cloudflare Pages は静的配信なので static export にする
  output: 'export',

  // 静的エクスポートでは Next.js の画像最適化サーバーが動かないため無効化する。
  // 代わりに scripts/optimize-images.mjs がビルド前に WebP/AVIF を生成する。
  images: {
    unoptimized: true,
  },

  // /about のような URL を確実に引けるよう /about/index.html の形で出力する
  trailingSlash: true,

  reactStrictMode: true,
};

export default nextConfig;
