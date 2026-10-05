import test from 'node:test';
import assert from 'node:assert/strict';
import { LeaderboardApi, RankedRun, ApiError } from '../src/leaderboard/client.ts';
import { createEvidence } from '../src/leaderboard/evidence.ts';
import { createRun } from '../src/game/run.ts';
import { createScore } from '../src/game/score.ts';
import { createBoardStore } from '../src/leaderboard/store.ts';
import { shouldSubmit, glassComplete, evidenceError, normalizeNickname, VERSION, ERROR_MESSAGES } from '../src/leaderboard/protocol.ts';

const epoch = Date.parse('2026-10-05T08:00:00.000Z');
const id = 'caa8a290-ef41-402e-9360-cb4e8e2858fd';
const empty = () => createEvidence(100).snapshot();
const response = (body, status = 200, headers) => new Response(JSON.stringify(body), { status, headers });
function harness(handler) {
  let mono = 0, wall = epoch;
  const calls = [], sleeps = [];
  const session = { sessionId: 'session', sessionToken: 'test-only-token', startedAt: new Date(epoch).toISOString(), expiresAt: new Date(epoch + 7_515_000).toISOString(), version: VERSION, timing: { maxDurationSeconds: 7200, clockSkewSeconds: 120, submissionGraceSeconds: 300, transportToleranceSeconds: 15 } };
  const accepted = { submissionId: id, accepted: true, qualified: { weekly: false, monthly: false, glass: false } };
  const advance = (ms, wallMs = ms) => { mono += ms; wall += wallMs; };
  const api = new LeaderboardApi('https://mock.invalid', {
    mono: () => mono, wall: () => wall, uuid: () => id, random: () => .5,
    sleep: async ms => { sleeps.push(ms); advance(ms); },
    fetch: async (url, init) => { calls.push({ url, ...init }); return handler ? handler(url, init, calls, session, accepted) : response(url.endsWith('sessions') ? session : accepted, url.endsWith('sessions') ? 201 : 200); },
  });
  return { api, run: new RankedRun(api), calls, sleeps, advance, session, accepted };
}
const boards = () => ({ asOf: new Date(epoch).toISOString(), timezone: 'Asia/Seoul', weekly: { start: '2026-10-04T15:00:00Z', end: '2026-10-11T15:00:00Z', entries: [] }, monthly: { start: '2026-09-30T15:00:00Z', end: '2026-10-31T15:00:00Z', entries: [] }, glass: { start: null, end: null, entries: [] } });

test('session must resolve before gameplay; duplicate starts share one request and cancel rejects stale success', async () => {
  let resolve;
  const h = harness((_url, _init, _calls, session) => new Promise(r => { resolve = () => r(response(session, 201)); }));
  let started = false;
  const first = h.run.start(); const duplicate = h.run.start();
  first.then(() => { started = true; }, () => {});
  assert.equal(first, duplicate); assert.equal(h.calls.length, 1); assert.equal(started, false);
  h.advance(5000); resolve(); await first;
  assert.equal(started, true); assert.equal(h.run.elapsed, 0);
  assert.equal(h.calls[0].headers.Origin, undefined); assert.equal(h.calls[0].credentials, 'omit');
  assert.equal(h.calls[0].body, JSON.stringify({ version: VERSION }));
  const stale = harness((_u, _i, _c, session) => new Promise(r => { resolve = () => r(response(session, 201)); }));
  const pending = stale.run.start(); stale.run.cancel(); resolve();
  await assert.rejects(pending, { name: 'AbortError' });
  assert.throws(() => stale.run.finish(0, empty()), /NO_ACTIVE_GAME/);
});

test('a newer start cannot be overwritten by an old cancelled response', async () => {
  const resolvers = [];
  const h = harness((_u, _i, _c, session) => new Promise(r => resolvers.push(() => r(response(session, 201)))));
  const old = h.run.start(); h.run.cancel(); const current = h.run.start();
  resolvers[1](); await current; h.advance(1000); resolvers[0]();
  await assert.rejects(old, { name: 'AbortError' }); assert.equal(h.run.elapsed, 1);
});

test('slow sessions are discarded, including wall time lost to OS suspension', async () => {
  for (const mode of ['mono', 'wall']) {
    let resolve; const h = harness((_u, _i, _c, session) => new Promise(r => { resolve = () => r(response(session, 201)); }));
    const pending = h.run.start(); h.advance(mode === 'mono' ? 15001 : 0, 15001); resolve();
    await assert.rejects(pending, /SESSION_START_TOO_SLOW/);
    assert.throws(() => h.run.finish(0, empty()), /NO_ACTIVE_GAME/);
  }
});

