#!/usr/bin/env node
/**
 * アクセシビリティの回帰検査。1コマンドで全ページを実描画して検査する。
 *
 *   npm install            … 初回のみ（puppeteer-core と axe-core を入れる）
 *   node scripts/a11y-check.mjs           … 検査して docs/a11y-report.json を書く
 *   node scripts/a11y-check.mjs --quiet   … 集計だけ出す
 *
 * 終了コード
 *   0 … 違反なし
 *   1 … 違反あり（axe の violations / 320px の二方向スクロール / グラデ上のテキスト）
 *   2 … 検査を実行できない（依存が無い、Chrome が見つからない等）
 *
 * incomplete（axe の判定保留）は件数と分類を出すが、終了コードには影響させない。
 * 自動判定が原理的に成立しない領域であり、失敗扱いにすると誰も回さなくなるため。
 *
 * 検査する内容
 *   1. axe-core（WCAG 2.0/2.1 A+AA）を、既定 / hover / focus+focus-visible /
 *      active / details 展開 の各状態で実行する
 *   2. 320px（1.4.10 リフロー）・640px（1.4.4 の 200% 相当）・1280px で
 *      横方向のはみ出しを測る
 *   3. --grad-hero の上に載るテキストを、7つの幅で実ピクセル測定する
 *   4. 1.4.12（テキストの間隔）を注入して、はみ出す要素を数える
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const QUIET = process.argv.includes('--quiet');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const WIDTHS = [320, 640, 1280];
const GRAD_WIDTHS = [320, 390, 768, 1024, 1280, 1440, 1920];
// テキストが載る面のうち最も明るいピクセルに対して満たすべき比
const NEED = (size, bold) => (size >= 24 || (bold && size >= 18.66)) ? 3 : 4.5;

const die = (msg) => { console.error('\n[実行不可] ' + msg); process.exit(2); };

let puppeteer, axeSource;
try {
  puppeteer = (await import('puppeteer-core')).default;
  axeSource = readFileSync(join(ROOT, 'node_modules/axe-core/axe.min.js'), 'utf8');
} catch {
  die('puppeteer-core と axe-core が要ります。リポジトリ直下で `npm install` を実行してください。');
}

const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && existsSync(p));
if (!CHROME) die('Chrome が見つかりません。CHROME_PATH で場所を指定してください。');

const pages = readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
const url = f => pathToFileURL(join(ROOT, f)).href;
/* スクロールで現れる要素（.reveal）は既定で opacity:0 のため、axe が
   「見えない要素」として検査対象から外す。実際にはページの大半がこれに当たり、
   そのままだと折り返し以降がほぼ未検査になる（21-1 の 1.17:1 を見落とした）。
   検査時は最初から表示された状態にする。 */
const NO_ANIM = '*,*::before,*::after{transition:none!important;animation:none!important}'
  + '.reveal{opacity:1!important;transform:none!important;visibility:visible!important}';
const SPACING = `*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}
p{margin-bottom:2em!important}`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const report = { generatedAt: new Date().toISOString(), pages: {}, summary: {} };
const pick = a => a.map(x => ({
  id: x.id, impact: x.impact, count: x.nodes.length, help: x.help,
  reasons: [...new Set(x.nodes.flatMap(n => (n.any || []).concat(n.all || []).map(c => c.message)))].slice(0, 3),
  examples: x.nodes.slice(0, 3).map(n => n.target.join(' ').slice(0, 90)),
}));

