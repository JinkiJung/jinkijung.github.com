import test from 'node:test';
import assert from 'node:assert/strict';
import {surfaceMotion,enemySurfaceMotion,resolveSurfaceCollision} from '../src/game/ice.ts';
import {moveBody} from '../src/game/navigation.ts';
for(const npc of [false,true])for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1]]){
 test(`${npc?'NPC':'player'} reflects out of oil at boundary ${dx},${dy}`,()=>{
  const body={x:dx>0?99:dx<0?1:50,y:dy>0?99:dy<0?1:50,vx:dx*180,vy:dy*180};
  const navigation={canMove:(_from,to)=>to.x>=0 && to.x<=100 && to.y>=0 && to.y<=100};
  for(let i=0;i<15;i++){
   const before={x:body.x,y:body.y};
   const step=npc?enemySurfaceMotion(body,dx*180,dy*180,0,false,1/60,true):surfaceMotion(body,dx*180,dy*180,false,1/60,true);
   moveBody(navigation,body,step.x,step.y);
   resolveSurfaceCollision(body,step,{x:body.x-before.x,y:body.y-before.y},true);
  }
  if(dx>0)assert.ok(body.x<80);if(dx<0)assert.ok(body.x>20);
  if(dy>0)assert.ok(body.y<80);if(dy<0)assert.ok(body.y>20);
 });
}
test('ordinary collision still stops velocity; oil control returns upon exit',()=>{
 const motion={vx:180,vy:0};
 const step=surfaceMotion(motion,180,0,false,.1,true);
 resolveSurfaceCollision(motion,step,{x:0,y:step.y},true);
 assert.ok(surfaceMotion(motion,180,0,false,.1,true).x<0);
 assert.deepEqual(surfaceMotion(motion,180,0,false,.1,false),{x:18,y:0});
 resolveSurfaceCollision(motion,{x:18,y:0},{x:0,y:0},false);
 assert.equal(motion.vx,0);
});