test('death/respawn preserves score, counters and real elapsed time; completion freezes before nickname entry', async () => {
  const h = harness(); await h.run.start();
  const life = createRun(), events = createEvidence(100), score = createScore(events);
  events.destroy(1, 20, 'player'); score.glass(0, 1); score.kill();
  h.advance(2000); life.advance(.035); assert.equal(life.die(), false);
  h.advance(60000); // Hidden tab / pause: no simulation advance, real time continues.
  assert.equal(h.run.elapsed, 62); assert.equal(score.points, 510); assert.equal(events.snapshot().enemyKills, 1);
  assert.equal(life.die(), true);
  const c = h.run.finish(score.points, events.snapshot());
  assert.equal(c.playDurationSeconds, 62); assert.equal(c.completedAt, new Date(epoch + 62000).toISOString());
  h.advance(9000); events.destroy(2, 10, 'npc');
  assert.equal(h.run.finish(999, events.snapshot()), c); assert.equal(c.evidence.totalDestroyedGlassShards, 1);
  await h.run.submit('  \u1100\u1161  ');
  const body = JSON.parse(h.calls[1].body);
  assert.equal(body.nickname, '가'); assert.equal(body.completedAt, c.completedAt); assert.equal(body.playDurationSeconds, 62);
  assert.equal(body.submissionId, id); assert.equal(body.score, 510);
  assert.ok(Buffer.byteLength(h.calls[1].body) <= 4096);
});

test('unreliable clocks, developer use, excess duration and incompatible gameplay scores never submit', async () => {
  for (const [duration, wall, dev, score, code] of [[1000, 4001, false, 0, 'UNRELIABLE_GAME_CLOCK'], [1000, 1000, true, 0, 'DEVELOPER_RUN'], [7201000, 7201000, false, 0, 'INVALID_DURATION'], [1000, 1000, false, 750, 'SCORE_MISMATCH']]) {
    const h = harness(); await h.run.start(); h.advance(duration, wall); if (dev) h.run.markDeveloper();
    assert.equal(h.run.finish(score, empty()).ineligible, code);
    await assert.rejects(h.run.submit('Player'), new RegExp(code)); assert.equal(h.calls.length, 1);
  }
});

test('lost response retries immutable JSON once per handler, all false flags are successful', async () => {
  let attempts = 0;
  const h = harness((url, _init, _calls, session, accepted) => {
    if (url.endsWith('sessions')) return response(session, 201);
    if (++attempts === 1) throw new TypeError('network lost');
    return response(accepted);
  });
  await h.run.start(); h.advance(1000); h.run.finish(0, empty());
  const one = h.run.submit('First'), two = h.run.submit('Changed');
  assert.equal(one, two);
  const result = await one; assert.deepEqual(result.qualified, { weekly: false, monthly: false, glass: false });
  assert.equal(h.calls[1].body, h.calls[2].body); assert.equal(JSON.parse(h.calls[2].body).nickname, 'First');
  assert.equal(await h.run.submit('Another'), result); assert.equal(h.calls.length, 3);
});

test('429 fallback is 60 seconds; readable Retry-After and 503 use bounded backoff', async () => {
  for (const [status, header, expected] of [[429, null, 60000], [429, '75', 75000], [503, null, 1250], [503, '3', 3000]]) {
    let attempts = 0;
    const h = harness((url, _i, _c, session, accepted) => url.endsWith('sessions') ? response(session, 201) : ++attempts === 1 ? response({ error: { code: status === 429 ? 'RATE_LIMITED' : 'SERVICE_UNAVAILABLE' } }, status, header ? { 'Retry-After': header } : {}) : response(accepted));
    await h.run.start(); h.advance(1000); h.run.finish(0, empty()); await h.run.submit('P');
    assert.equal(h.sleeps[0], expected); assert.equal(h.calls[1].body, h.calls[2].body);
  }
});

