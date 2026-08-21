// ============================================================
// content/site.ts — サイトに載せる内容の一次情報
// ============================================================
// ここに書いてあるのは docs/ia.md のヒアリング結果に基づく事実のみ。
// 憶測で埋めた項目は無い。情報が無いものは「書かない」で統一している。
// 内容を変えたいときはこのファイルを直接編集する。

export const profile = {
  name: '碇 隼匠',
  handle: '1kqr1',
  // 英語のキャッチコピーは使わない（docs/design.md の禁止リスト対応）。
  // 実際にやってきたこと（紡シフト・インターン勤怠システム）から導いた一文。
  positioning:
    '紙やLINE、Excelで回っている現場の仕事を、Webアプリに置き換えています。',
  affiliation: '周南公立大学 情報科学部 情報科学科',
} as const;

/**
 * 実績。それぞれ /works/{slug} の個別ページを持つ。
 * 見出し（problemHeadline）は案件名ではなく「誰の・どんな課題だったか」の一文にする。
 *
 * detail が無い案件は、本人から詳細をヒアリングできていないもの。
 * 章立てを埋めるために内容を創作することはしない。
 */
export const works = [
  {
    slug: 'tsumugi-shift',
    title: '紡シフト',
    // 店名はバイト先への確認が取れるまで匿名。確認後にここを差し替える。
    subject: 'アルバイト先のコワーキングスペース',
    problemHeadline: '紙とLINEでやりとりしていたシフト管理を、スマホで完結させる',
    summary: '希望の提出から確定シフトの作成、給与計算までを一本化した。運用中。',
    stack: ['React', 'TypeScript', 'Hono', 'Cloudflare Workers', 'D1'],
    liveUrl: 'https://tsumugi-shift.s1kqr1s.workers.dev/request',
    screenshot: {
      key: '/images/tsumugi-shift',
      alt: '紡シフトの希望シフト提出画面。日付ごとに希望を入力できる一覧が表示されている。',
    },
    detail: {
      problem: {
        heading: 'シフトの希望も確定も、紙とLINEでやりとりしていた',
        body: 'アルバイト先のコワーキングスペースでは、スタッフのシフト希望の収集も、確定したシフトの共有も、紙とLINEで行われていた。',
      },
      approach: {
        heading: 'やったこと',
        body: 'スタッフがスマホから希望シフトを提出し、管理者がそれをもとに確定シフトを組む仕組みを作った。実働時間・交通費・総支給の給与計算まで自動化している。企画から開発、運用開始まで一人で担当した。',
      },
      decisions: [
        {
          heading: 'シフトの自動生成は、あえて作らなかった',
          body: '希望を入れれば自動で最適なシフトが出てくる仕組みも考えたが、実際の現場では個々人の勤務可能日の制約や、役割が重複してしまう問題があり、機械的に組むと成立しない。希望はスタッフが出し、最終的な組み合わせは管理者が判断して確定する形にした。',
        },
        {
          heading: '確定シフトをExcelで出力できるようにした',
          body: '確定したシフト表を印刷して上司に渡す必要があったため、画面上で完結させず、Excel形式で書き出せるようにした。',
        },
        {
          heading: 'データベースにCloudflare D1を選んだ',
          // 「無料だったから」以上の理由は本人から出ていないので、それ以上は書かない。
          body: '無料で使えることが理由で、他の選択肢との比較検討はしていない。データベースを使うこと自体が初めてだった。',
        },
      ],
      result: {
        heading: '結果',
        body: '最近このアプリが採用され、運用が始まったばかり。社員の方には好評だった。導入して日が浅いため、削減時間などの数値はまだ取れていない。',
      },
    },
  },
  {
    slug: 'intern-attendance',
    title: 'インターン向け勤怠・タスク管理システム',
    // 守秘のため金融機関の名称は出さない（本人の指示、継続）
    subject: '金融機関（名称非公開）',
    problemHeadline: 'インターン生の勤怠管理を、紙とExcelから移したかった',
    summary: '完成させたが、行内のセキュリティ要件を満たせず導入には至らなかった。',
    stack: ['React', 'TypeScript', 'Cloudflare Workers', 'D1'],
    liveUrl: null,
    screenshot: null,
    detail: {
      problem: {
        heading: '紙とExcelで回っていたインターン生の勤怠とタスク共有',
        body: '長期インターンとして通っていた金融機関で、インターン生の勤怠管理と社内タスクの共有が紙とExcelで行われていた。',
      },
      approach: {
        heading: 'やったこと',
        body: '紡シフトと同じ系統の仕組みで、勤怠管理とタスク掲示板をWebアプリ化した。企画から構築まで一人で担当した。',
      },
      decisions: [],
      result: {
        heading: '結果',
        // 「使われなかった」ことを隠さない。ここは事実をそのまま書く。
        body: '完成させたものの、行内のセキュリティ要件を満たせず、実際の導入には至らなかった。動くものを作れることと、それが組織に受け入れられることは別だと知る経験になった。',
      },
    },
  },
  {
    slug: 'dcc-portal',
    title: 'DCCポータル',
    subject: '約50人のコミュニティ「DCC」',
    problemHeadline: 'メンバーが自分のプロフィールを直せる場所がなかった',
    summary: 'DCC Login（OIDC）と連携し、本人が自分のページを更新できるようにした。',
    stack: ['TypeScript', 'Hono', 'Cloudflare Workers', 'D1', 'OIDC'],
    liveUrl: 'https://dcc-portal.s1kqr1s.workers.dev',
    screenshot: null,
    detail: {
      problem: {
        heading: '公開プロフィールの更新を、毎回運営が代行していた',
        body: '運営として関わっている約50人のコミュニティ「DCC」で、メンバーの公開プロフィールを本人が直接編集できる仕組みが無かった。',
      },
      approach: {
        heading: 'やったこと',
        body: 'DCC Login（OIDC）と連携し、ログインした本人が自分のページを更新できるシステムを作った。企画から構築まで一人で担当した。',
      },
      decisions: [],
      result: {
        heading: '結果',
        body: '使いやすいものにはできたと思うが、利用状況の定量的な測定はしていない。',
      },
    },
  },
] as const;