for (const f of pages) {
  const page = await browser.newPage();
  const R = report.pages[f] = { axe: {}, reflow: {}, gradient: [], spacing: null };
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto(url(f), { waitUntil: 'networkidle0', timeout: 60000 });
  await page.addStyleTag({ content: NO_ANIM });
  await page.evaluate(axeSource);
  const runAxe = () => page.evaluate(async t => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: t } });
    return { v: r.violations, i: r.incomplete };
  }, TAGS);
  const store = (key, r) => { R.axe[key] = { violations: pick(r.v), incomplete: pick(r.i) }; };

  store('default', await runAxe());

  // 擬似クラスを CDP で強制する。transition を切っておかないと遷移途中の混色を拾う
  const cdp = await page.createCDPSession();
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
  const SEL = ['a', 'button', 'summary', 'input', 'select', 'textarea', '[tabindex]'];
  const force = async (classes) => {
    for (const s of SEL) {
      const { nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: s });
      for (const nodeId of nodeIds) { try { await cdp.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: classes }); } catch { } }
    }
  };
  for (const st of [['hover'], ['focus', 'focus-visible'], ['active']]) {
    await force(st);
    await new Promise(r => setTimeout(r, 200));
    store(st.join('+'), await runAxe());
    await force([]);
  }

  // details をすべて開いた状態
  const hasDetails = await page.$$eval('details', d => d.length);
  if (hasDetails) {
    await page.$$eval('details', ds => ds.forEach(d => (d.open = true)));
    await new Promise(r => setTimeout(r, 150));
    store('details-open', await runAxe());
    await page.$$eval('details', ds => ds.forEach(d => (d.open = false)));
  }

  // 幅ごとの横はみ出し
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 800 });
    await new Promise(r => setTimeout(r, 150));
    R.reflow[w] = await page.evaluate((w) => {
      const d = document.documentElement;
      const over = [];
      if (d.scrollWidth > w + 1) {
        for (const el of document.querySelectorAll('body *')) {
          const r = el.getBoundingClientRect();
          if (r.right > w + 1 && r.width > 0 && r.height > 0 && getComputedStyle(el).position !== 'fixed') {
            const p = el.parentElement;
            if (p && p.getBoundingClientRect().right > w + 1) continue; // 親も溢れているなら親を報告
            over.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.') : '') + ' →' + Math.round(r.right));
          }
        }
      }
      return { scrollWidth: d.scrollWidth, over: [...new Set(over)].slice(0, 8) };
    }, w);
  }

  // 1.4.12 テキストの間隔：注入して、はみ出す要素を数える
  await page.setViewport({ width: 1280, height: 900 });
  const before = await page.evaluate(() => [...document.querySelectorAll('body *')]
    .filter(e => e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1).length);
  const tag = await page.addStyleTag({ content: SPACING });
  await new Promise(r => setTimeout(r, 200));
  R.spacing = await page.evaluate((before) => {
    const clipped = [];
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.overflow === 'visible' && cs.overflowY === 'visible') continue;
      if (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) {
        clipped.push(el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\s+/).slice(0, 2).join('.') : ''));
      }
    }
    return { before, clipped: [...new Set(clipped)].slice(0, 12), clippedCount: clipped.length,
      pageOverflow: document.documentElement.scrollWidth > window.innerWidth + 1 };
  }, before);
  await page.evaluate(el => el.remove(), tag);

  // --grad-hero の上のテキストを実ピクセルで測る
  const hasGrad = await page.evaluate(() => !!document.querySelector('.phero, .phil, .ghero'));
  if (hasGrad) {
    for (const w of GRAD_WIDTHS) {
      await page.setViewport({ width: w, height: 900 });
      await new Promise(r => setTimeout(r, 150));
      await page.evaluate(() => window.scrollTo(0, 0));
      const boxes = await page.evaluate(() => {
        const host = [...document.querySelectorAll('.phero, .phil, .ghero')];
        const out = [];
        for (const h of host) for (const el of h.querySelectorAll('h1,h2,h3,p,span,b,a,li')) {
          if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (r.width < 3 || r.height < 3 || r.top < 0 || r.bottom > window.innerHeight) continue;
          out.push({ sel: el.tagName.toLowerCase() + '.' + String(el.className || '').trim().split(/\s+/)[0],
            text: el.textContent.trim().slice(0, 20),
            fg: (cs.color.match(/\d+/g) || []).slice(0, 3).map(Number),
            size: parseFloat(cs.fontSize), bold: +cs.fontWeight >= 700,
            rect: [r.left, r.top, r.width, r.height] });
        }
        return out;
      });
      if (!boxes.length) continue;
      const t2 = await page.addStyleTag({ content: '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}' });
      const b64 = await page.screenshot({ encoding: 'base64' });
      await page.evaluate(el => el.remove(), t2);
      const res = await page.evaluate(async (b64, boxes) => {
        const img = new Image();
        await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,' + b64; });
        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
        const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0);
        const dpr = img.width / window.innerWidth;
        const lum = ([r, g, b]) => { const q = v => (v /= 255) <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; return .2126 * q(r) + .7152 * q(g) + .0722 * q(b); };
        const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
        const out = [];
        for (const t of boxes) {
          const [x, y, w, h] = [Math.round(t.rect[0] * dpr), Math.round(t.rect[1] * dpr), Math.round(t.rect[2] * dpr), Math.round(t.rect[3] * dpr)];
          if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > cv.width || y + h > cv.height) continue;
          const d = ctx.getImageData(x, y, w, h).data;
          let min = 99, at = null;
          for (let i = 0; i < d.length; i += 8) {
            const px = [d[i], d[i + 1], d[i + 2]];
            const r = ratio(t.fg, px);
            if (r < min) { min = r; at = px; }
          }
          out.push({ ...t, min: +min.toFixed(2), at });
        }
        return out;
      }, b64, boxes);
      for (const r of res) {
        const need = NEED(r.size, r.bold);
        if (r.min < need) R.gradient.push({ width: w, need, ...r });
      }
    }
  }
  await page.close();
  if (!QUIET) process.stderr.write('.');
}
await browser.close();

