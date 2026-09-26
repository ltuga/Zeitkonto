import {dateLocal,type State} from './time';
export type Shift=State['shifts'][number];
export function shiftTimes(s:Shift){const start=new Date(s.date+'T'+s.start+':00'),end=new Date(s.date+'T'+s.end+':00');if(s.end<=s.start)end.setDate(end.getDate()+1);return {start,end};}
export function scheduleDates(from:string,to:string,weekdays:number[],every:number){
 const first=new Date(from+'T12:00:00'),last=new Date(to+'T12:00:00');if(!Number.isFinite(+first)||!Number.isFinite(+last)||last<first||(+last-+first)/86400000>366||!weekdays.length||![1,2,3,4].includes(every))throw Error('Verifica as datas e os dias da semana.');
 const anchor=Date.UTC(first.getFullYear(),first.getMonth(),first.getDate())-((first.getDay()+6)%7)*86400000,result:string[]=[];
 for(const d=new Date(first);d<=last;d.setDate(d.getDate()+1)){const week=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-anchor)/604800000);if(week%every===0&&weekdays.includes(d.getDay()))result.push(dateLocal(d));}return result;
}
export function reminderEvents(data:State,now:number,activeDate=data.active?dateLocal(new Date(data.active.start)):null,windowMs=60000){return data.shifts.flatMap(s=>{
 if(data.records.some(r=>r.date===s.date&&r.kind!=='work'))return [];
 const {start,end}=shiftTimes(s),done=data.records.some(r=>r.date===s.date&&r.kind==='work');
 return [{type:'entry' as const,at:+start,enabled:data.reminders.entry&&!done&&!(data.active&&activeDate===s.date)},{type:'exit' as const,at:+end,enabled:data.reminders.exit&&!done}].filter(e=>e.enabled&&e.at<=now&&now-e.at<windowMs).map(e=>({...e,shift:s,key:s.id+':'+e.type+':'+e.at}));
 });}
const escapeIcs=(s:string)=>s.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const stamp=(d:Date)=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
export function shiftsIcs(data:State,labels:{entry:string;exit:string},now=new Date()){
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Zeitkonto//Shift reminders//EN','CALSCALE:GREGORIAN'];
 for(const s of data.shifts){if(data.records.some(r=>r.date===s.date&&r.kind!=='work'))continue;const times=shiftTimes(s);for(const type of ['entry','exit'] as const){const at=type==='entry'?times.start:times.end;if(!data.reminders[type]||at<now)continue;const title=labels[type]+' · '+s.name;lines.push('BEGIN:VEVENT','UID:'+s.id+'-'+type+'@zeitkonto','DTSTAMP:'+stamp(now),'DTSTART:'+stamp(at),'DTEND:'+stamp(new Date(+at+60000)),'SUMMARY:'+escapeIcs(title),'DESCRIPTION:'+escapeIcs('Zeitkonto: https://meu-tempo-luis.ltugamatos.chatgpt.site/'),'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M','DESCRIPTION:'+escapeIcs(title),'END:VALARM','END:VEVENT');}}
 lines.push('END:VCALENDAR');return lines.map(l=>{let out='',line='',n=0;for(const c of l){const size=new TextEncoder().encode(c).length;if(n+size>73){out+=line+'\r\n ';line='';n=1;}line+=c;n+=size;}return out+line}).join('\r\n')+'\r\n';
}
