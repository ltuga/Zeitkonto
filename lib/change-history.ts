import type {State} from './time';
export function captureChanges(previous:State,next:State,at=new Date().toISOString()):State['changes']{
 const added:State['changes']=[];
 const add=(kind:State['changes'][number]['kind'],before:unknown,after:unknown,date='')=>{if(JSON.stringify(before)===JSON.stringify(after))return;added.push({id:crypto.randomUUID(),at,kind,action:before===null?'add':after===null?'delete':'edit',date,before:before===null?null:JSON.stringify(before),after:after===null?null:JSON.stringify(after)});};
 for(const [key,kind] of [['records','record'],['shifts','shift']] as const){const old=new Map(previous[key].map(r=>[r.id,r])),fresh=new Map(next[key].map(r=>[r.id,r]));for(const id of new Set([...old.keys(),...fresh.keys()])){const a=old.get(id)??null,b=fresh.get(id)??null;add(kind,a,b,b?.date??a?.date??'');}}
 const settings=(s:State)=>({dailyMinutes:s.dailyMinutes,initial:s.initial,restCost:s.restCost,includedPause:s.includedPause,plannedPause:s.plannedPause,companyName:s.companyName,holidayEntitlements:s.holidayEntitlements});
 add('settings',settings(previous),settings(next));
 add('active',previous.active,next.active);
 return [...added.reverse(),...previous.changes].slice(0,300);
}
