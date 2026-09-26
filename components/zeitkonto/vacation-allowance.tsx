'use client';
import {BalanceOverview} from './balance-overview';
import {useEffect,useState} from 'react';
import type {State} from '@/lib/time';
import {annualSummary} from '@/lib/time';
import {translate,type Language} from '@/lib/i18n';
export function VacationAllowance({data,lang,busy,save}:{data:State;lang:Language;busy:boolean;save:(s:State)=>Promise<boolean|undefined>}){
 const [year,setYear]=useState(String(new Date().getFullYear())),[amount,setAmount]=useState('');
 const stored=data.holidayEntitlements[year],t=(s:string)=>translate(lang,s),summary=annualSummary(data,Number(year));
 useEffect(()=>setAmount(stored===undefined?'':String(stored)),[stored,year]);
 return <section className="install-card"><h3>{t('Direito a férias por ano')}</h3><p className="muted">{t('Indica o total disponível nesse ano, incluindo dias transitados, se aplicável.')}</p><form onSubmit={async e=>{e.preventDefault();await save({...data,holidayEntitlements:{...data.holidayEntitlements,[year]:Number(amount)}})}}><label>{t('Ano')}<input type="number" min="2020" max="2035" required value={year} onChange={e=>setYear(e.target.value)} disabled={busy}/></label><label>{t('Total de dias de férias')}<input type="number" min="0" max="366" step="0.5" required value={amount} onChange={e=>setAmount(e.target.value)} disabled={busy}/></label><BalanceOverview data={data} year={Number(year)} lang={lang}/><button className="primary" disabled={busy}>{t('Guardar definições')}</button></form></section>
}
