import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {empty,weeklyWork,timeBalance,weeklySummary,summaryWeek}=await loadTs('lib/time.ts');
const {monthSummary}=await loadTs('lib/month-summary.ts');
const {dashboardState}=await loadTs('lib/dashboard.ts');
const entry=(date,hours=8,overrides={})=>({id:date,date,kind:'work',start:'22:00',end:'06:00',pause:30,includedPause:30,targetMinutes:480,delta:hours*60-480,note:'',...overrides});
const state=records=>({...structuredClone(empty),initial:10,records});
const work=(hours,dates=['2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18','2026-09-19','2026-09-20'])=>hours.map((h,i)=>entry(dates[i],h));
const bank=s=>timeBalance(s,'2026-09-20').current-600;
test('weekly 40h threshold replaces number of workdays',()=>{
 assert.equal(bank(state(work([10,10,10,10]))),0);
 assert.equal(bank(state(work([11,11,11,11]))),240);
 assert.equal(bank(state(work([6,6,6,6,6,6]))),0);
 assert.equal(bank(state(work([7,7,7,7,7,7]))),120);
 assert.equal(bank(state(work([9,7,8,8,8]))),0);
});
test('paid holidays and sickness count toward 40h and never debit bank',()=>{
 for(const kind of ['holiday','sick_note','sick_no_note']){
  const s=state([...work([8,8,8,8]),entry('2026-09-18',8,{kind})]);
  assert.equal(bank(s),0);
  s.records[0].delta+=240; // 36h work + 8h justified = 4h extra.
  assert.equal(bank(s),240);
  assert.equal(bank(state(work([8,8,8,8,8]).map(r=>({...r,kind})))),0);
 }
});
test('half day, hours and company gift leave use correct credits',()=>{
 for(const [holidayMode,holidayMinutes,credit] of [['half',undefined,240],['hours',120,120],['company_half',undefined,480]]){
  const s=state([...work([9,9,9,9]),entry('2026-09-18',8,{kind:'holiday',holidayMode,holidayMinutes})]);
  assert.equal(weeklySummary(s,'2026-09-20').justified,credit);
  assert.equal(bank(s),Math.max(0,2160+credit-2400));
 }
});
test('future absences and future work do not create early overtime',()=>{
 const s=state([...work([8,8,8,12]),entry('2026-09-20',8,{kind:'holiday'})]);
 assert.equal(timeBalance(s,'2026-09-17').current,600);
 assert.equal(timeBalance(s,'2026-09-20').current,840);
 assert.equal(weeklyWork(s,'2026-09-17').length,4);
});
test('late edits, deletion and sync order recalculate surplus without changing raw entries',()=>{
 const s=state(work([7,7,7,7,7,7]).reverse()),raw=structuredClone(s);
 assert.equal(bank(s),120);assert.deepEqual(s,raw);
 s.records=s.records.filter(r=>r.date!=='2026-09-14');assert.equal(bank(s),0);
 s.records.push(entry('2026-09-14',7));assert.equal(bank(s),120);
 s.records[0].delta-=120;assert.equal(bank(s),0);
});
test('week spanning year and month keeps one threshold; next Monday resets it',()=>{
 const s=state(work([10,10,10,10,4],['2026-12-28','2026-12-29','2026-12-30','2026-12-31','2027-01-01']));
 assert.equal(monthSummary(s,'2026-12','2027-01-03').delta,0);
 assert.equal(monthSummary(s,'2027-01','2027-01-03').delta,240);
 assert.equal(weeklySummary(s,'2027-01-04').balance,0);
});
test('active overnight shift shows only weekly surplus with chosen paid break',()=>{
 const s=state(work([8,8,8,8,4]));
 s.active={start:+new Date('2026-09-19T22:00:00'),pauseStart:null,paused:30*60000,targetMinutes:480,includedPause:30};
 const d=dashboardState(s,+new Date('2026-09-20T06:00:00'));
 assert.equal(d.date,'2026-09-19');assert.equal(d.delta,240);assert.equal(d.worked,450);
 s.active.includedPause=0;
 assert.equal(dashboardState(s,+new Date('2026-09-20T06:00:00')).delta,210);
});
test('compensatory rest debits bank once; justified time alone cannot earn overtime',()=>{
 const s=state([...work([8,8,8,8]),entry('2026-09-18',0,{kind:'rest',delta:-480})]);
 assert.equal(timeBalance(s,'2026-09-20').current,120);
 const leave=state(work([8,8,8,8,8,8,8]).map(r=>({...r,kind:'holiday'})));
 assert.equal(bank(leave),0);assert.equal(weeklySummary(leave,'2026-09-20').justified,2400);
});

test('Sunday overnight starts next work week; daytime Sunday stays in previous week',()=>{
 const rows=work([8,8,8,8,8,8],['2026-09-13','2026-09-14','2026-09-15','2026-09-16','2026-09-17','2026-09-18']);
 const s=state(rows);
 assert.equal(weeklySummary(s,'2026-09-18').worked,2880);
 assert.equal(weeklySummary(s,'2026-09-18').balance,480);
 rows[0].start='06:00';rows[0].end='14:00';
 assert.equal(weeklySummary(s,'2026-09-18').worked,2400);
 assert.equal(weeklySummary(s,'2026-09-18').balance,0);
});
test('Sunday running night shift does not borrow overtime from ending week',()=>{
 const s=state(work([8,8,8,8,8]));
 s.active={start:+new Date('2026-09-20T22:00:00'),pauseStart:null,paused:0,targetMinutes:480,includedPause:30};
 const d=dashboardState(s,+new Date('2026-09-20T23:00:00'));
 assert.equal(d.delta,0);
 assert.equal(weeklySummary(s,'2026-09-20').start,'2026-09-21');
 assert.equal(weeklySummary(s,'2026-09-20').worked,0);
});
test('Sunday to Monday accounting crosses year without moving calendar dates',()=>{
 const s=state(work([8,8,8,8,8,2],['2023-12-31','2024-01-01','2024-01-02','2024-01-03','2024-01-04','2024-01-05']));
 assert.equal(weeklySummary(s,'2024-01-05').balance,120);
 assert.equal(monthSummary(s,'2023-12','2024-01-05').delta,0);
 assert.equal(monthSummary(s,'2024-01','2024-01-05').delta,120);
 assert.equal(s.records[0].date,'2023-12-31');
});

 test('personal weekly view selects completed Sunday night and counts five shifts once',()=>{
 const s=state(work([8,8,8,8,8],['2026-09-13','2026-09-14','2026-09-15','2026-09-16','2026-09-17']));
 assert.equal(summaryWeek(s,'2026-09-13'),'2026-09-14');
 const total=weeklySummary(s,'2026-09-18',summaryWeek(s,'2026-09-13'));
 assert.equal(total.worked,2400);assert.equal(total.remaining,0);assert.equal(total.balance,0);
 assert.equal(weeklySummary(s,'2026-09-18','2026-09-07').worked,0);
 s.records.push(entry('2026-09-18',2));
 assert.equal(weeklySummary(s,'2026-09-19').balance,120);
 });
 test('Sunday night with holiday and sickness completes a private 40-hour week',()=>{
 const s=state(work([8,8,8],['2026-09-13','2026-09-14','2026-09-15']));
 s.records.push(entry('2026-09-16',0,{kind:'holiday'}),entry('2026-09-17',0,{kind:'sick_note'}));
 const total=weeklySummary(s,'2026-09-18');
 assert.equal(total.worked,1440);assert.equal(total.justified,960);assert.equal(total.remaining,0);
 assert.equal(timeBalance(s,'2026-09-18').current,600);
 });
