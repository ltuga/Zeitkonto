import {pushDeviceSchema} from './push-schema';
import { z } from 'zod';
const includedPauseSchema=z.union([z.literal(0),z.literal(30)]).default(30);
const target=z.number().int().min(15).max(1440).default(480);
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const recordSchema=z.object({origin:z.enum(['manual','geofence_semiautomatico','geofence_automatico']).optional(),geoId:z.string().uuid().optional(),startedAt:z.number().int().positive().optional(),endedAt:z.number().int().positive().optional(),id:z.string(),date:day,kind:z.enum(['work','holiday','rest','sick_note','sick_no_note']),holidayMode:z.enum(['full','half','hours','company_half']).optional(),holidayMinutes:z.number().int().min(1).max(1440).optional(),targetMinutes:target,includedPause:includedPauseSchema,start:z.string(),end:z.string(),pause:z.number().min(0).max(1440),delta:z.number().finite(),note:z.string().max(1000)}).refine(r=>r.kind!=='holiday'||r.holidayMode!=='hours'||(r.holidayMinutes!==undefined&&r.holidayMinutes<=r.targetMinutes),{message:'As horas de férias não podem ultrapassar as horas previstas do dia.'});
const clock=z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const shiftSchema=z.object({id:z.string().max(100).regex(/^[A-Za-z0-9_-]+$/),date:day,targetMinutes:target,name:z.string().trim().min(1).max(60),start:clock,end:clock}).refine(s=>s.start!==s.end);
export const auditSchema=z.object({id:z.string(),at:z.string(),kind:z.enum(['record','shift','settings','active']),action:z.enum(['add','edit','delete']),date:z.string(),before:z.string().nullable(),after:z.string().nullable()});
export const stateSchema=z.object({dailyMinutes:target,changes:z.array(auditSchema).max(300).default([]),pushDevices:z.array(pushDeviceSchema).max(5).default([]),shifts:z.array(shiftSchema).max(1500).default([]),reminders:z.object({entry:z.boolean(),exit:z.boolean()}).default({entry:true,exit:true}),initial:z.number().finite(),companyName:z.string().trim().max(120).default(''),holidayEntitlements:z.record(z.string().regex(/^\d{4}$/),z.number().min(0).max(366)).default({}),includedPause:includedPauseSchema,plannedPause:z.number().int().min(0).max(180).default(30),restCost:z.number().min(1).max(24),records:z.array(recordSchema).max(10000),country:z.enum(['DE','PT','ES','GB','FR','AT','CH','NL','BE','TR']).default('DE'),region:z.string().max(16).default('DE-NW'),active:z.object({origin:z.enum(['manual','geofence_semiautomatico','geofence_automatico']).optional(),geoId:z.string().uuid().optional(),targetMinutes:target,includedPause:includedPauseSchema,start:z.number(),pauseStart:z.number().nullable(),paused:z.number()}).nullable()});
export type State=z.infer<typeof stateSchema>;
export type Entry=z.infer<typeof recordSchema>;
export const empty:State={dailyMinutes:480,changes:[],pushDevices:[],shifts:[],reminders:{entry:true,exit:true},initial:0,companyName:'',holidayEntitlements:{},restCost:8,includedPause:30,plannedPause:30,records:[],country:'DE',region:'DE-NW',active:null};
export function duration(start:string,end:string,pause:number,includedPause:number=30,targetMinutes=480){if(!/^\d{2}:\d{2}$/.test(start)||!/^\d{2}:\d{2}$/.test(end))throw Error('Indica horas válidas.');let a=start.split(':').map(Number),b=end.split(':').map(Number);let n=b[0]*60+b[1]-a[0]*60-a[1];if(n<0)n+=1440;if(n<=0||pause>n)throw Error('Verifica a entrada, a saída e a pausa.');return overtimeMinutes(n,pause,includedPause,targetMinutes);}
export function timeBalance(s:State,today=dateLocal()){
 const accumulated=Math.round(s.initial*60+weeklyWork(s,today).reduce((n,r)=>n+r.balanceMinutes,0));
 const used=Math.round(s.records.filter(r=>r.kind==='rest'&&r.date<=today).reduce((n,r)=>n+Math.max(0,-r.delta),0));
 const reserved=Math.round(s.records.filter(r=>r.kind==='rest'&&r.date>today).reduce((n,r)=>n+Math.max(0,-r.delta),0));
 const current=accumulated-used;return {accumulated,used,reserved,current,available:current-reserved};
}
export function balance(s:State,today=dateLocal()){return timeBalance(s,today).available;}
export function fmt(m:number){m=Math.round(m);return `${m<0?'−':''}${Math.floor(Math.abs(m)/60)}h ${String(Math.abs(m)%60).padStart(2,'0')}m`;}
export function dateLocal(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}

export function overtimeMinutes(presence:number,pause:number,includedPause:number=30,targetMinutes=480){return presence-Math.max(0,pause-includedPause)-targetMinutes;}

