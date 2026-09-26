import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {parseClockInput:parse}=await loadTs('lib/clock-input.ts');

test('keyboard clock entries normalize without shifting minutes',()=>{
  for(const [input,expected] of Object.entries({'6':'06:00','06':'06:00','630':'06:30','0630':'06:30','632':'06:32','6:30':'06:30','06:30':'06:30','0':'00:00','2359':'23:59',' 22 ':'22:00'})) assert.equal(parse(input),expected,input);
});
test('invalid or incomplete clock entries cannot be saved',()=>{
  for(const input of ['', '24','2400','2360','63:2','6:3','-6','6.5','12:60','12345','abc']) assert.equal(parse(input),null,input);
});
test('normalization preserves overnight clock endpoints',()=>{
  assert.equal(parse('22'),'22:00');
  assert.equal(parse('600'),'06:00');
  assert.equal(parse(parse('632')),'06:32');
});
