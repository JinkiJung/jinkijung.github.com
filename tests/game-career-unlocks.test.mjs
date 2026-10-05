import test from 'node:test';
import assert from 'node:assert/strict';
import { createCareerUnlocks } from '../src/game/careerUnlocks.ts';
import { partition } from '../src/game/geometry.ts';

test('unlock uses area rather than shard count and fires only once at exactly half',()=>{
  const tracker=createCareerUnlocks([[{id:0,area:10},{id:1,area:10},{id:2,area:30},{id:3,area:50}],[{id:4,area:100}]]);
  assert.deepEqual(tracker.detach(0),[]);
  assert.deepEqual(tracker.detach(1),[]);
  assert.equal(tracker.unlocked(0),false);
  assert.deepEqual(tracker.detach(0),[]);
  assert.equal(tracker.unlocked(0),false);
  assert.deepEqual(tracker.detach(2),[0,1,2,3]);
  assert.equal(tracker.unlocked(0),true);
  assert.equal(tracker.unlocked(1),false);
  assert.deepEqual(tracker.detach(3),[]);
  assert.deepEqual(tracker.detach(999),[]);
  assert.deepEqual(tracker.detach(4),[4]);
});
test('partition boundaries keep cache glass separate from neighboring regions',()=>{
  const region={x:30.5,y:50.25,w:120.75,h:80.5,id:-100000};
  const cells=partition(300,300,[region]);
  let area=0;
  for(const cell of cells){
    const overlaps=cell.x<region.x+region.w && cell.x+cell.w>region.x+1e-8 && cell.y<region.y+region.h && cell.y+cell.h>region.y+1e-8;
    if(!overlaps)continue;
    assert.ok(cell.x>=region.x-1e-8 && cell.x+cell.w<=region.x+region.w+1e-8);
    assert.ok(cell.y>=region.y-1e-8 && cell.y+cell.h<=region.y+region.h+1e-8);
    area+=cell.w*cell.h;
  }
  assert.ok(Math.abs(area-region.w*region.h)<1e-8);
});
