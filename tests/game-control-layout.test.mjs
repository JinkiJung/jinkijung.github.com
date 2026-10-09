import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultLayout,controlSize,clampControl,parseLayout } from '../src/game/controlLayout.ts';
test('default controls fit narrow phones with matching action sizes and no overlap',()=>{
 for(const width of [320,360,390,430]){
  const p=defaultLayout(width,844),stick=controlSize('stick',width),action=controlSize('KeyX',width);
  assert.equal(action,controlSize('KeyZ',width));
  assert.ok(p.stick.x*width+stick/2 < p.KeyZ.x*width-action/2);
  assert.ok(p.KeyZ.x*width+action/2 < p.KeyX.x*width-action/2);
 }
});
test('dragging beyond screen bounds keeps the full control accessible',()=>{
 for(const size of [74,144]){
  const p=clampControl(-500,2000,size,390,844);
  assert.ok(p.x*390>=size/2);assert.ok(p.y*844<=844-size/2);
  const top=clampControl(200,-500,size,390,844);assert.ok(top.y*844-size/2>=155-1e-9);
 }
});
test('saved layouts reject malformed and out-of-bounds coordinates',()=>{
 const valid=defaultLayout(390,844);assert.deepEqual(parseLayout(JSON.stringify(valid)),valid);
 for(const data of [null,'broken','{}',JSON.stringify({...valid,KeyX:{x:9,y:.5}}),JSON.stringify({...valid,stick:{x:'0.5',y:.5}})])assert.equal(parseLayout(data),null);
});
