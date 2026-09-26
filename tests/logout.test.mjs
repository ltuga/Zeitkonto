import {test} from 'node:test';
import assert from 'node:assert/strict';
import {clearDeviceSession,logoutFromDevice} from '../lib/logout.ts';
for(const [name,remote] of [['success',async()=>({error:null})],['network failure',async()=>{throw Error('offline')}],['server error',async()=>({error:Error('503')})],['stalled request',()=>new Promise(()=>{})]]){
 test('device logout after '+name,async()=>{const values=new Map([['zeitkonto-auth','session'],['zeitkonto-auth-user','user'],['zeitkonto-auth-code-verifier','verifier'],['meu-tempo-language','de']]);let reloads=0;await logoutFromDevice(remote,()=>clearDeviceSession({removeItem:key=>values.delete(key)}),()=>{assert.equal(values.has('zeitkonto-auth'),false);reloads++},10);assert.equal(reloads,1);assert.deepEqual([...values],[['meu-tempo-language','de']])});
}
test('storage failure is surfaced instead of claiming successful logout',async()=>{let reloaded=false;await assert.rejects(()=>logoutFromDevice(async()=>{},()=>{throw Error('blocked storage')},()=>{reloaded=true}));assert.equal(reloaded,false)});
