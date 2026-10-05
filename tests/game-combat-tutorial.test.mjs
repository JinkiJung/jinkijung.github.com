import test from 'node:test';
import assert from 'node:assert/strict';
import {createCombatTutorial} from '../src/game/combatTutorial.ts';
test('tutorial waits for cleared space, then teaches Z and X in order only once',()=>{
 const t=createCombatTutorial();t.press('KeyZ');t.press('KeyX');assert.equal(t.hint,null);
 t.spaceOpened();assert.equal(t.hint,'Z');t.press('KeyX');assert.equal(t.hint,'Z');
 t.press('KeyZ');assert.equal(t.hint,'X');t.spaceOpened();assert.equal(t.hint,'X');
 t.press('KeyX');assert.equal(t.hint,null);t.spaceOpened();t.press('KeyZ');assert.equal(t.hint,null);
});
