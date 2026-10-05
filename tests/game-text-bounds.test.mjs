import test from 'node:test';
import assert from 'node:assert/strict';
import { sealRenderedTextLines, sealTextRegions, hitTextMask } from '../src/game/textCollision.ts';
import { TextNavigation } from '../src/game/navigation.ts';

test('line sealing keeps ink and internal spaces solid but excludes padding and short line tails',()=>{
  const w=200,h=200,mask=new Uint8ClampedArray(w*h*4);
  const fill=(x0,y0,x1,y1)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)mask[(y*w+x)*4+3]=255;};
  fill(40,100,50,110);fill(100,100,120,110);fill(40,125,70,135);
  sealRenderedTextLines(mask,w,h,1,1,[{x:30,y:95,w:120,h:20},{x:30,y:120,w:120,h:20}]);
  assert.notEqual(hitTextMask(mask,w,h,1,1,80,90,0,25),Infinity);
  assert.equal(hitTextMask(mask,w,h,1,1,130,90,0,55),Infinity);
  assert.equal(hitTextMask(mask,w,h,1,1,100,120,0,20),Infinity);
  assert.equal(mask[(115*w+80)*4+3],0);
  const nav=new TextNavigation(w,h,mask,w,h);
  assert.ok(nav.free({x:141,y:105}));
  assert.equal(nav.free({x:136,y:105}),false);
  assert.ok(nav.free({x:100,y:145}));
});

test('career regions clear solid text including sealed spaces, leaving surrounding text intact',()=>{
  const w=400,h=200,mask=new Uint8ClampedArray(w*h*4);
  const regions=Array.from({length:4},(_,i)=>({x:i*100+20,y:80,w:60,h:100}));
  sealTextRegions(mask,w,h,1,1,[{x:0,y:110,w:400,h:20}]);
  sealTextRegions(mask,w,h,1,1,regions,0);
  const nav=new TextNavigation(w,h,mask,w,h);
  for(const r of regions){
    assert.equal(hitTextMask(mask,w,h,1,1,r.x+30,90,0,60),Infinity);
    assert.ok(nav.free({x:r.x+30,y:120}));
  }
  assert.notEqual(hitTextMask(mask,w,h,1,1,10,90,0,60),Infinity);
  assert.notEqual(hitTextMask(mask,w,h,1,1,390,90,0,60),Infinity);
});