// ───── 集計 ─────
const hex = a => a ? '#' + a.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase() : null;
let vTotal = 0, iTotal = 0, reflowFail = [], gradFail = [], spacingFail = [];
const incByReason = {};
for (const [f, R] of Object.entries(report.pages)) {
  for (const [state, r] of Object.entries(R.axe)) {
    const v = r.violations.reduce((s, x) => s + x.count, 0);
    const i = r.incomplete.reduce((s, x) => s + x.count, 0);
    vTotal += v; iTotal += i;
    for (const x of r.incomplete) for (const m of x.reasons) incByReason[m] = (incByReason[m] || 0) + x.count;
    if (v) console.log('違反 ' + f + ' [' + state + '] ' + v + '件: ' +
      r.violations.map(x => x.id + '×' + x.count).join(', '));
  }
  if (R.reflow[320] && R.reflow[320].scrollWidth > 321) reflowFail.push(f + ' (320px → ' + R.reflow[320].scrollWidth + 'px: ' + R.reflow[320].over.join(', ') + ')');
  if (R.gradient.length) gradFail.push(f + ' ' + R.gradient.length + '件（最小 ' + Math.min(...R.gradient.map(g => g.min)) + ':1）');
  if (R.spacing && R.spacing.clippedCount > (R.spacing.before || 0)) spacingFail.push(f + ' ' + R.spacing.clippedCount + '要素');
}
report.summary = { violations: vTotal, incomplete: iTotal, incompleteByReason: incByReason,
  reflow320Fail: reflowFail, gradientFail: gradFail, spacingClipped: spacingFail };

console.log('\n──────── 集計 ────────');
console.log('対象 ' + pages.length + 'ページ × ' + Object.keys(report.pages[pages[0]].axe).length + '状態');
console.log('axe 違反              : ' + vTotal + ' 件' + (vTotal ? '  ← 要修正' : ''));
console.log('axe 判定保留(incomplete): ' + iTotal + ' 件（終了コードには影響しない）');
for (const [m, n] of Object.entries(incByReason).sort((a, b) => b[1] - a[1]).slice(0, 6))
  console.log('   ' + String(n).padStart(5) + '  ' + m.slice(0, 80));
console.log('320px 二方向スクロール  : ' + (reflowFail.length ? reflowFail.join(' / ') : 'なし'));
console.log('グラデ上テキスト不足    : ' + (gradFail.length ? gradFail.join(' / ') : 'なし'));
console.log('文字間隔(1.4.12)で切れ  : ' + (spacingFail.length ? spacingFail.join(' / ') : 'なし（増加なし）'));

writeFileSync(join(ROOT, 'docs/a11y-report.json'), JSON.stringify(report, null, 1));
console.log('\ndocs/a11y-report.json に書き出しました。');

const fail = vTotal > 0 || reflowFail.length > 0 || gradFail.length > 0;
if (fail) console.error('\n検査に失敗しました。');
process.exit(fail ? 1 : 0);
