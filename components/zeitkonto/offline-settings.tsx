"use client";
import type {State} from '@/lib/time';
import {translate,type Language} from '@/lib/i18n';
export function OfflineSettings({lang}:{owner:string;data:State;lang:Language;busy:boolean}){const t=(s:string)=>translate(lang,s);return <section className="install-card"><h3>{t('Registar sem internet')}</h3><p>{t('Os registos e as definições ficam neste dispositivo e sincronizam automaticamente quando a app estiver aberta e houver Internet.')}</p><p className="muted">{t('Usa um dispositivo pessoal protegido. A primeira entrada na conta precisa de Internet.')}</p></section>}
