#!/usr/bin/env node
/**
 * SEO と表記ルールの検査。a11y（npm run a11y）と同じく、人の記憶に頼らず機械で毎回確かめる。
 *
 *   node scripts/seo-check.mjs   … 検査して docs/seo-report.json を書く（npm run seo）
 *
 * 終了コード
 *   0 … error なし（warn はあってもよい）
 *   1 … error あり
 *   2 … 検査を実行できない（sitemap.xml や禁止表現リストが読めない等）
 *
 * 対象は sitemap.xml と、ルート直下・en/ の全HTML。partials/ は各ページへ同期済みなのでページ側で見る。
 * noindex のページ（kessan.html）は SEO 項目を見ず、画像・リンク・禁止表現だけを見る。
 * 禁止表現は scripts/banned-words.json（人が追記する）。
 * HTML は正規表現で読む。コメントと <script>/<style> の中身は、構造の検査では空白に置き換えてから読む
 * （行番号がずれないよう、改行は残す）。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPORT = join(root, 'docs/seo-report.json');
const NEWS_STALE_DAYS = 45;
/* 長さの目安（指示書 v17）。ja は全角換算（半角は0.5字）、en は文字数 */
const LIMITS = {
  title: { ja: [28, 40], en: [50, 60] },
  description: { ja: [80, 120], en: [120, 160] },
};

const die = (msg) => { console.error(msg); process.exit(2); };
const read = (rel) => readFileSync(join(root, rel), 'utf8');
let ORIGIN, banned, sitemapXml;
try {
  ORIGIN = 'https://' + read('CNAME').trim();
  banned = JSON.parse(read('scripts/banned-words.json')).rules;
  sitemapXml = read('sitemap.xml');
} catch (e) { die('検査を実行できません: ' + e.message); }

const htmlFiles = [
  ...readdirSync(root).filter((f) => f.endsWith('.html')),
  ...readdirSync(join(root, 'en')).filter((f) => f.endsWith('.html')).map((f) => 'en/' + f),
].sort();
const cssFiles = readdirSync(join(root, 'assets')).filter((f) => f.endsWith('.css')).map((f) => 'assets/' + f);

const issues = [];
const add = (level, rule, file, line, message) => issues.push({ level, rule, file, line, message });

/* ---------- 読み取りの道具 ---------- */
const blank = (s) => s.replace(/[^\n]/g, ' ');
const stripComments = (html) => html.replace(/<!--[\s\S]*?-->/g, blank);
const mask = (html) => stripComments(html).replace(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
  (m, open, tag, body, close) => open + blank(body) + close);
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const attrsOf = (tag) => {
  const o = {};
  for (const m of tag.replace(/^<[\w-]+/, '').matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    o[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return o;
};
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'gi'))]
  .map((m) => ({ attrs: attrsOf(m[0]), index: m.index }));
const width = (s) => [...s].reduce((w, c) => w + (/[\u0000-ÿ｡-ﾟ]/.test(c) ? 0.5 : 1), 0);

