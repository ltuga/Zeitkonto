'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import type {Language} from '@/lib/i18n';
import type {State} from '@/lib/time';
import {applyGeoEvent,defaultGeo,geoConfigSchema,type GeoConfig,type GeoEvent} from '@/lib/geofence';
import {geoCommand,geoSync,hasGeoNative} from '@/lib/geofence-client';
import {ClockInput} from './clock-input';
import {GeoMap} from './geo-map';
import {AddressSearch} from './address-search';
const subscribeNative=()=>()=>{};
export function AutomaticAttendance({owner,data,lang,busy,save,onActive}:{owner:string;data:State;lang:Language;busy:boolean;save:(s:State)=>Promise<boolean>;onActive:(v:boolean)=>void}){
 const tr=(pt:string,de:string,en:string,turk:string)=>({pt,de,en,tr:turk}[lang]);
 const native=useSyncExternalStore(subscribeNative,hasGeoNative,()=>false);
 const [cfg,setCfg]=useState<GeoConfig>(defaultGeo),[map,setMap]=useState(false),[mapRevision,setMapRevision]=useState(0);
 const [message,setMessage]=useState(''),[problem,setProblem]=useState<GeoEvent|null>(null),[enabled,setEnabled]=useState(false),[pending,setPending]=useState(false);
 const latest=useRef({data,busy,save,lang,onActive});useEffect(()=>{latest.current={data,busy,save,lang,onActive}},[data,busy,save,lang,onActive]);
 const processing=useRef(false),loaded=useRef(false);
 useEffect(()=>{
  if(!hasGeoNative())return;
  let alive=true;
  async function refresh(){
   if(processing.current||latest.current.busy||document.visibilityState==='hidden')return;
   processing.current=true;
   try{
    const status=await geoCommand(owner,'status');if(!alive)return;
    if(!loaded.current){if(status.config)setCfg(geoConfigSchema.parse(status.config));loaded.current=true;}
    setEnabled(status.active);latest.current.onActive(status.active);
    let next=latest.current.data;const ids:string[]=[];let failure:GeoEvent|null=null;
    for(const event of status.events){
     try{next=applyGeoEvent(next,event);ids.push(event.id);}
     catch{failure=event;break;}
    }
    if(ids.length){
     if(JSON.stringify(next)!==JSON.stringify(latest.current.data)&&!await latest.current.save(next))return;
     await geoCommand(owner,'ack',{ids});
    }
    if(alive)setProblem(failure);
    if(!failure)await geoSync(owner,next,latest.current.lang);
   }catch(e){if(alive){setMessage((e as Error).message);setEnabled(false);latest.current.onActive(false)}}
   finally{processing.current=false;}
  }
  void refresh();const timer=setInterval(refresh,10000);
  const visible=()=>{void refresh()};document.addEventListener('visibilitychange',visible);
  return()=>{alive=false;clearInterval(timer);document.removeEventListener('visibilitychange',visible)};
 },[owner]);
 const change=(patch:Partial<GeoConfig>)=>setCfg(v=>({...v,...patch}));
 async function locate(){
  try{const p=await geoCommand<{latitude:number;longitude:number}>(owner,'locate');change(p);setMapRevision(v=>v+1);setMap(true)}
  catch{throw new Error(tr('Não foi possível obter a localização. Ativa a localização do telemóvel, permite a localização precisa e toca novamente em Usar localização atual. Também podes escolher o local arrastando o mapa.','Standort nicht verfügbar. Standort am Telefon aktivieren, genauen Standort erlauben und erneut auf Aktuellen Standort verwenden tippen. Du kannst den Ort auch auf der Karte auswählen.','Location unavailable. Enable phone location, allow precise location, then tap Use current location again. You can also drag the map to select your workplace.','Konum alınamadı. Telefon konumunu aç, kesin konuma izin ver ve Mevcut konumu kullan düğmesine tekrar dokun. Haritayı sürükleyerek de seçebilirsin.'))}
 }
 async function run(action:()=>Promise<unknown>){setPending(true);setMessage('');try{await action()}catch(e){setMessage((e as Error).message)}finally{setPending(false)}}
 return <section className="settings-work">
 <h2>{tr('Entrada e saída automáticas','Automatisches Kommen und Gehen','Automatic clock in and out','Otomatik giriş ve çıkış')}</h2>
 <p className="muted">{tr('Sem necessidade de turnos planeados. A zona é guardada de forma cifrada apenas neste Android.','Keine geplanten Schichten nötig. Der Bereich wird verschlüsselt nur auf diesem Android gespeichert.','No planned shifts required. The zone is encrypted and stored only on this Android.','Planlı vardiya gerekmez. Bölge yalnızca bu Android cihazda şifreli saklanır.')}</p>
 {!native?<p className="rule">{tr('Precisas da nova versão Android para ativar esta função. O navegador e versões Android anteriores não fazem deteção em segundo plano.','Zum Aktivieren ist die neue Android-Version erforderlich. Im Browser ist keine Hintergrunderkennung möglich.','Install the new Android version to enable this feature. Browsers and older Android app versions cannot detect in the background.','Bu özellik için yeni Android sürümü gerekir. Tarayıcı arka planda algılama yapamaz.')}</p>:<>
 <p role="status">{enabled?tr('Deteção automática ativa','Automatische Erkennung aktiv','Automatic detection active','Otomatik algılama etkin'):tr('Deteção desativada ou permissões em falta','Erkennung aus oder Berechtigungen fehlen','Detection off or permissions missing','Algılama kapalı veya izinler eksik')}</p>
 <form onSubmit={e=>{e.preventDefault();void run(async()=>{
 const config=geoConfigSchema.parse(cfg);
 await geoSync(owner,latest.current.data,lang);
 await geoCommand(owner,'configure',{config});
 setMessage(tr('Guardado. Verifica as permissões Android.','Gespeichert. Android-Berechtigungen prüfen.','Saved. Check Android permissions.','Kaydedildi. Android izinlerini kontrol et.'));
 })}}>
 <label>{tr('Modo','Modus','Mode','Mod')}<select value={cfg.mode} onChange={e=>change({mode:e.target.value as GeoConfig['mode']})}>
 <option value="off">{tr('Desativado','Aus','Off','Kapalı')}</option><option value="semi">{tr('Semiautomático','Halbautomatisch','Semiautomatic','Yarı otomatik')}</option>
 <option value="auto">{tr('Automático','Automatisch','Automatic','Otomatik')}</option></select></label>
 <p className="muted">{tr('Semiautomático pede confirmação na notificação. Automático guarda após confirmar a permanência.','Halbautomatisch fragt per Benachrichtigung. Automatisch speichert nach bestätigtem Aufenthalt.','Semiautomatic asks in a notification. Automatic saves after the dwell check.','Yarı otomatik bildirimle onay ister. Otomatik, bekleme kontrolünden sonra kaydeder.')}</p>
 <AddressSearch lang={lang} onSelect={(latitude,longitude)=>{change({latitude,longitude});setMapRevision(v=>v+1);setMap(true)}}/>
 <button type="button" className="secondary" disabled={pending} onClick={()=>void run(locate)}>{tr('Usar localização atual','Aktuellen Standort verwenden','Use current location','Mevcut konumu kullan')}</button>
 <details><summary>{tr('Coordenadas (opcional)','Koordinaten (optional)','Coordinates (optional)','Koordinatlar (isteğe bağlı)')}</summary><div className="field-row"><label>Latitude<input type="number" step="any" required min="-85" max="85" value={cfg.latitude} onChange={e=>change({latitude:Number(e.target.value)})}/></label>
 <label>Longitude<input type="number" step="any" required min="-180" max="180" value={cfg.longitude} onChange={e=>change({longitude:Number(e.target.value)})}/></label></div></details>
 <button type="button" className="secondary" disabled={pending} onClick={()=>{setMap(!map);if(!map&&cfg.latitude===0&&cfg.longitude===0)void run(locate)}}>{tr('Selecionar no mapa','Auf Karte auswählen','Select on map','Haritadan seç')}</button>
 {map&&<><p className="muted">{tr('Arrasta o mapa e usa + para aproximar. Toca no local de trabalho para o selecionar. O mapa precisa de Internet.','Karte ziehen und mit + vergrößern. Arbeitsort antippen. Die Karte benötigt Internet.','Drag the map and use + to zoom in. Tap your workplace to select it. The map needs Internet.','Haritayı sürükle, + ile yakınlaştır. İş yerini seçmek için dokun. Harita internet gerektirir.')}</p><GeoMap key={mapRevision} lang={lang} latitude={cfg.latitude} longitude={cfg.longitude} onChange={(latitude,longitude)=>change({latitude,longitude})}/></>}
 <label>{tr('Raio de deteção','Erkennungsradius','Detection radius','Algılama yarıçapı')}<select value={cfg.radius} onChange={e=>change({radius:Number(e.target.value) as GeoConfig['radius']})}>{[100,150,200,300,500].map(n=><option key={n} value={n}>{n} m</option>)}</select></label>
 <fieldset><legend>{tr('Dias habituais (não limitam a deteção)','Übliche Tage (keine Begrenzung)','Usual days (do not restrict detection)','Normal günler (algılamayı kısıtlamaz)')}</legend><div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
 {[1,2,3,4,5,6,0].map(day=><label key={day} style={{display:'flex',alignItems:'center',gap:4}}><input style={{width:20}} type="checkbox" checked={cfg.days.includes(day)} onChange={e=>change({days:e.target.checked?[...cfg.days,day]:cfg.days.filter(d=>d!==day)})}/>{new Date(2026,8,20+day).toLocaleDateString(lang,{weekday:'short'})}</label>)}</div></fieldset>
 <label><input style={{width:20}} type="checkbox" checked={!!cfg.usualStart} onChange={e=>change({usualStart:e.target.checked?'22:00':'',usualEnd:e.target.checked?'06:00':''})}/> {tr('Horário habitual opcional','Optionale übliche Zeiten','Optional usual hours','İsteğe bağlı normal saatler')}</label>
 {cfg.usualStart&&<div className="field-row"><label>{tr('Entrada','Beginn','Start','Başlangıç')}<ClockInput lang={lang} value={cfg.usualStart} onChange={usualStart=>change({usualStart})}/></label><label>{tr('Saída','Ende','End','Bitiş')}<ClockInput lang={lang} value={cfg.usualEnd} onChange={usualEnd=>change({usualEnd})}/></label></div>}
 <label>{tr('Confirmar chegada após (minutos)','Ankunft bestätigen nach (Minuten)','Confirm arrival after (minutes)','Varışı onaylama süresi (dakika)')}<input type="number" min="2" max="30" step="1" required value={cfg.arrivalMinutes} onChange={e=>change({arrivalMinutes:Number(e.target.value)})}/></label>
 <label>{tr('Confirmar saída após minutos fora da zona','Gehen bestätigen nach Minuten außerhalb','Confirm exit after minutes outside','Bölge dışında çıkış onayı (dakika)')}<select value={cfg.exitMinutes} onChange={e=>change({exitMinutes:Number(e.target.value) as GeoConfig['exitMinutes']})}>{[10,15,20,30].map(n=><option key={n} value={n}>{n} min</option>)}</select></label>
 <p className="muted">{tr('Mantém Pausa/Retomar para descontar pausas. Pequenas saídas não terminam o turno. Abre a app para sincronizar os registos guardados no Android.','Pausen weiterhin mit Pause/Fortsetzen buchen. Kurzes Verlassen beendet keine Schicht. App zum Synchronisieren öffnen.','Use Pause/Resume to deduct breaks. Brief departures do not end a shift. Open the app to sync Android records.','Molalar için Duraklat/Devam et kullan. Kısa çıkışlar vardiyayı bitirmez. Eşitlemek için uygulamayı aç.')}</p>
 <p className="muted">{tr('Fora dos dias ou horas habituais, a confirmação pode demorar mais 2 minutos. O Android também pode atrasar os avisos.','Außerhalb üblicher Zeiten kann die Bestätigung 2 Minuten länger dauern. Android kann Hinweise verzögern.','Outside usual days or hours, confirmation may take 2 extra minutes. Android may also delay alerts.','Normal gün veya saatler dışında onay 2 dakika uzayabilir. Android bildirimleri geciktirebilir.')}</p>
 <button type="button" className="secondary" disabled={pending} onClick={()=>void run(()=>geoCommand(owner,'permissions'))}>{tr('Configurar permissões Android','Android-Berechtigungen','Android permissions','Android izinleri')}</button>
 <button className="primary" disabled={pending||busy}>{tr('Guardar definições','Einstellungen speichern','Save settings','Ayarları kaydet')}</button>
 </form></>}
 {problem&&<div role="alert" className="rule"><p>{tr('Existe uma deteção que entra em conflito com os teus registos. Revê o histórico antes de a ignorar.','Eine Erkennung widerspricht deinen Einträgen. Bitte zuerst den Verlauf prüfen.','A detection conflicts with your records. Review history before ignoring it.','Algılama mevcut kayıtlarla çakışıyor. Yoksaymadan önce geçmişi incele.')}</p><p>{new Date(problem.at).toLocaleString(lang)} · {problem.type}</p><button type="button" className="secondary" onClick={()=>void run(async()=>{await geoCommand(owner,'ack',{ids:[problem.id]});setProblem(null)})}>{tr('Ignorar esta deteção','Diese Erkennung ignorieren','Ignore this detection','Bu algılamayı yoksay')}</button></div>}
 {message&&<p role="status">{message}</p>}
 </section>;
}
