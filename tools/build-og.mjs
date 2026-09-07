#!/usr/bin/env node
/**
 * tools/build-og.mjs — OG画像（1200×630）を tools/og-template.html から生成する。
 *
 *   node tools/build-og.mjs          … ja と en の両方を書き出す
 *   node tools/build-og.mjs --check  … 既存 PNG の存在と寸法を照合するだけ（CI 用）
 *
 * 手で画像を編集しないための道具。コピーが変わったら og-template.html の
 * COPY を書き換えて、このスクリプトを回す。
 *
 * puppeteer-core は scripts/a11y-check.mjs が既に使っている devDependency で、
 * サイトの配信物には一切入らない（§18-1 の「外部ライブラリなし」は配信物の話）。
 *
 * 終了コード
 *   0 … 成功
 *   1 … 生成物が 1200×630 でない、または --check で不一致
 *   2 … 実行できない（依存が無い、Chrome が見つからない等）
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const W = 1200, H = 630;

const OUTPUTS = [
  { lang: 'ja', file: 'assets/og-default.png' },
  { lang: 'en', file: 'assets/og-default-en.png' },
];

const die = (msg) => { console.error('\n[実行不可] ' + msg); process.exit(2); };
const fail = (msg) => { console.error('\n[失敗] ' + msg); process.exit(1); };

/** PNG の IHDR から寸法を読む。画像ライブラリを足さないために標準機能だけで見る。 */
function pngSize(path) {
  const b = readFileSync(path);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (b.length < 24 || !b.subarray(0, 8).equals(sig)) return null;
  if (b.toString('ascii', 12, 16) !== 'IHDR') return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function verify() {
  const bad = [];
  for (const o of OUTPUTS) {
    const p = join(ROOT, o.file);
    if (!existsSync(p)) { bad.push(`${o.file} がありません`); continue; }
    const s = pngSize(p);
    if (!s) { bad.push(`${o.file} が PNG として読めません`); continue; }
    if (s.w !== W || s.h !== H) { bad.push(`${o.file} は ${s.w}×${s.h}（${W}×${H} であること）`); continue; }
    console.log(`  ${o.file}  ${s.w}×${s.h}  ${(statSync(p).size / 1024).toFixed(1)}KB`);
  }
  if (bad.length) fail(bad.join('\n       '));
}

if (CHECK) {
  console.log('OG画像の照合');
  verify();
  console.log('OG画像は 1200×630 で揃っています。');
  process.exit(0);
}

let puppeteer;
try {
  puppeteer = (await import('puppeteer-core')).default;
} catch {
  die('puppeteer-core が要ります。リポジトリ直下で `npm install` を実行してください。');
}

// Chrome の探索順は scripts/a11y-check.mjs と同じ。CHROME_PATH を最優先する。
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && existsSync(p));
if (!CHROME) die('Chrome が見つかりません。CHROME_PATH で場所を指定してください。');

const TEMPLATE = pathToFileURL(join(ROOT, 'tools/og-template.html')).href;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new', args: ['--no-sandbox'],
});

console.log('OG画像を生成します');
for (const o of OUTPUTS) {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(`${TEMPLATE}?lang=${o.lang}`, { waitUntil: 'networkidle0' });
  // Web フォントの読み込みを待たないと system-ui で焼き付く。
  await page.evaluate(() => document.fonts.ready);
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: join(ROOT, o.file), type: 'png' });
  await page.close();
  console.log(`  ${o.lang} → ${o.file}`);
}
await browser.close();

verify();
console.log('書き出しました。X の Card Validator と Facebook の Sharing Debugger の');
console.log('キャッシュ更新は人の手で行ってください。');
