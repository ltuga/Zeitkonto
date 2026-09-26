'use client';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {AUTH_STORAGE_KEY,clearDeviceSession} from './logout';
let client:SupabaseClient|null=null;
export function initializeAuth(url:string,key:string){if(!client&&new URLSearchParams(location.search).has('signed_out')){clearDeviceSession(localStorage);history.replaceState(null,'','/')}if(!client)client=createClient(url,key,{auth:{storageKey:AUTH_STORAGE_KEY,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'}});return client;}
export function authClient(){if(!client)throw Error('Auth not initialized');return client;}
export async function authenticatedFetch(input:string,init:RequestInit={}){
 // Send credentials only to this app's API; the server validates the token with Supabase.
 if(!input.startsWith('/api/')||input.startsWith('//'))throw Error('Invalid API destination');
 const {data,error}=await authClient().auth.getSession();if(error||!data.session)throw Error('Inicia sessão para aceder aos registos.');
 const headers=new Headers(init.headers);headers.set('Authorization','Bearer '+data.session.access_token);
 return fetch(input,{...init,headers,cache:'no-store'});
}
