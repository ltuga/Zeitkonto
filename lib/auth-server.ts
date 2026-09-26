import {env} from 'cloudflare:workers';
import {verifyIdentity,type AuthConfig} from './auth-identity';
export function authConfig():AuthConfig {const values=env as unknown as Record<string,string|undefined>,url=values.SUPABASE_URL,key=values.SUPABASE_PUBLISHABLE_KEY;if(!url||!key||!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url))throw Error('Auth is not configured');return {url,key};}
export async function requireIdentity(request:Request){try{return await verifyIdentity(request,authConfig())}catch{throw Error('AUTH_UNAVAILABLE')}}
