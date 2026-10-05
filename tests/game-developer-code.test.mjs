import test from 'node:test';
import assert from 'node:assert/strict';
import {createDeveloperCode} from '../src/game/developerCode.ts';
const type=(input,text)=>[...text].map(letter=>input.press(`Key${letter.toUpperCase()}`));
test('only the complete secret activates developer mode',()=>{
 const input=createDeveloperCode();
 assert.deepEqual(type(input,'skroqkfwkdu'),[false,false,false,false,false,false,false,false,false,false,true]);
 assert.ok(type(input,'skroqkfwkdx').every(value=>!value));
 assert.equal(type(input,'skroqkfwkdu').at(-1),true);
});
test('pause reset prevents carrying a partial code into another pause',()=>{
 const input=createDeveloperCode();type(input,'skroq');input.reset();
 assert.ok(type(input,'kfwkdu').every(value=>!value));
});
test('held key repeats do not advance or corrupt the sequence; non-letter keys reset it',()=>{
 const input=createDeveloperCode();input.press('KeyS');assert.equal(input.press('KeyS',true),false);
 assert.equal(type(input,'kroqkfwkdu').at(-1),true);
 type(input,'skroq');input.press('Space');assert.ok(type(input,'kfwkdu').every(value=>!value));
});
