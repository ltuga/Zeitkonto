import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {applyGeoEvent,geoConfigSchema,defaultGeo}=await loadTs('lib/geofence.ts');
const {empty,workWeek,stateSchema}=await loadTs('lib/time.ts');
const start=+new Date('2026-09-13T22:00:00'),end=+new Date('2026-09-14T06:00:00');
const id='10000000-0000-4000-8000-000000000001',exitId='10000000-0000-4000-8000-000000000002';
const active={start,targetMinutes:480,includedPause:30,paused:0,pauseStart:null,geoId:id,origin:'geofence_automatico'};
const entry={id,type:'entry',at:start,origin:'geofence_automatico',activeStart:0,active};
const exit={id:exitId,type:'exit',at:end,origin:'geofence_automatico',activeStart:start,active};
test('arrival without a planned shift and Sunday overnight use existing weekly logic',()=>{
 let s=applyGeoEvent(empty,entry);assert.equal(s.active.start,start);assert.equal(s.shifts.length,0);
 s=applyGeoEvent(s,exit);assert.equal(s.active,null);assert.equal(s.records.length,1);
 assert.equal(s.records[0].date,'2026-09-13');assert.equal(s.records[0].start,'22:00');
 assert.equal(s.records[0].end,'06:00');assert.equal(s.records[0].delta,0);
 assert.equal(workWeek(s.records[0]),'2026-09-14');assert.equal(stateSchema.parse(s).records[0].origin,'geofence_automatico');
});
test('replayed entry/exit events do not duplicate an open or completed record',()=>{
 let s=applyGeoEvent(empty,entry);assert.deepEqual(applyGeoEvent(s,entry),s);
 s=applyGeoEvent(s,exit);assert.deepEqual(applyGeoEvent(s,entry),s);assert.deepEqual(applyGeoEvent(s,exit),s);
});
test('existing manually opened shift supports automatic exit and durable replay',()=>{
 const manual={...active};delete manual.geoId;delete manual.origin;
 const e={...exit,active:manual};const s=applyGeoEvent({...empty,active:manual},e);
 assert.equal(s.records.length,1);assert.deepEqual(applyGeoEvent(s,e),s);
});
test('no automatic exit without an open shift, or after a conflicting edit',()=>{
 assert.throws(()=>applyGeoEvent(empty,exit));assert.throws(()=>applyGeoEvent({...empty,active:{...active,start:start+60000}},exit));
 assert.throws(()=>applyGeoEvent({...empty,active:{...active,geoId:exitId}},entry));
});
test('manual pauses are deducted, exact timestamps retained',()=>{
 const a={...active,paused:45*60000};
 const s=applyGeoEvent({...empty,active:a},{...exit,active:a});
 assert.equal(s.records[0].pause,45);assert.equal(s.records[0].delta,-15);assert.equal(s.records[0].startedAt,start);
});
test('different year, invalid long shift, malformed configuration',()=>{
 const a={...active,start:+new Date('2025-12-31T22:00:00')};
 const s=applyGeoEvent({...empty,active:a},{...exit,at:+new Date('2026-01-01T06:00:00'),activeStart:a.start,active:a});
 assert.equal(s.records[0].date,'2025-12-31');
 assert.throws(()=>applyGeoEvent({...empty,active}, {...exit,at:start+86400000}));
 for(const config of [{...defaultGeo,radius:1},{...defaultGeo,latitude:100},{...defaultGeo,exitMinutes:0}])assert.equal(geoConfigSchema.safeParse(config).success,false);
 assert.equal(geoConfigSchema.safeParse({...defaultGeo,days:[],usualStart:'',usualEnd:''}).success,true);
});
