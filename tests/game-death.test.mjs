import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeathMarks } from '../src/game/death.ts';
const ctx={save(){},restore(){},translate(){}};
test('pixel bone piles persist, remain bounded and cull outside the viewport',()=>{
 const drawn=[];const marks=createDeathMarks((_ctx,kind)=>drawn.push(kind));
 for(let i=0;i<80;i++)marks.add(i,300,true);
 marks.update(10);marks.draw(ctx,0,600);
 assert.equal(drawn.length,64);assert.ok(drawn.every(kind=>kind==='bones'));
 drawn.length=0;marks.draw(ctx,1000,600);assert.equal(drawn.length,0);
});
test('player skull rises then fades while bone sprite remains',()=>{
 const drawn=[];const marks=createDeathMarks((_ctx,kind)=>drawn.push(kind));
 marks.add(100,300,true);marks.draw(ctx,0,600);
 assert.deepEqual(drawn,['bones','skull']);
 marks.update(1.1);drawn.length=0;marks.draw(ctx,0,600);
 assert.deepEqual(drawn,['bones']);
});
