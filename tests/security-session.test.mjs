import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isPublicSupabaseKey} from '../lib/public-auth-config.ts';
import {clearDeviceSession} from '../lib/logout.ts';
import {loadTs} from './load-ts.mjs';

const jwt=role=>'test.'+Buffer.from(JSON.stringify({iss:'supabase',role})).toString('base64url')+'.test';
test('only public Supabase configuration can be serialized',()=>{
 assert.equal(isPublicSupabaseKey('sb_publishable_example'),true);
 assert.equal(isPublicSupabaseKey(jwt('anon')),true);
 for(const key of ['sb_secret_example',jwt('service_role'),jwt('authenticated'),'malformed',''])
  assert.equal(isPublicSupabaseKey(key),false);
});
test('logout removes offline identity before persisted credentials',()=>{
 const removed=[];clearDeviceSession({removeItem:k=>removed.push(k)});
 assert.equal(removed[0],'zeitkonto-offline-user');assert.ok(removed.includes('zeitkonto-auth'));
});
test('offline continuity requires a matching retained session',async()=>{
 const {readOfflineIdentity}=await loadTs('lib/offline-identity.ts');
 const id='123e4567-e89b-42d3-a456-426614174000';
 const user={id,email:'test@example.invalid',email_confirmed_at:'2026-09-27'};
 const values=new Map([['zeitkonto-offline-user',JSON.stringify(user)],['zeitkonto-auth',JSON.stringify({user,access_token:'test-access',refresh_token:'test-refresh'})]]);
 const storage={getItem:k=>values.get(k)??null};
 assert.equal(readOfflineIdentity(storage)?.id,id);
 values.set('zeitkonto-offline-user',JSON.stringify({...user,id:'different'}));assert.equal(readOfflineIdentity(storage),null);
 values.set('zeitkonto-offline-user',JSON.stringify(user));values.delete('zeitkonto-auth');assert.equal(readOfflineIdentity(storage),null);
 values.set('zeitkonto-auth','broken');assert.equal(readOfflineIdentity(storage),null);
});
