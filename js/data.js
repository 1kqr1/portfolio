// ============================================================
// data.js — プロジェクト・スキル・経歴・SNSデータ
// ============================================================
// ここを編集するだけで作品やスキルを追加・変更できます

const DATA = {
  // ----- プロフィール -----
  profile: {
    name: "1kqr1",
    realName: "碇 隼匠",
    affiliation: "周南公立大学 情報科学部 情報科学科",
    tagline: "Creating Digital Experiences",
    bio: `AIを活用しながら、ユーザー体験を大切にしたWebアプリケーションを開発しています。
新しい技術やツールを積極的に取り入れ、効率的かつ高品質なプロダクトを生み出すことを目指しています。
常に学び続け、成長し続けるエンジニアでありたいと考えています。`,
    location: "Japan",
  },

  // ----- SNSリンク -----
  // url が空のものは自動的に非表示になります（サイトには出ません）。
  // アカウントができたら url に貼るだけで表示されます。
  socials: [
    {
      name: "GitHub",
      url: "",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
    },
    {
      name: "X (Twitter)",
      url: "",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>`,
    },
  ],

  // ----- プロジェクト -----
  // 新しいプロジェクトを追加するには、このリストにオブジェクトを追加するだけ！
  projects: [
    {
      id: "project-tsumugi",
      title: "紡シフト",
      description:
        "飲食店向けのシフト管理Webアプリ。スタッフはスマホから希望シフトを提出し、管理者が確定シフトを作成。実働時間・交通費・総支給の給与計算まで自動化しました。以前のGoogleフォーム＋スプレッドシート運用を置き換えるために制作し、実際に運用しています。",
      tags: ["React", "TypeScript", "Hono", "Cloudflare Workers", "D1"],
      liveUrl: "https://tsumugi-shift.s1kqr1s.workers.dev/request",
      githubUrl: "",
      image: "images/tsumugi-shift.png", // 提供スクショ（希望提出画面）を使用
      imageFit: "contain", // 縦長スクショなので全体が見えるように
      preview: false, // 画像が無い間もログイン画面を自動表示しない
    },
    {
      id: "project-dcc",
      title: "DCC コミュニティHP",
      description: "DCCというコミュニティの公式ホームページを作成しました。",
      tags: ["Webサイト", "コミュニティ"],
      liveUrl: "https://shu-dcc.net/",
      githubUrl: "",
      image: null, // 公開サイトなので liveUrl から自動プレビュー表示
    },
    // ▼ 実物ができたら、この形式でコピーして増やせます
    // {
    //   id: "project-xxx",
    //   title: "作品名",
    //   description: "どんな作品か / 解決した課題 / 特徴を簡潔に",
    //   tags: ["React", "TypeScript"],
    //   liveUrl: "https://...",
    //   githubUrl: "https://github.com/...",
    //   image: null,        // "images/xxx.png" を入れれば手動サムネ。null なら liveUrl から自動プレビュー
    //   preview: true,      // false にすると自動プレビューを止める（ログインが要るサイト向け）
    // },
  ],

  // ----- スキル -----
  // カテゴリごとにスキルを整理
  // スキルは技術名を並べるだけ（習熟度％は使わない方針）
  skills: [
    {
      category: "Frontend",
      icon: "🎨",
      items: ["HTML / CSS", "JavaScript", "TypeScript", "React"],
    },
    {
      category: "Backend",
      icon: "⚙️",
      items: ["Node.js", "Python", "Hono", "Cloudflare Workers / D1", "Firebase"],
    },
    {
      category: "Tools & Others",
      icon: "🛠",
      items: ["Git / GitHub", "Figma", "AI活用開発"],
    },
  ],

  // ----- 経歴 -----
  experience: [
    {
      year: "2024",
      title: "プログラミング学習開始",
      description: "独学でWeb開発の基礎を学び始める。HTML/CSS/JavaScriptを中心に学習。",
      type: "education", // education | work | project
    },
    {
      year: "2025",
      title: "AIを活用した開発を開始",
      description: "AIツールを活用した効率的な開発手法を身につけ、個人プロジェクトを複数立ち上げる。",
      type: "project",
    },
    {
      year: "2026",
      title: "ポートフォリオサイト公開",
      description: "これまでの作品をまとめたポートフォリオサイトを公開。就職活動を本格的に開始。",
      type: "project",
    },
  ],

  // ----- 日記 (ブログ) -----
  diary: [
    {
      id: "diary-1",
      title: "ポートフォリオサイトを公開しました！",
      date: "2026-08-08",
      content: "ついにポートフォリオサイトが完成し、公開することができました。\n\nこだわったポイントは以下の通りです：\n- ダークテーマをベースにしたスタイリッシュなUI\n- 管理画面からのシームレスなデータ更新\n- カスタムカーソルやグリッチエフェクトによる遊び心\n\nこれからはここで日記や技術メモも更新していこうと思います！"
    }
  ],

  // ----- 設定 -----
  settings: {
    siteUrl: "",  // 例: https://portfolio.com/
    ogpImage: "", // 例: https://portfolio.com/images/ogp.png
  },
};

// ============================================================
// Node環境（プレビュー等）用エクスポート
if (typeof module !== "undefined" && module.exports) {
  module.exports = DATA;
}
