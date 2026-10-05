import test from 'node:test';
import assert from 'node:assert/strict';
import { chargeTravel, chargeKnockback, createChargePlanner, chargerMilestones, CHARGER_HP } from '../src/game/charger.ts';
test('chargers increase once per four cumulative kills and have 1.5x normal health',()=>{
 assert.deepEqual([0,3,4,7,8,12].map(chargerMilestones),[0,0,1,1,2,3]);
 assert.equal(CHARGER_HP,3*1.5);
});
test('charge stays on its locked line and sweeps every part of the route',()=>{
 const samples=[];
 const end=chargeTravel(0,0,Math.PI/4,100,(x,y)=>{samples.push({x,y});return x<40;});
 assert.equal(end.hit,true);assert.ok(end.x<40 && end.x>37);assert.ok(Math.abs(end.x-end.y)<1e-8);
 for(let i=1;i<samples.length;i++)assert.ok(Math.hypot(samples[i].x-samples[i-1].x,samples[i].y-samples[i-1].y)<=3.001);
});
test('charge stops at screen edge and can cross breakable glass without stopping',()=>{
 assert.equal(chargeTravel(26,50,0,200,(x)=>x<=174).hit,true);
 const end=chargeTravel(26,50,0,100,()=>true);
 assert.equal(end.hit,false);assert.ok(Math.abs(end.x-126)<1e-8);
});

test('juggernaut routes around a wall to a clear charge lane',()=>{
 const free=(x,y)=>x>=26 && x<=374 && y>=26 && y<=374 && !(x>=140 && x<=180 && y<280);
 const planner=createChargePlanner(400,0,400,free),from={x:80,y:100},target={x:300,y:100};
 assert.equal(planner.clear(from,target),false);
 const path=planner.route(from,target);
 assert.ok(path.length>0);
 assert.ok(path.some(p=>p.y>=280));
 let previous=from;
 for(const p of path){
  assert.equal(chargeTravel(previous.x,previous.y,Math.atan2(p.y-previous.y,p.x-previous.x),Math.hypot(p.x-previous.x,p.y-previous.y),free).hit,false);
  previous=p;
 }
 assert.equal(planner.clear(path.at(-1),target),true);
});
test('juggernaut does not route through a sealed barrier',()=>{
 const free=(x,y)=>x>=26 && x<=374 && y>=26 && y<=374 && !(x>=140 && x<=180);
 const planner=createChargePlanner(400,0,400,free);
 const path=planner.route({x:80,y:100},{x:300,y:100});
 assert.ok(path.every(p=>p.x<140));
});

test('blocked searches yield bounded slices rather than completing in one frame',()=>{
 const free=(x,y)=>x>=26 && x<=774 && y>=26 && y<=774 && !(x>=380 && x<=420);
 const planner=createChargePlanner(800,0,800,free);
 const job=planner.beginRoute({x:80,y:100},{x:700,y:100});
 let result=job.next(),slices=1;
 assert.equal(result.done,false);
 while(!result.done){result=job.next();slices++;assert.ok(slices<=76);}
 assert.ok(result.value.every(p=>p.x<380));
});

test('charge knockback follows travel and deflects toward the contacted side',()=>{
 for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  const dx=Math.cos(angle),dy=Math.sin(angle),source={x:100,y:100};
  for(const side of [-25,0,25]){
   const target={x:100+dx*30-dy*side,y:100+dy*30+dx*side};
   const k=chargeKnockback(angle,source,target);
   assert.ok(Math.abs(Math.hypot(k.vx,k.vy)-520)<1e-8);
   assert.ok(k.vx*dx+k.vy*dy>0);
   const lateral=-dy*k.vx+dx*k.vy;
   if(side)assert.equal(Math.sign(lateral),Math.sign(side));else assert.ok(Math.abs(lateral)<1e-8);
  }
 }
});
