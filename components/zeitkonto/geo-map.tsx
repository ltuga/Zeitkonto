'use client';
import {useRef,useState} from 'react';
import type {Language} from '@/lib/i18n';
const x=(lon:number,z:number)=>(lon+180)/360*2**z;
const y=(lat:number,z:number)=>(1-Math.asinh(Math.tan(Math.max(-85,Math.min(85,lat))*Math.PI/180))/Math.PI)/2*2**z;
function position(tx:number,ty:number,z:number){return {latitude:Math.max(-85,Math.min(85,Math.atan(Math.sinh(Math.PI*(1-2*ty/2**z)))*180/Math.PI)),longitude:((tx/2**z*360+540)%360+360)%360-180};}
export function GeoMap({latitude,longitude,onChange,lang}:{latitude:number;longitude:number;onChange:(lat:number,lon:number)=>void;lang:Language}){
 const tr=(pt:string,de:string,en:string,turk:string)=>({pt,de,en,tr:turk}[lang]);
 const unset=latitude===0&&longitude===0;
 const [zoom,setZoom]=useState(unset?3:15),[center,setCenter]=useState({latitude,longitude});
 const [failed,setFailed]=useState(false),[loaded,setLoaded]=useState(false),[attempt,setAttempt]=useState(0);
 const drag=useRef<{id:number;x:number;y:number;cx:number;cy:number;moved:boolean}|null>(null);
 const cx=x(center.longitude,zoom),cy=y(center.latitude,zoom),size=2**zoom;
 function pick(px:number,py:number){const p=position(cx+px/256,cy+py/256,zoom);onChange(p.latitude,p.longitude);}
 return <div style={{maxWidth:768,marginInline:'auto'}}><div style={{display:'flex',gap:8,marginBottom:8,flexWrap:'wrap'}}>
 <button type="button" className="secondary" aria-label={tr('Aproximar','Vergrößern','Zoom in','Yakınlaştır')} disabled={zoom===18} onClick={()=>setZoom(Math.min(18,zoom+1))}>+</button>
 <button type="button" className="secondary" aria-label={tr('Afastar','Verkleinern','Zoom out','Uzaklaştır')} disabled={zoom===2} onClick={()=>setZoom(Math.max(2,zoom-1))}>−</button>
 <button type="button" className="secondary" onClick={()=>{setCenter({latitude,longitude});setZoom(unset?3:15)}}>{tr('Centrar seleção','Auswahl zentrieren','Center selection','Seçimi ortala')}</button></div>
 <div role="application" aria-label={tr('Mapa: arrasta para mover, toca para selecionar','Karte: ziehen, dann Ort antippen','Map: drag to move, tap to select','Harita: sürükle, seçmek için dokun')} tabIndex={0} onKeyDown={e=>{
 const directions:Record<string,[number,number]>={ArrowLeft:[-64,0],ArrowRight:[64,0],ArrowUp:[0,-64],ArrowDown:[0,64]};
 const d=directions[e.key];if(d){e.preventDefault();setCenter(position(cx+d[0]/256,cy+d[1]/256,zoom));}
 if(e.key==='Enter'){e.preventDefault();pick(0,0)}
 }} onPointerDown={e=>{if(!e.isPrimary||e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,cx,cy,moved:false}}}
 onPointerMove={e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>6)d.moved=true;if(d.moved)setCenter(position(d.cx-dx/256,d.cy-dy/256,zoom))}}
 onPointerUp={e=>{const d=drag.current;drag.current=null;if(!d||d.id!==e.pointerId)return;if(!d.moved){const r=e.currentTarget.getBoundingClientRect();pick(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)}}}
 onPointerCancel={()=>{drag.current=null}} onLostPointerCapture={()=>{drag.current=null}}
 style={{height:300,position:'relative',overflow:'hidden',borderRadius:16,background:'#e3edf3',cursor:'grab',touchAction:'none',userSelect:'none'}}>
 {Array.from({length:20},(_,i)=>{const tx=Math.floor(cx)+i%5-2,ty=Math.floor(cy)+Math.floor(i/5)-1;
 return ty<0||ty>=size?null:<img key={zoom+'/'+tx+'/'+ty+'/'+attempt} alt="" draggable={false} referrerPolicy="strict-origin-when-cross-origin" src={'https://tile.openstreetmap.org/'+zoom+'/'+((tx%size+size)%size)+'/'+ty+'.png'} width={256} height={256}
 onLoad={()=>setLoaded(true)} onError={()=>setFailed(true)}
 style={{position:'absolute',width:256,height:256,minWidth:256,maxWidth:'none',left:'calc(50% + '+((tx-cx)*256)+'px)',top:'calc(50% + '+((ty-cy)*256)+'px)',pointerEvents:'none'}}/>;})}
 {!unset&&<span aria-hidden style={{position:'absolute',left:'calc(50% + '+((x(longitude,zoom)-cx)*256)+'px)',top:'calc(50% + '+((y(latitude,zoom)-cy)*256)+'px)',transform:'translate(-50%,-50%)',color:'#0069c4',fontSize:36,textShadow:'0 0 4px white',pointerEvents:'none'}}>●</span>}
 </div>
 <small><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a></small>
 {!loaded&&!failed&&<p role="status">{tr('A carregar mapa…','Karte wird geladen…','Loading map…','Harita yükleniyor…')}</p>}
 {failed&&<div role="status"><p>{tr('Não foi possível carregar parte do mapa. Verifica a Internet e tenta novamente. Podes usar a localização atual sem o mapa.','Kartenteile konnten nicht geladen werden. Internet prüfen und erneut versuchen. Der aktuelle Standort funktioniert auch ohne Karte.','Some map tiles could not load. Check your connection and retry. Current location also works without the map.','Haritanın bir kısmı yüklenemedi. Bağlantını kontrol edip tekrar dene. Mevcut konum harita olmadan da çalışır.')}</p><button type="button" className="secondary" onClick={()=>{setFailed(false);setLoaded(false);setAttempt(v=>v+1)}}>{tr('Tentar novamente','Erneut versuchen','Retry','Tekrar dene')}</button></div>}
 </div>;
}