export type LeaveKind=Exclude<Entry['kind'],'work'>;
export function isSick(kind:Entry['kind']){return kind==='sick_note'||kind==='sick_no_note';}
export function entryKindLabel(kind:Entry['kind']){return {work:'Turno de trabalho',holiday:'Férias',rest:'Descanso compensatório',sick_note:'Doença com atestado',sick_no_note:'Doença sem atestado'}[kind];}

export function annualSummary(data:State,year:number,today=dateLocal()){
 const days=data.records.filter(r=>r.kind==='holiday'&&r.date.startsWith(year+'-')),booked=holidayTotal(days),used=holidayTotal(days.filter(r=>r.date<=today)),reserved=holidayTotal(days.filter(r=>r.date>today)),total=data.holidayEntitlements[String(year)]??null,h=timeBalance(data,today);
 return {booked,used,reserved,total,unspent:total===null?null:roundDays(total-used),remaining:total===null?null:roundDays(total-booked),hours:h.current,usedHours:h.used,reservedHours:h.reserved,availableHours:h.available,restDays:Math.max(0,Math.floor(h.available/(data.restCost*60)))};
}

export function holidayDays(r:Entry){return r.kind!=='holiday'?0:(r.holidayMode==='half'||r.holidayMode==='company_half')?0.5:r.holidayMode==='hours'?(r.holidayMinutes??r.targetMinutes)/r.targetMinutes:1;}
export function holidayDuration(r:Entry){return holidayDays(r)*r.targetMinutes;}
export function roundDays(n:number){return Math.round(n*1000000)/1000000;}
export function holidayTotal(rows:Entry[]){return roundDays(rows.reduce((n,r)=>n+holidayDays(r),0));}


// The bank uses weekly surplus, not the number of days worked or daily delta.
// Preserve original entries: credited work = saved daily target + saved daily delta.
export const WEEKLY_MINUTES=2400;
export function weekStart(date:string){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()-(d.getDay()+6)%7);return dateLocal(d);}
// Overnight Sunday work belongs to the following Monday's accounting week.
// The original entry date remains unchanged for calendar and audit history.
export function workWeek(r:Pick<Entry,'kind'|'date'|'start'|'end'>){
 const d=new Date(r.date+'T12:00:00');
 if(r.kind==='work'&&d.getDay()===0&&r.start&&r.end&&r.end<r.start)d.setDate(d.getDate()+1);
 return weekStart(dateLocal(d));
}
export function summaryWeek(data:State,date:string){
 if(data.active){
  const a=data.active,start=new Date(a.start);
  const end=new Date(a.start+(a.targetMinutes+Math.max(0,data.plannedPause-a.includedPause))*60000);
  return workWeek({kind:'work',date:dateLocal(start),start:start.toTimeString().slice(0,5),end:end.toTimeString().slice(0,5)});
 }
 const record=data.records.find(r=>r.kind==='work'&&r.date===date);
 return record?workWeek(record):weekStart(date);
}
export function justifiedMinutes(r:Entry){
 if(isSick(r.kind))return 480;
 if(r.kind==='holiday')return r.holidayMode==='half'?240:r.holidayMode==='hours'?Math.min(480,r.holidayMinutes??0):480;
 // Compensatory rest retains its explicit bank debit, without a second deduction.
 if(r.kind==='rest')return Math.min(480,Math.max(0,-r.delta));
 return 0;
}
export function weeklyWork(data:Pick<State,'records'>,asOf=dateLocal()){
 const justified=new Map<string,number>(),worked=new Map<string,number>();
 for(const r of data.records.filter(r=>r.date<=asOf)){
  const week=weekStart(r.date);justified.set(week,Math.min(WEEKLY_MINUTES,(justified.get(week)??0)+justifiedMinutes(r)));
 }
 return data.records.filter(r=>r.kind==='work'&&r.date<=asOf).slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id)).map(r=>{
  const week=workWeek(r),required=WEEKLY_MINUTES-(justified.get(week)??0),before=worked.get(week)??0;
  const creditedMinutes=Math.max(0,(r.targetMinutes??480)+r.delta),after=before+creditedMinutes;
  worked.set(week,after);
  const balanceMinutes=Math.max(0,after-required)-Math.max(0,before-required);
  return {...r,creditedMinutes,expectedMinutes:creditedMinutes-balanceMinutes,balanceMinutes};
 });
}
export function weeklySummary(data:State,date=dateLocal(),start=summaryWeek(data,date)){
 const rows=weeklyWork(data,date).filter(r=>workWeek(r)===start);
 const worked=rows.reduce((n,r)=>n+r.creditedMinutes,0),justified=Math.min(WEEKLY_MINUTES,data.records.filter(r=>r.date<=date&&weekStart(r.date)===start).reduce((n,r)=>n+justifiedMinutes(r),0));
 return {start,worked,justified,credited:worked+justified,target:WEEKLY_MINUTES,remaining:Math.max(0,WEEKLY_MINUTES-worked-justified),balance:rows.reduce((n,r)=>n+r.balanceMinutes,0)};
}
