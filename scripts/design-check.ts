/**
 * Checks every design piece in Chrome against the production build, and writes missing
 * thumbnails. Spec: .planning/specs/2026-10-06-design-section-design.md, section 9.
 *
 *   npm run design:check                       thumbnails, build, start, check
 *   npm run design:check -- --no-build         reuse the last `next build`
 *   npm run design:check -- --refresh-thumbs   recapture every thumbnail
 *
 * Needs Google Chrome: playwright-core drives the installed browser and downloads nothing.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { access } from 'node:fs/promises';
import { createServer, type AddressInfo } from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Browser, type Page } from 'playwright-core';
import {
  THUMB_CSS_HEIGHT,
  THUMB_CSS_WIDTH,
  THUMB_SCALE,
  pieceFileUrl,
  pieceUrl,
  type ThumbTheme,
} from '../src/lib/design/assets';
import {
  classifyLinks,
  isFrameableBySite,
  judgeDocumentFrame,
  stickyNote,
  type AnchorInfo,
} from '../src/lib/design/check';
import { SCREEN_MIN_HEIGHT } from '../src/lib/design/frameFit';
import { getAllPieces, piecesDir, type Piece } from '../src/lib/design/pieces';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 900 },
  { name: 'phone', width: 390, height: 844 },
] as const;
type Viewport = (typeof VIEWPORTS)[number];

interface PieceResult {
  piece: Piece;
  cells: Record<Viewport['name'], string>;
  failures: string[];
  notes: string[];
  wouldPassAsDocument: Record<Viewport['name'], boolean>;
  /** The most sticky elements seen in the framed piece at any viewport. */
  stickyCount: number;
}

const root = process.cwd();
const nextBin = path.join(root, 'node_modules', '.bin', 'next');
const args = new Set(process.argv.slice(2));

async function exists(file: string): Promise<boolean> {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address() as AddressInfo;
      probe.close(() => resolve(port));
    });
  });
}

function run(command: string, commandArgs: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`next ${commandArgs.join(' ')} exited with ${code}`)),
    );
  });
}

async function startServer(port: number): Promise<ChildProcess> {
  const server = spawn(nextBin, ['start', '-H', '127.0.0.1', '-p', String(port)], {
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`http://127.0.0.1:${port}/`)).ok) return server;
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  server.kill();
  throw new Error(`next start did not answer on port ${port} within 60s`);
}

/** Thumbnails come from the file on disk, so they exist before the build that requires them. */
async function captureThumbnails(browser: Browser, pieces: Piece[], refresh: boolean): Promise<void> {
  for (const piece of pieces) {
    for (const theme of ['light', 'dark'] as ThumbTheme[]) {
      const out = path.join(piecesDir(root), piece.slug, `thumb-${theme}.png`);
      if (!refresh && (await exists(out))) continue;
      // A fresh context per capture, so a theme saved in localStorage can't leak in.
      const context = await browser.newContext({
        viewport: { width: THUMB_CSS_WIDTH, height: THUMB_CSS_HEIGHT },
        deviceScaleFactor: THUMB_SCALE,
        colorScheme: theme,
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      await page.goto(pathToFileURL(path.join(piecesDir(root), piece.slug, 'index.html')).href, { waitUntil: 'load' });
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: out });
      await context.close();
      console.log(`wrote ${path.relative(root, out)}`);
    }
  }
}

/** A page that collects CSP violations, uncaught errors, console errors and frame-guard warnings. */
async function openPage(browser: Browser, viewport: Viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
  // Vercel serves its analytics script; next start answers with an HTML 404 that Chrome
  // refuses to run and logs as an error. An empty script keeps real console errors visible.
  await context.route('**/_vercel/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }),
  );
  await context.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __cspViolations: string[] }).__cspViolations = seen;
    document.addEventListener('securitypolicyviolation', (event) => {
      seen.push(`${event.violatedDirective} blocked ${event.blockedURI || 'inline code'}`);
    });
  });
  const page = await context.newPage();
  const errors: string[] = [];
  const guardWarnings: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.type() === 'warning' && message.text().startsWith('[design]')) guardWarnings.push(message.text());
  });
  return { context, page, errors, guardWarnings };
}

async function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations);
}

/** The piece's own height in a window as wide as the frame and as tall as the viewport. */
async function heightInWindow(page: Page, src: string, width: number, height: number): Promise<number> {
  const measured = await page.evaluate(
    async ({ src, width, height }) => {
      const probe = document.createElement('iframe');
      probe.style.cssText = `position:absolute;left:-30000px;top:0;width:${width}px;height:${height}px;border:0;visibility:hidden`;
      const loaded = new Promise((resolve) => probe.addEventListener('load', resolve, { once: true }));
      probe.src = src;
      document.body.append(probe);
      await loaded;
      await new Promise((resolve) => setTimeout(resolve, 300));
      const doc = probe.contentDocument;
      const measured = doc ? Math.ceil(doc.documentElement.getBoundingClientRect().height) : null;
      probe.remove();
      return measured;
    },
    { src, width, height },
  );
  if (measured === null) throw new Error(`${src} did not load in a frame (blocked or missing)`);
  return measured;
}

