import test from 'node:test';
import assert from 'node:assert/strict';
import { followPage } from '../src/game/camera.ts';

test('camera stays still inside the middle 70 percent', () => {
  for(const y of [650,800,1350]) assert.equal(followPage(500,y,1000,3200,.016),500);
});

test('top and bottom fifteen percent follow in the correct direction', () => {
  assert.ok(followPage(500,1375,1000,3200,.016)>500);
  assert.ok(followPage(500,625,1000,3200,.016)<500);
  assert.equal(followPage(0,30,1000,3200,.016),0);
  assert.equal(followPage(2200,3190,1000,3200,.016),2200);
  assert.equal(followPage(0,500,1000,800,.016),0);
});

test('scrolling crosses sections smoothly and can return without changing world coordinates', () => {
  let camera=0;
  for(let i=0;i<200;i++) camera=followPage(camera,1500,1000,3200,1/60);
  assert.ok(Math.abs(camera-650)<.01);
  for(let i=0;i<200;i++) camera=followPage(camera,170,1000,3200,1/60);
  assert.ok(Math.abs(camera-20)<.01);
  assert.equal(1500,1500-camera+camera);
});
