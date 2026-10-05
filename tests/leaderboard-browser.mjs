// Run against the local Vite server. Every API call is intercepted; no scores
// or sessions are sent to production. Set PLAYWRIGHT_MODULE if not installed locally.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {}), args: ['--enable-webgl', '--use-angle=swiftshader'] });
const origin = process.env.GAME_ORIGIN || 'http://127.0.0.1:5175';
const observations = [];
const emptyBoard = () => ({ asOf: new Date().toISOString(), timezone: 'Asia/Seoul', weekly: { start: '2020-01-01T00:00:00Z', end: '2099-01-01T00:00:00Z', entries: [] }, monthly: { start: '2020-01-01T00:00:00Z', end: '2099-01-01T00:00:00Z', entries: [] }, glass: { start: null, end: null, entries: [] } });
async function fixture(viewport, mode = 'empty') {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [], counts = { get: 0, sessions: 0, runs: 0 }, payloads = [];
  let failGet = mode === 'error', sessionFailure = mode === 'session-error';
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/v1/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let data, status = 200;
    if (path === '/v1/leaderboards') {
      counts.get++;
      if (failGet) { status = 503; data = { error: { code: 'SERVICE_UNAVAILABLE' } }; }
      else {
        data = emptyBoard();
        if (mode === 'cutoff') for (const kind of ['weekly', 'monthly']) data[kind].entries = Array.from({ length: 10 }, (_, i) => ({ nickname: i ? 'same' : '<img src=x onerror=alert(1)>', score: 1000000 - i, playDurationSeconds: 2, completedAt: new Date().toISOString() }));
      }
    } else if (path === '/v1/sessions') {
      counts.sessions++;
      assert.deepEqual(route.request().postDataJSON(), {version:'jinki-v2'});
      if (sessionFailure) { status = 503; data = { error: { code: 'SERVICE_UNAVAILABLE' } }; }
      else { status = 201; data = { sessionId: 'mock', sessionToken: 'mock-only-token', startedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 7515000).toISOString(), version: 'jinki-v2', timing: { maxDurationSeconds: 7200, clockSkewSeconds: 120, submissionGraceSeconds: 300, transportToleranceSeconds: 15 } }; }
    } else if (path === '/v1/runs') {
      counts.runs++;
      const payload = route.request().postDataJSON(); payloads.push(payload);
      data = { submissionId: payload.submissionId, accepted: true, qualified: { weekly: false, monthly: false, glass: false } };
    } else throw new Error(`Unexpected API path: ${path}`);
    await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.goto(origin);
  return { context, page, counts, errors, payloads, recover: () => { failGet = false; sessionFailure = false; } };
}
async function start(page) {
  await page.locator('.glass-launch').click();
  await page.getByRole('button', { name: 'Pause game', exact: true }).waitFor({ timeout: 45000 });
  await page.waitForFunction(() => !document.querySelector('.glass-loading'), { timeout: 45000 });
}
async function finish(page) {
  await page.getByRole('button', { name: 'Pause game', exact: true }).click();
  await page.getByRole('button', { name: 'Finish run & view score', exact: true }).click();
}
try {
  // Shared initial fetch, loading errors, explicit recovery and empty result.
  const error = await fixture({ width: 1280, height: 900 }, 'error');
  await error.page.getByText('Unable to load the leaderboard.', { exact: false }).first().waitFor();
  assert.equal(error.counts.get, 1); error.recover();
  await error.page.getByRole('button', { name: 'Try again', exact: true }).first().click();
  await error.page.getByText(/SMASH/).first().waitFor();
  assert.equal(error.counts.get, 2); await error.context.close();

  for (const mobile of [false, true]) {
    const f = await fixture(mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 });
    await start(f.page); assert.equal(f.counts.sessions, 1); assert.equal(f.counts.get, 1);
    // Real gameplay: a short held shot burst, with actual renderer/event evidence.
    await f.page.locator('.glass-game').focus();
    await f.page.keyboard.down('x'); await f.page.waitForTimeout(3000); await f.page.keyboard.up('x');
    await finish(f.page);
    await f.page.getByLabel('Submit score · nickname', { exact: true }).fill('  Player-1  ');
    await f.page.getByRole('button', { name: 'Submit score', exact: true }).click();
    await f.page.getByText('Score accepted, but it did not make the top 10.').waitFor();
    assert.equal(f.counts.runs, 1); assert.equal(f.counts.get, 2);
    const payload = f.payloads[0];
    assert.equal(payload.nickname, 'Player-1');
    assert.equal(payload.score, payload.evidence.playerGlassShards * 10 + (payload.evidence.enemyKills - payload.evidence.juggernautKills) * 500 + payload.evidence.juggernautKills * 750 + payload.evidence.juggernautCollisionKills * 750 + payload.evidence.oilPitJuggernautKills * 2000 + payload.evidence.concreteTopples * 10);
    assert.equal(payload.evidence.playerGlassShards + payload.evidence.npcGlassShards, payload.evidence.totalDestroyedGlassShards);
    assert.ok(payload.evidence.totalGlassArea > 0);
    observations.push({ viewport: mobile ? '390x844' : '1280x900', passed: true });
    if (mobile) await f.page.getByRole('button', { name: 'View leaderboard' }).click();
    await f.page.getByText('No scores yet. Hit SMASH and claim your spot.').waitFor();
    await f.page.getByRole('button', { name: 'MONTHLY BEST' }).click();
    await f.page.getByRole('button', { name: 'ALL CLEAR BEST' }).click();
    assert.equal(f.counts.get, 2); // Tabs use cached data, never poll/refetch.
    assert.deepEqual(f.errors, []);
    if (process.env.LEADERBOARD_SCREENSHOT_DIR) await f.page.screenshot({ path: `${process.env.LEADERBOARD_SCREENSHOT_DIR}/leaderboard-${mobile ? 'mobile' : 'desktop'}.png` });
    await f.context.close();
  }

  const cutoff = await fixture({ width: 1280, height: 900 }, 'cutoff');
  await start(cutoff.page);
  await finish(cutoff.page);
  await cutoff.page.getByText('Your score is below the current weekly and monthly cutoffs', { exact: false }).waitFor();
  assert.equal(await cutoff.page.locator('#score-nickname').count(), 0);
  assert.equal(cutoff.counts.runs, 0); assert.equal(cutoff.counts.get, 1);
  assert.ok((await cutoff.page.locator('.glass-results td').allTextContents()).includes('<img src=x onerror=alert(1)>'));
  assert.equal(await cutoff.page.locator('.glass-results td img').count(), 0);
  assert.deepEqual(cutoff.errors, []); await cutoff.context.close();

  const failed = await fixture({ width: 1280, height: 900 }, 'session-error');
  await failed.page.locator('.glass-launch').click();
  await failed.page.locator('.glass-loading').getByRole('button', { name: 'Try again' }).waitFor({ timeout: 45000 });
  assert.equal(failed.counts.sessions, 1); assert.equal(failed.counts.runs, 0);
  assert.equal(await failed.page.getByRole('button', { name: 'Pause game', exact: true }).count(), 0);
  failed.recover(); await failed.page.locator('.glass-loading').getByRole('button', { name: 'Try again' }).click();
  await failed.page.waitForFunction(() => !document.querySelector('.glass-loading'), { timeout: 45000 });
  assert.equal(failed.counts.sessions, 2); assert.equal(failed.counts.get, 1);
  assert.deepEqual(failed.errors, []); await failed.context.close();

  if (process.env.LEADERBOARD_OBSERVATIONS) await writeFile(process.env.LEADERBOARD_OBSERVATIONS, JSON.stringify(observations, null, 2));
  console.log('Browser integration passed: desktop/mobile, cached GET, cutoff, empty/error/retry, safe nicknames, real scoring evidence and non-qualifying success. All API calls mocked.');
} finally { await browser.close(); }
