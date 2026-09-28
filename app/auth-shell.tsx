'use client';
import {SupportContact} from '@/components/zeitkonto/support-contact';
import Link from 'next/link';
import '@/lib/account-i18n';
import {geoCommand,hasGeoNative} from '@/lib/geofence-client';
import {useAppLanguage} from '@/lib/use-app-language';
import {useEffect,useRef,useState} from 'react';
import type {User} from '@supabase/supabase-js';
import {Clock3,LockKeyhole} from 'lucide-react';
import {initializeAuth,authClient,authenticatedFetch} from '@/lib/auth-client';
import {translate} from '@/lib/i18n';
import {readOfflineIdentity} from '@/lib/offline-identity';
import '@/lib/auth-i18n';
import {readLocal,hasPending,deleteLocal,allowTelemetry} from '@/lib/local-sync';
import Home from './time-app';
import {clearDeviceSession,logoutFromDevice} from '@/lib/logout';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
import {unsubscribePush,PUSH_OWNER} from '@/lib/push-client';
import {readOutbox,KEY} from '@/lib/offline-work';
import '@/lib/shift-i18n';
type Mode='login'|'signup'|'forgot'|'reset';
export default function AuthShell({url,publishableKey}:{url:string;publishableKey:string}){
 const {lang,preference,changeLanguage}=useAppLanguage();
 const [mode,setMode]=useState<Mode>('login'),[user,setUser]=useState<User|null>(null),[loading,setLoading]=useState(true),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[retry,setRetry]=useState(0);
 const recovery=useRef(false);
 const t=(s:string)=>translate(lang,s);
 useEffect(()=>{
  recovery.current=new URLSearchParams(location.search).get('auth')==='recovery'||new URLSearchParams(location.hash.slice(1)).get('type')==='recovery';
  if(recovery.current)setMode('reset');
  const c=initializeAuth(url,publishableKey);let live=true;
  const {data:{subscription}}=c.auth.onAuthStateChange((event,session)=>{if(!live)return;if(event==='PASSWORD_RECOVERY'){recovery.current=true;setMode('reset')}if(event==='SIGNED_OUT'){localStorage.removeItem('zeitkonto-offline-user');if(hasGeoNative())void geoCommand('device','suspend').catch(()=>{});setUser(null);setReady(false);setMode('login');recovery.current=false}if(session?.user.email_confirmed_at)setUser(session.user)});
  if(!navigator.onLine){const previous=readOfflineIdentity(localStorage);void Promise.resolve().then(async()=>{const local=previous?await readLocal(previous.id):null;if(live){if(previous&&local)setUser(previous as User);setLoading(false)}}).catch(()=>{if(live)setLoading(false)});return()=>{live=false;subscription.unsubscribe()};}
  c.auth.getUser().then(async({data,error})=>{if(!live)return;if(error&&(!navigator.onLine||error.name==='AuthRetryableFetchError')){const session=(await c.auth.getSession()).data.session;if(session?.user.email_confirmed_at&&await readLocal(session.user.id)){setUser(session.user);setLoading(false);return;}}if(error&&error.name!=='AuthRetryableFetchError')clearDeviceSession(localStorage);if(error&&error.name!=='AuthRetryableFetchError'&&hasGeoNative())void geoCommand('device','suspend').catch(()=>{});setUser(!error&&data.user?.email_confirmed_at?data.user:null);if(!error&&data.user?.email_confirmed_at)localStorage.setItem('zeitkonto-offline-user',JSON.stringify({id:data.user.id,email:data.user.email,email_confirmed_at:data.user.email_confirmed_at}));if(error&&recovery.current){setError('O link expirou ou é inválido. Pede um novo email.');setMode('forgot');recovery.current=false}setLoading(false)}).catch(async()=>{const session=(await c.auth.getSession()).data.session;if(live&&session?.user.email_confirmed_at&&await readLocal(session.user.id)){setUser(session.user);setLoading(false);return;}if(live){setError('Não foi possível ligar. Tenta novamente.');setLoading(false)}});
  return()=>{live=false;subscription.unsubscribe()};
 },[url,publishableKey]);
 useEffect(()=>{document.documentElement.lang=lang},[lang]);
 useEffect(()=>{if(!('serviceWorker' in navigator))return;void navigator.serviceWorker.register('/sw.js').then(()=>navigator.serviceWorker.ready).then(reg=>{const assets=[...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(e=>e.getAttribute('src')||e.getAttribute('href')).filter(Boolean).concat(performance.getEntriesByType('resource').map(e=>e.name).filter(url=>/\.(js|css)(\?|$)/.test(url)));reg.active?.postMessage({type:'CACHE_PUBLIC_SHELL',assets})}).catch(()=>{})},[]);

 useEffect(()=>{let live=true;queueMicrotask(()=>{if(live)setReady(false)});if(!user)return()=>{live=false};if(!navigator.onLine){readLocal(user.id).then(local=>{if(live&&local)setReady(true)});return()=>{live=false}}authenticatedFetch('/api/import-legacy',{method:'POST'}).then(r=>{if(!r.ok)throw Error();if(live)setReady(true)}).catch(async()=>{if(await readLocal(user.id)){if(live)setReady(true)}else if(live)setError('Não foi possível carregar a conta. Tenta novamente.')});return()=>{live=false}},[user?.id,retry]);
 function changeMode(next:Mode){setMode(next);setPassword('');setConfirm('');setError('');setNotice('')}
 function authError(code?:string){if(code==='invalid_credentials')return 'Email ou palavra-passe incorretos.';if(code==='email_not_confirmed')return 'Confirma o teu email antes de entrar.';if(code?.includes('rate_limit')||code==='over_request_rate_limit')return 'Demasiadas tentativas. Aguarda alguns minutos.';if(code==='weak_password')return 'Escolhe uma palavra-passe mais forte.';if(code==='same_password')return 'Escolhe uma palavra-passe diferente da anterior.';return 'Não foi possível concluir. Tenta novamente ou verifica a configuração de email.'}
 async function signOut(){
  if(busy)return;setBusy(true);setError('');allowTelemetry(false);
  try{
   if(user&&hasGeoNative()){try{await geoCommand(user.id,'logout')}catch{await geoCommand(user.id,'suspend')}}
   const queue=readOutbox();
   if(queue?.owner===user?.id&&!queue?.dirty)localStorage.removeItem(KEY);
   if(user&&!await hasPending(user.id))await deleteLocal(user.id);
   await Promise.race([unsubscribePush().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2000))]);
   localStorage.removeItem(PUSH_OWNER);
   await logoutFromDevice(()=>authClient().auth.signOut({scope:'local'}),()=>clearDeviceSession(localStorage),()=>location.replace('/?signed_out=1'));
  }catch{setError('Não foi possível terminar sessão em segurança. Tenta novamente.');setBusy(false)}
 }
 async function submit(event:React.FormEvent){event.preventDefault();setError('');setNotice('');if((mode==='signup'||mode==='reset')&&password!==confirm){setError('As palavras-passe não coincidem.');return}setBusy(true);try{
  const c=authClient();
  if(mode==='login'){const {data,error}=await c.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;if(data.user.email_confirmed_at){setUser(data.user);setPassword('')}}
  if(mode==='signup'){const {error}=await c.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:location.origin+'/'}});if(error)throw error;setPassword('');setConfirm('');setNotice('Consulta o teu email para confirmar a conta antes de entrar.')}
  if(mode==='forgot'){const {error}=await c.auth.resetPasswordForEmail(email.trim(),{redirectTo:location.origin+'/?auth=recovery'});if(error)throw error;setNotice('Se existir uma conta com este email, receberás um link de recuperação.')}
  if(mode==='reset'){const {error}=await c.auth.updateUser({password});if(error)throw error;recovery.current=false;history.replaceState(null,'','/');changeMode('login');setNotice('Palavra-passe atualizada.');}
 }catch(e){setError(authError((e as {code?:string}).code))}finally{setBusy(false)}}
 const title=mode==='signup'?'Criar conta':mode==='forgot'?'Recuperar palavra-passe':mode==='reset'?'Alterar palavra-passe':'Entrar na tua conta';
 if(user&&ready&&mode!=='reset')return <><Home owner={user.id} key={user.id} email={user.email??''} authBusy={busy} onSignOut={signOut} onPasswordChange={()=>changeMode('reset')}/>{error&&<p className="error auth-toast" role="alert">{t(error)}</p>}</>;
 return <main className="auth-page zeit-auth"><header className="top"><Link className="brand" href="/"><span className="logo"><Clock3/></span>Zeitkonto<span className="brand-dot">.</span></Link><Select value={preference} onValueChange={changeLanguage}><SelectTrigger aria-label={t('Idioma')} className="language-trigger"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="auto">{t("Automático (telemóvel)")}</SelectItem><SelectItem value="pt">Português</SelectItem><SelectItem value="de">Deutsch</SelectItem><SelectItem value="en">English</SelectItem><SelectItem value="tr">Türkçe</SelectItem></SelectContent></Select></header>
 <section className="auth-wrap"><div className="auth-intro"><p className="eyebrow">{t('TEMPO PARA O QUE IMPORTA')}</p><h1>{t('O teu tempo, em dia.')}</h1><p className="muted">{t('Trabalho, férias e descanso. Tudo contado.')}</p></div><div className="panel auth-card"><LockKeyhole size={27}/><h2>{t(title)}</h2>
 {loading?<p role="status">{t('A carregar…')}</p>:user&&mode!=='reset'?<><p role="status">{t('A carregar…')}</p>{error&&<><p className="error" role="alert">{t(error)}</p><button className="primary" onClick={()=>{setError('');setRetry(r=>r+1)}}>{t('Tentar novamente')}</button><button className="text-button" onClick={signOut}>{t('Terminar sessão')}</button></>}</>:<form onSubmit={submit}>
 {mode!=='reset'&&<label>Email<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>}
 {mode!=='forgot'&&<label>{t('Palavra-passe')}<input type="password" autoComplete={mode==='login'?'current-password':'new-password'} required minLength={mode==='login'?1:12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>}
 {(mode==='signup'||mode==='reset')&&<><p className="muted">{t('Usa pelo menos 12 caracteres.')}</p><label>{t('Confirmar palavra-passe')}<input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)}/></label></>}
 {error&&<p className="error" role="alert">{t(error)}</p>}{notice&&<p className="rule" role="status">{t(notice)}</p>}
 <button className="primary wide" disabled={busy||mode==='reset'&&!user}>{busy?t('A guardar…'):t(mode==='login'?'Entrar':mode==='forgot'?'Enviar link':mode==='signup'?'Criar conta':'Guardar palavra-passe')}</button>
 <div className="auth-links">{mode==='login'?<><button type="button" className="text-button" disabled={busy} onClick={()=>changeMode('forgot')}>{t('Esqueci-me da palavra-passe')}</button><button type="button" className="secondary" disabled={busy} onClick={()=>changeMode('signup')}>{t('Criar conta')}</button></>:<button type="button" className="text-button" disabled={busy} onClick={()=>{if(recovery.current){void signOut()}else changeMode('login')}}>{t('Voltar')}</button>}</div>
 </form>}</div></section><footer><Link href="/delete-account">{t("Eliminar conta")}</Link> · Zeitkonto · {t('O teu banco de horas')}<SupportContact lang={lang}/></footer></main>
}
