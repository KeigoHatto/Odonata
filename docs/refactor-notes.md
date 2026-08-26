# 現状棚卸しメモ（Phase 0）

調査日：2026-08-18 ／ 対象：getodonata.com（本リポジトリ）

---

## 1｜リポジトリの構成

| 項目 | 内容 |
| --- | --- |
| 形式 | **静的HTML**（フレームワーク・ビルドツールなし） |
| TOPページ | `index.html` |
| CSS | 素のCSS。共通は `assets/site.css`、ページ固有は各HTMLの `<style>` 内 |
| JS | `assets/site.js`（ナビ・Dropdown・reveal）、`assets/netbg.js`（背景ネットワーク）、`assets/scrolly.js`、`assets/hero2d.js` / `hero3d.js`（現在未使用） |
| 共通コンポーネント | `partials/header.html` / `footer.html` / `icons.html` を単一ソースとし、`tools/build-partials.mjs` が各HTMLの `<!-- #partial:name -->` マーカー間へ同期する |
| 対象外ページ | `guide.html` / `philosophy.html` は独自CSSの単独ページ。共通ヘッダーの同期対象外 |

**確認コマンド**：`npm` は未使用。ローカル確認は任意の静的サーバで可（例：`npx serve .` または VS Code の Live Server）。

---

## 2｜TOPページのセクション一覧（Phase 0 時点）

| # | 見出しテキスト | 実体（index.html の行） | 役割 |
| --- | --- | --- | --- |
| 1 | スポーツに、もっと多様な正解を。（h1） | 310 `<section class="hero" id="top">` | ファーストビュー |
| 2 | Odonataについて | 361 `id="about"` | 会社紹介・会社情報への導線 |
| 3 | Odonataがつなぐもの | 380 `id="sources"` | 対象データの提示 |
| 4 | 何を分析できるのか | 400 `id="usecases"` | 分析ユースケース3枚 |
| 5 | なぜ、複数のデータを横断して見るのか。 | 483 `id="why"` | 複雑系アプローチ |
| 6 | 事業内容 | 530 `id="services"` | 2事業（分析／プラットフォーム） |
| 7 | データを意思決定につなげるサイクル | 574 `id="cycle"` | 循環図 |
| 8 | 筑波大学蹴球部で、実証しています。 | 633 `id="proof"` | 実証成果 |
| 9 | 研究と現場と実装が、同じチームの中にあります。 | 677 `id="team"` | 体制・メンバー |
| 10 | 小さく始めて、現場と一緒に育てる。 | 724 `id="process"` | 導入の流れ |
| 11 | ニュース | 753 `id="news"` | 最新3件 |
| 12 | （CTA） | 782 `class="cta-band"` | 資料請求・デモ |

**Phase 1 で必要な並べ替え**：`sources`（つなぐもの）と `services`（事業内容）の位置を入れ替え、
`Hero → About → Service → Analysis → Approach → Connect → Cycle → Proof → Team → Process → News → CTA` にする。

---

## 3｜指定文字列の所在（grep 結果）

| 文字列 | 所在 |
| --- | --- |
| すでにある過去データを分析する | index.html（Heroサービスカード1） |
| 毎日使うWebアプリとして届ける | index.html（Heroサービスカード2） |
| Odonataについて | index.html（Aboutセクション h2・本文） |
| その記録をつなぎ直して分析し | index.html（About本文） |
| Odonataがつなぐもの | index.html（Connectセクション h2） |
| 別々の場所に置かれていた記録を、同じ選手・同じ時間軸で並べ直します | index.html（Connectセクション リード） |
| すでにあるデータから始められます | index.html（Connectセクション 注記） |
| 研究／現場／実装 | index.html（Teamセクション `.pillar`） |
| 約70% / 約20% | index.html（Analysisカード1・Proofセクション）、research.html、service-analysis.html |
| 小さく始めて | index.html（Processセクション h2） |
| STEP 1 | index.html（Process）、pricing.html、contact.html |

---

## 4｜ファーストビューの実装

