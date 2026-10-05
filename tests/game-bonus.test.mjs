import test from 'node:test';
import assert from 'node:assert/strict';
import {createScore} from '../src/game/score.ts';
import {createBonuses} from '../src/game/bonus.ts';
import {oilChargeTravel} from '../src/game/charger.ts';
test('bonus scores add per enemy without a normal kill reward',()=>{
 const score=createScore();score.bonus('collision');score.bonus('collision');assert.equal(score.points,1500);
 score.bonus('oilPit');assert.equal(score.points,3500);
 score.kill();assert.equal(score.points,4000);
});
test('oil attribution persists after leaving oil for the current charge',()=>{
 const state={chargeAngle:0,chargeOily:false,chargeOilDeflected:false};
 oilChargeTravel(state,0,0,9,()=>true,()=>false,()=>1);assert.equal(state.chargeOilDeflected,false);
 oilChargeTravel(state,0,0,9,()=>true,()=>true,()=>1);assert.equal(state.chargeOilDeflected,true);
 oilChargeTravel(state,0,0,9,()=>true,()=>false,()=>1);assert.equal(state.chargeOily,false);assert.equal(state.chargeOilDeflected,true);
});
test('bonus popup is bounded, culled, and expires after 1.2 seconds',()=>{
 let count=0;const ctx={save(){},restore(){},translate(){},strokeText(){},fillText(){count++;}};
 const fx=createBonuses();for(let i=0;i<20;i++)fx.add(100,300,'collision');
 fx.draw(ctx,0,600,800);assert.equal(count,12);
 count=0;fx.draw(ctx,1000,600,800);assert.equal(count,0);
 fx.update(1.2);fx.draw(ctx,0,600,800);assert.equal(count,0);
});
