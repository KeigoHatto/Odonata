# デザイントークン一覧

定義場所：`assets/site.css` の `:root`
コントラスト比は sRGB の相対輝度から算出（WCAG 2.1 の計算式）。

---

## 色

| トークン | 値 | 主な背景 | コントラスト比 | 判定 |
| --- | --- | --- | --- | --- |
| `--color-text` | `#15233B` | `#FFFFFF` | 15.73:1 | OK |
| `--color-text-muted` | `#41616F` | `#FFFFFF` | 6.64:1 | OK |
| `--color-text-note` | `#4B5563` | `#FFFFFF` | 7.56:1 | OK |
| `--color-text-inverse` | `#E4EFF8` | `#0B2A5B` | 12.03:1 | OK |
| `--color-navy` | `#0B2A5B` | `#FFFFFF` | 14.03:1 | OK |
| `--color-primary-strong` | `#0A5E93` | `#FFFFFF` | 6.92:1 | OK |
| `--color-primary` | `#00A0E9` | `#FFFFFF` | 2.91:1 | **文字には使わない**（塗り・罫線・アイコン専用） |
| `--color-accent` | `#FF9933` | — | — | 図中の強調のみ。文字には使わない |
| `--color-focus-outline` | `#1A1A1C` | `--color-focus-ring` | 13.14:1 | OK |
| `--color-focus-ring` | `#FFDF3F` | — | — | フォーカスリングの外側 |
| `--color-bg` | `#E0F5FD` | — | — | ページ地 |
| `--color-bg-subtle` | `#F2FBFE` | — | — | セクションの交互背景 |
| `--color-bg-surface` | `#FFFFFF` | — | — | カード地 |
| `--color-bg-dark` | `#071A3A` | — | — | 暗い面 |
| `--color-border` | `#CCE9F6` | — | — | 罫線 |

**運用ルール**

- 文字色に使ってよいのは `--color-text` / `--color-text-muted` / `--color-text-note` /
  `--color-text-inverse` / `--color-navy` / `--color-primary-strong` の6つのみ。
- `--color-primary`（#00A0E9）は白背景で 2.91:1 のため、**文字には使わない**。
  リンクや小見出しに青を使いたい場合は `--color-primary-strong` を使う。
- `--color-accent`（オレンジ）は図中の「関係が強い箇所」の強調にのみ使い、色だけで情報を伝えない。

---

## タイポグラフィ

| トークン | 値 | 備考 |
| --- | --- | --- |
| `--font-size-body` | `16px` | SPでも15pxを下回らない |
| `--font-size-note` | `12.5px` | 注記。12px以上 |
| `--font-size-h1` | `clamp(32px,4.4vw,48px)` | ページに1つ |
| `--font-size-h2` | `clamp(30px,4.2vw,40px)` | セクション見出し |
| `--font-size-h3` | `20px` | 小見出し |
| `--line-height-body` | `1.8` | 1.5以上 |

---

## 余白・幅

| トークン | 値 | 備考 |
| --- | --- | --- |
| `--space-section` | `104px` | セクション上下（SPは72px） |
| `--space-block` | `44px` | ブロック間 |
| `--space-paragraph` | `28px` | 段落間の基準。行間の1.5倍以上を確保する場所では個別に上書き |
| `--measure-body` | `700px` | 本文1行 ≒ 全角40文字 |

---

## 段階移行について

既存クラスは `--text` / `--sub` / `--blue` などの短い変数名を参照している。
これらは削除せず、新トークンへのエイリアスとして `:root` に残している。

```css
--sub: var(--color-text-muted);
--blue: var(--color-primary);
```

新規に書くスタイルでは、意味で命名された `--color-*` / `--font-size-*` / `--space-*` を使う。
