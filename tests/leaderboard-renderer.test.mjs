import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createEvidence } from '../src/leaderboard/evidence.ts';
import { glassComplete } from '../src/leaderboard/protocol.ts';
import { createConcretePlates } from '../src/game/concrete.ts';

const bundled = await build({ entryPoints: ['src/game/GlassRenderer.ts'], bundle: true, write: false, platform: 'node', format: 'esm' });
const { GlassRenderer } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const gl = new Proxy({}, { get: (_target, key) => key === 'getShaderParameter' || key === 'getProgramParameter' ? () => true : () => ({}) });
function renderer(width = 240, height = 200, floors = [], career = []) {
  globalThis.devicePixelRatio = 1;
  const glass = new GlassRenderer({ getContext: () => gl }, [{ y: 0, width, height, canvas: {}, textCanvas: {} }], width, height, floors, height, [], floors, career);
  const evidence = createEvidence(glass.totalArea);
  glass.onDestroy = (id, area, owner) => evidence.destroy(id, area, owner);
  return { glass, evidence };
}

test('actual randomized renderer geometry has fixed non-overlapping area and counts every shard exactly once', () => {
  for (let seed = 1; seed <= 8; seed++) {
    let n = seed; const original = Math.random;
    Math.random = () => ((n = (n * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    try {
      const { glass, evidence } = renderer(241.25, 200.75, [{ x: 20, y: 30, w: 50.5, h: 60.25, id: 1 }]);
      const total = glass.totalArea;
      assert.ok(Math.abs(total - (241.25 * 200.75 - 50.5 * 60.25)) < 1e-7);
      glass.attributed('player', () => glass.crushStrip({ x: 0, y: 0, w: 1000, h: 1000 }));
      const once = evidence.snapshot();
      assert.equal(once.totalDestroyedGlassShards, glass.brokenCount);
      assert.equal(once.destroyedGlassArea, glass.brokenArea);
      assert.equal(once.npcGlassShards, 0); assert.ok(glassComplete(once));
      glass.openFootprint(50, 50, 1000); glass.shatterFan(50, 50, [{ dx: 1000, dy: 1000 }], 2000);
      glass.shatter(0, 0, 0); glass.crushStrip({ x: 0, y: 0, w: 1000, h: 1000 });
      assert.deepEqual(evidence.snapshot(), once); assert.equal(glass.totalArea, total);
      glass.dispose();
    } finally { Math.random = original; }
  }
});

test('NPC detachment, player slab sweep and repeated collisions use real attribution boundaries', () => {
  const { glass, evidence } = renderer();
  glass.openFootprint(230, 190, 10);
  assert.ok(evidence.snapshot().npcGlassShards > 0); assert.equal(evidence.snapshot().playerGlassShards, 0);
  const slabs = createConcretePlates([{ x: 0, y: 0, w: 150, h: 15, id: 9, active: true }]);
  assert.equal(slabs.topple(0, true), true); evidence.topple();
  assert.equal(slabs.topple(0, true), false);
  for (let i = 0; i < 100; i++) slabs.update(.035, (rect, owner) => glass.attributed(owner ? 'slab' : 'npc', () => glass.crushStrip(rect)));
  const e = evidence.snapshot(); assert.equal(e.concreteTopples, 1); assert.ok(e.slabGlassShards > 0);
  assert.equal(e.playerGlassShards, e.slabGlassShards);
  assert.equal(e.playerGlassShards + e.npcGlassShards, e.totalDestroyedGlassShards);
  glass.dispose();
});

test('career cache chain reactions inherit their triggering attribution exactly once', () => {
  const { glass, evidence } = renderer(120, 120, [], [{ x: 0, y: 0, w: 120, h: 120 }]);
  glass.attributed('slab', () => glass.openFootprint(60, 60, 45));
  assert.equal(glass.careerUnlocked(0), true);
  const e = evidence.snapshot(); assert.equal(e.slabGlassShards, e.totalDestroyedGlassShards);
  assert.ok(glassComplete(e));
  glass.openFootprint(60, 60, 1000); assert.deepEqual(evidence.snapshot(), e);
  glass.dispose();
});
