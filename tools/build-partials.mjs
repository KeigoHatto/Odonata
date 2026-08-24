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
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
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

// 比較・置換は LF に正規化して行う（Windows の core.autocrlf=true 環境では
// 作業コピーが CRLF になり、そのまま比較すると全ページが「未同期」と誤検出されるため）
const bodies = Object.fromEntries(
  [...PARTIALS, ...OPTIONAL].map(name => [name, readFileSync(join(root, 'partials', `${name}.html`), 'utf8').replace(/\r\n/g, '\n').trim()])
);

const pages = readdirSync(root).filter(f => f.endsWith('.html'));

let changed = [];
let missing = [];

for (const page of pages) {
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
    after = after.replace(re, `$1\n${bodies[name]}\n$2`);
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
