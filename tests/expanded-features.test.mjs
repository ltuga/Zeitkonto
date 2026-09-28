import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {remember,readOutbox,applyAction} from '../public/offline-core.js';
const require=createRequire(import.meta.url),{build}=createRequire(require.resolve('vite'))('esbuild'),dir=await mkdtemp(tmpdir()+'/zeit-features-');
const modules={};for(const name of ['time','change-history','month-summary','planned-shifts','calendar-print']){await build({entryPoints:['lib/'+name+'.ts'],bundle:true,platform:'node',format:'esm',outfile:dir+'/'+name+'.mjs'});modules[name]=await import(pathToFileURL(dir+'/'+name+'.mjs'));}await rm(dir,{recursive:true});
const {empty,stateSchema,recordSchema,duration,timeBalance}=modules.time;
const r=recordSchema.parse({id:'r1',date:'2026-09-12',kind:'work',start:'06:00',end:'12:30',pause:30,includedPause:0,delta:0,note:'',targetMinutes:360});
test('daily targets preserve raw entries; bank only credits weekly surplus',()=>{
 assert.equal(duration('06:00','12:30',30,0,360),0);assert.equal(duration('06:00','13:30',30,0,360),60);assert.equal(duration('22:00','06:00',30,30,480),0);
 const old=recordSchema.parse({...r,targetMinutes:undefined,delta:120});assert.equal(old.targetMinutes,480);assert.equal(timeBalance({...empty,dailyMinutes:360,records:[old]},'2026-09-12').current,0);
});
test('offline active shift keeps its own target after settings change',()=>{
 const m=new Map(),storage={getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)};remember('a',{...empty,dailyMinutes:360,includedPause:0},true,storage);const start=+new Date('2026-09-12T06:00:00');let q=applyAction(readOutbox(storage),'start',start);q.targetMinutes=480;q=applyAction(q,'finish',start+360*60000,'part-time');assert.equal(q.records[0].targetMinutes,360);assert.equal(q.records[0].delta,0);
});
test('edit history retains snapshots; deletion removes payloads from history',()=>{
 const {captureChanges}=modules['change-history'];const before={...empty,records:[r]},next={...before,records:[{...r,note:'corrected'}]};const logs=captureChanges(before,next,'2026-09-12T14:00:00Z');assert.equal(logs.length,1);assert.equal(logs[0].action,'edit');assert.equal(JSON.parse(logs[0].before).note,'');assert.equal(JSON.parse(logs[0].after).note,'corrected');
 const deleted=captureChanges({...next,changes:logs},{...next,records:[]});assert.equal(deleted[0].action,'delete');assert.deepEqual(JSON.parse(deleted[0].before),{id:r.id});assert.equal(deleted.length,1);assert.ok(!JSON.stringify(deleted).includes("corrected"));assert.equal(captureChanges({...before,changes:Array(300).fill(logs[0])},next).length,300);
});
test('monthly report uses record targets, excludes future work and includes booked absences',()=>{
 const s=stateSchema.parse({...empty,records:[r,{...r,id:'future',date:'2026-09-20',delta:60},{...r,id:'leave',kind:'holiday',date:'2026-09-21'}]});const m=modules['month-summary'].monthSummary(s,'2026-09','2026-09-12');assert.equal(m.expected,360);assert.equal(m.credited,360);assert.equal(m.days,1);assert.equal(m.holidays,1);
});
test('copy period crosses month boundary and conflicting edits are atomic',()=>{
 const {copyPeriod,replacePlanned}=modules['planned-shifts'];const shifts=[{id:'s1',date:'2026-09-28',name:'Morning',start:'06:00',end:'12:00',targetMinutes:360},{id:'s2',date:'2026-09-30',name:'Morning',start:'06:00',end:'12:00',targetMinutes:360}];const copies=copyPeriod(shifts,'2026-09-28','2026-09-30','2026-10-05');assert.deepEqual(copies.map(s=>s.date),['2026-10-05','2026-10-07']);assert.notEqual(copies[0].id,shifts[0].id);assert.equal(replacePlanned(shifts,copies).length,4);assert.throws(()=>replacePlanned(shifts,[{...shifts[0],date:'2026-09-30'}],['s1']));assert.equal(shifts[0].date,'2026-09-28');
});

