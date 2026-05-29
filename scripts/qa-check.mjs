import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = 'dist';
const SRC = 'src';
const BASE = '/FANDEX/';
let errors = 0;
let warnings = 0;

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}
function fail(msg) {
  errors++;
  console.error(`  [FAIL] ${msg}`);
}
function warn(msg) {
  warnings++;
  console.warn(`  [WARN] ${msg}`);
}

async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function walkDir(dir, ext, fn) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walkDir(full, ext, fn);
    else if (entry.name.endsWith(ext)) await fn(full);
  }
}

async function checkNojekyll() {
  if (await fileExists(join(DIST, '.nojekyll'))) pass('.nojekyll exists');
  else fail('.nojekyll missing - GitHub Pages may ignore underscore-prefixed files');
}

async function checkIndexHtml() {
  if (await fileExists(join(DIST, 'index.html'))) pass('index.html exists');
  else fail('index.html missing - homepage will 404');
}

async function check404Html() {
  if (await fileExists(join(DIST, '404.html'))) pass('404.html exists');
  else fail('404.html missing - custom 404 page unavailable');
}

async function checkPageCount() {
  const htmlFiles = [];
  await walkDir(DIST, '.html', (f) => htmlFiles.push(f));
  if (htmlFiles.length >= 200) pass(`Page count: ${htmlFiles.length}`);
  else warn(`Page count low: ${htmlFiles.length} (expected 200+)`);
}

async function checkPagefindIndex() {
  const pagefindDir = join(DIST, 'pagefind');
  if (await fileExists(pagefindDir)) {
    const files = await readdir(pagefindDir);
    const hasIndex = files.some((f) => f.startsWith('pagefind.') && f.endsWith('.js'));
    if (hasIndex) pass('Pagefind search index exists');
    else warn('Pagefind directory exists but no index JS found');
  } else {
    warn('Pagefind index not found - search will not work');
  }
}

async function checkBaseHref() {
  const indexHtml = await readFile(join(DIST, 'index.html'), 'utf-8');
  const hasBase = indexHtml.includes(BASE) || indexHtml.includes('href="/FANDEX/"');
  if (hasBase) pass(`Base URL ${BASE} found in index.html`);
  else fail(`Base URL ${BASE} not found - links may be broken on GitHub Pages`);
}

async function checkNoAbsoluteRootLinks() {
  let brokenCount = 0;
  await walkDir(DIST, '.html', async (full) => {
    const content = await readFile(full, 'utf-8');
    const broken = content.match(/href="\/(?!FANDEX)[^"]+"/g);
    if (broken) brokenCount += broken.length;
  });
  if (brokenCount === 0) pass('No absolute root links found');
  else warn(`Found ${brokenCount} potential absolute root links (may 404 on GitHub Pages)`);
}

async function checkSitemap() {
  if (await fileExists(join(DIST, 'sitemap-index.xml'))) pass('sitemap-index.xml exists');
  else warn('sitemap-index.xml missing - SEO may be affected');
}

async function checkRobotsTxt() {
  if (await fileExists(join(DIST, 'robots.txt'))) pass('robots.txt exists');
  else warn('robots.txt missing');
}

async function checkLargeFiles() {
  const LARGE_THRESHOLD = 500 * 1024;
  const largeFiles = [];
  await walkDir(DIST, '', async (full) => {
    const s = await stat(full);
    if (s.size > LARGE_THRESHOLD) largeFiles.push({ path: full, size: s.size });
  });
  if (largeFiles.length === 0) pass('No files over 500KB');
  else {
    for (const f of largeFiles) {
      warn(`Large file: ${f.path} (${(f.size / 1024).toFixed(0)}KB)`);
    }
  }
}

async function checkDarkModeSupport() {
  let hasDarkToggle = false;
  let hasFlashPrevention = false;
  await walkDir(DIST, '.html', async (full) => {
    const content = await readFile(full, 'utf-8');
    if (content.includes('data-theme')) hasDarkToggle = true;
    if (content.includes('fandex-theme')) hasFlashPrevention = true;
  });
  if (hasDarkToggle) pass('Dark mode toggle present');
  else fail('Dark mode toggle missing');
  if (hasFlashPrevention) pass('Dark mode flash prevention present');
  else warn('Dark mode flash prevention may be missing');
}

async function checkResponsiveMeta() {
  const indexHtml = await readFile(join(DIST, 'index.html'), 'utf-8');
  if (indexHtml.includes('viewport')) pass('Viewport meta tag present');
  else fail('Viewport meta tag missing - mobile layout broken');
}

