#!/usr/bin/env node
/**
 * 共通パーツ（ヘッダー／フッター／アイコンスプライト）を全ページへ同期する。
 *
 *   node tools/build-partials.mjs        … 同期を実行
 *   node tools/build-partials.mjs --check … 差分があれば exit 1（CI 用）
 *
 * 各 HTML には次のマーカーを置く。マーカー間はこのスクリプトが上書きするため、
 * 直接編集せず partials/*.html を編集すること。
 *
 *   <!-- #partial:header -->  ...  <!-- /#partial:header -->
 *   <!-- #partial:footer -->  ...  <!-- /#partial:footer -->
 *   <!-- #partial:icons  -->  ...  <!-- /#partial:icons  -->
 *
 * guide.html / philosophy.html は独自スタイルの単独ページのため対象外。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

// kessan.html は非公開の決算公告ページ（どこからもリンクしない・簡易ヘッダー）のため対象外
const EXCLUDE = new Set(['guide.html', 'philosophy.html', 'kessan.html']);
// 全ページに必須のパーツ
const PARTIALS = ['header', 'footer', 'icons'];
// マーカーがあるページにだけ差し込む任意のパーツ
const OPTIONAL = ['acwr', 'analytics'];
// en/ 配下には -en 版を同期する。マーカー名は日本語版と同じままにして、
// 出力先のパスだけで切り替える（マーカー名を分けると保守が二重になるため）。
const LOCALIZED = new Set(['header', 'footer']);

// 日本語版 ↔ 英語版の対応表。ここに無いページには言語切替を出さない
// （存在しないURLへリンクしないため。§14-5 MUST）
const PAIRS = [
  ['index.html', 'en/index.html'],
  ['service-analysis.html', 'en/service-analysis.html'],
  ['service-platform.html', 'en/service-platform.html'],
  ['research.html', 'en/research.html'],
  ['approach.html', 'en/approach.html'],
  ['company.html', 'en/company.html'],
  ['contact.html', 'en/contact.html'],
];
const href = (p) => p === 'index.html' ? '/' : p === 'en/index.html' ? '/en/' : `/${p}`;
// 現在の言語はリンクにせず span にして aria-current="true" を付ける
const langSwitch = (page) => {
  const pair = PAIRS.find(([ja, en]) => ja === page || en === page);
  if (!pair) return '';
  const [ja, en] = pair;
  const isJa = page === ja;
  return [
    isJa ? '<span lang="ja" aria-current="true">日本語</span>'
         : `<a href="${href(ja)}" lang="ja" hreflang="ja">日本語</a>`,
    '<span aria-hidden="true">|</span>',
    isJa ? `<a href="${href(en)}" lang="en" hreflang="en">English</a>`
         : '<span lang="en" aria-current="true">English</span>',
  ].join('');
};

// 比較・置換は LF に正規化して行う（Windows の core.autocrlf=true 環境では
// 作業コピーが CRLF になり、そのまま比較すると全ページが「未同期」と誤検出されるため）
const read = (name) => readFileSync(join(root, 'partials', `${name}.html`), 'utf8').replace(/\r\n/g, '\n').trim();
const bodies = Object.fromEntries([...PARTIALS, ...OPTIONAL].map(name => [name, read(name)]));
const bodiesEn = Object.fromEntries([...LOCALIZED].map(name => [name, read(`${name}-en`)]));

const pages = readdirSync(root).filter(f => f.endsWith('.html'));
if (existsSync(join(root, 'en'))) {
  for (const f of readdirSync(join(root, 'en')).filter(x => x.endsWith('.html'))) pages.push(`en/${f}`);
}

let changed = [];
let missing = [];

for (const page of pages) {
  const isEn = page.startsWith('en/');
  const path = join(root, page);
  const raw = readFileSync(path, 'utf8');
  const crlf = raw.includes('\r\n');
  const before = raw.replace(/\r\n/g, '\n');
  let after = before;

  for (const name of [...PARTIALS, ...OPTIONAL]) {
    // guide / philosophy は独自スタイルの単独ページ。必須パーツ（ヘッダー等）は同期しない
    if (EXCLUDE.has(page) && PARTIALS.includes(name)) continue;
    const re = new RegExp(`(<!--\\s*#partial:${name}\\s*-->)[\\s\\S]*?(<!--\\s*/#partial:${name}\\s*-->)`);
    if (!re.test(after)) {
      if (PARTIALS.includes(name)) missing.push(`${page}: #partial:${name}`);
      continue;
    }
    // en/ 配下には -en 版を入れる。マーカー名は日本語版と同じままにして、
    // 出力先のパスだけで切り替える
    const body = (isEn && LOCALIZED.has(name) ? bodiesEn[name] : bodies[name])
      .replaceAll('{{LANG_SWITCH}}', langSwitch(page));
    after = after.replace(re, `$1\n${body}\n$2`);
  }

  if (after !== before) {
    changed.push(page);
    // 書き戻し時は元ファイルの改行コードを維持する
    if (!check) writeFileSync(path, crlf ? after.replace(/\n/g, '\r\n') : after);
  }
}

if (missing.length) {
  console.error('マーカーが見つかりません:\n  ' + missing.join('\n  '));
}
if (check) {
  if (changed.length) {
    console.error('共通パーツが未同期です: ' + changed.join(', '));
    process.exit(1);
  }
  console.log('共通パーツは同期済みです。');
} else {
  console.log(changed.length ? `同期しました: ${changed.join(', ')}` : '変更はありません。');
}
if (missing.length) process.exit(1);
