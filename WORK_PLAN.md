# WORK_PLAN — Odonata Webサイト改修 v1

正典：`C:\Users\javie\OneDrive\ドキュメント\Claude\Projects\起業プロジェクト\Odonata_Web改修指示書_v1.md`
（全文を読まない。各タスクの「参照章」だけを grep / sed で抜き出して読む）

---

## 0｜決定事項（【要判断】タスクの前提）

指示書 §9 未決事項のうち、実装を進めるために先行して確定した扱い。

| # | 項目 | 決定 |
| --- | --- | --- |
| 1 | Heroメインコピー | 暫定案A「サッカーチームのデータを、現場の意思決定につなげる。」で実装。差し替え可能なマークアップにする |
| 2 | カテゴリ語 | アイブロウは「サッカーチーム向け データプラットフォーム」で固定 |
| 3 | 個別記事ページ `/news/{slug}.html` | Phase 2。Phase 1 では TOP のニュース3件は `news.html#アンカー` に張る（リンク切れを作らない） |
| 4 | 実証現場写真 | 許諾未取得のため使用しない（指示書 §2 TOP-05 の「取れない場合は写真なしで進める」に従う） |
| 5 | `guide.html` / `philosophy.html` | 独自CSSの単独ページ。共通ヘッダーの同期対象外とし、表記統一のみ行う |

未記入の【要判断】が出た場合はここに追記されるまで着手しない。

---

## 1｜Phase 1 タスク

上から順に1つずつ。完了したら `[x]` にして同じコミットに含める。

### 共通基盤

- [x] **T01** 共通パーツの単一ソース化（`partials/header.html` / `footer.html` / `icons.html` と `tools/build-partials.mjs`）
  - 参照章：§3 Global Navigation ／ §3 Footer
  - ナビ順＝サービス▾／実績・研究／複雑系アプローチ／料金／会社情報／ニュース
  - 右端＝ログイン（テキスト）／デモを見る（塗り）／資料請求・お問い合わせ（線）
  - Dropdownは2項目・説明文なし。`i-download` はスプライトから削除
- [x] **T02** `assets/site.css` / `assets/site.js` の共通スタイル・Dropdown挙動
  - 参照章：§6-10 可読性 ／ §3「全ページでヘッダーを共通コンポーネント化する」
  - hover / click / キーボードの3経路、Active状態、SPアコーディオン、ダーク時のコントラスト
- [x] **T03** 全ページに `#partial:` マーカーを挿入し、共通パーツを同期
  - 対象：index / approach / service-analysis / service-platform / pricing / research / company / news / contact / privacy
  - 検証：`node tools/build-partials.mjs --check` が通ること

### TOP（`index.html`）

- [x] **T04** 01 Hero（アイブロウ／暫定コピー／サブコピー／CTA2つ／プロダクト画面／ピッチライン）
  - 参照章：§2 01｜Hero ／ §3 TOP｜Hero
  - KPI帯3枚と長文注釈ブロックを削除。3D球体は背景へ後退
- [x] **T05** 02 Odonataでできること（ユースケース3枚・カードごとに主役ビジュアルを変える・注記）
  - 参照章：§2 02 ／ §3 TOP｜Odonataでできること
  - 旧 PROBLEM & SOLUTION と WHAT IS ODONATA を削除
- [x] **T06** 03 2つの提供方法（左右非対称・左=明るい図表／右=暗いUI）
  - 参照章：§2 03 ／ §3 TOP｜2つの提供方法
- [x] **T07** 04 循環図（5ステップ円環・SVG text で文字を保持）
  - 参照章：§2 04 ／ §3 TOP｜循環図
- [x] **T08** 05 実証：筑波大学蹴球部（成果→内容→経緯の順・約5%は大数字にしない）
  - 参照章：§2 05 ／ §3 TOP｜実証
- [x] **T09** 06 なぜOdonataにできるのか（図1枚＋2文／研究・現場・実装／メンバー3名）
  - 参照章：§2 06 ／ §3 TOP｜なぜOdonataにできるのか
  - 学術用語（創発・非線形性・バタフライ効果・More is different）をTOPから全削除
- [x] **T10** 07 導入の流れ（3ステップ）／08 ニュース（3件）／09 CTA
  - 参照章：§2 07・08・09 ／ §3 TOP｜導入の流れ・ニュース・CTA

### 新規ページ

- [x] **T11** `demo.html` を新設（デモ入口／見られる画面3〜5点／資料請求導線）
  - 参照章：§3 お問い合わせ「`/demo.html` を新設する」

### 下層ページ

- [x] **T12** `contact.html`：表記統一・目的の選択肢整理（デモを削除）
  - 参照章：§3 お問い合わせ
- [x] **T13** `company.html`：メンバー3名・統一粒度・チームサマリ1行・法人名表記
  - 参照章：§3 会社情報 ／ §3 法人名表記の推奨
- [x] **T14** `research.html`：成果先出しに順序反転・VOICE削除・タイムラインUI廃止
  - 参照章：§3 実績・研究
- [x] **T15** `pricing.html`：3セクションに簡素化・具体月額と一覧表とFAQを削除・CTA1つ
  - 参照章：§3 料金
- [x] **T16** `service-analysis.html`：6セクションに圧縮・FAQ削除・14倍表記の置換・CTA1つ
  - 参照章：§3 データ分析・伴走支援
- [x] **T17** `service-platform.html`：6セクションに圧縮・画面キャプチャ主役・使い方ガイド内包・CTA2つ
  - 参照章：§3 データプラットフォーム
- [x] **T18** `approach.html`：5セクションに統合・ダーク背景の可読性・Dropdown不動作の修正
  - 参照章：§3 複雑系アプローチ

### 横断

- [x] **T19** `news.html` / `privacy.html` / `philosophy.html` / `guide.html` の表記統一
  - 参照章：§7 表記ルール（CLAUDE.md）
- [x] **T20** 全ページ横断チェック
  - 「株式会社Odonata」「約14倍」「ダウンロード」「澤田」「使い方ガイド（ナビ・Footer）」が0件であること
  - `node tools/build-partials.mjs --check` が通ること
  - 全リンク先ファイルが実在すること

---

## 2｜Phase 2 以降（今回対象外）

指示書 §8 Phase 2 / Phase 3 を参照。着手しない。

主なもの：`/news/{slug}.html` 個別記事、News と Column の分離、`/research.html` の研究・分析例セクション、
`/service-analysis.html` の分析例③、実証現場写真、デモ環境の本実装、構造化データ、OGP個別設定、英語版 `/en/`。
