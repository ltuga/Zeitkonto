/** Clock time, unlike durations, is restricted to 00:00–23:59. */
export function parseClockInput(text:string):string|null {
 const value=text.trim();
 let hours:string,minutes:string;
 const colon=value.match(/^(\d{1,2}):([0-5]\d)$/);
 if(colon){hours=colon[1];minutes=colon[2];}
 else if(/^\d{1,2}$/.test(value)){hours=value;minutes='00';}
 else if(/^\d{3,4}$/.test(value)){hours=value.slice(0,-2);minutes=value.slice(-2);}
 else return null;
 if(Number(hours)>23 || Number(minutes)>59)return null;
 return hours.padStart(2,'0')+':'+minutes;
}
