import test from 'node:test';
import assert from 'node:assert/strict';
import { createWeapons, burnTick, piercedEnemies, mineFuse, triggersMine, WEAPONS, SPECS, spikeMotion } from '../src/game/weapons.ts';
import { reflectTriangle } from '../src/game/geometry.ts';
import { surfaceMotion } from '../src/game/ice.ts';

test('four centered random pickups require unlocked and reachable floor',()=>{
  const game=createWeapons(Array.from({length:4},(_,i)=>({x:i*100,y:0,w:80,h:100})),()=>0);
  assert.deepEqual(game.pickups.map(p=>p.weapon),WEAPONS.slice(0,4));
  const player={x:40,y:50};
  game.update(.2,player,true,()=>false,()=>true);assert.equal(game.equipped,'pistol');
  game.update(.2,player,true,()=>true,()=>false);assert.equal(game.equipped,'pistol');
  game.update(.2,player,true,()=>true,()=>true);assert.equal(game.equipped,'uzi');
  assert.equal(game.pickups[0].cooldown,18);
  game.reset();game.update(.2,player,false,()=>true,()=>true);assert.equal(game.equipped,'pistol');
});
test('spikes decelerate, stop, and reflect without added thrust',()=>{
  const p=[0,0,100,0,0,100];
  const reflected=reflectTriangle(p,0,30,100,20);
  assert.deepEqual(reflected,{vx:-100,vy:20});
  const motion=spikeMotion(reflected.vx,reflected.vy,.1);
  assert.ok(Math.hypot(motion.vx,motion.vy)<Math.hypot(100,20));
  let vx=680;for(let i=0;i<600;i++)vx=spikeMotion(vx,0,1/60).vx;
  assert.equal(vx,0);
  const simulate=fps=>{let v=680,x=0;for(let i=0;i<fps;i++){const m=spikeMotion(v,0,1/fps);v=m.vx;x+=m.x;}return x;};
  assert.ok(Math.abs(simulate(30)-simulate(120))<1e-8);
});
test('oil coasts further than ice and deployables are bounded and expire',()=>{
  const ice={vx:270,vy:0},oil={...ice};
  assert.ok(surfaceMotion(oil,0,0,false,.5,true).x>surfaceMotion(ice,0,0,true,.5).x);
  const game=createWeapons([]);
  for(let i=0;i<20;i++){game.placeOil(i,0);game.placeMine(i,0);game.explode(i,0);}
  assert.equal(game.oils.length,8);assert.equal(game.mines.length,3);assert.equal(game.blasts.length,8);
  assert.equal(game.oils[0].w,144);assert.equal(game.oily(19,0),true);
  game.update(31,{x:0,y:0},false,()=>false,()=>false);
  assert.equal(game.oils.length+game.blasts.length,0);
  assert.ok(game.mines.every(m=>mineFuse(m.life).expired));
});
test('weapon patterns retain distinct damage, cadence and range',()=>{
  assert.equal(SPECS.triple.angles.length,3);
  assert.ok(SPECS.shotgun.damage*SPECS.shotgun.angles.length>3);
  assert.ok(SPECS.shotgun.delay>SPECS.pistol.delay);
  assert.ok(SPECS.uzi.delay<SPECS.pistol.delay);
  assert.equal(SPECS.spike.angles.length,1);
});

test('three mines block further placement without replacing existing mines',()=>{
  const game=createWeapons([]);
  for(let i=0;i<3;i++)assert.equal(game.placeMine(i*100,0),true);
  assert.equal(game.placeMine(400,0),false);
  assert.deepEqual(game.mines.map(m=>m.x),[0,100,200]);
  game.mines.splice(1,1);
  assert.equal(game.placeMine(400,0),true);
});
test('player feet trigger an armed mine, but not during arming, falling or behind cover',()=>{
  const mine={x:0,y:0,arm:.5},player={x:20,y:0};
  assert.equal(triggersMine(mine,player,true,()=>true,26),false);
  mine.arm=0;
  assert.equal(triggersMine(mine,player,true,()=>true,26),true);
  assert.equal(triggersMine(mine,player,false,()=>true,26),false);
  assert.equal(triggersMine(mine,player,true,()=>false,26),false);
  assert.equal(triggersMine(mine,{x:28,y:0},true,()=>true,26),false);
});

test('mine warns at nine seconds and remains available for detonation at ten',()=>{
  for(const fps of [30,60,120]) {
    const game=createWeapons([]);game.placeMine(0,0);
    const update=dt=>game.update(dt,{x:100,y:100},false,()=>false,()=>false);
    for(let i=0;i<fps*9-1;i++)update(1/fps);
    assert.equal(mineFuse(game.mines[0].life).warning,false);
    update(1/fps);
    assert.deepEqual(mineFuse(game.mines[0].life),{warning:true,expired:false});
    for(let i=0;i<fps;i++)update(1/fps);
    assert.equal(game.mines.length,1); // Engine consumes it through the shared explosion path.
    assert.equal(mineFuse(game.mines[0].life).expired,true);
  }
});

