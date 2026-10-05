import test from 'node:test';
import assert from 'node:assert/strict';
import { meleeFan, meleeHitsBody, recoilStep } from '../src/game/melee.ts';
import { hitTextMask } from '../src/game/textCollision.ts';
import { segmentTriangle } from '../src/game/geometry.ts';
import { TextNavigation, moveBody } from '../src/game/navigation.ts';

test('fan hits front bodies and glass but excludes rear and distant targets in all four directions', () => {
  for (const angle of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const { rays, impact } = meleeFan(100,100,angle,()=>Infinity);
    const c=Math.cos(angle),s=Math.sin(angle);
    assert.equal(impact,null);
    assert.ok(meleeHitsBody(100,100,rays,100+c*50,100+s*50));
    assert.equal(meleeHitsBody(100,100,rays,100-c*30,100-s*30),false);
    assert.equal(meleeHitsBody(100,100,rays,100+c*70,100+s*70),false);
  }
  const {rays}=meleeFan(100,100,0,()=>Infinity);
  assert.ok(rays.some(r=>segmentTriangle(100,100,r.dx,r.dy,[125,95,140,100,125,105])<=1));
  assert.equal(rays.some(r=>segmentTriangle(100,100,r.dx,r.dy,[65,95,80,100,65,105])<=1),false);
});

test('text clips melee damage and reports a rebound contact',()=>{
  const mask=new Uint8ClampedArray(200*200*4);
  for(let y=0;y<200;y++) for(let x=120;x<124;x++) mask[(y*200+x)*4+3]=255;
  const hit=(x,y,dx,dy)=>hitTextMask(mask,200,200,1,1,x,y,dx,dy);
  const {rays,impact}=meleeFan(100,100,0,hit);
  assert.ok(impact && impact.x>=120 && impact.x<122);
  assert.equal(meleeHitsBody(100,100,rays,143,100),false);
  assert.ok(rays.every(r=>100+r.dx<120));
});

test('rebound breaks the traversed floor in substeps and stops at rear text',()=>{
  const mask=new Uint8ClampedArray(300*300*4);
  for(let y=0;y<300;y++) for(let x=60;x<66;x++) mask[(y*300+x)*4+3]=255;
  const nav=new TextNavigation(300,300,mask,300,300), body={x:140,y:150};
  let vx=-520,vy=0,digs=0;
  for(let i=0;i<40;i++) {
    const kick=recoilStep(vx,vy,.008); vx=kick.vx;vy=kick.vy;
    moveBody(nav,body,kick.x,kick.y,(from,to)=>{
      assert.ok(to.x<=from.x); assert.ok(Math.hypot(to.x-from.x,to.y-from.y)<=4);
      digs++;return true;
    });
  }
  assert.ok(digs>0 && body.x<140 && body.x>66+18);
  assert.ok(nav.free(body));
});

test('rebound travel is frame-rate independent and slows down',()=>{
  const simulate=fps=>{let vx=-520,x=0;for(let i=0;i<fps;i++){const k=recoilStep(vx,0,.32/fps);vx=k.vx;x+=k.x;}return {vx,x};};
  const a=simulate(30),b=simulate(120);
  assert.ok(Math.abs(a.x-b.x)<1e-8 && Math.abs(a.vx-b.vx)<1e-8);
  assert.ok(a.x < -60 && a.x > -70 && Math.abs(a.vx)<60);
});
