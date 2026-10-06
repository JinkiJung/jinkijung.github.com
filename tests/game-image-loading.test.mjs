import test from 'node:test';
import assert from 'node:assert/strict';
import { loadImage } from '../src/game/loadImage.ts';

function mockImage(t, mode) {
 const instances=[];
 class ImageMock {
  naturalWidth=0; complete=false;
  constructor(){instances.push(this);}
  decode(){throw new Error('decode must not gate game startup');}
  set src(value){
   this.url=value;
   if(mode==='cached'){this.complete=true;this.naturalWidth=32;}
   if(mode==='loaded')queueMicrotask(()=>{this.naturalWidth=32;this.onload?.();});
   if(mode==='error')queueMicrotask(()=>this.onerror?.());
  }
  removeAttribute(){this.url=undefined;}
 }
 const original=Object.getOwnPropertyDescriptor(globalThis,'Image');
 globalThis.Image=ImageMock;
 t.after(()=>{if(original)Object.defineProperty(globalThis,'Image',original);else delete globalThis.Image;});
 return instances;
}
// A real browser may fire onload while its SVG decode promise never settles.
for(const mode of ['loaded','cached'])test(`image startup succeeds without decode (${mode})`,async t=>{
 const images=mockImage(t,mode);
 assert.equal(await loadImage('snapshot.svg'),images[0]);
 assert.equal(images[0].onload,null);
});
test('failed image reports a retryable error',async t=>{
 mockImage(t,'error');
 await assert.rejects(loadImage('missing.png'),/SPRITE_LOAD_FAILED/);
});
test('silent image load cannot hang startup',async t=>{
 const images=mockImage(t,'pending');
 await assert.rejects(loadImage('stalled.svg',{timeoutMs:5,errorCode:'SCENE_TIMEOUT'}),/SCENE_TIMEOUT/);
 assert.equal(images[0].url,undefined);
});
test('closing the game cancels snapshot loading and removes handlers',async t=>{
 const images=mockImage(t,'pending'), controller=new AbortController();
 const pending=loadImage('snapshot.svg',{signal:controller.signal});
 controller.abort();
 await assert.rejects(pending,{name:'AbortError'});
 assert.equal(images[0].onload,null);
 assert.equal(images[0].url,undefined);
});
test('already cancelled capture does not start an image request',async t=>{
 const images=mockImage(t,'pending'), controller=new AbortController();controller.abort();
 await assert.rejects(loadImage('snapshot.svg',{signal:controller.signal}),{name:'AbortError'});
 assert.equal(images.length,0);
});
