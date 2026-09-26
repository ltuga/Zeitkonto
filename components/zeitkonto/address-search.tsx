'use client';
import {useRef,useState} from 'react';
import {z} from 'zod';
const resultsSchema=z.object({features:z.array(z.object({geometry:z.object({coordinates:z.tuple([z.number(),z.number()])}),properties:z.record(z.unknown())}))});
import type {Language} from '@/lib/i18n';
type Place={label:string;latitude:number;longitude:number};
export function AddressSearch({lang,onSelect}:{lang:Language;onSelect:(latitude:number,longitude:number)=>void}){
 const tr=(pt:string,de:string,en:string,turk:string)=>({pt,de,en,tr:turk}[lang]);
 const [query,setQuery]=useState(''),[places,setPlaces]=useState<Place[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const last=useRef(0),generation=useRef(0);
 async function search(){
  const q=query.trim();if(q.length<4||busy||Date.now()-last.current<2000)return;
  last.current=Date.now();const request=++generation.current;setBusy(true);setMessage('');setPlaces([]);
  try{
   const url=new URL('https://photon.komoot.io/api/');url.searchParams.set('q',q);url.searchParams.set('limit','5');url.searchParams.set('lang',lang==='de'?'de':'en');
   const response=await fetch(url,{signal:AbortSignal.timeout(15000),credentials:'omit',referrerPolicy:'no-referrer'});
   if(!response.ok)throw Error();
   const json=resultsSchema.parse(await response.json());
   const results:Place[]=[];
   for(const item of (Array.isArray(json.features)?json.features:[]).slice(0,5)){
    const [longitude,latitude]=item.geometry?.coordinates??[],p=item.properties??{};
    if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>85||Math.abs(longitude)>180)continue;
    const label=[p.name,[p.street,p.housenumber].filter(v=>typeof v==='string').join(' '),p.postcode,p.city,p.state,p.country].filter(v=>typeof v==='string'&&v.length).filter((v,i,a)=>a.indexOf(v)===i).join(', ');
    if(label)results.push({label,latitude,longitude});
   }
   if(request!==generation.current)return;setPlaces(results);
   if(!results.length)setMessage(tr('Morada não encontrada. Inclui a cidade e o país.','Adresse nicht gefunden. Stadt und Land ergänzen.','Address not found. Include city and country.','Adres bulunamadı. Şehir ve ülke ekle.'));
  }catch{if(request===generation.current)setMessage(tr('Pesquisa indisponível. Verifica a Internet ou tenta novamente mais tarde.','Suche nicht verfügbar. Internet prüfen oder später erneut versuchen.','Search unavailable. Check your connection or try again later.','Arama kullanılamıyor. Bağlantıyı kontrol et veya daha sonra tekrar dene.'))}
  finally{setBusy(false)}
 }
 return <div><label>{tr('Morada do trabalho','Arbeitsadresse','Work address','İş yeri adresi')}<input type="search" maxLength={200} autoComplete="street-address" value={query} placeholder={tr('Rua, número, código postal, cidade e país','Straße, Hausnummer, PLZ, Stadt und Land','Street, number, postal code, city and country','Sokak, numara, posta kodu, şehir ve ülke')} onChange={e=>{generation.current++;setQuery(e.target.value);setPlaces([]);setMessage('')}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void search()}}}/></label>
 <button type="button" className="secondary" disabled={busy||query.trim().length<4} onClick={()=>void search()}>{busy?tr('A procurar…','Suche läuft…','Searching…','Aranıyor…'):tr('Procurar morada','Adresse suchen','Search address','Adres ara')}</button>
 <p className="muted">{tr('Ao procurar, a morada é enviada ao serviço Photon. Seleciona um resultado e confirma o ponto no mapa antes de guardar.','Die Suche sendet die Adresse an Photon. Ergebnis auswählen und den Punkt vor dem Speichern auf der Karte prüfen.','Searching sends the address to Photon. Select a result and check the map before saving.','Arama adresi Photon hizmetine gönderir. Bir sonuç seç ve kaydetmeden önce haritayı kontrol et.')}</p>
 {places.map((p,i)=><button key={i} type="button" className="secondary" style={{display:'block',width:'100%',marginBottom:8,textAlign:'left'}} onClick={()=>{onSelect(p.latitude,p.longitude);setQuery(p.label);setPlaces([]);setMessage(tr('Local selecionado. Confirma no mapa e guarda as definições.','Ort ausgewählt. Karte prüfen und Einstellungen speichern.','Location selected. Check the map and save settings.','Konum seçildi. Haritayı kontrol et ve ayarları kaydet.'))}}>{p.label}</button>)}
 {message&&<p role="status">{message}</p>}
 <small>Photon · © OpenStreetMap contributors</small></div>;
}
