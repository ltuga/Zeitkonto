import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {empty,timeBalance,annualSummary}=await loadTs('lib/time.ts');
const record=(kind,date,delta=0)=>({id:kind+date,kind,date,delta,start:'',end:'',pause:0,includedPause:30,note:''});
const data={...empty,initial:24,holidayEntitlements:{2026:30},records:[record('holiday','2026-09-01'),record('holiday','2026-09-15'),record('rest','2026-09-15',-480),record('work','2026-09-20',120)]};
test('future rest is reserved and becomes used exactly once on its date',()=>{
 assert.deepEqual(timeBalance(data,'2026-09-14'),{accumulated:1440,used:0,reserved:480,current:1440,available:960});
 assert.deepEqual(timeBalance(data,'2026-09-15'),{accumulated:1440,used:480,reserved:0,current:960,available:960});
 assert.equal(timeBalance(data,'2026-09-20').current,960);
});
test('holiday reservation moves to used while free allowance stays stable',()=>{
 const before=annualSummary(data,2026,'2026-09-14'),after=annualSummary(data,2026,'2026-09-15');
 assert.equal(before.used,1);assert.equal(before.reserved,1);assert.equal(before.unspent,29);assert.equal(before.remaining,28);
 assert.equal(after.used,2);assert.equal(after.reserved,0);assert.equal(after.unspent,28);assert.equal(after.remaining,28);
});
test('cancelled future reservations release available balances',()=>{
 const cancelled={...data,records:data.records.filter(r=>r.date!=='2026-09-15')};
 assert.equal(timeBalance(cancelled,'2026-09-14').available,1440);assert.equal(annualSummary(cancelled,2026,'2026-09-14').remaining,29);
});
