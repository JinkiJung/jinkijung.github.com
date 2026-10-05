import test from 'node:test';
import assert from 'node:assert/strict';
import { enemySurfaceMotion, resetOilMotion } from '../src/game/ice.ts';
import { oilChargeTravel } from '../src/game/charger.ts';

test('stationary NPCs slip on oil, ignore pursuit steering, and regain steering outside',()=>{
 const enemy={vx:0,vy:0};
 const first=enemySurfaceMotion(enemy,0,0,0,false,.1,true);
 assert.ok(first.x>=14-1e-8);
 const second=enemySurfaceMotion(enemy,-100,0,Math.PI,false,.1,true);
 assert.ok(second.x>0);
 assert.deepEqual(enemySurfaceMotion(enemy,-100,0,Math.PI,false,.1,false),{x:-10,y:0});
 resetOilMotion(enemy);
 assert.ok(enemySurfaceMotion(enemy,100,0,0,false,.1,true).x<0);
});
test('NPC oil motion preserves entry direction and oscillates sideways',()=>{
 const enemy={vx:0,vy:100};let changes=0,sign=0;
 for(let i=0;i<240;i++){
  const step=enemySurfaceMotion(enemy,100,-100,0,false,1/120,true);
  assert.ok(step.y>0);
  if(sign && Math.sign(step.x)!==sign)changes++;
  sign=Math.sign(step.x);
 }
 assert.ok(changes>1);
});
test('juggernaut bends ten to twenty degrees left or right once per oil entry, independent of FPS',()=>{
 for(const random of [0,.2,.499999,.5,.8,1]){
  const run=fps=>{
   const state={chargeAngle:.3,chargeOily:false};let x=0,y=0,calls=0;
   for(let i=0;i<fps;i++)({x,y}=oilChargeTravel(state,x,y,620/fps,()=>true,()=>true,()=>{calls++;return random;}));
   assert.equal(calls,1);const delta=state.chargeAngle-.3;
   assert.ok(Math.abs(delta)>=Math.PI/18-1e-12 && Math.abs(delta)<=Math.PI/9+1e-12);
   assert.equal(Math.sign(delta),random<.5?-1:1);
   return {x,y,state};
  };
  const a=run(30),b=run(120);
  assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8);
 }
});
test('fast charge detects oil along its path, stops on walls, and bends again on reentry',()=>{
 const state={chargeAngle:0,chargeOily:false};let calls=0;
 const random=()=>{calls++;return 1;};
 const result=oilChargeTravel(state,0,0,100,x=>x<70,x=>x>=20,random);
 assert.equal(result.hit,true);assert.ok(result.x<70);assert.ok(result.y>0);assert.equal(calls,1);
 oilChargeTravel(state,result.x,result.y,3,()=>true,()=>false,random);
 oilChargeTravel(state,result.x,result.y,3,()=>true,()=>true,random);
 assert.equal(calls,2);
});
