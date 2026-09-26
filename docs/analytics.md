# アクセス解析（GA4）のイベント一覧

計測コードは `partials/analytics.html` の1か所だけにある（`node tools/build-partials.mjs` で全ページのヘッドへ同期）。
測定ID：`G-X3FK9YCZG5`。ページに直接 `gtag('event', …)` を書かない。

## イベント

| イベント名 | いつ送るか | パラメータ | 判定のしかた |
|---|---|---|---|
| `click_demo` | 「デモを見る」系のリンク（デモ環境 `DEMO_URL` への直リンク）を押した | `location` | `<a data-demo="位置">`。値がそのまま `location` になる |
| `click_contact` | 「資料請求・お問い合わせ」（`contact.html` へのリンク）を押した | `location` | `href` が `contact.html` を指すリンク（`?purpose=` や `#` 付きも含む） |
| `click_login` | ログイン（`app.getodonata.com`）へのリンクを押した | `location` | `href` が `https://app.getodonata.com` で始まるリンク |
| `generate_lead` | お問い合わせフォームの送信完了 | `purpose` | フォームが `document` に `odonata:lead`（`CustomEvent`）を dispatch する |
| （任意） | `data-track` を付けた要素を押した | `location` | `data-track="イベント名"`。下の「ボタンを増やすとき」 |

- `generate_lead` は現状、メール作成画面（`mailto:`）を開く直前に送る。フォームツールを導入したら、送信成功の応答を受けた時点に移す。
- ページビュー（`page_view`）は GA4 の自動計測に任せる。

### `location` の値

優先順位：`data-demo` の値 → `data-location`（`data-track` のときのみ）→ 祖先の `data-ga-location` → `header` / `footer` 要素の中 → 祖先 `section` の `id` → `<ページ名>_page`。

| 値 | 場所 | 付け方 |
|---|---|---|
| `nav` | ヘッダーの「デモを見る」 | `data-demo`（`partials/header.html`） |
| `hero` | ファーストビューのボタン | `data-demo` / `data-ga-location`（index） |
| `cta_bottom` | ページ末CTAの「デモを見る」 | `data-demo` |
| `footer` | フッター | `data-demo` / `data-ga-location`（`partials/footer*.html`） |
| `demo_page` | demo.html 上部の「今すぐデモを触る」 | `data-demo` |
| `contact` | contact.html 本文の「デモを触る」 | `data-demo` |
| `header` | ヘッダーの「資料請求・お問い合わせ」「ログイン」 | `data-ga-location`（`partials/header*.html`） |
| `service_card` | index のサービスカード | `data-ga-location` |
| `footer_cta` | index のページ末CTAの「資料請求・お問い合わせ」 | `data-ga-location` |

`click_demo` は `data-demo` の値、それ以外は `data-ga-location` などから決まるため、同じページ末CTAでも `click_demo` は `cta_bottom`、`click_contact` は `footer_cta` になる（index のみ）。

### `purpose` の値（`generate_lead`）

フォームの `<option data-lead="…">` の値。日英フォームで共通。

| 値 | 日本語フォーム | 英語フォーム |
|---|---|---|
| `doc` | 資料請求 | Request an overview of your services |
| `service` | サービスについて | A question about the services |
| `onboarding` | 導入・実証について | Implementation or a pilot |
| `media` | 取材・メディア | Press or media |
| `research` | 共同研究・連携 | Research collaboration |
| `other` | その他 | Something else |

## ボタンを増やすとき

JS は書かない。HTML に属性を足すだけにする。

```html
<a href="…" data-track="click_contact" data-location="pricing_card">資料請求・お問い合わせ</a>
```

- `data-track` は上の自動判定より優先される。イベント名は既存の名前を使い、新しい名前を作る前にこの一覧を更新する
- `data-location` を省くと、祖先の `data-ga-location` などから自動で補う
- デモ環境へのリンクは `data-track` ではなく `data-demo="位置"` を使う（`href` を `DEMO_URL` へ同期するため）
- 値は半角英小文字とアンダースコアのみ

## GA4 側の設定

| 設定 | 対象 | 状態 |
|---|---|---|
| キーイベント | `generate_lead`、`click_demo` | GA4 → 管理 → イベント で「キーイベントとしてマーク」 |
| カスタムディメンション（イベント範囲） | `location`、`purpose` | GA4 → 管理 → カスタム定義。登録しないとレポートでパラメータ別に見られない |
| クロスドメイン | `getodonata.com`、`odonata-demo.onrender.com` | 設定済み（2026-09-26） |

## 確認のしかた

1. 本番ページを開き、GA4 → レポート → リアルタイム（または DebugView）を表示する
2. 「デモを見る」「資料請求・お問い合わせ」を押し、`click_demo` / `click_contact` と `location` が出るか見る
3. 実装とこの一覧のずれは、`git grep -n "send('" partials/analytics.html` で確かめる