test('conflicts and every non-transient validation error fail without retry; nickname can be corrected before sending', async () => {
  const codes = ['ORIGIN_DENIED', 'INVALID_NICKNAME', 'INVALID_TOKEN', 'SESSION_EXPIRED', 'UNSUPPORTED_VERSION', 'SESSION_VERSION_MISMATCH', 'INVALID_DURATION', 'INVALID_COMPLETION_TIME', 'INCONSISTENT_COUNTERS', 'INVALID_GLASS_AREA', 'SCORE_MISMATCH', 'SUBMISSION_CONFLICT'];
  for (const code of codes) {
    assert.ok(ERROR_MESSAGES[code]);
    const h = harness((url, _i, _c, session) => url.endsWith('sessions') ? response(session, 201) : response({ error: { code } }, code === 'SUBMISSION_CONFLICT' ? 409 : code === 'ORIGIN_DENIED' ? 403 : 400));
    await h.run.start(); h.advance(1000); h.run.finish(0, empty());
    await assert.rejects(h.run.submit('🤖'), /INVALID_NICKNAME/); assert.equal(h.run.nicknameLocked, false);
    await assert.rejects(h.run.submit('P'), new RegExp(code));
    await assert.rejects(h.run.submit('P'), new RegExp(code)); assert.equal(h.calls.length, 2); assert.equal(h.sleeps.length, 0);
  }
});

test('expiry and completion grace prevent requests; bounded retries stop after three uncertain failures', async () => {
  const expired = harness(); await expired.run.start(); expired.advance(1000); expired.run.finish(0, empty()); expired.advance(301000);
  await assert.rejects(expired.run.submit('P'), /SESSION_EXPIRED/); assert.equal(expired.calls.length, 1);
  const h = harness((url, _i, _c, session) => { if (url.endsWith('sessions')) return response(session, 201); throw new TypeError('offline'); });
  await h.run.start(); h.advance(1000); h.run.finish(0, empty());
  await assert.rejects(h.run.submit('P'), /RETRIES_EXHAUSTED/);
  await assert.rejects(h.run.submit('P'), /RETRIES_EXHAUSTED/);
  assert.equal(h.calls.length, 4); assert.equal(h.sleeps.length, 2);
  const late = harness((url, _i, _c, session) => url.endsWith('sessions') ? response(session, 201) : response({ error: { code: 'RATE_LIMITED' } }, 429));
  await late.run.start(); late.advance(1000); late.run.finish(0, empty()); late.advance(250000);
  await assert.rejects(late.run.submit('P'), /SESSION_EXPIRED/); assert.equal(late.sleeps.length, 0);
});

test('only scores strictly above cached cutoff submit, vacancies and area-complete runs qualify', () => {
  const b = boards(), c = { score: 100, evidence: empty(), completedAt: new Date(epoch).toISOString(), ineligible: null };
  for (const kind of ['weekly', 'monthly']) b[kind].entries = Array.from({ length: 10 }, (_, i) => ({ score: 1000 - i * 100 }));
  assert.equal(shouldSubmit(c, b), false); assert.equal(shouldSubmit({ ...c, score: 101 }, b), true);
  assert.equal(shouldSubmit({ ...c, evidence: { ...empty(), destroyedGlassArea: 100 } }, b), true);
  b.weekly.entries.pop(); assert.equal(shouldSubmit({ ...c, score: 0 }, b), true);
  assert.equal(shouldSubmit({ ...c, ineligible: 'DEVELOPER_RUN' }, b), false);
  assert.equal(shouldSubmit({ ...c, completedAt: '2026-11-01T00:00:00Z' }, b), false);
});

test('one-time shard events, slab subset, NPCs and score mismatch are checked without fudging evidence', () => {
  const e = createEvidence(100), score = createScore(e);
  e.destroy(1, 20, 'player'); e.destroy(1, 20, 'npc'); score.glass(0, 1);
  score.topple(); e.destroy(2, 30, 'slab'); score.glass(1, 2); e.destroy(3, 50, 'npc'); score.glass(2, 3, false); score.kill();
  assert.deepEqual(e.snapshot(), { playerGlassShards: 2, slabGlassShards: 1, npcGlassShards: 1, totalDestroyedGlassShards: 3, enemyKills: 1, concreteTopples: 1, totalGlassArea: 100, destroyedGlassArea: 100, juggernautKills: 0, juggernautCollisionKills: 0, oilPitJuggernautKills: 0 });
  assert.equal(score.points, 530); assert.equal(evidenceError(e.snapshot(), 530), null);
  assert.equal(evidenceError({ ...e.snapshot(), concreteTopples: 0 }, 520), 'INCONSISTENT_COUNTERS');
  score.kill(true); assert.equal(evidenceError(e.snapshot(), score.points), null);
  assert.equal(evidenceError({ ...e.snapshot(), enemyKills: Infinity }, score.points), 'INCONSISTENT_COUNTERS');
  assert.equal(evidenceError({ ...e.snapshot(), destroyedGlassArea: 101 }, score.points), 'INVALID_GLASS_AREA');
});

