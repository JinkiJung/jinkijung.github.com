import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import Module from 'node:module';
import { createEvidence } from '../src/leaderboard/evidence.ts';

// Render the real desktop/mobile components with a shared cached board fixture.
// No transport is installed and no production endpoint can be reached.
const bundle=await build({stdin:{contents:`import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Results from './src/game/Results'; export const render=(props)=>renderToStaticMarkup(React.createElement(Results,props));`,resolveDir:process.cwd(),loader:'tsx'},jsx:"automatic",bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'mock-boards',setup(b){b.onResolve({filter:/\/service$/},()=>({path:'boards',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:`export const boardStore={load:()=>{throw Error('unexpected fetch')}}; export const useLeaderboards=()=>({status:'ready',data:{asOf:'2026-10-05T00:00:00Z',timezone:'Asia/Seoul',weekly:{start:'2026-10-01T00:00:00Z',end:'2026-11-01T00:00:00Z',entries:[]},monthly:{start:'2026-10-01T00:00:00Z',end:'2026-11-01T00:00:00Z',entries:[]},glass:{start:null,end:null,entries:[]}}});`,loader:'js'}));}}]});
const mod=new Module(`${process.cwd()}/results-test.cjs`);mod.filename=`${process.cwd()}/results-test.cjs`;mod.paths=Module._nodeModulePaths(process.cwd());mod._compile(bundle.outputFiles[0].text,mod.filename);
for(const mobile of [false,true])test(`${mobile?'mobile':'desktop'} v2 results admit Juggernaut/bonus scores without changing layout`,()=>{
 globalThis.matchMedia=()=>({matches:mobile});
 const evidence={...createEvidence(100).snapshot(),enemyKills:1,juggernautKills:1,juggernautCollisionKills:1,oilPitJuggernautKills:1};
 const props={stats:{score:3500,completion:{version:'jinki-v2',submissionId:'id',completedAt:'2026-10-05T00:00:00Z',playDurationSeconds:60,score:3500,evidence,ineligible:null}},preview:false,run:{nicknameLocked:false},onClose(){},onRetry(){},onResume(){}};
 const html=mod.exports.render(props);
 assert.match(html,/GAME OVER/);assert.match(html,/3,500/);assert.match(html,/Submit score · nickname/);
 assert.match(html,/aria-label="Exit"/);assert.match(html,/aria-label="Retry"/);
 assert.equal(html.includes('View leaderboard'),mobile);assert.equal(html.includes('WEEKLY BEST'),!mobile);
 const blocked=mod.exports.render({...props,stats:{...props.stats,completion:{...props.stats.completion,ineligible:'DEVELOPER_RUN'}}});
 assert.doesNotMatch(blocked,/id="score-nickname"/);assert.match(blocked,/Scores from developer mode cannot be submitted/);
 delete globalThis.matchMedia;
});