/* URL ⇄ ファイル。「/」は index.html、「/en/」は en/index.html */
const urlOf = (file) => ORIGIN + '/' + file.replace(/(^|\/)index\.html$/, '$1');
const fileOfUrl = (url) => {
  if (!url.startsWith(ORIGIN + '/')) { return null; }
  const p = decodeURIComponent(url.slice(ORIGIN.length + 1).split(/[?#]/)[0]);
  return p === '' || p.endsWith('/') ? p + 'index.html' : p;
};
const isFile = (rel) => existsSync(join(root, rel)) && statSync(join(root, rel)).isFile();

/* ---------- 各ページを読む ---------- */
const pages = {};
for (const file of htmlFiles) {
  const raw = read(file);
  const html = mask(raw);
  const metas = tags(html, 'meta');
  const meta = (key, val) => metas.find((t) => t.attrs[key] === val);
  const links = tags(html, 'link');
  const titleM = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  pages[file] = {
    raw, html,
    lang: (tags(html, 'html')[0]?.attrs.lang || 'ja').slice(0, 2),
    noindex: /noindex/i.test(meta('name', 'robots')?.attrs.content || ''),
    title: titleM ? decode(titleM[1].trim()) : null,
    titleLine: titleM ? lineOf(html, titleM.index) : 1,
    description: meta('name', 'description'),
    og: {
      'og:title': meta('property', 'og:title'), 'og:description': meta('property', 'og:description'),
      'og:image': meta('property', 'og:image'), 'twitter:card': meta('name', 'twitter:card'),
    },
    canonical: links.find((t) => (t.attrs.rel || '').split(/\s+/).includes('canonical')),
    hreflang: Object.fromEntries(links.filter((t) => t.attrs.hreflang).map((t) => [t.attrs.hreflang, t.attrs.href])),
    ids: new Set([...html.matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1])),
  };
}

/* ---------- メタ・構造・URL・SNS（インデックス対象のページのみ） ---------- */
const indexable = htmlFiles.filter((f) => !pages[f].noindex);
const seen = { title: new Map(), description: new Map() };
for (const file of indexable) {
  const p = pages[file];
  const lang = p.lang === 'en' ? 'en' : 'ja';
  const len = (s) => (lang === 'ja' ? width(s) : s.length);
  const unit = lang === 'ja' ? '字（全角換算）' : ' characters';

  if (!p.title) { add('error', 'title', file, 1, '<title> がありません'); }
  else {
    const [min, max] = LIMITS.title[lang];
    const n = len(p.title);
    if (n < min || n > max) { add('warn', 'title-length', file, p.titleLine, `title が ${n}${unit}（目安 ${min}〜${max}）：${p.title}`); }
    (seen.title.get(p.title) || seen.title.set(p.title, []).get(p.title)).push(file);
  }

  const desc = p.description?.attrs.content?.trim();
  if (!desc) { add('error', 'description', file, 1, 'meta description がありません'); }
  else {
    const [min, max] = LIMITS.description[lang];
    const n = len(desc);
    if (n < min || n > max) { add('warn', 'description-length', file, lineOf(p.html, p.description.index), `description が ${n}${unit}（目安 ${min}〜${max}）`); }
    (seen.description.get(desc) || seen.description.set(desc, []).get(desc)).push(file);
  }

  const heads = [...p.html.matchAll(/<h([1-6])\b[^>]*>/gi)].map((m) => ({ level: +m[1], line: lineOf(p.html, m.index) }));
  const h1 = heads.filter((h) => h.level === 1);
  if (h1.length !== 1) { add('error', 'h1', file, h1[1]?.line || 1, `h1 が ${h1.length} 個あります（ちょうど1つにする）`); }
  heads.forEach((h, i) => {
    if (i > 0 && h.level > heads[i - 1].level + 1) {
      add('warn', 'heading-skip', file, h.line, `見出しが h${heads[i - 1].level} → h${h.level} に飛んでいます`);
    }
  });

  const expected = urlOf(file);
  if (!p.canonical) { add('error', 'canonical', file, 1, 'canonical がありません'); }
  else if (p.canonical.attrs.href !== expected) {
    add('error', 'canonical', file, lineOf(p.html, p.canonical.index), `canonical が自己参照ではありません：${p.canonical.attrs.href}（期待値 ${expected}）`);
  }

  for (const [key, t] of Object.entries(p.og)) {
    if (!t || !t.attrs.content) { add('warn', 'og', file, 1, `${key} がありません`); }
  }
}
for (const [kind, map] of Object.entries(seen)) {
  for (const [value, files] of map) {
    if (files.length > 1) {
      files.forEach((f) => add('error', `duplicate-${kind}`, f, 1, `${kind} が ${files.filter((x) => x !== f).join(', ')} と同じです：${value.slice(0, 40)}…`));
    }
  }
}

/* hreflang：ja / en / x-default が揃い、相手ページにも同じ3行があること（§14-4） */
const counterpart = (file) => (file.startsWith('en/') ? file.slice(3) : 'en/' + file);
for (const file of indexable) {
  const p = pages[file];
  const other = counterpart(file);
  const hasOther = pages[other] && !pages[other].noindex;
  const keys = Object.keys(p.hreflang);
  if (!hasOther) {
    if (keys.length) { add('error', 'hreflang', file, 1, `対応する ${other} が無いのに hreflang があります`); }
    continue;
  }
  const want = file.startsWith('en/')
    ? { ja: urlOf(other), en: urlOf(file), 'x-default': urlOf(other) }
    : { ja: urlOf(file), en: urlOf(other), 'x-default': urlOf(file) };
  for (const [k, v] of Object.entries(want)) {
    if (p.hreflang[k] !== v) { add('error', 'hreflang', file, 1, `hreflang="${k}" が ${p.hreflang[k] || '（無し）'}（期待値 ${v}）`); }
  }
  for (const k of keys) {
    if (!(k in want)) { add('error', 'hreflang', file, 1, `想定外の hreflang="${k}"`); }
  }
}

/* sitemap に載っているページと実ファイルの差分 */
const locs = [...sitemapXml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
const inSitemap = new Set();
for (const loc of locs) {
  const file = fileOfUrl(loc);
  if (!file || !isFile(file)) { add('error', 'sitemap', 'sitemap.xml', 1, `sitemap の ${loc} に対応するファイルがありません`); continue; }
  if (pages[file]?.noindex) { add('error', 'sitemap', 'sitemap.xml', 1, `noindex の ${file} が sitemap に載っています`); }
  inSitemap.add(file);
}
for (const file of indexable) {
  if (!inSitemap.has(file)) { add('error', 'sitemap', file, 1, 'sitemap.xml に載っていません（tools/build-sitemap.mjs の PAGES に追加）'); }
}

/* ---------- 全ページ：JSON-LD・画像・リンク ---------- */
for (const file of htmlFiles) {
  const p = pages[file];
  const noComments = stripComments(p.raw);
  for (const m of noComments.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(m[1]); }
    catch (e) { add('error', 'json-ld', file, lineOf(noComments, m.index), `JSON-LD が JSON として読めません：${e.message}`); }
  }

  for (const img of tags(p.html, 'img')) {
    const line = lineOf(p.html, img.index);
    const src = img.attrs.src || '';
    if (!('alt' in img.attrs)) { add('error', 'img-alt', file, line, `img に alt がありません：${src}`); }
    if (!('width' in img.attrs) || !('height' in img.attrs)) { add('warn', 'img-size', file, line, `img に width/height がありません（CLSの原因）：${src}`); }
  }

  for (const a of tags(p.html, 'a')) {
    const href = a.attrs.href;
    if (href === undefined) { continue; }
    const line = lineOf(p.html, a.index);
    if (a.attrs.target === '_blank' && !/\bnoopener\b/.test(a.attrs.rel || '')) {
      add('warn', 'noopener', file, line, `target="_blank" に rel="noopener" がありません：${href}`);
    }
    if (/^(mailto|tel|javascript|data):/i.test(href) || href === '#') { continue; }
    let target;
    if (/^https?:\/\//i.test(href) || href.startsWith('//')) {
      target = fileOfUrl(href.replace(/^\/\//, 'https://'));
      if (!target) { continue; } /* 外部サイトは見ない */
    }
    const [pathPart, hash] = href.split('#');
    if (!target) {
      const path = pathPart.split('?')[0];
      if (path === '') { target = file; }
      else {
        const resolved = path.startsWith('/') ? path.slice(1) : posix.normalize(posix.join(posix.dirname(file), path));
        target = decodeURIComponent(resolved === '' || resolved.endsWith('/') || resolved === '.' ? resolved.replace(/\.$/, '') + 'index.html' : resolved);
      }
    }
    if (!isFile(target)) { add('error', 'broken-link', file, line, `リンク先がありません：${href}`); continue; }
    if (hash && target.endsWith('.html')) {
      const ids = pages[target]?.ids || new Set([...mask(read(target)).matchAll(/\sid\s*=\s*["']([^"']+)["']/g)].map((m) => m[1]));
      if (!ids.has(decodeURIComponent(hash))) { add('error', 'broken-link', file, line, `アンカー #${hash} が ${target} にありません：${href}`); }
    }
  }
}

/* ---------- 鮮度：news.html の最新日付 ---------- */
if (pages['news.html']) {
  const dates = [...pages['news.html'].html.matchAll(/(20\d{2})[./-](\d{1,2})[./-](\d{1,2})/g)]
    .map((m) => new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])));
  const latest = dates.sort((x, y) => y - x)[0];
  if (!latest) { add('warn', 'news-freshness', 'news.html', 1, 'news.html に日付が見つかりません'); }
  else {
    const days = Math.floor((Date.now() - latest) / 86400000);
    if (days >= NEWS_STALE_DAYS) {
      add('warn', 'news-freshness', 'news.html', 1, `最新のお知らせが ${latest.toISOString().slice(0, 10)}（${days}日前）。${NEWS_STALE_DAYS}日以上更新がありません`);
    }
  }
}

/* ---------- 表記：禁止表現（scripts/banned-words.json） ---------- */
/* html：見える文言と HTML コメント（ソースで誰でも読める）を見る。<style> と JSON-LD 以外の <script> の中は
   公開される文言ではないので空白にする。css：CSS のコメント（「使わない」という注意書き等）を除いて見る */
const views = {
  html: (file) => pages[file].raw.replace(/(<(script|style)\b([^>]*)>)([\s\S]*?)(<\/\2>)/gi,
    (m, open, tag, attrs, body, close) => (/ld\+json/i.test(attrs) ? m : open + blank(body) + close)),
  css: (file) => (pages[file] ? stripComments(pages[file].raw) : read(file)).replace(/\/\*[\s\S]*?\*\//g, blank),
};
const sources = { html: htmlFiles, css: [...cssFiles, ...htmlFiles] };
for (const rule of banned) {
  const re = rule.regex ? new RegExp(rule.regex, 'gi') : new RegExp(rule.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  for (const kind of rule.in || ['html']) {
    for (const file of sources[kind] || []) {
      checkBanned(rule, re, file, views[kind](file));
    }
  }
}
function checkBanned(rule, re, file, text) {
  for (const m of text.matchAll(re)) {
    const line = lineOf(text, m.index);
    const lineText = text.split('\n')[line - 1];
    if ((rule.allow || []).some((s) => lineText.includes(s))) { continue; }
    add('error', 'banned-word', file, line, `禁止表現「${m[0]}」（${rule.id}：${rule.reason}）：${lineText.trim().slice(0, 80)}`);
  }
}

/* ---------- 出力 ---------- */
const order = { error: 0, warn: 1 };
issues.sort((x, y) => order[x.level] - order[y.level] || x.rule.localeCompare(y.rule) || x.file.localeCompare(y.file) || x.line - y.line);
const byRule = {};
for (const i of issues) {
  byRule[i.rule] ||= { error: 0, warn: 0 };
  byRule[i.rule][i.level]++;
}
const summary = {
  error: issues.filter((i) => i.level === 'error').length,
  warn: issues.filter((i) => i.level === 'warn').length,
  pages: htmlFiles.length,
  byRule,
};
writeFileSync(REPORT, JSON.stringify({ generatedAt: new Date().toISOString(), summary, issues }, null, 1) + '\n');

console.log(`検査したページ : ${htmlFiles.length}（noindex ${htmlFiles.length - indexable.length}） / CSS ${cssFiles.length}`);
console.log(`error          : ${summary.error} 件`);
console.log(`warn           : ${summary.warn} 件`);
for (const [rule, c] of Object.entries(byRule)) { console.log(`  ${rule.padEnd(22)} error ${c.error} / warn ${c.warn}`); }
for (const i of issues.filter((x) => x.level === 'error')) { console.log(`  [error] ${i.file}:${i.line}  ${i.message}`); }
console.log('\ndocs/seo-report.json に書き出しました。');
process.exit(summary.error ? 1 : 0);
