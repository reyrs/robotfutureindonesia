// Headless screenshot helper for design QA.
//   node scripts/shoot.mjs <url> <outPrefix> [w] [h] [scrolls] [waitMs]
// e.g. node scripts/shoot.mjs http://localhost:5173/ shot 1600 1000 0,900,2400
import puppeteer from 'puppeteer-core';

const CHROME =
  process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';

const [, , url = 'http://localhost:5173/', out = 'shot', wArg, hArg, scrollsArg, waitArg] = process.argv;
const width = Number(wArg) || 1600;
const height = Number(hArg) || 1000;
const scrolls = (scrollsArg || '0').split(',').map(Number);
const waitMs = Number(waitArg) || 4000;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    `--window-size=${width},${height}`
  ]
});

const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
// Skip the intro preloader so scroll is never locked during capture.
await page.evaluateOnNewDocument(() => {
  try { sessionStorage.setItem('rs-preloader-seen', '1'); } catch { /* ignore */ }
});
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, waitMs));

for (const y of scrolls) {
  // Scroll, then verify — Lenis/ScrollTrigger refresh can drift the position.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate((top) => {
      if (window.__lenis) window.__lenis.scrollTo(top, { immediate: true });
      else window.scrollTo(0, top);
    }, y);
    await new Promise((r) => setTimeout(r, 900));
    const actual = await page.evaluate(() => Math.round(window.scrollY));
    if (Math.abs(actual - y) <= 4) break;
  }
  await new Promise((r) => setTimeout(r, 700));
  const name = `${out}-${y}.png`;
  await page.screenshot({ path: name });
  console.log('saved', name, 'scrollY=', await page.evaluate(() => Math.round(window.scrollY)));
}

if (errors.length) {
  console.log('PAGE ERRORS:');
  for (const e of [...new Set(errors)].slice(0, 20)) console.log(' -', e);
}

await browser.close();
