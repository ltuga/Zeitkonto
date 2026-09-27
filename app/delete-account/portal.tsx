'use client';
import Link from 'next/link';
import {useState} from 'react';
import {createClient} from '@supabase/supabase-js';
import {deleteLocal} from '@/lib/local-sync';
import {clearDeviceSession,AUTH_STORAGE_KEY} from '@/lib/logout';
import {hasGeoNative,geoCommand} from '@/lib/geofence-client';
import {useAppLanguage} from '@/lib/use-app-language';
import {accountTexts} from '@/lib/account-i18n';

export default function DeleteAccount({url,publishableKey}:{url:string;publishableKey:string}){
 const {lang}=useAppLanguage(),t=accountTexts[lang];
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');
  try{
   const client=createClient(url,publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
   const {data,error:authError}=await client.auth.signInWithPassword({email:email.trim(),password});
   if(authError||!data.session)throw Error();
   const owner=data.user.id;
   const response=await fetch('/api/account/delete',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({password,confirmation})});
   if(!response.ok)throw Error();
   setDone(true);setPassword('');setEmail('');
   try{
    await deleteLocal(owner);
    const queue=JSON.parse(localStorage.getItem('zeitkonto-work-outbox-v1')??'null');if(queue?.owner===owner)localStorage.removeItem('zeitkonto-work-outbox-v1');
    const session=JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)??'null');
    if(session?.user?.id===owner){
     clearDeviceSession(localStorage);
     if('serviceWorker' in navigator){const reg=await navigator.serviceWorker.getRegistration();await (await reg?.pushManager?.getSubscription())?.unsubscribe();}
     localStorage.removeItem('zeitkonto-push-owner');
    }
    if(hasGeoNative())await geoCommand(owner,'forget');
   }catch{setError(t.local);}
  }catch{setError(t.error);}finally{setBusy(false);setPassword('');}
 }
 return <main className="auth-page"><section className="panel" style={{maxWidth:640,margin:'2rem auto',padding:24}}><h1>{t.title}</h1><p>{t.detail}</p><p className="muted">{t.retention}</p>{done?<p role="status">{t.done}</p>:<form onSubmit={submit}><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>{t.password}<input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label><label>{t.confirm}<input required pattern="DELETE" value={confirmation} onChange={e=>setConfirmation(e.target.value)}/></label><button className="primary" disabled={busy||confirmation!=='DELETE'}>{busy?t.busy:t.button}</button></form>}{error&&<p className="error" role="alert">{error}</p>}<Link href="/">{t.back}</Link></section></main>;
}
