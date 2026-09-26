'use client';
import {useEffect,useState} from 'react';
import {authenticatedFetch} from './auth-client';
import type {Holiday} from './leave';
export function useHolidays(country:string,years:number[]){const key=country+':'+years.join(','),[state,setState]=useState<{key:string;rows:Holiday[];error:boolean}>({key:'',rows:[],error:false}),[retry,setRetry]=useState(0);
 useEffect(()=>{let live=true;const controller=new AbortController();Promise.all(years.map(async year=>{const cacheKey='zeitkonto-holidays:'+country+':'+year;try{const r=await authenticatedFetch(`/api/holidays?country=${country}&year=${year}`,{signal:controller.signal});if(!r.ok)throw Error('holidays');const j=await r.json() as {holidays:Holiday[]};try{localStorage.setItem(cacheKey,JSON.stringify(j.holidays))}catch{}return j.holidays}catch(e){const saved=localStorage.getItem(cacheKey);if(saved)return JSON.parse(saved) as Holiday[];throw e}})).then(rows=>{if(live)setState({key,rows:rows.flat(),error:false})}).catch(()=>{if(live)setState({key,rows:[],error:true})});return()=>{live=false;controller.abort()}},[key,retry]);
 return {rows:state.key===key?state.rows:[],loading:state.key!==key,error:state.key===key&&state.error,retry:()=>{setState({key:'',rows:[],error:false});setRetry(n=>n+1)}};
}
