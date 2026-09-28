import {beginAccountDeletion} from './account-deletion';
export const MARKER_RETENTION_MS=30*86400000;
// Uses keyset pagination; outages fail closed before dispatching reminders.
export async function reconcileMirrors(db:D1Database,missing:(ids:string[])=>Promise<string[]>,now=Date.now()){
 let cursor='supabase:',removed=0;
 while(true){
  const rows=await db.prepare("SELECT owner FROM time_accounts WHERE owner>? AND owner LIKE 'supabase:%' ORDER BY owner LIMIT 100").bind(cursor).all<{owner:string}>();
  if(!rows.results.length)break;
  const ids=rows.results.map(r=>r.owner.slice(9));
  const absent=await missing(ids);
  if(absent.some(id=>!ids.includes(id)))throw Error('Invalid reconciliation response');
  for(const id of new Set(absent)){await beginAccountDeletion(db,'supabase:'+id,now);removed++;}
  cursor=rows.results[rows.results.length-1].owner;
 }
 // Existing pre-retention markers start their retention window on first maintenance.
 await db.prepare("UPDATE time_accounts SET version=? WHERE owner LIKE 'deleted:%' AND version=0").bind(now).run();
 await db.prepare("DELETE FROM time_accounts WHERE owner LIKE 'deleted:%' AND version>0 AND version<?").bind(now-MARKER_RETENTION_MS).run();
 return removed;
}
