import test from 'node:test';
import assert from 'node:assert/strict';
import { stageLayout } from '../src/game/stages/layout.ts';
import { followPage } from '../src/game/camera.ts';
import { partition } from '../src/game/geometry.ts';

test('game entry preserves original screen position after inserting upper stage',()=>{
  const layout=stageLayout(3000,800,800,1400);
  assert.equal(layout.initialScrollY,2200);
  assert.equal((1550+layout.pageOffset)-layout.initialScrollY,150);
  assert.equal(layout.height,4600);
  assert.equal(layout.bottomOffset,3800);
});
test('camera crosses both original page boundaries and clamps only at outer stage ends',()=>{
  const layout=stageLayout(3000,800,800,0);
  let camera=layout.pageOffset;
  for(let i=0;i<120;i++)camera=followPage(camera,700,800,layout.height,1/60);
  assert.ok(camera<layout.pageOffset && camera>0);
  camera=layout.bottomOffset-800;
  for(let i=0;i<120;i++)camera=followPage(camera,layout.bottomOffset+100,800,layout.height,1/60);
  assert.ok(camera>layout.bottomOffset-800);
  for(let i=0;i<300;i++)camera=followPage(camera,layout.height-30,800,layout.height,1/60);
  assert.ok(Math.abs(camera-(layout.height-800))<.001);
});
test('floor partitions never overlap homepage destructible triangles',()=>{
  const floors=[{x:0,y:0,w:600,h:800,id:-1},{x:0,y:3800,w:600,h:800,id:-2}];
  const cells=partition(600,4600,floors);
  assert.ok(cells.every(c=>c.y+c.h<=800+.00001 || (c.y>=800 && c.y+c.h<=3800+.00001) || c.y>=3800));
  const floorArea=cells.filter(c=>c.y<800 || c.y>=3800).reduce((sum,c)=>sum+c.w*c.h,0);
  assert.ok(Math.abs(floorArea-600*1600)<.0001);
});
