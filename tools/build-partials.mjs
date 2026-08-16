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

const EXCLUDE = new Set(['guide.html', 'philosophy.html']);
const PARTIALS = ['header', 'footer', 'icons'];

const bodies = Object.fromEntries(
  PARTIALS.map(name => [name, readFileSync(join(root, 'partials', `${name}.html`), 'utf8').trim()])
);

const pages = readdirSync(root).filter(f => f.endsWith('.html') && !EXCLUDE.has(f));

let changed = [];
let missing = [];

for (const page of pages) {
  const path = join(root, page);
  const before = readFileSync(path, 'utf8');
  let after = before;

  for (const name of PARTIALS) {
    const re = new RegExp(`(<!--\\s*#partial:${name}\\s*-->)[\\s\\S]*?(<!--\\s*/#partial:${name}\\s*-->)`);
    if (!re.test(after)) {
      missing.push(`${page}: #partial:${name}`);
      continue;
    }
    after = after.replace(re, `$1\n${bodies[name]}\n$2`);
  }

  if (after !== before) {
    changed.push(page);
    if (!check) writeFileSync(path, after);
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
