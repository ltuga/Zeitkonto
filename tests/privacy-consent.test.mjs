import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {stateSchema,empty,recordSchema}=await loadTs('lib/time.ts');
const {healthConsentRequired}=await loadTs('lib/health-consent.ts');
test('legacy or absent analytics preference cannot silently enable telemetry',()=>{
 for(const value of [undefined,true,false,{enabled:true},'true'])assert.equal(stateSchema.parse({...empty,analytics:value}).analytics.enabled,false);
 assert.equal(stateSchema.parse({...empty,analytics:{enabled:true,version:'2026-09-28'}}).analytics.enabled,true);
});
test('new or modified sickness requires consent while unchanged records and deletions do not',()=>{
 const r=recordSchema.parse({id:'a',date:'2026-09-28',kind:'sick_note',start:'',end:'',pause:0,delta:0,note:''});
 assert.equal(healthConsentRequired([],[r]).length,1);assert.equal(healthConsentRequired([r],[r]).length,0);
 assert.equal(healthConsentRequired([r],[{...r,note:'changed'}]).length,1);assert.equal(healthConsentRequired([r],[]).length,0);
 assert.equal(healthConsentRequired([],[{...r,kind:'holiday'}]).length,0);
});
