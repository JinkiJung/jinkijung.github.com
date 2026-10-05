import test from 'node:test';
import assert from 'node:assert/strict';
import {createRun} from '../src/game/run.ts';
test('two lives allow one respawn and end on second death',()=>{
 const run=createRun();assert.equal(run.lives,2);
 run.advance(3.9);assert.equal(run.seconds,3);
 assert.equal(run.die(false),false);assert.equal(run.lives,1);
 assert.equal(run.die(false),true);assert.equal(run.lives,0);
 run.advance(10);run.die(false);assert.equal(run.seconds,3);assert.equal(run.lives,0);
});
test('developer deaths do not consume remaining lives or end the game',()=>{
 const run=createRun();run.die(false);
 for(let i=0;i<20;i++)assert.equal(run.die(true),false);
 assert.equal(run.lives,1);assert.equal(run.ended,false);
 assert.equal(run.die(false),true);
});
test('death reads the current developer checkbox after startup and control-object replacement',()=>{
 let controls={developer:false};const run=createRun(()=>controls.developer);
 assert.equal(run.die(),false);assert.equal(run.lives,1);
 controls={developer:true};
 for(let i=0;i<10;i++){assert.equal(run.die(),false);assert.equal(run.ended,false);assert.equal(run.lives,1);}
 controls={developer:false};assert.equal(run.die(),true);
});
test('developer mode enabled before startup survives more than two deaths',()=>{
 const run=createRun(()=>true);
 for(let i=0;i<20;i++){assert.equal(run.die(),false);assert.equal(run.lives,2);assert.equal(run.ended,false);}
});
