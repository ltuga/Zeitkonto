'use client';
import type {State} from './time';
import type {GeoConfig,GeoEvent} from './geofence';
declare global {interface Window {
 ZeitkontoLocation?:{postMessage:(data:string)=>void;onmessage:((event:{data:string})=>void)|null};
}}
export type GeoStatus={config?:GeoConfig;events:GeoEvent[];active:boolean;permissions:boolean};
export const hasGeoNative=()=>typeof window!=='undefined'&&!!window.ZeitkontoLocation;
const pending=new Map<string,{resolve:(v:unknown)=>void;reject:(e:Error)=>void;timer:ReturnType<typeof setTimeout>}>();
export function geoCommand<T=GeoStatus>(owner:string,command:string,args:Record<string,unknown>={}):Promise<T>{
 const bridge=window.ZeitkontoLocation;if(!bridge)return Promise.reject(Error('Esta função requer a versão Android com localização.'));
 bridge.onmessage=e=>{try{const msg=JSON.parse(e.data),item=pending.get(msg.requestId);if(!item)return;
  clearTimeout(item.timer);pending.delete(msg.requestId);if(msg.error)item.reject(Error(msg.error));else item.resolve(msg.result);
 }catch{/* Reject malformed bridge messages by letting the request expire. */}};
 return new Promise((resolve,reject)=>{const requestId=crypto.randomUUID();
  const timer=setTimeout(()=>{pending.delete(requestId);reject(Error('Não foi possível contactar a deteção Android.'));},15000);
  pending.set(requestId,{resolve:v=>resolve(v as T),reject,timer});bridge.postMessage(JSON.stringify({requestId,owner,command,...args}));
 });
}
export function geoSync(owner:string,state:State,lang:string){
 return geoCommand(owner,'sync',{active:state.active,dailyMinutes:state.dailyMinutes,includedPause:state.includedPause,lang,
  windows:state.shifts.map(s=>+new Date(s.date+'T'+s.start+':00')).filter(n=>Math.abs(n-Date.now())<7*86400000)});
}
