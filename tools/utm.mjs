#!/usr/bin/env node
/**
 * サイトの外に置くリンク（メール・X・資料）用の UTM 付きURLを作る。値の決め方は docs/utm.md。
 *
 *   node tools/utm.mjs <source> <medium> <campaign> [path]
 *   npm run utm -- x social pinned
 *   npm run utm -- deck document service_deck contact.html
 *
 * 値は英小文字・数字・アンダースコアのみ。GA4 は大文字小文字や表記ゆれを別の値として集計するため、
 * 手で書かずにここで弾く。
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
/* 本番のドメインは CNAME（GitHub Pages の設定そのもの）から読む。URLをもう1か所に書かないため */
const ORIGIN = 'https://' + readFileSync(join(root, 'CNAME'), 'utf8').trim();
const VALUE = /^[a-z0-9_]+$/;

const die = (msg) => {
  console.error(msg);
  console.error('使い方: npm run utm -- <source> <medium> <campaign> [path]（値は docs/utm.md の表から選ぶ）');
  process.exit(1);
};

const [source, medium, campaign, path = ''] = process.argv.slice(2);
if (!campaign) die('source / medium / campaign の3つが必要です。');

const bad = Object.entries({ source, medium, campaign }).filter(([, v]) => !VALUE.test(v));
if (bad.length) {
  die(bad.map(([k, v]) => `utm_${k} に使えない文字があります: "${v}"（英小文字・数字・_ のみ）`).join('\n'));
}

/* 配ったURLが404にならないよう、サイト内に実在するパスだけを受け付ける */
const clean = path.replace(/^\/+/, '');
if (/[?#]|\.\./.test(clean) || /^https?:/.test(clean)) die(`path はサイト内のパスだけを書いてください: "${path}"`);
const file = join(root, clean);
const target = clean === '' || clean.endsWith('/') ? join(file, 'index.html') : file;
if (!existsSync(target) || !statSync(target).isFile()) die(`サイト内に見つかりません: "${path}"`);

const qs = new URLSearchParams({ utm_source: source, utm_medium: medium, utm_campaign: campaign });
console.log(`${ORIGIN}/${clean}?${qs}`);
