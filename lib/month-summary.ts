import {dateLocal,holidayTotal,weeklyWork,type State} from './time';
export function monthSummary(data:State,month:string,today=dateLocal()){
 const rows=data.records.filter(r=>r.date.startsWith(month)),work=weeklyWork(data,today).filter(r=>r.date.startsWith(month)&&r.date<=today),planned=data.shifts.filter(s=>s.date.startsWith(month)&&!rows.some(r=>r.date===s.date&&r.kind!=='work'));
 const expected=work.reduce((n,r)=>n+r.expectedMinutes,0),delta=work.reduce((n,r)=>n+r.balanceMinutes,0);
 return {days:work.length,expected,credited:expected+delta,delta,planned:planned.reduce((n,s)=>n+s.targetMinutes,0),holidays:holidayTotal(rows),sick:rows.filter(r=>r.kind==='sick_note'||r.kind==='sick_no_note').length,rest:rows.filter(r=>r.kind==='rest').length,missing:planned.filter(s=>s.date<today&&!rows.some(r=>r.date===s.date)&&!(data.active&&dateLocal(new Date(data.active.start))===s.date)).length};
}
