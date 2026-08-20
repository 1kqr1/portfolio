# フェーズ1: 現状調査

調査日: 2026-08-20
対象: `1kqr1/portfolio` リポジトリ（ブランチ `redesign/portfolio-v2`、`main` から分岐）
方針: 事実と推測を分けて記載する。推測には必ず「推測」と明記する。

---

## 0. 最重要の前提確認 — Next.js / React ではありません

依頼文には「Next.js / React 製、GitHub Pages で公開している」とありましたが、**実際にリポジトリを確認したところ、Next.js でも React でもありません。** 素の HTML / CSS / vanilla JavaScript です。

### 根拠

```
$ find . -not -path './.git/*' -iname "package.json" -o -iname "next.config*"
（該当なし）

$ find . -not -path './.git/*' \( -iname "*.jsx" -o -iname "*.tsx" -o -name "src" -o -name "app" -o -name "pages" \)
（該当なし）
```

リポジトリ直下の実体:

```
admin.html          管理画面（データ編集用の内部ツール）
admin.css / css/style.css
index.html           公開ページ本体
js/data.js            全コンテンツ（プロジェクト・経歴・スキル等）を保持する素のオブジェクト
js/app.js             DOM描画・イベント処理
js/animations.js      スクロール連動演出・チルト演出
js/storage.js         管理画面の下書き保存（localStorage）
js/admin.js           管理画面ロジック
```

`package.json` はおろか `node_modules` も無く、ビルドステップそのものが存在しません。`index.html` が `<script src="js/xxx.js">` を直接読み込むだけの構成です。

### デプロイの実態（GitHub Pages / Cloudflare Pages 両方に出ている）

- **GitHub Pages**: `build_type: "legacy"`（GitHub Actions ではなく、`main` ブランチのルートを直接静的配信）。公開URL: `https://1kqr1.github.io/portfolio/`
- **Cloudflare Pages**: プロジェクト名 `portfolio`、Git 連携あり、`portfolio-8fu.pages.dev` で公開中。ビルドコマンド等の詳細は今回未確認（後述）。

つまり「`output: 'export'` で static export」という前提そのものが存在せず、確認するまでもなく**最初から100%静的ファイル**です。

### この食い違いが意味すること

これは重大な分岐点なので、**フェーズ1の段階で止めて報告します**（本来のルール通り）。考えられる可能性は以下の3つで、どれなのか私には判断できません（推測で進めません）:

1. 依頼文のテンプレートが別プロジェクト用で、コピペミスだった
2. 実は "Next.js化してゼロから作り直したい" という話で、現状の素のHTML/CSS/JSはあくまで叩き台（＝デザイン刷新だけでなく**フレームワーク移行**も含む、想定より大きいスコープ）
3. 別の場所に Next.js 版のリポジトリが存在する（GitHub上の他リポジトリを確認した限りでは見当たりませんでした — `obisu-map`, `DCC-official-site`, `dcc-portfolio`, `tsumugi-shift`, `gomi-tennis` はいずれも別用途で、Next.jsのportfolioという名前のリポジトリは他にありません）

→ **フェーズ2に進む前に、この前提だけ先に確認させてください。**（質問はこの後まとめて記載します）

以下、フェーズ1の残りの調査項目は、依頼された「Next.js前提」の質問（App Router か Pages Routerか、`next.config`、`'use client'`境界）は**該当なし**として扱い、それ以外の実質的な調査（カクつきの原因・サイズ・コンテンツ棚卸し）は現状のスタックに即して実施しました。

---

## 1. 構成の把握

| 項目 | 結果 |
|---|---|
| Router (App/Pages) | 該当なし（Next.js ではない） |
| `next.config` | 存在しない |
| 依存パッケージ | **ゼロ**。`package.json` 自体が無い。唯一の外部依存は Google Fonts（`fonts.googleapis.com` から Inter / Outfit を CDN 読み込み） |
| `'use client'` | 該当なし |
| ビルドツール | 無し（そのままデプロイされる素のファイル） |

---

## 2. カクつきの原因特定（ファイル:行）

**注記**: `.project-card` の枚数を前回のセッション中に2枚→10枚に増やした際、体感の重さが悪化したという経緯があり、その場で気づいた範囲（`.project-card` の `backdrop-filter` 撤去、tilt/spotlight/カスタムカーソルの `requestAnimationFrame` 化）は**すでに対処済み**です。今回はコード全体を対象に、それ以外も含めて再監査しました。