/**
 * その他の制作物（外部リンクのみの軽い一覧）。
 * 本人の選定により5件。ヌリミチは非掲載。
 * 説明は実際に稼働しているサイトを見て確認した範囲の事実のみ。
 */
export const sideProjects = [
  {
    name: 'DCC公式サイト',
    description: 'コミュニティ「DCC」の公式サイト',
    url: 'https://shu-dcc.net/',
  },
  {
    name: 'オービス情報マップ',
    description: '山口・長崎・大分のオービス設置情報を地図上で絞り込める',
    url: 'https://1kqr1.github.io/obisu-map/',
  },
  {
    name: '献立アプリ',
    description: '1週間分の夜の献立を自動で組む',
    url: 'https://menu-app-c6a.pages.dev',
  },
  {
    name: 'triNook',
    description: '友人同士で勉強時間を記録して共有する',
    url: 'https://study-timelapse.pages.dev',
  },
  {
    name: 'Focus Flight',
    description: '集中した時間をフライトのマイルに見立てて貯める',
    url: 'https://focus-flight.pages.dev',
  },
] as const;

export const about = {
  // 金融機関名は非公開。インターン勤怠システムと同一組織。
  internship: {
    role: '金融機関 DX部門 長期インターン',
    body: '行員向けにAI活用のレクチャーを行ったり、業務で使うツールの選定や提案資料の作成をしている。このインターンの中で、インターン生の勤怠管理システムも作った。',
  },
  education: profile.affiliation,
} as const;

export const contact = {
  formUrl:
    'https://docs.google.com/forms/d/e/1FAIpQLSd4tJ9c9D34yZ21-DZ8sFwO8BEBgdxSE9GKG5qRQChM3Rgh-g/viewform',
} as const;

export type Work = (typeof works)[number];
