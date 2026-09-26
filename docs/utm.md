# UTM のルール

サイトの外に置くリンクには UTM を付ける。付けないと GA4 ではどれも「direct」になり、営業メール・X・資料のどこから来たか区別できない。

- **サイト内部のリンクには付けない**（付けるとセッションが分断される）
- URL は手で書かず `npm run utm` で作る（下の「生成ツール」）

## 値の表

| 置き場所 | utm_source | utm_medium | utm_campaign |
|---|---|---|---|
| クラブへの問い合わせメール本文 | `email` | `outreach` | `club_outreach` |
| メール署名 | `email` | `signature` | `signature` |
| X プロフィール欄 | `x` | `social` | `profile` |
| X 固定ポスト | `x` | `social` | `pinned` |
| X 通常投稿 | `x` | `social` | `post_YYYYMMDD` |
| サービス資料（pptx/PDF） | `deck` | `document` | `service_deck` |
| クラブ別の提案資料 | `deck` | `document` | `proposal_<クラブ英字略称>` |
| 紹介・Discord等で手渡し | `referral` | `share` | 自由（例：`intro_<紹介者>`） |

- 値は**半角英小文字・数字・アンダースコアのみ**。日本語・スペース・大文字は使わない（GA4 では `X` と `x` が別物として集計される）
- 表にない置き場所が増えたら、先にこの表へ行を足してから使う

## 生成ツール

```sh
npm run utm -- <source> <medium> <campaign> [path]
```

| 例 | 出力 |
|---|---|
| `npm run utm -- email outreach club_outreach` | `https://getodonata.com/?utm_source=email&utm_medium=outreach&utm_campaign=club_outreach` |
| `npm run utm -- x social pinned` | `https://getodonata.com/?utm_source=x&utm_medium=social&utm_campaign=pinned` |
| `npm run utm -- deck document service_deck contact.html` | `https://getodonata.com/contact.html?utm_source=deck&utm_medium=document&utm_campaign=service_deck` |

- `path` を省くとトップページ。`contact.html`・`en/` のようにサイト内のパスを書く
- 値に英小文字・数字・`_` 以外が入っているとエラーで止まる