- **背景のネットワーク表現**：`assets/netbg.js` による **Canvas** 描画。`<canvas class="netbg">` を持つ要素に適用。
  `data-density` で粒度を調整。Hero／Connect／Approach の3箇所に設置。
- **Hero画像**：`assets/photo-hero-tablet.png`（主）と `assets/photo-analysis-desk.png`（副）を重ねて配置。
- **角丸の指定箇所**：`.hero-photo{border-radius:16px}` — Phase 3 で直角化の対象。
  他に `.about-photo` `.an-photo` `.pf-photo` も `border-radius` を持つ。
- **アニメーション**：`netbg.js` は `requestAnimationFrame` で常時描画。
  `prefers-reduced-motion: reduce` のとき **座標更新を止めて静止描画** にしている（描画ループ自体は停止）。
  **未対応**：タブ非表示時（`document.visibilityState`）の停止、モバイルでのノード数削減。→ Phase 3 で対応。

---

## 5｜アクセシビリティ 簡易チェック（Phase 0 時点・未修正）

| 項目 | 結果 |
| --- | --- |
| `outline: none` の単独使用 | **1件**：`assets/site.css:344` フォーム入力欄の `:focus`。→ Phase 7 で修正 |
| `alt` 欠落の `img` | なし（全ページ確認済み） |
| 見出しレベルの飛び | なし。ただし `approach.html` / `philosophy.html` は h1 を後付けで付与済みのため Phase 1・7 で再確認 |
| `user-scalable=no` / `maximum-scale` | **なし**（問題なし） |
| 文脈依存リンク（「詳しくはこちら」等） | `news.html:153` の「詳しくは…ページをご覧ください」はリンクテキストが「複雑系アプローチ」で自立しており問題なし。`guide.html:1270` の「詳しくはお問い合わせください」はリンクではないテキスト。→ 実害なし |
| ページタイトルの形式 | 現在は「ページ名 — Odonata」（em dash）。指示書の「ページ名｜Odonata」形式と不一致。→ Phase 7 で統一 |
| `service-platform.html` のタイトル | 「データプラットフォーム「Odonata」 — 散らばるデータを、ひとつに」→ 形式から外れている。Phase 7 で修正 |
| 薄いグレー文字 | `--sub:#41616F`（白背景でコントラスト比 約6.2:1）は基準を満たす。ダーク面の `--sub:#C9D4E5` も可。→ Phase 7 で実測して確認 |
| フォーカスリング | 現在は `outline:2px solid var(--blue)` のみ。指示書の「黄+黒の2重リング」に未対応。→ Phase 7 で対応 |
| スキップリンク | **未設置**。→ Phase 7 で追加 |

---

## 6｜次フェーズ以降への申し送り

- Phase 1：`sources` と `services` の入れ替え、全 `<section>` への `aria-labelledby` 付与、`#cycle` の空箱化。
- Phase 3：`border-radius` の直角化はページ全体の写真に波及するため、Hero 内に限定して適用する。
- Phase 5：`約70%` は index.html / research.html / service-analysis.html の3箇所にあるため、表記を揃える必要がある。
- Phase 7：ページタイトルの区切り文字を `—` から `｜` に統一する際、全13ページを一括で変更する。

---

## 7｜次回対応リスト（Phase 0〜8 で扱わなかったもの）

| # | 項目 | 内容 |
| --- | --- | --- |
| 1 | Lighthouse / axe の実測 | 本作業環境にブラウザ実行系がないため、スコアの実測ができていない。**人の手で Chrome DevTools の Lighthouse と axe DevTools を全9ページに実行し、violations を確認する必要がある。** 本作業では代わりに、指示書のチェックリストを静的解析（alt・h1・main・title・skip・focus・タグ整合・リンク・アンカー・コントラスト比の計算）で全ページ検証している |
| 2 | ブラウザでの表示確認 | 1440 / 1280 / 1024 / 768 / 390px の実表示、200%拡大、キーボードのみの通し操作は未実施。特に Hero の bleed（1025px以上）と循環図のSP切り替え（760px以下）を確認したい |
| 3 | Hero の案A / 案B の選択 | 案Aを既定として実装済み。`<body class="hero-b">` を付けると案Bに切り替わる。どちらを採用するか要判断 |
| 4 | 生成画像の誤字 | `assets/photo-dashboard-pitch.png` に「ネントワーク分析」の誤字があり未使用のまま。修正版が用意でき次第、差し替える |
| 5 | 未使用の画像 | `photo-tablet-clean.png` / `photo-bench-laptop.png` / `app-risk-full.png` が未配置 |
| 6 | 下層ページのセクション見直し | Phase 1〜6 は TOP のみを対象とした。approach / service-analysis / service-platform の内部構成は v1 時点のまま |
| 7 | デザイントークンの完全移行 | `--sub` `--blue` などの旧変数はエイリアスとして残している。既存クラスの参照を新トークンへ置き換える作業が残っている |
| 8 | 個別記事ページ `/news/{slug}.html` | 未着手（v1 の Phase 2 として保留中） |

