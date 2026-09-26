import {holidayDays,holidayDuration,type Entry} from './time';
import {translate,formatMinutes,locales,type Language} from './i18n';
import './partial-leave-i18n';
export function holidayLabel(r:Entry,lang:Language){if(r.holidayMode==='company_half')return `${translate(lang,'Meio dia de férias + meio dia oferecido pela empresa')} · ${translate(lang,'Férias')}: ${formatMinutes(lang,r.targetMinutes/2)} · ${translate(lang,'Oferecido pela empresa')}: ${formatMinutes(lang,r.targetMinutes/2)}`;return `${translate(lang,'Férias')} · ${translate(lang,r.holidayMode==='half'?'Meio dia':r.holidayMode==='hours'?'Por horas':'Dia inteiro')} · ${formatMinutes(lang,holidayDuration(r))}`;}
export function displayDays(n:number,lang:Language){return n.toLocaleString(locales[lang],{maximumFractionDigits:3});}
