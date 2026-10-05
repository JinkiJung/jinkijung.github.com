import test from 'node:test';
import assert from 'node:assert/strict';
import { crossesPit, playerCrossesPit } from '../src/game/pits.ts';
import { createRespawnPicker } from '../src/game/respawn.ts';
const pits=[{x:0,y:200,w:400,h:30}];
test('both crossing directions, fast movement and stationary occupants trigger the same pit check',()=>{
 assert.ok(crossesPit(100,180,100,250,pits));
 assert.ok(crossesPit(100,250,100,180,pits));
 assert.ok(crossesPit(100,215,100,215,pits));
 assert.equal(crossesPit(100,180,120,190,pits),false);
 assert.equal(crossesPit(410,180,410,250,pits),false);
});
test('respawn candidates exclude pits and body margins without changing movement navigation',()=>{
 const blocked=new Uint8Array(50*100),grid={width:400,height:800,cols:50,rows:100,cellSize:8,blocked};
 const pick=createRespawnPicker(grid,pits);
 for(let i=0;i<100;i++){
  const p=pick(0,600,()=>i/100);
  assert.ok(p && (p.y<180 || p.y>250));
 }
 assert.ok(blocked.every(v=>v===0));
});

test('fall pose shrinks and descends before disappearing completely',async()=>{
 const {fallPose,FALL_DURATION}=await import('../src/game/pits.ts');
 const start=fallPose(0),mid=fallPose(FALL_DURATION/2),end=fallPose(FALL_DURATION);
 assert.equal(start.scale,1);assert.equal(start.drop,0);
 assert.ok(mid.scale>0 && mid.scale<1 && mid.drop>0 && mid.alpha>0);
 assert.equal(end.scale,0);assert.equal(end.alpha,0);assert.ok(end.drop>mid.drop);
 assert.deepEqual(fallPose(FALL_DURATION+1),end);
});

test('concrete bridges protect the whole swept crossing for both movement directions',()=>{
 const bridges=[{x:80,y:190,w:80,h:80}];
 assert.equal(crossesPit(100,180,100,250,pits,bridges),false);
 assert.equal(crossesPit(100,250,100,180,pits,bridges),false);
 assert.equal(crossesPit(100,215,100,215,pits,bridges),false);
 assert.equal(crossesPit(100,215,180,215,pits,bridges),true);
 assert.equal(crossesPit(70,180,70,250,pits,bridges),true);
});
test('fast travel cannot skip uncovered gaps between concrete plates',()=>{
 assert.equal(crossesPit(50,215,350,215,pits,[{x:40,y:200,w:100,h:30},{x:160,y:200,w:200,h:30}]),true);
 assert.equal(crossesPit(50,215,350,215,pits,[{x:40,y:200,w:120,h:30},{x:160,y:200,w:200,h:30}]),false);
});
test('a fallen slab supplies its full rectangular bridge footprint',async()=>{
 const {createConcretePlates}=await import('../src/game/concrete.ts');
 const concrete=createConcretePlates([{x:80,y:180,w:80,h:7,id:0,active:false}]);
 assert.equal(crossesPit(100,180,100,250,pits,concrete.supportRegions()),true);
 concrete.topple(0);concrete.update(1);
 assert.equal(crossesPit(100,180,100,250,pits,concrete.supportRegions()),false);
});

test('melee recoil ignores pits in transit and checks only its landing position',()=>{
 assert.equal(playerCrossesPit(100,180,100,215,pits,[],true,.1),false);
 assert.equal(playerCrossesPit(100,215,100,215,pits,[],true,.05),false);
 assert.equal(playerCrossesPit(100,215,100,250,pits,[],true,0),false);
 assert.equal(playerCrossesPit(100,180,100,250,pits,[],true,0),false);
 assert.equal(playerCrossesPit(100,250,100,180,pits,[],true,0),false);
 assert.equal(playerCrossesPit(100,180,100,215,pits,[],true,0),true);
 assert.equal(playerCrossesPit(100,215,100,215,pits,[],true,0),true);
 const bridges=[{x:80,y:190,w:80,h:80}];
 assert.equal(playerCrossesPit(100,180,100,215,pits,bridges,true,0),false);
 // Ordinary movement still checks the whole segment, including interrupted recoil.
 assert.equal(playerCrossesPit(100,180,100,250,pits,[],false,0),true);
 assert.equal(playerCrossesPit(100,215,100,250,pits,[],false,0),true);
});
