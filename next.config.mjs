/** @type {import('next').NextConfig} */

// GitHub Pages は https://1kqr1.github.io/portfolio/ というサブパス配信、
// Cloudflare Pages は https://portfolio-8fu.pages.dev/ というルート配信で、
// 必要な basePath が食い違う。環境変数で切り替えて両方に対応する。
//   - GitHub Actions 側: NEXT_PUBLIC_BASE_PATH=/portfolio を設定してビルド
//   - Cloudflare Pages 側: 未設定のまま（= ルート配信）
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig = {
  // GitHub Pages / Cloudflare Pages はどちらも静的配信のため static export にする
  output: 'export',

  basePath,
  assetPrefix: basePath || undefined,

  // 静的エクスポートでは Next.js の画像最適化サーバーが動かないため無効化する。
  // 代わりに scripts/optimize-images.mjs がビルド前に WebP/AVIF を生成する。
  images: {
    unoptimized: true,
  },

  // 静的ホスティングで /about のような URL を確実に引けるよう、
  // /about/index.html の形で出力する
  trailingSlash: true,

  reactStrictMode: true,
};

export default nextConfig;
