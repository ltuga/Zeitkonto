'use client';
import {Clock3,Timer,CalendarDays,Palmtree,ChevronRight,Moon,Sun,Home,Plus,ChartNoAxesColumn,UserRound} from 'lucide-react';
import type {CSSProperties} from 'react';
import {annualSummary,timeBalance,weeklySummary,type State} from '@/lib/time';
import {dashboardState} from '@/lib/dashboard';
import {displayDays} from '@/lib/holiday-label';
import {translate,formatMinutes,locales,type Language} from '@/lib/i18n';
import '@/lib/dashboard-i18n';

export function HomeDashboard({data,now,lang,ready,lastSync,onNavigate,onClock,onLeave}:{data:State;now:number;lang:Language;ready:boolean;lastSync:number|null;onNavigate:(tab:string)=>void;onClock:()=>void;onLeave:()=>void}){
 const t=(s:string)=>translate(lang,s),fmt=(n:number)=>formatMinutes(lang,n);
 const d=dashboardState(data,now),bank=timeBalance(data,d.today),vacation=annualSummary(data,new Date(now).getFullYear(),d.today);
 const week=weeklySummary(data,d.today);
 const signed=(n:number)=>(n>0?'+':'')+fmt(n);
 const night=d.start&&(d.start>='20:00'||d.start<'06:00'||(d.end&&d.end<d.start));
 const actions=[{label:'Registar tempo',detail:'Entrada, pausa e saída',Icon:Timer,tone:'blue',action:onClock},{label:'Calendário',detail:'O meu calendário',Icon:CalendarDays,tone:'pink',action:()=>onNavigate('calendar')},{label:'Ausências',detail:'Férias, doença, descanso',Icon:Palmtree,tone:'green',action:onLeave},{label:'Banco de horas',detail:'Saldo e visão geral',Icon:Clock3,tone:'violet',action:()=>onNavigate('balances')}];
 return <div className="dashboard-home">
  <section className="dashboard-today" aria-label={t('Hoje')}>
   <div className="dashboard-shift"><h2>{t('Hoje')}</h2><p className="dashboard-shift-name">{night?<Moon/>:<Sun/>}{t(d.title)}</p><strong className="dashboard-shift-time">{!ready?'—':d.record&&d.record.kind!=='work'?t(d.title):d.start?`${d.start} – ${d.end??'…'}`:t('Registar entrada')}</strong><p>{fmt(d.target)+' '+t('previstas')}{data.active?' · '+t(data.active.pauseStart?'Em pausa':'A trabalhar'):''}</p>{d.date!==d.today&&<small>{t('Data de entrada')}: {new Date(d.date+'T12:00:00').toLocaleDateString(locales[lang])}</small>}</div>
   <div className="dashboard-progress"><div className="dashboard-ring" style={{'--progress':`${d.progress*360}deg`} as CSSProperties}><div><strong>{ready&&d.delta!==null?signed(d.delta):'—'}</strong><span>{t(data.active?'Horas extra provisórias':'Horas extra deste registo')}</span></div></div><small>{lastSync?t('Atualizado')+' '+new Date(lastSync).toLocaleTimeString(locales[lang],{hour:'2-digit',minute:'2-digit'}):t('A aguardar sincronização')}</small></div>
  </section>
  <nav className="dashboard-actions" aria-label={t('Acessos rápidos')}>{actions.map(({label,detail,Icon,tone,action})=><button key={label} type="button" onClick={action} disabled={!ready} className="dashboard-action"><span className={'dashboard-icon '+tone}><Icon/></span><span><b>{t(label)}</b><small>{t(detail)}</small></span><ChevronRight className="dashboard-chevron"/></button>)}</nav>
  <section aria-labelledby="dashboard-overview-title"><div className="dashboard-section-title"><h2 id="dashboard-overview-title">{t('A minha visão geral')}</h2><button onClick={()=>onNavigate('balances')}>{t('Ver tudo')}<ChevronRight size={18}/></button></div><div className="dashboard-overview">
   <button className="dashboard-metric metric-blue" onClick={()=>onNavigate('balances')} disabled={!ready}><span><Clock3/>{t('Banco de horas')}</span><strong>{ready?signed(bank.current):'—'}</strong><small>{t('Saldo atual')}</small><small>{t('Horas reservadas')}: {fmt(bank.reserved)}</small></button>
   <button className="dashboard-metric metric-green" onClick={()=>onNavigate('calendar')} disabled={!ready}><span><Palmtree/>{t('Férias')}</span><strong>{ready&&vacation.remaining!==null?displayDays(vacation.remaining,lang)+' '+t('dias'):'—'}</strong><small>{t(vacation.remaining===null?'Configurar direito anual':'Férias livres para marcar')}</small><small>{t('Marcadas para o futuro')}: {displayDays(vacation.reserved,lang)}</small></button>
   <button className="dashboard-metric metric-amber" onClick={()=>onNavigate('history')} disabled={!ready}><span><CalendarDays/>{t('Esta semana')}</span><strong>{ready?signed(week.balance):'—'}</strong><small>{t('Horas extra da semana')}</small><small>{fmt(week.worked)} {t('Horas registadas')}</small></button>
  </div></section>
  <section><div className="dashboard-section-title"><h2>{t('Esta semana')}</h2><button onClick={()=>onNavigate('history')}>{t('Ver tudo')}<ChevronRight size={18}/></button></div><button className="dashboard-next" onClick={()=>onNavigate('history')} disabled={!ready}><span className="dashboard-next-icon"><CalendarDays/></span><span><b>{fmt(week.credited)} / 40h</b><small>{t('Trabalho contabilizado')}: {fmt(week.worked)}</small><small>{t('Tempo justificado')}: {fmt(week.justified)}</small><small>{t('Horas extra da semana')}: {signed(week.balance)}</small><small>{t('Semana de')} {new Date(week.start+'T12:00:00').toLocaleDateString(locales[lang])}</small></span><ChevronRight/></button></section>
 </div>;
}

export function BottomNavigation({tab,lang,onNavigate,onAdd,disabled}:{tab:string;lang:Language;onNavigate:(tab:string)=>void;onAdd:()=>void;disabled:boolean}){
 const t=(s:string)=>translate(lang,s);
 return <nav className="dashboard-bottom" aria-label={t('Menu principal')}>
  {[{id:'today',label:'Hoje',Icon:Home},{id:'calendar',label:'Calendário',Icon:CalendarDays},{id:'add',label:'Registar',Icon:Plus},{id:'history',label:'Semana',Icon:ChartNoAxesColumn},{id:'settings',label:'Perfil',Icon:UserRound}].map(({id,label,Icon})=><button type="button" key={id} className={id==='add'?'dashboard-add':''} aria-current={tab===id?'page':undefined} disabled={id==='add'&&disabled} onClick={()=>id==='add'?onAdd():onNavigate(id)}><span><Icon/></span><small>{t(label)}</small></button>)}
 </nav>;
}
