import test from 'node:test';
import assert from 'node:assert/strict';
import { collideSpikes } from '../src/game/spikes.ts';
const spike=(x,vx,trailX=x)=>({x,y:0,vx,vy:0,trailX,trailY:0});
test('fast opposing spikes bounce instead of tunneling through one another',()=>{
 const a=spike(25,680,0),b=spike(5,-680,30);
 assert.equal(collideSpikes(a,b),true);
 assert.ok(a.x<b.x && b.x-a.x>=16);
 assert.equal(a.vx,-680);assert.equal(b.vx,680);
});
test('stationary spikes separate and a moving spike transfers momentum without extra energy',()=>{
 const a=spike(0,100),b=spike(10,0);
 collideSpikes(a,b,false);
 assert.equal(a.vx,0);assert.equal(b.vx,100);
 assert.ok(b.x-a.x>=16);
 const c=spike(50,0),d=spike(50,0);
 collideSpikes(c,d,false);
 assert.ok(Math.abs(c.x-d.x)>=16);
 assert.equal(c.vx*c.vx+d.vx*d.vx,0);
});
test('overlapping spikes moving apart do not bounce back together',()=>{
 const a=spike(0,-100),b=spike(10,100);
 collideSpikes(a,b,false);
 assert.equal(a.vx,-100);assert.equal(b.vx,100);
 assert.equal(collideSpikes(a,b,false),false);
});
