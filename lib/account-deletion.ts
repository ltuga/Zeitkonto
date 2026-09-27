// Pseudonymous marker: no email, work records or raw user ID.
export async function deletionMarker(owner:string) {
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(owner));
 return 'deleted:'+Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function accountBlocked(db:D1Database,owner:string) {
 return !!await db.prepare('SELECT owner FROM time_accounts WHERE owner=?').bind(await deletionMarker(owner)).first();
}
export async function beginAccountDeletion(db:D1Database,owner:string) {
 await db.batch([
  db.prepare('INSERT OR IGNORE INTO time_accounts(owner,payload,version) VALUES(?,?,0)').bind(await deletionMarker(owner),'{}'),
  db.prepare('DELETE FROM time_accounts WHERE owner=?').bind(owner),
 ]);
}
export async function writeReminderMirror(db:D1Database,owner:string,payload:string) {
 const marker=await deletionMarker(owner);
 await db.prepare('INSERT INTO time_accounts(owner,payload,version) SELECT ?,?,1 WHERE NOT EXISTS (SELECT 1 FROM time_accounts WHERE owner=?) ON CONFLICT(owner) DO UPDATE SET payload=excluded.payload,version=time_accounts.version+1').bind(owner,payload,marker).run();
 if(await accountBlocked(db,owner))throw Error('ACCOUNT_DELETION_PENDING');
}
