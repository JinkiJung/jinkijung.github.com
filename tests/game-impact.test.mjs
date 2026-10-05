import test from 'node:test';
import assert from 'node:assert/strict';
import { createImpacts } from '../src/game/impact.ts';
function canvas() {
  return { rings: [], save(){},restore(){},beginPath(){},stroke(){},moveTo(){},lineTo(){},
    arc(x,y,r){this.rings.push({x,y,r});} };
}
test('all impact kinds expire, including effects detached from killed actors',()=>{
  const fx=createImpacts(),ctx=canvas();
  for(const kind of ['player','shot','melee']) fx.add(100,200,kind);
  fx.draw(ctx);assert.equal(ctx.rings.length,3);
  fx.update(.15);ctx.rings=[];fx.draw(ctx);assert.equal(ctx.rings.length,2);
  fx.update(.1);ctx.rings=[];fx.draw(ctx);assert.equal(ctx.rings.length,0);
});
test('many simultaneous hits stay within the fixed effect budget',()=>{
  const fx=createImpacts(),ctx=canvas();
  for(let i=0;i<100;i++)fx.add(i,200,'melee');
  fx.draw(ctx);assert.equal(ctx.rings.length,16);
  assert.ok(ctx.rings.every(r=>r.x>=84));
});