### 該当あり

| # | パターン | 該当箇所 | 状態 |
|---|---|---|---|
| 1 | `scroll` イベントリスナー内でDOM書き換え | [js/app.js:183](js/app.js#L183) `window.addEventListener("scroll", ...)` — `navbar.classList.toggle("scrolled", ...)` | **未対応**。`classList.toggle` なので直接 inline style を書くよりは軽いが、フェーズ4のルール（scrollリスナー禁止・IntersectionObserver/scroll-driven animation化）には抵触する |
| 2 | `mousemove` リスナー内でDOM書き換え | [js/animations.js:92-116](js/animations.js#L92)（チルト効果）、[js/app.js:240-249](js/app.js#L240)（スポットライト）、[js/app.js:213-228](js/app.js#L213)（カスタムカーソル） | **前回セッションで対処済み**: 3箇所とも `requestAnimationFrame` で1フレーム1回に間引き済み。カーソルは `top/left` 直書きから `transform: translate3d` に変更済み |
| 3 | `width` をアニメーションさせている | [css/style.css:993](css/style.css#L993) `.skill-progress-fill { transition: width 1.2s ... }` | **該当**。ただし依頼文の方針（スキルを%表示しない・スキル単独セクション廃止）に従うなら、この要素自体がフェーズ2/3でIA変更により丸ごと無くなる可能性が高い。ピンポイントで直すより設計変更で解消するのが筋が良さそう |
| 4 | 広い面積への `backdrop-filter` | [css/style.css:690-691](css/style.css#L690)（`.project-card`） | **前回セッションで対処済み**（除去済み）。残っている `backdrop-filter` は以下の通りいずれも小面積 or 常時表示ではないもの:<br>・[css/style.css:153-154](css/style.css#L153) navbarの`::before`（細い帯）<br>・[css/style.css:1225-1226](css/style.css#L1225) footer（細い帯）<br>・[css/style.css:1313-1314](css/style.css#L1313) モバイルメニュー展開時のみ（オーバーレイ全面だが開いている間だけ）<br>・[css/style.css:1711-1712](css/style.css#L1711) 日記モーダル表示時のみ |
| 5 | 常時ループするアニメーション | [css/style.css:474](css/style.css#L474) `.hero-orb { animation: float 8s infinite }`<br>[css/style.css:511](css/style.css#L511) `.scroll-line { animation: scroll-bounce 2s infinite }`<br>[css/style.css:1063](css/style.css#L1063) `.timeline-dot::after { animation: timeline-pulse 2s infinite }`（`:first-child`のみ・1個だけ）<br>[css/style.css:1498,1504](css/style.css#L1498) `.glitch::before/::after { animation: glitch-anim-* infinite }`<br>[css/style.css:1540](css/style.css#L1540) `.marquee-track { animation: marquee 20s infinite }` | ホームページがアクティブな間だけ常時ループ（`.page:not(.active){display:none}`で非アクティブ時は止まる、を確認済み）。**プロパティ自体は `float`/`scroll-bounce`/`timeline-pulse`/`marquee` は `transform`+`opacity` のみで実装されており、フェーズ4のモーション予算には適合**。唯一 `glitch-anim-1/2` だけが `clip-path` をアニメーションさせており、これは `transform`/`opacity` ではないため要検討 |
| 6 | `background`（グラデーション位置）をマウス追従でアニメーション | [css/style.css:1470-1476](css/style.css#L1470) `.project-card::before { background: radial-gradient(circle 250px at var(--mouse-x) var(--mouse-y), ...) }` | 依頼リストの項目には無いが、フェーズ4のルール「アニメーションさせていいプロパティはtransformとopacityのみ」に照らすと**抵触**。JS側はRAF間引き済みだが、`background`の再計算自体はコンポジタだけでは完結しない（ペイントが走る）。カード10枚それぞれに`::before`があるため、マウスが乗った1枚だけとはいえ検討対象 |

### 該当なし（確認した上で無し）

- `top`/`left`/`margin` をアニメーションさせている箇所：無し（`width`の1件を除く）
- 大きな `box-shadow` を持つ要素の大量描画：`.project-card:hover` 等にはあるが、常時ではなくホバー時に1枚だけに適用されるため「大量描画」には該当しない
- 巨大な画像への `transform`（パララックス等）：無し。`.hero-orb` はCSSグラデーション円で画像ではない
- 同一フレーム内でのレイアウトの読み書き交互発生（複数要素にまたがるスラッシング）：無し。各mousemoveハンドラは自要素の`getBoundingClientRect()`を読んで自要素に書くのみで、他要素を巻き込むパターンは見当たらない
- `resize` イベントリスナー：コード中に1件も無し

### admin.html / admin.js について

管理画面（自分専用のデータ編集ツール）は採用担当や取引先が見るページではないため、今回の「カクつき」調査のスコープからは外しました。念のため軽くgrepした限り、`scroll`/`mousemove`/`resize`リスナーは無し。

---

## 3. サイズの把握

`next build` は実行できない（Next.jsではないため）ので、代わりに実ファイルサイズを直接計測しました。

### 公開ページ（index.html）が読み込むファイル（未圧縮の生サイズ）

| ファイル | サイズ |
|---|---|
| index.html | 10,014 B |
| css/style.css | 36,616 B |
| js/data.js | 10,775 B |
| js/storage.js | 2,243 B |
| js/animations.js | 6,300 B（前回の修正で微増） |
| js/app.js | 19,242 B（前回の修正で微増） |
| **JS合計** | **約38.5 KB**（未minify・未バンドル。ビルドステップが無いため圧縮・tree-shakingは一切かかっていない） |

GitHub Pages / Cloudflare Pages 側で配信時にgzip/brotli圧縮はかかる想定（推測 — 両ホスティングとも自動圧縮が標準だが、このリポジトリ向けの実測はしていません）。

### 画像（`images/`配下）

| ファイル | サイズ | 寸法 | 形式 |
|---|---|---|---|
| tsumugi-shift.png | 168,297 B (164KB) | 1420×1866px | PNG（無圧縮・リサイズ無し） |

- これが唯一の「手動配置」画像。等倍スクリーンショットをそのままPNGで置いているため、表示サイズ（カード内、実質数百px幅）に対して大幅にオーバースペック。WebP/AVIF変換もリサイズも無し。
- **その他9件のプロジェクトカードは自前の画像を持たず、`thum.io`（無料の外部スクリーンショットAPI）にリアルタイムでスクリーンショット生成をリクエストして表示している**（`js/app.js` 355行目付近、`image.thum.io/get/width/1024/crop/640/{liveUrl}`）。これは今回の調査で見つけた、依頼文のチェックリストには無かった重要な論点:
  - 表示のたびに外部ネットワークリクエストが発生する（自分でコントロールできない）
  - フォーマット・圧縮を自分で最適化できない（WebP/AVIF化の対象にできない）
  - 無料枠のレート制限に前回のセッション中に実際に引っかかった（403エラー多発を確認済み）
  - フェーズ4の「サードパーティのスクリプト・埋め込みは原則入れない」方針とも本質的に矛盾する

### フォント

- 読み込みは Google Fonts CDN（`fonts.googleapis.com`）経由で **Inter**（300/400/500/600）と **Outfit**（400/500/600/700/800）の2書体、計9ウェイト。`font-display: swap` 設定あり。
- **日本語ウェブフォントは一切読み込んでいない。** `--font-heading: "Outfit", sans-serif` / `--font-body: "Inter", sans-serif` はどちらも欧文専用書体で、日本語グリフはOS標準フォント（Mac: Hiragino Sans、Windows: Yu Gothic/Meiryoなど）にフォールバックしている。
- → 依頼文にあった「日本語フォントはファイルが重いのでサブセット化しろ」という懸念は、**現状には当てはまりません**（そもそも日本語カスタムフォントを使っていないため）。フェーズ3で日本語ウェブフォントを新規採用するかどうかを判断する際は、ここが実測ゼロからのスタートになります、という事実だけ記録しておきます。

---

## 4. 既存コンテンツの棚卸し（`js/data.js` から全量抽出）

### プロフィール
- 表示名: `1kqr1`（本名: 碇 隼匠）
- 所属: 周南公立大学 情報科学部 情報科学科
- タグライン: "Creating Digital Experiences"
- 自己紹介文（3文、日本語）:
  > AIを活用しながら、ユーザー体験を大切にしたWebアプリケーションを開発しています。新しい技術やツールを積極的に取り入れ、効率的かつ高品質なプロダクトを生み出すことを目指しています。常に学び続け、成長し続けるエンジニアでありたいと考えています。
- 所在地: Japan

### SNSリンク
- GitHub: URL未設定（空）
- X (Twitter): URL未設定（空）
- → 両方とも `url: ""` のため現状サイト上には**何も表示されていない**（データ側の仕様でURLが空だと自動非表示）

### プロジェクト（10件、現状の掲載順）

| # | タイトル | ライブURL | GitHub | 備考 |
|---|---|---|---|---|
| 1 | 紡シフト | tsumugi-shift.s1kqr1s.workers.dev | 無し（非公開） | 唯一、手動スクショ画像あり |
| 2 | DCC コミュニティHP | shu-dcc.net | 無し | 説明文1行のみ、極めて短い |
| 3 | オービス情報マップ | 1kqr1.github.io/obisu-map | あり（公開） | |
| 4 | DCCポータル | dcc-portal.s1kqr1s.workers.dev | 無し（非公開リポジトリのため） | |
| 5 | 献立アプリ | menu-app-c6a.pages.dev | 無し | |
| 6 | triNook | study-timelapse.pages.dev | 無し | |
| 7 | Focus Flight | focus-flight.pages.dev | 無し | |
| 8 | ヌリミチ | nurimichi.s1kqr1s.workers.dev | 無し | |
| 9 | 共同生活費レシート管理 | roomshare-receipts.s1kqr1s.workers.dev | 無し | |
| 10 | インターン向け勤怠・タスク管理システム | 無し（意図的に非公開） | 無し | 実在の金融機関名を伏せて掲載中 |

**全件共通の注意点**: 各説明文は「誰の・どんな課題を・どう解決したか」を狙って書いてありますが、**すべて私（Claude）が前回セッションでウェブ上の公開情報（アプリの表示内容・タイトル・metaタグ）から書き起こしたものです**。担当範囲・チーム構成・数値成果・技術選定の理由などはヒアリングしておらず、**フェーズ2で改めて本人から聞き取りが必須**です。

### スキル（3カテゴリ、%表示なし・タグ列挙のみ）
- Frontend: HTML/CSS, JavaScript, TypeScript, React
- Backend: Node.js, Python, Hono, Cloudflare Workers/D1, Firebase
- Tools & Others: Git/GitHub, Figma, AI活用開発

→ 依頼文の「スキル一覧を独立セクションとして立てるのをやめる」方針に従うなら、このセクション自体を解体して各プロジェクトの説明に埋め込む形になります。

### 経歴（3件、いずれも1文の粒度）
- 2024: プログラミング学習開始（独学、HTML/CSS/JS中心）
- 2025: AIを活用した開発を開始
- 2026: ポートフォリオサイト公開・就職活動開始

→ この3行だけでは職務経歴として薄く、フェーズ2のヒアリングで具体化が必要（学校名は分かっているが、インターン等の具体的な期間・組織名はデータ上に存在しない）。

### 日記（1件）
- 「ポートフォリオサイトを公開しました！」（2026-08-08付、サイト公開の振り返り）

---

## まとめ：フェーズ2に進む前に確認したいこと

1. **【最重要】スタックの前提について**: このリポジトリ（素のHTML/CSS/JS、GitHub Pages + Cloudflare Pages両方で公開中）を対象に、①デザイン・情報設計だけ作り直す（Next.js化はしない）／②Next.jsへの移行も含めてゼロから作り直す／③実は別のリポジトリの話だった、のどれでしょうか？
2. Cloudflare Pages側のビルド設定（ビルドコマンド・出力ディレクトリ）は今回未確認です（作業中にCloudflareの認証トークンが期限切れになり、再認証できませんでした）。GitHub Pagesを正とし、Cloudflare Pagesはミラーとして扱う認識で合っていますか？
3. 9件のプロジェクトで使っている `thum.io` の自動スクリーンショットについて、今後も使い続けますか、それとも全件手動スクショに切り替えますか（後者の場合、10枚分のスクショ素材が別途必要になります）。

この報告への回答をいただき次第、フェーズ2（情報設計のヒアリング）に進みます。
