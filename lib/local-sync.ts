'use client';
import {authenticatedFetch} from './auth-client';
import {dateLocal,stateSchema,type State,type Entry} from './time';
import {diffState,restoreState,type SyncRow,type Snapshot} from './sync-model';
import {captureChanges} from './change-history';
import {readOutbox,KEY} from './offline-work';
// IndexedDB is account-scoped. Never store passwords or privileged API keys here.
export type LocalState={owner:string;state:State;pending:SyncRow[];lastSync:string|null;clock:number;offsetMs?:number;syncError?:boolean};
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('zeitkonto-sync-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('accounts',{keyPath:'owner'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});}
async function access<T>(mode:IDBTransactionMode,fn:(s:IDBObjectStore)=>IDBRequest):Promise<T>{const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('accounts',mode),req=fn(tx.objectStore('accounts'));tx.oncomplete=()=>{db.close();resolve(req.result)};tx.onerror=()=>{db.close();reject(tx.error)};tx.onabort=()=>{db.close();reject(tx.error)}});}
export const readLocal=(owner:string)=>access<LocalState|undefined>('readonly',s=>s.get(owner));
const writeLocal=(s:LocalState)=>access('readwrite',o=>o.put(s));
export const deleteLocal=(owner:string)=>access('readwrite',s=>s.delete(owner));
export async function hasPending(owner:string){return !!(await readLocal(owner))?.pending.length;}
export async function anyPending(){return (await access<LocalState[]>('readonly',s=>s.getAll())).some(s=>s.pending.length>0);}
export async function withSyncLock<T>(f:()=>Promise<T>):Promise<T>{if(!navigator.locks)throw Error('Este navegador não suporta o modo sem internet.');return navigator.locks.request('zeitkonto-full-sync',f);}
export async function saveLocal(owner:string,before:State,next:State,reset=false){return withSyncLock(async()=>{const old=await readLocal(owner);if(!old)throw Error('Abre a app com Internet antes da primeira utilização.');const stamp=Math.max(Date.now()+(old.offsetMs??0),old.clock+1);const state=stateSchema.parse({...next,changes:reset?[]:captureChanges(before,next)});const changes=diffState(before,state,new Date(stamp).toISOString(),crypto.randomUUID());const merged=restoreState([...diffState(structuredClone((await import('./time')).empty),old.state,new Date(0).toISOString(),'local-base'),...changes]);const row={...old,state:merged,pending:[...new Map([...old.pending,...changes].map(c=>[c.entity+'\0'+c.id,c])).values()],clock:stamp};await writeLocal(row);window.dispatchEvent(new Event('zeitkonto-pending'));return row.state;});}
export async function loadAndSync(owner:string):Promise<LocalState>{return withSyncLock(async()=>{let local=await readLocal(owner);if(!navigator.onLine){if(local)return local;throw Error('Abre a app com Internet antes da primeira utilização.');}
 try{const get=await authenticatedFetch('/api/sync?today='+dateLocal());if(!get.ok)throw Error('Não foi possível sincronizar.');let snapshot=await get.json() as Snapshot;
 // One-time import of the previous offline work queue, before retiring its public screen.
 const q=readOutbox();if(q?.owner===owner&&q.dirty){const changes:SyncRow[]=[...q.records.map((r:Entry)=>({entity:'entry',id:r.id,value:r,updated_at:new Date(q.updated).toISOString(),mutation_id:'old-offline-'+r.id})),{entity:'setting',id:'active',value:q.active,updated_at:new Date(q.updated).toISOString(),mutation_id:'old-offline-active'}];local=local??{owner,state:restoreState(snapshot.rows),pending:[],lastSync:null,clock:Date.now()};local.pending.push(...changes);await writeLocal(local);localStorage.removeItem(KEY);}
 if(local?.pending.length){const r=await authenticatedFetch('/api/sync',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({today:dateLocal(),changes:local.pending})});if(!r.ok)throw Error('Não foi possível sincronizar.');snapshot=await r.json();}
 const result={owner,state:restoreState(snapshot.rows),pending:[],lastSync:snapshot.server_time,clock:Math.max(+new Date(snapshot.server_time),local?.clock??0),offsetMs:+new Date(snapshot.server_time)-Date.now()};await writeLocal(result);window.dispatchEvent(new Event('zeitkonto-pending'));return result;
 }catch(e){if(local)return {...local,syncError:true};throw e;}
 });}
const events=new Map<string,number>();
let telemetryAllowed=false;
export function allowTelemetry(enabled:boolean){telemetryAllowed=enabled;if(!enabled)events.clear();}

export function analytics(event:'app_open'|'work_entry'|'vacation'|'settings'|'calendar'|'shifts'|'export'|'sync'){if(!telemetryAllowed||!navigator.onLine||document.visibilityState==='hidden')return;const now=Date.now();if(now-(events.get(event)??0)<300000)return;events.set(event,now);let device=localStorage.getItem('zeitkonto-device-id');if(!device){device=crypto.randomUUID();localStorage.setItem('zeitkonto-device-id',device)}void authenticatedFetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device,version:'0.2.1',platform:/Android/i.test(navigator.userAgent)?'android':/iPhone|iPad/i.test(navigator.userAgent)?'ios':'web',event})}).catch(()=>{});}
