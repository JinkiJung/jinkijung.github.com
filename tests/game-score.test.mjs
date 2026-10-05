import test from 'node:test';
import assert from 'node:assert/strict';
import { createScore } from '../src/game/score.ts';

test('only newly destroyed player-owned shards earn ten points each',()=>{
 const s=createScore();
 s.glass(0,3);assert.equal(s.points,30);
 s.glass(3,3);assert.equal(s.points,30);
 s.glass(3,10,false);assert.equal(s.points,30);
 s.glass(10,12);assert.equal(s.points,50);
});
test('each kill adds 500 and a new game starts from zero',()=>{
 const s=createScore();s.kill();s.glass(0,1);s.kill();
 assert.equal(s.points,1010);assert.equal(createScore().points,0);
});

test('juggernaut kills award 750 while ordinary enemies retain 500',()=>{
 const s=createScore();s.kill(true);assert.equal(s.points,750);
 s.kill(false);assert.equal(s.points,1250);
 s.kill(true);assert.equal(s.points,2000);
});

import { createEvidence } from '../src/leaderboard/evidence.ts';
import { damageEnemyOnce } from '../src/game/enemyDamage.ts';
import { evidenceError } from '../src/leaderboard/protocol.ts';

test('repeated damage/death callbacks count one victim once; respawn retains counters and allows a new kill',()=>{
 const e=createEvidence(100),s=createScore(e),victim={hp:3,respawn:0};
 const collision=()=>s.bonus('collision');
 damageEnemyOnce(victim,2,collision);assert.equal(s.points,0);
 damageEnemyOnce(victim,2,collision);
 for(let i=0;i<5;i++)damageEnemyOnce(victim,2,()=>s.kill());
 assert.equal(s.points,750);assert.equal(e.snapshot().enemyKills,0);
 victim.hp=4.5;
 damageEnemyOnce(victim,4.5,()=>s.bonus('oilPit'));
 damageEnemyOnce(victim,4.5,()=>s.bonus('oilPit'));
 assert.equal(s.points,2750);assert.equal(e.snapshot().enemyKills,0);
 victim.hp=4.5;
 damageEnemyOnce(victim,2.5,()=>s.kill(true));
 damageEnemyOnce(victim,2.5,()=>s.kill(true));
 damageEnemyOnce(victim,2.5,()=>s.kill(true));
 assert.equal(s.points,3500);
 assert.deepEqual([e.snapshot().enemyKills,e.snapshot().juggernautKills,e.snapshot().juggernautCollisionKills,e.snapshot().oilPitJuggernautKills],[1,1,1,1]);
 assert.equal(evidenceError(e.snapshot(),s.points),null);
});
