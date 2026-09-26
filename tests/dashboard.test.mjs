import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {dashboardState}=await loadTs('lib/dashboard.ts');
const {empty}=await loadTs('lib/time.ts');
test('home does not invent a planned shift or balance before work starts',()=>{
 const d=dashboardState(empty,+new Date('2026-09-19T12:00:00'));
 assert.equal(d.start,undefined);assert.equal(d.next,null);assert.equal(d.delta,null);assert.equal(d.progress,0);
});
test('home keeps the entry date of an overnight active shift and its paid break policy',()=>{
 const start=+new Date('2026-09-19T22:00:00');
 const d=dashboardState({...empty,active:{start,pauseStart:null,paused:30*60000,targetMinutes:480,includedPause:30}},+new Date('2026-09-20T06:00:00'));
 assert.equal(d.date,'2026-09-19');assert.equal(d.worked,450);assert.equal(d.delta,0);
});
test('next shift skips absences, completed shifts and ended shifts across years',()=>{
 const shift=(id,date)=>({id,date,name:'Night',start:'22:00',end:'06:00',targetMinutes:480});
 const d=dashboardState({...empty,shifts:[shift('a','2026-12-29'),shift('b','2026-12-31'),shift('c','2027-01-02')],records:[{date:'2026-12-31',kind:'holiday'}]},+new Date('2026-12-31T12:00:00'));
 assert.equal(d.next.id,'c');
});