---

## 8｜サイトマップの運用（Phase 16 で追加）

**ページを増やしたら sitemap.xml も更新する。**

静的HTML構成のため手動更新でも成立するが、更新漏れが起きやすいので生成スクリプトを用意した。

```bash
node tools/build-sitemap.mjs          # sitemap.xml を生成
node tools/build-sitemap.mjs --check  # 最新でなければ exit 1（CI用）
```

- ページを追加したら `tools/build-sitemap.mjs` の `PAGES` に1行足して実行する
- `lastmod` は git の最終コミット日から自動取得される
- `<meta name="robots" content="noindex">` を持つページは自動的に除外される
- `news/` 配下の個別記事ページは、存在すれば自動で追加される
- `index.html` は `/` と重複するため、`/` として1件だけ出力される

---

## 9｜OGP / X Card の設置と、og:image の暫定対応

**設置日：2026-08-27 ／ 対象：`kessan.html` を除く全13ページ**

ガイドライン §13-7 に従い、`canonical` の直後に以下を設置した。`og:title` / `og:description` / `og:url` は、
そのページの `title` / `description` / `canonical` と機械的に一致させている（スクリプトで抽出して挿入）。

```
og:type / og:site_name / og:locale / og:title / og:description /
og:url / og:image / og:image:width / og:image:height / twitter:card
```

- `kessan.html` は `noindex` かつガイドライン適用対象外（§1-2）のため設置しない。

### 外したルールと、その理由（§1-4 の記録）

| ルール | 本来 | 現状 | 理由 |
| --- | --- | --- | --- |
| §13-7 OG画像は 1200 × 630px | `assets/og-default.png`（1200×630） | `assets/bg-network-navy.jpg`（1672×941） | **専用のOG画像が未作成のため。** 存在しないURLを指すと共有時に画像が一切表示されず、OGPを設置した意味が失われる。実在する画像を暫定で指し、`og:image:width` / `height` には実寸をそのまま書いている（1200×630 と偽らない） |

**次の改修で対応すること**：`assets/og-default.png` を 1200 × 630px で作成し、`og:image` と
`og:image:width` / `og:image:height` の3行を差し替える。ロゴと社名を入れる場合、生成AIは日本語を崩すため
（§10-3）、文字部分は画像生成に頼らず作図すること。

### 未対応のまま残っている MUST（2026-08-27 時点の静的監査）

| § | 項目 | 件数 |
| --- | --- | --- |
| 10-4 / 12-1 | `<img>` の `width` / `height` 欠落 | 68 / 73枚 |
| 7-9 | パンくずリスト未設置 | 下層12ページ |
| 6-2 | `color:var(--blue)`（= `--color-primary`、白地 2.91:1）を文字色に使用 | 33箇所（暗い面での使用は適合。個別検証が必要） |
| 18-9 | 未参照の画像が残存 | 15ファイル・約16MB |
| 12-1 | 300KB を超える画像 | 10ファイル（最大 1,849KB） |
| 4-4 | 独自ブレークポイント（SHOULD） | 16種 |
| 18-4 | `!important`（SHOULD） | 34箇所 |
| 18-2 | `guide.html` / `philosophy.html` のヘッダー・フッター二重管理（SHOULD） | 2ページ |
