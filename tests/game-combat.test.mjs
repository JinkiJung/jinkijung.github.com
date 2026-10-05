import test from 'node:test';
import assert from 'node:assert/strict';
import { hitTextMask, segmentCircle, reflectText, sealTextRegions, safeMuzzle } from '../src/game/textCollision.ts';

test('fast bullets stop on glyph pixels but pass through spaces and letter counters', () => {
  const mask = new Uint8ClampedArray(20 * 20 * 4);
  for (let y = 3; y < 17; y++) mask[(y * 20 + 10) * 4 + 3] = 255;
  assert.equal(hitTextMask(mask, 20, 20, 1, 1, 0, 10, 20, 0), .5);
  assert.equal(hitTextMask(mask, 20, 20, 1, 1, 0, 1, 20, 0), Infinity);
  mask[(10 * 20 + 10) * 4 + 3] = 0;
  assert.equal(hitTextMask(mask, 20, 20, 1, 1, 0, 10, 20, 0), Infinity);
  assert.equal(hitTextMask(mask, 20, 20, 2, 2, 0, 6, 10, 0), .5);
});

test('actor hit testing selects entry point and rejects misses and targets behind bullet', () => {
  assert.equal(segmentCircle(0, 0, 100, 0, 50, 0, 10), .4);
  assert.equal(segmentCircle(0, 0, 100, 0, 50, 30, 10), Infinity);
  assert.equal(segmentCircle(0, 0, 100, 0, -50, 0, 10), Infinity);
  assert.equal(segmentCircle(50, 0, 0, 0, 50, 0, 10), 0);
});


test('glyph impacts reflect outward and do not skip text within the muzzle offset', () => {
  const mask=new Uint8ClampedArray(40*40*4);
  for(let y=0;y<40;y++) for(let x=20;x<23;x++) mask[(y*40+x)*4+3]=255;
  const impact=hitTextMask(mask,40,40,1,1,0,20,27,0);
  assert.ok(impact<1);
  const spawnX=Math.max(0,impact*27-1);
  assert.ok(spawnX<20);
  assert.notEqual(hitTextMask(mask,40,40,1,1,spawnX,20,10,0),Infinity);
  const bounce=reflectText(mask,40,40,1,1,20,20,1000,0);
  assert.ok(bounce.vx<0);
  assert.ok(Math.abs(bounce.vy)<.01);
  assert.ok(Math.hypot(bounce.vx,bounce.vy)<1000);
  assert.equal(hitTextMask(mask,40,40,1,1,18,20,bounce.vx*.02,bounce.vy*.02),Infinity);
});


test('NPC rounds cannot cross a paragraph through spaces or between wrapped lines', () => {
  const mask=new Uint8ClampedArray(100*100*4);
  sealTextRegions(mask,100,100,1,1,[{x:15,y:40,w:70,h:25}]);
  for(const x of [16,35,50,70,84]) {
    assert.ok(Number.isFinite(hitTextMask(mask,100,100,1,1,x,0,0,99)));
    assert.ok(Number.isFinite(hitTextMask(mask,100,100,1,1,x,99,0,-99)));
  }
  assert.ok(Number.isFinite(hitTextMask(mask,100,100,1,1,0,52,99,0)));
  assert.equal(hitTextMask(mask,100,100,1,1,5,0,0,99),Infinity);
  const hit=(x,y,dx,dy)=>hitTextMask(mask,100,100,1,1,x,y,dx,dy);
  const npc=safeMuzzle(50,30,Math.PI/2,22,hit);
  const player=safeMuzzle(50,30,Math.PI/2,27,hit);
  assert.ok(npc.y<40 && player.y<40);
  assert.ok(Number.isFinite(hit(npc.x,npc.y,0,420*.035)));
});

test('paragraph cover uses capture scale and clips offscreen bounds', () => {
  const mask=new Uint8ClampedArray(100*100*4);
  sealTextRegions(mask,100,100,2,2,[{x:-4,y:10,w:34,h:10}]);
  assert.ok(Number.isFinite(hitTextMask(mask,100,100,2,2,15,0,0,40)));
  assert.equal(hitTextMask(mask,100,100,2,2,35,0,0,40),Infinity);
});

test('screenshot layout: NPC rounds above the paragraph cannot damage the player below it', () => {
  const width=805,height=988,mask=new Uint8ClampedArray(width*height*4);
  sealTextRegions(mask,width,height,1,1,[{x:115,y:826,w:558.3125,h:40}]);
  const hit=(x,y,dx,dy)=>hitTextMask(mask,width,height,1,1,x,y,dx,dy);
  const player={x:560,y:905};
  for(const enemy of [{x:510,y:750},{x:560,y:730},{x:650,y:710}]) {
    const angle=Math.atan2(player.y-enemy.y,player.x-enemy.x);
    const shot=safeMuzzle(enemy.x,enemy.y,angle,22,hit);
    const vx=Math.cos(angle)*420,vy=Math.sin(angle)*420;
    let blocked=false;
    for(let frame=0;frame<100;frame++) {
      const dx=vx*.035,dy=vy*.035;
      const wall=hit(shot.x,shot.y,dx,dy);
      const body=segmentCircle(shot.x,shot.y,dx,dy,player.x,player.y,16);
      assert.ok(body===Infinity || wall<=body,'text must resolve before player damage');
      if(wall!==Infinity) { blocked=true; break; }
      shot.x+=dx; shot.y+=dy;
    }
    assert.ok(blocked);
  }
});

test('ticker bands are pass-through without disabling normal paragraph cover', () => {
  const mask=new Uint8ClampedArray(100*100*4);
  const bands=[{x:0,y:80,w:100,h:10},{x:20,y:40,w:60,h:10}];
  sealTextRegions(mask,100,100,1,1,bands);
  sealTextRegions(mask,100,100,1,1,[bands[0]],0);
  assert.equal(hitTextMask(mask,100,100,1,1,50,70,0,25),Infinity);
  assert.ok(Number.isFinite(hitTextMask(mask,100,100,1,1,50,30,0,30)));
});
