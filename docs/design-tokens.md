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
| `--color-primary-strong` | `#0A5E93` | `#FFFFFF` | 6.92:1 | 明るい面のみ。→ 下の背景別の表 |
| `--color-primary` | `#00A0E9` | `#FFFFFF` | 2.91:1 | **文字には使わない**（塗り・罫線・アイコン専用）。→ 下の背景別の表 |
| `--color-border-strong` | `#6A9AB8` | `#FFFFFF` | 3.03:1 | 白い塗りの上の枠線のみ。→ 下の背景別の表 |
| `--color-accent` | `#FF9933` | — | — | 図中の強調のみ。文字には使わない |
| `--color-focus-outline` | `#1A1A1C` | `--color-focus-ring` | 13.14:1 | OK |
| `--color-focus-ring` | `#FFDF3F` | — | — | フォーカスリングの外側 |
| `--color-bg` | `#E0F5FD` | — | — | ページ地 |
| `--color-bg-subtle` | `#F2FBFE` | — | — | セクションの交互背景 |
| `--color-bg-surface` | `#FFFFFF` | — | — | カード地 |
| `--color-bg-dark` | `#071A3A` | — | — | 暗い面 |
| `--color-border` | `#CCE9F6` | — | — | 罫線 |

### 背景別のコントラスト比（実測）

**コントラスト比は必ず「実際に隣接する色」に対して計算する。白背景での値をそのまま流用しない。
ページ地は白ではなく `#E0F5FD` である。**

上の表の「主な背景」列は白基準の参考値にすぎない。以下は、実際に隣接しうる背景ごとの実測値。
**3:1 未満は太字**。

| 前景 | 白 `#FFFFFF` | `--color-bg` `#E0F5FD` | `--color-bg-subtle` `#F2FBFE` | `--color-navy` `#0B2A5B` | `--color-bg-dark` `#071A3A` |
| --- | --- | --- | --- | --- | --- |
| `--color-border-strong` `#6A9AB8` | 3.03 | **2.69** | **2.89** | 4.63 | 5.69 |
| `--color-primary` `#00A0E9` | **2.91** | **2.59** | **2.78** | 4.81 | 5.92 |
| `--color-primary-strong` `#0A5E93` | 6.92 | 6.14 | 6.59 | **2.03** | **2.49** |
| `--card-platform-accent` `#7FE3FF` | **1.47** | **1.30** | **1.40** | 9.58 | 11.77 |

**運用ルール**

- 文字色に使ってよいのは `--color-text` / `--color-text-muted` / `--color-text-note` /
  `--color-text-inverse` / `--color-navy` / `--color-primary-strong` の6つのみ。
- `--color-accent`（オレンジ）は図中の「関係が強い箇所」の強調にのみ使い、色だけで情報を伝えない。

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
