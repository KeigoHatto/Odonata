# Odonata Web Design & Development Guidelines

| 項目 | 内容 |
| --- | --- |
| **Version** | 1.0 |
| **Last Updated** | 2026-08-25 |
| **Scope** | `getodonata.com`（コーポレートサイト）全ページ。将来の英語版 `/en/` を含む |
| **Owner** | Odonata（オドナータ） |
| **Status** | Active — 以後のすべてのWeb改修において、着手前に必ず参照する |
| **適用対象外** | `app.getodonata.com`（プロダクト本体）、`kessan.html`（決算公告・noindex） |

---

## 目次

1. [Purpose](#1-purpose)
2. [Brand Principles](#2-brand-principles)
3. [Information Architecture](#3-information-architecture)
4. [Layout & Grid](#4-layout--grid)
5. [Typography](#5-typography)
6. [Color System](#6-color-system)
7. [Components](#7-components)
8. [Accessibility](#8-accessibility)
9. [Responsive Design](#9-responsive-design)
10. [Images & Visuals](#10-images--visuals)
11. [Animation & Interaction](#11-animation--interaction)
12. [Performance](#12-performance)
13. [SEO](#13-seo)
14. [Internationalization / 多言語サイト](#14-internationalization--多言語サイト)
15. [English Content Rules](#15-english-content-rules)
16. [Content Guidelines](#16-content-guidelines)
17. [Coding Standards](#17-coding-standards)
18. [Rules for Claude Code / AI](#18-rules-for-claude-code--ai)
19. [Do Not](#19-do-not)
20. [QA Checklist](#20-qa-checklist)
21. [Current Site Audit](#21-current-site-audit)
22. [References](#22-references)

---

## ルールレベルの定義

本書のすべてのルールは、以下の3段階のいずれかに分類される。

| レベル | 意味 |
| --- | --- |
| **MUST** | 必ず守る。例外を認めない。違反した実装はマージしない |
| **SHOULD** | 原則守る。合理的な理由がある場合のみ例外を認め、その理由を `docs/refactor-notes.md` に記録する |
| **MAY** | 状況に応じて採用してよい。採用しないことも正当 |

**アクセシビリティ／SEOの基本構造／多言語URL／hreflang／semantic HTML／レスポンシブ／セキュリティ**に関わるルールは原則 MUST とする。

---

# 1. Purpose

## 1-1. このドキュメントの目的

本書は、Odonata コーポレートサイトの**デザイン・開発・改修・多言語化における唯一のマスタールール**である。人間の開発者・デザイナーが参照する設計資料であると同時に、**Claude Code 等のAIがサイトを編集する際に、作業開始前に必ず読み込む実装規範**として機能する。

Odonata のサイトは、サッカーの現場に散らばるデータをつなぎ、分析し、意思決定に届けるという事業そのものを体現する必要がある。**サイトの一貫性・正確性・誠実さは、プロダクトの信頼性の一部である。**

## 1-2. 適用範囲

| 対象 | 適用 |
| --- | --- |
| `getodonata.com` の全HTML／CSS／JS／画像 | **適用する** |
| `partials/`、`tools/`、`docs/` | **適用する** |
| 将来追加する `/en/` 配下 | **適用する** |
| `app.getodonata.com`（プロダクト本体） | 適用外（別途プロダクト側の規約に従う） |
| `kessan.html`（決算公告） | 法定表記が優先。デザイン規則は適用外 |

## 1-3. 判断の優先順位

判断に迷った場合、以下の順に優先する。上位のものが下位を上書きする。

1. **Odonata のブランドコンセプト・事業戦略・提供価値**
2. **本ガイドライン、および現行実装から読み取れる Odonata のデザインシステム**（`assets/site.css` の `:root`、`docs/design-tokens.md`）
3. デジタル庁「ウェブサイトガイドライン」
4. デジタル庁「デザインシステム（DADS）」— **原則のみを参照する。見た目は模倣しない**
5. W3C WCAG 2.2（**AA を基本目標とする**）
6. Google Search Essentials
7. Google SEO スターターガイド
8. Google Core Web Vitals / web.dev
9. WHATWG HTML Living Standard
10. その他のWeb標準・ベストプラクティス

**デジタル庁の資料から参照するのは、情報設計・アクセシビリティ・UI原則・一貫性・コンポーネント設計・レスポンシブ設計・利用者中心設計といった「原則」に限る。** ブランドカラー、タイポグラフィ、写真表現、ビジュアル、UIの見た目、トーン、世界観は Odonata 独自のものを維持する。

## 1-4. 例外時の判断方法

- 本書のルールと実装上の制約が衝突した場合、**MUST は例外を認めない。** 実装方法のほうを変える。
- SHOULD に例外を設ける場合、`docs/refactor-notes.md` に「どのルールを、なぜ、どの範囲で外したか」を記録する。
- 本書に記載のない事項が生じた場合、**§1-3 の優先順位に従って判断し、判断内容を本書に追記する。** 判断を暗黙知にしない。
- 本書自体の変更は、冒頭の Version と Last Updated を更新したうえで行う。

---

# 2. Brand Principles

## 2-1. Odonata とは何か（Webサイトが伝えるべきこと）

> **Odonata は、サッカーチームのデータを統合・分析し、現場の意思決定につなげる会社である。独自のデータ分析と、その分析を現場で継続的に使えるデータプラットフォームの両方を提供している。**

この一文を、初見のユーザーが**ファーストビューから第2スクリーンまで**で理解できる状態を、すべてのページ設計の基準とする。

## 2-2. 与えるべき印象

| 印象 | Webサイト上での現れ方 |
| --- | --- |
| **Scientific**（科学的） | 数値には必ず条件・対象・期間・指標名を併記する。断定を避け、限界を書く |
| **Intelligent**（知的） | 情報量ではなく構造で伝える。1セクション1メッセージ |
| **Professional**（誠実・堅実） | 誇張しない。未確定のものを確定として書かない |
| **Modern**（現代的） | 余白を十分にとる。装飾より構造。プロダクト画面を主役にする |
| **Sports / Football**（サッカー現場） | ストック写真ではなく、画面内の語彙（デュエル勝率・ハムストリング・スプリント）で表す |
| **Complex systems / Network**（関係性） | 点と線がつながるモチーフ。ノードの大きさと線の強弱に差をつける |
| **Data-driven**（データ駆動） | 主張には出典を付ける。図とプロダクト画面で語る |

## 2-3. 避けるべき印象

| 避けるもの | 理由 |
| --- | --- |
| **難解な研究機関のサイト** | 学術用語から始まると、購買判断に必要な情報に到達する前に離脱する |
| **汎用的な SaaS ランディングページ** | 抽象的な価値訴求とストックフォトの組み合わせは、どの業種にも当てはまり差別化にならない |
| **スポーツメディア** | ゴールシーン・歓喜シーンの写真、煽り文句は BtoB の意思決定者の信頼を下げる |
| **古い業務システムのサイト** | 情報密度が高すぎる表、小さい文字、詰まった余白 |
| **AI万能論** | 「AIですべて分かる」「怪我を防げる」等の断定は、科学的誠実さと矛盾する |

## 2-4. ブランド上の絶対規則

- **MUST**：ブランドカラー（`--color-primary` `--color-navy` `--color-accent` 等）を、本書の改訂なしに変更しない。
- **MUST**：フォントファミリー（Manrope / Zen Kaku Gothic New）を、本書の改訂なしに追加・変更しない。
- **MUST**：数値を示すときは、対象・期間・指標名・限界を同じ視界に入る位置に併記する（→ §16-3）。
- **MUST**：法人名の表記は「**Odonata**」または「**Odonata（オドナータ）**」とする。未登記の状態で名称中に「株式会社」を含めない（会社法7条）。
- **SHOULD**：Philosophy「複雑な世界を、複眼で読む。」は理念として `philosophy.html` と `company.html` に置き、TOPのファーストビューには置かない。
- **記録（2026-08-31）**：現行ファビコンは 16px では複眼の内部構造が潰れて三日月状に見える（32px で円形、48px で複眼らしさが出る）。旧ファビコン（薄水色のトンボ・透過背景）は白いタブバーでほぼ見えなかったため明確な改善だが、将来 16/32px 専用に「複眼の六角形だけを3〜4個」まで簡略化したマークを別途作る余地がある。

---

# 3. Information Architecture

## 3-1. 情報を見せる順番（サイト全体の原則）

**MUST**：ページ設計は以下の順序を基準とする。

```
① 何を実現する会社なのか
② 具体的に何ができるのか
③ 実際に何を提供しているのか
④ 実績・成果
⑤ なぜそれができるのか
⑥ 思想・複雑系アプローチ
```

**思想（複雑系）を「できること」より先に置いてはならない。** 手段の説明が提供価値より先に来ると、初見ユーザーは業種を判別できない。

## 3-2. ページ階層

| 階層 | ページ | 役割 |
| --- | --- | --- |
| L1 | `/`（index.html） | 会社のカテゴリ宣言と、全体像の提示 |
| L2 | `service-analysis.html` | データ分析・伴走支援の詳細 |
| L2 | `service-platform.html` | データプラットフォームの詳細 |
| L2 | `research.html` | 実証成果・研究の裏付け |
| L2 | `approach.html` | 複雑系アプローチ（思想・手法） |
| L2 | `pricing.html` | 費用の考え方 |
| L2 | `company.html` | 会社情報・メンバー |
| L2 | `news.html` | ニュース・コラム |
| L2 | `contact.html` | 資料請求・お問い合わせ |
| L2 | `demo.html` | デモへの入口 |
| L3 | `guide.html` | 使い方ガイド（既存顧客向け。`service-platform.html` からのみ導線） |
| L3 | `philosophy.html` | 理念（`company.html` からのみ導線） |
| — | `privacy.html` | プライバシーポリシー（Footerのみ） |
| — | `kessan.html` | 決算公告（`noindex`。どこからもリンクしない） |

## 3-3. Header（グローバルナビ）

**MUST**：全ページで同一の構造・順序・表記を使う。実体は `partials/header.html` の単一ソースとし、`node tools/build-partials.mjs` で全ページへ同期する。

**ナビ項目（この順序を維持する）**

```
サービス ▼ ／ 実績・研究 ／ 複雑系アプローチとは ／ 料金 ／ 会社情報 ／ ニュース
```

- **MUST**：「サービス」ドロップダウンは**2項目・リンクテキストのみ**とする。説明文を入れない。
- **MUST**：ドロップダウンは hover / click / キーボードフォーカスの**3経路すべて**で開く。
- **SHOULD**：ナビ項目は6項目までとする。7項目目を足す前に、既存項目を減らせないか検討する。

**右端アクション（3段階の序列を守る）**

| 順位 | ラベル | スタイル | リンク先 |
| --- | --- | --- | --- |
| 3位 | ログイン | 淡いブルー塗り・枠線なし | `https://app.getodonata.com/login` |
| **1位** | **デモを見る** | **塗り（`--color-primary-strong`）・白文字** | `demo.html` |
| 2位 | 資料請求・お問い合わせ | 白地・濃紺1.5px枠線 | `contact.html` |

- **MUST**：3つの高さ（38px）・角丸（999px）・左右パディング（18px）を揃える。
- **MUST**：ホバー時に `padding` / `font-weight` / `font-size` / `letter-spacing` / `border-width` を変えない。枠線は常に `1.5px solid transparent` を持たせ、色だけを変える。動きは `transform` のみ（→ §11-3）。

## 3-4. Footer

**MUST**：実体は `partials/footer.html` の単一ソース。4カラム構成（ブランド / Service / About / Contact）。

- **MUST**：既存顧客向けコンテンツ（使い方ガイド・ログイン）を、検討フェーズの導線に混ぜない。
- **MUST**：`© <年> Odonata.` と `Odonata（オドナータ）` を最下部に置く。年は `[data-year]` で自動更新する。

## 3-5. CTA

**MUST**：サイト全体で使用する CTA は以下の**2種類のみ**とする。

| CTA | 用途 | 遷移先 |
| --- | --- | --- |
| **デモを見る** | 第1CTA。その場で操作できるデモへ | `demo.html` |
| **資料請求・お問い合わせ** | 第2CTA。フォームへ | `contact.html` |

- **MUST**：「サービス資料をダウンロード」「導入相談」「見積もり・相談する」「デモ・トライアルを相談する」等の別表記を作らない。
- **MUST**：ダウンロードアイコンを使わない。フォーム送信後に即時DLされないため、実態と一致しない。
- **SHOULD**：1ページあたりの CTA は1〜2種類まで。同じページ内に同義のボタンを3つ以上置かない。

## 3-6. セクション構成の原則

- **MUST**：**1セクション＝1メッセージ。** 同じ内容を複数セクションで説明しない。
- **MUST**：新しいセクションを追加する前に、**既存のどのセクションと重複しないか**を確認する。重複する場合は追加せず、既存を書き換える。
- **SHOULD**：セクションを追加するときは、同時に「どのセクションを削るか」を検討する。情報量の増加を成果としない。
- **MUST**：各 `<section>` に `id` と `aria-labelledby` を付け、`aria-labelledby` はそのセクションの見出しの `id` を指す。

## 3-7. モバイル時の情報設計

**MUST**：PC版を縮小するのではなく、**優先順位を再設計する**（→ §9）。

SP のファーストビューで、以下の3つが**スクロールなしで**判別できること。

1. サッカーチーム向けのデータプラットフォームであること
2. 提供価値（メインコピー）
3. 第1CTA（デモを見る）

## 3-8. ページ追加時のルール

新しいページを追加する場合、**MUST** として以下をすべて実施する。

1. `tools/build-sitemap.mjs` の `PAGES` に1行追加する
2. `node tools/build-sitemap.mjs` を実行して `sitemap.xml` を再生成する
3. `<!-- #partial:header -->` `<!-- #partial:footer -->` `<!-- #partial:icons -->` `<!-- #partial:analytics -->` のマーカーを設置し、`node tools/build-partials.mjs` を実行する
4. `<title>` `<meta name="description">` `<link rel="canonical">` `OGP` を設定する（→ §13）
5. どのページからリンクするかを決め、内部リンクを張る（孤立ページを作らない）
6. 英語版の要否を判断する（→ §14-6）

---

# 4. Layout & Grid

## 4-1. 幅

| 項目 | 値 | トークン |
| --- | --- | --- |
| 標準コンテンツ最大幅 | `1140px` | `--maxw` |
| Hero など広めのセクション | `1280px` | （個別指定） |
| 本文の1行幅 | `700px`（≒全角40文字） | `--measure-body` / `--readw` |
| 左右パディング | `24px` | `.wrap` |

- **MUST**：本文テキストのブロックには `.readable`（`max-width: var(--readw)`）を適用し、1行が全角40文字を超えないようにする。
- **SHOULD**：`.wrap` を使い、独自の max-width を新設しない。

## 4-2. 余白

| 項目 | 値 | トークン |
| --- | --- | --- |
| セクション上下 | `104px`（SP `72px`） | `--space-section` |
| ブロック間 | `44px` | `--space-block` |
| 段落間 | `28px` | `--space-paragraph` |

- **MUST**：段落間の余白は、行送り（`font-size × line-height`）の**1.5倍以上**を確保する（DADS タイポグラフィ）。
- **SHOULD**：新しい余白の値を導入せず、上記トークンまたはその倍数を使う。

## 4-3. Grid

- **MUST**：固定 px でカラム幅を指定せず、`repeat(auto-fit, minmax(<最小幅>, 1fr))` を使う。
- **MUST**：カードを横並びにするグリッドには `align-items: stretch` を指定し、カードの高さを揃える。行の高さを揃える必要がある場合は `grid-auto-rows: 1fr` と `height: 100%` を併用する。
- **MUST**：カードの `minmax()` の最小値は **280px 以上**とする。これを下回ると日本語が1〜2文字ずつ折り返す。

## 4-4. Breakpoints

**現状、20種類以上のブレークポイントが散在している。以下に統一する。**

| 名称 | 値 | 用途 |
| --- | --- | --- |
| `sm` | `560px` | SP 内での1列化 |
| `md` | `768px` | SP / タブレットの境界 |
| `lg` | `1024px` | タブレット / PC の境界 |
| `xl` | `1180px` | ワイドPC（必要な場合のみ） |

- **MUST**：新規に書くメディアクエリは上記4つのいずれかを使う。`max-width: 900px` `max-width: 820px` 等の独自値を**新たに追加しない**。
- **SHOULD**：既存の独自ブレークポイントは、触るファイルから順に上記へ寄せていく。一括置換は行わない（レイアウト崩れのリスクが高いため）。

## 4-5. Alignment

- **SHOULD**：本文は左揃えを基本とする。中央揃えは、見出し・リード文・メンバーカードなど、短く独立した要素に限る。
- **MUST**：横並びの要素群は、上端または下端で揃える。要素ごとに縦位置がばらつく状態を残さない。

---

# 5. Typography

## 5-1. Font Family

**MUST**：以下のスタックを維持する。追加・変更は本書の改訂を伴う。

```css
font-family: 'Manrope', 'Zen Kaku Gothic New', system-ui, -apple-system, sans-serif;
```

| 用途 | フォント | 理由 |
| --- | --- | --- |
| 英数字・数値 | **Manrope**（400/500/600/700/800） | 数字の可読性が高く、データ表現に合う |
| 日本語 | **Zen Kaku Gothic New**（400/500/700/900） | 角ゴシック。堅実で読みやすく、丸みが強すぎない |
| フォールバック | `system-ui`, `-apple-system` | 読み込み失敗時 |

- **MUST**：大きな数値（`.bignum` 等）には `font-family: 'Manrope'` を明示する。
- **MUST**：フォントの読み込みには `display=swap` を付ける（FOIT を避ける）。
- **MUST**：`fonts.googleapis.com` と `fonts.gstatic.com` に `preconnect` する。

## 5-2. サイズ

| 用途 | トークン / 値 | 備考 |
| --- | --- | --- |
| h1 | `clamp(32px, 4.4vw, 48px)` | **1ページに1つのみ** |
| h2（セクション見出し） | `clamp(30px, 4.2vw, 40px)` | `font-weight: 800` |
| h3（小見出し） | `20px` | `font-weight: 700` |
| 本文 | `16px` | **SP でも 15px を下回らない** |
| リード文 | `16.5px` | `line-height: 1.9` |
| 注記 | `12.5px` | **12px を下回らない** |
| ボタン / ナビ | `13〜14px` | |

- **MUST**：見出しは `clamp()` によるレスポンシブタイポグラフィとし、SP 専用の固定値を新たに増やさない。
- **MUST**：注記を「小さいから」という理由で薄いグレーにしない。注記も **4.5:1 以上**を満たす（→ §6-3）。

## 5-3. 行間・字間

| 項目 | 値 |
| --- | --- |
| 本文 `line-height` | `1.8`（**1.5 以上が MUST**） |
| リード文 `line-height` | `1.9` |
| h2 `line-height` | `1.35` |
| h1 `letter-spacing` | `-0.02em` |
| h2 `letter-spacing` | `-0.01em` |
| eyebrow `letter-spacing` | `0.14em` |

## 5-4. 日本語の組版

**MUST**：以下の指定を維持する。日本語の可読性に直結する。

```css
:where(h1,h2,h3,h4,h5,h6){ text-wrap: balance; word-break: auto-phrase; }
:where(p,li,dd,dt,figcaption,blockquote,th,td){ text-wrap: pretty; word-break: auto-phrase; }
body{ line-break: strict; overflow-wrap: break-word; }
:where(h1,h2,h3,h4){ font-feature-settings: "palt" 1; }
```

- **MUST**：`word-break: break-all` を**日本語テキストに使わない**。1〜2文字ずつ折り返す崩れの原因になる。
- **MUST**：字間を調整する目的で、文字の間に全角スペースを挟まない（スクリーンリーダーの読み上げが壊れる）。
- **SHOULD**：意図した位置で改行させたい場合は `<span class="np">`（`display:inline-block`）で文節を包む。`<br>` を多用しない。

## 5-5. 日本語と英語の違いを踏まえたルール（多言語対応）

日本語と英語では、同じ内容でも文字量・行長・改行位置が大きく異なる。

- **MUST**：英語版で `word-break: auto-phrase` と `font-feature-settings: "palt"` を**適用しない**（日本語専用の指定であり、英語では不要かつ有害）。`:lang(ja)` で限定するか、英語版の CSS で打ち消す。
- **MUST**：ボタン・ナビ・カード見出しに**固定幅を与えない**。英語のほうが横に長くなるため、`min-width` と `padding` で制御する。
- **SHOULD**：英語版の本文 `max-width` は `65ch` 前後（≒半角65〜75文字）を目安とする。日本語の `700px` をそのまま流用しない。
- **SHOULD**：英語版の `line-height` は `1.6〜1.7` を目安とする（日本語の `1.8` は英語ではやや広い）。

---

# 6. Color System

## 6-1. トークン一覧

**定義場所：`assets/site.css` の `:root`。詳細は `docs/design-tokens.md`。**

### テキスト

| トークン | 値 | 主な背景 | 比 | 用途 |
| --- | --- | --- | --- | --- |
| `--color-text` | `#15233B` | `#FFFFFF` | 15.7:1 | 本文 |
| `--color-text-muted` | `#41616F` | `#FFFFFF` | 6.6:1 | 補足・リード |
| `--color-text-note` | `#4B5563` | `#FFFFFF` | 7.6:1 | 注記 |
| `--color-text-inverse` | `#E4EFF8` | `#0B2A5B` | 12.0:1 | 暗い面の上の文字 |
| `--color-navy` | `#0B2A5B` | `#FFFFFF` | 14.0:1 | 見出し |
| `--color-primary-strong` | `#0A5E93` | `#FFFFFF` | 6.9:1 | リンク・eyebrow |

### 面・線・アクセント

| トークン | 値 | 用途 |
| --- | --- | --- |
| `--color-primary` | `#00A0E9` | **塗り・図形・装飾の線専用。文字に使わない**（白地 2.91:1 / ページ地 2.59:1）。→ §6-2 の背景別の表 |
| `--color-accent` | `#FF9933` | 図中の強調のみ。文字に使わない |
| `--color-bg` | `#E0F5FD` | ページ地 |
| `--color-bg-subtle` | `#F2FBFE` | セクションの交互背景 |
| `--color-bg-surface` | `#FFFFFF` | カード地 |
| `--color-bg-dark` | `#071A3A` | 暗い面 |
| `--color-border` | `#CCE9F6` | 面の区切り線（非情報） |
| `--color-border-strong` | `#6A9AB8` | **白い塗りの上の枠線のみ**（白地 3.03:1 / ページ地 2.69:1）。→ §6-2 の背景別の表 |

### 2事業のカード配色（Hero と Service セクションで共有）

| データ分析・伴走支援 | 値 | データプラットフォーム | 値 |
| --- | --- | --- | --- |
| `--card-analysis-bg` | `#FFFFFF` | `--card-platform-bg` | `#0B2A5B` |
| `--card-analysis-accent` | `#00A0E9` | `--card-platform-accent` | `#7FE3FF` |
| `--card-analysis-icon` | `#0A5E93` | `--card-platform-icon` | `#7FE3FF` |
| `--card-analysis-text` | `#0B2A5B` | `--card-platform-text` | `#FFFFFF` |
| `--card-analysis-hover` | `#F2FAFE` | `--card-platform-hover` | `#123A72` |

### フォーカス

| トークン | 値 | 用途 |
| --- | --- | --- |
| `--color-focus-ring` | `#FFDF3F` | フォーカスリングの黄（外側） |
| `--color-focus-outline` | `#1A1A1C` | フォーカスリングの黒（内側） |

## 6-2. 文字色に使ってよい色

**MUST**：文字色に使ってよいのは、以下の**6つのみ**とする。

```
--color-text / --color-text-muted / --color-text-note /
--color-text-inverse / --color-navy / --color-primary-strong
```

**MUST**：`--color-primary`（`#00A0E9`）は白背景で 2.91:1、ページ地で 2.59:1 のため、**文字色に使わない。** 青いリンクや小見出しを作りたい場合は `--color-primary-strong` を使う。

### 背景別のコントラスト比（実測）

**MUST：コントラスト比は必ず「実際に隣接する色」に対して計算する。白背景での値をそのまま流用しない。
ページ地は白ではなく `#E0F5FD` である。**

§6-1 の表に添えた比は白基準の参考値にすぎない。**3:1 未満は太字**。

| 前景 | 白 `#FFFFFF` | `--color-bg` `#E0F5FD` | `--color-bg-subtle` `#F2FBFE` | `--color-navy` `#0B2A5B` | `--color-bg-dark` `#071A3A` |
| --- | --- | --- | --- | --- | --- |
| `--color-border-strong` `#6A9AB8` | 3.03 | **2.69** | **2.89** | 4.63 | 5.69 |
| `--color-primary` `#00A0E9` | **2.91** | **2.59** | **2.78** | 4.81 | 5.92 |
| `--color-primary-strong` `#0A5E93` | 6.92 | 6.14 | 6.59 | **2.03** | **2.49** |
| `--card-platform-accent` `#7FE3FF` | **1.47** | **1.30** | **1.40** | 9.58 | 11.77 |

**`--color-border-strong` の使用条件**

| | 用途 |
| --- | --- |
| OK | 白い塗りの上に載る枠線（ボタン・カードの縁）。枠線 vs 白 = 3.03:1 |
| NG | ページ地の上に直接置く線・記号（区切り・罫線・アイコン）。2.69:1 で 3:1 を満たさない |

**`--color-primary` の使用条件**

| | 用途 |
| --- | --- |
| OK | 大きな面の塗り、装飾の線、濃紺の面の上（4.81:1 / 5.92:1） |
| NG | 明るい面の上の文字（2.91:1 / 2.59:1） |
| NG | 明るい面の上の「意味を持つアイコン」。3:1 未満のため、`--color-primary-strong` を使う |

**`--color-primary-strong` / `--card-platform-accent` の使用条件**

- `--color-primary-strong` は**明るい面専用**。濃紺の上では 2.03:1 で使えない。
- `--card-platform-accent` は**暗い面専用**。白・ページ地の上では 1.5:1 未満で使えない。

## 6-3. コントラスト比（WCAG 2.2 AA）

| 対象 | 最低比 |
| --- | --- |
| 通常のテキスト（24px未満、または太字でない29px未満） | **4.5:1** |
| 大きいテキスト（太字24px以上／非太字29px以上） | **3:1** |
| UIコンポーネントの境界、アイコン、フォーム部品、グラフの要素 | **3:1** |

- **MUST**：新しい色の組み合わせを導入するときは、**必ず比を計算し、`docs/design-tokens.md` に追記する。**
- **MUST**：半透明（`rgba` / `opacity`）を使う場合、**下地と合成した実効色**で比を計算する。
- **MUST**：注記・補足・プレースホルダも 4.5:1 を満たす。「小さいから薄くする」を許さない。

## 6-4. 色だけで情報を伝えない

**MUST**：以下は色以外の手がかりを必ず併用する（WCAG 1.4.1）。

| 対象 | 併用する手がかり |
| --- | --- |
| リンク | **下線**（必須） |
| 必須項目 | 「必須」というテキストラベル |
| リスクの高低 | 数値・ラベル・アイコン形状 |
| グラフの系列 | 凡例テキスト・パターン・直接ラベル |
| 提供中 / 今後のテーマのタグ | 矢印アイコン・下線・凡例 |
| ステップの進行 | 番号（01/02/03）とラベル |

## 6-5. Interactive States

| 状態 | ルール |
| --- | --- |
| `:hover` | 背景色・枠線色・`transform` のみを変える。**レイアウトに影響する値を変えない** |
| `:focus-visible` | **MUST**：黄＋黒の2重リング（下記）。消してはならない |
| `:active` | `transform` を戻す、または軽く押し込む |
| `[disabled]` | `opacity` ではなく、専用の淡色トークンで表現する。コントラスト比 3:1 以上を維持する |
| `:visited` | 色を大きく変えない（サイト内リンクの一貫性を保つため） |

**フォーカスリング（MUST・変更禁止）**

```css
:focus-visible{
  outline: 2px solid #1A1A1C;   /* --color-focus-outline */
  outline-offset: 0;
  box-shadow: 0 0 0 4px #FFDF3F; /* --color-focus-ring */
  border-radius: 3px;
}
```

DADS のフォーカスカラー（Yellow-300 と Black の2重構造）に準拠する。**いかなる背景色の上でも視認できることを保証するための構造であり、変更してはならない。**

---

# 7. Components

各コンポーネントについて、**用途 / 使用条件 / 見た目 / hover / focus / active / disabled / mobile** を定める。共通事項として、**すべてのインタラクティブ要素は §6-5 のフォーカスリングを持つ（MUST）**。

## 7-1. Header / Navigation

| 項目 | 内容 |
| --- | --- |
| **用途** | 全ページ共通のグローバルナビゲーション |
| **実体** | `partials/header.html`（単一ソース）→ `tools/build-partials.mjs` で同期 |
| **見た目** | 高さ 68px、`position: sticky; top: 0`、背景 `rgba(224,245,253,.9)` + `backdrop-filter: blur(14px)`、下に 1px 罫線 |
| **hover** | 文字色を `--color-primary-strong` に、`opacity` を 1 に |
| **active（現在地）** | `box-shadow: inset 0 -2px 0 var(--blue)`。**MUST**：あわせて `aria-current="page"` を付与する |
| **focus** | `outline-offset: 3px` + 標準フォーカスリング |
| **mobile（〜1023px）** | ハンバーガー → 全画面メニュー。ドロップダウンはアコーディオン。`aria-expanded` を更新する |

- **MUST**：ドロップダウンの開閉状態を `aria-expanded` に反映する。
- **MUST**：`Esc` で閉じ、フォーカスをトリガーボタンに戻す。
- **MUST**：全ページでヘッダーの構造・順序・表記が完全に一致すること。差分が出たら `node tools/build-partials.mjs --check` が落ちる。

## 7-2. Buttons / CTA

| 種別 | クラス | 用途 | 見た目 |
| --- | --- | --- | --- |
| Primary | `.nav-cta` / `.btn.primary` | デモを見る | `--color-primary-strong` 塗り・白文字 |
| Secondary | `.nav-cta2` / `.btn` | 資料請求・お問い合わせ | 白地・濃紺 1.5px 枠線 |
| Tertiary | `.nav-login` | ログイン | 淡いブルー塗り（`#E8F2FB`）・濃紺文字 |
| Text link | `.tlink` | セクション内の詳細導線 | 下線あり・矢印なし（→ §7-8） |

- **MUST**：高さ 38px、`border-radius: 999px`、左右パディング 18px を3種で揃える。
- **MUST**：枠線は常に `1.5px solid transparent` を持たせ、hover では**色だけ**を変える。`border-width` を増やすと隣接要素が動く。
- **MUST**：hover / focus の動きは `transform: translateY(-1px)` のみ。`padding` / `font-weight` / `font-size` / `letter-spacing` を変えない。
- **MUST**：ページ遷移するものは `<a>`、その場で動作するものは `<button type="button">` を使う。見た目で使い分けない。
- **MUST**：アイコンのみのボタンを作らない。作る場合は `aria-label` を必ず付ける。
- **SHOULD**：ボタン内のアイコンには `aria-hidden="true"` を付け、意味はテキストで担保する。

## 7-3. Cards

| 項目 | 内容 |
| --- | --- |
| **用途** | ユースケース、サービス、メンバー、ニュース、料金など |
| **見た目** | `border-radius: 18px`（`--radius`）、`box-shadow: 0 10px 30px rgba(11,42,91,.08)` |
| **hover** | `transform: translateY(-2px)` + 影を強く。padding/borderは変えない |
| **mobile** | 1列。最小幅 280px を確保する |

- **MUST**：同じカードコンポーネントを、**意味の異なるものに使い回さない。** 「分析する」と「現場で使う」、「課題」と「成果」は、背景色・ビジュアル種別・カード形状のいずれかで必ず差を付ける。
- **MUST**：横並びのカードは、内部の行構成を Grid で固定して要素の縦位置を揃える。

```css
.card{ display:grid; grid-template-rows: auto auto 1fr auto; height:100%; }
/* 1行目=見出し / 2行目=ビジュアル / 3行目=本文（可変） / 4行目=リンク（常に最下部） */
```

- **MUST**：カードの高さを `min-height` で固定して余白で埋めない。高さは「中身＋パディング」で自然に決まるようにする。
- **SHOULD**：1枚のカードに詰め込む要素は、見出し・ビジュアル・本文2〜3行・リンク1本まで。

## 7-4. Forms（Input / Select / Textarea）

| 項目 | 内容 |
| --- | --- |
| **用途** | `contact.html` の資料請求・お問い合わせフォーム |
| **見た目** | 背景 `#FBFEFF`、`font-family: inherit`、`transition: .15s` |

- **MUST**：すべての入力欄に `<label>` を置き、`for` / `id` で関連付ける。**`placeholder` をラベル代わりに使わない。**
- **MUST**：必須項目は色だけでなく「必須」というテキストラベルで示す。
- **MUST**：入力形式の制限（半角のみ等）がある場合、**入力前に**説明を置き、`aria-describedby` で入力欄と関連付ける。
- **MUST**：エラーは、どの項目で何が起きたかをテキストで具体的に示す。エラー領域に `role="alert"` または `aria-live="polite"` を付け、スクリーンリーダーに伝える。
- **MUST**：入力に制限時間を設けない。
- **MUST**：送信ボタンにアクセシブルな名前を付ける。
- **MUST**：送信完了時に `odonata:lead` イベントを `document` に dispatch する（GA4 の `generate_lead` 計測のため）。
- **SHOULD**：フォームの送信方式を変更する場合（現在は `mailto:` による暫定実装）、送信先・保存先・保存期間をプライバシーポリシーに反映する。

## 7-5. Modal / Dropdown

- **MUST**：開いたらフォーカスを内部へ移し、`Esc` で閉じ、閉じたらトリガー要素にフォーカスを戻す。
- **MUST**：フォーカスが閉じ込められない（トラップされない）こと。
- **MUST**：`aria-expanded` / `aria-controls` を正しく更新する。
- **SHOULD**：モーダルは原則使わない。情報はページ内に置く。

## 7-6. Accordion / Details

- **MAY**：補足情報の折りたたみに `<details><summary>` を使ってよい。
- **MUST**：キーボードで開閉でき、開閉状態がスクリーンリーダーに伝わること（ネイティブ要素を使えば自動的に満たされる）。
- **SHOULD**：FAQ を並べるためにアコーディオンを使わない。**開かれないため、ページ長だけが増える。** 必要な情報は本文に書く。

## 7-7. Tables

- **MUST**：データの表は `<table>` で組む。**画像にしない。**
- **MUST**：`<th scope="col">` / `<th scope="row">` を正しく使う。`<caption>` で表の主旨を示す。
- **MUST**：SP では横スクロールではなく、**縦積みのカード表示**に切り替える。横スクロールを使う場合は、スクロール可能であることを視覚的に示す。
- **SHOULD**：レイアウト目的で `<table>` を使わない。

## 7-8. Text Link（`.tlink`）

- **MUST**：常時下線を付ける（色だけでリンクと分からせない）。
- **MUST**：リンクテキスト単体で行き先が分かる文言にする。**「こちら」「詳しくはこちら」「もっと見る」は禁止。**
- **MUST**：矢印を添える場合、サイズはリンクテキストの文字サイズの **1.0倍以下**とし、`aria-hidden="true"` を付ける。矢印がテキストより目立つ状態にしない。
- **MUST**：外部サイト・別サブドメインへのリンクは、その旨がテキストで分かるようにする。`target="_blank"` を使う場合は `rel="noopener"` を付ける。
- **SHOULD**：セクション内の詳細導線はボタンではなくテキストリンクにし、ページの主要 CTA と競合させない。

## 7-9. Breadcrumb

- **MUST**：**すべての下層ページに設置する**（現在未実装 → §21）。
- **MUST**：`<nav aria-label="パンくずリスト">` + `<ol>` で組み、現在地には `aria-current="page"` を付ける。
- **MUST**：`BreadcrumbList` の構造化データを併記する（→ §13-6）。

```
ホーム > 実績・研究
```

## 7-10. Charts / Data Visualization

- **MUST**：図解の文字は **SVG の `<text>` または HTML** で持つ。**PNG に焼き込まない**（将来の英語化で図を作り直すことになるため）。
- **MUST**：図には `<title>` と `<desc>`（SVG の場合）、または隣接する本文で要旨を説明する。
- **MUST**：系列を色だけで区別しない。直接ラベル・パターン・凡例テキストを併用する。
- **MUST**：矢印は SVG の `<marker>` で描く。CSS の `border` ハックで三角形を作らない。線の端が図形の輪郭に接していること。
- **MUST**：図の中の文字がボックスからはみ出さないよう、ラベルに `max-width` を与え、収まらない場合は**ボックスを広げる**（文字を小さくして押し込まない）。
- **MUST**：SP では円環図を縦一列のステップ表示に切り替える。
- **SHOULD**：矢印の見た目をサイト全体で統一する（線 2px、強調 4px、先端は塗りつぶした三角形、色はブランドブルー／濃紺）。

## 7-11. Language Switcher（将来）

- **MUST**：ヘッダー右端、ログインの左に配置する。**スロットは `partials/header.html` の `.nav-lang` に確保済み。**
- **MUST**：表記は `日本語` / `English`（または `JP` / `EN`）。現在の言語を `aria-current="true"` で示す。
- **MUST**：**ユーザーの言語環境（`Accept-Language` 等）だけを理由に、強制的に別言語ページへリダイレクトしない。** ユーザーが任意に切り替えられること。
- **MUST**：切り替え先は、**同じ内容の対応ページ**とする。対応ページがない場合は、その言語のトップへ遷移させ、その旨を示す。

---

# 8. Accessibility

**基本目標：WCAG 2.2 レベル AA。** JIS X 8341-3:2016 および デジタル庁「ウェブアクセシビリティ導入ガイドブック」に準拠する。

## 8-1. 絶対に守る（MUST）

- [ ] **フォーカスインジケーターを消さない。** `outline: none` の単独使用を禁止する（→ §6-5 の2重リングを使う）
- [ ] キーボードだけで全機能を操作できる
- [ ] `Tab` の移動順が視覚順・DOM順と一致している
- [ ] フォーカスが閉じ込められる箇所がない
- [ ] 1秒に3回を超える点滅・明滅を作らない
- [ ] 3秒を超えて自動再生する音声を置かない
- [ ] `<meta name="viewport">` に `user-scalable=no` / `maximum-scale=1` を書かない
- [ ] ブラウザ 200% 拡大で、文字が重ならない・切れない・横スクロールが発生しない
- [ ] 文字コードは UTF-8
- [ ] `<html lang="ja">`（英語版は `lang="en"`）

## 8-2. Semantic HTML

- **MUST**：`<header>` `<nav>` `<main>` `<footer>` のランドマークを正しく使う。`<main>` は1ページに1つ。
- **MUST**：`<div>` だけで構造を作らない。見出し・リスト・表・ナビは適切な要素を使う。
- **MUST**：ページ先頭に「本文へスキップ」リンク（`.skip-link`）を置き、`#main` へ移動できるようにする。
- **MUST**：CSS で見た目の順序を入れ替えた結果、読み上げ順と視覚順がずれる状態を作らない。

## 8-3. 見出し階層

- **MUST**：`h1` は**1ページに1つだけ**。
- **MUST**：レベルを飛ばさない（`h2` の次に `h4` を置かない）。
- **MUST**：空の見出しタグを作らない。
- **MUST**：文字を大きく・太くする目的で見出しタグを使わない。見た目のためなら `<p>` / `<span>` + CSS を使う。

## 8-4. 画像

- **MUST**：すべての `<img>` に `alt` を付ける。
- **MUST**：装飾画像・背景SVG・アイコンは `alt=""` かつ `aria-hidden="true"`。
- **MUST**：グラフ・図解の `alt` は要旨を書く（**80字目安**）。隣接する本文で内容を説明している場合は `alt=""` でよい。
- **MUST**：リンクになっている画像の `alt` は、**リンク先が分かる内容**にする。
- **MUST**：ロゴの `alt` は `Odonata`。

## 8-5. ARIA

- **MUST**：ネイティブ要素で表現できるものに ARIA を使わない（`<button>` を `<div role="button">` にしない）。
- **MUST**：`aria-expanded` / `aria-controls` は実際の状態と同期させる。
- **MUST**：現在地のナビ項目に `aria-current="page"` を付ける。
- **MUST**：装飾用の SVG・アイコンに `aria-hidden="true"` を付ける。

## 8-6. Button と Link の区別

- **MUST**：**ページ遷移するもの＝ `<a href>`、その場で動作するもの＝ `<button type="button">`。** 見た目で使い分けない。
- **MUST**：`<a>` に `href` がない状態でクリック可能にしない。

## 8-7. Touch Target

- **MUST**：タップ対象は **44 × 44 CSS px 以上**を確保する（WCAG 2.2 の 2.5.8 は 24px が最低だが、本サイトは 44px を目標とする）。
- **MUST**：隣接するタップ対象の間に十分な間隔を空ける。

## 8-8. Motion

- **MUST**：`@media (prefers-reduced-motion: reduce)` で、**すべてのアニメーション・トランジション・背景の動きを停止**させる。停止した状態でも情報が失われないこと。
- **MUST**：自動で切り替わるコンテンツ（カルーセル等）には一時停止手段を用意する。用意できないなら作らない。

## 8-9. 検証方法

- **MUST**：実装後に Chrome DevTools の Lighthouse（Accessibility）を実行し、**スコア95以上**を維持する。
- **SHOULD**：axe DevTools でも検証する。
- **MUST**：**自動チェックで検出できるのは全体の2〜3割にすぎない。** ツールが緑でも、キーボードのみの操作確認と 200% 拡大確認を人の目で行う。

---

# 9. Responsive Design

**MUST**：PC版を縮小する設計を禁止する。デバイスごとに情報の優先順位を再設計する。

## 9-1. デバイス別の設計方針

| 項目 | Desktop（1024px〜） | Tablet（768〜1023px） | Mobile（〜767px） |
| --- | --- | --- | --- |
| **情報優先順位** | 全体像を俯瞰させる | Desktop に準じる | **提供価値と第1CTAを最優先。** 補足は後ろへ |
| **Hero** | 左コピー / 右画像の2カラム（5:6） | 縦積み（コピー → 画像） | 縦積み。CTAは縦並び |
| **Navigation** | 全項目を横並び | ハンバーガー | ハンバーガー → 全画面メニュー |
| **Typography** | `clamp()` の上限 | 中間 | 下限。ただし本文15px・注記12pxを下回らない |
| **CTA** | ヘッダー右に3つ | 全画面メニュー内 | 全画面メニュー内 + セクション内 |
| **Card** | 2〜4列 | 2列 | 1列（最小幅280px確保） |
| **Table** | 通常の表 | 通常の表 | **縦積みカードに切り替え** |
| **Data viz** | 円環図・横並びフロー | 同左（縮小） | **縦一列のステップに切り替え** |
| **Image** | 1672px 幅を配信 | 同左 | `@828` 版を配信 |

## 9-2. 実装ルール

- **MUST**：どの幅でも横スクロールバーが出ないこと。`body { overflow-x: hidden }` で誤魔化さず、**はみ出している要素そのものを直す。**
- **MUST**：幅の指定に固定 px を使わず、`minmax()` と `clamp()` を使う。
- **MUST**：`img` の bleed（画面端まで伸ばす）を使う場合、コンテナの外へはみ出す量を明示的に制御する。
- **SHOULD**：確認する幅は **390 / 768 / 1024 / 1280 / 1920px** の5点を基本とする。

---

# 10. Images & Visuals

## 10-1. 使い分け

| 種別 | 用途 | 使ってよい場面 |
| --- | --- | --- |
| **UI screenshot** | プロダクトの実在を示す | **最優先。** Hero、Service、機能説明 |
| **分析アウトプット図** | 分析の中身を示す | ユースケース、Service（分析側） |
| **写真（人物・現場）** | サッカー現場の文脈を与える | Hero、Service、実証セクション |
| **抽象ビジュアル（ネットワーク）** | ブランドモチーフ | Hero 背景、暗い面の背景 |
| **Diagram（図解）** | 関係・流れを示す | 循環図、PDCA、複雑系の説明 |
| **Icon** | ラベルの補助 | カード、リスト、ナビ |
| **Logo** | ブランド識別 | ヘッダー、フッター |

## 10-2. ブランド上の制約（MUST）

- **UI screenshot と分析図を、概念図やイメージ写真より優先する。** ページ内で最初に現れるビジュアルは、原則としてプロダクト画面か分析アウトプットにする。
- **サッカーらしさは写真ではなく、画面内の語彙で出す。** デュエル勝率・ハムストリング・スプリント・ハイスピード距離といったサッカー固有の指標が画面に見えていることが、最も強いサッカー表現になる。
- **使わないもの**：ゴールシーン・歓喜シーンの汎用ストックフォト、スタジアム全景、ボールやスパイクのアイコン素材、意味のない装飾画像。
- **抽象グラフィック（ピッチライン等）は不透明度10%以下**に抑え、情報ではなく質感として使う。
- **実証現場の写真はサイト全体で1〜2枚まで。**

## 10-3. 生成画像の扱い（MUST）

- 生成AIで作った画像に、**日本語の文字を含めない。** 生成AIは日本語をほぼ確実に崩す（過去に「ネントワーク分析」の誤字混入あり）。プロンプト末尾に `No text, no letters, no words, no logos, no watermarks` を必ず付ける。
- **日本語ラベルが入る図（循環図・PDCA図・ネットワーク説明図）は、画像生成せず SVG / HTML で実装する。**
- 生成画像に写る人物は Odonata のメンバーでも導入クラブでもない。**人物写真を使うセクションには「※写真はイメージです。」を1回置く。**
- 実証現場の写真を「筑波大学蹴球部の写真」として提示してよいのは、**実際に撮影・許諾を得たものだけ。** 生成画像の `alt` に「筑波大学」という語を入れない。

## 10-4. 技術要件

| 項目 | ルール |
| --- | --- |
| **形式** | **MUST**：写真は WebP を第一候補、JPEG をフォールバック。ロゴ・アイコンは SVG。**MAY**：AVIF |
| **配信** | **MUST**：`<picture>` + `<source type="image/webp">` + `srcset` / `sizes` |
| **解像度** | **MUST**：2サイズ（`1672px` / `@828px`）を用意し、`srcset` で出し分ける |
| **ファイルサイズ** | **MUST**：1枚 **300KB 以下** |
| **寸法属性** | **MUST**：すべての `<img>` に `width` と `height` を明示する（CLS 防止） |
| **遅延読み込み** | **MUST**：ファーストビュー外のすべての画像に `loading="lazy"`。Hero の主画像には付けず、`fetchpriority="high"` を付ける |
| **アスペクト比** | **SHOULD**：写真は 16:9 に統一。横並びの2枚は必ず同比率にする |
| **crop** | **SHOULD**：`object-fit: cover` + `object-position` で被写体の重要部分が切れないよう調整する |
| **角丸** | **MUST**：写真は直角（`border-radius: 0`）。白い枠・余白・影を付けない |
| **背景画像** | **MUST**：装飾なので `background-image` か、`<img>` なら `alt="" aria-hidden="true"` |

- **MUST**：未参照の画像をリポジトリに残さない。参照が消えたらファイルも削除する。

---

# 11. Animation & Interaction

## 11-1. 目的

**MUST**：アニメーションは「派手さ」のためではなく、**情報理解・操作理解・ブランド体験**のために使う。以下のいずれにも当てはまらない動きは実装しない。

1. 状態の変化を伝える（開閉、選択、ホバー）
2. 要素間の関係を示す（遷移、階層）
3. ブランドモチーフを表現する（点と線のネットワーク）

## 11-2. パラメータ

| 項目 | 値 |
| --- | --- |
| duration（マイクロインタラクション） | `.15s` |
| duration（要素の出現） | `.3〜.5s` |
| easing | `ease` / `cubic-bezier(.2,.7,.3,1)` |
| 移動量 | `translateY` は最大 `8px` 程度 |

## 11-3. レイアウトを動かさない（MUST）

ホバー・フォーカスで**レイアウトに影響する値を変えてはならない**。周囲の要素が震える原因になる。

| 変えてよい | 変えてはいけない |
| --- | --- |
| `background-color` | `padding` / `margin` |
| `border-color` | `border-width` |
| `color` | `font-weight` |
| `box-shadow` | `font-size` / `letter-spacing` |
| `transform`（translate / scale） | `width` / `height` |
| `text-decoration-thickness` | `display` / `position` |

枠線を出したい場合は、**最初から `border: 1.5px solid transparent` を持たせ、色だけを変える。**

## 11-4. 背景アニメーション（`netbg.js`）

Odonata のブランドモチーフである「点と点が線でつながって浮遊する」表現。

- **MUST**：ノードは3段階以上のサイズを持つ（多くの指標とつながる中心的なノードが存在する、という含意）。
- **MUST**：エッジは太さと不透明度にばらつきを持たせる（関係の強弱）。
- **MUST**：2〜3層に分け、奥のレイヤーほど小さく・薄く・ゆっくり動かす（視差）。
- **MUST**：配色はブランドカラー（ネイビー／ブルー）とアクセントのオレンジのみ。
- **MUST**：`aria-hidden="true"` でスクリーンリーダーから隠す。
- **MUST**：`prefers-reduced-motion: reduce` で完全に停止し、**静止画として成立する状態**にする。
- **MUST**：タブが非表示のとき `requestAnimationFrame` を停止する。
- **SHOULD**：モバイルではノード数を減らす。
- **MUST**：前面のテキストの可読性を絶対に優先する。背景の上に乗るすべての文字で 4.5:1 を確認する。

## 11-5. スクロールアニメーション（`.reveal`）

- **MAY**：セクションの出現に軽いフェード＋上方向の移動を使ってよい。
- **MUST**：`prefers-reduced-motion: reduce` で `opacity: 1; transform: none; transition: none` にする。
- **MUST**：アニメーション前の状態が `opacity: 0` の場合、**JavaScript が失敗したときにコンテンツが永久に見えなくなる**ことを避ける（`IntersectionObserver` 非対応時のフォールバックを用意する）。
- **MUST**：スクロールアニメーションで CLS を発生させない。

---

# 12. Performance

**目標：Core Web Vitals の3指標すべてで「良好」を維持する。**

| 指標 | 目標 | 主なリスク |
| --- | --- | --- |
| **LCP**（表示速度） | **2.5秒以内** | Hero 画像、Webフォント |
| **INP**（応答性） | **200ms 以内** | 重い JS、スクロールイベント |
| **CLS**（視覚安定性） | **0.1 以下** | `width`/`height` のない画像、Webフォント差し替え、遅延挿入される要素 |

## 12-1. 画像（最大の要因）

- **MUST**：1枚 300KB 以下、WebP 優先、`srcset` で出し分け（→ §10-4）。
- **MUST**：すべての `<img>` に `width` / `height`（CLS 対策）。
- **MUST**：ファーストビュー外は `loading="lazy"`。Hero 主画像は `fetchpriority="high"` かつ lazy なし。

## 12-2. フォント

- **MUST**：`display=swap` を付ける。
- **MUST**：`fonts.googleapis.com` / `fonts.gstatic.com` に `preconnect`。
- **SHOULD**：読み込むウェイトを実際に使うものだけに絞る。使っていないウェイトを URL から削る。
- **MAY**：LCP がフォント待ちで悪化する場合、Hero の見出しに使うウェイトのみ `preload` する。

## 12-3. JavaScript

- **MUST**：`<head>` 内のスクリプトは `async` または `defer` を付ける。
- **MUST**：スクロール・リサイズのイベントハンドラは `requestAnimationFrame` またはスロットリングでまとめる。
- **MUST**：ライブラリを安易に追加しない（→ §19）。現在サイトは**外部JSライブラリを一切使っていない。この状態を維持する。**
- **SHOULD**：ページ固有の JS はそのページでのみ読み込む。

## 12-4. サードパーティ

- **MUST**：現在読み込んでいるサードパーティは **Google Fonts と GA4（gtag.js）の2つのみ。** 追加する場合は、LCP / INP への影響を計測してから判断する。
- **MUST**：GA4 は `async` で読み込む。

## 12-5. CSS

- **MUST**：共通スタイルは `assets/site.css` に集約する。
- **SHOULD**：ページ固有の `<style>` は 100行以内を目安とする。それを超えたら、共通化できるものを `site.css` へ昇格させる。
- **SHOULD**：使われていないセレクタを定期的に棚卸しする。

## 12-6. 計測

- **MUST**：大きな改修のあとに Lighthouse（Performance / Accessibility / SEO）を実行し、結果を `docs/refactor-notes.md` に記録する。
- **SHOULD**：Search Console の「ウェブに関する主な指標」を月1回確認する。

---

# 13. SEO

**基準：Google Search Essentials および Google SEO スターターガイド。**

**MUST**：SEO のためだけの不自然なキーワード詰め込みを禁止する。**人間にとって有用なコンテンツを最優先する。**

## 13-1. title

- **MUST**：全ページで固有。重複させない。
- **MUST**：形式は `<ページの内容>｜Odonata`。区切りは全角の「｜」で統一する。
- **SHOULD**：全角30文字程度まで（超えると検索結果で省略される）。
- **MUST**：TOP と主要サービスページには「**サッカー**」を含める。「スポーツ」だけでは事業領域が特定できない。
- **SHOULD**：`title` と `h1` は**整合させるが、同一である必要はない。** `h1` はブランドコピー、`title` は検索エンジン向けの説明、という役割分担でよい。

## 13-2. meta description

- **MUST**：全ページに設置し、ページごとに固有の内容にする。
- **SHOULD**：全角120文字前後。
- **MUST**：キーワードを羅列せず、自然な文章にする。
- **MUST**：`philosophy.html` と `privacy.html` を除き、「サッカー」を含める。

## 13-3. canonical

- **MUST**：全ページに `<link rel="canonical">` を設置する。
- **MUST**：**絶対URL**（`https://` から始まる）で書く。`http://` や `www` 付きにしない。
- **MUST**：TOP は `https://getodonata.com/` を指す（`index.html` を指さない）。
- **MUST**：**日本語ページと英語ページを同一 canonical にしない**（→ §14-3）。

## 13-4. sitemap.xml

- **MUST**：`tools/build-sitemap.mjs` で生成する。**手書きしない。**
- **MUST**：ページを追加・削除したら `PAGES` を更新し、再生成する。
- **MUST**：`index.html` は含めない（`/` と重複するため）。
- **MUST**：`noindex` のページ（`kessan.html`）は含めない。
- **MUST**：Search Console には **`sitemap.xml` のみ**を送信する。個別ページのURLをサイトマップ欄に入れない（「サイトマップが HTML です」エラーの原因）。

## 13-5. robots.txt

- **MUST**：`Sitemap:` の行を含める。
- **MUST**：`Disallow:` を安易に書かない。1文字の間違いでサイト全体が検索結果から消える。

## 13-6. 構造化データ（JSON-LD）

- **MUST**：TOP に `Organization` を置く。`alternateName` に `オドナータ` を含める。
- **MUST**：**存在しない住所・電話番号・SNSアカウントを書かない。** 法人未登記のため `address` / `telephone` は入れない。
- **MUST**：記述内容が、実際にページに書かれている内容と矛盾しないこと。構造化データだけに書いて本文に無い、という状態を作らない。
- **SHOULD**：下層ページに `BreadcrumbList` を追加する。
- **MAY**：`WebSite`、`Article`（ニュース記事）、`Service` を追加してよい。
- **MUST**：追加・変更したら [リッチリザルトテスト](https://search.google.com/test/rich-results) でエラーがないことを確認する。

## 13-7. Open Graph / X Card

- **MUST**：全ページに以下を設置する。

```html
<meta property="og:type" content="website">
<meta property="og:site_name" content="Odonata">
<meta property="og:locale" content="ja_JP">
<meta property="og:title" content="<title と同一またはSNS向けに調整した文言>">
<meta property="og:description" content="<description と同一>">
<meta property="og:url" content="<canonical と同一の絶対URL>">
<meta property="og:image" content="https://getodonata.com/assets/og-default.png">
<meta name="twitter:card" content="summary_large_image">
```

- **MUST**：OG画像は **1200 × 630px**、絶対URLで指定する。
- **SHOULD**：サイト共通の `og-default.png` を1枚用意し、主要ページのみ個別画像を用意する。
- **MUST**：英語版では `og:locale` を `en_US` にし、`og:locale:alternate` で相互参照する。

## 13-8. 見出し・内部リンク

- **MUST**：見出し階層は §8-3 に従う（SEO とアクセシビリティで共通のルール）。
- **MUST**：孤立ページ（どこからもリンクされないページ）を作らない。
- **MUST**：アンカーテキストはリンク先の内容が分かる文言にする（→ §7-8）。
- **SHOULD**：関連する下層ページ同士を相互にリンクする。

## 13-9. indexability

- **MUST**：公開すべきページに `noindex` を付けない。
- **MUST**：公開すべきでないページ（`kessan.html` 等）には `<meta name="robots" content="noindex,nofollow,noarchive">` を付け、sitemap から除外し、どこからもリンクしない。
- **MUST**：新規ページ公開後、Search Console の URL 検査でインデックス登録をリクエストする。

## 13-10. URL 構造

- **MUST**：現行のフラット構成（`/xxx.html`）を維持する。既存URLを変更しない（被リンクと検索評価を失うため）。
- **MUST**：英語版は `/en/xxx.html` のサブディレクトリとする（→ §14-1）。
- **SHOULD**：新規ページのファイル名は、内容が分かる英小文字とハイフンで命名する。

---

# 14. Internationalization / 多言語サイト

## 14-1. URL 設計（MUST）

| 言語 | URL |
| --- | --- |
| 日本語 | `https://getodonata.com/` |
| 日本語（下層） | `https://getodonata.com/company.html` |
| 英語 | `https://getodonata.com/en/` |
| 英語（下層） | `https://getodonata.com/en/company.html` |

- **MUST**：日本語をルート、英語を `/en/` サブディレクトリとする。
- **MUST**：日本語版のURLを変更しない。
- **MUST**：ファイル名は日英で対応させる（`company.html` ⇄ `en/company.html`）。

## 14-2. HTML lang（MUST）

```html
<!-- 日本語 -->  <html lang="ja">
<!-- 英語 -->    <html lang="en">
```

## 14-3. canonical（MUST）

各言語ページは**自分自身**を canonical に指定する。**日本語ページと英語ページを同一 canonical にしない。**

```html
<!-- /company.html -->      <link rel="canonical" href="https://getodonata.com/company.html">
<!-- /en/company.html -->   <link rel="canonical" href="https://getodonata.com/en/company.html">
```

## 14-4. hreflang（MUST）

**日本語版・英語版の双方から、相互に参照する。** 片方向だけの指定は無効。

```html
<link rel="alternate" hreflang="ja" href="https://getodonata.com/company.html">
<link rel="alternate" hreflang="en" href="https://getodonata.com/en/company.html">
<link rel="alternate" hreflang="x-default" href="https://getodonata.com/company.html">
```

- **MUST**：`ja` / `en` / `x-default` の3つを設定する。
- **MUST**：`x-default` は日本語版を指す（主要市場が日本のため）。
- **MUST**：**両方のページに、同じ3行のセットを記述する。**
- **MUST**：hreflang の URL は絶対URL、かつ canonical と一致させる。
- **MUST**：対応する英語ページが存在しないページには、`en` の hreflang を書かない。

## 14-5. Language Switcher（MUST）

- ヘッダー右端の `.nav-lang` スロットに配置する。
- 表記は `日本語` / `English`。現在の言語に `aria-current="true"`。
- **ユーザーの言語環境だけを理由に、強制的にリダイレクトしない。**
- 切り替え先は同じ内容の対応ページ。存在しない場合はその言語のトップへ遷移させ、その旨を明示する。

## 14-6. 日英コンテンツの管理運用（MUST）

**日本語ページを追加・更新したとき、以下を順に確認する。** これを省略すると「日本語だけ新しく、英語版が古い」状態が生まれる。

```
1. 対応する英語ページが存在するか確認する
   └ 存在しない → 英語版を作るか、作らない判断を docs/refactor-notes.md に記録する
2. 英語版の更新要否を判断する
   └ 内容の変更（数値・事実・提供内容）→ 必ず更新する
   └ 表記ゆれの修正のみ → 英語版に該当箇所があるか確認する
3. metadata を更新する
   └ title / description / OGP / 構造化データ
4. hreflang を確認する
   └ 日英双方から相互参照できているか
   └ 新規ページなら3行セットを両方に追加したか
5. sitemap.xml を再生成する
   └ node tools/build-sitemap.mjs
6. 内部リンクを確認する
   └ 英語ページから日本語ページへのリンクが混ざっていないか
   └ 言語切替の遷移先が正しいか
```

- **SHOULD**：英語版の更新が保留になる場合、そのページの更新日と保留理由を `docs/refactor-notes.md` に記録し、次の改修時に必ず見直す。
- **MAY**：日英の差分を検出するスクリプト（`tools/build-i18n-check.mjs` 等）を作ってよい。CI で `--check` を回せると望ましい。

---

# 15. English Content Rules

## 15-1. 基本原則（MUST）

**英語版の制作は `Translation`（翻訳）ではなく、`Localization / Transcreation`（再構成）として扱う。**

日本語をそのまま逐語訳しない。日本語で伝えたい**意味・ブランド・提供価値**を理解したうえで、英語圏のユーザーに自然に伝わる文章へ再構成する。

## 15-2. 逐語訳してはいけないもの（MUST）

| 対象 | 理由 |
| --- | --- |
| Hero copy | 日本語の語感・リズムに依存しており、直訳すると意味不明になる |
| Mission / Vision | 抽象度が高く、直訳すると空虚な英語になる |
| Service description | 日本語の「伴走支援」等は英語に対応語がない |
| Feature / Benefit | 日本語は機能列挙になりがち。英語では Benefit を先に置く |
| CTA | 「資料請求」は英語圏の商習慣に対応しない |
| Case study | 語り口が異なる |
| Product terminology | 直訳すると業界用語と食い違う |

**参考：日本語 → 英語の対応の考え方（逐語訳しないための指針）**

| 日本語 | 直訳（使わない） | 意図に沿った英語（例） |
| --- | --- | --- |
| データ分析・伴走支援 | Data analysis and running-together support | Data Analysis & Advisory |
| 資料請求・お問い合わせ | Request materials / Inquiry | Contact Us / Get in touch |
| デモを見る | See the demo | See it in action / View demo |
| 複雑系アプローチ | Complex systems approach | Complex Systems Approach（用語として維持してよい） |
| 現場 | The site / the field | The coaching staff / on the ground |
| 使い方ガイド | How-to-use guide | User Guide |

> ※上表は方向性を示す例であり、確定訳ではない。実際の文言は英語版制作時に、ネイティブ話者のレビューを経て確定する。

## 15-3. 原文との意味的一致を守るもの（MUST）

以下は**創造的に書き換えず、原文と意味的に一致させる。**

- 固有名詞（Odonata、筑波大学蹴球部、メンバー名、所属機関名）
- 数値（約70%、約5%、約20%、約16pt、約5.6万日分）
- 実績・研究結果（Precision / Recall、対象傷害の限定、検証期間）
- 法的表現（プライバシーポリシー、利用規約、免責事項、決算公告）
- 出典・引用

**MUST**：数値には日本語版と同じ注記（対象・期間・指標名・限界）を必ず付ける。英語版で注記を省略しない。

## 15-4. 英語版で使ってはいけない表現（MUST）

- `AI predicts injuries` のような断定（→ `helps identify elevated injury risk`）
- `prevents injuries`（→ `supports earlier intervention`）
- `Our AI knows everything about your team`
- 根拠のない最上級（`the best`、`the most accurate`、`world-leading`）
- 日本語版に無い主張の追加

---

# 16. English Localization Scope

## 16-1. 英語化の対象範囲（MUST）

**本文だけを英語化することを禁止する。** 以下をすべて英語版として用意する。**英語ページ内に日本語UIが1箇所も残らないことを原則とする。**

| カテゴリ | 対象 |
| --- | --- |
| **ナビゲーション** | Header、グローバルナビ、ドロップダウン、Footer、Breadcrumb、Language switcher |
| **操作** | Button、CTA、リンクテキスト、Modal、Tooltip、Accordion の summary |
| **フォーム** | ラベル、プレースホルダ、必須表示、Validation メッセージ、Error、送信完了メッセージ |
| **メタデータ** | `title`、`description`、`canonical`、`hreflang`、OGP、X Card |
| **非表示テキスト** | `alt`、`aria-label`、`aria-describedby`、`<title>`/`<desc>`（SVG）、skip link |
| **構造化データ** | JSON-LD（`name`、`description`、`inLanguage`） |
| **システムページ** | 404 ページ、Cookie / プライバシー関連の表示 |
| **サイト構造** | sitemap.xml への `/en/` URL 追加 |
| **図解** | SVG 内の `<text>` を英語に差し替え（**画像に焼き込んでいないことが前提**） |

## 16-2. 実装上の注意（MUST）

- 日付・数値の表記形式を英語圏に合わせる（`2026年8月25日` → `August 25, 2026`）。
- 通貨表記を明示する（`個別見積` → `Custom quote`。金額を出す場合は `JPY` を明記）。
- `:lang(ja)` 限定の CSS（`word-break: auto-phrase`、`font-feature-settings: "palt"`）を英語版に適用しない（→ §5-5）。
- ボタン・ナビに固定幅を与えない（英語のほうが長くなる）。

---

# 17. Content Guidelines

## 17-1. 構成の原則（MUST）

- **1セクション＝1メッセージ。** 同じ内容を複数セクションで説明しない。
- **見出しだけを拾い読みして、ページの内容が把握できる**こと。
- **長文3段落より、1図＋1文。** 説明文が3行を超えたら、図解・プロダクト画面・表に置き換えられないか検討する。
- **Feature ではなく Benefit を明確にする。** 「ネットワーク分析ができます」ではなく「どの指標とどの指標がつながっているかが選手ごとに分かります」。

## 17-2. 文章のルール（MUST）

- 専門用語を必要以上に使わない。使う場合は、その場で意味が分かる補足を1文添える。
- 学術用語（創発、非線形性、バタフライ効果、More is different）は `approach.html` にのみ置き、TOP や サービスページに書かない。
- 冗長な説明を避ける。同じことを言い換えて繰り返さない。
- 終わりの見えない表現を避ける（「納得できるまで繰り返します」→「フィードバックに応じて調整します」）。
- CTA を明確にする。次に何をすればよいかが、各ページの末尾で分かること。

## 17-3. 数値・データの扱い（MUST）

**Odonata はデータ分析・スポーツ・科学的アプローチを扱う。数値の扱い方がブランドの信頼性そのものである。**

- **数値には必ず、対象・期間・指標名・限界を同じ視界に入る位置に併記する。**

  例：`約70%` を出すなら、`Precision（的中率）` というラベルと、
  `※筑波大学蹴球部の2022〜2025年のデータを用いた検証結果です。対象は筋肉系・非接触靱帯系・オーバーユース系の傷害に限ります。`
  を同じカード内に置く。

- **比較を行う場合は、比較軸を完全に揃える。** 「約14倍」のような倍率表現は、何と何を比べたのかが読み取れないため**単独で使わない。** `Precision 約5%（ACWR）→ 約70%（Odonata）／Recall はいずれも約20%` のように、指標名を明示した対比で書く。
- **自社に不利な事実を落とさない。** Recall が従来指標と同等であることを書かずに Precision だけを出すのは、実態より優位に見せる表現になる。
- **試算には前提をすべて書く。** 「約1,000万円」のような経済価値の試算には、母数・仮定・成功率をすべて明記する。
- 研究結果・統計には出典を付ける。
- 「自社の成果ではない数値」（従来指標 ACWR の約5%など）を、自社の成果と同じ大きさで並べない。

## 17-4. 避ける表現（MUST）

| 禁止 | 理由 |
| --- | --- |
| 「AIだからすごい」「AIがすべて判断」 | 手法の宣伝であって価値ではない。かつ科学的に不誠実 |
| 「データで全て分かる」 | 事実に反する |
| 「怪我を防げる」 | 予測は予防を保証しない。「予兆を捉える」「早めの介入を支える」と書く |
| 「業界初」「唯一」「最高精度」 | 検証できない断定 |
| 未確定の価格・時期の断定 | 後で下げられない。「個別見積」「準備中」と書く |
| 「株式会社Odonata」 | 未登記のため会社法7条に抵触するおそれ |

## 17-5. 事実の正確性（MUST）

- **手法の説明を誤って書かない。** 例：ネットワーク分析は「どの指標が中心にあるかを特定する」手法ではなく、「指標どうしの関係性・相関を見える化する」手法である。
- メンバーの経歴は、本人確認を経たもののみ掲載する。所属機関名・受賞・資格の掲載可否は本人の意思を確認する。
- 導入実績・顧客名は、許諾を得たもののみ掲載する。

---

# 18. Coding Standards

## 18-1. 技術スタック（現行・維持する）

| 項目 | 内容 |
| --- | --- |
| **構成** | 静的HTML。フレームワークなし |
| **ホスティング** | GitHub Pages（`CNAME` = `getodonata.com`） |
| **共通化** | `partials/*.html` を単一ソースとし、`tools/build-partials.mjs` で各HTMLへ同期 |
| **CSS** | `assets/site.css` 単一 + 各ページの `<style>` |
| **JS** | `site.js`（ナビ・年号）、`netbg.js`（背景）、`scrolly.js`、`hero2d.js`、`hero3d.js` |
| **外部ライブラリ** | **なし**（この状態を維持する） |
| **ビルド** | `tools/build-partials.mjs`、`tools/build-sitemap.mjs`（Node、依存なし） |

- **MUST**：フレームワーク（React / Vue / Next 等）を導入しない。導入は本書の改訂と、その判断根拠の記録を伴う。
- **SHOULD**：ビルドスクリプトは Node の標準モジュールのみで書き、`node_modules` を必要としない状態を維持する。

## 18-2. 共通パーツ（MUST）

```
partials/header.html     … 全ページ共通ヘッダー（必須）
partials/footer.html     … 全ページ共通フッター（必須）
partials/icons.html      … SVGアイコンスプライト（必須）
partials/analytics.html  … GA4 タグとクリック計測（マーカーがあるページのみ）
partials/acwr.html       … ACWR比較の共通ブロック（マーカーがあるページのみ）
```

- **MUST**：**マーカーの内側を直接編集しない。** `partials/*.html` を編集し、`node tools/build-partials.mjs` を実行する。

```html
<!-- #partial:header -->  ...ここは自動生成される...  <!-- /#partial:header -->
```

- **MUST**：新規ページには4つのマーカー（header / footer / icons / analytics）を設置する。
- **MUST**：コミット前に `node tools/build-partials.mjs --check` が通ることを確認する。
- **SHOULD**：`guide.html` / `philosophy.html` は現在同期対象外だが、**ヘッダー・フッターの二重管理になっている。** 将来的には同期対象に含める。

## 18-3. Semantic HTML

- **MUST**：§8-2 に従う。`<div>` だけで構造を作らない。
- **MUST**：意味に対応する要素を使う（`<nav>` `<section>` `<article>` `<figure>` `<figcaption>` `<table>` `<details>`）。

## 18-4. CSS

- **MUST**：色・サイズ・余白は `:root` のデザイントークンを使う。値を直接書かない。
- **MUST**：新しい色・余白・ブレークポイントを導入する前に、既存トークンで表現できないか確認する。
- **MUST**：新規に書くスタイルでは、意味で命名された `--color-*` / `--font-size-*` / `--space-*` を使う。短いエイリアス（`--sub` `--blue` 等）は既存コードとの互換のために残しているだけで、新規では使わない。
- **SHOULD**：クラス名は用途が分かる英小文字とハイフン（`.hero-offer`、`.analysis-card`、`.nav-actions`）。
- **SHOULD**：ページ固有の `<style>` が100行を超えたら、共通化できる部分を `site.css` へ昇格させる。
- **MUST**：`!important` を新たに追加しない。既存の `!important` を根拠なく増やさない。

## 18-5. JavaScript

- **MUST**：IIFE でスコープを閉じる（現行の書き方を維持）。
- **MUST**：インラインの `onclick` 属性を使わず、`addEventListener` で処理する。
- **MUST**：外部依存（gtag 等）が存在しない環境でもエラーにならないようガードする。

```js
if (typeof gtag === 'function') { gtag('event', name, params); }
```

- **MUST**：DOM要素の存在確認を必ず行う（`if (!el) return;`）。
- **MUST**：`matchMedia('(prefers-reduced-motion: reduce)')` を尊重する。
- **SHOULD**：JS が失敗してもコンテンツが読める状態を保つ（プログレッシブエンハンスメント）。

## 18-6. 命名・ファイル配置

| 種別 | ルール |
| --- | --- |
| HTML | ルート直下。英小文字とハイフン（`service-analysis.html`） |
| CSS / JS | `assets/` |
| 画像 | `assets/`。`photo-*` / `app-*` / `bg-*` / `icon-*` の接頭辞で用途を示す |
| レスポンシブ画像 | `<name>.webp` / `<name>.jpg` / `<name>@828.webp` / `<name>@828.jpg` |
| 共通パーツ | `partials/` |
| ビルドスクリプト | `tools/` |
| ドキュメント | `docs/` |

## 18-7. コメント

- **MUST**：「なぜそうしているか」を書く。「何をしているか」はコードから読めるので書かない。
- **MUST**：制約に基づく実装（例：ホバーで `border-width` を変えない理由）には、その理由をコメントに残す。現行の `site.css` はこの点で良い状態にある。
- **SHOULD**：コメントは日本語で書く。

## 18-8. ハードコーディング・環境変数

- **MUST**：測定ID（`G-X3FK9YCZG5`）は `partials/analytics.html` の1ファイルのみで管理する。各HTMLに直接書かない。
- **MUST**：本番URL（`https://getodonata.com`）は `tools/build-sitemap.mjs` の `ORIGIN` と、canonical / OGP / hreflang でのみ使う。
- **MUST**：秘密情報（APIキー、パスワード、個人のメールアドレス）をリポジトリにコミットしない。

## 18-9. デッドコード

- **MUST**：使われなくなったファイル・クラス・関数を残さない。削除する。
- **MUST**：参照されなくなった画像はファイルごと削除する。
- **MUST**：削除前に、リポジトリ全体を grep して参照が残っていないことを確認する。

---

# 19. Rules for Claude Code / AI

**この章は、Claude Code がこのリポジトリを編集する際の行動規範である。作業開始前に必ず読むこと。**

## 19-1. 応答が途中で止まらないための制約（MUST）

過去に、大きな指示書をプロンプトに貼り、1応答でページ全体を書き直そうとして `API Error: The response stopped arriving.` が発生している。以下を必ず守る。

- **既存ファイルを `Write` で全体書き直ししない。必ず `Edit` による部分置換で行う。** `Write` は新規ファイル作成時のみ。
- 1回の応答で書き出すコードは、**最大でも1ファイルの1セクションまで。**
- 複数の作業項目がある場合、**1項目ずつ処理し、項目ごとにコミットする。**
- 巨大なファイルを丸ごと読み込まない。必要な行範囲だけを読む。
- 同じエラーが3回続いたら、それ以上リトライせず、状況を報告して止まる。

## 19-2. Git の規律（MUST）

1. 作業開始前に必ず `git pull --rebase origin main` を実行する。
2. コンフリクトが出たら勝手に解決せず、内容を報告して指示を待つ。
3. 1タスク＝1コミット。関係ないファイルを触らない。
4. コミットメッセージは日本語で、何をしたかが分かる形にする。
5. 作業完了後、`git add -A && git commit && git push origin main` まで実行する。push が失敗したら再度 `pull --rebase` してから push し直す。
6. **破壊的な操作（`git reset --hard`、`git push --force`、ファイル削除）は事前に許可を取る。**

## 19-3. 修正前に確認すること（MUST）

- [ ] このガイドライン（本書）の該当章
- [ ] `docs/design-tokens.md`（色・サイズ・余白の既存定義）
- [ ] `docs/refactor-notes.md`（過去の判断と残課題）
- [ ] 同じUIが `partials/` で共通化されていないか
- [ ] 同じ文言・数値が他のページにも存在しないか（grep）
- [ ] 日本語版／英語版の両方への影響
- [ ] 変更対象が `<!-- #partial:* -->` マーカーの内側でないか（内側なら `partials/` を編集する）

## 19-4. 修正時に守ること（MUST）

- 変更は**最小限**にする。指示された範囲を超えて「ついでに直す」ことをしない。気づいた問題は作業後に「気づいた点」として報告するだけにする。
- 既存のクラス名・デザイントークン・CSS変数を必ず再利用する。**新しい命名規則を勝手に増やさない。**
- 新しい依存関係（ライブラリ、フォント、外部スクリプト）を追加しない。
- アクセシビリティを損なわない（特にフォーカスリング、見出し階層、`alt`）。
- レスポンシブを壊さない。
- SEO を壊さない（`title` / `description` / `canonical` / 見出し階層 / 内部リンク）。
- 数値を変更する場合、**注記も同時に確認する。** 数値だけ変えて条件が古いまま残る状態を作らない。

## 19-5. 修正後に確認すること（MUST）

- [ ] Desktop（1280px / 1920px）で崩れていないか
- [ ] Mobile（390px）とタブレット（768px）で崩れていないか
- [ ] ブラウザのコンソールにエラーが出ていないか
- [ ] リンク切れがないか（特にアンカーリンクの遷移先 `id` が実在するか）
- [ ] キーボードのみで新しく触った箇所を操作できるか
- [ ] 変更した色の組み合わせのコントラスト比を計算したか
- [ ] `node tools/build-partials.mjs --check` が通るか
- [ ] ページを増減したなら `node tools/build-sitemap.mjs` を実行したか
- [ ] `title` / `description` / `canonical` / OGP に漏れがないか
- [ ] 日本語版と英語版の内容が乖離していないか

## 19-6. 報告のしかた（MUST）

作業完了時に、以下を必ず報告する。

- 変更したファイルの一覧
- 変更内容の before / after（文言変更の場合は表形式）
- 計算したコントラスト比（色を変えた場合）
- 実行できなかった確認と、その理由
- 判断が必要な事項

**MUST**：確認していないことを「確認した」と書かない。ブラウザを持たない環境では Lighthouse や表示確認は実行できない。その場合は**実行できないことを明示し、人間に依頼する。**

---

# 20. Do Not

以下は**すべて MUST NOT** である。

## デザイン・ブランド

- [ ] 根拠なくデザインを全面変更しない
- [ ] ブランドカラーを勝手に変更しない
- [ ] フォントを勝手に追加・変更しない
- [ ] 同じカードコンポーネントを、意味の異なるものに使い回さない
- [ ] カードの高さを `min-height` で固定して余白で埋めない
- [ ] Philosophy をファーストビューのメインメッセージに置かない

## アクセシビリティ

- [ ] `outline: none` でフォーカスリングを消さない
- [ ] `<div>` だけで構造を作らない
- [ ] 見出しレベルを飛ばさない
- [ ] 文字を大きくする目的で見出しタグを使わない
- [ ] 色だけで情報を伝えない
- [ ] `alt` を省略しない
- [ ] `user-scalable=no` を書かない
- [ ] 「デザイン上の理由」でアクセシビリティを犠牲にしない
- [ ] 字間調整のために全角スペースを文字の間に挟まない

## レイアウト・実装

- [ ] `word-break: break-all` を日本語テキストに使わない
- [ ] ホバーで `padding` / `border-width` / `font-weight` / `font-size` を変えない
- [ ] `body { overflow-x: hidden }` で横スクロールを誤魔化さない
- [ ] 新しいブレークポイントを無秩序に追加しない
- [ ] `!important` を根拠なく増やさない
- [ ] マーカー（`<!-- #partial:* -->`）の内側を直接編集しない
- [ ] 不要なライブラリを追加しない
- [ ] PC だけ確認して終了しない

## コンテンツ

- [ ] 根拠のない断定をしない（「怪我を防げる」「AIで全て分かる」）
- [ ] 数値を条件なしで出さない
- [ ] 比較軸の揃っていない比較（「約14倍」等）をしない
- [ ] 自社に不利な事実（Recall が同等であること等）を落とさない
- [ ] 手法の説明を誤って書かない（ネットワーク分析＝中心の特定、ではない）
- [ ] 未確定の価格・時期を確定として書かない
- [ ] 「株式会社Odonata」と表記しない（未登記のため）
- [ ] 生成画像を実在の写真として提示しない

## SEO

- [ ] SEO目的のキーワード詰め込みをしない
- [ ] `title` / `description` を全ページで使い回さない
- [ ] 既存URLを理由なく変更しない
- [ ] `sitemap.xml` を手書きしない（`tools/build-sitemap.mjs` を使う）
- [ ] Search Console のサイトマップ欄にページURLを入れない
- [ ] `robots.txt` に安易に `Disallow:` を書かない

## パフォーマンス

- [ ] 画像を無制限に高解像度で読み込まない（1枚300KB以下）
- [ ] `width` / `height` のない `<img>` を置かない
- [ ] ファーストビュー外の画像に `loading="lazy"` を付け忘れない
- [ ] 見た目のためだけにパフォーマンスを大幅に犠牲にしない

## 多言語

- [ ] 日本語だけ修正して英語版への影響を無視しない
- [ ] 英語版を機械的に逐語訳しない
- [ ] 英語ページ内に日本語UIを残さない
- [ ] 日本語ページと英語ページを同一 canonical にしない
- [ ] ユーザーの言語環境だけを理由に強制リダイレクトしない
- [ ] 図解の文字を画像に焼き込まない（英語化できなくなる）

---

# 21. QA Checklist

**実装完了時に、Claude Code または人間が使用するチェックリスト。**

## Design

- [ ] デザイントークン（`:root`）の値のみを使っている。直接指定の色・サイズがない
- [ ] 同じ意味のUIが、サイト内で同じ見た目になっている
- [ ] 横並びのカードの高さ・内部要素の縦位置が揃っている
- [ ] 意味の異なるものに、同じカードコンポーネントを使い回していない
- [ ] 余白がトークン（`--space-*`）またはその倍数になっている
- [ ] 区切り線の上下マージンが 40px 以上ある
- [ ] ホバーで周囲の要素が動かない

## Responsive

- [ ] 390 / 768 / 1024 / 1280 / 1920px の5幅で崩れがない
- [ ] どの幅でも横スクロールバーが出ない
- [ ] 日本語が1〜2文字ずつ折り返している箇所がない
- [ ] SP で表が縦積みに切り替わる
- [ ] SP で円環図が縦一列に切り替わる
- [ ] SP のファーストビューで、提供価値と第1CTAが分かる
- [ ] 200% 拡大で文字が重ならない・切れない

## Accessibility

- [ ] Lighthouse（Accessibility）が 95 以上
- [ ] `Tab` のみで全機能を操作でき、移動順が視覚順と一致する
- [ ] すべてのフォーカス可能要素に黄＋黒の2重リングが見える
- [ ] `outline: none` の単独使用がない
- [ ] `h1` が1ページに1つ、見出しレベルの飛びがない
- [ ] すべての `<img>` に適切な `alt` がある（装飾は `alt=""` + `aria-hidden`）
- [ ] 変更した色の組み合わせが 4.5:1（大きい文字は 3:1）以上
- [ ] 色だけで情報を伝えている箇所がない
- [ ] リンクテキスト単体で行き先が分かる
- [ ] 現在地のナビに `aria-current="page"` がある
- [ ] `prefers-reduced-motion: reduce` で全アニメーションが止まる
- [ ] タップ対象が 44 × 44px 以上
- [ ] フォームのすべての入力欄に `<label for>` がある
- [ ] エラーメッセージが `role="alert"` / `aria-live` で通知される

## SEO

- [ ] `title` が固有で、`｜Odonata` 形式
- [ ] `description` が固有で、全角120文字前後
- [ ] `canonical` が絶対URLで設定されている
- [ ] OGP（`og:title` / `og:description` / `og:url` / `og:image` / `og:type` / `og:site_name` / `og:locale`）がある
- [ ] `twitter:card` がある
- [ ] 見出し階層が正しい
- [ ] 孤立ページがない
- [ ] ページを増減したなら `sitemap.xml` を再生成した
- [ ] 構造化データにエラーがない（リッチリザルトテスト）
- [ ] `noindex` を公開ページに付けていない

## Performance

- [ ] すべての `<img>` に `width` / `height` がある
- [ ] ファーストビュー外の画像に `loading="lazy"` がある
- [ ] Hero 主画像に `fetchpriority="high"` があり、lazy が付いていない
- [ ] 画像が WebP + `<picture>` で配信されている
- [ ] 1枚 300KB 以下
- [ ] 新しい外部ライブラリを追加していない
- [ ] Lighthouse（Performance）でスコアが劣化していない
- [ ] CLS が 0.1 以下

## Japanese

- [ ] `word-break: break-all` を使っていない
- [ ] 本文1行が全角40文字以内
- [ ] `line-height` が 1.5 以上
- [ ] 段落間が行送りの 1.5 倍以上
- [ ] 本文15px・注記12px を下回っていない
- [ ] 字間調整のための全角スペースがない
- [ ] 「スポーツ」と「サッカー」の使い分けが意図どおり

## English / Localization

- [ ] `<html lang="en">` になっている
- [ ] hreflang（`ja` / `en` / `x-default`）が日英双方から相互参照している
- [ ] canonical が自ページを指している（日本語版と同一にしていない）
- [ ] 逐語訳になっていない（Hero / Mission / Service / CTA）
- [ ] 数値・固有名詞・研究結果・法的表現が原文と意味的に一致している
- [ ] 数値の注記が省略されていない
- [ ] ページ内に日本語UIが残っていない（`alt` / `aria-label` / エラーメッセージ含む）
- [ ] Language switcher が正しい対応ページへ遷移する
- [ ] 日付・通貨の表記形式が英語圏に合っている
- [ ] `sitemap.xml` に `/en/` の URL が含まれている

## Content

- [ ] 1セクション1メッセージになっている
- [ ] 見出しだけで内容が把握できる
- [ ] 数値に対象・期間・指標名・限界が併記されている
- [ ] 比較の軸が揃っている
- [ ] 自社に不利な事実を落としていない
- [ ] 根拠のない断定がない
- [ ] 研究結果に出典がある
- [ ] 手法の説明が事実として正しい
- [ ] CTA が「デモを見る」「資料請求・お問い合わせ」の2種類のみ
- [ ] 「ダウンロード」という語とアイコンを使っていない

## Code Quality

- [ ] `node tools/build-partials.mjs --check` が通る
- [ ] マーカーの内側を直接編集していない
- [ ] 新しいクラス名・トークンを不必要に増やしていない
- [ ] `!important` を増やしていない
- [ ] インラインの `onclick` を使っていない
- [ ] 外部依存にガードがある（`typeof gtag === 'function'`）
- [ ] 使われなくなったファイル・クラス・画像を削除した
- [ ] 秘密情報をコミットしていない

## Analytics

- [ ] `partials/analytics.html` が全ページに同期されている
- [ ] 測定IDが1種類しか存在しない
- [ ] `click_demo` / `click_contact` / `click_login` / `generate_lead` が発火する
- [ ] GA4 のリアルタイムレポートでイベントを確認した
- [ ] 新しいCTAを追加したなら、計測対象に含めた

## Final QA

- [ ] ブラウザのコンソールにエラーが出ていない
- [ ] リンク切れがない（アンカーの遷移先 `id` が実在する）
- [ ] 全ページでヘッダー・フッターが一致している
- [ ] 変更内容を `docs/refactor-notes.md` に記録した
- [ ] 判断が必要な残課題を明示した
- [ ] `git push` まで完了した

---

# 22. Current Site Audit

**監査日：2026-08-25 ／ 対象コミット：`main` HEAD ／ 監査方法：リポジトリ全ファイルの静的解析**

## 22-1. すでに準拠しているもの（維持する）

| 項目 | 状態 |
| --- | --- |
| **デザイントークン** | `:root` に意味で命名されたトークンが整備済み。`docs/design-tokens.md` にコントラスト比まで記載されている。**同規模のサイトとしては非常に良い状態** |
| **文字色の制限** | 文字に使ってよい6色を明示し、`--color-primary`（2.91:1）を文字禁止と明記している。運用ルールとして優れている |
| **フォーカスリング** | `:focus-visible{outline:2px solid #1A1A1C; box-shadow:0 0 0 4px #FFDF3F}`。DADS のフォーカスカラー（Yellow-300 + Black の2重構造）に準拠 |
| **`outline: none`** | 全ファイルで **0件** |
| **`lang` 属性** | 全14ページで `lang="ja"` |
| **`h1`** | 全14ページで**ちょうど1つ** |
| **`<main>`** | `kessan.html` を除く全ページに設置 |
| **見出し階層** | 全ページでレベルの飛び **0件** |
| **`alt` 属性** | `alt` 欠落 **0件**（全67枚） |
| **skip link** | `.skip-link`（本文へスキップ）を設置済み |
| **`prefers-reduced-motion`** | CSS 2箇所 + `netbg.js` + `site.js` で対応 |
| **日本語組版** | `word-break:auto-phrase` / `text-wrap:balance,pretty` / `line-break:strict` / `font-feature-settings:"palt"` を適用 |
| **ホバー時のレイアウト固定** | 枠線を常時 `1.5px solid transparent` にし、`transform` のみで動かす設計が CSS コメントで明文化されている |
| **共通パーツの単一ソース化** | `partials/` + `tools/build-partials.mjs`（`--check` で CI 可能）。マーカー方式で二重管理を防いでいる |
| **`canonical`** | `kessan.html` を除く全13ページに設置、絶対URL |
| **`title` / `description`** | 全ページで固有。「サッカー」を含む設計になっている |
| **`sitemap.xml` / `robots.txt`** | 設置済み。`tools/build-sitemap.mjs` で生成、`--check` 対応 |
| **構造化データ** | TOP に `Organization`。`alternateName` に「オドナータ」を含む |
| **GA4** | `partials/analytics.html` で単一ソース管理。クリック計測を `addEventListener` で集中管理し、`gtag` 未定義をガードしている |
| **多言語の下準備** | `partials/header.html` に `.nav-lang` スロットを確保済み |
| **外部ライブラリ** | **0件**。パフォーマンス上きわめて有利 |
| **`noindex` の運用** | `kessan.html` に `noindex,nofollow,noarchive` を付け、sitemap から除外している |

## 22-2. 優先的に修正すべきもの（High）

| # | 項目 | 現状 | あるべき姿 | 参照 |
| --- | --- | --- | --- | --- |
| **H1** | **OGP / X Card が全14ページで0件** | `og:` タグが1つも存在しない | 全ページに OGP 7項目 + `twitter:card`。OG画像（1200×630）を1枚用意 | §13-7 |
| **H2** | **`width` / `height` が `index.html` の5件のみ** | 他13ページの `<img>` に寸法属性がなく、CLS のリスク | すべての `<img>` に `width` / `height` | §10-4 / §12-1 |
| **H3** | **`<picture>` / WebP が `index.html` のみ** | 他ページは PNG / JPG を直接参照。`service-platform.html` は18枚 | 全ページで `<picture>` + WebP + `srcset` | §10-4 |
| **H4** | **`loading="lazy"` が不均一** | `approach` 0/2、`company` 0/3、`contact` 0/2、`pricing` 0/2、`news` 0/2、`philosophy` 0/6 | ファーストビュー外のすべての画像に付与 | §10-4 |
| **H5** | **未参照の重いPNG 10本が残存** | `photo-*.png`（各1.5〜1.9MB）、`app-risk-full.png`、`odonata-full.png` 等。合計約 **14MB** | 参照が無いファイルは削除。clone とデプロイの負荷を減らす | §18-9 |
| **H6** | **Breadcrumb が0件** | 全ページで未実装。下層からの現在地が分からない | 全下層ページに設置 + `BreadcrumbList` 構造化データ | §7-9 / §13-6 |
| **H7** | **`aria-current` が0件** | 現在地のナビをクラス（`box-shadow`）のみで表現。スクリーンリーダーに伝わらない | `aria-current="page"` を付与 | §7-1 / §8-5 |

## 22-3. 改善余地があるもの（Medium）

| # | 項目 | 現状 | あるべき姿 | 参照 |
| --- | --- | --- | --- | --- |
| **M1** | **ブレークポイントの散乱** | 20種類以上（900 / 760 / 820 / 560 / 860 / 780 / 880 / 1023 / 640 / 1000 / 767 / 720 / 680 / 960 / 980 / 920 / 520 / 440 / 1180 / 840px） | `560 / 768 / 1024 / 1180` の4つに統一。既存は触るファイルから順次寄せる | §4-4 |
| **M2** | **ページ固有 `<style>` の肥大** | `index.html` 412行、`guide.html` 209行、`service-platform.html` 195行、`service-analysis.html` 177行、`philosophy.html` 171行 | 共通化できるものを `site.css` へ昇格。目安100行以内 | §12-5 / §18-4 |
| **M3** | **`guide.html` / `philosophy.html` が partial 同期の対象外** | ヘッダー・フッターが二重管理になっている | 同期対象に含める。独自スタイルは `<style>` で上書きする | §18-2 |
| **M4** | **`contact.html` のフォーム** | `<label>` 8件に対し `for=` は7件（1件不足）。`aria-describedby` 0件。送信は `mailto:` の暫定実装 | すべての label に `for`。入力形式の説明を `aria-describedby` で関連付け。送信方式を確定させ、プライバシーポリシーに反映 | §7-4 |
| **M5** | **構造化データが `index.html` のみ** | 下層ページに JSON-LD なし | `BreadcrumbList` を全下層に。`WebSite` を TOP に追加 | §13-6 |
| **M6** | **`404.html` が存在しない** | GitHub Pages のデフォルト404が表示される | サイトのヘッダー・フッターを持つ 404 ページを作る | §16-1 |
| **M7** | **`README.md` が31バイト** | 「# Odonata / odonata's homepage」のみ | 技術スタック、ビルドコマンド、本ガイドラインへの参照を書く | — |
| **M8** | **`CLAUDE.md` が存在しない** | `WORK_PLAN.md` はあるが、作業ルールのファイルがない | 本ガイドラインへの参照と §19 の要約を置く | §19 |
| **M9** | **`.gitignore` が存在しない** | OS の生成ファイル等がコミットされ得る | 最低限 `.DS_Store` / `Thumbs.db` / `node_modules/` を除外 | — |

## 22-4. 将来対応（Low / Phase 3）

| # | 項目 | 内容 |
| --- | --- | --- |
| **L1** | **英語版 `/en/`** | 本書 §14〜16 に従って構築。図解の SVG 化が前提条件（現時点で図解は SVG / HTML 実装のため条件は満たしている） |
| **L2** | **Language switcher の実装** | `.nav-lang` スロットに配置。スロットは確保済み |
| **L3** | **ニュース個別記事ページ** | `/news/{slug}.html`。`Article` 構造化データ、前後記事、関連記事 |
| **L4** | **導入クラブの実名事例ページ** | 許諾取得後 |
| **L5** | **実証現場の実写真** | 撮影・掲載許諾を取得し、生成画像と差し替え、「※写真はイメージです」を外す |
| **L6** | **i18n 差分チェックスクリプト** | `tools/build-i18n-check.mjs`。日英のページ有無と更新日の乖離を検出 |

## 22-5. 監査サマリ

**全体として、静的HTMLサイトとしてはかなり整った状態にある。** 特にデザイントークンの整備、フォーカスリングの DADS 準拠、共通パーツの単一ソース化、日本語組版への配慮、外部ライブラリ0件という構成は、そのまま維持すべき資産である。

一方で、**ソーシャル共有（OGP）とパフォーマンス（画像の寸法属性・WebP・lazy）に体系的な抜けがある。** これらは1ページずつ手作業で入れてきた結果、`index.html` だけが最新で他ページが取り残された形になっている。**H1〜H5 は機械的に一括対応できる性質のものなので、次回の改修でまとめて処理することを推奨する。**

また、ブレークポイントの散乱とページ固有 `<style>` の肥大（M1・M2）は、今後ページを増やすほど保守コストが増える種類の負債である。**急ぐ必要はないが、触るファイルから順に寄せていく**運用を推奨する。

---

# 23. References

各章のルールが、どの公式原則に基づいているかを追跡するための対応表。

## 23-1. 公式資料

| 資料 | URL |
| --- | --- |
| デジタル庁 ウェブサイトガイドライン | https://www.digital.go.jp/resources/govdesign |
| デジタル庁 デザインシステム（DADS） | https://design.digital.go.jp/dads/ |
| DADS｜カラー | https://design.digital.go.jp/dads/foundations/color/ |
| DADS｜タイポグラフィ（アクセシビリティ） | https://design.digital.go.jp/dads/foundations/typography/accessibility/ |
| デジタル庁 ウェブアクセシビリティ導入ガイドブック（DS-671.2） | https://www.digital.go.jp/resources/introduction-to-web-accessibility-guidebook |
| W3C WCAG 2.2 | https://www.w3.org/TR/WCAG22/ |
| WCAG 2.2 日本語訳（WAIC） | https://waic.jp/translations/WCAG22/ |
| JIS X 8341-3:2016 | https://waic.jp/knowledge/jis-x-8341-3/ |
| Google Search Essentials | https://developers.google.com/search/docs/essentials |
| Google SEO スターターガイド | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| Google 多言語・多地域サイト | https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites |
| Google hreflang（言語や地域のURL） | https://developers.google.com/search/docs/specialty/international/localized-versions |
| Google 構造化データ全般 | https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data |
| Core Web Vitals | https://web.dev/articles/vitals |
| web.dev（パフォーマンス） | https://web.dev/ |
| WHATWG HTML Living Standard | https://html.spec.whatwg.org/multipage/ |
| schema.org | https://schema.org/ |
| リッチリザルトテスト | https://search.google.com/test/rich-results |
| Google Search Console | https://search.google.com/search-console |

## 23-2. ルールと公式原則の対応

| 本書の章 | 主な根拠 |
| --- | --- |
| §2 Brand Principles | Odonata 独自（サービス資料 `Odonata_サービス資料_2026.8〜_v1.pptx`、事業戦略） |
| §3 Information Architecture | デジタル庁 ウェブサイトガイドライン（利用者中心設計・情報設計）／ Odonata 独自 |
| §4 Layout & Grid | DADS（レスポンシブ設計）／ 現行 `assets/site.css` から抽出 |
| §5 Typography | DADS タイポグラフィ（行間1.5以上、段落間は行送りの1.5倍以上、1行は全角40文字程度、文字画像を使わない）／ 現行実装から抽出 |
| §6 Color System | WCAG 2.2 SC 1.4.3（コントラスト）／ SC 1.4.11（非テキストのコントラスト）／ SC 1.4.1（色のみに依存しない）／ DADS カラー（テキスト4.5:1以上、非テキスト3:1以上、フォーカスカラーは Yellow-300 と Black の2重構造） |
| §7 Components | DADS コンポーネント設計・一貫性／ WHATWG HTML Living Standard（要素の意味） |
| §8 Accessibility | WCAG 2.2 AA 全般／ JIS X 8341-3:2016／ デジタル庁 ウェブアクセシビリティ導入ガイドブック |
| §9 Responsive Design | DADS レスポンシブ設計／ WCAG 2.2 SC 1.4.10（リフロー）／ SC 1.4.4（テキストのサイズ変更） |
| §10 Images & Visuals | WCAG 2.2 SC 1.1.1（非テキストコンテンツ）／ web.dev（画像最適化）／ Odonata 独自（ブランド上の制約） |
| §11 Animation & Interaction | WCAG 2.2 SC 2.3.1（3回の閃光）／ SC 2.2.2（一時停止）／ SC 2.3.3（インタラクションによるアニメーション）／ Core Web Vitals（CLS） |
| §12 Performance | Core Web Vitals（LCP / INP / CLS）／ web.dev |
| §13 SEO | Google Search Essentials／ Google SEO スターターガイド／ schema.org |
| §14 Internationalization | Google 多言語・多地域サイト／ Google hreflang ドキュメント／ WHATWG HTML（`lang` 属性） |
| §15–16 English Content | Odonata 独自（ブランド・事業戦略）／ Google Search Essentials（自動生成された低品質コンテンツの回避） |
| §17 Content Guidelines | Google Search Essentials（有用で信頼性の高いコンテンツ）／ Odonata 独自（科学的誠実さ） |
| §18 Coding Standards | WHATWG HTML Living Standard／ 現行リポジトリ構成から抽出 |
| §19 Rules for Claude Code | Odonata 独自（過去の運用実績と失敗事例に基づく） |

## 23-3. 社内資料

| 資料 | 場所 |
| --- | --- |
| デザイントークン一覧 | `docs/design-tokens.md` |
| 改修メモ・残課題 | `docs/refactor-notes.md` |
| 作業台帳 | `WORK_PLAN.md` |
| サービス資料 | `Odonata_サービス資料_2026.8〜_v1.pptx`（別リポジトリ） |
| Web改修指示書 v1 | `起業プロジェクト/Odonata_Web改修指示書_v1.md`（IA・競合比較・法人名表記の根拠） |

---

**本ガイドラインの改訂履歴**

| Version | Date | 変更内容 |
| --- | --- | --- |
| 1.0 | 2026-08-25 | 初版。リポジトリ全ファイルの静的解析に基づき作成 |
