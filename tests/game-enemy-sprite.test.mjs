import test from 'node:test';
import assert from 'node:assert/strict';
import {randomEnemySkin} from '../src/game/enemySprite.ts';
test('all three enemy skins have equal random intervals',()=>{
 assert.deepEqual([0,.32,1/3,.66,2/3,.999].map(value=>randomEnemySkin(()=>value)),[0,0,1,1,2,2]);
});
