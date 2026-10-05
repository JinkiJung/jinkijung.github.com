import test from 'node:test';
import assert from 'node:assert/strict';
import { createStruggle } from '../src/game/struggle.ts';
import { moveBody } from '../src/game/navigation.ts';

test('walking, repeated keys and slow changes cannot trigger escape',()=>{
  const s=createStruggle();
  for(let i=0;i<30;i++) assert.equal(s.press(0,i*20,i>0),false);
  for(let i=0;i<10;i++) assert.equal(s.press(0,700+i*10),false);
  s.reset();
  for(let i=0;i<10;i++) assert.equal(s.press(i%2,1000+i*500),false);
});
test('rapid alternating directions trigger one burst and reset on blur',()=>{
  const s=createStruggle();
  assert.equal(s.press(0,0),false);
  assert.equal(s.press(Math.PI,100),false);
  assert.equal(s.press(0,200),false);
  assert.equal(s.press(Math.PI,300),true);
  assert.equal(s.press(0,400),false);
  s.reset();
  assert.equal(s.press(Math.PI,500),false);
  assert.equal(s.press(0,600),false);
});
test('normal movement stops at intact ground and resumes after an escape opening',()=>{
  const body={x:100,y:100};let opened=false;
  const nav={canMove:()=>true}, floor=()=>opened;
  moveBody(nav,body,30,0,floor);
  assert.equal(body.x,100);
  opened=true;
  moveBody(nav,body,30,0,floor);
  assert.equal(body.x,130);
});