test('shotgun crosses multiple enemies per sweep but respects walls and one hit per pellet',()=>{
  const enemies=[{x:25,y:0,hp:3},{x:50,y:0,hp:3},{x:90,y:0,hp:3},{x:20,y:100,hp:3}];
  const hits=piercedEnemies(0,0,100,0,.6,new Set(),enemies);
  assert.deepEqual(hits,[0,1]); // Third target is behind the wall, fourth is outside the trajectory.
  assert.deepEqual(piercedEnemies(0,0,100,0,Infinity,new Set(hits),enemies),[2]);
  assert.deepEqual(piercedEnemies(0,0,100,0,Infinity,new Set([0,1,2]),enemies),[]);
  enemies[0].hp=0;
  assert.deepEqual(piercedEnemies(0,0,100,0,.6,new Set(),enemies),[1]);
});

test('all four caches stay unique even when random values repeat',()=>{
  for(const random of [()=>0,()=>.999,()=>.5]) {
    const game=createWeapons(Array.from({length:4},()=>({x:0,y:0,w:100,h:100})),random);
    assert.equal(new Set(game.pickups.map(p=>p.weapon)).size,4);
  }
});

test('oil ignites only when reached by flame, expires ten seconds after placement',()=>{
  const game=createWeapons([]);game.placeOil(100,100);
  assert.equal(game.burning(100,100),false);
  game.ignite(0,100,[{dx:96,dy:0}],()=>.2);
  assert.equal(game.burning(100,100),false);
  game.ignite(0,0,[{dx:96,dy:0}],()=>Infinity);
  assert.equal(game.burning(100,100),false);
  game.update(8,{x:0,y:0},false,()=>false,()=>false);
  game.ignite(0,100,[{dx:96,dy:0}],()=>Infinity);
  assert.equal(game.burning(100,100),true);
  assert.equal(game.burning(180,100),false);
  assert.equal(game.oils[0].life,2); // Ignition does not restart the lifetime.
  game.update(2,{x:0,y:0},false,()=>false,()=>false);
  assert.equal(game.oils.length,0);assert.equal(game.burning(100,100),false);
});
test('burning ground deals four HP per second independent of FPS and stops on exit',()=>{
  for(const fps of [30,60,120]){
    let elapsed=0,damage=0;
    for(let i=0;i<fps;i++){const b=burnTick(elapsed,1/fps,true);elapsed=b.elapsed;damage+=b.damage;}
    assert.equal(damage,4);
  }
  assert.deepEqual(burnTick(.2,.1,false),{elapsed:0,damage:0});
});

test('piercing tracks more than 32 enemy slots independently',()=>{
 const enemies=Array.from({length:40},()=>({x:30,y:0,hp:3}));
 assert.deepEqual(piercedEnemies(0,0,100,0,Infinity,new Set(Array.from({length:39},(_,i)=>i)),enemies),[39]);
 assert.equal(SPECS.spike.damage,1);
});

test('oil placement chooses a stable random silhouette while keeping its size and lifetime',()=>{
 let roll=0;const game=createWeapons([],()=>roll);
 for(const value of [0,.4,.9]){roll=value;game.placeOil(100,100);}
 assert.deepEqual(game.oils.map(o=>o.variant),[0,1,2]);
 for(const oil of game.oils){assert.equal(oil.w,144);assert.equal(oil.h,144);assert.equal(oil.life,10);}
 game.update(.1,{x:0,y:0},false,()=>false,()=>false);
 assert.deepEqual(game.oils.map(o=>o.variant),[0,1,2]);
});

test('career sets stay unique across pages even when earlier sets are incomplete or interleaved',()=>{
  const regions=[{group:'main:0'},...Array.from({length:4},()=>({group:'up:0'})),...Array.from({length:4},()=>({group:'down:0'}))].map(r=>({...r,x:0,y:0,w:100,h:100}));
  const game=createWeapons(regions,()=>0);
  for(const group of ['up:0','down:0'])assert.equal(new Set(game.pickups.filter(p=>regions[p.index].group===group).map(p=>p.weapon)).size,4);
  const mixed=Array.from({length:8},(_,i)=>({x:0,y:0,w:100,h:100,group:i%2?'up:1':'down:1'}));
  const interleaved=createWeapons(mixed,()=>.5);
  for(const group of ['up:1','down:1'])assert.equal(new Set(interleaved.pickups.filter(p=>mixed[p.index].group===group).map(p=>p.weapon)).size,4);
});
