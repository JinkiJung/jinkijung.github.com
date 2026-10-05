import test from 'node:test';
import assert from 'node:assert/strict';
import { partition, segmentRect, segmentTriangle, inImpactRadius, circleTouchesTriangle } from '../src/game/geometry.ts';

test('fast bullets hit thin panels and choose the nearest collision', () => {
  const near = { x: 50, y: 10, w: 2, h: 30, id: 1 };
  const far = { x: 200, y: 10, w: 20, h: 30, id: 2 };
  assert.equal(segmentRect(0, 20, 400, 0, near), .125);
  assert.ok(segmentRect(0, 20, 400, 0, near) < segmentRect(0, 20, 400, 0, far));
  assert.equal(segmentRect(0, 0, 400, 0, near), Infinity);
  assert.equal(segmentRect(100, 20, -100, 0, near), .48);
  assert.equal(segmentRect(51, 20, 0, 0, near), 0);
  assert.equal(segmentRect(0, 0, 0, 0, near), Infinity);
});

test('viewport is covered exactly once, including partially visible components', () => {
  const width = 801, height = 603;
  const targets = [{ x: 8, y: -35, w: 785, h: 125, id: 1 }, { x: 8, y: 90, w: 785, h: 500, id: 2 }];
  const cells = partition(width, height, targets);
  const area = cells.reduce((sum, c) => sum + c.w * c.h, 0);
  assert.ok(Math.abs(area - width * height) < 1e-6);
  for (const c of cells) {
    assert.ok(c.x >= 0 && c.y >= 0 && c.x + c.w <= width + 1e-8 && c.y + c.h <= height + 1e-8);
    assert.ok(c.w <= 56 && c.h <= 56);
    const hits = cells.filter(r => c.x + c.w / 2 > r.x && c.x + c.w / 2 < r.x + r.w && c.y + c.h / 2 > r.y && c.y + c.h / 2 < r.y + r.h);
    assert.equal(hits.length, 1);
    if (c.id === 1) assert.ok(c.y + c.h <= 90);
  }
});


test('damage stays local, and repeated bullets reach intact glass behind a hole', () => {
  const front = [0, 0, 56, 0, 28, 56];
  const back = [56, 0, 112, 0, 84, 56];
  assert.equal(segmentTriangle(-10, 14, 140, 0, front), 17 / 140);
  const next = segmentTriangle(-10, 14, 140, 0, back);
  assert.ok(next > segmentTriangle(-10, 14, 140, 0, front));
  assert.equal(segmentTriangle(0, 70, 200, 0, front), Infinity);
  assert.equal(segmentTriangle(28, 14, 0, 0, front), 0);
  assert.equal(inImpactRadius(25, 20, 20, 20), true);
  assert.equal(inImpactRadius(90, 20, 20, 20), false);
  // Sharing a component does not propagate damage across it.
  const centers = [{ x: 20, y: 20 }, { x: 40, y: 20 }, { x: 90, y: 20 }, { x: 180, y: 20 }];
  assert.equal(centers.filter(p => inImpactRadius(p.x, p.y, 20, 20)).length, 2);
});


test('walkable ground checks the body footprint against triangle interiors and edges', () => {
  const triangle=[20,20,60,20,40,60];
  assert.equal(circleTouchesTriangle(40,30,2,triangle),true);
  assert.equal(circleTouchesTriangle(40,10,11,triangle),true);
  assert.equal(circleTouchesTriangle(40,10,9,triangle),false);
  assert.equal(circleTouchesTriangle(0,0,5,triangle),false);
});
