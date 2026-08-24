#!/usr/bin/env node
/**
 * sitemap.xml を生成する。
 *
 *   node tools/build-sitemap.mjs          … 生成して書き出す
 *   node tools/build-sitemap.mjs --check  … 現在の sitemap.xml と差分があれば exit 1（CI用）
 *
 * ページを増やしたら PAGES に1行足すだけでよい。
 * lastmod は git の最終コミット日を自動取得する（未コミットのファイルは今日の日付）。
 * noindex 指定のあるページと、index.html（/ と重複）は自動的に除外する。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://getodonata.com';
const check = process.argv.includes('--check');

// ファイル名 → [priority, changefreq]。「/」は index.html を指す
const PAGES = [
  ['index.html', '1.0', 'weekly'],
  ['service-analysis.html', '0.9', 'monthly'],
  ['service-platform.html', '0.9', 'monthly'],
  ['research.html', '0.8', 'monthly'],
  ['approach.html', '0.8', 'monthly'],
  ['demo.html', '0.7', 'monthly'],
  ['pricing.html', '0.7', 'monthly'],
  ['company.html', '0.7', 'monthly'],
  ['contact.html', '0.7', 'monthly'],
  ['news.html', '0.6', 'weekly'],
  ['philosophy.html', '0.5', 'yearly'],
  ['guide.html', '0.4', 'monthly'],
  ['privacy.html', '0.3', 'yearly'],
];

const today = new Date().toISOString().slice(0, 10);
const lastmod = (file) => {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root })
      .toString().trim();
    return d || today;
  } catch { return today; }
};

// noindex のページは載せない
const isNoindex = (file) => {
  const p = join(root, file);
  if (!existsSync(p)) return true;
  return /<meta\s+name=["']robots["'][^>]*noindex/i.test(readFileSync(p, 'utf8'));
};

const entries = [];
for (const [file, priority, changefreq] of PAGES) {
  if (isNoindex(file)) { console.warn(`skip (noindex または不存在): ${file}`); continue; }
  const loc = file === 'index.html' ? `${ORIGIN}/` : `${ORIGIN}/${file}`;
  entries.push({ loc, lastmod: lastmod(file), changefreq, priority });
}

// 個別記事ページ（news/ 配下）があれば自動で追加する
const newsDir = join(root, 'news');
if (existsSync(newsDir)) {
  for (const f of readdirSync(newsDir).filter(n => n.endsWith('.html'))) {
    const rel = `news/${f}`;
    if (isNoindex(rel)) continue;
    entries.push({ loc: `${ORIGIN}/${rel}`, lastmod: lastmod(rel), changefreq: 'yearly', priority: '0.6' });
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- ページを追加・削除したら、このファイルも必ず更新すること。
     生成コマンド： node tools/build-sitemap.mjs -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const out = join(root, 'sitemap.xml');
const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
if (check) {
  if (current.replace(/\r\n/g, '\n') !== xml) {
    console.error('sitemap.xml が最新ではありません。node tools/build-sitemap.mjs を実行してください。');
    process.exit(1);
  }
  console.log(`sitemap.xml は最新です（${entries.length} URL）。`);
} else {
  writeFileSync(out, xml);
  console.log(`sitemap.xml を生成しました（${entries.length} URL）。`);
}
