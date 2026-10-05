import test from 'node:test';
import assert from 'node:assert/strict';
import {updateTouchInput} from '../src/game/touchInput.ts';
const setup=()=>{const pointers=new Map(),events=[];return {pointers,events,change:(id,code)=>updateTouchInput(pointers,id,code,(...event)=>events.push(event))};};
test('movement and firing remain independent during multi-touch',()=>{
 const t=setup();t.change(1,'ArrowUp');t.change(2,'Space');t.change(1,undefined);
 assert.deepEqual(t.events,[['ArrowUp',true],['Space',true],['ArrowUp',false]]);
 assert.equal(t.pointers.get(2),'Space');
});
test('sliding changes direction and cancellation releases it once',()=>{
 const t=setup();t.change(1,'ArrowUp');t.change(1,'ArrowRight');t.change(1,undefined);t.change(1,undefined);
 assert.deepEqual(t.events,[['ArrowUp',true],['ArrowUp',false],['ArrowRight',true],['ArrowRight',false]]);
});
test('multiple fingers on one attack do not release or retrigger prematurely',()=>{
 const t=setup();t.change(1,'KeyZ');t.change(2,'KeyZ');t.change(1,undefined);t.change(2,undefined);
 assert.deepEqual(t.events,[['KeyZ',true],['KeyZ',false]]);
});