test('partial holiday balances preserve old full days and move reservations on their date',()=>{
 const {annualSummary,holidayDays}=modules.time;
 const base={...r,kind:'holiday',targetMinutes:480,delta:0};
 const rows=[{...base,id:'full',date:'2026-09-01'},{...base,id:'half',date:'2026-09-13',holidayMode:'half'},{...base,id:'hours',date:'2026-09-14',holidayMode:'hours',holidayMinutes:120}].map(x=>recordSchema.parse(x));
 const state=stateSchema.parse({...empty,holidayEntitlements:{2026:30},records:rows});
 assert.equal(holidayDays(rows[0]),1);let a=annualSummary(state,2026,'2026-09-12');assert.equal(a.used,1);assert.equal(a.reserved,.75);assert.equal(a.remaining,28.25);
 a=annualSummary({...state,dailyMinutes:360},2026,'2026-09-14');assert.equal(a.used,1.75);assert.equal(a.reserved,0);assert.equal(a.remaining,28.25);assert.equal(a.hours,0);
 assert.equal(modules['month-summary'].monthSummary(state,'2026-09').holidays,1.75);
});
test('hourly holidays validate daily limits and count separately across years',()=>{
 const {annualSummary,holidayDays}=modules.time;
 const half={...r,kind:'holiday',holidayMode:'half',delta:0,date:'2026-12-31'};
 const hourly={...half,id:'next',date:'2027-01-01',holidayMode:'hours',holidayMinutes:120};
 assert.equal(holidayDays(recordSchema.parse(hourly)),1/3);
 assert.equal(recordSchema.safeParse({...hourly,holidayMinutes:361}).success,false);
 assert.equal(recordSchema.safeParse({...hourly,holidayMinutes:0}).success,false);
 assert.equal(recordSchema.safeParse({...hourly,holidayMinutes:undefined}).success,false);
 const state=stateSchema.parse({...empty,records:[half,hourly],holidayEntitlements:{2026:30.5,2027:30}});
 assert.equal(annualSummary(state,2026,'2026-12-01').reserved,.5);
 assert.equal(annualSummary(state,2027,'2026-12-01').reserved,.333333);
});
test('calendar exports show partial leave amounts and recoverable audit snapshots',()=>{
 const row=recordSchema.parse({...r,kind:'holiday',holidayMode:'half',delta:0,targetMinutes:480});
 const state={...empty,records:[row],holidayEntitlements:{2026:30}};
 const html=modules['calendar-print'].annualCalendarPrintHtml(state,2026,'pt','test@example.com',[]);
 assert.match(html,/F½/);assert.match(html,/Meio dia/);assert.match(html,/4h 00m/);
 const month=modules['calendar-print'].calendarPrintHtml(state,new Date(2026,8,1),'pt','test@example.com',[]);assert.match(month,/Meio dia/);
 const logs=modules['change-history'].captureChanges(state,{...state,records:[{...row,holidayMode:'hours',holidayMinutes:120}]});
 assert.equal(recordSchema.parse(JSON.parse(logs[0].before)).holidayMode,'half');
 assert.equal(recordSchema.parse(JSON.parse(logs[0].after)).holidayMinutes,120);
});

test('employer-granted half days deduct one holiday day for December 24 and 31 without using time bank',()=>{
 const rows=['2026-12-24','2026-12-31'].map((date,i)=>recordSchema.parse({...r,id:'gift'+i,date,kind:'holiday',holidayMode:'company_half',delta:0,targetMinutes:480}));
 const state=stateSchema.parse({...empty,initial:10,records:rows,holidayEntitlements:{2026:30}});
 const before=modules.time.annualSummary(state,2026,'2026-12-23');assert.equal(before.reserved,1);assert.equal(before.remaining,29);assert.equal(before.hours,600);
 const during=modules.time.annualSummary(state,2026,'2026-12-24');assert.equal(during.used,.5);assert.equal(during.reserved,.5);assert.equal(during.hours,600);
 const after=modules.time.annualSummary(state,2026,'2026-12-31');assert.equal(after.used,1);assert.equal(after.reserved,0);assert.equal(after.hours,600);
 const html=modules['calendar-print'].annualCalendarPrintHtml(state,2026,'pt','test@example.com',[]);assert.match(html,/F½\+E/);assert.match(html,/Oferecido pela empresa/);
});
