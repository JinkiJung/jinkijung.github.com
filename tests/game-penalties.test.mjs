import test from 'node:test';
import assert from 'node:assert/strict';
import { penaltyAt, penaltyInput } from '../src/game/penalties.ts';
import { createWeapons } from '../src/game/weapons.ts';
import { readFileSync } from 'node:fs';
const region={x:10,y:20,w:100,h:80,kind:'ice',direction:-1};
test('penalty activates only on exposed ground and disappears outside its region',()=>{
 assert.equal(penaltyAt(30,40,[region],()=>false),null);
 assert.equal(penaltyAt(30,40,[region],()=>true),region);
 assert.equal(penaltyAt(130,40,[region],()=>true),null);
 assert.deepEqual(penaltyInput(1,-1,region),{x:1,y:-1});
 assert.deepEqual(penaltyInput(1,1,{...region,kind:'one-way'}),{x:0,y:0});
 assert.deepEqual(penaltyInput(-1,-1,{...region,kind:'one-way'}),{x:0,y:-1});
 assert.deepEqual(penaltyInput(1,1,{...region,kind:'one-way',direction:1}),{x:0,y:1});
 assert.deepEqual(penaltyInput(1,0,{...region,kind:'no-fire'}),{x:1,y:0});
});
test('weapon assignments remain valid and unique in each four-cache stage',()=>{
 const game=createWeapons(Array.from({length:76},()=>({x:0,y:0,w:100,h:100})),()=>0);
 for(let i=0;i<76;i+=4){const weapons=game.pickups.slice(i,i+4).map(p=>p.weapon);assert.equal(new Set(weapons).size,4);assert.ok(weapons.every(Boolean));}
});
test('six standalone stages have no navigation links and retain hazard and bridge hooks',()=>{
 for(const dir of ['up','down'])for(let n=1;n<=3;n++){
  const html=readFileSync(new URL(`../public/stages/index-${dir}-${n}.html`,import.meta.url),'utf8');
  assert.equal(/<a\b|<script\b/.test(html),false);
  assert.equal((html.match(/class="career-col-bg"/g)||[]).length,12);
  assert.equal((html.match(/class="shell shell-[123]"/g)||[]).length,3);
  assert.ok(html.includes('data-full-width'));
  assert.equal((html.match(/data-penalty=/g)||[]).length,3);
  assert.equal(/class="career-col-bg"[^>]*data-penalty/.test(html),false);
  assert.ok(html.includes(`data-fall-direction="${dir==='up'?-1:1}"`));
 }
});
