import test from 'node:test';
import assert from 'node:assert/strict';
import { captureScale, tileSpans } from '../src/game/snapshotTiles.ts';
import { partition } from '../src/game/geometry.ts';
test('homepage quality is independent of extended world length; extensions use half resolution', () => {
 assert.equal(captureScale(1200,2700,2,true),1.5);
 assert.equal(captureScale(1200,2700,2,false),.5);
 for(const height of [1,1024,1025,2700,20000]) {
  const spans=tileSpans(height);
  assert.equal(spans.reduce((sum,t)=>sum+t.height,0),height);
  spans.forEach((t,i)=>{assert.ok(t.height>0 && t.height<=1024);assert.equal(t.y,i*1024);});
 }
});
test('shards never straddle texture boundaries, even with targets spanning tiles', () => {
 const tiles=tileSpans(2700);
 const cells=partition(300,2700,[{x:22,y:985,w:230,h:190,id:1},...tiles.map((t,id)=>({x:0,y:t.y,w:300,h:t.height,id:-id-1}))]);
 let last=-1;
 for(const c of cells){const index=tiles.findIndex(t=>c.y>=t.y && c.y+c.h<=t.y+t.height+1e-7);assert.ok(index>=last && index>=0);last=index;}
});
