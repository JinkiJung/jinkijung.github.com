import test from 'node:test';
import assert from 'node:assert/strict';
import { inlineStageImages } from '../src/game/stageImages.ts';

function setup(t,ok=true) {
 const originals=new Map(['fetch','FileReader','Image'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 t.after(()=>{for(const [k,d] of originals)if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];});
 let requests=0;
 globalThis.fetch=async()=>{requests++;return {ok,blob:async()=>new Blob(['image'])};};
 globalThis.FileReader=class{readAsDataURL(){this.result='data:image/png;base64,aW1hZ2U=';queueMicrotask(()=>this.onload());}};
 globalThis.Image=class{naturalWidth=16;set src(value){queueMicrotask(()=>this.onload?.());}removeAttribute(){}};
 const image=()=>({src:'https://example.test/shared.png',currentSrc:'',loading:'lazy',removeAttribute(name){this.removed=name;}});
 return {image,requests:()=>requests};
}
test('stage images embed without requiring sandbox image load events, sharing one fetch across stages',async t=>{
 const {image,requests}=setup(t),a=image(),b=image(),cache=new Map(),signal=new AbortController().signal;
 await Promise.all([inlineStageImages({querySelectorAll:()=>[a]},signal,cache),inlineStageImages({querySelectorAll:()=>[b]},signal,cache)]);
 assert.equal(requests(),1);
 for(const img of [a,b]){assert.match(img.src,/^data:image/);assert.equal(img.loading,'eager');assert.equal(img.removed,'srcset');}
});
test('failed resource stops stage capture instead of leaving a pending image event',async t=>{
 const {image}=setup(t,false);
 await assert.rejects(inlineStageImages({querySelectorAll:()=>[image()]},new AbortController().signal,new Map()),/STAGE_LOAD_FAILED/);
});
test('cancelled stage preparation does not modify its image',async t=>{
 const {image}=setup(t),img=image(),controller=new AbortController();controller.abort();
 await assert.rejects(inlineStageImages({querySelectorAll:()=>[img]},controller.signal,new Map()),{name:'AbortError'});
 assert.equal(img.src,'https://example.test/shared.png');
});