/** Waits until the page's PieceFrame stops changing height, then reads it. */
async function settledFrame(page: Page): Promise<{ frameHeight: number; ownScrollbar: boolean }> {
  const settled = await page.evaluate(async () => {
    const frame = document.querySelector<HTMLIFrameElement>('iframe[data-piece-frame]')!;
    const deadline = performance.now() + 10_000;
    let last = -1;
    let stableSince = performance.now();
    while (performance.now() < deadline) {
      if (frame.offsetHeight !== last) {
        last = frame.offsetHeight;
        stableSince = performance.now();
      } else if (performance.now() - stableSince > 700) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const scroller = frame.contentDocument?.scrollingElement;
    if (!scroller) return null;
    return { frameHeight: frame.offsetHeight, ownScrollbar: scroller.scrollHeight > frame.clientHeight + 1 };
  });
  if (!settled) throw new Error('the piece did not load in its frame (blocked or missing)');
  return settled;
}

/** How a screen piece would fare as a document frame: grow an offscreen frame until it fits. */
async function simulateDocument(page: Page, src: string, width: number, startHeight: number, limit: number) {
  const simulated = await page.evaluate(
    async ({ src, width, startHeight, limit }) => {
      const frame = document.createElement('iframe');
      frame.style.cssText = `position:absolute;left:-30000px;top:0;width:${width}px;height:${startHeight}px;border:0;visibility:hidden`;
      const loaded = new Promise((resolve) => frame.addEventListener('load', resolve, { once: true }));
      frame.src = src;
      document.body.append(frame);
      await loaded;
      const doc = frame.contentDocument;
      if (!doc) {
        frame.remove();
        return null;
      }
      let runaway = false;
      for (let i = 0; i < 40; i++) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const height = Math.ceil(doc.documentElement.getBoundingClientRect().height);
        if (height === frame.offsetHeight) break;
        if (height > limit) {
          runaway = true;
          break;
        }
        frame.style.height = `${height}px`;
      }
      const result = {
        frameHeight: frame.offsetHeight,
        ownScrollbar: (doc.scrollingElement?.scrollHeight ?? 0) > frame.clientHeight + 1,
        runaway,
      };
      frame.remove();
      return result;
    },
    { src, width, startHeight, limit },
  );
  if (!simulated) throw new Error(`${src} did not load in a frame (blocked or missing)`);
  return simulated;
}

async function checkRawFile(
  browser: Browser,
  base: string,
  viewport: Viewport,
  result: PieceResult,
  published: Set<string>,
): Promise<void> {
  const { piece } = result;
  const { context, page, errors } = await openPage(browser, viewport);
  try {
    const response = await page.goto(`${base}${pieceFileUrl(piece.slug)}`, { waitUntil: 'load' });
    if (!response || !response.ok()) {
      result.failures.push(`${viewport.name}: ${pieceFileUrl(piece.slug)} answered ${response?.status() ?? 'nothing'}`);
      return;
    }
    await page.waitForTimeout(500);
    if (!isFrameableBySite(await response.headersArray())) {
      result.failures.push(`${viewport.name}: ${pieceFileUrl(piece.slug)} is not frameable by the site; check the header rule in next.config.ts`);
    }
    for (const violation of await cspViolations(page)) result.failures.push(`${viewport.name}: CSP ${violation}`);
    for (const error of errors) result.failures.push(`${viewport.name}: ${error}`);

    if (viewport.name === 'desktop') {
      const anchors: AnchorInfo[] = await page.evaluate(() =>
        [...document.querySelectorAll('a[href]')].map((a) => ({
          href: a.getAttribute('href') ?? '',
          target: a.getAttribute('target'),
          download: a.hasAttribute('download'),
        })),
      );
      const location = await page.evaluate(() => ({ baseUrl: document.baseURI, documentUrl: document.URL }));
      const links = classifyLinks(anchors, location, published);
      if (links.sameTabOutbound.length > 0) {
        result.notes.push(`${links.sameTabOutbound.length} outbound link(s) open in the same tab; the frame sends them to the whole tab`);
      }
      for (const url of links.unpublishedPieces) result.notes.push(`links to ${new URL(url).pathname}, which is not published`);
    }
  } finally {
    await context.close();
  }
}

/** The most sticky elements in the framed piece, which stop sticking once a document frame grows to fit. */
async function countSticky(page: Page): Promise<number> {
  return page.evaluate(() => {
    const doc = document.querySelector<HTMLIFrameElement>('iframe[data-piece-frame]')?.contentDocument;
    const view = doc?.defaultView;
    if (!doc || !view) return 0;
    return [...doc.querySelectorAll('*')].filter((element) => view.getComputedStyle(element).position === 'sticky').length;
  });
}

