import {dateLocal,entryKindLabel,overtimeMinutes,weeklySummary,weeklyWork,summaryWeek,type State} from './time';
import {shiftTimes} from './shifts';

export function dashboardState(data:State,now:number){
 const today=dateLocal(new Date(now));
 const active=data.active;
 const date=active?dateLocal(new Date(active.start)):today;
 const record=data.records.find(r=>r.date===date);
 const shift=data.shifts.find(s=>s.date===date);
 const pause=active?Math.max(0,(active.paused+(active.pauseStart?now-active.pauseStart:0))/60000):record?.pause??0;
 const presence=active?Math.max(0,(now-active.start)/60000):0;
 const worked=active?Math.max(0,presence-pause):record?.kind==='work'?record.targetMinutes+record.delta-Math.min(record.pause,record.includedPause):0;
 const target=active?.targetMinutes??record?.targetMinutes??shift?.targetMinutes??data.dailyMinutes;
 const week=weeklySummary({...data,records:data.records.filter(r=>r.id!==record?.id)},today,summaryWeek(data,date));
 const daily=weeklyWork(data,today).find(r=>r.id===record?.id);
 const delta=active?Math.max(0,overtimeMinutes(presence,pause,active.includedPause,0)-week.remaining):record?.kind==='work'?daily!.balanceMinutes:null;
 const next=data.shifts.filter(s=>+shiftTimes(s).start>=now&&!data.records.some(r=>r.date===s.date)).sort((a,b)=>+shiftTimes(a).start-+shiftTimes(b).start)[0]??null;
 return {today,date,record,shift,next,pause,worked,target,delta,
  title:record&&record.kind!=='work'?entryKindLabel(record.kind):shift?.name??'Turno de trabalho',
  start:active?new Date(active.start).toTimeString().slice(0,5):record?.kind==='work'?record.start:shift?.start,
  end:active?shift?.end:record?.kind==='work'?record.end:shift?.end,
  progress:Math.max(0,Math.min(1,delta===null?0:worked/target))};
}
