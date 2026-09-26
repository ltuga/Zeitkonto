import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {parseDurationInput:parse,displayDurationInput:display}=await loadTs('lib/duration-input.ts');
test('whole hours and explicit minutes normalize without changing the duration',()=>{
 for(const [text,expected] of [['8',480],['08',480],['08:00',480],['8:30',510],['0:15',15],[' 8 ',480]]){
  assert.equal(parse(text),expected);assert.equal(parse(display(expected)),expected);
 }
});
test('incomplete, decimal and invalid minute values cannot save the previous value',()=>{
 for(const text of ['',':','8:','8:6','8:60','1.5','1,5','abc','-8','9007199254740991'])assert.equal(parse(text),null);
});
test('leave limits and negative opening balances retain their rules',()=>{
 assert.equal(parse('8',{min:60,max:1440}),480);
 assert.equal(parse('25',{min:60,max:1440}),null);
 assert.equal(parse('0:30',{min:60,max:1440}),null);
 assert.equal(parse('-8',{signed:true}),-480);
 assert.equal(parse('-8:30',{signed:true}),-510);
 assert.equal(parse('0:15',{min:15,max:480}),15);
});