async function checkPiecePage(browser: Browser, base: string, viewport: Viewport, result: PieceResult): Promise<void> {
  const { piece } = result;
  const { context, page, errors, guardWarnings } = await openPage(browser, viewport);
  try {
    const response = await page.goto(`${base}${pieceUrl(piece.slug)}`, { waitUntil: 'load' });
    if (!response || response.status() !== 200) {
      result.failures.push(
        `${viewport.name}: ${pieceUrl(piece.slug)} answered ${response?.status() ?? 'nothing'}; if the piece is new since the last build, run without --no-build`,
      );
      return;
    }
    if (response.headers()['x-frame-options'] !== 'DENY') {
      result.failures.push(`${viewport.name}: ${pieceUrl(piece.slug)} lost X-Frame-Options: DENY`);
    }
    const frame = page.locator('iframe[data-piece-frame]');
    const width = await frame.evaluate((element) => (element as HTMLIFrameElement).clientWidth);
    const src = pieceFileUrl(piece.slug);
    const windowHeight = await heightInWindow(page, src, width, viewport.height);

    if (piece.frontMatter.layout === 'document') {
      let verdict = judgeDocumentFrame({ windowHeight, ...(await settledFrame(page)), runaway: guardWarnings.length > 0 });
      result.stickyCount = Math.max(result.stickyCount, await countSticky(page));
      if (verdict.pass) {
        // A warm cache lets the iframe finish loading before hydration; the frame must still fit.
        await page.reload({ waitUntil: 'load' });
        const again = judgeDocumentFrame({ windowHeight, ...(await settledFrame(page)), runaway: guardWarnings.length > 0 });
        if (!again.pass) verdict = { pass: false, summary: `${again.summary} (on a second, cached visit)` };
      }
      result.cells[viewport.name] = verdict.summary;
      if (!verdict.pass) result.failures.push(`${viewport.name}: ${verdict.summary}`);
    } else {
      const box = await frame.boundingBox();
      const fits = box !== null && (box.y + box.height <= viewport.height + 1 || Math.round(box.height) <= SCREEN_MIN_HEIGHT);
      if (!fits) result.failures.push(`${viewport.name}: the screen frame runs past the first screen`);
      const simulated = await simulateDocument(page, src, width, Math.round(viewport.height * 0.85), 4 * windowHeight);
      const verdict = judgeDocumentFrame({ windowHeight, ...simulated });
      result.wouldPassAsDocument[viewport.name] = verdict.pass;
      result.cells[viewport.name] = `screen; as a document frame it would be ${verdict.summary}`;
    }
    for (const error of errors) result.failures.push(`${viewport.name}: ${error}`);
  } finally {
    await context.close();
  }
}

function report(results: PieceResult[]): void {
  for (const result of results) {
    const status = result.failures.length > 0 ? 'FAIL' : 'ok  ';
    console.log(`\n${status}  ${result.piece.slug}  (layout: ${result.piece.frontMatter.layout})`);
    for (const viewport of VIEWPORTS) console.log(`      ${viewport.name.padEnd(8)} ${result.cells[viewport.name]}`);
    for (const failure of result.failures) console.log(`      x ${failure}`);
    for (const note of result.notes) console.log(`      - ${note}`);
  }
}

async function main(): Promise<void> {
  const pieces = await getAllPieces(root, { requireThumbnails: false });
  if (pieces.length === 0) {
    console.log('No pieces in src/content/design.');
    return;
  }
  const browser = await chromium.launch({ channel: 'chrome' });
  let server: ChildProcess | undefined;
  try {
    await captureThumbnails(browser, pieces, args.has('--refresh-thumbs'));
    if (!args.has('--no-build')) await run(nextBin, ['build']);
    const port = await freePort();
    server = await startServer(port);
    const base = `http://127.0.0.1:${port}`;
    const published = new Set(pieces.map((piece) => piece.slug));

    const results: PieceResult[] = [];
    for (const piece of pieces) {
      const result: PieceResult = {
        piece,
        cells: { desktop: '', phone: '' },
        failures: [],
        notes: [],
        wouldPassAsDocument: { desktop: false, phone: false },
        stickyCount: 0,
      };
      for (const viewport of VIEWPORTS) {
        try {
          await checkRawFile(browser, base, viewport, result, published);
          await checkPiecePage(browser, base, viewport, result);
        } catch (error) {
          // Report what went wrong and move on, so one broken piece never hides the rest.
          const message = error instanceof Error ? error.message.split('\n')[0] : String(error);
          result.failures.push(`${viewport.name}: the check stopped: ${message}`);
        }
      }
      const sticky = piece.frontMatter.layout === 'document' ? stickyNote(result.stickyCount) : null;
      if (sticky) result.notes.push(sticky);
      if (piece.frontMatter.layout === 'screen' && result.wouldPassAsDocument.desktop && result.wouldPassAsDocument.phone) {
        result.notes.push('would pass as a document frame at both widths; layout: document lets it flow with the page');
      }
      results.push(result);
    }
    report(results);
    process.exitCode = results.some((result) => result.failures.length > 0) ? 1 : 0;
  } finally {
    server?.kill();
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