test('area tolerance never trusts rounded percentages or clamps overshoot', () => {
  assert.equal(glassComplete({ totalGlassArea: 100, destroyedGlassArea: 99.999 }), false);
  assert.equal(glassComplete({ totalGlassArea: 100, destroyedGlassArea: 100 - 1e-8 }), true);
  assert.equal(glassComplete({ totalGlassArea: 100, destroyedGlassArea: 100 + 1e-5 }), false);
  assert.equal(glassComplete({ totalGlassArea: 0, destroyedGlassArea: 0 }), false);
  assert.equal(glassComplete({ totalGlassArea: 1e8, destroyedGlassArea: 1e8 - .05 }), true);
});

test('nickname Unicode code points, NFC normalization, whitespace and unsupported characters', () => {
  assert.equal(normalizeNickname('  김_진기-1  '), '김_진기-1');
  assert.equal(normalizeNickname('𐐀'.repeat(20)), '𐐀'.repeat(20));
  for (const name of ['', ' ', 'a'.repeat(21), '🐱', '<script>', 'a\tb', 'x\u0301']) assert.throws(() => normalizeNickname(name), /INVALID_NICKNAME/);
});

test('shared leaderboard loading, empty success, error and explicit retry; no polling or order changes', async () => {
  let resolve, count = 0;
  const store = createBoardStore({ leaderboards: () => { count++; return new Promise(r => { resolve = r; }); } });
  const states = []; const unsubscribe = store.subscribe(() => states.push(store.getSnapshot().status));
  const first = store.load(), duplicate = store.load(); assert.equal(first, duplicate); assert.equal(count, 1);
  resolve(boards()); await first; assert.deepEqual(states, ['loading', 'ready']);
  assert.deepEqual(store.getSnapshot().data.weekly.entries, []); await store.load(); assert.equal(count, 1);
  const refresh = store.load(true); const b = boards(); b.glass.entries = [{ nickname: 'same', score: 1 }, { nickname: 'same', score: 999 }]; resolve(b); await refresh;
  assert.deepEqual(store.getSnapshot().data.glass.entries.map(e => e.score), [1, 999]); unsubscribe();
  let failed = true;
  const errors = createBoardStore({ leaderboards: async () => { if (failed) throw new ApiError('NETWORK_ERROR'); return boards(); } });
  await assert.rejects(errors.load()); assert.equal(errors.getSnapshot().status, 'error');
  failed = false; await errors.load(true); assert.equal(errors.getSnapshot().status, 'ready');
});

test('signed session expiry stops submission even before the completion grace ends', async () => {
  const h = harness(); h.session.expiresAt = new Date(epoch + 2000).toISOString();
  await h.run.start(); h.advance(1000); h.run.finish(0, empty()); h.advance(1001);
  await assert.rejects(h.run.submit('P'), /SESSION_EXPIRED/); assert.equal(h.calls.length, 1);
});

test('a hanging session request is bounded and aborts its transport', async () => {
  let signal;
  const api = new LeaderboardApi('https://mock.invalid', { fetch: (_url, init) => { signal = init.signal; return new Promise(() => {}); } });
  await assert.rejects(api.request('sessions', JSON.stringify({ version: VERSION }), undefined, 5), /SESSION_START_TOO_SLOW/);
  assert.equal(signal.aborted, true);
});

test('developer activation after completion still blocks every score upload', async () => {
  const h = harness(); await h.run.start(); h.advance(1000);
  assert.equal(h.run.finish(0, empty()).ineligible, null);
  h.run.markDeveloper();
  await assert.rejects(h.run.submit('Player'), /DEVELOPER_RUN/);
  await assert.rejects(h.run.submit('Player'), /DEVELOPER_RUN/);
  assert.equal(h.calls.filter(call => call.url.endsWith('/runs')).length, 0);
});

test('developer activation during retry backoff prevents another score request', async () => {
  const h = harness((url, _init, _calls, session) => url.endsWith('sessions') ? response(session, 201) : response({error:{code:'SERVICE_UNAVAILABLE'}},503));
  await h.run.start(); h.advance(1000); h.run.finish(0,empty());
  await assert.rejects(h.run.submit('Player',()=>h.run.markDeveloper()), /DEVELOPER_RUN/);
  assert.equal(h.calls.filter(call=>call.url.endsWith('/runs')).length,1);
});

