import {writeReminderMirror} from './account-deletion';
import {authConfig} from './auth-server';
import type {Snapshot,SyncRow} from './sync-model';
import {restoreState,flatten} from './sync-model';
import {stateSchema,dateLocal,type State} from './time';
import {env} from 'cloudflare:workers';
export async function rpc(req:Request,name:string,args:unknown):Promise<any>{const config=authConfig();const response=await fetch(config.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:config.key,Authorization:req.headers.get('authorization')??'','Content-Type':'application/json'},body:JSON.stringify(args),signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Supabase sync unavailable: '+response.status);return response.json();}
export async function getSupabaseState(req:Request,owner:string,today=dateLocal()):Promise<Snapshot>{let snapshot=await rpc(req,'zeitkonto_sync',{p_today:today}) as Snapshot;if(!snapshot.rows.some(r=>r.entity==='setting'&&r.id==='migration_complete'&&!r.deleted_at)){const old=await env.DB!.prepare('SELECT payload FROM time_accounts WHERE owner=?').bind(owner).first<{payload:string}>();const changes:SyncRow[]=old?[...flatten(stateSchema.parse(JSON.parse(old.payload))).values()].map(r=>({...r,updated_at:'2000-01-01T00:00:00.000Z',mutation_id:'legacy-import-v1'})):[];changes.push({entity:'setting',id:'migration_complete',value:true,updated_at:'2000-01-01T00:00:00.000Z',mutation_id:'legacy-import-v1'});snapshot=await rpc(req,'zeitkonto_sync',{p_changes:changes,p_today:today});}return snapshot;}
// Compatibility copy for existing reminder dispatcher. Supabase is the source of truth.
export async function mirrorForReminders(owner:string,snapshot:Snapshot){const state=restoreState(snapshot.rows);await writeReminderMirror(env.DB!,owner,JSON.stringify(state));}
