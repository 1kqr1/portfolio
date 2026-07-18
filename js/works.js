/* ============================================================
   作品データ
   ------------------------------------------------------------
   ▼ 新しい作品を追加するには、下の works 配列に { ... } を
     ひとつ足すだけです。上にあるものほど先に表示されます。

   各項目の意味：
     title        … 作品名（必須）
     category     … "webapp" / "game" / "other" のどれか（絞り込みに使う）
     description  … ひとこと説明（必須）
     tags         … 使った技術など。いくつでもOK ["React", ...]
     year         … 制作年（任意）
     emoji        … サムネイル画像がないときに表示する絵文字
     accent       … サムネイルの色（"#4f46e5" のような色コード）
     image        … スクリーンショットのパス。用意できたら "images/xxx.png"
     links        … ボタン。 { label: "表示名", url: "リンク先" } を並べる
                     例: { label: "デモ", url: "https://..." }
                         { label: "GitHub", url: "https://github.com/..." }
   ============================================================ */

const CATEGORIES = [
  { id: "all",    label: "すべて" },
  { id: "webapp", label: "Web App" },
  { id: "game",   label: "ゲーム" },
  { id: "other",  label: "その他" },
];

const WORKS = [
  {
    title: "紡シフト",
    category: "webapp",
    description:
      "飲食店のシフト管理Webアプリ。スタッフはスマホから希望を提出し、管理者が確定シフトを作成。実働時間・交通費・総支給の給与計算まで自動化しました。以前のGoogleフォーム＋スプレッドシート運用を置き換えるために制作。",
    tags: ["React", "TypeScript", "Hono", "Cloudflare Workers", "D1", "PWA"],
    year: "2025",
    emoji: "🗓️",
    accent: "#4f46e5",
    image: "",
    links: [
      // 公開URLやGitHubができたら、下の "#" を差し替えてください
      { label: "詳細", url: "#" },
    ],
  },

  // ▼▼▼ ここに新しい作品を追加していけます（コピーして中身を書き換え）▼▼▼
  // {
  //   title: "作品名",
  //   category: "game",
  //   description: "どんな作品かをひとことで。",
  //   tags: ["使った技術"],
  //   year: "2026",
  //   emoji: "🎮",
  //   accent: "#f97316",
  //   image: "",
  //   links: [{ label: "遊ぶ", url: "https://..." }],
  // },
];
