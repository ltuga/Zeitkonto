/** Bare numbers are hours; a colon separates hours and minutes. Never infer decimal hours. */
export function parseDurationInput(text:string,{min=0,max,signed=false}:{min?:number;max?:number;signed?:boolean}={}) {
 const match=text.trim().match(/^(-?)(\d+)(?::([0-5]\d))?$/);
 if(!match || (match[1] && !signed))return null;
 const minutes=(Number(match[2])*60+Number(match[3]??0))*(match[1]?-1:1);
 if(!Number.isSafeInteger(minutes) || (!signed && minutes<min) || (max!==undefined && minutes>max))return null;
 return minutes;
}
export function displayDurationInput(minutes:number) {
 return `${minutes<0?'-':''}${String(Math.floor(Math.abs(Math.round(minutes))/60)).padStart(2,'0')}:${String(Math.abs(Math.round(minutes))%60).padStart(2,'0')}`;
}
