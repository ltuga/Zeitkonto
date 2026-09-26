import {z} from 'zod';
import {stateSchema,recordSchema,dateLocal,overtimeMinutes,type State} from './time';
const clock=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const geoConfigSchema=z.object({
 mode:z.enum(['off','semi','auto']),latitude:z.number().min(-85).max(85),longitude:z.number().min(-180).max(180),
 radius:z.union([z.literal(100),z.literal(150),z.literal(200),z.literal(300),z.literal(500)]),
 days:z.array(z.number().int().min(0).max(6)).max(7),
 usualStart:z.union([z.literal(''),clock]),usualEnd:z.union([z.literal(''),clock]),
 arrivalMinutes:z.number().int().min(2).max(30),exitMinutes:z.union([z.literal(10),z.literal(15),z.literal(20),z.literal(30)])
});
export type GeoConfig=z.infer<typeof geoConfigSchema>;
export const defaultGeo:GeoConfig={mode:'off',latitude:0,longitude:0,radius:200,days:[1,2,3,4,5],usualStart:'',usualEnd:'',arrivalMinutes:5,exitMinutes:15};
export const geoEventSchema=z.object({
 id:z.string().uuid(),type:z.enum(['entry','exit']),at:z.number().int().positive(),
 origin:z.enum(['geofence_automatico','geofence_semiautomatico']),activeStart:z.number().int().nonnegative(),
 active:stateSchema.shape.active.unwrap()
});
export type GeoEvent=z.infer<typeof geoEventSchema>;
/** Native outbox IDs remain on the same existing entities for crash-safe replay. */
export function applyGeoEvent(state:State,input:unknown):State {
 const e=geoEventSchema.parse(input),s=structuredClone(state),a=e.active;
 if(e.at>Date.now()+300000)throw Error('Hora de deteção inválida.');
 if(s.records.some(r=>(!!a.geoId && r.geoId===a.geoId) || r.id==='geo-'+(a.geoId??e.id)))return s;
 if(e.type==='entry'){
  if(s.active?.geoId===e.id)return s;
  if(s.active)throw Error('Já existe uma entrada aberta. Revê a deteção.');
  if(s.records.some(r=>r.date===dateLocal(new Date(e.at))))throw Error('Já existe um registo neste dia. Revê a deteção.');
  if(a.start!==e.at||a.geoId!==e.id)throw Error('Entrada inválida.');
  s.active=a;return s;
 }
 if(!s.active||s.active.start!==e.activeStart||a.start!==e.activeStart)throw Error('A entrada foi alterada. Revê a saída detetada.');
 const end=e.at,active=s.active,mins=(end-active.start)/60000;
 if(mins<=0||mins>=1440)throw Error('Revê a duração do turno detetado.');
 const pause=(active.paused+(active.pauseStart?Math.max(0,end-active.pauseStart):0))/60000;
 if(pause<0||pause>mins)throw Error('Revê as pausas do turno.');
 const date=dateLocal(new Date(active.start));
 if(s.records.some(r=>r.date===date))throw Error('Já existe um registo neste dia. Revê a saída detetada.');
 const record=recordSchema.parse({id:'geo-'+(active.geoId??e.id),geoId:active.geoId??e.id,origin:e.origin,
  startedAt:active.start,endedAt:end,date,kind:'work',targetMinutes:active.targetMinutes,includedPause:active.includedPause,
  start:new Date(active.start).toTimeString().slice(0,5),end:new Date(end).toTimeString().slice(0,5),pause,
  delta:overtimeMinutes(mins,pause,active.includedPause,active.targetMinutes),note:''});
 s.records.push(record);s.active=null;return s;
}
