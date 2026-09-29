// Loads the real extension in Chromium and toggles it on fixture pages served as reddit.com.
// Reddit blocks automated browsers, so the fixtures stand in for the live site.
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixture = (name) => readFileSync(join(root, 'test/fixtures', name), 'utf8');

// A toolbar click grants activeTab, which a script can't fake. The test copy gets host access instead.
const ext = mkdtempSync(join(tmpdir(), 'rc-ext-'));
for (const f of ['manifest.json', 'index.js', 'censor.js', 'icons']) cpSync(join(root, f), join(ext, f), { recursive: true });
const manifest = JSON.parse(readFileSync(join(ext, 'manifest.json'), 'utf8'));
manifest.host_permissions = ['<all_urls>'];
writeFileSync(join(ext, 'manifest.json'), JSON.stringify(manifest));

const ctx = await chromium.launchPersistentContext(mkdtempSync(join(tmpdir(), 'rc-profile-')), {
  channel: 'chromium',
  executablePath: process.env.CHROME_PATH,
  headless: true,
  args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
});
await ctx.route('https://www.reddit.com/**', (r) => r.fulfill({ contentType: 'text/html', body: fixture('new.html') }));
await ctx.route('https://old.reddit.com/**', (r) => r.fulfill({ contentType: 'text/html', body: fixture('old.html') }));
await ctx.route('https://example.com/**', (r) => r.fulfill({ contentType: 'text/html', body: fixture('old.html') }));

const sw = ctx.serviceWorkers()[0] ?? (await ctx.waitForEvent('serviceworker'));
const page = await ctx.newPage();

// Same code path as a toolbar click.
const click = () =>
  sw.evaluate(async (url) => {
    const [tab] = await chrome.tabs.query({ url });
    await toggle(tab);
    return chrome.action.getBadgeText({ tabId: tab.id });
  }, page.url());

const look = (sel) =>
  page.evaluate((sel) => {
    const el = sel.split(' >>> ').reduce((root, part) => (root.shadowRoot ?? root).querySelector(part), document);
    const s = getComputedStyle(el);
    return { bg: s.backgroundColor, color: s.color, fill: s.webkitTextFillColor, visibility: s.visibility, style: el.getAttribute('style') };
  }, sel);

const censored = (s) => s.bg !== 'rgba(0, 0, 0, 0)' && s.fill === s.bg;
const frame = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

let failed = 0;
async function test(name, fn) {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    failed++;
    console.log(`FAIL ${name}\n     ${e.message.split('\n').join('\n     ')}`);
  }
}

await page.goto('https://www.reddit.com/r/test/comments/abc/title/');
const before = await look('#bob-2');

await test('new reddit: click turns badge on', async () => assert.equal(await click(), 'ON'));
await test('new reddit: post author, comment author, mention are covered', async () => {
  for (const id of ['#post-author', '#bob-1', '#bob-2', '#mention']) assert.ok(censored(await look(id)), id);
});
await test('new reddit: child span with its own color is covered', async () => {
  const [link, span] = [await look('#bob-1'), await look('#bob-1 span')];
  assert.equal(span.fill, link.bg);
});
await test('same user gets the same color, whatever the case or link form', async () => {
  assert.equal((await look('#bob-1')).bg, (await look('#bob-2')).bg);
  assert.equal((await look('#post-author')).bg, (await look('#mention')).bg);
  assert.equal((await look('#avatar')).bg, (await look('#bob-1')).bg);
});
await test('different users get different colors', async () => {
  assert.notEqual((await look('#bob-1')).bg, (await look('#post-author')).bg);
});
await test('avatar image is hidden', async () => assert.equal((await look('#avatar img')).visibility, 'hidden'));
await test('link inside a shadow root is covered', async () => assert.ok(censored(await look('#card >>> #inner'))));
await test('non-profile links are untouched', async () => {
  for (const id of ['#post-link', '#sub', '#tab']) assert.ok(!censored(await look(id)), id);
});
await test('comments added later are covered', async () => {
  await page.evaluate(() => window.addLazyComment());
  await frame();
  assert.ok(censored(await look('#lazy')));
});
await test('second click restores the page and clears the badge', async () => {
  assert.equal(await click(), '');
  for (const id of ['#post-author', '#bob-1', '#mention', '#lazy', '#card >>> #inner']) assert.ok(!censored(await look(id)), id);
  assert.deepEqual(await look('#bob-2'), before);
  assert.equal((await look('#avatar img')).visibility, 'visible');
  assert.equal((await look('#post-author')).style, null);
});
await test('off stays off when the page changes', async () => {
  await page.evaluate(() => window.addLazyComment());
  await frame();
  assert.ok(!censored(await look('shreddit-comment:last-child a')));
});
await test('third click turns it back on', async () => {
  assert.equal(await click(), 'ON');
  assert.ok(censored(await look('#bob-1')));
});

await page.goto('https://old.reddit.com/r/test/comments/abc/title/');
await test('old reddit: authors and own username are covered', async () => {
  assert.equal(await click(), 'ON');
  for (const id of ['#me', '#op', '#c1', '#c2']) assert.ok(censored(await look(id)), id);
  assert.equal((await look('#op')).bg, (await look('#c2')).bg);
  assert.ok(!censored(await look('#deleted')));
});

await page.goto('https://example.com/');
await test('other sites: nothing happens', async () => {
  assert.equal(await click(), '');
  assert.ok(!censored(await look('#c1')));
});

await ctx.close();
console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
