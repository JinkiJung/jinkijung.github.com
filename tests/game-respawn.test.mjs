import test from 'node:test';
import assert from 'node:assert/strict';
import { createRespawnPicker, originalPageCamera, enemySpawnClear } from '../src/game/respawn.ts';
import { TextNavigation } from '../src/game/navigation.ts';

function scene(){
 const width=800,height=2400,mask=new Uint8ClampedArray(width*height*4);
 for(let y=500;y<1700;y++)for(let x=300;x<420;x++)mask[(y*width+x)*4+3]=255;
 return new TextNavigation(width,height,mask,width,height);
}
test('cached respawns retain body clearance plus preferred 48px text margin',()=>{
 const nav=scene(),pick=createRespawnPicker(nav);
 for(let i=0;i<100;i++){
  const p=pick(1000,600,()=>i/100);
  assert.ok(p && p.y>=1100 && p.y<=1530 && p.x>=30 && p.x<=770);
  for(let dy=-48;dy<=48;dy+=12)for(let dx=-48;dx<=48;dx+=12)assert.ok(nav.free({x:p.x+dx,y:p.y+dy}));
 }
 assert.notDeepEqual(pick(1000,600,()=>0),pick(1000,600,()=>.99));
});
test('scrolling invalidates candidate rows and repeated spawning never calls exact pixel checks',()=>{
 const nav=scene(),pick=createRespawnPicker(nav);
 nav.free=()=>{throw Error('No glyph scans allowed during respawn');};
 for(let i=0;i<1000;i++)assert.ok(pick(0,600).y<=530);
 assert.ok(pick(1200,600).y>=1300);
 assert.ok(pick(0,400).y<=330);
});
test('crowded scenes fall back to safe cells, and fully blocked screens return null',()=>{
 const blocked=new Uint8Array(50*100).fill(1);
 blocked[40*50+20]=0;
 const pick=createRespawnPicker({width:400,height:800,cols:50,rows:100,cellSize:8,blocked});
 assert.deepEqual(pick(0,600),{x:164,y:324});
 assert.equal(pick(500,300),null);
});

test('player respawns stay within original-page bounds even in full-world fallback',()=>{
 const nav=scene(),pick=createRespawnPicker(nav),page={top:600,bottom:1800};
 for(const camera of [0,1900,1000]){
  const safeCamera=originalPageCamera(camera,600,page);
  assert.ok(safeCamera>=600 && safeCamera<=1200);
  for(let i=0;i<20;i++){
   const p=pick(safeCamera,600,()=>i/20,page);
   assert.ok(p && p.y>=620 && p.y<=1780);
   assert.ok(p.y>=safeCamera+100 && p.y<=safeCamera+530);
  }
 }
 for(let i=0;i<20;i++){
  const p=pick(-100,2570,()=>i/20,page);
  assert.ok(p && p.y>=620 && p.y<=1780);
 }
});
test('safe extension cells cannot substitute for an entirely blocked original page',()=>{
 const blocked=new Uint8Array(50*300);
 for(let row=75;row<225;row++)blocked.fill(1,row*50,(row+1)*50);
 const pick=createRespawnPicker({width:400,height:2400,cols:50,rows:300,cellSize:8,blocked});
 assert.equal(pick(-100,2570,()=>0,{top:600,bottom:1800}),null);
 assert.ok(pick(0,600));
});

test('current-viewport respawn filters live ground and never searches other screens',()=>{
 const nav=scene(),pick=createRespawnPicker(nav);
 for(const camera of [0,1000,1800]){
  const bounds={top:camera+90,bottom:camera+510};
  const p=pick(camera,600,()=>.5,bounds,p=>p.x>600);
  assert.ok(p && p.x>600 && p.y>=camera+110 && p.y<=camera+490);
  assert.equal(pick(camera,600,()=>.5,bounds,()=>false),null);
 }
});

test('enemy spawns exclude the live player even when cached candidates are reused',()=>{
 const pick=createRespawnPicker({width:400,height:800,cols:50,rows:100,cellSize:8,blocked:new Uint8Array(5000)});
 const player={x:200,y:300};
 for(let i=0;i<20;i++){
  const spawn=pick(0,600,()=>.5,undefined,p=>enemySpawnClear(p,player));
  assert.ok(spawn && Math.hypot(spawn.x-player.x,spawn.y-player.y)>=120);
  Object.assign(player,spawn);
 }
});
test('no enemy spawns if the only free cell is next to the player',()=>{
 const blocked=new Uint8Array(5000).fill(1);blocked[40*50+20]=0;
 const pick=createRespawnPicker({width:400,height:800,cols:50,rows:100,cellSize:8,blocked});
 assert.equal(pick(0,600,()=>0,undefined,p=>enemySpawnClear(p,{x:164,y:324})),null);
 assert.ok(pick(0,600,()=>0,undefined,p=>enemySpawnClear(p,{x:350,y:500})));
});
