import test from 'node:test';
import assert from 'node:assert/strict';
import { createConcretePlates } from '../src/game/concrete.ts';
import { safeMuzzle } from '../src/game/textCollision.ts';
const rects=Array.from({length:4},(_,id)=>({x:20+id*90,y:200,w:80,h:7,id,active:id===0}));
test('fast rounds hit all four thin concrete indicators from either side',()=>{
 for(let i=0;i<4;i++){
  const p=createConcretePlates(rects),x=rects[i].x+40;
  assert.equal(p.hitTest(x,100,0,200).index,i);
  assert.equal(p.hitTest(x,300,0,-200).index,i);
 }
 const p=createConcretePlates(rects);
 assert.equal(p.hitTest(105,100,0,200).t,Infinity);
});
test('a slab topples once, stops blocking shots and leaves the other slabs upright',()=>{
 const p=createConcretePlates(rects);
 assert.equal(p.topple(0),true);assert.equal(p.topple(0),false);
 assert.equal(p.hitTest(60,100,0,200).t,Infinity);
 p.update(10);assert.equal(p.topple(0),false);
 assert.equal(p.hitTest(150,100,0,200).index,1);
});
test('muzzle sweep does not spawn bullets through a nearby indicator',()=>{
 const p=createConcretePlates(rects),hit=(x,y,dx,dy)=>p.hitTest(x,y,dx,dy).t;
 const muzzle=safeMuzzle(60,190,Math.PI/2,27,hit);
 assert.ok(muzzle.y<200);
 assert.equal(p.hitTest(muzzle.x,muzzle.y,0,30).index,0);
});

test('melee can topple only plates reached by the clipped attack fan',async()=>{
 const {meleeFan}=await import('../src/game/melee.ts');
 const p=createConcretePlates(rects);
 const fan=meleeFan(60,170,Math.PI/2,()=>Infinity);
 assert.deepEqual(p.meleeHits(60,170,fan.rays),[0]);
 p.topple(0);
 assert.deepEqual(p.meleeHits(60,170,fan.rays),[]);
 const blocked=meleeFan(150,170,Math.PI/2,()=>.1);
 assert.deepEqual(p.meleeHits(150,170,blocked.rays),[]);
});
test('fall sweeps every strip through the final footprint once at any frame rate',()=>{
 for(const fps of [30,120]) {
  const p=createConcretePlates(rects);p.topple(0,false);
  let bottom=200,calls=0;
  const sweep=(r,owned)=>{assert.equal(r.y,bottom);assert.equal(owned,false);assert.equal(r.w,80);bottom=r.y+r.h;calls++;};
  for(let i=0;i<fps;i++)p.update(1/fps,sweep);
  assert.ok(Math.abs(bottom-287)<1e-8);
  const count=calls;p.update(1,sweep);assert.equal(calls,count);
 }
});
test('crushing rectangle intersects enclosed and crossing shards without touching distant glass',async()=>{
 const {rectTouchesTriangle}=await import('../src/game/geometry.ts');
 const r={x:20,y:200,w:80,h:87};
 assert.ok(rectTouchesTriangle(r,[30,210,50,210,40,240]));
 assert.ok(rectTouchesTriangle(r,[0,190,150,190,50,400]));
 assert.ok(rectTouchesTriangle(r,[0,220,150,220,150,230]));
 assert.equal(rectTouchesTriangle(r,[150,200,180,200,150,220]),false);
});

test('upward plates sweep and bridge the pit above their starting position',()=>{
 const plates=createConcretePlates([{x:20,y:200,w:100,h:7,id:0,active:false,direction:-1}]);
 plates.topple(0);const swept=[];plates.update(1,r=>swept.push(r));
 assert.ok(swept.length>0 && swept[0].y<=120 && swept[0].y+swept[0].h<=207);
 const support=plates.supportRegions()[0];
 assert.ok(support.y<=127 && support.y+support.h>=200);
});