test('v2 mixed rewards persist through respawn/pause and freeze all eleven counters for retries', async () => {
  let attempts = 0;
  const h = harness((url, _i, _c, session, accepted) => url.endsWith('sessions') ? response(session,201) : ++attempts === 1 ? response({error:{code:'SERVICE_UNAVAILABLE'}},503) : response(accepted));
  const events = createEvidence(100), score = createScore(events), life = createRun();
  await h.run.start();
  assert.equal(JSON.parse(h.calls[0].body).version,'jinki-v2');
  events.destroy(1,30,'player'); score.glass(0,1); score.topple();
  events.destroy(2,30,'slab'); score.glass(1,2); events.destroy(3,40,'npc');
  score.kill(); score.kill(); score.kill(true); score.bonus('collision'); score.bonus('oilPit');
  assert.equal(score.points,4530);
  assert.equal(life.die(),false); h.advance(60000);
  const c = h.run.finish(score.points,events.snapshot());
  assert.equal(c.ineligible,null); assert.equal(c.version,'jinki-v2');
  assert.deepEqual([c.evidence.enemyKills,c.evidence.juggernautKills,c.evidence.juggernautCollisionKills,c.evidence.oilPitJuggernautKills],[3,1,1,1]);
  score.bonus('collision'); score.kill(true); h.advance(1000);
  assert.equal(c.evidence.juggernautCollisionKills,1); assert.equal(c.evidence.juggernautKills,1);
  await h.run.submit('  Player  ');
  assert.equal(h.calls[1].body,h.calls[2].body);
  const payload=JSON.parse(h.calls[1].body);
  assert.deepEqual(Object.keys(payload).sort(),['submissionId','sessionToken','version','nickname','score','playDurationSeconds','completedAt','evidence'].sort());
  assert.equal(Object.keys(payload.evidence).length,11);
  assert.equal(payload.score,4530); assert.equal(payload.version,'jinki-v2'); assert.equal(payload.nickname,'Player');
  assert.equal(payload.playDurationSeconds,60); assert.deepEqual(payload.evidence,c.evidence);
  assert.equal(createEvidence(100).snapshot().juggernautKills,0);
});

test('all counters reject nonfinite, unsafe, fractional, negative and excessive values; juggernaut subset is mandatory', () => {
  const e=empty();
  for(const key of Object.keys(e).filter(k=>!k.endsWith('Area'))) {
    for(const value of [NaN,Infinity,-1,.5,1_000_001,Number.MAX_SAFE_INTEGER+1,undefined]) {
      assert.equal(evidenceError({...e,[key]:value},0),'INCONSISTENT_COUNTERS',`${key}: ${value}`);
    }
  }
  assert.equal(evidenceError({...e,juggernautKills:1},750),'INCONSISTENT_COUNTERS');
  const max={...e, playerGlassShards:1e6, totalDestroyedGlassShards:1e6, concreteTopples:1e6, destroyedGlassArea:100, enemyKills:1e6, juggernautKills:1e6, juggernautCollisionKills:1e6, oilPitJuggernautKills:1e6};
  assert.equal(evidenceError(max,3_520_000_000),null);
  for(const value of [3_520_000_001, NaN,Infinity,-1,3_520_000_000|0]) assert.equal(evidenceError(max,value),'SCORE_MISMATCH');
});

test('v1 session cannot start v2 gameplay; version mismatch submission is terminal even with retryable HTTP status',async()=>{
  const old=harness((_u,_i,_c,session)=>response({...session,version:'jinki-v1'},201));
  await assert.rejects(old.run.start(),/SESSION_VERSION_MISMATCH/);
  assert.throws(()=>old.run.finish(0,empty()),/NO_ACTIVE_GAME/);
  assert.equal(old.calls.length,1);
  const h=harness((url,_i,_c,session)=>url.endsWith('sessions')?response(session,201):response({error:{code:'SESSION_VERSION_MISMATCH'}},503));
  await h.run.start();h.advance(1000);h.run.finish(0,empty());
  await assert.rejects(h.run.submit('P'),/SESSION_VERSION_MISMATCH/);
  await assert.rejects(h.run.submit('P'),/SESSION_VERSION_MISMATCH/);
  await assert.rejects(h.run.start(),/RUN_ALREADY_STARTED/);
  assert.equal(h.calls.length,2);assert.equal(h.sleeps.length,0);
});
