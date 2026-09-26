import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {readOutbox,writeOutbox,remember,mergeOutbox,applyAction} from '../public/offline-core.js';
const dir=await mkdtemp(tmpdir()+'/zeit-tests-');
await build({entryPoints:['lib/shifts.ts'],bundle:true,platform:'node',format:'esm',outfile:dir+'/shifts.mjs'});
await build({entryPoints:['lib/time.ts'],bundle:true,platform:'node',format:'esm',outfile:dir+'/time.mjs'});
const {scheduleDates,shiftTimes,reminderEvents,shiftsIcs}=await import(pathToFileURL(dir+'/shifts.mjs'));
const {empty,stateSchema}=await import(pathToFileURL(dir+'/time.mjs'));
await rm(dir,{recursive:true});
const shift={id:'s1',name:'Noite',date:'2026-09-14',start:'22:00',end:'06:00'};
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)||null,setItem:(k,v)=>m.set(k,v)}};
test('weekly rotations anchor to Monday and cross year boundaries',()=>{
 assert.deepEqual(scheduleDates('2026-12-28','2027-01-15',[1],2),['2026-12-28','2027-01-11']);
 assert.throws(()=>scheduleDates('2026-01-01','2028-01-01',[1],1));
});
test('overnight reminders use start date, skip leave, suppress completed work',()=>{
 const {start,end}=shiftTimes(shift);assert.equal(end.getDate(),15);
 const s={...empty,shifts:[shift]};assert.equal(reminderEvents(s,+start).length,1);assert.equal(reminderEvents(s,+end)[0].type,'exit');assert.equal(reminderEvents(s,+end+60000).length,0);
 assert.equal(reminderEvents({...s,records:[{date:shift.date,kind:'holiday'}]},+end).length,0);
 assert.equal(reminderEvents({...s,records:[{date:shift.date,kind:'work'}]},+end).length,0);
 assert.equal(reminderEvents({...s,active:{start:+start}},+start).length,0);
});
test('calendar export has two alarms, skips absences and escapes injection',()=>{
 const text=shiftsIcs({...empty,shifts:[{...shift,name:'Night\nBEGIN:VEVENT,semi;'}]},{entry:'In',exit:'Out'},new Date('2026-09-01'));
 assert.equal(text.split('\r\nBEGIN:VEVENT\r\n').length-1,2);assert.equal(text.match(/BEGIN:VALARM/g).length,2);assert.ok(text.includes('\\nBEGIN:VEVENT\\,semi\\;'));assert.ok(text.includes('TRIGGER:PT0M'));
 const none=shiftsIcs({...empty,shifts:[shift],records:[{date:shift.date,kind:'sick_note'}]},{entry:'In',exit:'Out'},new Date('2026-09-01'));assert.ok(!none.includes('BEGIN:VEVENT'));
});
test('offline overnight shift with unpaid split breaks syncs once without losing balances',()=>{
 const storage=store();remember('alice',{...empty,includedPause:0},true,storage);
 const start=+new Date('2026-09-14T22:00:00');let q=applyAction(readOutbox(storage),'start',start,'start');
 q=applyAction(q,'pause',start+120*60000);q=applyAction(q,'resume',start+135*60000);q=applyAction(q,'pause',start+240*60000);q=applyAction(q,'resume',start+270*60000);q=applyAction(q,'finish',start+525*60000,'shift-work-1');
 assert.equal(q.records[0].pause,45);assert.equal(q.records[0].delta,0);assert.equal(q.records[0].date,'2026-09-14');writeOutbox(q,storage);assert.equal(readOutbox(storage).dirty,true);
 const remote={...empty,initial:24,companyName:'Company'};const result=stateSchema.parse(mergeOutbox(remote,q,'alice'));assert.equal(result.records.length,1);assert.equal(result.initial,24);assert.equal(result.companyName,'Company');assert.deepEqual(stateSchema.parse(mergeOutbox(result,q,'alice')),result);
});
test('offline sync refuses wrong account, overlapping date and changed remote active',()=>{
 const storage=store();remember('alice',empty,true,storage);let q=applyAction(readOutbox(storage),'start',+new Date('2026-09-14T06:00:00'));q=applyAction(q,'finish',+new Date('2026-09-14T14:00:00'),'r1');
 assert.throws(()=>mergeOutbox(empty,q,'bob'));assert.throws(()=>mergeOutbox({...empty,records:[{date:'2026-09-14',id:'remote'}]},q,'alice'));assert.throws(()=>mergeOutbox({...empty,active:{start:99}},q,'alice'));
});
test('active schema key order does not produce a false conflict; outbox cannot be overwritten',()=>{
 const active={includedPause:30,start:1,pauseStart:null,paused:0},storage=store();remember('alice',{...empty,active},true,storage);const q=readOutbox(storage);q.baseActive={paused:0,start:1,includedPause:30,pauseStart:null};q.dirty=true;writeOutbox(q,storage);assert.doesNotThrow(()=>mergeOutbox({...empty,active},q,'alice'));assert.throws(()=>remember('alice',empty,false,storage));
});
test('push payload encrypts and authenticates without exposing its body',async()=>{
 const {buildPushPayload}=await import('@block65/webcrypto-web-push');const vapid=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);const jwk=await crypto.subtle.exportKey('jwk',vapid.privateKey);const raw=await crypto.subtle.exportKey('raw',vapid.publicKey);const receiver=await crypto.subtle.generateKey({name:'ECDH',namedCurve:'P-256'},true,['deriveBits']);const receiverKey=await crypto.subtle.exportKey('raw',receiver.publicKey);const payload=await buildPushPayload({data:'private reminder',options:{ttl:120}},{endpoint:'https://fcm.googleapis.com/fcm/send/test',expirationTime:null,keys:{p256dh:Buffer.from(receiverKey).toString('base64url'),auth:Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64url')}},{subject:'https://example.com',publicKey:Buffer.from(raw).toString('base64url'),privateKey:jwk.d});assert.equal(payload.method.toUpperCase(),'POST');assert.ok(!Buffer.from(payload.body).includes(Buffer.from('private reminder')));assert.equal(new Headers(payload.headers).get('Content-Encoding'),'aes128gcm');
});
