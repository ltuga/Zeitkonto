'use client';
import Link from 'next/link';
import {useState} from 'react';
import type {State} from '@/lib/time';
import type {Language} from '@/lib/i18n';
import {authenticatedFetch} from '@/lib/auth-client';
const labels={
 pt:{title:'Privacidade',policy:'Política de privacidade',analytics:'Partilhar estatísticas de utilização (opcional)',detail:'Versão, plataforma, último acesso e nomes de funcionalidades. Sem horários, notas ou conteúdo de doença. Desativado por defeito; a escolha sincroniza com a conta.',clear:'Apagar estatísticas anteriores',done:'Estatísticas apagadas.',error:'Não foi possível concluir. Verifica a ligação.'},
 de:{title:'Datenschutz',policy:'Datenschutzerklärung',analytics:'Nutzungsstatistiken teilen (optional)',detail:'Version, Plattform, letzter Zugriff und Funktionsnamen. Keine Arbeitszeiten, Notizen oder Krankheitsinhalte. Standardmäßig aus; die Auswahl wird mit dem Konto synchronisiert.',clear:'Bisherige Statistiken löschen',done:'Statistiken gelöscht.',error:'Nicht abgeschlossen. Verbindung prüfen.'},
 en:{title:'Privacy',policy:'Privacy policy',analytics:'Share usage statistics (optional)',detail:'Version, platform, last access and feature names. No work times, notes or sickness content. Off by default; the choice syncs with your account.',clear:'Delete previous statistics',done:'Statistics deleted.',error:'Could not complete. Check your connection.'},
 tr:{title:'Gizlilik',policy:'Gizlilik politikası',analytics:'Kullanım istatistiklerini paylaş (isteğe bağlı)',detail:'Sürüm, platform, son erişim ve özellik adları. Çalışma saatleri, notlar veya hastalık içeriği yoktur. Varsayılan olarak kapalıdır; seçim hesapla eşitlenir.',clear:'Önceki istatistikleri sil',done:'İstatistikler silindi.',error:'Tamamlanamadı. Bağlantıyı kontrol et.'},
};
export function PrivacyPreferences({data,lang,busy,save}:{data:State;lang:Language;busy:boolean;save:(s:State)=>Promise<boolean>}){
 const t=labels[lang],[notice,setNotice]=useState(''),[clearing,setClearing]=useState(false);
 return <section className="install-card"><h3>{t.title}</h3><p><Link href="/privacy">{t.policy}</Link></p><label><input type="checkbox" checked={data.analytics.enabled&&data.analytics.version==='2026-09-28'} disabled={busy} onChange={async e=>{await save({...data,analytics:{enabled:e.target.checked,version:'2026-09-28'}})}}/>{t.analytics}</label><p className="muted">{t.detail}</p><button type="button" className="secondary" disabled={clearing||busy} onClick={async()=>{setClearing(true);setNotice('');try{const response=await authenticatedFetch('/api/analytics',{method:'DELETE'});if(!response.ok)throw Error();setNotice(t.done);}catch{setNotice(t.error)}finally{setClearing(false)}}}>{t.clear}</button>{notice&&<p role="status">{notice}</p>}</section>;
}
