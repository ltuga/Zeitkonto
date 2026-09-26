'use client';
import {displayDays} from '@/lib/holiday-label';
import {monthSummary} from '@/lib/month-summary';
import type {State} from '@/lib/time';
import {translate,formatMinutes,type Language} from '@/lib/i18n';
import '@/lib/improvements-i18n';
export function MonthOverview({data,month,lang}:{data:State;month:string;lang:Language}){const m=monthSummary(data,month),t=(s:string)=>translate(lang,s);return <section className="month-overview"><h3>{t('Resumo mensal')}</h3><div className="monthly-grid">{[['Horas planeadas',formatMinutes(lang,m.planned)],['Horas previstas nos registos',formatMinutes(lang,m.expected)],['Horas contabilizadas',formatMinutes(lang,m.credited)],['Diferença de horas',formatMinutes(lang,m.delta)],['Dias trabalhados',m.days],['Férias marcadas',displayDays(m.holidays,lang)],['Dias de doença',m.sick],['Dias de descanso',m.rest]].map(([key,v])=><div key={key}><span>{t(String(key))}</span><strong>{v}</strong></div>)}</div><p className="muted">{t('As horas contabilizadas incluem a pausa remunerada e apenas registos até hoje. As ausências incluem todas as marcações do mês.')}</p>{m.missing>0&&<p className="rule">{m.missing} {t('turnos passados sem registo. Verifica se falta adicionar as horas.')}</p>}</section>}
