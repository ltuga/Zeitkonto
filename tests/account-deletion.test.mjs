import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {reconcileMirrors,MARKER_RETENTION_MS}=await loadTs('lib/account-reconciliation.ts');
import {DatabaseSync} from 'node:sqlite';
import {beginAccountDeletion,writeReminderMirror,accountBlocked,deletionMarker} from '../lib/account-deletion.ts';
import {readOwnedOutbox,KEY} from '../public/offline-core.js';
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE time_accounts(owner TEXT PRIMARY KEY,payload TEXT NOT NULL,version INTEGER NOT NULL)');
 const db={prepare(query){return {bind(...args){const stmt=sql.prepare(query);return {first:async()=>stmt.get(...args)??null,run:async()=>stmt.run(...args),all:async()=>({results:stmt.all(...args)})}}}},async batch(items){sql.exec('BEGIN');try{const out=[];for(const x of items)out.push(await x.run());sql.exec('COMMIT');return out}catch(e){sql.exec('ROLLBACK');throw e}}};return {db,sql};
}
test('account deletion removes only own D1 mirror, retaining only a pseudonymous empty marker',async()=>{
 const {db,sql}=database();await writeReminderMirror(db,'supabase:A','{"private":"A"}');await writeReminderMirror(db,'supabase:B','{"private":"B"}');await beginAccountDeletion(db,'supabase:A');
 assert.equal(sql.prepare('SELECT * FROM time_accounts WHERE owner=?').get('supabase:A'),undefined);
 assert.equal(sql.prepare('SELECT payload FROM time_accounts WHERE owner=?').get('supabase:B').payload,'{"private":"B"}');
 const marker=await deletionMarker('supabase:A');assert.match(marker,/^deleted:[0-9a-f]{64}$/);assert.equal(sql.prepare('SELECT payload FROM time_accounts WHERE owner=?').get(marker).payload,'{}');sql.close();
});
test('retries are idempotent and late writes cannot recreate deleted account mirrors',async()=>{
 const {db,sql}=database();await beginAccountDeletion(db,'supabase:A');await beginAccountDeletion(db,'supabase:A');assert.equal(await accountBlocked(db,'supabase:A'),true);
 await assert.rejects(writeReminderMirror(db,'supabase:A','{"private":"late"}'),/ACCOUNT_DELETION_PENDING/);assert.equal(sql.prepare('SELECT COUNT(*) AS n FROM time_accounts').get().n,1);sql.close();
});
test('D1 deletion failure is propagated to stop the account deletion sequence',async()=>{
 const {db,sql}=database();db.batch=async()=>{throw Error('D1 unavailable')};await assert.rejects(beginAccountDeletion(db,'supabase:A'),/D1 unavailable/);sql.close();
});
test('offline pending queue is retained but invisible after logout or account switch',()=>{
 const queue={format:1,owner:'A',records:[],dirty:true};const items=new Map([[KEY,JSON.stringify(queue)],['zeitkonto-auth',JSON.stringify({user:{id:'A'}})],['zeitkonto-offline-user',JSON.stringify({id:'A'})]]);const storage={getItem:k=>items.get(k)??null};
 assert.equal(readOwnedOutbox(storage)?.dirty,true);items.delete('zeitkonto-auth');assert.equal(readOwnedOutbox(storage),null);assert.ok(items.has(KEY));items.set('zeitkonto-auth',JSON.stringify({user:{id:'B'}}));assert.equal(readOwnedOutbox(storage),null);
});

test('reconciliation removes only missing accounts across multiple pages',async()=>{
 const {db,sql}=database();const now=2000000000000;
 for(let i=0;i<205;i++)await writeReminderMirror(db,'supabase:'+String(i).padStart(3,'0'),'{}');
 const count=await reconcileMirrors(db,async ids=>ids.filter(id=>Number(id)%2===0),now);
 assert.equal(count,103);assert.equal(sql.prepare("SELECT COUNT(*) n FROM time_accounts WHERE owner LIKE 'supabase:%'").get().n,102);
 assert.equal(await accountBlocked(db,'supabase:000'),true);assert.equal(await accountBlocked(db,'supabase:001'),false);sql.close();
});
test('reconciliation outage and forged response fail closed without deleting active data',async()=>{
 const {db,sql}=database();await writeReminderMirror(db,'supabase:A','{}');
 await assert.rejects(reconcileMirrors(db,async()=>{throw Error('offline')}),/offline/);
 await assert.rejects(reconcileMirrors(db,async()=>['B']),/Invalid reconciliation/);
 assert.ok(sql.prepare('SELECT * FROM time_accounts WHERE owner=?').get('supabase:A'));sql.close();
});
test('deletion markers expire after 30 days while legacy markers receive a grace window',async()=>{
 const {db,sql}=database(),now=2000000000000;
 await beginAccountDeletion(db,'supabase:old',now-MARKER_RETENTION_MS-1);await beginAccountDeletion(db,'supabase:recent',now-100);
 sql.prepare('INSERT INTO time_accounts VALUES(?,?,?)').run(await deletionMarker('supabase:legacy'),'{}',0);
 await reconcileMirrors(db,async()=>[],now);
 assert.equal(await accountBlocked(db,'supabase:old'),false);assert.equal(await accountBlocked(db,'supabase:recent'),true);assert.equal(await accountBlocked(db,'supabase:legacy'),true);sql.close();
});