async function checkShikiHighlighting() {
  let hasShiki = false;
  await walkDir(DIST, '.html', async (full) => {
    const content = await readFile(full, 'utf-8');
    if (content.includes('shiki') || content.includes('--shiki')) hasShiki = true;
  });
  if (hasShiki) pass('Shiki syntax highlighting present');
  else warn('No Shiki highlighting detected in output');
}

async function checkJsonLd() {
  let hasJsonLd = false;
  await walkDir(DIST, '.html', async (full) => {
    const content = await readFile(full, 'utf-8');
    if (content.includes('application/ld+json')) hasJsonLd = true;
  });
  if (hasJsonLd) pass('JSON-LD structured data present');
  else warn('No JSON-LD structured data found - SEO may be affected');
}

async function checkNo100vh() {
  const srcDirs = [join(SRC, 'styles'), join(SRC, 'components'), join(SRC, 'pages')];
  let found = [];
  for (const dir of srcDirs) {
    if (!(await fileExists(dir))) continue;
    await walkDir(dir, '.css', async (full) => {
      const content = await readFile(full, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (line.includes('100vh') && !line.includes('100dvh')) {
          const nextLine = lines[i + 1] || '';
          if (!nextLine.includes('100dvh')) {
            found.push(`${full}:${i + 1}: ${line.trim()}`);
          }
        }
      });
    });
    await walkDir(dir, '.astro', async (full) => {
      const content = await readFile(full, 'utf-8');
      const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
      if (!styleMatch) return;
      styleMatch.forEach((block) => {
        const lines = block.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('100vh') && !line.includes('100dvh')) {
            const nextLine = lines[i + 1] || '';
            if (!nextLine.includes('100dvh')) {
              found.push(`${full}:style:${i + 1}: ${line.trim()}`);
            }
          }
        });
      });
    });
  }
  if (found.length === 0) pass('No bare 100vh usage (all use 100dvh fallback)');
  else {
    for (const f of found) warn(`Bare 100vh: ${f}`);
  }
}

async function checkNoConsoleLog() {
  let found = [];
  await walkDir(SRC, '.ts', async (full) => {
    const content = await readFile(full, 'utf-8');
    const lines = content.split('\n');
    lines.forEach((line, i) => {
      if (/\bconsole\.(log|debug)\b/.test(line) && !line.includes('//')) {
        found.push(`${full}:${i + 1}: ${line.trim()}`);
      }
    });
  });
  if (found.length === 0) pass('No console.log/debug in source');
  else {
    for (const f of found) warn(`Console log: ${f}`);
  }
}

async function checkPreconnect() {
  const indexHtml = await readFile(join(DIST, 'index.html'), 'utf-8');
  if (indexHtml.includes('preconnect')) pass('Resource preconnect hints present');
  else warn('No preconnect hints - font loading may be slow');
}

async function checkLazyLoading() {
  let hasLazy = false;
  await walkDir(DIST, '.html', async (full) => {
    const content = await readFile(full, 'utf-8');
    if (content.includes('loading="lazy"')) hasLazy = true;
  });
  if (hasLazy) pass('Image lazy loading present');
  else warn('No lazy loading detected (no images or not configured)');
}

console.log('\n+------------------------------------------+');
console.log('|     FANDEX PRE-LAUNCH QUALITY CHECK      |');
console.log('+------------------------------------------+\n');

console.log('[Dimension 1: File Audit]');
await checkNojekyll();
await checkRobotsTxt();
await checkLargeFiles();

console.log('\n[Dimension 2: Web Architecture]');
await checkIndexHtml();
await check404Html();
await checkBaseHref();
await checkNoAbsoluteRootLinks();
await checkResponsiveMeta();
await checkDarkModeSupport();
await checkPreconnect();
await checkLazyLoading();

console.log('\n[Dimension 3: Content Processing]');
await checkPageCount();
await checkPagefindIndex();

console.log('\n[Dimension 4: Reading Experience]');
await checkShikiHighlighting();
await checkJsonLd();

console.log('\n[Dimension 5: CI/CD]');
await checkSitemap();

console.log('\n[Dimension 6: Quality Control]');
await checkNo100vh();
await checkNoConsoleLog();

console.log(`\n+------------------------------------------+`);
console.log(`|  Results: ${errors} errors, ${warnings} warnings`);
console.log(`+------------------------------------------+\n`);
process.exit(errors > 0 ? 1 : 0);
