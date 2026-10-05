import test from 'node:test';
import assert from 'node:assert/strict';
import {playerFrame} from '../src/game/playerSprite.ts';
test('running cycles all four poses and stopping returns to idle',()=>{
 assert.deepEqual([0,.121,.241,.361,.481].map(t=>playerFrame(true,t)),[1,2,3,4,1]);
 for(const t of [0,.12,1,100])assert.equal(playerFrame(false,t),0);
});
