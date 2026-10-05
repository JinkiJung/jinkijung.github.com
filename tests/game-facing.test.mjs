import test from 'node:test';
import assert from 'node:assert/strict';
import { keyFacing, cardinalFacing, heldFacing } from '../src/game/facing.ts';

test('WASD and arrow keys choose the same four firing directions', () => {
  for (const [letter, arrow, angle] of [
    ['KeyW', 'ArrowUp', -Math.PI / 2], ['KeyS', 'ArrowDown', Math.PI / 2],
    ['KeyA', 'ArrowLeft', Math.PI], ['KeyD', 'ArrowRight', 0],
  ]) {
    assert.equal(keyFacing(letter), angle);
    assert.equal(keyFacing(arrow), angle);
  }
  for (const code of ['Space', 'Escape', 'ShiftLeft', '']) assert.equal(keyFacing(code), undefined);
});

test('NPC aim chooses the nearest cardinal direction in every quadrant', () => {
  for (let dx = -100; dx <= 100; dx += 10) for (let dy = -100; dy <= 100; dy += 10) {
    const angle = cardinalFacing(dx, dy);
    assert.ok([0, Math.PI / 2, Math.PI, -Math.PI / 2].includes(angle));
    const x = Math.round(Math.cos(angle)), y = Math.round(Math.sin(angle));
    assert.equal(Math.abs(x) + Math.abs(y), 1);
    assert.equal(dx * x + dy * y, Math.max(Math.abs(dx), Math.abs(dy)));
  }
});

test('releasing the newest direction restores every other held direction, for arrows and WASD', () => {
  const codes = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyA','KeyD','KeyW','KeyS'];
  for (const first of codes) for (const second of codes) {
    if (first === second) continue;
    const keys = new Set([first, second, 'Space', 'KeyZ']);
    let angle = heldFacing(keys, 0);
    assert.equal(angle, keyFacing(second));
    keys.add(first); // OS repeat must not steal priority.
    assert.equal(heldFacing(keys, angle), keyFacing(second));
    keys.delete(second);
    angle = heldFacing(keys, angle);
    assert.equal(angle, keyFacing(first));
    keys.delete(first);
    assert.equal(heldFacing(keys, angle), angle);
  }
});

test('releasing an older direction preserves the newer held direction', () => {
  const keys = new Set(['KeyA', 'ArrowUp', 'KeyD']);
  keys.delete('ArrowUp');
  assert.equal(heldFacing(keys, Math.PI), 0);
  keys.delete('KeyD');
  assert.equal(heldFacing(keys, 0), Math.PI);
});
