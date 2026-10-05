import test from 'node:test';
import assert from 'node:assert/strict';
import { onIce, surfaceMotion, visibleIceRect } from '../src/game/ice.ts';

const region={x:40,y:1100,w:720,h:400};
test('ice is limited to the voyage frame in document coordinates',()=>{
  assert.ok(onIce(400,1200,[region]));
  assert.equal(onIce(400,1000,[region]),false);
  assert.equal(onIce(760,1200,[region]),false);
  assert.equal(onIce(400,1500,[region]),false);
});
test('release glides and reversing input does not instantly reverse velocity',()=>{
  const motion={vx:270,vy:0};
  const glide=surfaceMotion(motion,0,0,true,.1);
  assert.ok(glide.x>20 && motion.vx>200 && motion.vx<270);
  surfaceMotion(motion,-270,0,true,.05);
  assert.ok(motion.vx>0);
  const stop=surfaceMotion(motion,0,0,false,.1);
  assert.deepEqual(stop,{x:0,y:0});
  assert.equal(motion.vx,0);
});
test('ice acceleration and travel are consistent at 30 and 120 FPS',()=>{
  const simulate=fps=>{
    const motion={vx:0,vy:0};let x=0;
    for(let i=0;i<fps;i++) x+=surfaceMotion(motion,270,0,true,1/fps).x;
    for(let i=0;i<fps/2;i++) x+=surfaceMotion(motion,0,0,true,1/fps).x;
    return {x,vx:motion.vx};
  };
  const a=simulate(30),b=simulate(120);
  assert.ok(Math.abs(a.x-b.x)<1e-8);
  assert.ok(Math.abs(a.vx-b.vx)<1e-8);
});
test('blue floor follows the camera and never colors outside the frame',()=>{
  assert.equal(visibleIceRect(region,0,800,1000),null);
  assert.deepEqual(visibleIceRect(region,1200,800,1000),{x:40,y:0,w:720,h:300});
  assert.deepEqual(visibleIceRect(region,500,800,700),{x:40,y:600,w:720,h:100});
});

test('oil locks entry direction despite opposite input, then releases control outside',()=>{
 const motion={vx:270,vy:0};
 let previousY=0,changes=0;
 for(let i=0;i<120;i++){
  const step=surfaceMotion(motion,-270,270,false,1/120,true);
  assert.ok(step.x>0);
  if(previousY && Math.sign(motion.vy)!==Math.sign(previousY))changes++;
  previousY=motion.vy;
 }
 assert.ok(changes>=1);
 const normal=surfaceMotion(motion,-270,0,false,.1,false);
 assert.deepEqual(normal,{x:-27,y:0});
 const reentry=surfaceMotion(motion,270,0,false,.1,true);
 assert.ok(reentry.x<0);
});
