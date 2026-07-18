// ============================================================
// data.js — プロジェクト・スキル・経歴・SNSデータ
// ============================================================
// ここを編集するだけで作品やスキルを追加・変更できます

const DATA = {
  // ----- プロフィール -----
  profile: {
    name: "1kqr1",
    tagline: "Creating Digital Experiences",
    bio: `AIを活用しながら、ユーザー体験を大切にしたWebアプリケーションを開発しています。
新しい技術やツールを積極的に取り入れ、効率的かつ高品質なプロダクトを生み出すことを目指しています。
常に学び続け、成長し続けるエンジニアでありたいと考えています。`,
    location: "Japan",
    email: "your.email@example.com",
  },

  // ----- SNSリンク -----
  socials: [
    {
      name: "GitHub",
      url: "https://github.com/yourusername",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`,
    },
    {
      name: "X (Twitter)",
      url: "https://x.com/yourusername",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16h-4.267z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>`,
    },
  ],

  // ----- プロジェクト -----
  // 新しいプロジェクトを追加するには、このリストにオブジェクトを追加するだけ！
  projects: [
    {
      id: "project-1",
      title: "プロジェクト名 1",
      description:
        "プロジェクトの説明文をここに書いてください。どんな課題を解決するのか、何が特徴なのかを簡潔に伝えましょう。",
      tags: ["HTML", "CSS", "JavaScript"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project1",
      image: null, // サムネイル画像パス（後で設定可能）
    },
    {
      id: "project-2",
      title: "プロジェクト名 2",
      description:
        "プロジェクトの説明文をここに書いてください。AIを活用した開発プロセスなど、ユニークな点をアピールしましょう。",
      tags: ["React", "Node.js", "Firebase"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project2",
      image: null,
    },
    {
      id: "project-3",
      title: "プロジェクト名 3",
      description:
        "プロジェクトの説明文をここに書いてください。技術的なチャレンジや学びについても触れると良いでしょう。",
      tags: ["Python", "API", "Docker"],
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/yourusername/project3",
      image: null,
    },
  ],

  // ----- スキル -----
  // カテゴリごとにスキルを整理
  skills: [
    {
      category: "Frontend",
      icon: "🎨",
      items: [
        { name: "HTML / CSS", level: 70 },
        { name: "JavaScript", level: 60 },
        { name: "React", level: 50 },
      ],
    },
    {
      category: "Backend",
      icon: "⚙️",
      items: [
        { name: "Node.js", level: 50 },
        { name: "Python", level: 50 },
        { name: "Firebase", level: 40 },
      ],
    },
    {
      category: "Tools & Others",
      icon: "🛠",
      items: [
        { name: "Git / GitHub", level: 60 },
        { name: "AI活用開発", level: 80 },
        { name: "Figma", level: 40 },
      ],
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
};
